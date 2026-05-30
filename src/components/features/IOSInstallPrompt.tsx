import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function IOSInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Improved detection of iOS including Safari on iPad / iPhone / iPod
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        // Check if already running in standalone (installed) mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator as any).standalone === true;

        // Check if user has already dismissed the prompt
        const hasBeenDismissed = localStorage.getItem('ios-install-dismissed') === 'true';

        // Show prompt only if on iOS, not standalone, and not previously dismissed
        if (isIOS && !isStandalone && !hasBeenDismissed) {
            // Show after 2.5 seconds
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('ios-install-dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 30, opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="fixed bottom-28 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[1001]"
                >
                    <div className="bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                        {/* Elegant background highlight blur */}
                        <div className="absolute -top-12 -left-12 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors z-10"
                            aria-label="Fermer"
                        >
                            <X size={16} />
                        </button>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <img 
                                    src="/app-icon.png" 
                                    alt="Phoenix Logo" 
                                    className="w-12 h-12 rounded-2xl border border-white/10 object-contain bg-zinc-900" 
                                />
                                <div>
                                    <h3 className="font-extrabold text-sm text-white tracking-tight">
                                        Ajouter à l'écran d'accueil
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        Installez Phoenix sur votre iPhone / iPad
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed">
                                Accédez à Phoenix directement depuis votre écran d'accueil en suivant ces étapes rapides :
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
                                        <Share size={16} />
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-gray-400">1. Appuyez sur le bouton </span>
                                        <strong className="text-white font-semibold">Partager</strong>
                                        <span className="text-gray-400"> dans Safari.</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                                        <Plus size={16} />
                                    </div>
                                    <div className="text-xs">
                                        <span className="text-gray-400">2. Sélectionnez </span>
                                        <strong className="text-white font-semibold">"Sur l'écran d'accueil"</strong>
                                        <span className="text-gray-400">.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtle arrow indicator pointing down (for Safari bar on iPhone) */}
                        <div className="flex justify-center mt-3 -mb-2">
                            <motion.div
                                animate={{ y: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
