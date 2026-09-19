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
        <div className="min-h-screen bg-[#1F0422] text-[#FFFBF4] bg-bird-pattern-dark relative selection:bg-[#EC602B]/30 selection:text-white">
            {/* Top bar */}
            <header 
                className="fixed top-0 left-0 right-0 z-50 bg-[#2A082D]/90 backdrop-blur-md border-b border-[#6F2B75]/40 shadow-soft-lg"
                style={{ paddingTop: 'calc(max(0.6rem, env(safe-area-inset-top, 0px)) + 0.2rem)' }}
            >
                <div className="container mx-auto px-4 pb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <Link
                                to={backTo}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] hover:text-white transition-all border border-[#ECDDFD]/20 shadow-xs group"
                                title="Retour"
                            >
                                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                            </Link>
                        )}

                        <Link to="/planning" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center border border-white/20 shadow-soft group-hover:scale-105 transition-transform">
                                <CalendarCheck size={16} />
                            </div>
                            <span translate="no" className="notranslate font-display text-base sm:text-lg text-white tracking-wide">
                                Phoenix <span className="text-[#EC602B]">Planning</span>
                            </span>
                        </Link>
                        {title && (
                            <>
                                <span className="text-[#ECDDFD]/40 text-sm">/</span>
                                <span className="text-[#ECDDFD] text-xs sm:text-sm font-school font-bold uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">{title}</span>
                            </>
                        )}
                    </div>

                    {/* Quick navigation links on medium+ screens */}
                    <nav className="hidden md:flex items-center gap-1.5">
                        {quickLinks.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-school uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-[#6F2B75] to-[#8E3B95] text-white border border-[#ECDDFD]/40 shadow-soft'
                                            : 'text-[#ECDDFD]/75 hover:text-white hover:bg-white/10 border border-transparent'
                                    }`}
                                >
                                    <item.icon size={13} className={isActive ? 'text-[#EC602B]' : ''} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Always visible button to return to public site WITHOUT logging out */}
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 hover:bg-[#6F2B75]/40 text-[#ECDDFD] hover:text-white transition-all text-xs font-school uppercase tracking-wider border border-[#ECDDFD]/30 shadow-xs"
                            title="Quitter l'espace membre et revenir au site public (sans vous déconnecter)"
                        >
                            <Globe size={14} className="text-[#EC602B]" />
                            <span>Site public</span>
                        </Link>

                        {currentUser && (
                            <>
                                {/* Notification Bell Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsDrawerOpen(true)}
                                    className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] hover:text-white transition-all border border-[#ECDDFD]/20 shadow-xs cursor-pointer"
                                    title="Notifications"
                                >
                                    <Bell size={16} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EC602B] text-white text-[10px] font-school font-black flex items-center justify-center shadow-md animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <div className="hidden lg:flex flex-col items-end">
                                    <span className="text-xs sm:text-sm font-bold text-white leading-tight">{currentUser.name}</span>
                                    <span className="text-[10px] text-[#EC602B] font-school font-bold tracking-widest uppercase">
                                        {currentUser.role === 'bureau' ? 'Bureau' : currentUser.role === 'chef_projet' ? 'Chef de Projet' : 'Tuteur'}
                                    </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-[#ECDDFD]/80 transition-all text-xs font-school uppercase tracking-wider border border-white/10 cursor-pointer"
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
                style={{ paddingTop: 'calc(max(6.5rem, env(safe-area-inset-top, 0px) + 5.5rem))' }}
            >
                {children}
            </main>
        </div>
    );
}
