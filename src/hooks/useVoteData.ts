import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { fetchVoteData, type VoteData } from '../data/planningData';
import { createLatestGate } from '../data/voteResponse';

type VoteResult = Awaited<ReturnType<typeof fetchVoteData>>;

export function useVoteData() {
    const { currentUser } = usePlanning();
    const userId = currentUser?.id;
    // Une session ouverte avant la mise en place des jetons n'en a pas : le script demandera de se reconnecter.
    const token = currentUser?.token ?? '';
    const [data, setData] = useState<VoteData | null>(null);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    // Les réponses d'Apps Script n'arrivent pas forcément dans l'ordre : seule la dernière requête compte.
    const gate = useRef(createLatestGate());

    const apply = useCallback((result: VoteResult) => {
        if (result.ok) {
            setData(result.data);
            setError(null);
            setErrorCode(null);
        } else {
            setError(result.message);
            setErrorCode(result.code ?? null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userId) return;
        const latest = gate.current;
        const ticket = latest.next();
        void fetchVoteData(userId, token).then((result) => {
            if (latest.isLatest(ticket)) apply(result);
        });
        return () => {
            // Invalide la requête en vol (changement de compte ou démontage).
            latest.next();
        };
    }, [userId, token, apply]);

    /** Recharge sans vider `data`, pour éviter tout clignotement après une action. */
    const reload = useCallback(async () => {
        if (!userId) return;
        const ticket = gate.current.next();
        setLoading(true);
        const result = await fetchVoteData(userId, token);
        if (gate.current.isLatest(ticket)) apply(result);
    }, [userId, token, apply]);

    return { data, loading, error, errorCode, reload };
}
