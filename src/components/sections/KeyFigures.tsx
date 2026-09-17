import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- COUNTER COMPONENT ---
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-20px" });
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const spring = useSpring(0, {
        mass: 0.8,
        stiffness: 75,
        damping: 15
    });

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
            <span className="inline-flex items-center justify-center">
                {prefix && <span>{prefix}</span>}
                <span>{value}</span>
                {suffix && <span>{suffix}</span>}
            </span>
        );
    }

    return (
        <span ref={ref} className="inline-flex items-center justify-center">
            {prefix && <span>{prefix}</span>}
            <motion.span>{displayValue}</motion.span>
            {suffix && <span>{suffix}</span>}
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
            prefix: "",
            suffix: "+", 
            label: t('home.impact.youth'), 
            subtitle: "Collégiens et lycéens suivis du lundi au samedi",
            color: "from-orange-500 to-amber-500", 
            borderColor: "hover:border-orange-400",
            bgTint: "group-hover:bg-orange-50/20",
            animated: true 
        },
        { 
            value: 100, 
            prefix: "+",
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
            prefix: "",
            suffix: "", 
            label: t('home.impact.projects'), 
            subtitle: "Antennes de terrain dans tout Marseille",
            color: "from-orange-600 to-orange-400", 
            borderColor: "hover:border-orange-400",
            bgTint: "group-hover:bg-orange-50/20",
            animated: true 
        },
        { 
            value: 100, 
            prefix: "",
            suffix: "%", 
            label: t('home.impact.success', 'Taux de réussite'), 
            subtitle: "Au brevet et au baccalauréat",
            color: "from-amber-500 to-orange-500", 
            borderColor: "hover:border-amber-400",
            bgTint: "group-hover:bg-amber-50/20",
            animated: true 
        }
    ];

    return (
        <section className="relative py-12 md:py-20 bg-slate-50/50">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header with badge */}
                <motion.div
                    initial={isMobile ? false : { opacity: 0, y: 15 }}
                    whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-10 md:mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3">
                        <Sparkles size={14} />
                        <span>{t('home.impact.badge', 'Impact & Résultats')}</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
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
                            <div className="w-full flex flex-col items-center justify-center">
                                <div
                                    className={`text-4xl sm:text-5xl md:text-6xl font-black mb-1 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent leading-none flex items-center justify-center text-center`}
                                >
                                    {stat.animated ? (
                                        <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                    ) : (
                                        <span className="inline-flex items-center justify-center">{stat.prefix || ''}{stat.value}{stat.suffix}</span>
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
