import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { Users, Heart, Zap, Award } from 'lucide-react';
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
            <span className="inline-flex items-center justify-center tabular-nums">
                {prefix && <span>{prefix}</span>}
                <span>{value}</span>
                {suffix && <span>{suffix}</span>}
            </span>
        );
    }

    return (
        <span ref={ref} className="inline-flex items-center justify-center tabular-nums">
            {prefix && <span>{prefix}</span>}
            <motion.span>{displayValue}</motion.span>
            {suffix && <span>{suffix}</span>}
        </span>
    );
}

// --- MAIN SECTION ---
export function KeyFigures() {

    return (
        <section className="relative py-20 md:py-28 bg-[#FFFBF4] overflow-hidden">
            {/* Trame filigrane Phœnix officielle */}
            <div className="pattern-watermark" aria-hidden="true" />

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {/* Header with human associative touch */}
                <div className="text-center mb-14 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECDDFD] text-[#6F2B75] text-xs font-school font-bold tracking-wider uppercase mb-3 -rotate-1 shadow-soft">
                        <span className="w-2 h-2 rounded-full bg-[#EC602B]" />
                        <span>Résultats &amp; Impact Mesuré sur le Terrain</span>
                    </div>

                    <p className="font-script text-2xl md:text-3xl text-[#2A082D] mb-1">
                        ~ L'humain et la proximité avant tout ~
                    </p>

                    <h2 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-normal mb-3 text-balance">
                        Des résultats{' '}
                        <span className="bg-gradient-to-r from-[#6F2B75] to-[#EC602B] bg-clip-text text-transparent">
                            qui ont du sens.
                        </span>
                    </h2>
                    <p className="text-slate-600 font-medium text-sm sm:text-base max-w-xl mx-auto text-pretty">
                        Depuis 2011, chaque statistique représente des heures de partage, des déclics scolaires et des barrières d'autocensure qui tombent.
                    </p>
                </div>

                {/* ── BENTO ASYMÉTRIQUE CHALEUREUX (Charte Lise Dehedin : Le cercle avant le rectangle) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* CARTE 1 (Héroïque - 7 cols) : Les Jeunes Accompagnés */}
                    <div className="lg:col-span-7 bg-[#ECDDFD] text-[#2A082D] rounded-[2.5rem] p-7 sm:p-9 border border-[#6F2B75]/15 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="w-11 h-11 rounded-full bg-[#6F2B75] text-white flex items-center justify-center shadow-xs">
                                <Users size={20} />
                            </div>
                            <span className="px-3.5 py-1.5 rounded-full bg-white text-[#6F2B75] border border-[#6F2B75]/20 text-xs font-school font-bold tracking-wider shadow-xs">
                                Collèges &amp; Lycées de Marseille
                            </span>
                        </div>

                        <div>
                            <div className="text-5xl sm:text-6xl font-display text-[#6F2B75] leading-none mb-2">
                                <AnimatedCounter value={300} suffix="+" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-[#2A082D] tracking-tight mb-2">
                                Jeunes marseillais accompagnés
                            </h3>
                            <p className="text-[#2A082D]/80 text-sm leading-relaxed max-w-lg mb-4 font-medium">
                                De la 6ème jusqu'au baccalauréat, suivis individuellement ou en petits groupes chaque semaine par nos étudiants tuteurs.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[#6F2B75]/15 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-1.5">
                                {['L\'Estaque', 'Quartiers Nord', 'Saint-Gabriel', 'Roy d\'Espagne'].map((quartier) => (
                                    <span key={quartier} className="px-2.5 py-0.5 rounded-full bg-white/70 text-[#6F2B75] text-[11px] font-school font-bold">
                                        {quartier}
                                    </span>
                                ))}
                            </div>
                            <span className="font-script text-lg text-[#2A082D]">
                                ~ Des séances tout au long de la semaine ~
                            </span>
                        </div>
                    </div>

                    {/* CARTE 2 (5 cols) : Les Tuteurs KEDGE */}
                    <div className="lg:col-span-5 bg-[#E1BBCB] text-[#2A082D] rounded-[2.5rem] p-7 sm:p-9 border border-[#EC602B]/20 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="w-11 h-11 rounded-full bg-[#EC602B] text-white flex items-center justify-center shadow-xs">
                                <Heart size={20} />
                            </div>
                            <span className="px-3.5 py-1.5 rounded-full bg-white text-[#2A082D] border border-white/40 text-xs font-school font-bold tracking-wider shadow-xs">
                                100% Bénévolat
                            </span>
                        </div>

                        <div>
                            <div className="text-5xl sm:text-6xl font-display text-[#EC602B] leading-none mb-2">
                                <AnimatedCounter value={100} prefix="+" />
                            </div>
                            <h3 className="text-xl font-bold text-[#2A082D] tracking-tight mb-2">
                                Étudiants tuteurs de KEDGE BS
                            </h3>
                            <p className="text-[#2A082D]/80 text-sm leading-relaxed font-medium">
                                Mobilisés chaque semaine pour transmettre le goût d'apprendre, la méthodologie et ouvrir les perspectives d'avenir.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-[#EC602B]/20 flex items-center justify-between">
                            <span className="text-xs font-school font-bold text-[#2A082D]">
                                Campus Marseille Luminy
                            </span>
                            <span className="font-script text-lg text-[#2A082D]">
                                ~ Grandir ensemble ~
                            </span>
                        </div>
                    </div>


                    {/* CARTE 3 (5 cols) : Les 9 Projets de terrain */}
                    <div className="lg:col-span-5 bg-[#2A082D] bg-bird-pattern-dark text-white rounded-[2.5rem] p-7 sm:p-9 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="w-11 h-11 rounded-full bg-white text-[#EC602B] flex items-center justify-center shadow-xs">
                                <Zap size={20} />
                            </div>
                            <span className="px-3.5 py-1.5 rounded-full bg-white/15 text-[#FF7E2E] border border-white/20 text-xs font-school font-bold tracking-wider">
                                Ancrage Local
                            </span>
                        </div>

                        <div>
                            <div className="text-5xl sm:text-6xl font-display text-white leading-none mb-2">
                                <AnimatedCounter value={9} />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                                Projets de terrain actifs
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-4 font-medium">
                                Des antennes scolaires au cœur des quartiers pour intervenir au plus près des besoins des élèves.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/15 flex flex-wrap gap-1.5">
                            {['Sup d\'OM', 'Massa 13', 'Izzo', 'Jules Ferry', 'ACSE'].map((p) => (
                                <span key={p} className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-school font-bold">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* CARTE 4 (7 cols) : Réussite et Cordées */}
                    <div className="lg:col-span-7 bg-white text-[#2A082D] rounded-[2.5rem] p-7 sm:p-9 border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <div className="w-11 h-11 rounded-full bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shadow-xs">
                                <Award size={20} />
                            </div>
                            <span className="px-3.5 py-1.5 rounded-full bg-[#ECDDFD] text-[#6F2B75] border border-[#6F2B75]/15 text-xs font-school font-bold tracking-wider shadow-xs">
                                Brevet & Baccalauréat
                            </span>
                        </div>

                        <div className="grid sm:grid-cols-12 gap-6 items-center">
                            <div className="sm:col-span-5">
                                <div className="text-5xl sm:text-6xl font-display bg-gradient-to-r from-[#6F2B75] to-[#EC602B] bg-clip-text text-transparent leading-none mb-1">
                                    <AnimatedCounter value={100} suffix="%" />
                                </div>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#2A082D]">
                                    Taux de Réussite aux Examens
                                </p>
                            </div>

                            <div className="sm:col-span-7 sm:border-l sm:border-[#ECDDFD] sm:pl-6">
                                <h3 className="text-lg font-bold text-[#2A082D] tracking-tight mb-1.5">
                                    Excellence & Confiance retrouvée
                                </h3>
                                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                                    100% de réussite aux examens officiels pour les collégiens et lycéens assidus à nos séances hebdomadaires.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#ECDDFD] flex flex-wrap items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECDDFD]/60 text-[#6F2B75] text-xs font-school font-bold">
                                5 Cordées de la Réussite
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                Reconnue d'Intérêt Général
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
