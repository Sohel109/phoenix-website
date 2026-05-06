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

export const timeSlots: TimeSlot[] = projectsData.flatMap((project) => {
    switch (project.id) {
        case 4: // ST GAB : 18h00-19h30 Lundi Mardi Jeudi Vendredi
            return ['Lundi', 'Mardi', 'Jeudi', 'Vendredi'].map(day => ({
                id: `slot-4-${day.toLowerCase().substring(0,3)}`,
                projectId: 4, day: day as DayOfWeek, startTime: '18:00', endTime: '19:30'
            }));
        case 6: // Izzo : 16h30-18h30 Jeudi
            return [{ id: 'slot-6-jeu', projectId: 6, day: 'Jeudi', startTime: '16:30', endTime: '18:30' }];
        case 2: // ACSE : 14h00-17h30 Samedi
            return [{ id: 'slot-2-sam', projectId: 2, day: 'Samedi', startTime: '14:00', endTime: '17:30' }];
        case 5: // Apprentis d’Auteuil : 16h00-18h30 Mardi Jeudi
            return ['Mardi', 'Jeudi'].map(day => ({
                id: `slot-5-${day.toLowerCase().substring(0,3)}`,
                projectId: 5, day: day as DayOfWeek, startTime: '16:00', endTime: '18:30'
            }));
        case 8: // Arthur Rimbaud : 15h30-18h00 Jeudi
            return [{ id: 'slot-8-jeu', projectId: 8, day: 'Jeudi', startTime: '15:30', endTime: '18:00' }];
        case 7: // Jules Ferry : 14h00-16h30 Mercredi (Bi-hebdomadaire)
            return [{ id: 'slot-7-mer', projectId: 7, day: 'Mercredi', startTime: '14:00', endTime: '16:30' }];
        case 1: // Supd’OM : 18h00-19h30 Mardi Jeudi
            return ['Mardi', 'Jeudi'].map(day => ({
                id: `slot-1-${day.toLowerCase().substring(0,3)}`,
                projectId: 1, day: day as DayOfWeek, startTime: '18:00', endTime: '19:30'
            }));
        case 9: // Roy d’Espagne : 16h00-18h30 Jeudi
            return [{ id: 'slot-9-jeu', projectId: 9, day: 'Jeudi', startTime: '16:00', endTime: '18:30' }];
        case 3: // MASSA 13 : Jeudi 18h00-19h30 (Par défaut)
            return [{ id: 'slot-3-jeu', projectId: 3, day: 'Jeudi', startTime: '18:00', endTime: '19:30' }];
        default:
            return [];
    }
});

export function isSlotActiveThisWeek(slotId: string, weekKey: string): boolean {
    if (slotId.startsWith('slot-7-')) { // Jules Ferry
        const weekNum = parseInt(weekKey.split('-W')[1], 10);
        // On considère les semaines paires (ex: W02, W04) comme actives pour Jules Ferry
        return weekNum % 2 === 0;
    }
    return true;
}

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
