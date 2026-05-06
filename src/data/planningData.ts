import { projectsData } from './projectsData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'tuteur' | 'chef_projet' | 'bureau';

export interface PlanningUser {
    id: string;
    name: string;
    login: string;
    password: string;
    role: UserRole;
    projectIds: number[];
}

export type DayOfWeek = 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';

export interface TimeSlot {
    id: string;
    projectId: number;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
}

export type BookingStatus = 'prevu' | 'confirme' | 'absent' | 'annule';

export interface Booking {
    id: string;
    slotId: string;
    userId: string;
    userName?: string;
    weekKey: string;
    status: BookingStatus;
    validatedBy?: string;
    validatedAt?: string;
}

export const SPECIAL_EVENTS = [
    { id: 'simonu', label: 'SimONU' },
    { id: 'entretiens', label: 'Entretiens d’Excellence' },
    { id: 'jedc', label: 'Journée Egalité des Chances' },
    { id: 'olympiades', label: 'Olympiades' }
];

export interface EventAttendance {
    userId: string;
    eventId: string;
    present: boolean;
}

// L'URL directe n'est plus utilisée depuis le front-end pour éviter les problèmes CORS sur Vercel
// export const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyMsp23ni8GWsIVXrj8xuBpjLLNgqRsxlsyEBWmQt4xAlKDBHzLqXtKW5vAdzMESMeXg/exec";

export async function authenticateUser(loginId: string, password: string): Promise<PlanningUser | null> {
    try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            body: JSON.stringify({ login: loginId, password }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            console.error("Erreur HTTP:", response.status);
            return null;
        }

        const data = await response.json();
        
        if (data.success && data.user) {
            return data.user as PlanningUser;
        } else {
            console.warn("Erreur d'authentification:", data.message);
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la requête vers l'API de login:", error);
        return null;
    }
}

// ─── Time Slots ───────────────────────────────────────────────────────────────

const STANDARD_DAYS: DayOfWeek[] = ['Lundi', 'Mardi', 'Jeudi', 'Vendredi'];

const dayKey = (day: DayOfWeek) => day.toLowerCase().substring(0, 3);

export const timeSlots: TimeSlot[] = projectsData.flatMap((project) => {
    if (project.id === 2) {
        // ACSE : samedi 14h–17h30
        return [{
            id: `slot-${project.id}-sam`,
            projectId: project.id,
            day: 'Samedi' as DayOfWeek,
            startTime: '14:00',
            endTime: '17:30',
        }];
    }
    // Tous les autres : lundi, mardi, jeudi, vendredi 18h–19h30
    return STANDARD_DAYS.map((day) => ({
        id: `slot-${project.id}-${dayKey(day)}`,
        projectId: project.id,
        day,
        startTime: '18:00',
        endTime: '19:30',
    }));
});

// ─── Slot utilities ───────────────────────────────────────────────────────────

export function getSlotDuration(slot: TimeSlot): number {
    const [sh, sm] = slot.startTime.split(':').map(Number);
    const [eh, em] = slot.endTime.split(':').map(Number);
    return (eh * 60 + em - sh * 60 - sm) / 60;
}

export const DAY_ORDER: DayOfWeek[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// ─── localStorage ─────────────────────────────────────────────────────────────

const BOOKINGS_KEY = 'phoenix_planning_bookings';
const UNAVAILABLE_KEY = 'phoenix_planning_unavailable';
const EVENT_ATTENDANCE_KEY = 'phoenix_event_attendance';

export function loadBookings(): Booking[] {
    try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? '[]'); }
    catch { return []; }
}

export function saveBookings(b: Booking[]): void {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(b));
}

export function loadUnavailableWeeks(): string[] {
    try { return JSON.parse(localStorage.getItem(UNAVAILABLE_KEY) ?? '[]'); }
    catch { return []; }
}

export function saveUnavailableWeeks(weeks: string[]): void {
    localStorage.setItem(UNAVAILABLE_KEY, JSON.stringify(weeks));
}

export function loadEventAttendance(): EventAttendance[] {
    try { return JSON.parse(localStorage.getItem(EVENT_ATTENDANCE_KEY) ?? '[]'); }
    catch { return []; }
}

export function saveEventAttendance(att: EventAttendance[]): void {
    localStorage.setItem(EVENT_ATTENDANCE_KEY, JSON.stringify(att));
}

// ─── Week utilities ───────────────────────────────────────────────────────────

export function getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getWeekStartDate(weekKey: string): Date {
    const [year, week] = weekKey.split('-W').map(Number);
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() || 7;
    const start = new Date(jan4);
    start.setDate(jan4.getDate() - jan4Day + 1 + (week - 1) * 7);
    return start;
}

export function formatWeekLabel(weekKey: string): string {
    const start = getWeekStartDate(weekKey);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${start.toLocaleDateString('fr-FR', opts)} – ${end.toLocaleDateString('fr-FR', { ...opts, year: 'numeric' })}`;
}

export function navigateWeek(weekKey: string, direction: 'prev' | 'next'): string {
    const start = getWeekStartDate(weekKey);
    start.setDate(start.getDate() + (direction === 'next' ? 7 : -7));
    return getWeekKey(start);
}
