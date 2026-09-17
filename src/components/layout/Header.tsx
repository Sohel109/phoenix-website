import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, User, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanning } from '../../context/PlanningContext';

export function Header() {
    const location = useLocation();
    const { currentUser } = usePlanning();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Hide public header on planning pages (they use PlanningLayout)
    const isPlanning = location.pathname.startsWith('/planning');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    const [prevPathname, setPrevPathname] = useState(location.pathname);
    if (location.pathname !== prevPathname) {
        setPrevPathname(location.pathname);
        setIsMobileMenuOpen(false);
    }

    if (isPlanning) return null;

    const navLinks = [
        { label: 'Accueil', path: '/' },
        { label: "L'Association", path: '/association' },
        { label: 'Nos Projets', path: '/projets' },
        { label: 'Événements', path: '/evenements' },
        { label: 'Partenaires', path: '/partenaires' },
        { label: 'Documents', path: '/documents' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <header
            style={{
                paddingTop: `calc(env(safe-area-inset-top, 0px) + ${isScrolled || isMobileMenuOpen ? '0.75rem' : '1rem'})`,
            }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled || isMobileMenuOpen
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 pb-3'
                    : 'bg-white/80 backdrop-blur-sm border-b border-slate-200/40 pb-4'
            }`}
        >
            <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                {/* Brand / Logo */}
                <Link to="/" className="flex items-center gap-3 group shrink-0">
                    <img
                        src="/app-icon.png"
                        alt="Phoenix EDC Logo"
                        className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col">
                        <span translate="no" className="notranslate font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-tight">
                            PHOENIX <span className="text-orange-500">EDC</span>
                        </span>
                        <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            Égalité des Chances · KEDGE BS
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {navLinks.map((link) => {
                        const isActive = link.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(link.path);

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                                    isActive
                                        ? 'text-orange-600 bg-orange-50/80 font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                }`}
                            >
                                {link.label}
                                {isActive && (
                                    <motion.span
                                        layoutId="activeNavIndicator"
                                        className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-orange-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Action Buttons */}
                <div className="hidden sm:flex items-center gap-2.5">
                    {/* User Pill / Espace Membre */}
                    {currentUser ? (
                        <Link
                            to="/planning"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 hover:bg-slate-200 transition-all shadow-xs group"
                            title={`Connecté : ${currentUser.name} (Espace Membre)`}
                        >
                            <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="max-w-[110px] truncate">{currentUser.name.split(' ')[0]}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </Link>
                    ) : (
                        <Link
                            to="/planning/login"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 hover:bg-slate-200 transition-all shadow-xs"
                            title="Accéder à l'Espace Membre"
                        >
                            <User size={13} className="text-slate-500" />
                            <span>Espace Membre</span>
                        </Link>
                    )}

                    {/* Faire un don (Solid Orange CTA) */}
                    <a
                        href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs hover:shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all"
                    >
                        <Heart size={13} fill="currentColor" />
                        <span>Faire un don</span>
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex items-center gap-2 lg:hidden">
                    <a
                        href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs shadow-xs"
                    >
                        <Heart size={12} fill="currentColor" />
                        <span>Don</span>
                    </a>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        id="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 shadow-xl overflow-hidden max-h-[calc(100vh-6rem-env(safe-area-inset-top,0px))] overflow-y-auto"
                    >
                        <div className="flex flex-col gap-1 mb-4">
                            {navLinks.map((link) => {
                                const isActive = link.path === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(link.path);

                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                                            isActive
                                                ? 'text-orange-600 bg-orange-50 font-bold'
                                                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span>{link.label}</span>
                                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-3 border-t border-slate-200 flex flex-col gap-2.5">
                            {currentUser ? (
                                <Link
                                    to="/planning"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-slate-200 bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors"
                                >
                                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {currentUser.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span>Espace Membre ({currentUser.name.split(' ')[0]})</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </Link>
                            ) : (
                                <Link
                                    to="/planning/login"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-slate-200 text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors"
                                >
                                    <User size={14} className="text-slate-500" />
                                    <span>Accéder à l'Espace Membre</span>
                                </Link>
                            )}

                            <a
                                href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-sm"
                            >
                                <Heart size={15} fill="currentColor" />
                                <span>Faire un don pour nos actions</span>
                                <ExternalLink size={14} className="opacity-70" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
