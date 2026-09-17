import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, HeartHandshake, ChevronLeft, ChevronRight, Compass, School } from 'lucide-react';

const culturalTripPhotos = [
    {
        src: "/images/home/voyage-culturel-1.jpg",
        alt: "Voyage culturel Phoenix : groupe de jeunes et tuteurs sur la côte",
        caption: "Voyage culturel avec les lycéens face à la Méditerranée"
    },
    {
        src: "/images/home/voyage-culturel-2.jpg",
        alt: "Sortie de groupe Phoenix sous les pins parasols",
        caption: "Découverte du patrimoine et grands voyages de fin d'année"
    },
    {
        src: "/images/home/voyage-culturel-3.jpg",
        alt: "Selfie dynamique des tuteurs et élèves Phoenix",
        caption: "Énergie, sourires et complicité sur le terrain"
    }
];

const eventHighlights = [
    {
        id: "simonu",
        title: "SimONU EDC",
        subtitle: "Simulation ONU & Négociation",
        image: "/images/events/simonu/simonu-speaker.jpg",
        objectPosition: "center center"
    },
    {
        id: "jedc",
        title: "La JEDC",
        subtitle: "Concours d'Éloquence",
        image: "/images/home/jedc-discours.png",
        objectPosition: "left center"
    }
];

export function ConcreteActions() {
    const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
    const [activeEventIdx, setActiveEventIdx] = useState(0);

    const nextPhoto = () => {
        setCurrentPhotoIdx((prev) => (prev + 1) % culturalTripPhotos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIdx((prev) => (prev - 1 + culturalTripPhotos.length) % culturalTripPhotos.length);
    };

    return (
        <section className="relative py-16 md:py-28 overflow-hidden bg-gradient-to-b from-transparent via-orange-50/20 to-transparent">
            {/* Background elements */}
            <div className="absolute top-1/4 -left-40 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                {/* Header with Youth Association Styling */}
                <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs mb-4 -rotate-1 hover:rotate-0 transition-transform">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Sur le terrain chaque semaine
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                            <MapPin size={12} /> Marseille & Métropole
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-slate-900 leading-[1.08] mb-5">
                        <span className="relative inline-block text-orange-600">
                            Des actions
                            <span className="absolute -bottom-1 left-0 w-full h-2.5 bg-orange-400/20 -rotate-1 rounded-sm -z-10" />
                        </span>{' '}
                        concrètes.
                    </h2>

                    <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Du lundi au samedi, nos 150 étudiants bénévoles retrouvent 300 jeunes marseillais dans leurs collèges, lycées et maisons de quartier.
                    </p>
                </div>

                {/* 3 Pillars Grid */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-14">

                    {/* ──────────────── PILIER 1 : LE TUTORAT HEBDOMADAIRE ──────────────── */}
                    <motion.article
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-300 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* Photo terrain en salle de tutorat */}
                        <div className="relative h-60 sm:h-68 w-full overflow-hidden bg-slate-100">
                            <img
                                src="/images/home/tutorat-hebdo-terrain.jpg"
                                alt="Séance studieuse de tutorat hebdomadaire Phoenix"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />

                            {/* Step Number Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md font-black text-slate-900 text-sm shadow-md border border-white/60">
                                    01
                                </span>
                            </div>

                            {/* Sticker */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-black shadow-md bg-orange-500 text-white rotate-2">
                                    9 Projets à Marseille 📍
                                </span>
                            </div>

                            {/* Photo Bottom Action Tag */}
                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-900 shadow-xs">
                                    <School size={12} className="text-orange-500" />
                                    Full tutorat & Soutien scolaire
                                </span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-orange-600 transition-colors">
                                    Le Tutorat Hebdomadaire
                                </h3>
                                <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3.5">
                                    9 projets · Méthodologie & Aide aux devoirs
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Phoenix déploie <strong className="text-slate-900 font-semibold">9 projets de terrain</strong> dans les collèges, lycées et centres sociaux de Marseille. Certains projets sont <strong className="text-orange-600 font-semibold">100% dédiés au tutorat académique</strong> (comme Massa 13, Saint Gabriel ou Jules Ferry) pour consolider les bases scolaires et la méthodologie, tandis que d'autres intègrent un accompagnement mixte adapté aux besoins des jeunes.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    to="/projets"
                                    className="inline-flex items-center gap-2 text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors"
                                >
                                    <span>Explorer nos 9 projets</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.article>

                    {/* ──────────────── PILIER 2 : L'ÉVEIL CULTUREL (3 PHOTOS + ACSE) ──────────────── */}
                    <motion.article
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-300 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* Mini-Carrousel des 3 photos de voyage */}
                        <div className="relative h-60 sm:h-68 w-full overflow-hidden bg-slate-900 select-none">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentPhotoIdx}
                                    src={culturalTripPhotos[currentPhotoIdx].src}
                                    alt={culturalTripPhotos[currentPhotoIdx].alt}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                            {/* Step Number Badge */}
                            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md font-black text-slate-900 text-sm shadow-md border border-white/60">
                                    02
                                </span>
                            </div>

                            {/* Sticker */}
                            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-black shadow-md bg-purple-600 text-white -rotate-2">
                                    Sorties & Voyages 🎭
                                </span>
                            </div>

                            {/* Navigation controls for the 3 photos */}
                            <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
                                <button
                                    type="button"
                                    onClick={prevPhoto}
                                    aria-label="Photo précédente"
                                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-colors pointer-events-auto border border-white/20"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextPhoto}
                                    aria-label="Photo suivante"
                                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-colors pointer-events-auto border border-white/20"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Mini indicator dots */}
                            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-slate-900 shadow-xs">
                                    <Compass size={12} className="text-purple-600" />
                                    Projet ACSE · 100% Culture
                                </span>
                                <div className="flex gap-1.5 pointer-events-auto">
                                    {culturalTripPhotos.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setCurrentPhotoIdx(idx)}
                                            className={`h-2 rounded-full transition-all ${
                                                currentPhotoIdx === idx ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                                            }`}
                                            aria-label={`Afficher photo ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-purple-700 transition-colors">
                                    L'Éveil Culturel
                                </h3>
                                <p className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-3.5">
                                    Sorties, voyages & le projet ACSE
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Sorties au théâtre, visites de musées, découvertes du littoral et <strong className="text-slate-900 font-semibold">voyages de fin d'année</strong> : nous ouvrons le champ des possibles. Notre projet phare <strong className="text-purple-700 font-semibold">ACSE (À Chacun Son Excellence)</strong> est d'ailleurs <strong className="text-slate-900 font-semibold">100% axé sur l'ouverture culturelle</strong> pour les lycéens, brisant les barrières sociales à travers l'art, le débat et l'exploration.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    to="/projets/acse"
                                    className="inline-flex items-center gap-2 text-sm font-black text-slate-800 group-hover:text-purple-700 transition-colors"
                                >
                                    <span>Découvrir le projet ACSE</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.article>

                    {/* ──────────────── PILIER 3 : ORIENTATION, AVENIR & ÉVÉNEMENTS ──────────────── */}
                    <motion.article
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="group flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* En-tête interactif avec miniatures des événements phares */}
                        <Link to="/evenements" className="block relative h-60 sm:h-68 w-full overflow-hidden bg-slate-900 group/ev cursor-pointer">
                            <img
                                src={eventHighlights[activeEventIdx].image}
                                alt={eventHighlights[activeEventIdx].title}
                                style={{ objectPosition: eventHighlights[activeEventIdx].objectPosition }}
                                className="w-full h-full object-cover group-hover/ev:scale-105 transition-transform duration-500 ease-out"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                            {/* Step Number Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md font-black text-slate-900 text-sm shadow-md border border-white/60">
                                    03
                                </span>
                            </div>

                            {/* Sticker */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-black shadow-md bg-indigo-600 text-white rotate-1">
                                    Grands Événements 🚀
                                </span>
                            </div>

                            {/* 3 Miniatures interactives en bas de l'image */}
                            <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-2">
                                {eventHighlights.map((ev, idx) => (
                                    <button
                                        key={ev.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveEventIdx(idx);
                                        }}
                                        className={`flex-1 flex flex-col items-center p-1.5 rounded-xl border backdrop-blur-md transition-all text-left ${
                                            activeEventIdx === idx
                                                ? 'bg-white/95 border-indigo-500 shadow-md scale-[1.02]'
                                                : 'bg-black/50 border-white/20 hover:bg-black/70 text-white'
                                        }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-wider line-clamp-1 ${
                                            activeEventIdx === idx ? 'text-indigo-900' : 'text-white'
                                        }`}>
                                            {ev.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </Link>

                        {/* Content Body */}
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                    Orientation & Avenir
                                </h3>
                                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3.5">
                                    SimONU EDC & La JEDC (Concours d'Éloquence)
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Pour que chaque jeune ose sans autocensure, Phoenix rythme l'année avec ses événements phares : la simulation diplomatique <strong className="text-indigo-600 font-semibold">SimONU EDC</strong> (art oratoire et négociation internationale) et la prestigieuse <strong className="text-slate-900 font-semibold">JEDC (Journée de l'Égalité des Chances)</strong> avec son concours d'éloquence. Des temps forts inoubliables pour développer la prise de parole et l'ambition.
                                </p>
                            </div>

                            {/* Bottom Link (renvoie vers /evenements comme demandé) */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    to="/evenements"
                                    className="inline-flex items-center gap-2 text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors"
                                >
                                    <span>Voir tous nos événements</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.article>

                </div>

                {/* Bottom Callout Banner */}
                <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
                            <HeartHandshake size={26} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg sm:text-xl font-black tracking-tight">
                                9 projets de terrain répartis dans tout Marseille
                            </h4>
                            <p className="text-white/85 text-xs sm:text-sm font-medium">
                                De l'Estaque aux quartiers Nord jusqu'au Sud : nos tuteurs interviennent là où les besoins sont les plus forts.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/projets"
                        className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
                    >
                        <span>Explorer les 9 projets</span>
                        <ArrowRight size={16} />
                    </Link>

                    {/* Decorative Circles */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
                </div>
            </div>
        </section>
    );
}
