import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- COUNTER COMPONENT ---
function AnimatedCounter({ value, suffix }: { value: number; suffix?: string }) {
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-10px" });

    const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 20 });
    const displayValue = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        if (isMobile) {
            spring.set(value);
        } else if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring, isMobile]);

    // Sur mobile : affichage instantané sans spring ni délai
    if (isMobile) {
        return (
            <span className="flex items-center">
                <span>{value}</span>
                <span>{suffix}</span>
            </span>
        );
    }

    return (
        <span ref={ref} className="flex items-center">
            <motion.span>{displayValue}</motion.span>
            <span>{suffix}</span>
        </span>
    );
}

// --- MAIN SECTION ---
export function KeyFigures() {
    const { t } = useTranslation();
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

    const stats = [
        { value: 300, suffix: "+", label: t('home.impact.youth'), color: "from-orange-500 to-orange-600", animated: true },
        { value: 150, suffix: "", label: t('home.impact.volunteers'), color: "from-orange-600 to-amber-500", animated: true },
        { value: 9, suffix: "", label: t('home.impact.projects'), color: "from-amber-500 to-yellow-500", animated: true },
        { value: 2011, suffix: "", label: t('home.impact.creation'), color: "from-amber-500 to-orange-600", animated: false },
    ];

    return (
        <section className="relative w-full pt-12 md:pt-20 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={isMobile ? false : { opacity: 0, y: 15 }}
                    whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-10 md:mb-14"
                >
                    <div className="flex items-center justify-center gap-2.5 mb-3">
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-600">
                            Impact & Résultats
                        </span>
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                    </div>
                    <h2 className="text-2xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900">
                        {t('home.impact.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">{t('home.impact.titleHighlight')}</span>
                    </h2>
                </motion.div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8 mb-16">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={isMobile ? false : { opacity: 0, y: 15 }}
                            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-20px" }}
                            transition={{
                                duration: 0.5,
                                delay: i * 0.08,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            className="group relative p-6 sm:p-8 rounded-xl bg-white border border-slate-200/90 hover:border-orange-400 shadow-xs hover:shadow-sm transition-colors duration-200 flex flex-col items-center text-center"
                        >
                            {/* Number */}
                            <div
                                className={`text-4xl sm:text-5xl md:text-6xl font-black mb-2 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent leading-none`}
                            >
                                {stat.animated ? (
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                ) : (
                                    <span>{stat.value}{stat.suffix}</span>
                                )}
                            </div>

                            {/* Decor Line */}
                            <div className={`w-10 h-0.5 rounded-full bg-gradient-to-r ${stat.color} my-3 opacity-70`} />

                            {/* Label */}
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
                                {stat.label}
                            </h3>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
