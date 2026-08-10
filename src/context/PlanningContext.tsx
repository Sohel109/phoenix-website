import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PlanningUser, Booking, BookingStatus } from '../data/planningData';
import {
    authenticateUser,
    getWeekKey,
    fetchPlanningData,
    syncBookingApi,
    deleteBookingApi,
    toggleWeekUnavailableApi,
    syncEventAttendanceApi,
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
    validatePresence: (bookingId: string) => Promise<boolean>;
    markAbsent: (bookingId: string) => Promise<boolean>;
    resetValidation: (bookingId: string) => Promise<boolean>;
    currentWeekKey: string;
    setCurrentWeekKey: (wk: string) => void;
    unavailableWeeks: string[];
    toggleWeekUnavailable: (userId: string, weekKey: string) => void;
    isWeekUnavailable: (userId: string, weekKey: string) => boolean;
    eventAttendance: EventAttendance[];
    toggleEventAttendance: (userId: string, eventId: string) => void;
    isPending: (key: string) => boolean;
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

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [unavailableWeeks, setUnavailableWeeks] = useState<string[]>([]);
    const [eventAttendance, setEventAttendance] = useState<EventAttendance[]>([]);
    const [currentWeekKey, setCurrentWeekKey] = useState(() => getWeekKey(new Date()));
    const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

    const isPending = useCallback((key: string) => pendingKeys.has(key), [pendingKeys]);

    const addPendingKey = (key: string) => setPendingKeys(prev => new Set(prev).add(key));
    const removePendingKey = (key: string) => {
        setTimeout(() => {
            setPendingKeys(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }, 1200); // 1.2s cooldown minimum pour éviter le spam
    };

    // Charger les données de planning depuis le Google Sheet et synchroniser périodiquement (polling)
    useEffect(() => {
        if (!currentUser) {
            setBookings([]);
            setUnavailableWeeks([]);
            setEventAttendance([]);
            return;
        }

        async function loadPlanningData() {
            const data = await fetchPlanningData();
            if (data) {
                setBookings(data.bookings);
                setUnavailableWeeks(data.unavailableWeeks);
                setEventAttendance(data.eventAttendance);
            }
        }

        loadPlanningData();

        // Polling automatique toutes les 10 secondes pour synchroniser les données entre utilisateurs sur Vercel
        const intervalId = setInterval(loadPlanningData, 10000);
        return () => clearInterval(intervalId);
    }, [currentUser]);

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

    const toggleAvailability = useCallback(async (slotId: string, weekKey: string) => {
        if (!currentUser) return;
        const key = `${slotId}_${weekKey}`;
        if (pendingKeys.has(key)) return; // Anti-spam lock

        addPendingKey(key);

        const existing = bookings.find(
            b => b.slotId === slotId && b.weekKey === weekKey && b.userId === currentUser.id
        );
        if (existing) {
            setBookings(prev => prev.filter(b => b.id !== existing.id));
            const success = await deleteBookingApi(existing);
            if (!success) {
                // Revert in case of failure
                setBookings(prev => [...prev, existing]);
            }
            removePendingKey(key);
        } else {
            const newBooking: Booking = {
                id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                slotId,
                userId: currentUser.id,
                userName: currentUser.name,
                weekKey,
                status: 'prevu',
            };
            setBookings(prev => [...prev, newBooking]);
            const success = await syncBookingApi(newBooking);
            if (!success) {
                // Revert in case of failure
                setBookings(prev => prev.filter(b => b.id !== newBooking.id));
            }
            removePendingKey(key);
        }
    }, [bookings, currentUser, pendingKeys]);

    const validatePresence = useCallback(async (bookingId: string): Promise<boolean> => {
        if (!currentUser || (currentUser.role !== 'chef_projet' && currentUser.role !== 'bureau')) return false;
        if (pendingKeys.has(bookingId)) return false;

        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return false;

        addPendingKey(bookingId);
        
        const updatedBooking = { 
            ...booking, 
            status: 'confirme' as BookingStatus, 
            validatedBy: currentUser.id, 
            validatedAt: new Date().toISOString() 
        };
        
        setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
        const success = await syncBookingApi(updatedBooking);
        if (!success) {
            setBookings(prev => prev.map(b => b.id === bookingId ? booking : b));
        }
        removePendingKey(bookingId);
        return success;
    }, [bookings, currentUser, pendingKeys]);

    const markAbsent = useCallback(async (bookingId: string): Promise<boolean> => {
        if (!currentUser || (currentUser.role !== 'chef_projet' && currentUser.role !== 'bureau')) return false;
        if (pendingKeys.has(bookingId)) return false;

        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return false;

        addPendingKey(bookingId);
        
        const updatedBooking = { 
            ...booking, 
            status: 'absent' as BookingStatus, 
            validatedBy: currentUser.id, 
            validatedAt: new Date().toISOString() 
        };
        
        setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
        const success = await syncBookingApi(updatedBooking);
        if (!success) {
            setBookings(prev => prev.map(b => b.id === bookingId ? booking : b));
        }
        removePendingKey(bookingId);
        return success;
    }, [bookings, currentUser, pendingKeys]);

    const resetValidation = useCallback(async (bookingId: string): Promise<boolean> => {
        if (!currentUser || (currentUser.role !== 'chef_projet' && currentUser.role !== 'bureau')) return false;
        if (pendingKeys.has(bookingId)) return false;

        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return false;

        addPendingKey(bookingId);
        
        const updatedBooking = { 
            ...booking, 
            status: 'prevu' as BookingStatus, 
            validatedBy: undefined, 
            validatedAt: undefined 
        };
        
        setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
        const success = await syncBookingApi(updatedBooking);
        if (!success) {
            setBookings(prev => prev.map(b => b.id === bookingId ? booking : b));
        }
        removePendingKey(bookingId);
        return success;
    }, [bookings, currentUser, pendingKeys]);

    const isWeekUnavailable = useCallback((userId: string, weekKey: string) =>
        unavailableWeeks.includes(`${userId}-${weekKey}`), [unavailableWeeks]);

    const toggleWeekUnavailable = useCallback(async (userId: string, weekKey: string) => {
        const key = `${userId}-${weekKey}`;
        const isCurrentlyUnavailable = unavailableWeeks.includes(key);
        const next = isCurrentlyUnavailable
            ? unavailableWeeks.filter(k => k !== key)
            : [...unavailableWeeks, key];
            
        setUnavailableWeeks(next);
        
        const originalBookings = [...bookings];
        if (!isCurrentlyUnavailable) {
            setBookings(prev => prev.filter(b => !(b.userId === userId && b.weekKey === weekKey)));
        }
        
        const success = await toggleWeekUnavailableApi(userId, weekKey, !isCurrentlyUnavailable);
        if (!success) {
            // Revert state
            setUnavailableWeeks(unavailableWeeks);
            setBookings(originalBookings);
        } else {
            // If they became unavailable, we also need to delete bookings from backend
            if (!isCurrentlyUnavailable) {
                const bookingsToDelete = originalBookings.filter(b => b.userId === userId && b.weekKey === weekKey);
                for (const b of bookingsToDelete) {
                    await deleteBookingApi(b);
                }
            }
        }
    }, [unavailableWeeks, bookings]);

    const toggleEventAttendance = useCallback(async (userId: string, eventId: string) => {
        if (!currentUser || currentUser.role !== 'bureau') return;
        
        const existing = eventAttendance.find(a => a.userId === userId && a.eventId === eventId);
        const nextPresentState = existing ? !existing.present : true;
        
        let next: EventAttendance[];
        if (existing) {
            next = eventAttendance.map(a => 
                (a.userId === userId && a.eventId === eventId) ? { ...a, present: nextPresentState } : a
            );
        } else {
            next = [...eventAttendance, { userId, eventId, present: true }];
        }
        
        setEventAttendance(next);
        
        const success = await syncEventAttendanceApi({ userId, eventId, present: nextPresentState });
        if (!success) {
            // Revert
            setEventAttendance(eventAttendance);
        }
    }, [eventAttendance, currentUser]);

    return (
        <PlanningContext.Provider value={{
            currentUser, login, logout,
            bookings, getWeekBookings,
            toggleAvailability, validatePresence, markAbsent, resetValidation,
            currentWeekKey, setCurrentWeekKey,
            unavailableWeeks, toggleWeekUnavailable, isWeekUnavailable,
            eventAttendance, toggleEventAttendance, isPending
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
