import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Zap, GraduationCap } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   FLOATING BADGE — Sobre, net & institutionnel
───────────────────────────────────────────────────────────── */
function FloatingBadge({
    icon,
    label,
    className,
}: {
    icon: React.ReactNode;
    label: string;
    className?: string;
}) {
    return (
        <div
            className={`absolute flex items-center gap-2 px-3.5 py-2 rounded-xl
                bg-white border border-slate-200/90
                shadow-xs text-xs font-bold text-slate-800
                select-none pointer-events-none z-20 ${className}`}
        >
            {icon}
            <span>{label}</span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   SVG DÉCORATIF — silhouette Notre-Dame de la Garde (filigrane)
───────────────────────────────────────────────────────────── */
function NdlgWatermark() {
    return (
        <svg
            viewBox="0 0 400 200"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[520px] opacity-[0.035] pointer-events-none select-none"
            fill="none"
            stroke="#0A192F"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {/* Colline */}
            <path d="M0 180 Q80 120 140 130 Q180 135 200 100 Q220 65 240 55 Q260 45 280 55 Q310 70 340 130 Q380 135 400 180 Z" />
            {/* Tour principale */}
            <rect x="185" y="40" width="30" height="70" rx="2" />
            {/* Clocher */}
            <rect x="190" y="20" width="20" height="25" rx="1.5" />
            {/* Lanterne */}
            <rect x="194" y="10" width="12" height="12" rx="1" />
            {/* Flèche & statue */}
            <line x1="200" y1="4" x2="200" y2="10" />
            {/* Porche gauche */}
            <path d="M160 110 L160 140 Q175 140 185 130 L185 110 Z" />
            {/* Porche droite */}
            <path d="M215 110 L215 130 Q225 140 240 140 L240 110 Z" />
            {/* Fenêtres */}
            <rect x="193" y="50" width="14" height="18" rx="7" />
            <rect x="170" y="90" width="8" height="12" rx="4" />
            <rect x="222" y="90" width="8" height="12" rx="4" />
            {/* Horizon mer */}
            <path d="M0 185 Q100 178 200 182 Q300 186 400 179" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────────
   SVG VAGUE marine — transition douce vers KeyFigures
───────────────────────────────────────────────────────────── */
function MarineWave() {
    return (
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] pointer-events-none z-10">
            <svg
                viewBox="0 0 1440 60"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="w-full h-[48px] md:h-[60px]"
            >
                <path
                    d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
                    className="fill-slate-50"
                />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   HERO PRINCIPAL
───────────────────────────────────────────────────────────── */
export function HeroScroll() {
    return (
        <>
            {/* ══════════════════════════════════════════════════════
                SECTION DESKTOP (≥ 768px) — SPLIT 2 COLONNES
            ══════════════════════════════════════════════════════ */}
            <section className="hidden md:block relative w-full min-h-[90vh] bg-[#FAFAFA] overflow-hidden">

                {/* Filigrane Notre-Dame de la Garde */}
                <NdlgWatermark />

                {/* ── GRILLE PRINCIPALE ── */}
                <div className="relative z-10 container mx-auto px-6 lg:px-10 xl:px-16 max-w-7xl h-full min-h-[90vh] flex items-center">
                    <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center w-full py-24 lg:py-0">

                        {/* ── COLONNE GAUCHE : Message & Action épuré ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col gap-9 items-start"
                        >
                            {/* Titre éditorial H1 */}
                            <div>
                                <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-black leading-[1.0] tracking-tight text-slate-900 uppercase">
                                    Faire briller <br />
                                    <span
                                        className="text-transparent bg-clip-text"
                                        style={{
                                            backgroundImage:
                                                'linear-gradient(90deg, #F97316 0%, #FBBF24 60%, #F97316 100%)',
                                        }}
                                    >
                                        les talents
                                    </span>{' '}
                                    <br />
                                    <span className="text-slate-900">de Marseille</span>
                                </h1>
                            </div>

                            {/* Double CTA structuré */}
                            <div className="flex flex-row gap-4 items-center">
                                <Link
                                    to="/projets"
                                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-sm hover:shadow transition-colors duration-200"
                                >
                                    <span>Découvrir nos projets</span>
                                    <ArrowRight size={18} />
                                </Link>

                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 hover:border-orange-500 bg-white hover:bg-orange-50/40 text-slate-800 hover:text-orange-600 font-bold text-base transition-colors duration-200 shadow-xs"
                                >
                                    <Heart size={16} className="text-orange-500" />
                                    <span>Nous rejoindre</span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* ── COLONNE DROITE : Composition photographique ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                            className="relative h-[520px] xl:h-[580px] flex items-center justify-center"
                        >
                            {/* ── Photo 1 : arrière-plan, penchée à -3deg ── */}
                            <motion.div
                                initial={{ opacity: 0, rotate: -6, scale: 0.9 }}
                                animate={{ opacity: 1, rotate: -3, scale: 1 }}
                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                                className="absolute top-8 right-8 xl:right-4 w-[52%] aspect-[4/5] rounded-xl overflow-hidden shadow-md border-2 border-white z-10"
                                style={{ transformOrigin: 'top right' }}
                            >
                                <img
                                    src="/images/projects/hero-2.png"
                                    alt="Tutorat Phoenix EDC"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                            </motion.div>

                            {/* ── Photo 2 : centrale principale, +2deg ── */}
                            <motion.div
                                initial={{ opacity: 0, rotate: 5, scale: 0.88 }}
                                animate={{ opacity: 1, rotate: 2, scale: 1 }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                                className="absolute bottom-4 left-0 xl:-left-4 w-[62%] aspect-[3/4] rounded-xl overflow-hidden shadow-md border-2 border-white z-20"
                                style={{ transformOrigin: 'bottom left' }}
                            >
                                <img
                                    src="/images/projects/hero-1.png"
                                    alt="Jeunes Phoenix EDC Marseille"
                                    className="w-full h-full object-cover object-top"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                            </motion.div>

                            {/* ── Photo 3 : accent haut gauche, -2deg ── */}
                            <motion.div
                                initial={{ opacity: 0, rotate: 3, scale: 0.85 }}
                                animate={{ opacity: 1, rotate: -1.5, scale: 1 }}
                                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                                className="absolute top-2 left-6 xl:left-0 w-[38%] aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white z-30"
                                style={{ transformOrigin: 'top left' }}
                            >
                                <img
                                    src="/images/projects/hero-3.png"
                                    alt="Sortie culturelle Phoenix EDC"
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                            </motion.div>

                            {/* ── Badge net 1 : Projets actifs ── */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className="absolute top-[14%] right-[2%] z-40"
                            >
                                <FloatingBadge
                                    icon={<Zap size={14} className="text-orange-500 shrink-0" />}
                                    label="9 Projets actifs à Marseille"
                                />
                            </motion.div>

                            {/* ── Badge net 2 : Jeunes accompagnés ── */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.85, duration: 0.5 }}
                                className="absolute bottom-[12%] right-[3%] z-40"
                            >
                                <FloatingBadge
                                    icon={<GraduationCap size={14} className="text-blue-600 shrink-0" />}
                                    label="300+ jeunes accompagnés"
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Vague marine de transition */}
                <MarineWave />
            </section>

            {/* ══════════════════════════════════════════════════════
                SECTION MOBILE (< 768px) — EMPILÉ COMPACT & ÉPURÉ
            ══════════════════════════════════════════════════════ */}
            <section className="md:hidden relative w-full pt-28 pb-10 px-5 bg-[#FAFAFA] overflow-hidden flex flex-col items-center text-center">

                {/* H1 mobile */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 uppercase mb-5"
                >
                    Faire briller <br />
                    <span
                        className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(90deg, #F97316 0%, #FBBF24 80%)' }}
                    >
                        les talents
                    </span>{' '}
                    <br />
                    de Marseille
                </motion.h1>

                {/* CTAs côte à côte structurés */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="flex flex-row gap-3 w-full max-w-xs justify-center items-center mb-8"
                >
                    <Link
                        to="/projets"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-xs active:scale-95 transition-all"
                    >
                        <span>Nos projets</span>
                        <ArrowRight size={15} />
                    </Link>
                    <Link
                        to="/contact"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-white border border-slate-300 hover:border-orange-500 text-slate-800 font-bold rounded-xl text-sm active:scale-95 transition-all shadow-xs"
                    >
                        <Heart size={13} className="text-orange-500" />
                        <span>Rejoindre</span>
                    </Link>
                </motion.div>

                {/* Composition photo mobile — nette & géométrique */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.65, delay: 0.25 }}
                    className="relative w-full max-w-sm mx-auto mb-6"
                >
                    {/* Photo principale */}
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md border-2 border-white">
                        <img
                            src="/images/projects/hero-1.png"
                            alt="Phoenix EDC Marseille"
                            className="w-full h-full object-cover object-top"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                    </div>

                    {/* Photo secondaire en coin bas-gauche */}
                    <div className="absolute -bottom-3 -left-2 w-24 h-24 rounded-lg overflow-hidden shadow-sm border-2 border-white z-10 rotate-2">
                        <img
                            src="/images/projects/hero-3.png"
                            alt="Activité Phoenix EDC"
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                    </div>

                    {/* Badge net 1 — haut droite */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-xs text-[11px] font-bold text-slate-800">
                        <Zap size={12} className="text-orange-500" />
                        <span>9 Projets actifs</span>
                    </div>

                    {/* Badge net 2 — bas droite */}
                    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200/90 shadow-xs text-[11px] font-bold text-slate-800">
                        <Users size={12} className="text-blue-500" />
                        <span>300+ jeunes</span>
                    </div>
                </motion.div>

                {/* Vague marine mobile */}
                <MarineWave />
            </section>
        </>
    );
}
