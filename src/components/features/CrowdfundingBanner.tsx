import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

declare global {
    interface Window {
        __isCrowdfundingVisible?: boolean;
        __isIOSPromptVisible?: boolean;
    }
}

export function CrowdfundingBanner() {
    const [visible, setVisible] = useState(false);
    const heartRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        if (heartRef.current) {
            const rect = heartRef.current.getBoundingClientRect();
            window.dispatchEvent(new CustomEvent('fly-heart', { detail: { startRect: rect, targetId: 'menu-heart' } }));
        }
        setVisible(false);
        window.__isCrowdfundingVisible = false;
        try {
            sessionStorage.setItem('crowdfunding-banner-dismissed', 'true');
        } catch {
            // ignore storage errors
        }
        window.dispatchEvent(new CustomEvent('crowdfunding-closed'));
    };

    useEffect(() => {
        // Check if already dismissed in this session
        try {
            if (sessionStorage.getItem('crowdfunding-banner-dismissed') === 'true') {
                return;
            }
        } catch {
            // ignore
        }

        // If iOS prompt is currently visible, don't show over it
        if (window.__isIOSPromptVisible) {
            const handleIOSClose = () => {
                setTimeout(() => {
                    let dismissed = false;
                    try {
                        dismissed = sessionStorage.getItem('crowdfunding-banner-dismissed') === 'true';
                    } catch {
                        // ignore storage access errors
                    }
                    if (!dismissed) {
                        setVisible(true);
                        window.__isCrowdfundingVisible = true;
                    }
                }, 1000);
            };
            window.addEventListener('ios-prompt-closed', handleIOSClose, { once: true });
            return () => window.removeEventListener('ios-prompt-closed', handleIOSClose);
        }

        const timer = setTimeout(() => {
            setVisible(true);
            window.__isCrowdfundingVisible = true;
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 120, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 120, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-3 md:p-5"
                    style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
                >
                    <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                        {/* Barre — orange solide */}
                        <div className="h-1 w-full bg-primary" />

                        {/* Bouton fermeture rapide en haut à droite sur mobile */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2.5 right-2.5 sm:hidden p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors z-10"
                            aria-label="Fermer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5">
                            {/* Icône */}
                            <div id="banner-heart" ref={heartRef} className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md">
                                <Heart className="w-5 h-5 text-white" fill="white" />
                            </div>

                            {/* Texte */}
                            <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                                <p className="text-white font-bold text-sm md:text-base leading-snug">
                                    Notre crowdfunding est en ligne — soutenez Phoenix !
                                </p>
                                <p className="text-gray-400 text-xs md:text-sm mt-1 leading-relaxed">
                                    Chaque don nous aide à accompagner davantage de jeunes à Marseille.{' '}
                                    <Link
                                        to="/transparence"
                                        onClick={handleClose}
                                        className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                                    >
                                        <FileText className="w-3 h-3" />
                                        Voir où va l'argent
                                    </Link>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                                <a
                                    href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleClose}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all shadow-md hover:scale-105 active:scale-95 whitespace-nowrap"
                                >
                                    <Heart className="w-3.5 h-3.5" fill="white" />
                                    Je contribue
                                    <ExternalLink className="w-3 h-3 opacity-75" />
                                </a>
                                <button
                                    onClick={handleClose}
                                    className="hidden sm:flex flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    aria-label="Fermer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
