import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { fetchVoteData, type VoteData } from '../data/planningData';
import { createLatestGate } from '../data/voteResponse';

type VoteResult = Awaited<ReturnType<typeof fetchVoteData>>;

export function useVoteData() {
    const { currentUser } = usePlanning();
    const userId = currentUser?.id;
    const [data, setData] = useState<VoteData | null>(null);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState<string | null>(null);
    // Les réponses d'Apps Script n'arrivent pas forcément dans l'ordre : seule la dernière requête compte.
    const gate = useRef(createLatestGate());

    const apply = useCallback((result: VoteResult) => {
        if (result.ok) {
            setData(result.data);
            setError(null);
        } else {
            setError(result.message);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userId) return;
        const latest = gate.current;
        const token = latest.next();
        void fetchVoteData(userId).then((result) => {
            if (latest.isLatest(token)) apply(result);
        });
        return () => {
            // Invalide la requête en vol (changement de compte ou démontage).
            latest.next();
        };
    }, [userId, apply]);

    /** Recharge sans vider `data`, pour éviter tout clignotement après une action. */
    const reload = useCallback(async () => {
        if (!userId) return;
        const token = gate.current.next();
        setLoading(true);
        const result = await fetchVoteData(userId);
        if (gate.current.isLatest(token)) apply(result);
    }, [userId, apply]);

    return { data, loading, error, reload };
}
