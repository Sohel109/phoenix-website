import type { VoteData } from './planningData';
import { parseNomineeProfile } from './nominees.ts';

/**
 * Valide la réponse du script Google à `getVoteData`. Un script pas encore redéployé répond à côté
 * (par exemple par une réponse de connexion) : on ne doit jamais prendre cela pour des données de vote.
 */
export function parseVoteData(raw: unknown): VoteData | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const d = raw as Record<string, unknown>;
    if (
        d.success !== true ||
        typeof d.monthKey !== 'string' ||
        typeof d.isOpen !== 'boolean' ||
        typeof d.opensOn !== 'string' ||
        typeof d.closesOn !== 'string' ||
        typeof d.nextOpensOn !== 'string' ||
        !Array.isArray(d.candidates)
    ) {
        return null;
    }
    // Un script d'avant les fiches n'envoie pas `profile` : on le ramène à null.
    const data = raw as VoteData;
    const candidates = data.candidates.map((c) => ({ ...c, profile: parseNomineeProfile((c as { profile?: unknown }).profile) }));
    const bureau = data.bureau
        ? { ...data.bureau, members: data.bureau.members.map((m) => ({ ...m, profile: parseNomineeProfile((m as { profile?: unknown }).profile) })) }
        : undefined;
    return { ...data, candidates, ...(bureau ? { bureau } : {}) };
}

/** Permet d'ignorer la réponse d'une requête quand une plus récente a été lancée depuis. */
export function createLatestGate() {
    let latest = 0;
    return {
        next: () => ++latest,
        isLatest: (token: number) => token === latest,
    };
}
