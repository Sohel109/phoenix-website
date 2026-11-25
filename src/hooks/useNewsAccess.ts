import { useEffect, useState } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { newsAccessApi } from '../data/planningData';

// Une question au script par membre et par chargement de l'application.
const checks = new Map<string, Promise<boolean>>();

/** Le membre connecté peut-il publier des actualités ? Le Bureau toujours ; les autres selon la liste du Bureau. */
export function useNewsAccess(): { canPublish: boolean; loading: boolean } {
    const { currentUser } = usePlanning();
    const isBureau = currentUser?.role === 'bureau';
    const userId = currentUser?.id ?? '';
    const token = currentUser?.token ?? '';
    const [state, setState] = useState<{ userId: string; canPublish: boolean } | null>(null);

    useEffect(() => {
        if (!userId || isBureau || !token) return;
        let alive = true;
        if (!checks.has(userId)) checks.set(userId, newsAccessApi(userId, token).then((r) => r?.canPublish === true));
        void checks.get(userId)!.then((canPublish) => {
            if (alive) setState({ userId, canPublish });
        });
        return () => {
            alive = false;
        };
    }, [userId, isBureau, token]);

    if (isBureau) return { canPublish: true, loading: false };
    if (!userId || !token) return { canPublish: false, loading: false };
    if (state?.userId !== userId) return { canPublish: false, loading: true };
    return { canPublish: state.canPublish, loading: false };
}
