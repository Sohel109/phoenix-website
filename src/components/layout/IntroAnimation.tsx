import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface IntroAnimationProps {
    onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [isVisible, setIsVisible] = useState(true);

    // Détection mobile : pas de useState pour éviter un flash, lecture directe au mount
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    useEffect(() => {
        // Sur mobile on saute l'animation
        if (isMobile) {
            onComplete();
            return;
        }

        // Sequence (2s total):
        // 0.1s: PHOENIX entre en stagger
        // 0.4s: Subtitle wipe
        // 1.7s: Fade out commence
        // 2.2s: onComplete → site dévoilé
        const timer1 = setTimeout(() => setIsVisible(false), 1700);
        const timer2 = setTimeout(() => onComplete(), 2200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onComplete, isMobile]);

    if (isMobile) return null;

    // 1. Stagger par lettre pour PHOENIX
    const titleContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const titleLetter = {
        hidden: {
            y: 70,
            opacity: 0,
            filter: "blur(16px)",
            scale: 0.85
        },
        visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            transition: {
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1] as any
            }
        }
    };

    // 2. Subtitle wipe
    const subtitleVar = {
        hidden: {
            opacity: 0,
            y: 14,
            letterSpacing: "-0.02em",
        },
        visible: {
            opacity: 1,
            y: 0,
            letterSpacing: "0.45em",
            transition: {
                duration: 0.75,
                ease: "easeOut" as any,
                delay: 0.45
            }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
                    exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)", transition: { duration: 0.65, ease: "easeInOut" } }}
                >
                    {/* ── FOND CHARTE : Crème chaud #FFFBF4 avec halos Phoenix ── */}
                    <div className="absolute inset-0 z-0 bg-[#FFFBF4]">
                        {/* Halo lilas doux en haut à droite */}
                        <div className="absolute top-[-8%] right-[-6%] w-[500px] h-[500px] rounded-full bg-[#ECDDFD]/50 blur-[120px]" />
                        {/* Halo vieux rose en bas à gauche */}
                        <div className="absolute bottom-[-8%] left-[-6%] w-[450px] h-[450px] rounded-full bg-[#E1BBCB]/40 blur-[100px]" />
                        {/* Accent orange subtil centré */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full bg-[#EC602B]/08 blur-[80px]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">

                        {/* ── PHOENIX — Shrikhand Gradient officiel Violet → Orange ── */}
                        <div translate="no" className="notranslate overflow-hidden py-4 -my-4">
                            <motion.h1
                                translate="no"
                                className="notranslate font-display text-8xl md:text-[9rem] lg:text-[11rem] leading-none flex items-center justify-center"
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
                                            backgroundImage: "linear-gradient(135deg, #6F2B75 0%, #904990 40%, #EC602B 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            filter: "drop-shadow(0 4px 20px rgba(111,43,117,0.18))"
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </motion.h1>
                        </div>

                        {/* ── ÉGALITÉ DES CHANCES ── */}
                        <motion.div
                            variants={subtitleVar}
                            initial="hidden"
                            animate="visible"
                            className="mt-5 md:mt-7"
                        >
                            <p className="text-xs md:text-sm font-school font-bold text-[#6F2B75] uppercase leading-relaxed">
                                ÉGALITÉ DES CHANCES
                            </p>
                        </motion.div>

                        {/* ── Trait décoratif orange ── */}
                        <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
                            className="mt-4 w-16 h-0.5 bg-gradient-to-r from-[#6F2B75] to-[#EC602B] rounded-full origin-left"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
