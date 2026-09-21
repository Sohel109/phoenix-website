import { usePlanning } from '../../context/PlanningContext';
import { Edit3, X, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function EditModeIndicator() {
    const { isEditModeActive, toggleEditMode } = usePlanning();

    if (!isEditModeActive) return null;

    return (
        <aside
            role="complementary"
            aria-label="Statut du mode édition bureau"
            className="fixed top-20 right-4 z-50 animate-bounce-subtle"
        >
            <div className="bg-[#2A082D]/95 backdrop-blur-md border border-emerald-400/50 shadow-glow-orange rounded-full pl-3.5 pr-2 py-1.5 flex items-center gap-2.5 text-white text-xs font-school font-bold tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="flex items-center gap-1.5">
                    <Edit3 size={13} className="text-emerald-300" />
                    <span>Mode Édition Actif</span>
                </span>

                <Link
                    to="/planning/compte"
                    className="p-1 rounded-full hover:bg-white/10 text-[#ECDDFD]/70 hover:text-white transition-colors"
                    title="Paramètres de modification dans Mon Compte"
                    aria-label="Ouvrir les paramètres de mon compte"
                >
                    <Settings size={13} />
                </Link>

                <button
                    type="button"
                    onClick={toggleEditMode}
                    className="w-5 h-5 rounded-full bg-white/10 hover:bg-red-500/80 text-white/80 hover:text-white flex items-center justify-center transition-colors shrink-0"
                    title="Désactiver le Mode Édition"
                    aria-label="Désactiver le Mode Édition"
                >
                    <X size={12} />
                </button>
            </div>
        </aside>
    );
}
