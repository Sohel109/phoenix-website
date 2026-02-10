import { motion } from 'framer-motion';
import { Home, FolderOpen, Calendar, Users, FileText, Mail, Heart, Map } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const menuItems = [
    { label: 'Accueil', path: '/', icon: Home },
    { label: 'Projets', path: '/projets', icon: FolderOpen },
    { label: 'Carte', path: '/carte-des-projets', icon: Map },
    { label: 'Événements', path: '/evenements', icon: Calendar },
    { label: 'Partenaires', path: '/partenaires', icon: Users, hideOnMobile: true },
    { label: 'Docs', path: '/documents', icon: FileText, hideOnMobile: true },
    { label: 'Contact', path: '/contact', icon: Mail },
];

export function BubbleMenu() {
    const location = useLocation();
    const { theme } = useTheme();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isHeroSection, setIsHeroSection] = useState(false);

    // Dynamic Theme Detection
    useEffect(() => {
        const handleScroll = () => {
            if (location.pathname === '/') {
                // Hero section is approx 90vh
                const heroHeight = window.innerHeight * 0.9;
                // We add a buffer to transition before the white section fully hits
                setIsHeroSection(window.scrollY < heroHeight - 100);
            } else {
                setIsHeroSection(false);
            }
        };

        // Initial check
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    // Effective Dock Theme: 'dark' means "light text on dark bg"
    // If we are in the Hero Section, we Force 'dark' style regardless of system theme
    // Otherwise we use the system theme.
    const dockTheme = isHeroSection ? 'dark' : theme;
    const isDarkStyle = dockTheme === 'dark';

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                className={clsx(
                    "flex items-center gap-2 p-2 rounded-full shadow-2xl ring-1 transition-colors duration-500",
                    isDarkStyle
                        ? "bg-white/10 backdrop-blur-xl border border-white/20 ring-black/5"
                        : "bg-white/80 backdrop-blur-xl border border-white/40 ring-black/5 shadow-black/5"
                )}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Navigation Items */}
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={clsx(
                                "relative",
                                item.hideOnMobile && "hidden md:block"
                            )}
                        >
                            <motion.div
                                className={clsx(
                                    "relative z-10 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-colors duration-300",
                                    isActive
                                        ? "text-white" // Active is always white text (on orange bg)
                                        : isDarkStyle
                                            ? "text-gray-200 hover:text-white"
                                            : "text-gray-500 hover:text-black"
                                )}
                                animate={{
                                    scale: hoveredIndex === index ? 1.2 : 1,
                                    y: hoveredIndex === index ? -4 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <item.icon size={18} strokeWidth={2} className="md:w-5 md:h-5" />

                                {/* Active State Dot - Only if NOT hovered (optional, keeping minimal) */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-dot"
                                        className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.div>

                            {/* Hover Background Bubble */}
                            {hoveredIndex === index && (
                                <motion.div
                                    layoutId="hover-bubble"
                                    className={clsx(
                                        "absolute inset-0 rounded-full z-0",
                                        isDarkStyle ? "bg-white/20" : "bg-black/5"
                                    )}
                                    initial={{ borderRadius: 16 }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            {/* Active Background Bubble for current item */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-bubble"
                                    className="absolute inset-0 bg-primary rounded-full z-0 shadow-lg shadow-primary/30"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}



                {/* Separator */}
                <div className={clsx(
                    "w-px h-8 mx-1 transition-colors duration-500",
                    isDarkStyle ? "bg-white/10" : "bg-black/10"
                )} />

                {/* Donate Button (Special) */}
                <motion.a
                    href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Heart size={18} fill="currentColor" className="md:w-5 md:h-5" />
                </motion.a>
            </motion.div>
        </div>
    );
}
