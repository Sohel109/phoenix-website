import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, CalendarCheck } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';

interface PlanningLayoutProps {
    children: React.ReactNode;
    title?: string;
    showBack?: boolean;
    backTo?: string;
}

export function PlanningLayout({ children, title, showBack = true, backTo = '/planning' }: PlanningLayoutProps) {
    const { currentUser, logout } = usePlanning();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/planning/login');
    };

    return (
        <div className="min-h-screen bg-[#07071a] text-white">
            {/* Top bar */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#07071a]/80 backdrop-blur-xl border-b border-white/10">
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
                        <span className="font-black text-base bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-violet-500 uppercase tracking-tight">
                            Phoenix Planning
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
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-semibold text-white leading-tight">{currentUser.name}</span>
                            <span className="text-xs text-orange-400 capitalize">
                                {currentUser.role === 'chef_projet' ? 'Chef de Projet' : 'Tuteur'}
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

            {/* Content */}
            <main className="pt-20 pb-10 px-4 max-w-4xl mx-auto">
                {children}
            </main>
        </div>
    );
}
