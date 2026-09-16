import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface IntroAnimationProps {
    onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [isVisible, setIsVisible] = useState(true);

    // Détection mobile : pas de useState pour éviter un flash, lecture directe au mount
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Un seul useEffect toujours appelé (respect des Rules of Hooks)
    useEffect(() => {
        // Sur mobile on saute l'animation pour éviter la surcharge GPU
        if (isMobile) {
            onComplete();
            return;
        }

        // Sequence (Turbo Mode - Max 2s):
        // 0s: Background
        // 0.1s: PHOENIX Explodes in
        // 0.4s: Subtitle Wipe
        // 1.8s: Fade out
        const timer1 = setTimeout(() => setIsVisible(false), 1800);
        const timer2 = setTimeout(() => onComplete(), 2300);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete, isMobile]);

    // Sur mobile : rendu nul (onComplete déjà appelé dans l'effect)
    if (isMobile) return null;

    // --- ANIMATIONS ---

    // 1. PHOENIX TITLE
    const titleContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.04, // Very fast stagger
                delayChildren: 0.1
            }
        }
    };

    const titleLetter = {
        hidden: {
            y: 80,
            opacity: 0,
            filter: "blur(20px)",
            scale: 0.8
        },
        visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as any
            }
        }
    };

    // 2. SUBTITLE
    const subtitleVar = {
        hidden: {
            opacity: 0,
            y: 20,
            letterSpacing: "-0.05em",
            filter: "blur(8px)"
        },
        visible: {
            opacity: 1,
            y: 0,
            letterSpacing: "0.5em",
            filter: "blur(0px)",
            transition: {
                duration: 0.8,
                ease: "easeOut" as any,
                delay: 0.4
            }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
                    exit={{ opacity: 0, filter: "blur(15px)", transition: { duration: 0.8 } }}
                >
                    {/* --- WARM LIGHT BACKGROUND --- */}
                    <div className="absolute inset-0 z-0 bg-slate-50">
                        {/* Soft warm gradient base */}
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/60 via-white to-slate-50" />
                        <motion.div
                            className="absolute inset-0 opacity-60"
                            animate={{
                                backgroundPosition: ["0% 0%", "100% 100%"],
                                scale: [1, 1.15, 1]
                            }}
                            transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
                            style={{
                                background: "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.12) 0%, transparent 60%), radial-gradient(circle at 85% 15%, rgba(251, 146, 60, 0.15) 0%, transparent 45%)",
                                filter: "blur(90px)"
                            }}
                        />
                    </div>

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">

                        {/* --- THE MAIN EVENT: TEXT ONLY --- */}
                        <div className="flex flex-col items-center justify-center text-center px-4">

                            {/* "PHOENIX" - GIANT GRADIENT STAGGER */}
                            <div translate="no" className="notranslate overflow-hidden py-4 -my-4">
                                <motion.h1
                                    translate="no"
                                    className="notranslate text-6xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-tighter flex items-center justify-center leading-none"
                                    variants={titleContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {Array.from("PHOENIX").map((char, i) => (
                                        <motion.span
                                            key={i}
                                            variants={titleLetter}
                                            className="inline-block relative"
                                            style={{
                                                backgroundImage: "linear-gradient(180deg, #EA580C 0%, #F97316 50%, #FB923C 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                filter: "drop-shadow(0 6px 16px rgba(234, 88, 12, 0.2))"
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </motion.h1>
                            </div>

                            {/* "ÉGALITÉ DES CHANCES" */}
                            <motion.div
                                variants={subtitleVar}
                                initial="hidden"
                                animate="visible"
                                className="mt-6 md:mt-8"
                            >
                                <h2 className="text-xs md:text-xl font-bold text-slate-700 uppercase tracking-widest leading-relaxed">
                                    ÉGALITÉ DES CHANCES
                                </h2>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
