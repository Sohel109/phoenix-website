import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

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

// --- STAT ITEM (style éditorial — inspiré Article-1 / Wellesley) ---
function StatItem({
    value,
    prefix,
    suffix,
    label,
    sublabel,
    accent = '#6F2B75',
}: {
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    sublabel?: string;
    accent?: string;
}) {
    return (
        <div className="flex flex-col gap-1 py-6 sm:py-0 sm:px-8 first:pl-0 last:pr-0 text-left">
            {/* Chiffre en Shrikhand — grand, lisible */}
            <div className="font-display leading-none mb-1" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', color: accent }}>
                <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
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
                {/* En-tête éditorial — kicker ligne + titre (pas de badge-pill) */}
                <div className="mb-14 md:mb-20">
                    <div className="flex items-center gap-2.5 mb-4">
                        <span className="w-6 h-[2px] bg-[#EC602B] shrink-0" />
                        <span className="text-[11px] uppercase font-school font-bold tracking-widest text-[#904990]">
                            Résultats & Impact Terrain
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-normal mb-3 text-balance">
                        Des résultats qui ont du sens.
                    </h2>
                    <p className="text-slate-600 font-medium text-sm sm:text-base max-w-xl text-pretty">
                        Depuis 2011, chaque statistique représente des heures de partage, des déclics scolaires et des barrières d'autocensure qui tombent.
                    </p>
                </div>

                {/* ── RANGÉE ÉDITORIALE 4 CHIFFRES (inspiré Article-1 / Wellesley) ── */}
                {/* Desktop : 4 stats séparées par des lignes verticales */}
                <div className="hidden sm:flex flex-row items-stretch divide-x divide-[#2A082D]/10 mb-16">
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
                        { value: 300, suffix: '+', label: 'Jeunes accompagnés', sub: 'Collégiens & lycéens', accent: '#6F2B75' },
                        { value: 100, prefix: '+', label: 'Étudiants tuteurs', sub: '100% bénévolat', accent: '#EC602B' },
                        { value: 9, label: 'Projets actifs', sub: 'Dans les quartiers', accent: '#2A082D' },
                        { value: 100, suffix: '%', label: 'Taux de réussite', sub: 'Aux examens', accent: '#6F2B75' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#FFFBF4] p-5 flex flex-col gap-1">
                            <div className="font-display text-4xl leading-none mb-1" style={{ color: stat.accent }}>
                                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                            </div>
                            <p className="text-[#2A082D] font-bold text-xs leading-snug">{stat.label}</p>
                            <p className="text-slate-400 text-[11px]">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── BLOC NARRATIF (remplace les 4 cartes bento) ── */}
                {/* 2 colonnes : détail Jeunes + Cordées/Intérêt général */}
                <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-[#2A082D]/10">

                    {/* Colonne 1 : Quartiers et projets */}
                    <div>
                        <h3 className="text-lg font-bold text-[#2A082D] mb-2">Au cœur des quartiers de Marseille</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
                            De L'Estaque aux Quartiers Nord, nos antennes interviennent chaque semaine dans les établissements scolaires pour un suivi personnalisé, en groupe ou en individuel.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["L'Estaque", "Quartiers Nord", "Saint-Gabriel", "Roy d'Espagne", "Sup d'OM", "Massa 13"].map((q) => (
                                <span
                                    key={q}
                                    className="px-2.5 py-1 rounded text-[11px] font-school font-bold text-[#6F2B75] bg-[#ECDDFD]/60 border border-[#6F2B75]/15"
                                >
                                    {q}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Colonne 2 : Reconnaissance institutionnelle */}
                    <div>
                        <h3 className="text-lg font-bold text-[#2A082D] mb-2">Reconnue et labellisée</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
                            Phœnix EDC fait partie des 5 <strong className="text-[#2A082D]">Cordées de la Réussite</strong> de KEDGE BS et est reconnue Association d'Intérêt Général — un gage de sérieux et de transparence.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["5 Cordées de la Réussite", "Intérêt Général", "Campus Luminy"].map((l) => (
                                <span
                                    key={l}
                                    className="px-2.5 py-1 rounded text-[11px] font-school font-bold text-[#EC602B] bg-[#EC602B]/8 border border-[#EC602B]/20"
                                >
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
