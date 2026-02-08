import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function IOSInstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if it's iOS (Safari)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // Check if user has already dismissed the prompt
        const hasBeenDismissed = localStorage.getItem('ios-install-dismissed') === 'true';

        // Show prompt only if: iOS, not installed, and not previously dismissed
        if (isIOS && !isStandalone && !hasBeenDismissed) {
            // Show after 3 seconds to not be intrusive
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
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
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-4 relative">
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>

                        {/* Content */}
                        <div className="pr-6">
                            <div className="flex items-center gap-2 mb-3">
                                <img src="/app-icon.png" alt="Phoenix" className="w-10 h-10 rounded-xl" />
                                <div>
                                    <h3 className="font-bold text-sm">Installez Phoenix</h3>
                                    <p className="text-xs text-gray-500">Accès rapide depuis l'écran d'accueil</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 p-1 bg-blue-500/10 rounded">
                                        <Share size={14} className="text-blue-500" />
                                    </div>
                                    <p>
                                        1. Appuyez sur <strong className="text-gray-900 dark:text-white">Partager</strong>
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 p-1 bg-orange-500/10 rounded">
                                        <Plus size={14} className="text-orange-500" />
                                    </div>
                                    <p>
                                        2. Sélectionnez <strong className="text-gray-900 dark:text-white">"Sur l'écran d'accueil"</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
