/**
 * Séances exceptionnelles : fusionne les séances régulières (règles fixes par projet) avec les ajouts et annulations
 * faits à une date précise. Module pur : aucun accès au contexte ni au réseau.
 */
import type { DayOfWeek } from './planningData';

export interface SessionChange {
    id: string;
    kind: 'ajout' | 'annulation';
    projectId: number;
    /** yyyy-MM-dd */
    date: string;
    /** HH:MM, vide pour une annulation */
    startTime: string;
    endTime: string;
    /** Ajout : identifiant de la séance ajoutée. Annulation : créneau régulier visé. */
    slotId: string;
}

export interface SessionSlot {
    id: string;
    projectId: number;
    day: DayOfWeek;
    startTime: string;
    endTime: string;
    /** Présent seulement pour une séance ajoutée. */
    date?: string;
}

type IsActive = (slotId: string, weekKey: string) => boolean;

const DAYS: DayOfWeek[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

/** Date UTC du jour `yyyy-MM-dd`, ou null si ce n'est pas une vraie date. */
function parseDate(date: string): Date | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) return null;
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]) ? d : null;
}

export function weekKeyOfDate(date: string): string | null {
    const d = parseDate(date);
    if (!d) return null;
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day); // jeudi de la semaine ISO
    const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function dayOfDate(date: string): DayOfWeek | null {
    const d = parseDate(date);
    if (!d) return null;
    const index = (d.getUTCDay() + 6) % 7; // lundi = 0
    return DAYS[index] ?? null; // dimanche : null
}

export function parseSessionChanges(raw: unknown): SessionChange[] {
    if (!Array.isArray(raw)) return [];
    const out: SessionChange[] = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const r = item as Record<string, unknown>;
        const kind = r.kind;
        const projectId = Number(r.projectId);
        if ((kind !== 'ajout' && kind !== 'annulation') || !Number.isFinite(projectId)) continue;
        if (typeof r.id !== 'string' || typeof r.slotId !== 'string' || !r.slotId || typeof r.date !== 'string') continue;
        if (weekKeyOfDate(r.date) === null) continue;
        out.push({
            id: r.id,
            kind,
            projectId,
            date: r.date,
            startTime: typeof r.startTime === 'string' ? r.startTime : '',
            endTime: typeof r.endTime === 'string' ? r.endTime : '',
            slotId: r.slotId,
        });
    }
    return out;
}

export function extraSlots(changes: SessionChange[]): SessionSlot[] {
    const slots: SessionSlot[] = [];
    for (const c of changes) {
        if (c.kind !== 'ajout') continue;
        const day = dayOfDate(c.date);
        if (!day) continue;
        slots.push({ id: c.slotId, projectId: c.projectId, day, startTime: c.startTime, endTime: c.endTime, date: c.date });
    }
    return slots;
}

function cancellationFor(changes: SessionChange[], slotId: string, weekKey: string): SessionChange | undefined {
    return changes.find((c) => c.kind === 'annulation' && c.slotId === slotId && weekKeyOfDate(c.date) === weekKey);
}

/** Séances d'une semaine : règles actives moins les annulées, plus les séances ajoutées dans cette semaine. */
export function slotsForWeek<S extends SessionSlot>(regular: S[], changes: SessionChange[], weekKey: string, isActive: IsActive): SessionSlot[] {
    const kept = regular.filter((s) => isActive(s.id, weekKey) && !cancellationFor(changes, s.id, weekKey));
    const added = extraSlots(changes).filter((s) => weekKeyOfDate(s.date ?? '') === weekKey);
    return [...kept, ...added];
}

/** Séances régulières normalement prévues cette semaine mais annulées (pour proposer de les rétablir). */
export function cancelledForWeek<S extends SessionSlot>(regular: S[], changes: SessionChange[], weekKey: string, isActive: IsActive): { slot: S; change: SessionChange }[] {
    const out: { slot: S; change: SessionChange }[] = [];
    for (const slot of regular) {
        if (!isActive(slot.id, weekKey)) continue;
        const change = cancellationFor(changes, slot.id, weekKey);
        if (change) out.push({ slot, change });
    }
    return out;
}

export function findSlot<S extends SessionSlot>(regular: S[], changes: SessionChange[], slotId: string): SessionSlot | undefined {
    return regular.find((s) => s.id === slotId) ?? extraSlots(changes).find((s) => s.id === slotId);
}
