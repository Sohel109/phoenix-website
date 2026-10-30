import type { ExemptionsData, ManualHoursData } from './planningData';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isArrayOf = (value: unknown, check: (item: unknown) => boolean) => Array.isArray(value) && value.every(check);
const isString = (value: unknown) => typeof value === 'string';

const isManualHour = (entry: unknown) =>
    isObject(entry) &&
    isString(entry.id) &&
    isString(entry.userId) &&
    isString(entry.userName) &&
    typeof entry.hours === 'number' &&
    Number.isFinite(entry.hours) &&
    isString(entry.reason) &&
    isString(entry.grantedBy) &&
    (entry.grantedById === undefined || isString(entry.grantedById)) &&
    isString(entry.createdAt) &&
    (entry.projectId === undefined || typeof entry.projectId === 'number');

const isExemption = (entry: unknown) =>
    isObject(entry) &&
    isString(entry.userId) &&
    isString(entry.userName) &&
    isString(entry.grantedBy) &&
    isString(entry.grantedAt) &&
    isString(entry.year) &&
    isString(entry.note);

/**
 * Valide la réponse du script Google à `getManualHours`. Un script pas encore redéployé répond à côté
 * (par exemple par une réponse de connexion) : on ne doit jamais la prendre pour des heures manuelles.
 */
export function parseManualHoursData(raw: unknown): ManualHoursData | null {
    if (!isObject(raw)) return null;
    if (
        raw.success !== true ||
        typeof raw.isBureau !== 'boolean' ||
        !isArrayOf(raw.manageableProjects, (p) => typeof p === 'number') ||
        !isArrayOf(raw.manualHours, isManualHour)
    ) {
        return null;
    }
    return {
        isBureau: raw.isBureau,
        manageableProjects: raw.manageableProjects as number[],
        manualHours: raw.manualHours as ManualHoursData['manualHours'],
    };
}

/** Valide la réponse du script à `getExemptions`. */
export function parseExemptionsData(raw: unknown): ExemptionsData | null {
    if (!isObject(raw) || raw.success !== true || !isArrayOf(raw.exemptions, isExemption)) return null;
    return { exemptions: raw.exemptions as ExemptionsData['exemptions'] };
}

/** Valide la réponse du script à un import (`importManualHours`, `importExemptions`). */
export function parseImportResult(raw: unknown): { imported: number; ignored: number } | null {
    if (!isObject(raw) || raw.success !== true || typeof raw.imported !== 'number' || typeof raw.ignored !== 'number') return null;
    return { imported: raw.imported, ignored: raw.ignored };
}
