import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Clock, 
    Bell, 
    Check, 
    ArrowRight, 
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlanningNotifications } from '../../hooks/usePlanningNotifications';
import type { NotificationCategory, PlanningNotification } from '../../hooks/usePlanningNotifications';

interface PlanningNotificationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PlanningNotificationsDrawer({ isOpen, onClose }: PlanningNotificationsDrawerProps) {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = usePlanningNotifications();
    const [selectedTab, setSelectedTab] = useState<NotificationCategory>('all');

    const filteredNotifications = useMemo(() => {
        if (selectedTab === 'all') return notifications;
        return notifications.filter(n => n.category === selectedTab);
    }, [notifications, selectedTab]);

    const handleNavigate = (notif: PlanningNotification) => {
        markAsRead(notif.id);
        onClose();
        navigate(notif.to);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                        className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#0d0d22] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                    <Bell size={16} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-white">Notifications</h2>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500 text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/40">Suivi de vos séances et événements</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Sub-header / Filter Tabs */}
                        <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                                <button
                                    onClick={() => setSelectedTab('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        selectedTab === 'all'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    Toutes ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setSelectedTab('seance')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        selectedTab === 'seance'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    Séances
                                </button>
                                <button
                                    onClick={() => setSelectedTab('event')}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        selectedTab === 'event'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    Événements
                                </button>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors whitespace-nowrap"
                                >
                                    Tout marquer lu
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-3">
                                        <Bell size={24} />
                                    </div>
                                    <p className="text-white/60 font-semibold text-sm">Aucune notification</p>
                                    <p className="text-white/30 text-xs mt-1">Vous êtes à jour sur vos séances et événements.</p>
                                </div>
                            ) : (
                                filteredNotifications.map((notif) => {
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`p-3.5 rounded-xl border transition-all relative ${
                                                notif.read
                                                    ? 'bg-white/[0.03] border-white/5 opacity-70'
                                                    : 'bg-white/[0.08] border-white/15 shadow-sm'
                                            }`}
                                        >
                                            {/* Unread indicator dot */}
                                            {!notif.read && (
                                                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500" />
                                            )}

                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className="mt-0.5 shrink-0">
                                                    {notif.status === 'success' && (
                                                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                    )}
                                                    {notif.status === 'error' && (
                                                        <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                                                            <XCircle size={16} />
                                                        </div>
                                                    )}
                                                    {notif.status === 'warning' && (
                                                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                                            <AlertTriangle size={16} />
                                                        </div>
                                                    )}
                                                    {notif.status === 'info' && (
                                                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                            {notif.category === 'event' ? <Sparkles size={16} /> : <Clock size={16} />}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Text info */}
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                                                            {notif.category === 'event' ? 'Événement' : 'Séance'}
                                                        </span>
                                                        {notif.dateLabel && (
                                                            <>
                                                                <span className="text-white/20">·</span>
                                                                <span className="text-[10px] text-white/40">{notif.dateLabel}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-bold text-white leading-tight">
                                                        {notif.title}
                                                    </h3>
                                                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                                                        {notif.description}
                                                    </p>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNavigate(notif)}
                                                            className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                                                        >
                                                            Consulter
                                                            <ArrowRight size={12} />
                                                        </button>

                                                        {!notif.read && (
                                                            <button
                                                                type="button"
                                                                onClick={() => markAsRead(notif.id)}
                                                                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                                                            >
                                                                <Check size={12} />
                                                                Marquer comme lu
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-white/10 bg-white/[0.02] text-center">
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/planning/notifications');
                                }}
                                className="text-xs text-white/50 hover:text-white font-medium transition-colors"
                            >
                                Voir toutes les notifications en plein écran →
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
