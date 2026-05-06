import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ExternalLink } from 'lucide-react';

export function CrowdfundingModal() {
    const [visible, setVisible] = useState(false);
    const heartRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        if (heartRef.current) {
            const rect = heartRef.current.getBoundingClientRect();
            window.dispatchEvent(new CustomEvent('fly-heart', { detail: { startRect: rect, targetId: 'banner-heart' } }));
        }
        setVisible(false);
    };

    useEffect(() => {
        // Afficher la modal après un court délai pour laisser la page charger
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Empêcher le défilement du body quand la modale est ouverte
    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
                    {/* Overlay d'arrière-plan flouté qui bloque le reste du site */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#07071a]/80 backdrop-blur-md"
                    />

                    {/* Conteneur de la modale */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-md bg-[#0f0a22] rounded-3xl border border-orange-500/30 shadow-2xl overflow-hidden"
                    >
                        {/* Décoration supérieure */}
                        <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600" />

                        {/* Bouton de fermeture absolu */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="p-8 flex flex-col items-center text-center">
                            {/* Icône animée */}
                            <motion.div
                                ref={heartRef}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-600/20 border border-orange-500/30 flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20"
                            >
                                <Heart size={32} className="text-orange-400" fill="currentColor" />
                            </motion.div>

                            <h2 className="text-2xl font-black text-white mb-3">
                                Soutenez Phoenix !
                            </h2>
                            <p className="text-white/60 mb-8 leading-relaxed">
                                Notre campagne de crowdfunding est en cours. Vos dons sont vitaux pour nous permettre de continuer à accompagner les jeunes marseillais vers la réussite. On a besoin de vous !
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <a
                                    href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleClose}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/25"
                                >
                                    <Heart size={16} fill="white" />
                                    Je donne
                                    <ExternalLink size={16} className="opacity-70" />
                                </a>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-colors"
                                >
                                    Plus tard
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
