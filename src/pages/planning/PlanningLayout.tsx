import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, CalendarCheck, Bell } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';
import { usePlanningNotifications } from '../../hooks/usePlanningNotifications';
import { PlanningNotificationsDrawer } from '../../components/planning/PlanningNotificationsDrawer';

interface PlanningLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    backTo?: string;
}

export function PlanningLayout({ children, title, showBack = true, backTo = '/planning' }: PlanningLayoutProps) {
    const { currentUser, logout } = usePlanning();
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { unreadCount } = usePlanningNotifications();

    const handleLogout = () => {
        logout();
        navigate('/planning/login');
    };

    return (
        <div className="min-h-screen bg-[#07071a] text-white">
            {/* Top bar */}
            <header 
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 pb-3 bg-[#07071a]/90 backdrop-blur-md border-b border-white/10"
                style={{ paddingTop: 'calc(max(0.75rem, env(safe-area-inset-top, 0px)) + 0.25rem)' }}
            >
                <div className="flex items-center gap-3">
                    {showBack && (
                        <Link
                            to={backTo}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </Link>
                    )}
                    <div className="flex items-center gap-2">
                        <CalendarCheck size={18} className="text-orange-400" />
                        <span translate="no" className="notranslate font-black text-base text-white uppercase tracking-tight">
                            Phoenix <span className="text-orange-400">Planning</span>
                        </span>
                        {title && (
                            <>
                                <span className="text-white/30 text-sm">/</span>
                                <span className="text-white/60 text-sm">{title}</span>
                            </>
                        )}
                    </div>
                </div>

                {currentUser && (
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Notification Bell Button */}
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Notifications"
                        >
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold text-white leading-tight">{currentUser.name}</span>
                            <span className="text-xs text-orange-400 capitalize">
                                {currentUser.role === 'bureau' ? 'Bureau' : currentUser.role === 'chef_projet' ? 'Chef de Projet' : 'Tuteur'}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors text-sm"
                        >
                            <LogOut size={14} />
                            <span className="hidden sm:block">Déconnexion</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Notification Drawer */}
            <PlanningNotificationsDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
            />

            {/* Content */}
            <main 
                className="pb-10 px-4 max-w-4xl mx-auto"
                style={{ paddingTop: 'calc(max(5rem, env(safe-area-inset-top, 0px) + 4rem))' }}
            >
                {children}
            </main>
        </div>
    );
}
