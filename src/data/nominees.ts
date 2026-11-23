// Fiches des nommés au tuteur du mois : types, validation des réponses du script et calculs purs.
// Aucun import de valeur : ce fichier est testé directement sous Node.

export interface NomineeStat {
    label: string;
    value: string;
}

/** Fiche d'un nommé telle que le script la renvoie (espace membre et site public). */
export interface NomineeProfile {
    displayName: string;
    slug: string;
    accomplishments: string[];
    stats: NomineeStat[];
    photoId: string | null;
    updatedAt: string;
}

export interface PublicNominee extends NomineeProfile {
    isWinner: boolean;
}

export interface PublicNominees {
    monthKey: string | null;
    nominees: PublicNominee[];
}

const isString = (v: unknown): v is string => typeof v === 'string';

function parseStats(raw: unknown): NomineeStat[] | null {
    if (!Array.isArray(raw)) return null;
    const stats: NomineeStat[] = [];
    for (const item of raw) {
        if (typeof item !== 'object' || item === null) return null;
        const { label, value } = item as Record<string, unknown>;
        if (!isString(label) || !isString(value)) return null;
        stats.push({ label, value });
    }
    return stats;
}

/** Valide une fiche ; null si elle est absente ou mal formée. */
export function parseNomineeProfile(raw: unknown): NomineeProfile | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const d = raw as Record<string, unknown>;
    const stats = parseStats(d.stats);
    if (
        !isString(d.displayName) || !isString(d.slug) || !Array.isArray(d.accomplishments) || !d.accomplishments.every(isString) ||
        stats === null || !(d.photoId === null || isString(d.photoId)) || !isString(d.updatedAt)
    ) {
        return null;
    }
    return { displayName: d.displayName, slug: d.slug, accomplishments: d.accomplishments, stats, photoId: d.photoId, updatedAt: d.updatedAt };
}

/** Valide la réponse publique `getNominees`. Une fiche mal formée est écartée ; une réponse d'un autre type donne null. */
export function parseNominees(raw: unknown): PublicNominees | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const d = raw as Record<string, unknown>;
    if (d.success !== true || !(d.monthKey === null || isString(d.monthKey)) || !Array.isArray(d.nominees)) return null;
    const nominees: PublicNominee[] = [];
    for (const item of d.nominees) {
        const profile = parseNomineeProfile(item);
        if (!profile || !profile.photoId) continue;
        nominees.push({ ...profile, isWinner: (item as Record<string, unknown>).isWinner === true });
    }
    return { monthKey: d.monthKey, nominees };
}

const SLUG_MAP: Record<string, string> = { œ: 'oe', æ: 'ae' };

/**
 * Proche de la règle du script (sans accents, minuscules, tirets). Ne sert que pour un candidat sans fiche : dès qu'une
 * fiche existe, le slug vient du script.
 */
export function nomineeSlug(name: string): string {
    const plain = name
        .toLowerCase()
        .replace(/[œæ]/g, (c) => SLUG_MAP[c])
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
    return plain.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'nomme';
}

export const AUTO_STAT_LABELS = ['Projet', 'Heures validées', 'Séances'] as const;

interface StatsInput<S extends { id: string; projectId: number }> {
    userId: string;
    projectIds: number[];
    bookings: { userId: string; slotId: string; weekKey: string; status: string }[];
    manualHours: { userId: string; hours: number; createdAt: string }[];
    slots: S[];
    today: Date;
    weekStart: (weekKey: string) => Date;
    duration: (slot: S) => number;
    projectName: (projectId: number) => string | undefined;
}

/** 1er septembre de l'année scolaire en cours. */
export function schoolYearStart(today: Date): Date {
    const year = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
    return new Date(year, 8, 1);
}

function formatHours(hours: number): string {
    const rounded = Math.round(hours * 10) / 10;
    return `${String(rounded).replace('.', ',')} h`;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Stats préremplies d'une fiche : projet, heures validées et séances depuis le 1er septembre. */
export function computeNomineeStats<S extends { id: string; projectId: number }>(input: StatsInput<S>): NomineeStat[] {
    const start = schoolYearStart(input.today).getTime();
    const slotById = new Map(input.slots.map((s) => [s.id, s]));
    let hours = 0;
    let sessions = 0;
    // Séances par projet, pour mettre en premier celui où le membre vient le plus.
    const sessionsByProject = new Map<number, number>();
    for (const b of input.bookings) {
        if (b.userId !== input.userId || b.status !== 'confirme') continue;
        const slot = slotById.get(b.slotId);
        if (!slot) continue;
        // Une semaine à cheval sur le 1er septembre compte.
        if (input.weekStart(b.weekKey).getTime() + WEEK_MS <= start) continue;
        hours += input.duration(slot);
        sessions += 1;
        sessionsByProject.set(slot.projectId, (sessionsByProject.get(slot.projectId) ?? 0) + 1);
    }
    for (const mh of input.manualHours) {
        if (mh.userId === input.userId && new Date(mh.createdAt).getTime() >= start) hours += mh.hours;
    }
    const bookedProjects = [...sessionsByProject.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
    const projectIds = input.projectIds.length > 0 ? input.projectIds : bookedProjects;
    const names = projectIds.map(input.projectName).filter((n): n is string => Boolean(n));
    // Seulement des noms entiers, dans la limite de 30 caractères d'une stat.
    let projectValue = '';
    for (const name of names) {
        const next = projectValue ? `${projectValue}, ${name}` : name;
        if (next.length > 30) break;
        projectValue = next;
    }
    const stats: NomineeStat[] = [];
    if (projectValue) stats.push({ label: 'Projet', value: projectValue });
    stats.push({ label: 'Heures validées', value: formatHours(hours) });
    stats.push({ label: 'Séances', value: String(sessions) });
    return stats;
}

/** Remplace les lignes automatiques par les valeurs recalculées, en gardant les lignes ajoutées et leur ordre. */
export function mergeAutoStats(current: NomineeStat[], fresh: NomineeStat[]): NomineeStat[] {
    const auto = new Set<string>(AUTO_STAT_LABELS);
    const freshByLabel = new Map(fresh.map((s) => [s.label, s]));
    const used = new Set<string>();
    const merged: NomineeStat[] = [];
    for (const stat of current) {
        if (!auto.has(stat.label)) {
            merged.push(stat);
            continue;
        }
        const replacement = freshByLabel.get(stat.label);
        if (replacement && !used.has(stat.label)) {
            merged.push(replacement);
            used.add(stat.label);
        }
    }
    const missing = fresh.filter((s) => !used.has(s.label));
    return [...missing, ...merged];
}

/** Recadrage centré au format portrait 4:5, sortie de 900 px de large au plus (jamais agrandie). */
export function portraitCrop(width: number, height: number): { sx: number; sy: number; sw: number; sh: number; outW: number; outH: number } {
    const ratio = 4 / 5;
    let sx = 0;
    let sy = 0;
    let sw = width;
    let sh = height;
    if (width / height > ratio) {
        sw = Math.round(height * ratio);
        sx = Math.round((width - sw) / 2);
    } else {
        sh = Math.round(width / ratio);
        sy = Math.round((height - sh) / 2);
    }
    const outW = Math.min(900, sw);
    return { sx, sy, sw, sh, outW, outH: Math.round(outW / ratio) };
}

export function formatNomineeMonth(monthKey: string): string {
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}
