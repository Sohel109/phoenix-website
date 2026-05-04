import { projectsData } from './projectsData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'tuteur' | 'chef_projet';

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
    weekKey: string;
    status: BookingStatus;
    validatedBy?: string;
    validatedAt?: string;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const mockUsers: PlanningUser[] = [
    // Chefs de projet
    { id: 'chef-1', name: 'Lise Dehedin',       login: 'lise.dehedin',       password: 'SupdOM2025!',      role: 'chef_projet', projectIds: [1] },
    { id: 'chef-2', name: 'Farah Dali',          login: 'farah.dali',         password: 'ACSE2025!',        role: 'chef_projet', projectIds: [2] },
    { id: 'chef-3', name: 'Fabien Boles Franso', login: 'fabien.boles',       password: 'Massa2025!',       role: 'chef_projet', projectIds: [3] },
    { id: 'chef-4', name: 'Tessa Valente',       login: 'tessa.valente',      password: 'Gabriel2025!',     role: 'chef_projet', projectIds: [4] },
    { id: 'chef-5', name: 'Clara Boudeville',    login: 'clara.boudeville',   password: 'Apprentis2025!',   role: 'chef_projet', projectIds: [5] },
    { id: 'chef-6', name: 'Adel Bia',            login: 'adel.bia',           password: 'Izzo2025!',        role: 'chef_projet', projectIds: [6] },
    { id: 'chef-7', name: 'Lou-Ann Lapointe',    login: 'louann.lapointe',    password: 'Ferry2025!',       role: 'chef_projet', projectIds: [7] },
    { id: 'chef-8', name: 'Salwa Guernina',      login: 'salwa.guernina',     password: 'Rimbaud2025!',     role: 'chef_projet', projectIds: [8] },
    { id: 'chef-9', name: 'Nadir Stiti',         login: 'nadir.stiti',        password: 'Roy2025!',         role: 'chef_projet', projectIds: [9] },
    // Tuteurs
    { id: 'tuteur-1', name: 'Amine Benali',   login: 'amine.benali',   password: 'Phoenix2025!', role: 'tuteur', projectIds: [1, 3] },
    { id: 'tuteur-2', name: 'Sara Meziani',   login: 'sara.meziani',   password: 'Phoenix2025!', role: 'tuteur', projectIds: [2] },
    { id: 'tuteur-3', name: 'Youssef Karam',  login: 'youssef.karam',  password: 'Phoenix2025!', role: 'tuteur', projectIds: [5, 6] },
    { id: 'tuteur-4', name: 'Inès Touati',    login: 'ines.touati',    password: 'Phoenix2025!', role: 'tuteur', projectIds: [7] },
    { id: 'tuteur-5', name: 'Rayan Chebli',   login: 'rayan.chebli',   password: 'Phoenix2025!', role: 'tuteur', projectIds: [8, 9] },
    { id: 'tuteur-6', name: 'Nora Hamidi',    login: 'nora.hamidi',    password: 'Phoenix2025!', role: 'tuteur', projectIds: [1, 4] },
    { id: 'tuteur-7', name: 'Mehdi Barra',    login: 'mehdi.barra',    password: 'Phoenix2025!', role: 'tuteur', projectIds: [3] },
    { id: 'tuteur-8', name: 'Lina Aouadi',    login: 'lina.aouadi',    password: 'Phoenix2025!', role: 'tuteur', projectIds: [2] },
];

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
