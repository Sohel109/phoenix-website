import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { fetchChildrenData, type ChildrenData } from '../data/planningData';
import { createLatestGate } from '../data/voteResponse';

type ChildrenResult = Awaited<ReturnType<typeof fetchChildrenData>>;

/** `projectId` à null : le script choisit le premier projet accessible. */
export function useChildrenData(projectId: number | null, date: string) {
    const { currentUser } = usePlanning();
    const userId = currentUser?.id;
    // Une session ouverte avant la mise en place des jetons n'en a pas : le script demandera de se reconnecter.
    const token = currentUser?.token ?? '';
    const [data, setData] = useState<ChildrenData | null>(null);
    // Clé de la dernière réponse reçue : tant qu'elle diffère du projet et de la date demandés, `data` est périmé.
    const key = `${projectId ?? 'auto'}|${date}`;
    const [settledKey, setSettledKey] = useState<string | null>(null);
    const [reloading, setReloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    // Les réponses d'Apps Script n'arrivent pas forcément dans l'ordre : seule la dernière requête compte.
    const gate = useRef(createLatestGate());

    const apply = useCallback((result: ChildrenResult, forKey: string) => {
        if (result.ok) {
            setData(result.data);
            setError(null);
            setErrorCode(null);
        } else {
            setError(result.message);
            setErrorCode(result.code ?? null);
        }
        setSettledKey(forKey);
    }, []);

    useEffect(() => {
        if (!userId) return;
        const latest = gate.current;
        const ticket = latest.next();
        void fetchChildrenData(userId, token, projectId, date).then((result) => {
            if (latest.isLatest(ticket)) apply(result, key);
        });
        return () => {
            // Invalide la requête en vol (changement de projet, de date ou de compte, ou démontage).
            latest.next();
        };
    }, [userId, token, projectId, date, key, apply]);

    /** Recharge sans vider `data`, pour éviter tout clignotement après une action. */
    const reload = useCallback(async () => {
        if (!userId) return;
        const ticket = gate.current.next();
        setReloading(true);
        const result = await fetchChildrenData(userId, token, projectId, date);
        if (gate.current.isLatest(ticket)) apply(result, key);
        setReloading(false);
    }, [userId, token, projectId, date, key, apply]);

    const loading = Boolean(userId) && (settledKey !== key || reloading);
    return { data, loading, error, errorCode, reload };
}
