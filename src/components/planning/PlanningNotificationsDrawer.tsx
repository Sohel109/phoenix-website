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
                        className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#1F0422] border-l border-[#6F2B75]/40 z-[101] flex flex-col shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div 
                            className="p-5 border-b border-[#6F2B75]/40 flex items-center justify-between"
                            style={{ paddingTop: 'calc(max(1.25rem, env(safe-area-inset-top, 0px) + 0.5rem))' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shadow-soft shrink-0">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-white tracking-wide">Notifications</h2>
                                        {unreadCount > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-xs font-school font-bold bg-[#EC602B] text-white shadow-soft">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#ECDDFD]/60 mt-0.5">Suivi de vos séances et événements</p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#ECDDFD]/60 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Sub-header / Filter Tabs */}
                        <div className="px-4 py-3 border-b border-[#6F2B75]/30 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 bg-[#2D0A32]/90 p-1 rounded-full border border-[#6F2B75]/40">
                                <button
                                    onClick={() => setSelectedTab('all')}
                                    className={`px-3 py-1 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                                        selectedTab === 'all'
                                            ? 'btn-phoenix-gradient text-white shadow-soft'
                                            : 'text-[#ECDDFD]/60 hover:text-white'
                                    }`}
                                >
                                    Toutes ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setSelectedTab('seance')}
                                    className={`px-3 py-1 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                                        selectedTab === 'seance'
                                            ? 'btn-phoenix-gradient text-white shadow-soft'
                                            : 'text-[#ECDDFD]/60 hover:text-white'
                                    }`}
                                >
                                    Séances
                                </button>
                                <button
                                    onClick={() => setSelectedTab('event')}
                                    className={`px-3 py-1 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                                        selectedTab === 'event'
                                            ? 'btn-phoenix-gradient text-white shadow-soft'
                                            : 'text-[#ECDDFD]/60 hover:text-white'
                                    }`}
                                >
                                    Événements
                                </button>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-[#EC602B] hover:text-orange-300 font-school uppercase tracking-wider transition-colors whitespace-nowrap"
                                >
                                    Tout lu
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-12 h-12 rounded-full bg-[#6F2B75]/30 flex items-center justify-center text-[#ECDDFD]/40 mb-3 shadow-soft">
                                        <Bell size={22} />
                                    </div>
                                    <p className="text-white font-bold text-sm">Aucune notification</p>
                                    <p className="text-[#ECDDFD]/60 text-xs mt-1">Vous êtes à jour sur vos séances et événements.</p>
                                </div>
                            ) : (
                                filteredNotifications.map((notif) => {
                                    return (
                                        <div
                                            key={notif.id}
                                            className={`p-4 rounded-[1.5rem] border transition-all relative ${
                                                notif.read
                                                    ? 'bg-[#2D0A32]/60 border-[#6F2B75]/30 opacity-75'
                                                    : 'bg-[#2D0A32]/95 border-[#EC602B]/40 shadow-soft'
                                            }`}
                                        >
                                            {/* Unread indicator dot */}
                                            {!notif.read && (
                                                <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#EC602B] shadow-soft" />
                                            )}

                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className="mt-0.5 shrink-0">
                                                    {notif.status === 'success' && (
                                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                    )}
                                                    {notif.status === 'error' && (
                                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                                                            <XCircle size={16} />
                                                        </div>
                                                    )}
                                                    {notif.status === 'warning' && (
                                                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                                                            <AlertTriangle size={16} />
                                                        </div>
                                                    )}
                                                    {notif.status === 'info' && (
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                                                            {notif.category === 'event' ? <Sparkles size={16} /> : <Clock size={16} />}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Text info */}
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-[10px] uppercase font-school font-bold tracking-wider text-[#ECDDFD]/60 bg-[#1F0422]/60 px-2 py-0.5 rounded-full border border-[#6F2B75]/30">
                                                            {notif.category === 'event' ? 'Événement' : 'Séance'}
                                                        </span>
                                                        {notif.dateLabel && (
                                                            <>
                                                                <span className="text-[#ECDDFD]/30">·</span>
                                                                <span className="text-[10px] text-[#ECDDFD]/60 font-mono">{notif.dateLabel}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-bold text-white leading-tight tracking-wide">
                                                        {notif.title}
                                                    </h3>
                                                    <p className="text-xs text-[#ECDDFD]/75 mt-1 leading-relaxed">
                                                        {notif.description}
                                                    </p>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNavigate(notif)}
                                                            className="inline-flex items-center gap-1 text-xs font-school uppercase tracking-wider font-bold text-[#EC602B] hover:text-orange-300 transition-colors"
                                                        >
                                                            Consulter
                                                            <ArrowRight size={12} />
                                                        </button>

                                                        {!notif.read && (
                                                            <button
                                                                type="button"
                                                                onClick={() => markAsRead(notif.id)}
                                                                className="inline-flex items-center gap-1 text-xs text-[#ECDDFD]/50 hover:text-white transition-colors"
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
                        <div className="p-4 border-t border-[#6F2B75]/30 bg-[#2D0A32]/60 text-center">
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/planning/notifications');
                                }}
                                className="text-xs text-[#ECDDFD]/70 hover:text-white font-school uppercase tracking-wider transition-colors"
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
