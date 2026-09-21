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
    changePasswordApi,
} from '../data/planningData';
import type { EventAttendance } from '../data/planningData';

// ─── Types d'heures manuelles (Bureau) ───────────────────────────────────────

export interface ManualHourEntry {
    id: string;
    userId: string;
    userName: string;
    hours: number;
    reason: string;
    grantedBy: string;
    createdAt: string;
    projectId?: number;
}

// ─── Membres renouvelants / Exemption quota (50h N-1 validées) ──────────────

export interface QuotaExemption {
    userId: string;
    userName: string;
    grantedBy: string;
    grantedAt: string;
    year: string; // e.g. "2024-2025"
    note?: string;
}

export const DEFAULT_ASSOCIATION_MEMBERS: { id: string; name: string }[] = [
    { id: 'bureau-1', name: 'Samy RABHI' },
    { id: 'bureau-2', name: 'Samir BAKAA' },
    { id: 'bureau-3', name: 'Ryan BENYELLES' },
    { id: 'bureau-4', name: 'Elyas BOURHIS' },
    { id: 'bureau-5', name: 'Lina EL KEDDAH' },
    { id: 'chef-1', name: 'Kahili JUVENTIN' },
    { id: 'chef-2', name: 'Abdollah JOUNOUDI' },
    { id: 'chef-3', name: 'Ryadh ABDELMALEK' },
    { id: 'chef-5', name: 'Haitam BEBBI' },
    { id: 'chef-6', name: 'Damya AKILI' },
    { id: 'chef-7', name: 'Amani ZAMIT' },
    { id: 'chef-9', name: 'Donia TNANI' },
    { id: 'chef-10', name: 'Camille JOURDIN' },
    { id: 'chef-12', name: 'Eve SAMA' },
    { id: 'chef-13', name: 'Nelly RANDRIAMIHAJA' },
    { id: 'tuteur-1', name: 'Jean DUPONT' },
    { id: 'tuteur-2', name: 'Sohel HAGGUI' },
];

// ─── Context type ─────────────────────────────────────────────────────────────

interface PlanningContextType {
    currentUser: PlanningUser | null;
    login: (loginId: string, password: string) => Promise<boolean>;
    logout: () => void;
    bookings: Booking[];
    allUsers: { id: string; name: string }[];
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
    setEventAttendanceStatus: (userId: string, eventId: string, present: boolean) => Promise<void>;
    refreshPlanningData: () => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
    isPending: (key: string) => boolean;
    manualHours: ManualHourEntry[];
    addManualHours: (userId: string, userName: string, hours: number, reason: string, projectId?: number) => Promise<boolean>;
    deleteManualHours: (id: string) => Promise<boolean>;
    exemptions: QuotaExemption[];
    toggleQuotaExemption: (userId: string, userName: string, isExempt: boolean, note?: string) => Promise<boolean>;
    isQuotaExempt: (userId: string) => boolean;
    isEditModeActive: boolean;
    setEditModeActive: (active: boolean) => void;
    toggleEditMode: () => void;
}

const PlanningContext = createContext<PlanningContextType | null>(null);

const SESSION_KEY = 'phoenix_planning_session';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PlanningProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<PlanningUser | null>(() => {
        try {
            const data = sessionStorage.getItem(SESSION_KEY);
            if (!data) return null;
            const parsed = JSON.parse(data);
            // Sécurité : le password n'est jamais stocké en session
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _pwd, ...userWithoutPassword } = parsed;
            return userWithoutPassword as PlanningUser;
        } catch { return null; }
    });

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [unavailableWeeks, setUnavailableWeeks] = useState<string[]>([]);
    const [eventAttendance, setEventAttendance] = useState<EventAttendance[]>([]);
    const [currentWeekKey, setCurrentWeekKey] = useState(() => getWeekKey(new Date()));
    const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

    // ── Mode Modification du Site (Réservé au Bureau et activable dans Mon Compte) ──
    const EDIT_MODE_KEY = 'phoenix_edit_mode_active';
    const [editModePreference, setEditModePreference] = useState<boolean>(() => {
        try {
            return localStorage.getItem(EDIT_MODE_KEY) === 'true';
        } catch {
            return false;
        }
    });

    const isEditModeActive = Boolean(currentUser?.role === 'bureau' && editModePreference);

    const setEditModeActive = useCallback((active: boolean) => {
        setEditModePreference(active);
        try {
            localStorage.setItem(EDIT_MODE_KEY, active ? 'true' : 'false');
        } catch {}
    }, []);

    const toggleEditMode = useCallback(() => {
        setEditModePreference(prev => {
            const next = !prev;
            try {
                localStorage.setItem(EDIT_MODE_KEY, next ? 'true' : 'false');
            } catch {}
            return next;
        });
    }, []);

    // ── Liste complète des membres de l'association ───────────────────────────
    const [allUsers, setAllUsers] = useState<{ id: string; name: string }[]>(() => {
        try {
            const saved = localStorage.getItem('phoenix_all_users_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { /* fallback */ }
        return DEFAULT_ASSOCIATION_MEMBERS;
    });

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || '';
        fetch(`${API_URL}/api/login?action=listUsers`)
            .then(res => res.json())
            .then(data => {
                if (data?.success && Array.isArray(data.users) && data.users.length > 0) {
                    const cleaned = data.users.map((u: { id: string; name: string }) => ({
                        id: u.id,
                        name: u.name.replace(/\t/g, '').trim()
                    }));
                    setAllUsers(cleaned);
                    localStorage.setItem('phoenix_all_users_v1', JSON.stringify(cleaned));
                }
            })
            .catch(() => {});
    }, []);

    // ── Heures manuelles / exceptionnelles (attribuées par le Bureau) ───────────
    const [manualHours, setManualHours] = useState<ManualHourEntry[]>(() => {
        try {
            const saved = localStorage.getItem('phoenix_manual_hours_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch { /* fallback */ }
        return [];
    });

    useEffect(() => {
        fetch('/api/planning/manual-hours')
            .then(res => res.json())
            .then(data => {
                if (data?.success && Array.isArray(data.manualHours)) {
                    setManualHours(data.manualHours);
                    localStorage.setItem('phoenix_manual_hours_v1', JSON.stringify(data.manualHours));
                }
            })
            .catch(() => {});
    }, []);

    // ── Exemptions de quota / Membres renouvelants (N-1 validé) ────────────────
    const [exemptions, setExemptions] = useState<QuotaExemption[]>(() => {
        try {
            const saved = localStorage.getItem('phoenix_quota_exemptions_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch { /* fallback */ }
        return [];
    });

    useEffect(() => {
        fetch('/api/planning/exemptions')
            .then(res => res.json())
            .then(data => {
                if (data?.success && Array.isArray(data.exemptions)) {
                    setExemptions(data.exemptions);
                    localStorage.setItem('phoenix_quota_exemptions_v1', JSON.stringify(data.exemptions));
                }
            })
            .catch(() => {});
    }, []);

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

    const refreshPlanningData = useCallback(async () => {
        const data = await fetchPlanningData();
        if (data) {
            setBookings(data.bookings);
            setUnavailableWeeks(data.unavailableWeeks);
            setEventAttendance(data.eventAttendance);
        }
    }, []);

    // Charger les données de planning depuis le Google Sheet et synchroniser périodiquement (polling)
    useEffect(() => {
        if (!currentUser) return;

        let isMounted = true;
        fetchPlanningData().then(data => {
            if (!isMounted || !data) return;
            setBookings(data.bookings);
            setUnavailableWeeks(data.unavailableWeeks);
            setEventAttendance(data.eventAttendance);
        });

        // Polling automatique toutes les 30 secondes pour synchroniser les données entre utilisateurs sur Vercel
        const intervalId = setInterval(refreshPlanningData, 30000);
        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [currentUser, refreshPlanningData]);

    const login = useCallback(async (loginId: string, password: string): Promise<boolean> => {
        const user = await authenticateUser(loginId, password);
        if (user) {
            // Sécurité : on ne stocke jamais le mot de passe en session
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _pwd, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword as PlanningUser);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setBookings([]);
        setUnavailableWeeks([]);
        setEventAttendance([]);
        setEditModePreference(false);
        sessionStorage.removeItem(SESSION_KEY);
        try {
            localStorage.removeItem(EDIT_MODE_KEY);
        } catch {}
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
        if (!currentUser) return;
        if (currentUser.role !== 'bureau' && userId !== currentUser.id) return;
        
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

    const setEventAttendanceStatus = useCallback(async (userId: string, eventId: string, present: boolean) => {
        if (!currentUser) return;
        if (currentUser.role !== 'bureau' && userId !== currentUser.id) return;
        
        const existing = eventAttendance.find(a => a.userId === userId && a.eventId === eventId);
        if (existing && existing.present === present) return;

        let next: EventAttendance[];
        if (existing) {
            next = eventAttendance.map(a => 
                (a.userId === userId && a.eventId === eventId) ? { ...a, present } : a
            );
        } else {
            next = [...eventAttendance, { userId, eventId, present }];
        }
        
        setEventAttendance(next);
        
        const success = await syncEventAttendanceApi({ userId, eventId, present });
        if (!success) {
            // Revert
            setEventAttendance(eventAttendance);
        }
    }, [eventAttendance, currentUser]);

    const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
        if (!currentUser) return { success: false, message: 'Non connecté' };
        const res = await changePasswordApi(currentUser.id, oldPassword, newPassword);
        // Sécurité : on ne stocke pas le nouveau mot de passe dans le state ou la session
        return res;
    }, [currentUser]);

    // ── Actions Heures Manuelles (Bureau uniquement) ──────────────────────────
    const addManualHours = useCallback(async (userId: string, userName: string, hours: number, reason: string, projectId?: number): Promise<boolean> => {
        if (!currentUser || currentUser.role !== 'bureau') return false;
        if (!reason || reason.trim().length < 5) return false;
        if (hours <= 0) return false;

        const newEntry: ManualHourEntry = {
            id: `mh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId,
            userName,
            hours: Number(hours),
            reason: reason.trim(),
            grantedBy: currentUser.name,
            createdAt: new Date().toISOString(),
            projectId
        };

        const updated = [newEntry, ...manualHours];
        setManualHours(updated);
        try {
            localStorage.setItem('phoenix_manual_hours_v1', JSON.stringify(updated));
            await fetch('/api/planning/manual-hours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manualHours: updated })
            });
        } catch (e) {
            console.error('Erreur sauvegarde manual hours:', e);
        }
        return true;
    }, [currentUser, manualHours]);

    const deleteManualHours = useCallback(async (id: string): Promise<boolean> => {
        if (!currentUser || currentUser.role !== 'bureau') return false;
        const updated = manualHours.filter(m => m.id !== id);
        setManualHours(updated);
        try {
            localStorage.setItem('phoenix_manual_hours_v1', JSON.stringify(updated));
            await fetch('/api/planning/manual-hours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manualHours: updated })
            });
        } catch (e) {
            console.error('Erreur suppression manual hours:', e);
        }
        return true;
    }, [currentUser, manualHours]);

    const isQuotaExempt = useCallback((userId: string) => {
        return exemptions.some(e => e.userId === userId);
    }, [exemptions]);

    const toggleQuotaExemption = useCallback(async (userId: string, userName: string, isExempt: boolean, note?: string): Promise<boolean> => {
        if (!currentUser || currentUser.role !== 'bureau') return false;

        let updated: QuotaExemption[];
        if (isExempt) {
            if (exemptions.some(e => e.userId === userId)) return true;
            const newEntry: QuotaExemption = {
                userId,
                userName,
                grantedBy: currentUser.name,
                grantedAt: new Date().toISOString(),
                year: '2024-2025',
                note: note || 'Quota 50h validé lors de l\'année précédente (Membre renouvelant)'
            };
            updated = [...exemptions, newEntry];
        } else {
            updated = exemptions.filter(e => e.userId !== userId);
        }

        setExemptions(updated);
        try {
            localStorage.setItem('phoenix_quota_exemptions_v1', JSON.stringify(updated));
            await fetch('/api/planning/exemptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exemptions: updated })
            });
        } catch (e) {
            console.error('Erreur sauvegarde exemptions:', e);
        }
        return true;
    }, [currentUser, exemptions]);

    return (
        <PlanningContext.Provider value={{
            currentUser, login, logout,
            bookings, allUsers, getWeekBookings,
            toggleAvailability, validatePresence, markAbsent, resetValidation,
            currentWeekKey, setCurrentWeekKey,
            unavailableWeeks, toggleWeekUnavailable, isWeekUnavailable,
            eventAttendance, toggleEventAttendance, setEventAttendanceStatus,
            refreshPlanningData, changePassword, isPending,
            manualHours, addManualHours, deleteManualHours,
            exemptions, toggleQuotaExemption, isQuotaExempt,
            isEditModeActive, setEditModeActive, toggleEditMode
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
