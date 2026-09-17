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
        <section className="relative py-16 md:py-28 overflow-hidden bg-transparent">
            {/* Background elements */}
            <div className="absolute top-1/4 -left-40 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                {/* Header with Youth Association Styling */}
                <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-1.5 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] mb-4 -rotate-1 hover:rotate-0 transition-transform">
                        <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                        <span className="text-xs font-display font-black uppercase tracking-wider text-[#0A1120]">
                            Sur le terrain chaque semaine
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs font-display font-bold text-orange-600 flex items-center gap-1">
                            <MapPin size={12} /> Marseille & Métropole
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tight text-[#0A1120] leading-[1.05] mb-5">
                        <span className="relative inline-block text-orange-600">
                            Des actions
                            <span className="absolute -bottom-1 left-0 w-full h-3 bg-orange-400/20 -rotate-1 rounded-sm -z-10" />
                        </span>{' '}
                        concrètes.
                    </h2>

                    <p className="text-slate-600 font-medium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Du lundi au samedi, nos +100 étudiants bénévoles retrouvent 300 jeunes marseillais dans leurs collèges, lycées et maisons de quartier.
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
                        className="group flex flex-col bg-white rounded-3xl border-2 border-[#0A1120] shadow-[5px_5px_0px_0px_#0A1120] hover:shadow-[7px_7px_0px_0px_#EA580C] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* Photo terrain en salle de tutorat */}
                        <div className="relative h-60 sm:h-68 w-full overflow-hidden bg-slate-900 border-b-2 border-[#0A1120]">
                            <img
                                src="/images/home/tutorat-hebdo-terrain.jpg"
                                alt="Séance studieuse de tutorat hebdomadaire Phoenix"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                            {/* Step Number Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#0A1120] font-display font-black text-white text-sm shadow-md border-2 border-white">
                                    01
                                </span>
                            </div>

                            {/* Sticker */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-display font-black shadow-[2px_2px_0px_0px_#0A1120] bg-orange-500 text-white border border-[#0A1120] rotate-2">
                                    9 Projets à Marseille 📍
                                </span>
                            </div>

                            {/* Photo Bottom Action Tag */}
                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[11px] font-display font-bold uppercase tracking-wider text-[#0A1120] border border-slate-900/15 shadow-xs">
                                    <School size={12} className="text-orange-600" />
                                    Full tutorat & Soutien scolaire
                                </span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-white">
                            <div>
                                <h3 className="text-2xl font-display font-black text-[#0A1120] tracking-tight mb-2 group-hover:text-orange-600 transition-colors">
                                    Le Tutorat Hebdomadaire
                                </h3>
                                <p className="text-xs font-display font-bold uppercase tracking-wider text-orange-600 mb-3.5">
                                    9 projets · Méthodologie & Aide aux devoirs
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Phoenix déploie <strong className="text-[#0A1120] font-bold">9 projets de terrain</strong> dans les collèges, lycées et centres sociaux de Marseille. Certains projets sont <strong className="text-orange-600 font-bold">100% dédiés au tutorat académique</strong> (comme Massa 13, Saint Gabriel ou Jules Ferry) pour consolider les bases scolaires et la méthodologie, tandis que d'autres intègrent un accompagnement mixte adapté aux besoins des jeunes.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    to="/projets"
                                    className="inline-flex items-center gap-2 text-sm font-display font-black text-[#0A1120] group-hover:text-orange-600 transition-colors"
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
                        className="group flex flex-col bg-white rounded-3xl border-2 border-[#0A1120] shadow-[5px_5px_0px_0px_#0A1120] hover:shadow-[7px_7px_0px_0px_#6D28D9] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* Mini-Carrousel des 3 photos de voyage */}
                        <div className="relative h-60 sm:h-68 w-full overflow-hidden bg-slate-900 border-b-2 border-[#0A1120] select-none">
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
                                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-purple-950 font-display font-black text-white text-sm shadow-md border-2 border-white">
                                    02
                                </span>
                            </div>

                            {/* Sticker */}
                            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-display font-black shadow-[2px_2px_0px_0px_#0A1120] bg-purple-600 text-white border border-[#0A1120] -rotate-2">
                                    Sorties & Voyages 🎭
                                </span>
                            </div>

                            {/* Navigation controls for the 3 photos */}
                            <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
                                <button
                                    type="button"
                                    onClick={prevPhoto}
                                    aria-label="Photo précédente"
                                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center transition-colors pointer-events-auto border border-white/30"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextPhoto}
                                    aria-label="Photo suivante"
                                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center transition-colors pointer-events-auto border border-white/30"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Mini indicator dots */}
                            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/95 backdrop-blur-md text-[11px] font-display font-bold uppercase tracking-wider text-[#0A1120] border border-slate-900/15 shadow-xs">
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
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-white">
                            <div>
                                <h3 className="text-2xl font-display font-black text-[#0A1120] tracking-tight mb-2 group-hover:text-purple-700 transition-colors">
                                    L'Éveil Culturel
                                </h3>
                                <p className="text-xs font-display font-bold uppercase tracking-wider text-purple-700 mb-3.5">
                                    Sorties, voyages & le projet ACSE
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Sorties au théâtre, visites de musées, découvertes du littoral et <strong className="text-[#0A1120] font-bold">voyages de fin d'année</strong> : nous ouvrons le champ des possibles. Notre projet phare <strong className="text-purple-700 font-bold">ACSE (À Chacun Son Excellence)</strong> est d'ailleurs <strong className="text-[#0A1120] font-bold">100% axé sur l'ouverture culturelle</strong> pour les lycéens, brisant les barrières sociales à travers l'art, le débat et l'exploration.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    to="/projets/acse"
                                    className="inline-flex items-center gap-2 text-sm font-display font-black text-[#0A1120] group-hover:text-purple-700 transition-colors"
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
                        className="group flex flex-col bg-white rounded-3xl border-2 border-[#0A1120] shadow-[5px_5px_0px_0px_#0A1120] hover:shadow-[7px_7px_0px_0px_#2563EB] hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                    >
                        {/* En-tête interactif avec miniatures des événements phares */}
                        <Link to="/evenements" className="block relative h-60 sm:h-68 w-full overflow-hidden bg-slate-900 border-b-2 border-[#0A1120] group/ev cursor-pointer">
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
                                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-950 font-display font-black text-white text-sm shadow-md border-2 border-white">
                                    03
                                </span>
                            </div>

                            {/* Sticker */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-display font-black shadow-[2px_2px_0px_0px_#0A1120] bg-blue-600 text-white border border-[#0A1120] rotate-1">
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
                                                ? 'bg-white text-[#0A1120] border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] scale-[1.02]'
                                                : 'bg-black/60 border-white/20 hover:bg-black/80 text-white'
                                        }`}
                                    >
                                        <span className={`text-[10px] font-display font-black uppercase tracking-wider line-clamp-1 ${
                                            activeEventIdx === idx ? 'text-[#0A1120]' : 'text-white'
                                        }`}>
                                            {ev.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </Link>

                        {/* Content Body */}
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-white">
                            <div>
                                <h3 className="text-2xl font-display font-black text-[#0A1120] tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                                    Orientation & Avenir
                                </h3>
                                <p className="text-xs font-display font-bold uppercase tracking-wider text-blue-600 mb-3.5">
                                    SimONU EDC & La JEDC (Concours d'Éloquence)
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Pour que chaque jeune ose sans autocensure, Phoenix rythme l'année avec ses événements phares : la simulation diplomatique <strong className="text-blue-600 font-bold">SimONU EDC</strong> (art oratoire et négociation internationale) et la prestigieuse <strong className="text-[#0A1120] font-bold">JEDC (Journée de l'Égalité des Chances)</strong> avec son concours d'éloquence. Des temps forts inoubliables pour développer la prise de parole et l'ambition.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    to="/evenements"
                                    className="inline-flex items-center gap-2 text-sm font-display font-black text-[#0A1120] group-hover:text-blue-600 transition-colors"
                                >
                                    <span>Voir tous nos événements</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </motion.article>

                </div>

                {/* Bottom Callout Banner - Editorial Neobrutalist Strip */}
                <div className="rounded-3xl bg-[#0A1120] border-2 border-[#0A1120] shadow-[6px_6px_0px_0px_#EA580C] p-7 sm:p-9 text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-13 h-13 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center shrink-0">
                            <HeartHandshake size={28} className="text-orange-500" />
                        </div>
                        <div>
                            <h4 className="text-lg sm:text-xl font-display font-black tracking-tight text-white uppercase">
                                9 projets de terrain répartis dans tout Marseille
                            </h4>
                            <p className="text-slate-300 text-xs sm:text-sm font-medium mt-0.5">
                                De l'Estaque aux quartiers Nord jusqu'au Sud : nos tuteurs interviennent là où les besoins sont les plus forts.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/projets"
                        className="relative z-10 btn-tactile-primary px-7 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_0px_#FFFFFF] shrink-0"
                    >
                        <span>Explorer les 9 projets</span>
                        <ArrowRight size={16} />
                    </Link>

                    {/* Decorative Background Circles */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
                </div>
            </div>
        </section>
    );
}
