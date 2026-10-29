import type { ChildrenData } from './planningData';

const isArrayOf = (value: unknown, check: (item: unknown) => boolean) => Array.isArray(value) && value.every(check);
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isNullableNumber = (value: unknown) => value === null || typeof value === 'number';

/**
 * Valide la réponse du script Google à `getChildrenData`. Un script pas encore redéployé répond à côté
 * (par exemple par une réponse de connexion) : on ne doit jamais la prendre pour des données d'appel.
 */
export function parseChildrenData(raw: unknown): ChildrenData | null {
    if (!isObject(raw)) return null;
    const d = raw;
    const summary = d.summary;
    if (
        d.success !== true ||
        typeof d.isBureau !== 'boolean' ||
        !isArrayOf(d.projects, (p) => typeof p === 'number') ||
        !isNullableNumber(d.projectId) ||
        typeof d.weekKey !== 'string' ||
        !(d.slotId === null || typeof d.slotId === 'string') ||
        !isArrayOf(d.children, (c) => isObject(c) && typeof c.id === 'string' && typeof c.name === 'string') ||
        !(d.attendance === null || (isObject(d.attendance) && typeof d.attendance.slotId === 'string' && typeof d.attendance.weekKey === 'string' && isArrayOf(d.attendance.presentIds, (id) => typeof id === 'string'))) ||
        !isArrayOf(d.doneSlots, (id) => typeof id === 'string') ||
        !(summary === null || (isObject(summary) && typeof summary.schoolYear === 'string' && isNullableNumber(summary.rate) && isArrayOf(summary.children, isObject))) ||
        !(d.overview === null || isArrayOf(d.overview, isObject))
    ) {
        return null;
    }
    return raw as unknown as ChildrenData;
}

/** Date du jour à Paris, au format AAAA-MM-JJ (le serveur fait foi pour refuser une séance à venir). */
export function todayKeyParis(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

/**
 * Jour (AAAA-MM-JJ) d'une séance : `dayIndex` 0 = lundi, dans la semaine ISO `weekKey` (« 2026-W44 »).
 * Renvoie null pour une semaine qui n'existe pas. Même calcul que le script.
 */
export function sessionDateKey(weekKey: string, dayIndex: number): string | null {
    const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);
    if (!match) return null;
    const week = Number(match[2]);
    if (week < 1 || week > 53) return null;
    const jan4 = new Date(Date.UTC(Number(match[1]), 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const monday = new Date(jan4.getTime() + (-(jan4Day - 1) + (week - 1) * 7) * 86400000);
    // La semaine 53 n'existe pas toutes les années : le lundi calculé doit retomber dans la bonne semaine ISO.
    const thursday = new Date(monday.getTime() + 3 * 86400000);
    if (thursday.getUTCFullYear() !== Number(match[1])) return null;
    return new Date(monday.getTime() + dayIndex * 86400000).toISOString().slice(0, 10);
}

/** Vrai quand `data` ne correspond plus au projet, à la semaine ou à la séance affichés (par exemple après un échec de chargement). */
export function isStaleChildrenData(data: ChildrenData | null, selectedProject: number | null, weekKey: string, slotId: string | null): boolean {
    if (!data) return false;
    return data.weekKey !== weekKey || data.slotId !== slotId || (selectedProject !== null && data.projectId !== selectedProject);
}
