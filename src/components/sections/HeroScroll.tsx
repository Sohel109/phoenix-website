import { Link } from 'react-router-dom';
import { ArrowRight, Heart, GraduationCap } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   MACARON BADGE (simplifié — 1 seul badge, plus sobre)
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg
                bg-white/95 border border-[#6F2B75]/15
                shadow-soft text-xs font-sans text-[#2A082D]
                select-none pointer-events-none whitespace-nowrap ${className}`}
        >
            <div className="w-8 h-8 rounded-full bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shrink-0">
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
   De-IA-fié : kicker éditorial, moins de badges flottants,
   boutons sobres, pas de glassmorphisme sur les badges
───────────────────────────────────────────────────────────── */
export function HeroScroll() {
    return (
        <>
            {/* ══════════════════════════════════════════════════════
                SECTION DESKTOP (≥ 768px)
            ══════════════════════════════════════════════════════ */}
            <section className="hidden md:block relative w-full min-h-[92vh] bg-[#FFFBF4] overflow-hidden">
                {/* Trame filigrane Phœnix officielle (5% opacité) */}
                <div className="pattern-watermark" aria-hidden="true" />

                {/* ── GRILLE PRINCIPALE ── */}
                <div className="relative z-10 container mx-auto px-6 lg:px-10 xl:px-16 max-w-7xl h-full min-h-[92vh] flex items-center">
                    <div className="grid lg:grid-cols-12 gap-12 xl:gap-16 items-center w-full py-24 lg:py-16">

                        {/* ── COLONNE GAUCHE : Message éditorial ── */}
                        <div className="lg:col-span-7 flex flex-col gap-6 items-start text-left">

                            {/* Kicker éditorial sobre — ligne + texte uppercase (inspiré GenAct / Article-1) */}
                            <div className="flex items-center gap-2.5">
                                <span className="w-6 h-[2px] bg-[#EC602B] shrink-0" />
                                <span className="text-[11px] uppercase font-school font-bold tracking-widest text-[#904990]">
                                    KEDGE Business School Marseille · 100% Bénévole
                                </span>
                            </div>

                            {/* Titre Shrikhand signature de la Charte */}
                            <h1 className="text-4xl xl:text-6xl font-display leading-[1.12] text-[#2A082D]">
                                Faire briller <br />
                                <span className="text-[#EC602B]">
                                    tous les talents
                                </span> <br />
                                de Marseille.
                            </h1>

                            {/* Note manuscrite d'ancrage authentique */}
                            <div className="font-script text-2xl xl:text-3xl text-[#6F2B75] -mt-2 select-none">
                                L'égalité des chances sur le terrain depuis 2011
                            </div>

                            {/* Paragraphe chaleureux */}
                            <p className="text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
                                Chaque semaine, plus de <strong className="text-[#2A082D] font-bold">100 étudiants de KEDGE BS</strong> accompagnent <strong className="text-[#2A082D] font-bold">300 collégiens et lycéens</strong> des quartiers prioritaires. Notre engagement : créer le déclic, vaincre l'autocensure et ouvrir grand le champ des possibles.
                            </p>

                            {/* Double CTA — boutons sobres sans gradient */}
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

                            {/* Réassurance en texte simple — pas de pill badge */}
                            <p className="text-xs font-semibold text-slate-400 tracking-wide pt-1">
                                5 Cordées de la Réussite · Association Reconnue d'Intérêt Général
                            </p>
                        </div>

                        {/* ── COLONNE DROITE : Photo principale + 1 badge clé ── */}
                        <div className="lg:col-span-5 relative h-[500px] xl:h-[560px] flex items-center justify-center">
                            {/* Grand médaillon central — border-radius réduit (moins "template") */}
                            <div className="relative w-[340px] xl:w-[400px] aspect-[4/5] rounded-2xl overflow-hidden shadow-soft-lg border-4 border-white z-10">
                                <img
                                    src="/images/projects/hero-1.png"
                                    alt="Étudiants de KEDGE en séance de tutorat avec des lycéens marseillais"
                                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/40 via-transparent to-transparent pointer-events-none" />
                            </div>

                            {/* Médaillon circulaire d'ambiance */}
                            <div className="absolute -top-4 -left-4 xl:-left-8 w-36 h-36 rounded-full overflow-hidden shadow-soft border-4 border-white z-20">
                                <img
                                    src="/images/projects/hero-3.png"
                                    alt="Sortie culturelle au musée avec les jeunes tutorés Phœnix"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>

                            {/* 1 seul badge flottant — le chiffre le plus parlant */}
                            <div className="absolute bottom-6 -left-4 xl:-left-6 z-30">
                                <MacaronBadge
                                    icon={<GraduationCap size={16} />}
                                    value="300+ Jeunes"
                                    label="Collégiens & lycéens suivis"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════
                SECTION MOBILE (< 768px)
            ══════════════════════════════════════════════════════ */}
            <section
                style={{ paddingTop: 'calc(max(6.5rem, env(safe-area-inset-top, 0px) + 5rem))' }}
                className="md:hidden relative w-full pb-16 px-5 bg-[#FFFBF4] overflow-hidden flex flex-col items-center text-center"
            >
                {/* Trame filigrane Phœnix officielle mobile */}
                <div className="pattern-watermark" aria-hidden="true" />

                {/* Kicker mobile — éditorial (ligne + texte, pas de badge-pill) */}
                <div className="relative z-10 flex items-center gap-2 mb-3">
                    <span className="w-5 h-[2px] bg-[#EC602B]" />
                    <span className="text-[11px] uppercase font-school font-bold tracking-widest text-[#904990]">KEDGE BS · 100% Bénévole à Marseille</span>
                </div>

                {/* H1 mobile Shrikhand */}
                <h1 className="relative z-10 text-3xl sm:text-4xl font-display text-[#2A082D] mb-3 leading-tight">
                    Faire briller <br />
                    <span className="text-[#EC602B]">
                        tous les talents
                    </span> <br />
                    de Marseille.
                </h1>

                {/* Note manuscrite mobile */}
                <div className="relative z-10 font-script text-2xl text-[#6F2B75] mb-3">
                    L'égalité des chances sur le terrain depuis 2011
                </div>

                <p className="relative z-10 text-slate-700 text-sm leading-relaxed mb-6 max-w-xs font-medium">
                    Tutorat académique, sorties culturelles et mentorat pour 300 jeunes marseillais chaque semaine.
                </p>

                {/* CTAs mobile */}
                <div className="relative z-10 flex flex-row gap-2.5 w-full max-w-xs justify-center items-center mb-8">
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

                {/* Composition photo mobile */}
                <div className="relative z-10 w-full max-w-sm mx-auto mb-4">
                    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-soft border-4 border-white">
                        <img
                            src="/images/projects/hero-1.png"
                            alt="Étudiants de KEDGE en séance de tutorat avec des lycéens marseillais"
                            className="w-full h-full object-cover object-top"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/40 via-transparent to-transparent" />
                    </div>

                    {/* 1 badge mobile sobre — sans glassmorphisme */}
                    <div className="absolute -bottom-3 -left-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#ECDDFD] shadow-soft text-[11px] font-bold text-[#6F2B75]">
                        <GraduationCap size={13} className="text-[#6F2B75]" />
                        <span>300+ Jeunes accompagnés</span>
                    </div>
                </div>
            </section>
        </>
    );
}
