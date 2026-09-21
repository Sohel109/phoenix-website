import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ChevronLeft, ChevronRight, Compass, Sparkles } from 'lucide-react';
import { MaskingTape } from '../common/HandDrawnElements';

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
        <section className="relative py-20 md:py-32 overflow-hidden bg-transparent pattern-notebook-grid">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
                {/* Header direct et éditorial */}
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Sur le terrain chaque semaine à Marseille &amp; Métropole
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight leading-[1.1] mb-5">
                        Des{' '}
                        <span className="marker-highlight text-[#EC602B]">
                            <span>actions concrètes</span>
                        </span>.
                    </h2>

                    <p className="text-[#2A082D]/80 font-medium text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Du lundi au samedi, nos +100 étudiants bénévoles retrouvent 300 jeunes marseillais dans leurs collèges, lycées et maisons de quartier.
                    </p>
                </div>

                {/* 3 Pillars Grid avec formes asymétriques & survol fluide */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-14">

                    {/* ──────────────── PILIER 1 : LE TUTORAT HEBDOMADAIRE ──────────────── */}
                    <div className="relative pt-3.5 flex flex-col h-full group/card">
                        <MaskingTape variant="warm" angle="left" className="-top-1.5 left-1/2 -translate-x-1/2 z-30" />
                        <article className="group flex flex-col bg-white rounded-organic-sm border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 overflow-hidden relative will-change-transform flex-grow justify-between">
                            {/* Photo terrain en salle de tutorat */}
                        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
                            <img
                                src="/images/home/tutorat-hebdo-terrain.jpg"
                                alt="Séance studieuse de tutorat hebdomadaire et soutien scolaire à Marseille - Phœnix EDC"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/80 via-transparent to-transparent" />

                            {/* Clean top tag */}
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                                <span className="px-3 py-1 rounded-md bg-[#6F2B75] text-white font-school font-bold text-xs tracking-wider">
                                    01 · Tutorat
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs font-semibold text-white">
                                    <MapPin size={12} className="text-[#EC602B]" />
                                    <span>9 projets à Marseille</span>
                                </span>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 sm:p-8 flex flex-col flex-grow justify-between bg-white">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-display text-[#2A082D] tracking-tight mb-1.5 group-hover:text-[#EC602B] transition-colors">
                                    Le Tutorat Hebdomadaire
                                </h3>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#EC602B] mb-3">
                                    9 antennes · Méthodologie &amp; Soutien
                                </p>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                                    Un accompagnement scolaire régulier en petits groupes dans les collèges et lycées marseillais pour consolider les fondamentaux et redonner confiance.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-[#6F2B75]/10 flex items-center justify-between">
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
                </div>

                    {/* ──────────────── PILIER 2 : L'ÉVEIL CULTUREL (3 PHOTOS + ACSE) ──────────────── */}
                    <div className="relative pt-3.5 flex flex-col h-full group/card">
                        <MaskingTape variant="lilac" angle="right" className="-top-1.5 left-1/2 -translate-x-1/2 z-30" />
                        <article className="group flex flex-col bg-white rounded-organic-sm border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 overflow-hidden relative will-change-transform flex-grow justify-between">
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
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/80 via-transparent to-transparent pointer-events-none" />

                            {/* Clean top tag */}
                            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                <span className="px-3 py-1 rounded-md bg-[#6F2B75] text-white font-school font-bold text-xs tracking-wider">
                                    02 · Culture
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 z-10 pointer-events-none">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs font-semibold text-white">
                                    <Compass size={12} className="text-[#EC602B]" />
                                    <span>Sorties & Voyages</span>
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
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={nextPhoto}
                                    aria-label="Photo suivante"
                                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm flex items-center justify-center transition-colors pointer-events-auto border border-white/30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Mini indicator dots */}
                            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                                <span className="text-[11px] font-semibold text-white/90">
                                    Projet ACSE & Sorties
                                </span>
                                <div className="flex gap-1.5 pointer-events-auto">
                                    {culturalTripPhotos.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setCurrentPhotoIdx(idx)}
                                            className={`h-1.5 rounded-full transition-all ${
                                                currentPhotoIdx === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
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
                                <h3 className="text-xl sm:text-2xl font-display text-[#2A082D] tracking-tight mb-1.5 group-hover:text-[#6F2B75] transition-colors">
                                    L'Éveil Culturel
                                </h3>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mb-3">
                                    Sorties, voyages &amp; Projet ACSE
                                </p>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                                    Musées, théâtre, découvertes du littoral et voyages de fin d'année : des expériences marquantes pour ouvrir les horizons et briser l'autocensure.
                                </p>
                            </div>

                            {/* Bottom Link avec note manuscrite */}
                            <div className="pt-4 border-t border-[#6F2B75]/10 flex items-center justify-between">
                                <Link
                                    to="/projets/acse"
                                    className="inline-flex items-center gap-2 text-sm font-school font-bold text-[#6F2B75] group-hover:text-[#EC602B] transition-colors"
                                >
                                    <span>Découvrir le projet ACSE</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                                </Link>
                                <span className="font-script text-xl text-[#2A082D] hidden sm:inline -rotate-2 select-none">
                                    Voyages & Culture ✦
                                </span>
                            </div>
                        </div>
                    </article>
                </div>

                    {/* ──────────────── PILIER 3 : ORIENTATION, AVENIR & ÉVÉNEMENTS ──────────────── */}
                    <div className="relative pt-3.5 flex flex-col h-full group/card">
                        <MaskingTape variant="warm" angle="center" className="-top-1.5 left-1/2 -translate-x-1/2 z-30" />
                        <article className="group flex flex-col bg-white rounded-organic-sm border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 overflow-hidden relative will-change-transform flex-grow justify-between">
                            {/* En-tête interactif avec miniatures des événements phares */}
                        <Link to="/evenements" className="block relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900 group/ev cursor-pointer">
                            <img
                                src={eventHighlights[activeEventIdx].image}
                                alt={`${eventHighlights[activeEventIdx].title} – Événement égalité des chances et éloquence Phœnix EDC Marseille`}
                                style={{ objectPosition: eventHighlights[activeEventIdx].objectPosition }}
                                className="w-full h-full object-cover group-hover/ev:scale-105 transition-transform duration-500 ease-out will-change-transform"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/80 via-transparent to-transparent" />

                            {/* Clean top tag */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-3 py-1 rounded-md bg-[#EC602B] text-white font-school font-bold text-xs tracking-wider">
                                    03 · Événements
                                </span>
                            </div>

                            <div className="absolute top-4 right-4 z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs font-semibold text-white">
                                    <Sparkles size={12} className="text-[#EC602B]" />
                                    <span>SimONU & JEDC</span>
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
                                        className={`flex-1 py-1.5 px-3 rounded-lg border backdrop-blur-md transition-all text-center ${
                                            activeEventIdx === idx
                                                ? 'bg-white text-[#2A082D] border-white shadow-soft'
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
                                <h3 className="text-xl sm:text-2xl font-display text-[#2A082D] tracking-tight mb-1.5 group-hover:text-[#EC602B] transition-colors">
                                    Orientation &amp; Avenir
                                </h3>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#EC602B] mb-3">
                                    Éloquence, SimONU &amp; Grandes Écoles
                                </p>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                                    Concours d'éloquence (JEDC), simulations diplomatiques et découvertes des filières d'excellence pour développer l'art oratoire et l'ambition.
                                </p>
                            </div>

                            {/* Bottom Link */}
                            <div className="pt-4 border-t border-[#6F2B75]/10 flex items-center justify-between">
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

                </div>
            </div>
        </section>
    );
}

