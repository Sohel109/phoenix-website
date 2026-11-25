import { useEffect, useState } from 'react';
import { fetchPublicNews } from '../data/planningData';
import type { PublicNews } from '../data/news';

// Une seule requête par visite, partagée par la page Actualités, l'accueil et le pied de page.
let pending: Promise<PublicNews | null> | null = null;
let cached: PublicNews | null | undefined;

function loadOnce(): Promise<PublicNews | null> {
    if (!pending) {
        pending = fetchPublicNews().then((data) => {
            cached = data;
            return data;
        });
    }
    return pending;
}

/** Actualités publiées et réels du site public. data vaut null si le service ne répond pas. */
export function usePublicNews(): { data: PublicNews | null; loading: boolean } {
    const [data, setData] = useState<PublicNews | null | undefined>(cached);
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
    return { data: data ?? null, loading: data === undefined };
}
