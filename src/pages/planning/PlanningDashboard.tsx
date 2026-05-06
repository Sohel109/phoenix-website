import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CalendarCheck, User, CheckSquare, FileText } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';

interface DashCard {
    icon: React.ReactNode;
    label: string;
    description: string;
    to: string;
    gradient: string;
    shadow: string;
    chefOnly?: boolean;
    bureauOnly?: boolean;
}

const cards: DashCard[] = [
    {
        icon: <Calendar size={28} />,
        label: 'Mes disponibilités',
        description: 'Gérez vos créneaux semaine par semaine',
        to: '/planning/disponibilites',
        gradient: 'from-orange-500 to-pink-600',
        shadow: 'shadow-orange-500/30',
    },
    {
        icon: <CalendarCheck size={28} />,
        label: 'Horaire',
        description: 'Visualisez votre planning de la semaine',
        to: '/planning/horaire',
        gradient: 'from-violet-500 to-purple-700',
        shadow: 'shadow-violet-500/30',
    },
    {
        icon: <User size={28} />,
        label: 'Mon compte',
        description: 'Vos heures, absences et statistiques',
        to: '/planning/compte',
        gradient: 'from-pink-500 to-rose-600',
        shadow: 'shadow-pink-500/30',
    },
    {
        icon: <CheckSquare size={28} />,
        label: 'Valider les présences',
        description: 'Confirmez les présences de vos tuteurs',
        to: '/planning/validation',
        gradient: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/30',
        chefOnly: true,
    },
    {
        icon: <FileText size={28} />,
        label: 'Récapitulatif des heures',
        description: 'Bilan et export des heures validées',
        to: '/planning/recap',
        gradient: 'from-cyan-500 to-blue-600',
        shadow: 'shadow-cyan-500/30',
        chefOnly: true,
    },
    {
        icon: <CheckSquare size={28} />,
        label: 'Validation Événements',
        description: 'Présences SimONU, JEDC, Olympiades...',
        to: '/planning/events',
        gradient: 'from-indigo-500 to-blue-700',
        shadow: 'shadow-indigo-500/30',
        bureauOnly: true,
    },
];

export function PlanningDashboard() {
    const { currentUser } = usePlanning();
    const isChef = currentUser?.role === 'chef_projet';
    const isBureau = currentUser?.role === 'bureau';

    const myProjects = projectsData.filter(p => currentUser?.projectIds.includes(p.id));

    const visibleCards = cards.filter(c => {
        if (c.bureauOnly) return isBureau;
        if (c.chefOnly) return isChef || isBureau;
        return true;
    });

    return (
        <PlanningLayout showBack={false}>
            {/* Welcome */}
            <div className="mb-8 pt-4">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <p className="text-white/50 text-sm mb-1">Bienvenue,</p>
                    <h1 className="text-3xl font-black text-white">{currentUser?.name}</h1>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-violet-600 text-white">
                        {isBureau ? '💎 Bureau' : isChef ? '👑 Chef de Projet' : '📚 Tuteur'}
                    </span>
                </motion.div>

                {/* My projects pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {myProjects.map(p => (
                        <span key={p.id} className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/20 text-white/70">
                            {p.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Dashboard cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleCards.map((card, i) => (
                    <motion.div
                        key={card.to}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to={card.to}
                            className={`flex flex-col gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all shadow-xl ${card.shadow} group`}
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg ${card.shadow} group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg leading-tight">{card.label}</p>
                                <p className="text-white/50 text-sm mt-1">{card.description}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </PlanningLayout>
    );
}
