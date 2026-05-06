import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CrowdfundingBanner() {
    const [visible, setVisible] = useState(false);
    const heartRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        if (heartRef.current) {
            const rect = heartRef.current.getBoundingClientRect();
            window.dispatchEvent(new CustomEvent('fly-heart', { detail: { startRect: rect, targetId: 'menu-heart' } }));
        }
        setVisible(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 1500);
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
                >
                    <div className="max-w-4xl mx-auto rounded-2xl border border-orange-500/30 bg-[#0f0a22]/95 backdrop-blur-xl shadow-2xl shadow-orange-500/10 overflow-hidden">
                        {/* Barre colorée */}
                        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600" />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-5">
                            {/* Icône */}
                            <div id="banner-heart" ref={heartRef} className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <Heart className="w-5 h-5 text-white" fill="white" />
                            </div>

                            {/* Texte */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm md:text-base leading-snug">
                                    🔥 Notre crowdfunding est en ligne — soutenez Phoenix !
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
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-semibold text-sm transition-all shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 whitespace-nowrap"
                                >
                                    <Heart className="w-3.5 h-3.5" fill="white" />
                                    Je contribue
                                    <ExternalLink className="w-3 h-3 opacity-75" />
                                </a>
                                <button
                                    onClick={handleClose}
                                    className="flex-shrink-0 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
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
