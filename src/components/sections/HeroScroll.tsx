import { Link } from 'react-router-dom';
import { ArrowRight, Heart, GraduationCap } from 'lucide-react';
import { MaskingTape } from '../common/HandDrawnElements';

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
                            <h1 className="text-4xl xl:text-6xl font-display leading-[1.14] text-[#2A082D]">
                                Faire briller <br />
                                <span className="marker-highlight text-[#EC602B]">
                                    <span>tous les talents</span>
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

                            {/* Double CTA avec annotation manuscrite et lueur au hover */}
                            <div className="relative flex flex-wrap items-center gap-4 pt-2">
                                <div className="relative">
                                    <Link
                                        to="/projets"
                                        className="btn-phoenix-gradient btn-glow-orange px-8 py-4 text-sm rounded-lg flex items-center gap-2 touch-tactile"
                                    >
                                        <span>Découvrir nos 9 projets</span>
                                        <ArrowRight size={18} />
                                    </Link>
                                    {/* Annotation dessinée Allura pointant vers le bouton */}
                                    <div className="hidden xl:flex items-center gap-1.5 absolute -top-8 -right-16 font-script text-2xl text-[#6F2B75] pointer-events-none rotate-2 select-none">
                                        <span>Sur le terrain</span>
                                        <span className="text-xl">⤵</span>
                                    </div>
                                </div>

                                <Link
                                    to="/contact"
                                    className="btn-phoenix-outline px-7 py-3.5 text-sm rounded-lg hover:border-[#6F2B75] touch-tactile"
                                >
                                    <Heart size={16} className="text-[#EC602B] fill-[#EC602B]" />
                                    <span>Rejoindre l'aventure</span>
                                </Link>
                            </div>

                            {/* Réassurance en texte simple */}
                            <p className="text-xs font-semibold text-[#7C677E] tracking-wide pt-1">
                                5 Cordées de la Réussite · Association Reconnue d'Intérêt Général
                            </p>
                        </div>

                        {/* ── COLONNE DROITE : Composition asymétrique & chevauchements ── */}
                        <div className="lg:col-span-5 relative h-[500px] xl:h-[560px] flex items-center justify-center">
                            {/* Grand conteneur asymétrique organique avec Scotch */}
                            <div className="relative w-[340px] xl:w-[400px] aspect-[4/5] z-10">
                                {/* Ruban adhésif Masking Tape posé directement sur le haut de la photo */}
                                <MaskingTape variant="warm" angle="left" className="-top-2.5 right-8 z-30" />
                                <MaskingTape variant="lilac" angle="right" className="top-4 -left-3 z-30 !w-16 !h-4.5" />

                                <div className="w-full h-full rounded-organic overflow-hidden photo-frame-organic border-2 border-white/80 relative">
                                    <img
                                        src="/images/projects/hero-1.webp"
                                        alt="Étudiants de KEDGE en séance de tutorat avec des lycéens marseillais"
                                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
                                        draggable={false}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/40 via-transparent to-transparent pointer-events-none" />
                                </div>
                            </div>

                            {/* Médaillon circulaire d'ambiance en déport */}
                            <div className="absolute -top-4 -left-4 xl:-left-8 w-36 h-36 rounded-full overflow-hidden shadow-phoenix-colored border-4 border-white z-20">
                                <img
                                    src="/images/projects/hero-3.webp"
                                    alt="Sortie culturelle au musée avec les jeunes tutorés Phœnix"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                            </div>

                            {/* Micro-tampon graphique circulaire artisanal */}
                            <div className="absolute -top-3 -right-2 xl:-right-5 z-30 badge-stamp text-[10px] -rotate-3 font-school font-bold shadow-phoenix-colored">
                                <span className="text-[9px] text-[#6F2B75] tracking-widest font-extrabold">MARSEILLE</span>
                                <span className="text-xs text-[#EC602B] font-black leading-tight">DEPUIS 2011</span>
                                <span className="text-[8px] text-slate-600 font-semibold tracking-tight">100% BÉNÉVOLE</span>
                            </div>

                            {/* Pastille chiffrée flottante imbriquée (chevauchement d'angle) */}
                            <div className="absolute -bottom-4 -left-4 xl:-left-8 z-30 shadow-phoenix-colored-lg">
                                <MacaronBadge
                                    icon={<GraduationCap size={16} />}
                                    value="300+ Jeunes"
                                    label="Collégiens & lycéens suivis"
                                    className="border border-[#6F2B75]/20 bg-[#FFFBF4]/95 backdrop-blur-sm"
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

                {/* Kicker mobile */}
                <div className="relative z-10 flex items-center gap-2 mb-3">
                    <span className="w-5 h-[2px] bg-[#EC602B]" />
                    <span className="text-[11px] uppercase font-school font-bold tracking-widest text-[#904990]">KEDGE BS · 100% Bénévole à Marseille</span>
                </div>

                {/* H1 mobile Shrikhand avec surlignage feutre */}
                <h1 className="relative z-10 text-3xl sm:text-4xl font-display text-[#2A082D] mb-3 leading-tight">
                    Faire briller <br />
                    <span className="marker-highlight text-[#EC602B]">
                        <span>tous les talents</span>
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
                        className="flex-1 btn-phoenix-gradient btn-glow-orange py-3 px-4 text-xs rounded-lg"
                    >
                        <span>Nos 9 projets</span>
                        <ArrowRight size={14} />
                    </Link>
                    <Link
                        to="/contact"
                        className="flex-1 btn-phoenix-outline py-3 px-4 text-xs rounded-lg"
                    >
                        <Heart size={13} className="text-[#EC602B] fill-[#EC602B]" />
                        <span>Rejoindre</span>
                    </Link>
                </div>

                {/* Composition photo mobile asymétrique avec stickers & scotch */}
                <div className="relative z-10 w-full max-w-sm mx-auto mb-4">
                    {/* Ruban adhésif Masking Tape d'angle */}
                    <MaskingTape variant="warm" angle="left" className="-top-2 left-6 z-30" />
                    <div className="relative w-full aspect-[4/3] rounded-organic-sm overflow-hidden photo-frame-organic border-2 border-white/80">
                        <img
                            src="/images/projects/hero-1.webp"
                            alt="Étudiants de KEDGE en séance de tutorat avec des lycéens marseillais"
                            className="w-full h-full object-cover object-top"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/40 via-transparent to-transparent" />
                    </div>

                    {/* Micro-tampon mobile rotatif */}
                    <div className="absolute -top-3 -right-2 z-20 badge-stamp text-[9px] -rotate-3 font-school font-bold shadow-soft py-1 px-2.5">
                        <span className="text-[#6F2B75] font-extrabold text-[8px]">MARSEILLE</span>
                        <span className="text-[#EC602B] font-black text-[10px]">DEPUIS 2011</span>
                    </div>

                    {/* 1 badge mobile imbriqué chevauchant l'angle */}
                    <div className="absolute -bottom-3 -left-2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFBF4] border border-[#6F2B75]/20 shadow-phoenix-colored text-[11px] font-bold text-[#6F2B75]">
                        <GraduationCap size={13} className="text-[#6F2B75]" />
                        <span>300+ Jeunes accompagnés</span>
                    </div>
                </div>
            </section>
        </>
    );
}
