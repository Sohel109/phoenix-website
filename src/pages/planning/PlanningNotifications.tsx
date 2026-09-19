import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Bell, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Clock, 
    ArrowRight, 
    Check, 
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlanningLayout } from './PlanningLayout';
import { usePlanningNotifications } from '../../hooks/usePlanningNotifications';
import type { NotificationCategory, PlanningNotification } from '../../hooks/usePlanningNotifications';

export function PlanningNotifications() {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = usePlanningNotifications();
    const [selectedTab, setSelectedTab] = useState<NotificationCategory>('all');
    const [onlyUnread, setOnlyUnread] = useState(false);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (selectedTab !== 'all' && n.category !== selectedTab) return false;
            if (onlyUnread && n.read) return false;
            return true;
        });
    }, [notifications, selectedTab, onlyUnread]);

    const handleNavigate = (notif: PlanningNotification) => {
        markAsRead(notif.id);
        navigate(notif.to);
    };

    return (
        <PlanningLayout title="Notifications">
            {/* Header */}
            <div className="mb-6 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shadow-soft">
                            <Bell size={15} />
                        </div>
                        <span className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">Espace Suivi</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">Centre de Notifications</h1>
                    <p className="text-[#ECDDFD]/70 text-sm mt-1 max-w-xl leading-relaxed">
                        Suivez en direct l'état de validation de vos séances de tutorat et de vos présences aux événements.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={markAllAsRead}
                        className="btn-phoenix-gradient flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-school text-xs uppercase tracking-wider shadow-soft transition-all self-start sm:self-auto"
                    >
                        <Check size={16} />
                        Tout marquer comme lu
                    </motion.button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-full bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft">
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        onClick={() => setSelectedTab('all')}
                        className={`px-4 py-1.5 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                            selectedTab === 'all'
                                ? 'btn-phoenix-gradient text-white shadow-soft'
                                : 'text-[#ECDDFD]/70 hover:text-white'
                        }`}
                    >
                        Toutes ({notifications.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('seance')}
                        className={`px-4 py-1.5 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                            selectedTab === 'seance'
                                ? 'btn-phoenix-gradient text-white shadow-soft'
                                : 'text-[#ECDDFD]/70 hover:text-white'
                        }`}
                    >
                        Séances ({notifications.filter(n => n.category === 'seance').length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('event')}
                        className={`px-4 py-1.5 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                            selectedTab === 'event'
                                ? 'btn-phoenix-gradient text-white shadow-soft'
                                : 'text-[#ECDDFD]/70 hover:text-white'
                        }`}
                    >
                        Événements ({notifications.filter(n => n.category === 'event').length})
                    </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 cursor-pointer pr-3">
                    <input
                        type="checkbox"
                        checked={onlyUnread}
                        onChange={(e) => setOnlyUnread(e.target.checked)}
                        className="rounded accent-[#EC602B] cursor-pointer"
                    />
                    Non lues uniquement ({unreadCount})
                </label>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30 shadow-soft-lg">
                        <div className="w-16 h-16 rounded-full bg-[#6F2B75]/30 flex items-center justify-center text-[#ECDDFD]/50 mb-3 shadow-soft">
                            <Bell size={28} />
                        </div>
                        <p className="text-white font-bold text-base">Aucune notification à afficher</p>
                        <p className="text-[#ECDDFD]/60 text-xs mt-1 max-w-sm">
                            Toutes vos séances et présences sont à jour pour ces critères de recherche.
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notif, index) => {
                        return (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className={`p-5 sm:p-6 rounded-[2rem] border transition-all backdrop-blur-md shadow-soft-lg ${
                                    notif.read
                                        ? 'bg-[#2D0A32]/60 border-[#6F2B75]/30 opacity-75'
                                        : 'bg-[#2D0A32]/95 border-[#EC602B]/40 shadow-soft'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Status Icon Macaron */}
                                        <div className="mt-0.5 shrink-0">
                                            {notif.status === 'success' && (
                                                <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-soft">
                                                    <CheckCircle2 size={22} />
                                                </div>
                                            )}
                                            {notif.status === 'error' && (
                                                <div className="w-11 h-11 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-soft">
                                                    <XCircle size={22} />
                                                </div>
                                            )}
                                            {notif.status === 'warning' && (
                                                <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-soft">
                                                    <AlertTriangle size={22} />
                                                </div>
                                            )}
                                            {notif.status === 'info' && (
                                                <div className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-soft">
                                                    {notif.category === 'event' ? <Sparkles size={22} /> : <Clock size={22} />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="px-3 py-0.5 rounded-full text-[10px] font-school uppercase tracking-wider bg-[#1F0422]/80 text-[#ECDDFD] border border-[#6F2B75]/40">
                                                    {notif.category === 'event' ? 'Événement' : 'Séance'}
                                                </span>
                                                {notif.dateLabel && (
                                                    <span className="text-xs text-[#ECDDFD]/60 font-mono">
                                                        {notif.dateLabel}
                                                    </span>
                                                )}
                                                {!notif.read && (
                                                    <span className="px-3 py-0.5 rounded-full text-[10px] font-school uppercase tracking-wider bg-[#EC602B]/20 text-[#EC602B] border border-[#EC602B]/30 font-bold">
                                                        Non lue
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-base font-bold text-white leading-tight tracking-wide">
                                                {notif.title}
                                            </h2>
                                            <p className="text-xs md:text-sm text-[#ECDDFD]/75 mt-1 leading-relaxed max-w-2xl">
                                                {notif.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2.5 sm:self-center shrink-0 pt-2 sm:pt-0">
                                        {!notif.read && (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(notif.id)}
                                                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-[#ECDDFD]/60 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                                                title="Marquer comme lu"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleNavigate(notif)}
                                            className="btn-phoenix-gradient flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-school uppercase tracking-wider transition-all shadow-soft"
                                        >
                                            Consulter
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </PlanningLayout>
    );
}
