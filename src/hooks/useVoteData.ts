import { useCallback, useEffect, useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { fetchVoteData, type VoteData } from '../data/planningData';

type VoteResult = Awaited<ReturnType<typeof fetchVoteData>>;

export function useVoteData() {
    const { currentUser } = usePlanning();
    const userId = currentUser?.id;
    const [data, setData] = useState<VoteData | null>(null);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState<string | null>(null);

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
        let cancelled = false;
        void fetchVoteData(userId).then((result) => {
            if (!cancelled) apply(result);
        });
        return () => {
            cancelled = true;
        };
    }, [userId, apply]);

    /** Recharge sans vider `data`, pour éviter tout clignotement après une action. */
    const reload = useCallback(async () => {
        if (!userId) return;
        apply(await fetchVoteData(userId));
    }, [userId, apply]);

    return { data, loading, error, reload };
}
