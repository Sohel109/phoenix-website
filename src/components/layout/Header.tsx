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
                    ? 'bg-[#FFFBF4]/95 backdrop-blur-md shadow-sm border-b border-[#6F2B75]/10 pb-3'
                    : 'bg-[#FFFBF4]/90 backdrop-blur-sm border-b border-[#6F2B75]/5 pb-4'
            }`}
        >
            <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
                {/* Brand / Logo Circulaire Officiel */}
                <Link to="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative">
                        <img
                            src="/logo-badge.jpg"
                            alt="Phœnix Égalité des Chances Logo"
                            className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-full shadow-md border-2 border-white group-hover:scale-105 group-hover:rotate-3 transition-transform"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span translate="no" className="notranslate font-display text-xl sm:text-2xl text-[#2A082D] leading-none">
                            PHŒNIX <span className="bg-gradient-to-r from-[#6F2B75] to-[#EC602B] bg-clip-text text-transparent">EDC</span>
                        </span>
                        <span className="hidden sm:block text-[10px] uppercase font-school font-bold tracking-wider text-[#904990] mt-0.5">
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
                                className={`px-4 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all relative ${
                                    isActive
                                        ? 'text-[#6F2B75] bg-[#ECDDFD] font-bold shadow-xs'
                                        : 'text-[#2A082D] hover:text-[#EC602B] hover:bg-[#ECDDFD]/40'
                                }`}
                            >
                                {link.label}
                                {isActive && (
                                    <motion.span
                                        layoutId="activeNavIndicator"
                                        className="absolute bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-[#6F2B75] to-[#EC602B] rounded-full"
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
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#2A082D] text-xs font-bold border border-[#6F2B75]/20 hover:border-[#6F2B75]/50 transition-all shadow-xs group"
                            title={`Connecté : ${currentUser.name} (Espace Membre)`}
                        >
                            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                {currentUser.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="max-w-[110px] truncate">{currentUser.name.split(' ')[0]}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </Link>
                    ) : (
                        <Link
                            to="/planning/login"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#6F2B75] hover:text-[#2A082D] hover:bg-[#ECDDFD]/50 text-xs font-bold border border-[#6F2B75]/20 transition-all shadow-xs"
                            title="Accéder à l'Espace Membre"
                        >
                            <User size={13} className="text-[#904990]" />
                            <span>Espace Membre</span>
                        </Link>
                    )}

                    {/* Faire un don (Gradient Pilule CTA) */}
                    <a
                        href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-phoenix-gradient px-4 py-2 rounded-full text-xs"
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
                        className="sm:hidden btn-phoenix-gradient px-3 py-1.5 rounded-full text-xs"
                    >
                        <Heart size={12} fill="currentColor" />
                        <span>Don</span>
                    </a>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-full bg-white border border-[#6F2B75]/20 hover:bg-[#ECDDFD] text-[#2A082D] transition-colors cursor-pointer shadow-xs"
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
                        className="lg:hidden border-t border-[#6F2B75]/10 bg-[#FFFBF4]/98 backdrop-blur-xl px-4 pt-3 pb-6 shadow-xl overflow-hidden max-h-[calc(100vh-6rem-env(safe-area-inset-top,0px))] overflow-y-auto"
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
                                        className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-between ${
                                            isActive
                                                ? 'text-[#6F2B75] bg-[#ECDDFD] font-bold'
                                                : 'text-[#2A082D] hover:text-[#EC602B] hover:bg-[#ECDDFD]/50'
                                        }`}
                                    >
                                        <span>{link.label}</span>
                                        {isActive && <span className="w-2 h-2 rounded-full bg-[#EC602B]" />}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-3 border-t border-[#6F2B75]/10 flex flex-col gap-2.5">
                            {currentUser ? (
                                <Link
                                    to="/planning"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[#6F2B75]/20 bg-white text-[#2A082D] text-xs font-bold hover:bg-[#ECDDFD]/50 transition-colors"
                                >
                                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                        {currentUser.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span>Espace Membre ({currentUser.name.split(' ')[0]})</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </Link>
                            ) : (
                                <Link
                                    to="/planning/login"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[#6F2B75]/20 text-[#6F2B75] bg-white hover:bg-[#ECDDFD]/50 text-xs font-bold transition-colors"
                                >
                                    <User size={14} className="text-[#904990]" />
                                    <span>Accéder à l'Espace Membre</span>
                                </Link>
                            )}

                            <a
                                href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full btn-phoenix-gradient py-3 rounded-full text-sm"
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
