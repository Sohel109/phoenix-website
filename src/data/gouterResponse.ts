import type { GouterData } from './planningData';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isArrayOf = (value: unknown, check: (item: unknown) => boolean) => Array.isArray(value) && value.every(check);

const isSlot = (slot: unknown) =>
    isObject(slot) &&
    typeof slot.hour === 'number' &&
    isArrayOf(slot.users, (u) => isObject(u) && typeof u.userId === 'string' && typeof u.name === 'string');

const isItem = (item: unknown) =>
    isObject(item) &&
    typeof item.id === 'string' &&
    typeof item.item === 'string' &&
    typeof item.userId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.canRemove === 'boolean';

const isGouter = (gouter: unknown) =>
    isObject(gouter) &&
    typeof gouter.id === 'string' &&
    typeof gouter.projectId === 'number' &&
    typeof gouter.date === 'string' &&
    typeof gouter.note === 'string' &&
    typeof gouter.isPast === 'boolean' &&
    typeof gouter.canManage === 'boolean' &&
    isArrayOf(gouter.slots, isSlot) &&
    isArrayOf(gouter.items, isItem);

/**
 * Valide la réponse du script Google à `getGouters`. Un script pas encore redéployé répond à côté
 * (par exemple par une réponse de connexion) : on ne doit jamais la prendre pour des données de goûters.
 */
export function parseGouterData(raw: unknown): GouterData | null {
    if (!isObject(raw)) return null;
    if (
        raw.success !== true ||
        typeof raw.isBureau !== 'boolean' ||
        typeof raw.schoolYear !== 'string' ||
        !isArrayOf(raw.manageableProjects, (p) => typeof p === 'number') ||
        !isArrayOf(raw.gouters, isGouter)
    ) {
        return null;
    }
    return raw as unknown as GouterData;
}
