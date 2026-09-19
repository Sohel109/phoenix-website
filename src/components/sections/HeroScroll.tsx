import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Zap, GraduationCap, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   MACARON BADGE ROND (Charte p. 12 & 14 — "Le cercle avant le rectangle")
───────────────────────────────────────────────────────────── */
function MacaronBadge({
    icon,
    label,
    value,
    className = '',
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    className?: string;
}) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full
                bg-white/95 backdrop-blur-md border border-[#6F2B75]/20
                shadow-soft hover:shadow-soft-lg text-xs font-sans text-[#2A082D]
                select-none pointer-events-none transition-all whitespace-nowrap ${className}`}
        >
            <div className="w-8 h-8 rounded-full bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shrink-0 shadow-xs">
                {icon}
            </div>
            <div className="flex flex-col text-left">
                {value && <span className="font-display text-sm font-bold text-[#EC602B] leading-none">{value}</span>}
                <span className="font-semibold text-[11px] text-[#2A082D] leading-tight">{label}</span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   HERO PRINCIPAL (Charte Graphique DA Lise Dehedin 2025-2026)
───────────────────────────────────────────────────────────── */
export function HeroScroll() {
    return (
        <>
            {/* ══════════════════════════════════════════════════════
                SECTION DESKTOP (≥ 768px)
            ══════════════════════════════════════════════════════ */}
            <section className="hidden md:block relative w-full min-h-[92vh] bg-[#FFFBF4] bg-bird-pattern overflow-hidden">

                {/* ── GRILLE PRINCIPALE ── */}
                <div className="relative z-10 container mx-auto px-6 lg:px-10 xl:px-16 max-w-7xl h-full min-h-[92vh] flex items-center">
                    <div className="grid lg:grid-cols-12 gap-12 xl:gap-16 items-center w-full py-24 lg:py-12">

                        {/* ── COLONNE GAUCHE : Message & Action chaleureux ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                            className="lg:col-span-7 flex flex-col gap-6 items-start text-left"
                        >
                            {/* Pastille officielle KEDGE BS */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ECDDFD] text-[#6F2B75] text-xs font-school font-bold tracking-wider shadow-xs">
                                <span className="w-2 h-2 rounded-full bg-[#EC602B] animate-pulse" />
                                <span>KEDGE Business School · Association étudiante</span>
                                <span className="text-[#904990]">·</span>
                                <span className="text-[#EC602B]">100% Bénévole</span>
                            </div>

                            {/* Titre Shrikhand signature */}
                            <h1 className="text-4xl xl:text-6xl font-display leading-[1.12] text-[#2A082D]">
                                Faire briller <br />
                                <span className="bg-gradient-to-r from-[#6F2B75] via-[#904990] to-[#EC602B] bg-clip-text text-transparent">
                                    tous les talents
                                </span>{' '}
                                <br />
                                de Marseille.
                            </h1>

                            {/* Note manuscrite Allura */}
                            <div className="font-script text-2xl xl:text-3xl text-[#EC602B] -mt-2 rotate-[-2deg] select-none">
                                ~ Depuis 2011, l'égalité des chances sur le terrain ~
                            </div>

                            {/* Paragraphe chaleureux */}
                            <p className="text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
                                Chaque semaine, plus de <strong className="text-[#6F2B75] font-bold">100 étudiants de KEDGE BS</strong> accompagnent <strong className="text-[#EC602B] font-bold">300 collégiens et lycéens</strong> des quartiers prioritaires. Notre engagement : créer le déclic, vaincre l'autocensure et ouvrir grand le champ des possibles.
                            </p>

                            {/* Double CTA en pilules douces */}
                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link
                                    to="/projets"
                                    className="btn-phoenix-gradient px-8 py-4 text-sm"
                                >
                                    <span>Découvrir nos 9 projets</span>
                                    <ArrowRight size={18} />
                                </Link>

                                <Link
                                    to="/contact"
                                    className="btn-phoenix-outline px-7 py-3.5 text-sm"
                                >
                                    <Heart size={16} className="text-[#EC602B] fill-[#EC602B]" />
                                    <span>Rejoindre l'aventure</span>
                                </Link>
                            </div>

                            {/* Micro-mention de réassurance */}
                            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-500">
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ECDDFD] text-[#6F2B75]">
                                    <Sparkles size={12} className="text-[#EC602B]" />
                                    5 Cordées de la Réussite
                                </span>
                                <span className="text-slate-400">·</span>
                                <span>Reconnue d'Intérêt Général</span>
                            </div>
                        </motion.div>

                        {/* ── COLONNE DROITE : Composition circulaire & douce ── */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                            className="lg:col-span-5 relative h-[500px] xl:h-[560px] flex items-center justify-center"
                        >
                            {/* Grand médaillon central arrondi / pilule */}
                            <div className="relative w-[340px] xl:w-[400px] aspect-[4/5] rounded-[3rem] overflow-hidden shadow-soft-lg border-4 border-white z-10">
                                <img
                                    src="/images/projects/hero-1.png"
                                    alt="Tuteurs et tutorés de Phoenix EDC à Marseille"
                                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/40 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* Médaillon circulaire d'ambiance 2 */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="absolute -top-4 -left-4 xl:-left-8 w-36 h-36 rounded-full overflow-hidden shadow-soft border-4 border-white z-20"
                            >
                                <img
                                    src="/images/projects/hero-3.png"
                                    alt="Sorties et ateliers"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </motion.div>

                            {/* Badge Macaron 1 : Projets actifs */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="absolute top-10 -right-4 xl:-right-6 z-30"
                            >
                                <MacaronBadge
                                    icon={<Zap size={16} />}
                                    value="9 Projets"
                                    label="Sur le terrain marseillais"
                                />
                            </motion.div>

                            {/* Badge Macaron 2 : Jeunes accompagnés */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="absolute bottom-6 -left-4 xl:-left-6 z-30"
                            >
                                <MacaronBadge
                                    icon={<GraduationCap size={16} />}
                                    value="300+ Jeunes"
                                    label="Collégiens & lycéens suivis"
                                />
                            </motion.div>

                            {/* Pastille officielle Phœnix avec logo rond */}
                            <div className="absolute bottom-4 right-6 z-30 p-1.5 rounded-full bg-white shadow-soft border border-[#ECDDFD]">
                                <img
                                    src="/logo-badge.jpg"
                                    alt="Logo officiel Phoenix"
                                    className="w-14 h-14 rounded-full object-contain"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                SECTION MOBILE (< 768px)
            ══════════════════════════════════════════════════════ */}
            <section 
                style={{ paddingTop: 'calc(max(6.5rem, env(safe-area-inset-top, 0px) + 5rem))' }}
                className="md:hidden relative w-full pb-14 px-5 bg-[#FFFBF4] bg-bird-pattern overflow-hidden flex flex-col items-center text-center"
            >
                {/* Pastille mobile */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ECDDFD] text-[#6F2B75] text-[11px] font-school font-bold tracking-wider mb-4 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#EC602B] animate-pulse" />
                    <span>KEDGE BS · 100% Bénévole</span>
                </div>

                {/* H1 mobile Shrikhand */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="text-3xl sm:text-4xl font-display text-[#2A082D] mb-3 leading-tight"
                >
                    Faire briller <br />
                    <span className="bg-gradient-to-r from-[#6F2B75] via-[#904990] to-[#EC602B] bg-clip-text text-transparent">
                        tous les talents
                    </span>{' '}
                    <br />
                    de Marseille.
                </motion.h1>

                {/* Note manuscrite mobile */}
                <div className="font-script text-2xl text-[#EC602B] mb-3 -rotate-2">
                    ~ Depuis 2011 sur le terrain ~
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-6 max-w-xs font-medium">
                    Tutorat, sorties culturelles et mentorat pour 300 jeunes marseillais chaque semaine.
                </p>

                {/* CTAs mobile en pilules */}
                <div className="flex flex-row gap-2.5 w-full max-w-xs justify-center items-center mb-8">
                    <Link
                        to="/projets"
                        className="flex-1 btn-phoenix-gradient py-3 px-4 text-xs"
                    >
                        <span>Nos 9 projets</span>
                        <ArrowRight size={14} />
                    </Link>
                    <Link
                        to="/contact"
                        className="flex-1 btn-phoenix-outline py-3 px-4 text-xs"
                    >
                        <Heart size={13} className="text-[#EC602B] fill-[#EC602B]" />
                        <span>Rejoindre</span>
                    </Link>
                </div>

                {/* Composition photo mobile arrondie */}
                <div className="relative w-full max-w-sm mx-auto mb-4">
                    <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-soft border-3 border-white">
                        <img
                            src="/images/projects/hero-1.png"
                            alt="Phoenix EDC Marseille"
                            className="w-full h-full object-cover object-top"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/40 via-transparent to-transparent" />
                    </div>

                    {/* Badge rond mobile 1 */}
                    <div className="absolute -bottom-3 -left-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#ECDDFD] shadow-soft text-[11px] font-bold text-[#6F2B75]">
                        <Zap size={13} className="text-[#EC602B]" />
                        <span>9 Projets de terrain</span>
                    </div>

                    {/* Badge rond mobile 2 */}
                    <div className="absolute -top-3 -right-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#ECDDFD] shadow-soft text-[11px] font-bold text-[#2A082D]">
                        <GraduationCap size={13} className="text-[#6F2B75]" />
                        <span>300+ Jeunes</span>
                    </div>
                </div>
            </section>
        </>
    );
}
