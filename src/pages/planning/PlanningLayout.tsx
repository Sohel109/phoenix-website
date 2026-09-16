import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, CalendarCheck, Bell, Calendar, Clock, UserCheck, Globe } from 'lucide-react';
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
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { unreadCount } = usePlanningNotifications();

    const handleLogout = () => {
        logout();
        navigate('/planning/login');
    };

    const quickLinks = [
        { label: 'Tableau de bord', path: '/planning', icon: CalendarCheck },
        { label: 'Mes disponibilités', path: '/planning/disponibilites', icon: Calendar },
        { label: 'Horaire', path: '/planning/horaire', icon: Clock },
        { label: 'Mon compte', path: '/planning/compte', icon: UserCheck },
    ];

    return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-100">
            {/* Top bar */}
            <header 
                className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md"
                style={{ paddingTop: 'calc(max(0.6rem, env(safe-area-inset-top, 0px)) + 0.2rem)' }}
            >
                <div className="container mx-auto px-4 pb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <Link
                                to={backTo}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                                title="Retour"
                            >
                                <ChevronLeft size={18} />
                            </Link>
                        )}

                        <Link to="/planning" className="flex items-center gap-2 group">
                            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 group-hover:scale-105 transition-transform">
                                <CalendarCheck size={16} />
                            </div>
                            <span translate="no" className="notranslate font-black text-sm sm:text-base text-white uppercase tracking-tight">
                                Phoenix <span className="text-orange-400">Planning</span>
                            </span>
                        </Link>
                        {title && (
                            <>
                                <span className="text-slate-600 text-sm">/</span>
                                <span className="text-slate-300 text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-none">{title}</span>
                            </>
                        )}
                    </div>

                    {/* Quick navigation links on medium+ screens */}
                    <nav className="hidden md:flex items-center gap-1">
                        {quickLinks.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                                >
                                    <item.icon size={13} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Always visible button to return to public site WITHOUT logging out */}
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 hover:text-orange-300 transition-colors text-xs sm:text-sm font-bold border border-orange-500/30 shadow-xs"
                            title="Quitter l'espace membre et revenir au site public (sans vous déconnecter)"
                        >
                            <Globe size={14} />
                            <span>Site public</span>
                        </Link>

                        {currentUser && (
                            <>
                                {/* Notification Bell Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsDrawerOpen(true)}
                                    className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/60"
                                    title="Notifications"
                                >
                                    <Bell size={16} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-xs sm:text-sm font-bold text-white leading-tight">{currentUser.name}</span>
                                    <span className="text-[11px] text-orange-400 font-semibold capitalize">
                                        {currentUser.role === 'bureau' ? 'Bureau' : currentUser.role === 'chef_projet' ? 'Chef de Projet' : 'Tuteur'}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors text-xs sm:text-sm border border-slate-700/60"
                                    title="Se déconnecter"
                                >
                                    <LogOut size={14} />
                                    <span className="hidden sm:block">Déconnexion</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Notification Drawer */}
            <PlanningNotificationsDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
            />

            {/* Content */}
            <main 
                className="pb-16 px-4 max-w-5xl mx-auto"
                style={{ paddingTop: 'calc(max(4.5rem, env(safe-area-inset-top, 0px) + 3.8rem))' }}
            >
                {children}
            </main>
        </div>
    );
}
