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
        { 
            value: 300, 
            suffix: "+", 
            label: t('home.impact.youth'), 
            subtitle: "Collégiens et lycéens suivis du lundi au samedi",
            color: "from-orange-500 to-amber-500", 
            borderColor: "hover:border-orange-400",
            bgTint: "group-hover:bg-orange-50/20",
            animated: true 
        },
        { 
            value: 150, 
            suffix: "", 
            label: t('home.impact.volunteers'), 
            subtitle: "Étudiants tuteurs engagés de KEDGE BS",
            color: "from-purple-600 to-indigo-600", 
            borderColor: "hover:border-purple-400",
            bgTint: "group-hover:bg-purple-50/20",
            animated: true 
        },
        { 
            value: 9, 
            suffix: "", 
            label: t('home.impact.projects'), 
            subtitle: "Antennes de terrain dans tout Marseille",
            color: "from-orange-600 to-orange-400", 
            borderColor: "hover:border-orange-400",
            bgTint: "group-hover:bg-orange-50/20",
            animated: true 
        },
        { 
            value: 2011, 
            suffix: "", 
            label: t('home.impact.creation'), 
            subtitle: "15 ans de transmission et d'ambition",
            color: "from-indigo-600 to-purple-600", 
            borderColor: "hover:border-indigo-400",
            bgTint: "group-hover:bg-indigo-50/20",
            animated: false 
        },
    ];

    return (
        <section className="relative w-full pt-12 md:pt-20 pb-10 md:pb-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={isMobile ? false : { opacity: 0, y: 15 }}
                    whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-10 md:mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs mb-3 rotate-1">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Impact & Résultats
                        </span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs font-bold text-orange-600">
                            Chiffres Clés
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900">
                        {t('home.impact.title')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600">
                            {t('home.impact.titleHighlight')}
                        </span>
                    </h2>
                </motion.div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
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
                            className={`group relative p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 ${stat.borderColor} ${stat.bgTint} shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center justify-between`}
                        >
                            {/* Number */}
                            <div>
                                <div
                                    className={`text-4xl sm:text-5xl md:text-6xl font-black mb-1 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent leading-none`}
                                >
                                    {stat.animated ? (
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                    ) : (
                                        <span>{stat.value}{stat.suffix}</span>
                                    )}
                                </div>

                                {/* Decor Line */}
                                <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${stat.color} my-3 mx-auto opacity-70`} />

                                {/* Label */}
                                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide mb-1.5">
                                    {stat.label}
                                </h3>
                            </div>

                            {/* Human Subtitle */}
                            <p className="text-xs text-slate-500 font-medium leading-snug mt-2">
                                {stat.subtitle}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
