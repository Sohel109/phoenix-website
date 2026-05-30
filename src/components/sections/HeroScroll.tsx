import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const heroImages = [
    '/images/projects/hero-1.png',  // Groupe devant La Base
    '/images/projects/hero-2.png',  // Conférence
    '/images/projects/hero-3.png',  // Présentation orientation
    '/images/projects/hero-4.png'   // Groupe en gare
];

export function HeroScroll() {
    const { t } = useTranslation();
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    // --- TRANSFORMS: SECTION 1 (INITIAL TYPOGRAPHY HERO) ---
    const heroOpacity = useTransform(scrollYProgress, [0, 0.16], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.16], [0, -85]);
    const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [0.6, 0]);

    // --- TRANSFORMS: SECTION 2 (CIRCLE REVEAL - "S'ENGAGER") ---
    const circleOpacity = useTransform(scrollYProgress, [0.12, 0.2, 0.44, 0.5], [0, 1, 1, 0]);
    const circleScale = useTransform(scrollYProgress, [0.12, 0.2, 0.44, 0.5], [0.6, 1, 1.1, 0.8]);
    const circleX = useTransform(scrollYProgress, [0.15, 0.44], ["-10%", "15%"]);
    const circleY = useTransform(scrollYProgress, [0.15, 0.44], ["10%", "-5%"]);
    const circleClip = useTransform(scrollYProgress, [0.15, 0.38], ["circle(20% at 50% 50%)", "circle(50% at 50% 50%)"]);
    
    const text1Opacity = useTransform(scrollYProgress, [0.18, 0.24, 0.42, 0.48], [0, 1, 1, 0]);
    const text1X = useTransform(scrollYProgress, [0.18, 0.24], ["-40px", "0px"]);

    // --- TRANSFORMS: SECTION 3 (CAPSULE REVEAL - "TRANSMETTRE") ---
    const capsuleOpacity = useTransform(scrollYProgress, [0.42, 0.5, 0.72, 0.78], [0, 1, 1, 0]);
    const capsuleScale = useTransform(scrollYProgress, [0.42, 0.5, 0.72, 0.78], [0.7, 1, 1.15, 0.8]);
    const capsuleRotate = useTransform(scrollYProgress, [0.45, 0.72], [-10, 15]);
    const capsuleX = useTransform(scrollYProgress, [0.45, 0.72], ["15%", "-15%"]);
    const capsuleClip = useTransform(scrollYProgress, [0.46, 0.68], [
        "inset(15% 25% 15% 25% round 120px)",
        "inset(0% 5% 0% 5% round 45px)"
    ]);

    const text2Opacity = useTransform(scrollYProgress, [0.48, 0.54, 0.7, 0.76], [0, 1, 1, 0]);
    const text2X = useTransform(scrollYProgress, [0.48, 0.54], ["40px", "0px"]);

    // --- TRANSFORMS: SECTION 4 (DIAMOND/FULL REVEAL - "RÉUSSIR") ---
    const diamondOpacity = useTransform(scrollYProgress, [0.72, 0.8], [0, 1]);
    const diamondScale = useTransform(scrollYProgress, [0.72, 0.92], [0.8, 1]);
    const diamondClip = useTransform(scrollYProgress, [0.74, 0.95], [
        "polygon(50% 15%, 85% 50%, 50% 85%, 15% 50%)",
        "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
    ]);

    const text3Opacity = useTransform(scrollYProgress, [0.78, 0.86], [0, 1]);
    const text3Y = useTransform(scrollYProgress, [0.78, 0.86], ["50px", "0px"]);

    return (
        <div ref={targetRef} className="relative h-[400vh] bg-transparent">
            {/* Sticky Viewport */}
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-between">
                
                {/* 1. SCENE CONTENT: TYPOGRAPHY HERO (START) */}
                <motion.div 
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-6 max-w-6xl mx-auto -mt-8 md:mt-0 pointer-events-none"
                >
                    <div className="inline-block py-2 px-6 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 font-semibold text-xs md:text-sm mb-4 md:mb-8 tracking-wider uppercase">
                        {t('hero.since')}
                    </div>
                    
                    <h1 className="text-4xl sm:text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase mb-4 md:mb-8 select-none">
                        {t('hero.title1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-violet-600">
                            {t('hero.title2')}
                        </span>
                    </h1>
                    
                    <p className="text-sm sm:text-lg md:text-2xl font-light text-white/50 max-w-2xl leading-relaxed tracking-wide mb-6 md:mb-12">
                        L'association de KEDGE Business School engagée pour l'égalité des chances et l'ouverture culturelle des jeunes marseillais.
                    </p>
                    
                    {/* CTA Buttons in Hero View */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pointer-events-auto">
                        <Link
                            to="/projets"
                            className="group px-6 py-3.5 sm:px-8 sm:py-4 bg-white text-black rounded-full font-bold text-sm sm:text-base hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl flex items-center gap-2"
                        >
                            {t('hero.cta1')}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            to="/contact"
                            className="px-6 py-3.5 sm:px-8 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-sm sm:text-base hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            {t('hero.cta2')}
                        </Link>
                    </div>
                    
                    {/* Bouncing Scroll Indicator */}
                    <motion.div 
                        style={{ opacity: scrollIndicatorOpacity }}
                        className="absolute bottom-24 md:bottom-12 flex flex-col items-center gap-2 text-white/30 text-xs font-bold tracking-widest uppercase cursor-pointer"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span>Scroll</span>
                        <ChevronDown size={16} />
                    </motion.div>
                </motion.div>

                {/* 2. SCENE CONTENT: SECTION 2 - CIRCLE (S'ENGAGER) */}
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center px-6 md:px-24">
                    {/* Text block (Left) */}
                    <motion.div 
                        style={{ opacity: text1Opacity, x: text1X }}
                        className="absolute left-6 md:left-24 max-w-md flex flex-col gap-4 text-left z-20"
                    >
                        <span className="text-xs md:text-sm font-bold tracking-widest bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent uppercase">
                            01 / S'ENGAGER
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-none uppercase tracking-tight">
                            TUTORAT <br />
                            ACADÉMIQUE
                        </h2>
                        <p className="text-white/60 text-sm md:text-base font-light leading-relaxed">
                            Accompagner individuellement les jeunes collégiens et lycéens issus des quartiers prioritaires dans leur réussite académique.
                        </p>
                    </motion.div>

                    {/* Shape block (Circle on the Right) */}
                    <motion.div
                        style={{ opacity: circleOpacity, scale: circleScale, x: circleX, y: circleY, clipPath: circleClip }}
                        className="absolute w-[280px] h-[280px] md:w-[420px] md:h-[420px] rounded-full overflow-hidden shadow-2xl border border-white/5 bg-gray-950/20"
                    >
                        <img 
                            src={heroImages[0]} 
                            alt="Engagement" 
                            className="w-full h-full object-cover select-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Decorative SVGs for Section 2 */}
                    <motion.div 
                        style={{ opacity: circleOpacity, x: circleX, y: circleY }} 
                        className="absolute w-[320px] h-[320px] md:w-[460px] md:h-[460px] flex items-center justify-center z-0"
                    >
                        <svg className="w-full h-full text-orange-500/20 animate-[spin_50s_linear_infinite]" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" fill="none" />
                        </svg>
                    </motion.div>
                </div>

                {/* 3. SCENE CONTENT: SECTION 3 - CAPSULE (TRANSMETTRE) */}
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center px-6 md:px-24">
                    {/* Shape block (Capsule on the Left) */}
                    <motion.div
                        style={{ 
                            opacity: capsuleOpacity, 
                            scale: capsuleScale, 
                            rotate: capsuleRotate, 
                            x: capsuleX, 
                            clipPath: capsuleClip 
                        }}
                        className="absolute w-[260px] h-[360px] md:w-[380px] md:h-[480px] overflow-hidden shadow-2xl border border-white/5 bg-gray-950/20"
                    >
                        <img 
                            src={heroImages[1]} 
                            alt="Transmission" 
                            className="w-full h-full object-cover select-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Decorative SVGs for Section 3 */}
                    <motion.div 
                        style={{ opacity: capsuleOpacity, x: capsuleX }} 
                        className="absolute w-[300px] h-[400px] md:w-[420px] md:h-[520px] flex items-center justify-center z-0"
                    >
                        <svg className="w-full h-full text-purple-500/10" viewBox="0 0 100 100">
                            <rect x="5" y="5" width="90" height="90" rx="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
                        </svg>
                    </motion.div>

                    {/* Text block (Right) */}
                    <motion.div 
                        style={{ opacity: text2Opacity, x: text2X }}
                        className="absolute right-6 md:right-24 max-w-md flex flex-col gap-4 text-left md:text-right z-20"
                    >
                        <span className="text-xs md:text-sm font-bold tracking-widest bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent uppercase">
                            02 / TRANSMETTRE
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-none uppercase tracking-tight">
                            OUVERTURE <br />
                            CULTURELLE
                        </h2>
                        <p className="text-white/60 text-sm md:text-base font-light leading-relaxed">
                            Organiser des sorties, des projets artistiques et des ateliers pour stimuler la curiosité et lever les barrières culturelles.
                        </p>
                    </motion.div>
                </div>

                {/* 4. SCENE CONTENT: SECTION 4 - DIAMOND / FULL CANVAS REVEAL (RÉUSSIR) */}
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    {/* Full Canvas masked image */}
                    <motion.div
                        style={{ opacity: diamondOpacity, scale: diamondScale, clipPath: diamondClip }}
                        className="absolute inset-0 overflow-hidden"
                    >
                        <img 
                            src={heroImages[3]} 
                            alt="Réussir" 
                            className="w-full h-full object-cover select-none"
                        />
                        {/* Ambient gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 pointer-events-none" />
                    </motion.div>

                    {/* Text and CTA Layer */}
                    <motion.div
                        style={{ opacity: text3Opacity, y: text3Y }}
                        className="relative z-20 max-w-3xl text-center px-6 flex flex-col items-center gap-8"
                    >
                        <span className="text-xs md:text-sm font-bold tracking-widest bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-transparent uppercase">
                            03 / RÉUSSIR
                        </span>
                        <h2 className="text-5xl md:text-8xl font-black text-white leading-none uppercase tracking-tight">
                            ENSEMBLE & <br />
                            SANS LIMITES
                        </h2>
                        <p className="text-white/70 text-base md:text-lg font-light max-w-xl leading-relaxed">
                            Ouvrir de nouveaux horizons professionnels, scolaires et personnels aux citoyens de demain.
                        </p>

                        {/* CTA Buttons at bottom */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-4">
                            <Link
                                to="/projets"
                                className="group px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl flex items-center gap-3 pointer-events-auto"
                            >
                                {t('hero.cta1')}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/contact"
                                className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200 pointer-events-auto"
                            >
                                {t('hero.cta2')}
                            </Link>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
