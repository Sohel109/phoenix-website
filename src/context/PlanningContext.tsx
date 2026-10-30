import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { PlanningUser, Booking, BookingStatus, ManualHourEntry, QuotaExemption } from '../data/planningData';
import {
    authenticateUser,
    getWeekKey,
    fetchPlanningData,
    syncBookingApi,
    deleteBookingApi,
    toggleWeekUnavailableApi,
    syncEventAttendanceApi,
    changePasswordApi,
    updateUserProjectApi,
    fetchManualHours,
    addManualHoursApi,
    deleteManualHoursApi,
    importManualHoursApi,
    fetchExemptions,
    setExemptionApi,
    importExemptionsApi,
} from '../data/planningData';
import { canDeleteManualHour } from '../data/manualHoursRules';
import { createLatestGate } from '../data/voteResponse';
import type { EventAttendance } from '../data/planningData';

// ─── Types d'heures manuelles et d'exemptions : définis dans planningData.ts, ré-exportés ici ───
export type { ManualHourEntry, QuotaExemption } from '../data/planningData';

export interface AssociationMember {
    id: string;
    name: string;
    role?: string;
    projectIds?: number[];
}

export const DEFAULT_ASSOCIATION_MEMBERS: AssociationMember[] = [
    { id: 'bureau-1', name: 'Samy RABHI', role: 'bureau', projectIds: [1] },
    { id: 'bureau-2', name: 'Samir BAKAA', role: 'bureau', projectIds: [3] },
    { id: 'bureau-3', name: 'Ryan BENYELLES', role: 'bureau', projectIds: [6] },
    { id: 'bureau-4', name: 'Elyas BOURHIS', role: 'bureau', projectIds: [2] },
    { id: 'bureau-5', name: 'Lina EL KEDDAH', role: 'bureau', projectIds: [9] },
    { id: 'chef-1', name: 'Kahili JUVENTIN', role: 'chef_projet', projectIds: [4] },
    { id: 'chef-2', name: 'Abdollah JOUNOUDI', role: 'chef_projet', projectIds: [4] },
    { id: 'chef-3', name: 'Ryadh ABDELMALEK', role: 'chef_projet', projectIds: [2] },
    { id: 'chef-5', name: 'Haitam BEBBI', role: 'chef_projet', projectIds: [8] },
    { id: 'chef-6', name: 'Damya AKILI', role: 'chef_projet', projectIds: [5] },
    { id: 'chef-7', name: 'Amani ZAMIT', role: 'chef_projet', projectIds: [5] },
    { id: 'chef-9', name: 'Donia TNANI', role: 'chef_projet', projectIds: [6] },
    { id: 'chef-10', name: 'Camille JOURDIN', role: 'chef_projet', projectIds: [7] },
    { id: 'chef-12', name: 'Eve SAMA', role: 'chef_projet', projectIds: [1] },
    { id: 'chef-13', name: 'Nelly RANDRIAMIHAJA', role: 'chef_projet', projectIds: [7] },
    { id: 'tuteur-1', name: 'Jean DUPONT', role: 'tuteur', projectIds: [2] },
    { id: 'tuteur-2', name: 'Sohel HAGGUI', role: 'tuteur', projectIds: [2] },
];

// ─── Context type ─────────────────────────────────────────────────────────────

interface PlanningContextType {
    currentUser: PlanningUser | null;
    login: (loginId: string, password: string) => Promise<boolean>;
    logout: () => void;
    bookings: Booking[];
    allUsers: AssociationMember[];
    updateUserProject: (projectId: number) => Promise<{ success: boolean; message: string }>;
    getTutorsForProject: (projectId: number) => AssociationMember[];
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
    /** Droits de ce compte sur les heures manuelles, tels que renvoyés par le serveur. */
    hoursAccess: { isBureau: boolean; manageableProjects: number[] };
    /** Dernier refus du serveur sur une écriture (ajout, suppression, renouvelant), sinon null. */
    hoursError: string | null;
    /** Message si les heures manuelles n'ont pas pu être lues (script pas à jour, réseau, session expirée), sinon null. */
    hoursLoadError: string | null;
    /** Entrées encore enregistrées seulement dans ce navigateur (ancien stockage), à envoyer au serveur par le Bureau. */
    pendingLocalHours: { hours: number; exemptions: number };
    importLocalHours: () => Promise<{ ok: boolean; message: string }>;
    exemptions: QuotaExemption[];
    toggleQuotaExemption: (userId: string, userName: string, isExempt: boolean, note?: string) => Promise<boolean>;
    isQuotaExempt: (userId: string) => boolean;
    isEditModeActive: boolean;
    setEditModeActive: (active: boolean) => void;
    toggleEditMode: () => void;
}

const PlanningContext = createContext<PlanningContextType | null>(null);

const SESSION_KEY = 'phoenix_planning_session';

// Ancien stockage des heures manuelles et des renouvelants : le navigateur de celui qui les saisissait.
// Plus lu comme source de vérité, seulement proposé à l'envoi vers le serveur (Bureau).
const LOCAL_MANUAL_HOURS_KEY = 'phoenix_manual_hours_v1';
const LOCAL_EXEMPTIONS_KEY = 'phoenix_quota_exemptions_v1';
const LOCAL_IMPORTED_FLAG = 'phoenix_hours_imported_v1';
const EMPTY_HOURS: ManualHourEntry[] = [];
const EMPTY_EXEMPTIONS: QuotaExemption[] = [];
const NO_HOURS_ACCESS = { isBureau: false, manageableProjects: [] as number[] };

function readLocalList(key: string): unknown[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

interface HoursState {
    /** Compte pour lequel ces données ont été lues : elles ne sont jamais montrées à un autre compte. */
    forUser: string;
    manualHours: ManualHourEntry[];
    exemptions: QuotaExemption[];
    access: { isBureau: boolean; manageableProjects: number[] };
    loadError: string | null;
}

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
    const [allUsers, setAllUsers] = useState<AssociationMember[]>(() => {
        try {
            const saved = localStorage.getItem('phoenix_all_users_v2');
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
                    const cleaned: AssociationMember[] = data.users.map((u: any) => ({
                        id: u.id,
                        name: (u.name || '').replace(/\t/g, '').trim(),
                        role: u.role || 'tuteur',
                        projectIds: Array.isArray(u.projectIds) ? u.projectIds : (u.projectIds ? [Number(u.projectIds)] : [])
                    }));
                    setAllUsers(cleaned);
                    localStorage.setItem('phoenix_all_users_v2', JSON.stringify(cleaned));
                }
            })
            .catch(() => {});
    }, []);

    // ── Heures manuelles et membres renouvelants : enregistrés dans le Sheet, le serveur vérifie jeton et rôle ──
    const hoursUserId = currentUser?.id;
    const hoursToken = currentUser?.token ?? '';
    const [hoursState, setHoursState] = useState<HoursState | null>(null);
    const [hoursError, setHoursError] = useState<string | null>(null);
    const [localImportDone, setLocalImportDone] = useState<boolean>(() => {
        try { return localStorage.getItem(LOCAL_IMPORTED_FLAG) === 'true'; } catch { return false; }
    });
    // Les réponses d'Apps Script n'arrivent pas forcément dans l'ordre : seule la dernière lecture compte.
    const hoursGate = useRef(createLatestGate());

    type HoursReads = [Awaited<ReturnType<typeof fetchManualHours>>, Awaited<ReturnType<typeof fetchExemptions>>];
    const readHours = useCallback((): Promise<HoursReads> => {
        return Promise.all([fetchManualHours(hoursUserId ?? '', hoursToken), fetchExemptions(hoursUserId ?? '', hoursToken)]);
    }, [hoursUserId, hoursToken]);

    const applyHours = useCallback(([hoursResult, exemptionsResult]: HoursReads) => {
        setHoursState({
            forUser: hoursUserId ?? '',
            manualHours: hoursResult.ok ? hoursResult.data.manualHours : EMPTY_HOURS,
            exemptions: exemptionsResult.ok ? exemptionsResult.data.exemptions : EMPTY_EXEMPTIONS,
            access: hoursResult.ok
                ? { isBureau: hoursResult.data.isBureau, manageableProjects: hoursResult.data.manageableProjects }
                : NO_HOURS_ACCESS,
            loadError: !hoursResult.ok ? hoursResult.message : !exemptionsResult.ok ? exemptionsResult.message : null,
        });
    }, [hoursUserId]);

    // Relecture après une écriture : on attend la réponse du serveur, la dernière lecture lancée l'emporte.
    const reloadHours = useCallback(async () => {
        if (!hoursUserId) return;
        const ticket = hoursGate.current.next();
        const reads = await readHours();
        if (hoursGate.current.isLatest(ticket)) applyHours(reads);
    }, [hoursUserId, readHours, applyHours]);

    useEffect(() => {
        if (!hoursUserId) return;
        const gate = hoursGate.current;
        const ticket = gate.next();
        void readHours().then((reads) => {
            if (gate.isLatest(ticket)) applyHours(reads);
        });
        return () => {
            // Invalide la lecture en vol (changement de compte ou démontage).
            gate.next();
        };
    }, [hoursUserId, readHours, applyHours]);

    const currentHours = hoursState && hoursState.forUser === hoursUserId ? hoursState : null;
    const manualHours = currentHours?.manualHours ?? EMPTY_HOURS;
    const exemptions = currentHours?.exemptions ?? EMPTY_EXEMPTIONS;
    const hoursAccess = currentHours?.access ?? NO_HOURS_ACCESS;
    const hoursLoadError = currentHours?.loadError ?? null;

    const pendingLocalHours = useMemo(
        () => (localImportDone || !hoursUserId
            ? { hours: 0, exemptions: 0 }
            : { hours: readLocalList(LOCAL_MANUAL_HOURS_KEY).length, exemptions: readLocalList(LOCAL_EXEMPTIONS_KEY).length }),
        [localImportDone, hoursUserId]
    );

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

    // ── Actions Heures Manuelles : le Bureau partout, un chef de projet pour ses projets (le serveur décide) ──
    const addManualHours = useCallback(async (userId: string, userName: string, hours: number, reason: string, projectId?: number): Promise<boolean> => {
        if (!currentUser) return false;
        const isChefForProject = currentUser.role === 'chef_projet' && projectId !== undefined && hoursAccess.manageableProjects.includes(projectId);
        if (currentUser.role !== 'bureau' && !isChefForProject) return false;
        if (!reason || reason.trim().length < 8) return false;
        if (hours <= 0) return false;

        const result = await addManualHoursApi(currentUser.id, currentUser.token ?? '', userId, userName, Number(hours), reason.trim(), projectId);
        if (!result.success) {
            setHoursError(result.message);
            return false;
        }
        setHoursError(null);
        await reloadHours();
        return true;
    }, [currentUser, hoursAccess, reloadHours]);

    const deleteManualHours = useCallback(async (id: string): Promise<boolean> => {
        if (!currentUser) return false;
        const entry = manualHours.find(m => m.id === id);
        if (!entry || !canDeleteManualHour(entry, currentUser, hoursAccess.manageableProjects)) return false;
        const result = await deleteManualHoursApi(currentUser.id, currentUser.token ?? '', id);
        if (!result.success) {
            setHoursError(result.message);
            return false;
        }
        setHoursError(null);
        await reloadHours();
        return true;
    }, [currentUser, manualHours, hoursAccess, reloadHours]);

    const isQuotaExempt = useCallback((userId: string) => {
        return exemptions.some(e => e.userId === userId);
    }, [exemptions]);

    const toggleQuotaExemption = useCallback(async (userId: string, userName: string, isExempt: boolean, note?: string): Promise<boolean> => {
        if (!currentUser || currentUser.role !== 'bureau') return false;
        const result = await setExemptionApi(
            currentUser.id,
            currentUser.token ?? '',
            userId,
            userName,
            isExempt,
            isExempt ? (note || 'Quota 50h validé lors de l\'année précédente (Membre renouvelant)') : undefined,
            isExempt ? '2024-2025' : undefined
        );
        if (!result.success) {
            setHoursError(result.message);
            return false;
        }
        setHoursError(null);
        await reloadHours();
        return true;
    }, [currentUser, reloadHours]);

    const importLocalHours = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
        if (!currentUser || currentUser.role !== 'bureau') return { ok: false, message: 'Seul le Bureau peut envoyer ces données.' };
        const token = currentUser.token ?? '';
        const hoursList = readLocalList(LOCAL_MANUAL_HOURS_KEY);
        const exemptionsList = readLocalList(LOCAL_EXEMPTIONS_KEY);
        const hoursResult = hoursList.length > 0 ? await importManualHoursApi(currentUser.id, token, hoursList) : { ok: true as const, imported: 0, ignored: 0 };
        if (!hoursResult.ok) return { ok: false, message: hoursResult.message };
        const exemptionsResult = exemptionsList.length > 0 ? await importExemptionsApi(currentUser.id, token, exemptionsList) : { ok: true as const, imported: 0, ignored: 0 };
        if (!exemptionsResult.ok) return { ok: false, message: exemptionsResult.message };
        // Les données locales ne sont pas effacées : elles restent une copie de sécurité. Le drapeau masque seulement le bandeau.
        try { localStorage.setItem(LOCAL_IMPORTED_FLAG, 'true'); } catch { /* sans stockage, le bandeau reviendra */ }
        setLocalImportDone(true);
        await reloadHours();
        const ignored = hoursResult.ignored + exemptionsResult.ignored;
        return {
            ok: true,
            message: `${hoursResult.imported} attribution(s) d'heures et ${exemptionsResult.imported} membre(s) renouvelant(s) enregistrés sur le serveur${ignored > 0 ? `, ${ignored} ignorés (déjà présents ou invalides)` : ''}.`
        };
    }, [currentUser, reloadHours]);

    const updateUserProject = useCallback(async (projectId: number): Promise<{ success: boolean; message: string }> => {
        if (!currentUser) {
            return { success: false, message: 'Non connecté' };
        }

        const newProjectIds = [projectId];

        // 1. Mise à jour immédiate du currentUser en mémoire et session
        const updatedUser: PlanningUser = {
            ...currentUser,
            projectIds: newProjectIds
        };
        setCurrentUser(updatedUser);
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        } catch {}

        // 2. Mise à jour de allUsers
        setAllUsers(prev => {
            const updated = prev.map(u => u.id === currentUser.id ? { ...u, projectIds: newProjectIds } : u);
            try {
                localStorage.setItem('phoenix_all_users_v2', JSON.stringify(updated));
            } catch {}
            return updated;
        });

        // 3. Appel de l'API (sync Google Sheet via proxy / GAS)
        try {
            const res = await updateUserProjectApi(currentUser.id, newProjectIds);
            return res;
        } catch (err) {
            console.error('Erreur updateUserProject:', err);
            return { success: false, message: 'Erreur réseau lors de la mise à jour' };
        }
    }, [currentUser]);

    const getTutorsForProject = useCallback((projectId: number): AssociationMember[] => {
        return allUsers.filter(u => Array.isArray(u.projectIds) && u.projectIds.includes(projectId));
    }, [allUsers]);

    return (
        <PlanningContext.Provider value={{
            currentUser, login, logout,
            bookings, allUsers, getWeekBookings,
            updateUserProject, getTutorsForProject,
            toggleAvailability, validatePresence, markAbsent, resetValidation,
            currentWeekKey, setCurrentWeekKey,
            unavailableWeeks, toggleWeekUnavailable, isWeekUnavailable,
            eventAttendance, toggleEventAttendance, setEventAttendanceStatus,
            refreshPlanningData, changePassword, isPending,
            manualHours, addManualHours, deleteManualHours, hoursAccess, hoursError, hoursLoadError, pendingLocalHours, importLocalHours,
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
