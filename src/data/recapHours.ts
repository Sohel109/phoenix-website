import type { ManualHourEntry } from './planningData';

export interface RecapFilter {
    type: 'week' | 'month' | 'year' | 'all';
    week: string;
    month: number;
    year: number;
    projectId: number | 'all';
}

export interface RecapMember {
    id: string;
    name: string;
    totalHours: number;
    slotHours: number;
    manualHoursCount: number;
    byProject: Record<number, number>;
}

interface RecapInput<S extends { id: string; projectId: number }> {
    bookings: { userId: string; userName?: string; slotId: string; weekKey: string; status: string }[];
    manualHours: ManualHourEntry[];
    slots: S[];
    allUsers: { id: string; name: string }[];
    filter: RecapFilter;
    /** Ajoute les membres sans aucune heure dans la sélection. */
    includeZero: boolean;
    weekStart: (weekKey: string) => Date;
    duration: (slot: S) => number;
}

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** La date tombe-t-elle dans la période choisie ? `weekStart` ne sert que pour le filtre par semaine. */
function inPeriod(date: Date, filter: RecapFilter, weekStart: Date | null): boolean {
    if (filter.type === 'month') return date.getMonth() === filter.month && date.getFullYear() === filter.year;
    if (filter.type === 'year') return date.getFullYear() === filter.year;
    if (filter.type === 'week' && weekStart) return date >= weekStart && date.getTime() < weekStart.getTime() + WEEK_MS;
    return true;
}

/**
 * Heures par membre dans la sélection : réservations confirmées (période d'après la semaine) et heures manuelles
 * (période d'après la date d'attribution). Le filtre de projet s'applique aux deux ; les heures de mission générale
 * n'apparaissent que quand aucun projet n'est choisi.
 */
export function computeRecap<S extends { id: string; projectId: number }>(input: RecapInput<S>): RecapMember[] {
    const { bookings, manualHours, slots, allUsers, filter, includeZero, weekStart, duration } = input;
    const slotById = new Map(slots.map((s) => [s.id, s]));
    const stats: Record<string, RecapMember> = {};
    const entry = (id: string, name: string) => (stats[id] ??= { id, name, totalHours: 0, slotHours: 0, manualHoursCount: 0, byProject: {} });

    for (const b of bookings) {
        if (b.status !== 'confirme') continue;
        const slot = slotById.get(b.slotId);
        if (!slot) continue;
        if (filter.projectId !== 'all' && slot.projectId !== filter.projectId) continue;
        const start = weekStart(b.weekKey);
        if (filter.type === 'week' ? b.weekKey !== filter.week : !inPeriod(start, filter, null)) continue;
        const hours = duration(slot);
        const member = entry(b.userId, b.userName || b.userId);
        member.totalHours += hours;
        member.slotHours += hours;
        member.byProject[slot.projectId] = (member.byProject[slot.projectId] || 0) + hours;
    }

    const selectedWeekStart = filter.type === 'week' ? weekStart(filter.week) : null;
    for (const mh of manualHours) {
        if (filter.projectId !== 'all' && mh.projectId !== filter.projectId) continue;
        if (!inPeriod(new Date(mh.createdAt), filter, selectedWeekStart)) continue;
        const member = entry(mh.userId, mh.userName || mh.userId);
        member.totalHours += mh.hours;
        member.manualHoursCount += mh.hours;
        if (mh.projectId) member.byProject[mh.projectId] = (member.byProject[mh.projectId] || 0) + mh.hours;
    }

    if (includeZero) {
        for (const u of allUsers) entry(u.id, u.name.replace(/\t/g, '').trim());
    }

    return Object.values(stats).sort((a, b) => b.totalHours - a.totalHours || a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
}

/** « Septembre 2026, Massa 13 » : la sélection en clair, affichée sous les filtres. */
export function describeRecapFilter(filter: RecapFilter, labels: { projectName?: string; weekLabel?: string }): string {
    const period =
        filter.type === 'month' ? `${MONTHS[filter.month]} ${filter.year}`
        : filter.type === 'year' ? `Année ${filter.year}`
        : filter.type === 'week' ? labels.weekLabel || 'Une semaine'
        : 'Toutes les dates';
    return `${period}, ${filter.projectId === 'all' ? 'tous les projets' : labels.projectName || 'un projet'}`;
}
