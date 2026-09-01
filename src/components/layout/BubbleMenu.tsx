import { motion } from 'framer-motion';
import { Home, FolderOpen, Calendar, Users, FileText, Mail, Heart, Map, CalendarCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

type TooltipState = { label: string; x: number; y: number } | null;

export function BubbleMenu() {
    const { t } = useTranslation();
    const location = useLocation();
    const { theme } = useTheme();
    const [tooltip, setTooltip] = useState<TooltipState>(null);
    const [isHeroSection, setIsHeroSection] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const menuItems = [
        { label: t('nav.home'), path: '/', icon: Home },
        { label: t('nav.projects'), path: '/projets', icon: FolderOpen },
        { label: t('nav.map'), path: '/carte-des-projets', icon: Map },
        { label: t('nav.events'), path: '/evenements', icon: Calendar },
        { label: t('nav.partners'), path: '/partenaires', icon: Users },
        { label: t('nav.documents'), path: '/documents', icon: FileText },
        { label: t('nav.contact'), path: '/contact', icon: Mail },
        { label: 'Planning', path: '/planning', icon: CalendarCheck },
    ];

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (location.pathname === '/') {
                const heroHeight = window.innerHeight * 0.9;
                setIsHeroSection(window.scrollY < heroHeight - 100);
            } else {
                setIsHeroSection(false);
            }
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    const dockTheme = isHeroSection ? 'dark' : theme;
    const isDarkStyle = dockTheme === 'dark';

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, label: string) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            label,
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top),
        });
    };

    const handleMouseLeave = () => setTooltip(null);

    return (
        <>
            {/* Tooltip portal — rendered directly into body, outside any transform context */}
            {!isMobile && tooltip && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        left: tooltip.x,
                        top: tooltip.y - 12,
                        transform: 'translate(-50%, -100%)',
                        zIndex: 99999,
                        pointerEvents: 'none',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        className={clsx(
                            'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-xl border',
                            isDarkStyle
                                ? 'bg-neutral-900 text-white border-white/20'
                                : 'bg-white text-gray-900 border-gray-200 shadow-gray-200/80'
                        )}
                    >
                        {tooltip.label}
                        {/* Arrow */}
                        <div
                            className={clsx(
                                'absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-l border-b w-2.5 h-2.5 rotate-[-45deg]',
                                isDarkStyle
                                    ? 'bg-neutral-900 border-white/20'
                                    : 'bg-white border-gray-200'
                            )}
                        />
                    </motion.div>
                </div>,
                document.body
            )}

            <div
                className="fixed left-1/2 -translate-x-1/2 z-[1000] max-w-[95vw] md:max-w-none"
                style={{ bottom: `calc(1.5rem + env(safe-area-inset-bottom, 0px))` }}
            >
                <motion.div
                    className={clsx(
                        'flex items-center gap-1 md:gap-2 p-1 md:p-2 rounded-full shadow-2xl ring-1 transition-colors duration-500',
                        isDarkStyle
                            ? 'bg-white/10 backdrop-blur-xl border border-white/20 ring-black/5'
                            : 'bg-white/80 backdrop-blur-xl border border-white/40 ring-black/5 shadow-black/5'
                    )}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                    {menuItems.map((item) => {
                        const isActive =
                            item.path === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                                onMouseLeave={handleMouseLeave}
                                className="block shrink-0"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.92 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    className={clsx(
                                        'flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full transition-colors duration-200',
                                        isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : isDarkStyle
                                            ? 'text-gray-300 hover:text-white hover:bg-white/20'
                                            : 'text-gray-600 hover:text-black hover:bg-black/10'
                                    )}
                                >
                                    <item.icon strokeWidth={2} className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                                </motion.div>
                            </Link>
                        );
                    })}

                    {/* Separator */}
                    <div
                        className={clsx(
                            'w-px h-6 md:h-8 mx-0.5 md:mx-1 transition-colors duration-500',
                            isDarkStyle ? 'bg-white/10' : 'bg-black/10'
                        )}
                    />

                    {/* Donate Button */}
                    <motion.a
                        href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="menu-heart"
                        onMouseEnter={(e) => handleMouseEnter(e, 'Faire un don')}
                        onMouseLeave={handleMouseLeave}
                        className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 shrink-0"
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        whileTap={{ scale: 0.92 }}
                    >
                        <Heart fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.a>
                </motion.div>
            </div>
        </>
    );
}
