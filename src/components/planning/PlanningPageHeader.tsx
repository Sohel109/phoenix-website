import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PlanningPageHeaderProps {
    /** Icône de la page, la même que sur la carte du tableau de bord. */
    icon: ReactNode;
    /** « Mon activité » ou « Gestion », comme les deux blocs du tableau de bord. */
    section: 'Mon activité' | 'Gestion';
    /** Même nom que la carte du tableau de bord. */
    title: string;
    description?: ReactNode;
    /** Boutons d'action, sous la description. */
    actions?: ReactNode;
}

/** En-tête commun des pages de l'espace membre : même taille de titre, même ligne de description. */
export function PlanningPageHeader({ icon, section, title, description, actions }: PlanningPageHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 pt-2"
        >
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shadow-soft shrink-0">
                        {icon}
                    </span>
                    <span className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">{section}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">{title}</h1>
                {description && <p className="text-[#ECDDFD]/70 text-sm mt-1.5 max-w-2xl leading-relaxed">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2.5 mt-4">{actions}</div>}
        </motion.div>
    );
}
