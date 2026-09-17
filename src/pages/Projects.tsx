import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { 
    MapPin, 
    ArrowRight, 
    Award, 
    Users, 
    BookOpen, 
    Compass, 
    Sparkles, 
    Heart, 
    Clock,
    Check
} from 'lucide-react';
import { useState } from 'react';

type FilterType = 'all' | 'cordees' | 'college' | 'lycee';

export function Projects() {
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const filteredProjects = projects.filter(p => {
        if (activeFilter === 'cordees') return p.isCordee;
        if (activeFilter === 'college') return p.category === 'Collège';
        if (activeFilter === 'lycee') return p.category === 'Lycée' || p.category === 'Phoenix x OM' || p.category === 'Association';
        return true;
    });

    // Planning weekly matrix data from guide page 27
    const weeklySchedule = [
        { name: "ACSE", monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: true, isCordee: true },
        { name: "Apprentis d'Auteuil", monday: false, tuesday: true, wednesday: false, thursday: true, friday: true, saturday: false, isCordee: false },
        { name: "Arthur Rimbaud", monday: false, tuesday: false, wednesday: false, thursday: true, friday: false, saturday: false, isCordee: true },
        { name: "Jean-Claude Izzo", monday: false, tuesday: false, wednesday: false, thursday: true, friday: false, saturday: false, isCordee: true },
        { name: "Jules Ferry", monday: false, tuesday: false, wednesday: true, thursday: false, friday: false, saturday: false, isCordee: true },
        { name: "Massa 13", monday: false, tuesday: false, wednesday: true, thursday: false, friday: false, saturday: false, isCordee: false },
        { name: "Roy d'Espagne", monday: false, tuesday: false, wednesday: false, thursday: true, friday: true, saturday: false, isCordee: true },
        { name: "Saint Gabriel", monday: true, tuesday: true, wednesday: false, thursday: true, friday: true, saturday: false, isCordee: false },
        { name: "Sup d'OM", monday: false, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: true, isCordee: false },
    ];

    return (
        <div className="pt-28 pb-20 bg-slate-50/50 min-h-screen">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-4">
                        <span>Nos Antennes de Terrain</span>
                        <span>·</span>
                        <span className="text-purple-700 font-extrabold flex items-center gap-1">
                            <Award size={13} />
                            5 Labellisés Cordées de la Réussite
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Des Projets Concrets pour l'Égalité
                    </h1>
                    <p className="text-slate-600 max-w-3xl mx-auto text-sm sm:text-base leading-relaxed mb-6">
                        Chaque semaine, nos +100 étudiants bénévoles accompagnent <strong className="text-slate-900 font-semibold">300 jeunes marseillais</strong> de la 6ème à la Terminale. Nos actions combinent soutien scolaire, éveil culturel, aide à l'orientation et développement personnel.
                    </p>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
                        <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                            <strong className="text-slate-900 font-extrabold">300</strong> tutorés suivis
                        </span>
                        <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-800 shadow-2xs">
                            <strong className="text-purple-900 font-extrabold">5</strong> Cordées de la Réussite
                        </span>
                        <span className="px-3.5 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-800 shadow-2xs">
                            <strong className="text-orange-900 font-extrabold">9</strong> implantations à Marseille
                        </span>
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
                            <strong className="text-emerald-900 font-extrabold">Du lundi au samedi</strong>
                        </span>
                    </div>

                    {/* Action Links & Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/carte-des-projets"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-orange-500 text-slate-800 hover:text-orange-600 text-xs sm:text-sm font-bold transition-colors bg-white shadow-xs"
                        >
                            <MapPin size={16} className="text-orange-500" />
                            <span>Voir la carte interactive des projets</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeFilter === 'all'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Tous les projets (9)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('cordees')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                                activeFilter === 'cordees'
                                    ? 'bg-purple-700 text-white shadow-md'
                                    : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                            }`}
                        >
                            <Award size={14} />
                            <span>Cordées de la Réussite (5)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('college')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeFilter === 'college'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Collèges (5)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('lycee')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                                activeFilter === 'lycee'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            Lycées, OM & Asso (4)
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={isMobile ? false : { opacity: 0, y: 20 }}
                            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                            className="h-full"
                        >
                            <Link
                                to={`/projets/${project.id}`}
                                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-orange-400 transition-all duration-300 overflow-hidden flex flex-col h-full group cursor-pointer"
                            >
                                {/* Image Header */}
                                <div className={`relative aspect-video w-full overflow-hidden ${project.bannerFit === 'contain' ? 'bg-white' : 'bg-slate-900'} border-b border-slate-100 flex items-center justify-center`}>
                                    <img
                                        src={project.banner || project.image}
                                        alt={project.title}
                                        className={`w-full h-full ${
                                            project.bannerFit === 'contain'
                                                ? 'object-contain p-4 max-h-[92%]'
                                                : 'object-cover object-center'
                                        } group-hover:scale-105 transition-transform duration-500 ease-out`}
                                    />
                                    {project.bannerFit !== 'contain' && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />
                                    )}

                                    {/* Badges top */}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-slate-200/80">
                                            {project.category}
                                        </span>
                                        {project.isCordee && (
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-700 text-white shadow-xs flex items-center gap-1">
                                                <Award size={12} />
                                                <span>Cordée</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Creation Year top right */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/60 backdrop-blur-md text-white">
                                            Depuis {project.creationYear}
                                        </span>
                                    </div>

                                    {/* Logo pastille bottom right */}
                                    {project.image && (
                                        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-200/80 flex items-center justify-center overflow-hidden z-10">
                                            <img
                                                src={project.image}
                                                alt={`${project.title} logo`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Corps de la carte */}
                                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between gap-2 mb-2.5">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60">
                                            {project.type}
                                        </span>
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70 flex items-center gap-1">
                                            <Users size={12} />
                                            <span>{project.tutorCount} élèves</span>
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-orange-600 transition-colors leading-snug tracking-tight">
                                        {project.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 flex-grow font-normal line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Meta: schedule & location */}
                                    <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={13} className="text-orange-500 shrink-0" />
                                            <span className="line-clamp-1">{project.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-purple-600 shrink-0" />
                                            <span className="line-clamp-1">{project.locationName}</span>
                                        </div>
                                    </div>

                                    {/* Footer de la carte */}
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                                        <span className="text-xs font-bold text-slate-500">
                                            {project.chefs[0]}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 group-hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs group-hover:shadow-md group-hover:shadow-orange-500/20 active:scale-95 transition-all">
                                            <span>Fiche Projet</span>
                                            <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* ──────────────── SECTION ENRICHIE : LES 4 AXES DE TRAVAIL ──────────────── */}
                <div className="mb-20 bg-white rounded-3xl sm:rounded-4xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60 inline-block mb-3">
                            Méthodologie Phoenix
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
                            Nos 4 Axes de Travail
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base">
                            Chaque séance dans nos 9 projets est construite autour de 4 piliers fondamentaux pour ouvrir le champ des possibles de nos tutorés.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Axe 1 */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm shadow-orange-500/20">
                                    <BookOpen size={22} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">
                                    Accompagnement Scolaire
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Au travers de séances de tutorat individualisé et/ou collectif : aide aux devoirs, révision des notions clés et acquisition de méthodes de travail durables.
                                </p>
                            </div>
                            <span className="text-[11px] font-black text-orange-600 uppercase tracking-wider mt-4">
                                Brevet & Baccalauréat
                            </span>
                        </div>

                        {/* Axe 2 */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm shadow-purple-600/20">
                                    <Sparkles size={22} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">
                                    Ouverture Culturelle
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Au travers de séances d'actualités, de grands débats argumentés, d'ateliers créatifs, de sorties théâtrales et muséales, et de voyages de fin d'année.
                                </p>
                            </div>
                            <span className="text-[11px] font-black text-purple-700 uppercase tracking-wider mt-4">
                                Curiosité & Débat
                            </span>
                        </div>

                        {/* Axe 3 */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm shadow-indigo-600/20">
                                    <Compass size={22} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">
                                    Aide à l'Orientation
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    À propos des parcours d'études possibles, de leurs débouchés, des filières sélectives et de la découverte du monde professionnel et de l'entreprise.
                                </p>
                            </div>
                            <span className="text-[11px] font-black text-indigo-700 uppercase tracking-wider mt-4">
                                Ambition & Choix
                            </span>
                        </div>

                        {/* Axe 4 */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm shadow-emerald-600/20">
                                    <Heart size={22} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">
                                    Développement Personnel
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    Au travers de conseils bienveillants et d'un suivi personnalisé : gain de confiance en soi, maîtrise de la prise de parole en public et esprit critique.
                                </p>
                            </div>
                            <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider mt-4">
                                Confiance & Éloquence
                            </span>
                        </div>
                    </div>
                </div>

                {/* ──────────────── SECTION ENRICHIE : PLANNING HEBDOMADAIRE ──────────────── */}
                <div className="bg-white rounded-3xl sm:rounded-4xl p-8 sm:p-12 border border-slate-200/90 shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/60 inline-block mb-3">
                                Organisation de terrain
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Planning Hebdomadaire des Projets
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                Les interventions Phoenix se déploient du lundi au samedi à travers les arrondissements de Marseille.
                            </p>
                        </div>
                        <div className="text-xs text-slate-500 font-medium max-w-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                            Pour les projets avec plusieurs séances par semaine, un système de roulement permet aux tuteurs d'effectuer 1 à 2 séances par semaine.
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                                    <th className="py-3 px-4">Projet</th>
                                    <th className="py-3 px-3 text-center">Lundi</th>
                                    <th className="py-3 px-3 text-center">Mardi</th>
                                    <th className="py-3 px-3 text-center">Mercredi</th>
                                    <th className="py-3 px-3 text-center">Jeudi</th>
                                    <th className="py-3 px-3 text-center">Vendredi</th>
                                    <th className="py-3 px-3 text-center">Samedi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {weeklySchedule.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                                            <span>{item.name}</span>
                                            {item.isCordee && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-black">
                                                    Cordée
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.monday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.tuesday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.wednesday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.thursday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.friday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.saturday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
