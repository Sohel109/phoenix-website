import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { Sparkles, Users, Heart, Zap, Award } from 'lucide-react';
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
            label: t('home.impact.youth', 'Jeunes accompagnés'), 
            subtitle: "Collégiens et lycéens suivis chaque semaine à Marseille",
            badge: "Impact Majeur ✦",
            icon: Users,
            cardClass: "bg-[#ECDDFD] text-[#2A082D] border border-[#6F2B75]/15 shadow-soft hover:shadow-soft-lg",
            numberColor: "text-[#6F2B75]",
            labelColor: "text-[#2A082D]",
            subtitleColor: "text-[#2A082D]/75",
            badgeClass: "bg-white text-[#6F2B75] border border-[#6F2B75]/20",
            iconBg: "bg-[#6F2B75] text-white",
            animated: true 
        },
        { 
            value: 100, 
            prefix: "+",
            suffix: "", 
            label: t('home.impact.volunteers', 'Tuteurs engagés'), 
            subtitle: "Étudiants bénévoles de KEDGE BS mobilisés sur le terrain",
            badge: "Force Bénévole 💜",
            icon: Heart,
            cardClass: "bg-[#E1BBCB] text-[#2A082D] border border-[#EC602B]/20 shadow-soft hover:shadow-soft-lg",
            numberColor: "text-[#EC602B]",
            labelColor: "text-[#2A082D]",
            subtitleColor: "text-[#2A082D]/80",
            badgeClass: "bg-white text-[#EC602B] border border-[#EC602B]/20",
            iconBg: "bg-[#EC602B] text-white",
            animated: true 
        },
        { 
            value: 9, 
            prefix: "",
            suffix: "", 
            label: t('home.impact.projects', 'Projets de terrain'), 
            subtitle: "Antennes scolaires et centres partenaires à Marseille",
            badge: "Ancrage Local 📍",
            icon: Zap,
            cardClass: "bg-gradient-to-br from-[#6F2B75] to-[#EC602B] text-white shadow-soft hover:shadow-soft-lg",
            numberColor: "text-white",
            labelColor: "text-white",
            subtitleColor: "text-white/85",
            badgeClass: "bg-white/20 text-white border border-white/30 backdrop-blur-xs",
            iconBg: "bg-white text-[#EC602B]",
            animated: true 
        },
        { 
            value: 100, 
            prefix: "",
            suffix: "%", 
            label: t('home.impact.success', 'Réussite aux examens'), 
            subtitle: "Au brevet des collèges et au baccalauréat chaque année",
            badge: "Excellence 🏆",
            icon: Award,
            cardClass: "bg-white text-[#2A082D] border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg",
            numberColor: "bg-gradient-to-r from-[#6F2B75] to-[#EC602B] bg-clip-text text-transparent",
            labelColor: "text-[#2A082D]",
            subtitleColor: "text-slate-600",
            badgeClass: "bg-[#ECDDFD] text-[#6F2B75] border border-[#6F2B75]/15",
            iconBg: "bg-[#ECDDFD] text-[#6F2B75]",
            animated: true 
        }
    ];

    return (
        <section className="relative py-16 md:py-24 bg-[#FFFBF4] bg-bird-pattern overflow-hidden">
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                {/* Header with badge */}
                <motion.div
                    initial={isMobile ? false : { opacity: 0, y: 15 }}
                    whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center mb-12 md:mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECDDFD] text-[#6F2B75] text-xs font-school font-bold tracking-wider mb-4 shadow-xs">
                        <Sparkles size={14} className="text-[#EC602B]" />
                        <span>{t('home.impact.badge', 'Impact & Résultats')}</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-normal mb-3">
                        {t('home.impact.title', 'Notre impact')}{' '}
                        <span className="bg-gradient-to-r from-[#6F2B75] to-[#EC602B] bg-clip-text text-transparent">
                            {t('home.impact.titleHighlight', 'en chiffres')}
                        </span>
                    </h2>
                    <p className="text-slate-600 font-medium text-sm sm:text-base max-w-xl mx-auto">
                        Depuis plus de 13 ans, des résultats concrets bâtis chaque semaine auprès de la jeunesse marseillaise.
                    </p>
                </motion.div>

                {/* 4 Cards Grid - Bulles rondes et organiques */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
                    {stats.map((stat, i) => {
                        const IconComponent = stat.icon;
                        return (
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
                                className={`group relative p-7 rounded-[2.5rem] ${stat.cardClass} transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center justify-between min-h-[270px]`}
                            >
                                {/* Inner Badge & Macaron Icon */}
                                <div className="w-full flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xs ${stat.iconBg}`}>
                                        <IconComponent size={18} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-school font-bold tracking-wider ${stat.badgeClass}`}>
                                        {stat.badge}
                                    </span>
                                </div>

                                {/* Number Shrikhand */}
                                <div className="w-full flex flex-col items-center justify-center flex-grow py-2">
                                    <div
                                        className={`text-5xl sm:text-6xl font-display mb-1 ${stat.numberColor} leading-none flex items-center justify-center text-center`}
                                    >
                                        {stat.animated ? (
                                            <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                        ) : (
                                            <span className="inline-flex items-center justify-center">{stat.prefix || ''}{stat.value}{stat.suffix}</span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <h3 className={`text-base font-bold tracking-normal mt-2 ${stat.labelColor}`}>
                                        {stat.label}
                                    </h3>
                                </div>

                                {/* Subtitle */}
                                <p className={`text-xs font-medium leading-relaxed mt-2 ${stat.subtitleColor}`}>
                                    {stat.subtitle}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
