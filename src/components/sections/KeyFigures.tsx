import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { HandDrawnCircle } from '../common/HandDrawnElements';

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
            <span className="inline-flex items-baseline tabular-nums">
                {prefix && <span>{prefix}</span>}
                <span>{value}</span>
                {suffix && <span>{suffix}</span>}
            </span>
        );
    }

    return (
        <span ref={ref} className="inline-flex items-baseline tabular-nums">
            {prefix && <span>{prefix}</span>}
            <motion.span>{displayValue}</motion.span>
            {suffix && <span>{suffix}</span>}
        </span>
    );
}

// --- STAT ITEM (style éditorial & carnet de bord — inspiré Article-1 / Cop1) ---
function StatItem({
    value,
    prefix,
    suffix,
    label,
    sublabel,
    accent = '#6F2B75',
    highlighted = false,
}: {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    sublabel?: string;
    accent?: string;
    highlighted?: boolean;
}) {
    return (
        <div className="group/stat flex flex-col gap-1 py-6 sm:py-2 sm:px-8 first:pl-0 last:pr-0 text-left hover:-translate-y-1.5 transition-transform duration-300 will-change-transform">
            {/* Chiffre en Shrikhand — grand, lisible */}
            <div className="relative inline-block self-start font-display leading-none mb-1 group-hover/stat:scale-105 transition-transform duration-300 origin-left" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', color: accent }}>
                <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                {highlighted && (
                    <HandDrawnCircle stroke="#EC602B" strokeWidth={2.5} className="-inset-x-4 -inset-y-2.5 w-[calc(100%+2rem)] h-[calc(100%+1.25rem)]" />
                )}
            </div>
            {/* Label court */}
            <p className="text-[#2A082D] font-bold text-sm leading-snug">{label}</p>
            {/* Sous-label optionnel */}
            {sublabel && <p className="text-slate-500 text-xs font-medium mt-0.5">{sublabel}</p>}
        </div>
    );
}

// --- MAIN SECTION ---
export function KeyFigures() {
    return (
        <section className="relative py-20 md:py-28 bg-[#FFFBF4] overflow-hidden">
            {/* Trame filigrane Phœnix officielle */}
            <div className="pattern-watermark" aria-hidden="true" />

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {/* En-tête éditorial avec surlignage feutre & micro-tampon */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 md:mb-20">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="w-6 h-[2px] bg-[#EC602B] shrink-0" />
                            <span className="text-[11px] uppercase font-school font-bold tracking-widest text-[#904990]">
                                Résultats & Impact Terrain
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-normal mb-3 text-balance">
                            Des résultats qui ont{' '}
                            <span className="marker-highlight text-[#6F2B75]">
                                <span>du sens</span>
                            </span>.
                        </h2>
                        <p className="text-slate-600 font-medium text-sm sm:text-base text-pretty">
                            Depuis 2011, chaque statistique représente des heures de partage, des déclics scolaires et des barrières d'autocensure qui tombent.
                        </p>
                    </div>

                    {/* Micro-tampon graphique circulaire artisanal */}
                    <div className="self-start sm:self-center shrink-0">
                        <div className="badge-stamp badge-stamp-purple rotate-2 text-[10px] shadow-phoenix-colored">
                            <span className="text-[9px] text-[#EC602B] tracking-widest font-extrabold">MARSEILLE</span>
                            <span className="text-xs text-[#6F2B75] font-black leading-tight">IMPACT CERTIFIÉ</span>
                            <span className="text-[8px] text-slate-500 font-semibold tracking-tight">100% BÉNÉVOLAT</span>
                        </div>
                    </div>
                </div>

                {/* ── RANGÉE ÉDITORIALE 4 CHIFFRES (inspiré Article-1 / Wellesley) ── */}
                {/* Desktop : 4 stats séparées par des lignes verticales */}
                <div className="hidden sm:flex flex-row items-stretch divide-x divide-[#2A082D]/10">
                    <StatItem
                        value={300}
                        suffix="+"
                        label="Jeunes accompagnés"
                        sublabel="Collégiens & lycéens marseillais"
                        accent="#6F2B75"
                    />
                    <StatItem
                        value={100}
                        prefix="+"
                        label="Étudiants tuteurs"
                        sublabel="100% bénévolat KEDGE BS"
                        accent="#EC602B"
                        highlighted={true}
                    />
                    <StatItem
                        value={9}
                        label="Projets de terrain"
                        sublabel="Actifs dans les quartiers"
                        accent="#2A082D"
                    />
                    <StatItem
                        value={100}
                        suffix="%"
                        label="Taux de réussite"
                        sublabel="Aux examens officiels"
                        accent="#6F2B75"
                    />
                </div>

                {/* Mobile : 2x2 grid */}
                <div className="sm:hidden grid grid-cols-2 gap-px bg-[#2A082D]/10 rounded-xl overflow-hidden mb-12">
                    {[
                        { value: 300, suffix: '+', label: 'Jeunes accompagnés', sub: 'Collégiens & lycéens', accent: '#6F2B75', highlighted: false },
                        { value: 100, prefix: '+', label: 'Étudiants tuteurs', sub: '100% bénévolat', accent: '#EC602B', highlighted: true },
                        { value: 9, label: 'Projets actifs', sub: 'Dans les quartiers', accent: '#2A082D', highlighted: false },
                        { value: 100, suffix: '%', label: 'Taux de réussite', sub: 'Aux examens', accent: '#6F2B75', highlighted: false },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#FFFBF4] p-5 flex flex-col gap-1">
                            <div className="relative inline-block self-start font-display text-4xl leading-none mb-1" style={{ color: stat.accent }}>
                                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                {stat.highlighted && (
                                    <HandDrawnCircle stroke="#EC602B" strokeWidth={2.5} className="-inset-x-3 -inset-y-1.5 w-[calc(100%+1.5rem)] h-[calc(100%+0.75rem)]" />
                                )}
                            </div>
                            <p className="text-[#2A082D] font-bold text-xs leading-snug">{stat.label}</p>
                            <p className="text-[#7C677E] text-[11px]">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
