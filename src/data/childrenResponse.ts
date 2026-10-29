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
        typeof d.date !== 'string' ||
        !isArrayOf(d.children, (c) => isObject(c) && typeof c.id === 'string' && typeof c.name === 'string') ||
        !(d.attendance === null || (isObject(d.attendance) && typeof d.attendance.date === 'string' && isArrayOf(d.attendance.presentIds, (id) => typeof id === 'string'))) ||
        !(summary === null || (isObject(summary) && typeof summary.schoolYear === 'string' && isNullableNumber(summary.rate) && isArrayOf(summary.children, isObject))) ||
        !(d.overview === null || isArrayOf(d.overview, isObject))
    ) {
        return null;
    }
    return raw as unknown as ChildrenData;
}

/** Date du jour à Paris, au format AAAA-MM-JJ (le serveur fait foi pour refuser une date à venir). */
export function todayKeyParis(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
