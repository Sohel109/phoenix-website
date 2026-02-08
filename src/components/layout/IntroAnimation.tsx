import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface IntroAnimationProps {
    onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [isVisible, setIsVisible] = useState(true);

    // Skip animation on mobile for performance
    // This check should ideally be done using a more robust method like media queries or a custom hook
    // that listens to window resize events, but for a quick check, window.innerWidth is used here.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
        useEffect(() => {
            // If animation is skipped, call onComplete immediately
            onComplete();
        }, [onComplete]);
        return null;
    }

    useEffect(() => {
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
    }, [onComplete]);

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
                    {/* --- AURORA BACKGROUND --- */}
                    <div className="absolute inset-0 z-0 bg-black">
                        {/* Deep void base */}
                        <div className="absolute inset-0 bg-[#020104]" />
                        <motion.div
                            className="absolute inset-0 opacity-40"
                            animate={{
                                backgroundPosition: ["0% 0%", "100% 100%"],
                                scale: [1, 1.15, 1]
                            }}
                            transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
                            style={{
                                background: "radial-gradient(circle at 50% 50%, #6A1B9A 0%, transparent 60%), radial-gradient(circle at 85% 15%, #E65100 0%, transparent 45%)",
                                filter: "blur(120px)"
                            }}
                        />
                    </div>

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">

                        {/* --- THE MAIN EVENT: TEXT ONLY --- */}
                        <div className="flex flex-col items-center justify-center text-center px-4">

                            {/* "PHOENIX" - GIANT GRADIENT STAGGER */}
                            <div className="overflow-hidden py-4 -my-4">
                                <motion.h1
                                    className="text-6xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-tighter flex items-center justify-center leading-none"
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
                                                backgroundImage: "linear-gradient(180deg, #FFB74D 0%, #FF5722 50%, #D500F9 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                // Drop shadow to lift it off the dark background
                                                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))"
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
                                <h2 className="text-xs md:text-xl font-bold text-white/90 uppercase tracking-widest leading-relaxed">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-white">
                                        ÉGALITÉ DES CHANCES
                                    </span>
                                </h2>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
