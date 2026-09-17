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
            badge: "Impact Majeur 🔥",
            cardClass: "bg-[#0A1120] text-white border-2 border-[#0A1120] shadow-[5px_5px_0px_0px_#EA580C] hover:shadow-[7px_7px_0px_0px_#EA580C]",
            numberColor: "text-transparent bg-clip-text bg-gradient-to-br from-orange-400 via-orange-500 to-amber-400",
            labelColor: "text-white",
            subtitleColor: "text-slate-300",
            badgeClass: "bg-orange-600/20 text-orange-400 border border-orange-500/40",
            dividerClass: "bg-orange-500",
            animated: true 
        },
        { 
            value: 100, 
            prefix: "+",
            suffix: "", 
            label: t('home.impact.volunteers'), 
            subtitle: "Étudiants tuteurs engagés de KEDGE BS",
            badge: "Force Bénévole 💜",
            cardClass: "bg-[#F4EFEA] border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#0A1120] hover:shadow-[6px_6px_0px_0px_#0A1120]",
            numberColor: "text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-700",
            labelColor: "text-[#0A1120]",
            subtitleColor: "text-slate-600",
            badgeClass: "bg-purple-100 text-purple-900 border border-purple-200",
            dividerClass: "bg-purple-600",
            animated: true 
        },
        { 
            value: 9, 
            prefix: "",
            suffix: "", 
            label: t('home.impact.projects'), 
            subtitle: "Antennes de terrain dans tout Marseille",
            badge: "Ancrage Local 📍",
            cardClass: "bg-[#FFF7ED] border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#0A1120] hover:shadow-[6px_6px_0px_0px_#0A1120]",
            numberColor: "text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-amber-600",
            labelColor: "text-[#0A1120]",
            subtitleColor: "text-slate-600",
            badgeClass: "bg-orange-100 text-orange-900 border border-orange-200",
            dividerClass: "bg-orange-600",
            animated: true 
        },
        { 
            value: 100, 
            prefix: "",
            suffix: "%", 
            label: t('home.impact.success', 'Taux de réussite'), 
            subtitle: "Au brevet et au baccalauréat pour nos jeunes",
            badge: "Excellence 🏆",
            cardClass: "bg-white border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#F59E0B] hover:shadow-[6px_6px_0px_0px_#F59E0B]",
            numberColor: "text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600",
            labelColor: "text-[#0A1120]",
            subtitleColor: "text-slate-600",
            badgeClass: "bg-amber-100 text-amber-900 border border-amber-200",
            dividerClass: "bg-amber-500",
            animated: true 
        }
    ];

    return (
        <section className="relative py-14 md:py-24 bg-[#FBF9F5]">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header with badge */}
                <motion.div
                    initial={isMobile ? false : { opacity: 0, y: 15 }}
                    whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-12 md:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-1.5 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] text-xs font-display font-black uppercase tracking-wider text-[#0A1120] mb-4 rotate-1 hover:rotate-0 transition-transform">
                        <Sparkles size={14} className="text-orange-600" />
                        <span>{t('home.impact.badge', 'Impact & Résultats')}</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-[#0A1120] tracking-tight uppercase leading-[1.05]">
                        {t('home.impact.title')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500">
                            {t('home.impact.titleHighlight')}
                        </span>
                    </h2>
                </motion.div>

                {/* 4 Cards Grid - Asymmetric Art Direction */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={isMobile ? false : { opacity: 0, y: 15 }}
                            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-20px" }}
                            transition={{
                                duration: 0.45,
                                delay: i * 0.08,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            className={`group relative p-6 sm:p-7 rounded-3xl ${stat.cardClass} transition-all duration-200 flex flex-col items-center text-center justify-between min-h-[260px]`}
                        >
                            {/* Inner Badge */}
                            <div className="w-full flex justify-center mb-3">
                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-display font-black uppercase tracking-wider ${stat.badgeClass}`}>
                                    {stat.badge}
                                </span>
                            </div>

                            {/* Number */}
                            <div className="w-full flex flex-col items-center justify-center flex-grow">
                                <div
                                    className={`text-5xl sm:text-6xl md:text-6xl font-display font-black mb-1 ${stat.numberColor} leading-none flex items-center justify-center text-center tracking-tight`}
                                >
                                    {stat.animated ? (
                                        <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                    ) : (
                                        <span className="inline-flex items-center justify-center">{stat.prefix || ''}{stat.value}{stat.suffix}</span>
                                    )}
                                </div>

                                {/* Decor Line */}
                                <div className={`w-10 h-1 rounded-full ${stat.dividerClass} my-3 mx-auto opacity-80`} />

                                {/* Label */}
                                <h3 className={`text-sm sm:text-base font-display font-black uppercase tracking-wide mb-1 ${stat.labelColor}`}>
                                    {stat.label}
                                </h3>
                            </div>

                            {/* Human Subtitle */}
                            <p className={`text-xs font-medium leading-snug mt-2 ${stat.subtitleColor}`}>
                                {stat.subtitle}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
