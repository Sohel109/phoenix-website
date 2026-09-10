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
            <div className="mb-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bell size={20} className="text-orange-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Espace Suivi</span>
                    </div>
                    <h1 className="text-3xl font-black text-white">Centre de Notifications</h1>
                    <p className="text-white/50 text-sm mt-1">
                        Suivez en direct l'état de validation de vos séances de tutorat et de vos présences aux événements.
                    </p>
                </div>

                {unreadCount > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={markAllAsRead}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/10 transition-all self-start sm:self-auto"
                    >
                        <Check size={16} />
                        Tout marquer comme lu
                    </motion.button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        onClick={() => setSelectedTab('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedTab === 'all'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        Toutes ({notifications.length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('seance')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedTab === 'seance'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        Séances ({notifications.filter(n => n.category === 'seance').length})
                    </button>
                    <button
                        onClick={() => setSelectedTab('event')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            selectedTab === 'event'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        Événements ({notifications.filter(n => n.category === 'event').length})
                    </button>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold text-white/70 cursor-pointer pr-2">
                    <input
                        type="checkbox"
                        checked={onlyUnread}
                        onChange={(e) => setOnlyUnread(e.target.checked)}
                        className="rounded bg-white/10 border-white/20 text-orange-500 focus:ring-0 cursor-pointer"
                    />
                    Non lues uniquement ({unreadCount})
                </label>
            </div>

            {/* Notification List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white/5 border border-white/10">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-3">
                            <Bell size={28} />
                        </div>
                        <p className="text-white font-bold text-base">Aucune notification à afficher</p>
                        <p className="text-white/40 text-xs mt-1 max-w-sm">
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
                                className={`p-4 md:p-5 rounded-xl border transition-all ${
                                    notif.read
                                        ? 'bg-white/[0.03] border-white/5 opacity-75'
                                        : 'bg-white/[0.08] border-white/15 shadow-md'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        {/* Status Icon */}
                                        <div className="mt-1 shrink-0">
                                            {notif.status === 'success' && (
                                                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                    <CheckCircle2 size={20} />
                                                </div>
                                            )}
                                            {notif.status === 'error' && (
                                                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                                                    <XCircle size={20} />
                                                </div>
                                            )}
                                            {notif.status === 'warning' && (
                                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                                    <AlertTriangle size={20} />
                                                </div>
                                            )}
                                            {notif.status === 'info' && (
                                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                    {notif.category === 'event' ? <Sparkles size={20} /> : <Clock size={20} />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/60">
                                                    {notif.category === 'event' ? 'Événement' : 'Séance'}
                                                </span>
                                                {notif.dateLabel && (
                                                    <span className="text-xs text-white/40 font-medium">
                                                        {notif.dateLabel}
                                                    </span>
                                                )}
                                                {!notif.read && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                        Non lue
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-base font-bold text-white leading-tight">
                                                {notif.title}
                                            </h2>
                                            <p className="text-xs md:text-sm text-white/60 mt-1 leading-relaxed max-w-2xl">
                                                {notif.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0">
                                        {!notif.read && (
                                            <button
                                                type="button"
                                                onClick={() => markAsRead(notif.id)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                                title="Marquer comme lu"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleNavigate(notif)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-sm"
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
