import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ChevronLeft, ChevronRight, Compass, School, HeartHandshake, Sparkles } from 'lucide-react';

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
        <section className="relative py-20 md:py-32 overflow-hidden bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                {/* Header direct et aéré */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <div className="flex justify-center mb-3">
                        <span className="badge-blockletter">
                            Sur le terrain chaque semaine à Marseille &amp; Métropole
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight leading-[1.1] mb-5">
                        Des actions concrètes.
                    </h2>

                    <p className="text-[#2A082D]/80 font-medium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Du lundi au samedi, nos +100 étudiants bénévoles retrouvent 300 jeunes marseillais dans leurs collèges, lycées et maisons de quartier.
                    </p>
                </div>

                {/* 3 Pillars Grid */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-14">

                    {/* ──────────────── PILIER 1 : LE TUTORAT HEBDOMADAIRE ──────────────── */}
                    <article className="group flex flex-col bg-white rounded-[2.5rem] border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative">
                        {/* Photo terrain en salle de tutorat */}
                        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                            <img
                                src="/images/home/tutorat-hebdo-terrain.jpg"
                                alt="Séance studieuse de tutorat hebdomadaire Phoenix"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/85 via-[#2A082D]/20 to-transparent" />

                            {/* Circular Step Number Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#6F2B75] font-school font-bold text-white text-sm shadow-soft border-2 border-white">
                                    01
                                </span>
                            </div>

                            {/* Pill Sticker */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-school font-bold shadow-soft bg-[#EC602B] text-white">
                                    <MapPin size={12} className="text-white" />
                                    <span>9 Projets à Marseille</span>
                                </span>
                            </div>

                            {/* Photo Bottom Action Tag */}
                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-school font-bold uppercase tracking-wider text-[#2A082D] shadow-soft">
                                    <School size={13} className="text-[#EC602B]" />
                                    Full tutorat & Soutien scolaire
                                </span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-white">
                            <div>
                                <h3 className="text-2xl font-display text-[#2A082D] tracking-tight mb-2 group-hover:text-[#EC602B] transition-colors">
                                    Le Tutorat Hebdomadaire
                                </h3>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#EC602B] mb-3.5">
                                    9 projets · Méthodologie & Aide aux devoirs
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Phoenix déploie <strong className="text-[#2A082D] font-bold">9 projets de terrain</strong> dans les collèges, lycées et centres sociaux de Marseille. Certains projets sont <strong className="text-[#EC602B] font-bold">100% dédiés au tutorat académique</strong> (comme Massa 13, Saint Gabriel ou Jules Ferry) pour consolider les bases scolaires et la méthodologie, tandis que d'autres intègrent un accompagnement mixte adapté aux besoins des jeunes.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-[#ECDDFD]/60 flex items-center justify-between">
                                <Link
                                    to="/projets"
                                    className="inline-flex items-center gap-2 text-sm font-school font-bold text-[#6F2B75] group-hover:text-[#EC602B] transition-colors"
                                >
                                    <span>Explorer nos 9 projets</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </article>

                    {/* ──────────────── PILIER 2 : L'ÉVEIL CULTUREL (3 PHOTOS + ACSE) ──────────────── */}
                    <article className="group flex flex-col bg-white rounded-[2.5rem] border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative">
                        {/* Mini-Carrousel des 3 photos de voyage */}
                        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900 select-none">
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
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/85 via-[#2A082D]/20 to-transparent pointer-events-none" />

                            {/* Step Number Badge */}
                            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#6F2B75] font-school font-bold text-white text-sm shadow-soft border-2 border-white">
                                    02
                                </span>
                            </div>

                            {/* Pill Sticker */}
                            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-school font-bold shadow-soft bg-[#6F2B75] text-white">
                                    <Compass size={12} className="text-white" />
                                    <span>Sorties & Voyages</span>
                                </span>
                            </div>

                            {/* Navigation controls for the 3 photos */}
                            <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
                                <button
                                    type="button"
                                    onClick={prevPhoto}
                                    aria-label="Photo précédente"
                                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center transition-colors pointer-events-auto border border-white/30"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextPhoto}
                                    aria-label="Photo suivante"
                                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center transition-colors pointer-events-auto border border-white/30"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Mini indicator dots */}
                            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-school font-bold uppercase tracking-wider text-[#2A082D] shadow-soft">
                                    <Compass size={13} className="text-[#6F2B75]" />
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
                                <h3 className="text-2xl font-display text-[#2A082D] tracking-tight mb-2 group-hover:text-[#6F2B75] transition-colors">
                                    L'Éveil Culturel
                                </h3>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mb-3.5">
                                    Sorties, voyages & le projet ACSE
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Sorties au théâtre, visites de musées, découvertes du littoral et <strong className="text-[#2A082D] font-bold">voyages de fin d'année</strong> : nous ouvrons le champ des possibles. Notre projet phare <strong className="text-[#6F2B75] font-bold">ACSE (À Chacun Son Excellence)</strong> est d'ailleurs <strong className="text-[#2A082D] font-bold">100% axé sur l'ouverture culturelle</strong> pour les lycéens, brisant les barrières sociales à travers l'art, le débat et l'exploration.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-[#ECDDFD]/60 flex items-center justify-between">
                                <Link
                                    to="/projets/acse"
                                    className="inline-flex items-center gap-2 text-sm font-school font-bold text-[#6F2B75] group-hover:text-[#EC602B] transition-colors"
                                >
                                    <span>Découvrir le projet ACSE</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </article>

                    {/* ──────────────── PILIER 3 : ORIENTATION, AVENIR & ÉVÉNEMENTS ──────────────── */}
                    <article className="group flex flex-col bg-white rounded-[2.5rem] border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative">
                        {/* En-tête interactif avec miniatures des événements phares */}
                        <Link to="/evenements" className="block relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900 group/ev cursor-pointer">
                            <img
                                src={eventHighlights[activeEventIdx].image}
                                alt={eventHighlights[activeEventIdx].title}
                                style={{ objectPosition: eventHighlights[activeEventIdx].objectPosition }}
                                className="w-full h-full object-cover group-hover/ev:scale-105 transition-transform duration-500 ease-out"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/85 via-[#2A082D]/20 to-transparent" />

                            {/* Step Number Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#EC602B] font-school font-bold text-white text-sm shadow-soft border-2 border-white">
                                    03
                                </span>
                            </div>

                            {/* Pill Sticker */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-school font-bold shadow-soft bg-[#FF7E2E] text-white">
                                    <Sparkles size={12} className="text-white" />
                                    <span>Grands Événements</span>
                                </span>
                            </div>

                            {/* 2 Miniatures interactives en bas de l'image */}
                            <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-2">
                                {eventHighlights.map((ev, idx) => (
                                    <button
                                        key={ev.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveEventIdx(idx);
                                        }}
                                        className={`flex-1 flex flex-col items-center py-2 px-3 rounded-2xl border backdrop-blur-md transition-all text-center ${
                                            activeEventIdx === idx
                                                ? 'bg-white text-[#2A082D] border-white shadow-soft scale-[1.02]'
                                                : 'bg-black/50 border-white/20 hover:bg-black/70 text-white'
                                        }`}
                                    >
                                        <span className={`text-[11px] font-school font-bold uppercase tracking-wider line-clamp-1 ${
                                            activeEventIdx === idx ? 'text-[#6F2B75]' : 'text-white'
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
                                <h3 className="text-2xl font-display text-[#2A082D] tracking-tight mb-2 group-hover:text-[#EC602B] transition-colors">
                                    Orientation & Avenir
                                </h3>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#EC602B] mb-3.5">
                                    SimONU EDC & La JEDC (Concours d'Éloquence)
                                </p>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                                    Pour que chaque jeune ose sans autocensure, Phoenix rythme l'année avec ses événements phares : la simulation diplomatique <strong className="text-[#6F2B75] font-bold">SimONU EDC</strong> (art oratoire et négociation internationale) et la prestigieuse <strong className="text-[#2A082D] font-bold">JEDC (Journée de l'Égalité des Chances)</strong> avec son concours d'éloquence. Des temps forts inoubliables pour développer la prise de parole et l'ambition.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-[#ECDDFD]/60 flex items-center justify-between">
                                <Link
                                    to="/evenements"
                                    className="inline-flex items-center gap-2 text-sm font-school font-bold text-[#6F2B75] group-hover:text-[#EC602B] transition-colors"
                                >
                                    <span>Voir tous nos événements</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </article>

                </div>

                {/* Bottom Callout Banner - Deep Violet Charte Strip with Official Pattern */}
                <div className="rounded-[2.5rem] bg-[#2A082D] p-8 sm:p-11 text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-soft-lg">
                    {/* Trame filigrane Phœnix officielle sur fond sombre */}
                    <div className="pattern-watermark-dark" aria-hidden="true" />

                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-soft">
                            <HeartHandshake size={28} className="text-[#EC602B]" />
                        </div>
                        <div>
                            <span className="font-script text-2xl text-[#ECDDFD] block">Présents partout</span>
                            <h4 className="text-xl sm:text-2xl font-display tracking-tight text-white">
                                9 projets de terrain répartis dans tout Marseille
                            </h4>
                            <p className="text-[#ECDDFD] text-xs sm:text-sm font-medium mt-1">
                                De l'Estaque aux quartiers Nord jusqu'au Sud : nos tuteurs interviennent là où les besoins sont les plus forts.
                            </p>
                        </div>
                    </div>


                    <Link
                        to="/projets"
                        className="relative z-10 btn-phoenix-orange px-8 py-4 rounded-full text-xs sm:text-sm uppercase tracking-wider shrink-0 shadow-glow-orange flex items-center gap-2"
                    >
                        <span>Explorer les 9 projets</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}

