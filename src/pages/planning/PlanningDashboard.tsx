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
    badge?: number;
    chefOnly?: boolean;
    bureauOnly?: boolean;
}

const cards: DashCard[] = [
    {
        icon: <Calendar size={26} />,
        label: 'Mes disponibilités',
        description: 'Gérez vos créneaux semaine par semaine',
        to: '/planning/disponibilites',
        gradient: 'from-[#EC602B] to-[#F1885C]',
    },
    {
        icon: <CalendarCheck size={26} />,
        label: 'Horaire',
        description: 'Visualisez votre planning de la semaine',
        to: '/planning/horaire',
        gradient: 'from-[#6F2B75] to-[#EC602B]',
    },
    {
        icon: <Sparkles size={26} />,
        label: 'Mes événements',
        description: 'Présence SimONU, JEDC, Olympiades...',
        to: '/planning/mes-evenements',
        gradient: 'from-[#83338A] to-[#EC602B]',
    },
    {
        icon: <Bell size={26} />,
        label: 'Notifications',
        description: 'Suivi des validations & présences',
        to: '/planning/notifications',
        gradient: 'from-[#EC602B] to-[#F29C38]',
    },
    {
        icon: <User size={26} />,
        label: 'Mon compte',
        description: 'Vos heures, absences et statistiques',
        to: '/planning/compte',
        gradient: 'from-[#6F2B75] to-[#A043A8]',
    },
    {
        icon: <CheckSquare size={26} />,
        label: 'Valider les présences',
        description: 'Confirmez les présences de vos tuteurs',
        to: '/planning/validation',
        gradient: 'from-[#2E7D32] to-[#4CAF50]',
        chefOnly: true,
    },
    {
        icon: <FileText size={26} />,
        label: 'Récapitulatif des heures',
        description: 'Bilan et export des heures validées',
        to: '/planning/recap',
        gradient: 'from-[#1976D2] to-[#42A5F5]',
        chefOnly: true,
    },
    {
        icon: <CheckSquare size={26} />,
        label: 'Validation Événements',
        description: 'Présences SimONU, JEDC, Olympiades...',
        to: '/planning/events',
        gradient: 'from-[#6F2B75] to-[#3B82F6]',
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
            {/* Welcome banner */}
            <div className="mb-8 pt-2">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-school text-xs uppercase tracking-widest text-[#ECDDFD]/70 font-semibold">
                            Espace Personnel
                        </span>
                        <span className="text-[#EC602B] text-xs">•</span>
                        <span className="font-script text-lg text-[#ECDDFD]/90">
                            Bienvenue
                        </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-3">
                        <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">
                            {currentUser?.name}
                        </h1>
                        <span className="px-3.5 py-1 rounded-full text-xs font-school uppercase tracking-wider bg-[#6F2B75]/40 border border-[#ECDDFD]/30 text-[#ECDDFD]">
                            {isBureau ? 'Membre du Bureau' : isChef ? 'Chef de Projet' : 'Tuteur Actif'}
                        </span>
                    </div>
                </motion.div>

                {/* My projects pills */}
                {myProjects.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <span className="text-xs text-[#ECDDFD]/60 font-school uppercase tracking-wider mr-1">
                            {myProjects.length > 1 ? 'Projets :' : 'Projet :'}
                        </span>
                        {myProjects.map(p => (
                            <span
                                key={p.id}
                                className="px-3.5 py-1 rounded-full text-xs font-school uppercase tracking-wider bg-[#2D0A32]/90 border border-[#6F2B75]/40 text-[#ECDDFD] shadow-sm"
                            >
                                {p.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Notification alert banner if unread */}
            {unreadCount > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 rounded-[2rem] bg-gradient-to-r from-[#EC602B]/20 via-[#6F2B75]/25 to-[#2A082D]/60 border border-[#EC602B]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md shadow-soft"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shrink-0 shadow-soft">
                            <Bell size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white tracking-wide">
                                Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} en attente
                            </p>
                            <p className="text-xs text-[#ECDDFD]/80 mt-0.5">
                                Vérifiez la validation de vos séances ou déclarez vos présences aux événements
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/planning/notifications"
                        className="btn-phoenix-gradient px-5 py-2 rounded-full text-white text-xs font-school uppercase tracking-wider whitespace-nowrap shadow-soft self-end sm:self-center"
                    >
                        Consulter
                    </Link>
                </motion.div>
            )}

            {/* Bento dashboard cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {visibleCards.map((card, i) => (
                    <motion.div
                        key={card.to}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    >
                        <Link
                            to={card.to}
                            className="flex flex-col gap-4 p-6 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 hover:border-[#EC602B]/60 backdrop-blur-md transition-all duration-300 group hover:-translate-y-1 shadow-soft-lg h-full"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${card.gradient} flex items-center justify-center text-white shadow-soft relative group-hover:scale-105 transition-transform duration-300`}>
                                    {card.icon}
                                    {card.badge !== undefined && card.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#EC602B] text-white text-[11px] font-school font-bold flex items-center justify-center border-2 border-[#2D0A32] shadow-sm">
                                            {card.badge > 9 ? '9+' : card.badge}
                                        </span>
                                    )}
                                </div>
                                <div className="w-9 h-9 rounded-full bg-white/5 border border-[#ECDDFD]/10 flex items-center justify-center text-[#ECDDFD]/60 group-hover:text-[#EC602B] group-hover:border-[#EC602B]/40 group-hover:translate-x-0.5 transition-all duration-300">
                                    <ArrowRight size={16} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg tracking-wide group-hover:text-[#ECDDFD] transition-colors">
                                    {card.label}
                                </h3>
                                <p className="text-[#ECDDFD]/70 text-sm mt-1 leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Naviguer vers le site public sans se déconnecter */}
            <div className="mt-8 p-6 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-5 shadow-soft-lg">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shrink-0 shadow-soft">
                        <Globe size={22} />
                    </div>
                    <div>
                        <p className="text-base font-bold text-white tracking-wide">Naviguer sur le site public Phœnix</p>
                        <p className="text-xs text-[#ECDDFD]/70 mt-0.5">Consultez les actualités, projets et documents associatifs tout en restant connecté</p>
                    </div>
                </div>
                <Link
                    to="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white text-xs font-school uppercase tracking-wider transition-all duration-300 border border-[#ECDDFD]/30 hover:border-[#EC602B]/60 shadow-sm whitespace-nowrap"
                >
                    <span>Accéder au site public</span>
                    <ArrowRight size={15} className="text-[#EC602B]" />
                </Link>
            </div>
        </PlanningLayout>
    );
}
