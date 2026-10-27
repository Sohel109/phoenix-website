import type { VoteData } from './planningData';

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
    return raw as VoteData;
}

/** Permet d'ignorer la réponse d'une requête quand une plus récente a été lancée depuis. */
export function createLatestGate() {
    let latest = 0;
    return {
        next: () => ++latest,
        isLatest: (token: number) => token === latest,
    };
}
