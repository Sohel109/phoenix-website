import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CalendarCheck, User, CheckSquare, FileText, Sparkles, Bell, Globe, ArrowRight } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { usePlanningNotifications } from '../../hooks/usePlanningNotifications';
import { projectsData } from '../../data/projectsData';

interface DashCard {
    icon: React.ReactNode;
    label: string;
    description: string;
    to: string;
    gradient: string;
    shadow: string;
    badge?: number;
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
        icon: <Sparkles size={28} />,
        label: 'Mes événements',
        description: 'Présence SimONU, JEDC, Olympiades...',
        to: '/planning/mes-evenements',
        gradient: 'from-amber-500 to-orange-600',
        shadow: 'shadow-orange-500/30',
    },
    {
        icon: <Bell size={28} />,
        label: 'Notifications',
        description: 'Suivi des validations & présences',
        to: '/planning/notifications',
        gradient: 'from-orange-500 to-amber-600',
        shadow: 'shadow-orange-500/30',
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
    const { unreadCount } = usePlanningNotifications();
    const isChef = currentUser?.role === 'chef_projet';
    const isBureau = currentUser?.role === 'bureau';

    const myProjects = projectsData.filter(p => currentUser?.projectIds.includes(p.id));

    const visibleCards = cards.filter(c => {
        if (c.bureauOnly) return isBureau;
        if (c.chefOnly) return isChef || isBureau;
        return true;
    }).map(c => {
        if (c.to === '/planning/notifications') {
            return { ...c, badge: unreadCount };
        }
        return c;
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
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-primary/20 border border-primary/30 text-orange-400">
                        {isBureau ? 'Bureau' : isChef ? 'Chef de Projet' : 'Tuteur'}
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

            {/* Notification alert banner if unread */}
            {unreadCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                            <Bell size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">
                                Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} en attente
                            </p>
                            <p className="text-xs text-white/60">
                                Vérifiez la validation de vos séances ou déclarez vos présences aux événements
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/planning/notifications"
                        className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
                    >
                        Consulter
                    </Link>
                </motion.div>
            )}

            {/* Dashboard cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleCards.map((card, i) => (
                    <motion.div
                        key={card.to}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 260, damping: 24 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link
                            to={card.to}
                            className={`flex flex-col gap-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group`}
                        >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white relative`}>
                                {card.icon}
                                {card.badge !== undefined && card.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#07071a]">
                                        {card.badge > 9 ? '9+' : card.badge}
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg leading-tight">{card.label}</p>
                                <p className="text-white/50 text-sm mt-1">{card.description}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Naviguer vers le site public sans se déconnecter */}
            <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                        <Globe size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Naviguer sur le site public Phoenix</p>
                        <p className="text-xs text-white/50">Consultez les actualités, projets et documents associatifs tout en restant connecté</p>
                    </div>
                </div>
                <Link
                    to="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold transition-all border border-white/15 hover:border-orange-500/50 shadow-sm whitespace-nowrap"
                >
                    <span>Accéder au site public</span>
                    <ArrowRight size={15} className="text-orange-400" />
                </Link>
            </div>
        </PlanningLayout>
    );
}
