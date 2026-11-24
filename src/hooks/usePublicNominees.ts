import { useEffect, useState } from 'react';
import { fetchPublicNominees } from '../data/planningData';
import { nomineeSpotlight, todayKeyParis, type NomineeSpotlight, type PublicNominees } from '../data/nominees';

// Une seule requête par visite, partagée par le bandeau, l'accueil, le menu et la page Événements.
let pending: Promise<PublicNominees | null> | null = null;
let cached: PublicNominees | null | undefined;

function loadOnce(): Promise<PublicNominees | null> {
    if (!pending) {
        pending = fetchPublicNominees().then((data) => {
            cached = data;
            return data;
        });
    }
    return pending;
}

/** Nommés du site public et ce qu'il faut mettre en avant aujourd'hui (vote en cours, gagnant, ou rien). */
export function usePublicNominees(): { data: PublicNominees | null; spotlight: NomineeSpotlight | null; loading: boolean } {
    const [data, setData] = useState<PublicNominees | null | undefined>(cached);
    useEffect(() => {
        if (cached !== undefined) return;
        let alive = true;
        void loadOnce().then((result) => {
            if (alive) setData(result);
        });
        return () => {
            alive = false;
        };
    }, []);
    const resolved = data ?? null;
    return { data: resolved, spotlight: nomineeSpotlight(resolved, todayKeyParis()), loading: data === undefined };
}
