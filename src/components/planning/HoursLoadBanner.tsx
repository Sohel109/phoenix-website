import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanning } from '../../context/PlanningContext';

/**
 * Prévient que les heures manuelles n'ont pas pu être lues (script pas à jour, réseau, session expirée) : les pages
 * restent utilisables mais comptent alors zéro heure manuelle. Une session expirée propose de se reconnecter.
 */
export function HoursLoadBanner() {
    const { hoursLoadError, hoursLoadCode, logout } = usePlanning();
    const navigate = useNavigate();
    if (!hoursLoadError) return null;

    const reconnect = () => {
        logout();
        navigate('/planning/login');
    };

    return (
        <div role="status" className="mb-4 px-4 py-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" />
                <span>{hoursLoadError} Les heures manuelles ne sont pas comptées pour le moment.</span>
            </span>
            {hoursLoadCode === 'unauthenticated' && (
                <button type="button" onClick={reconnect} className="btn-phoenix-gradient min-h-[44px] px-4 py-2 rounded-full text-white font-school uppercase tracking-wider text-xs cursor-pointer">
                    Se reconnecter
                </button>
            )}
        </div>
    );
}
