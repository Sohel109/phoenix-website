import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PlanningUser, Booking, BookingStatus } from '../data/planningData';
import {
    authenticateUser, loadBookings, saveBookings,
    loadUnavailableWeeks, saveUnavailableWeeks,
    loadEventAttendance, saveEventAttendance,
    getWeekKey,
} from '../data/planningData';
import type { EventAttendance } from '../data/planningData';

// ─── Context type ─────────────────────────────────────────────────────────────

interface PlanningContextType {
    currentUser: PlanningUser | null;
    login: (loginId: string, password: string) => Promise<boolean>;
    logout: () => void;
    bookings: Booking[];
    getWeekBookings: (weekKey: string, userId?: string) => Booking[];
    toggleAvailability: (slotId: string, weekKey: string) => void;
    validatePresence: (bookingId: string) => void;
    markAbsent: (bookingId: string) => void;
    resetValidation: (bookingId: string) => void;
    currentWeekKey: string;
    setCurrentWeekKey: (wk: string) => void;
    unavailableWeeks: string[];
    toggleWeekUnavailable: (userId: string, weekKey: string) => void;
    isWeekUnavailable: (userId: string, weekKey: string) => boolean;
    eventAttendance: EventAttendance[];
    toggleEventAttendance: (userId: string, eventId: string) => void;
}

const PlanningContext = createContext<PlanningContextType | null>(null);

const SESSION_KEY = 'phoenix_planning_session';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PlanningProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<PlanningUser | null>(() => {
        try {
            const data = sessionStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch { return null; }
    });

    const [bookings, setBookings] = useState<Booking[]>(() => loadBookings());
    const [unavailableWeeks, setUnavailableWeeks] = useState<string[]>(() => loadUnavailableWeeks());
    const [eventAttendance, setEventAttendance] = useState<EventAttendance[]>(() => loadEventAttendance());
    const [currentWeekKey, setCurrentWeekKey] = useState(() => getWeekKey(new Date()));

    const persist = useCallback((next: Booking[]) => {
        setBookings(next);
        saveBookings(next);
    }, []);

    const login = useCallback(async (loginId: string, password: string): Promise<boolean> => {
        const user = await authenticateUser(loginId, password);
        if (user) {
            setCurrentUser(user);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        sessionStorage.removeItem(SESSION_KEY);
    }, []);

    const getWeekBookings = useCallback((weekKey: string, userId?: string): Booking[] =>
        bookings.filter(b => b.weekKey === weekKey && (userId ? b.userId === userId : true)),
        [bookings]);

    const toggleAvailability = useCallback((slotId: string, weekKey: string) => {
        if (!currentUser) return;
        const existing = bookings.find(
            b => b.slotId === slotId && b.weekKey === weekKey && b.userId === currentUser.id
        );
        if (existing) {
            persist(bookings.filter(b => b.id !== existing.id));
        } else {
            const newBooking: Booking = {
                id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                slotId,
                userId: currentUser.id,
                userName: currentUser.name,
                weekKey,
                status: 'prevu',
            };
            persist([...bookings, newBooking]);
        }
    }, [bookings, currentUser, persist]);

    const validatePresence = useCallback((bookingId: string) => {
        if (!currentUser || (currentUser.role !== 'chef_projet' && currentUser.role !== 'bureau')) return;
        persist(bookings.map(b => b.id === bookingId
            ? { ...b, status: 'confirme' as BookingStatus, validatedBy: currentUser.id, validatedAt: new Date().toISOString() }
            : b));
    }, [bookings, currentUser, persist]);

    const markAbsent = useCallback((bookingId: string) => {
        if (!currentUser || (currentUser.role !== 'chef_projet' && currentUser.role !== 'bureau')) return;
        persist(bookings.map(b => b.id === bookingId
            ? { ...b, status: 'absent' as BookingStatus, validatedBy: currentUser.id, validatedAt: new Date().toISOString() }
            : b));
    }, [bookings, currentUser, persist]);

    const resetValidation = useCallback((bookingId: string) => {
        if (!currentUser || (currentUser.role !== 'chef_projet' && currentUser.role !== 'bureau')) return;
        persist(bookings.map(b => b.id === bookingId
            ? { ...b, status: 'prevu' as BookingStatus, validatedBy: undefined, validatedAt: undefined }
            : b));
    }, [bookings, currentUser, persist]);

    const isWeekUnavailable = useCallback((userId: string, weekKey: string) =>
        unavailableWeeks.includes(`${userId}-${weekKey}`), [unavailableWeeks]);

    const toggleWeekUnavailable = useCallback((userId: string, weekKey: string) => {
        const key = `${userId}-${weekKey}`;
        const isCurrentlyUnavailable = unavailableWeeks.includes(key);
        const next = isCurrentlyUnavailable
            ? unavailableWeeks.filter(k => k !== key)
            : [...unavailableWeeks, key];
        setUnavailableWeeks(next);
        saveUnavailableWeeks(next);
        // Si on marque comme indispo, supprimer tous les bookings de la semaine
        if (!isCurrentlyUnavailable) {
            persist(bookings.filter(b => !(b.userId === userId && b.weekKey === weekKey)));
        }
    }, [unavailableWeeks, bookings, persist]);

    const toggleEventAttendance = useCallback((userId: string, eventId: string) => {
        if (!currentUser || currentUser.role !== 'bureau') return;
        
        const existing = eventAttendance.find(a => a.userId === userId && a.eventId === eventId);
        let next: EventAttendance[];
        
        if (existing) {
            next = eventAttendance.map(a => 
                (a.userId === userId && a.eventId === eventId) ? { ...a, present: !a.present } : a
            );
        } else {
            next = [...eventAttendance, { userId, eventId, present: true }];
        }
        
        setEventAttendance(next);
        saveEventAttendance(next);
    }, [eventAttendance, currentUser]);

    return (
        <PlanningContext.Provider value={{
            currentUser, login, logout,
            bookings, getWeekBookings,
            toggleAvailability, validatePresence, markAbsent, resetValidation,
            currentWeekKey, setCurrentWeekKey,
            unavailableWeeks, toggleWeekUnavailable, isWeekUnavailable,
            eventAttendance, toggleEventAttendance
        }}>
            {children}
        </PlanningContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlanning() {
    const ctx = useContext(PlanningContext);
    if (!ctx) throw new Error('usePlanning must be used within PlanningProvider');
    return ctx;
}
