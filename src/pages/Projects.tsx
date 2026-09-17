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
    UserCheck,
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
        <div className="pt-page-safe pb-24 bg-[#FFFBF4] bg-bird-pattern min-h-screen">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ECDDFD] text-[#6F2B75] shadow-soft text-xs font-school font-bold uppercase tracking-wider mb-4 rotate-1 hover:rotate-0 transition-transform">
                        <span className="text-[#EC602B]">Nos Antennes de Terrain</span>
                        <span className="text-[#904990] font-bold">·</span>
                        <span className="text-[#6F2B75] flex items-center gap-1">
                            <Award size={14} />
                            5 Labellisés Cordées de la Réussite
                        </span>
                    </div>

                    <p className="font-script text-2xl md:text-3xl text-[#EC602B] mb-1">
                        ~ Au cœur des collèges et lycées marseillais ~
                    </p>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight mb-4 leading-[1.1]">
                        Des Projets Concrets pour l'Égalité
                    </h1>
                    <p className="text-[#2A082D]/80 font-medium max-w-3xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                        Chaque semaine, nos +100 étudiants bénévoles accompagnent <strong className="text-[#2A082D] font-bold">300 jeunes marseillais</strong> de la 6ème à la Terminale. Nos actions combinent soutien scolaire, éveil culturel, aide à l'orientation et développement personnel.
                    </p>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
                        <span className="px-4 py-2 rounded-full bg-white border border-[#ECDDFD] text-xs font-school font-bold text-[#2A082D] shadow-soft">
                            <strong className="text-[#EC602B] font-black">300</strong> tutorés suivis
                        </span>
                        <span className="px-4 py-2 rounded-full bg-[#ECDDFD] border border-[#D9BEF8] text-xs font-school font-bold text-[#6F2B75] shadow-soft">
                            <strong className="text-[#6F2B75] font-black">5</strong> Cordées de la Réussite
                        </span>
                        <span className="px-4 py-2 rounded-full bg-[#E1BBCB]/50 border border-[#E1BBCB] text-xs font-school font-bold text-[#2A082D] shadow-soft">
                            <strong className="text-[#EC602B] font-black">9</strong> implantations à Marseille
                        </span>
                        <span className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-school font-bold text-emerald-800 shadow-soft">
                            <strong className="text-emerald-900 font-black">Du lundi au samedi</strong>
                        </span>
                    </div>

                    {/* Action Links & Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/carte-des-projets"
                            className="btn-phoenix-outline px-6 py-3 rounded-full text-xs sm:text-sm font-school font-bold shadow-soft flex items-center gap-2"
                        >
                            <MapPin size={16} className="text-[#EC602B]" />
                            <span>Voir la carte interactive des projets</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-school font-bold transition-all shadow-soft ${
                                activeFilter === 'all'
                                    ? 'bg-gradient-to-r from-[#6F2B75] to-[#EC602B] text-white'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#ECDDFD]'
                            }`}
                        >
                            Tous les projets (9)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('cordees')}
                            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-school font-bold transition-all flex items-center gap-1.5 shadow-soft ${
                                activeFilter === 'cordees'
                                    ? 'bg-gradient-to-r from-[#6F2B75] to-[#EC602B] text-white'
                                    : 'bg-white text-[#6F2B75] hover:bg-[#ECDDFD] border border-[#ECDDFD]'
                            }`}
                        >
                            <Award size={14} />
                            <span>Cordées de la Réussite (5)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('college')}
                            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-school font-bold transition-all shadow-soft ${
                                activeFilter === 'college'
                                    ? 'bg-gradient-to-r from-[#6F2B75] to-[#EC602B] text-white'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#ECDDFD]'
                            }`}
                        >
                            Collèges (5)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('lycee')}
                            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-school font-bold transition-all shadow-soft ${
                                activeFilter === 'lycee'
                                    ? 'bg-gradient-to-r from-[#6F2B75] to-[#EC602B] text-white'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#ECDDFD]'
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
                                className="bg-white rounded-[2.5rem] border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full group cursor-pointer relative"
                            >
                                {/* Image Header */}
                                <div className={`relative aspect-video w-full overflow-hidden ${project.bannerFit === 'contain' ? 'bg-[#FFFBF4]' : 'bg-slate-900'} flex items-center justify-center`}>
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/75 via-[#2A082D]/20 to-transparent pointer-events-none" />
                                    )}

                                    {/* Badges top */}
                                    <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
                                        <span className="px-3 py-1 rounded-full text-xs font-school font-bold bg-white/95 backdrop-blur-md text-[#2A082D] shadow-soft">
                                            {project.category}
                                        </span>
                                        {project.isCordee && (
                                            <span className="px-3 py-1 rounded-full text-xs font-school font-bold bg-[#6F2B75] text-white shadow-soft flex items-center gap-1">
                                                <Award size={12} />
                                                <span>Cordée</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Creation Year top right */}
                                    <div className="absolute top-3.5 right-3.5 z-10">
                                        <span className="px-3 py-1 rounded-full text-[11px] font-school font-bold bg-[#2A082D]/85 backdrop-blur-md text-white">
                                            Depuis {project.creationYear}
                                        </span>
                                    </div>

                                    {/* Round Macaron Logo Pastille bottom right (CERCLE AVANT LE RECTANGLE) */}
                                    {project.image && (
                                        <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center overflow-hidden z-10">
                                            <img
                                                src={project.image}
                                                alt={`${project.title} logo`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Corps de la carte */}
                                <div className="p-6 sm:p-7 flex flex-col flex-grow bg-white">
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[11px] font-school font-bold uppercase tracking-wider text-[#EC602B] bg-[#FFFBF4] px-3 py-1 rounded-full border border-[#EC602B]/25">
                                            {project.type}
                                        </span>
                                        <span className="text-xs font-school font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                            <Users size={12} />
                                            <span>{project.tutorCount} élèves</span>
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-display text-[#2A082D] mb-2 group-hover:text-[#EC602B] transition-colors leading-snug tracking-tight">
                                        {project.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-[#2A082D]/75 leading-relaxed mb-4 flex-grow font-normal line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Meta: chefs, schedule & location */}
                                    <div className="space-y-1.5 mb-5 pt-3 border-t border-[#ECDDFD]/60 text-xs text-slate-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <UserCheck size={14} className="text-[#6F2B75] shrink-0" />
                                            <span className="line-clamp-1">Chefs : <strong className="text-[#2A082D] font-bold">{project.chefs.join(' & ')}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-[#EC602B] shrink-0" />
                                            <span className="line-clamp-1">{project.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-[#6F2B75] shrink-0" />
                                            <span className="line-clamp-1">{project.locationName}</span>
                                        </div>
                                    </div>

                                    {/* Footer de la carte */}
                                    <div className="pt-3 border-t border-[#ECDDFD]/60 flex items-center justify-between gap-3 mt-auto">
                                        <span className="text-xs font-school font-bold text-slate-400 group-hover:text-[#EC602B] transition-colors">
                                            Découvrir le projet
                                        </span>
                                        <span className="shrink-0 btn-phoenix-gradient px-4 py-2 rounded-full text-xs text-white shadow-soft flex items-center gap-1">
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
                <div className="mb-20 bg-[#ECDDFD]/40 rounded-[2.5rem] p-8 sm:p-12 border border-[#ECDDFD] shadow-soft">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] bg-white px-4 py-1.5 rounded-full border border-[#ECDDFD] shadow-soft inline-block mb-3">
                            Méthodologie Phoenix
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-display text-[#2A082D] tracking-tight mb-3">
                            Nos 4 Axes de Travail
                        </h2>
                        <p className="text-[#2A082D]/80 font-medium text-sm sm:text-base">
                            Chaque séance dans nos 9 projets est construite autour de 4 piliers fondamentaux pour ouvrir le champ des possibles de nos tutorés.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Axe 1 */}
                        <div className="p-6 rounded-[2rem] bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-full bg-[#EC602B] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
                                    <BookOpen size={22} />
                                </div>
                                <h3 className="text-lg font-display text-[#2A082D] mb-2">
                                    Accompagnement Scolaire
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                    Au travers de séances de tutorat individualisé et/ou collectif : aide aux devoirs, révision des notions clés et acquisition de méthodes de travail durables.
                                </p>
                            </div>
                            <span className="text-[11px] font-school font-bold text-[#EC602B] uppercase tracking-wider mt-4">
                                Brevet & Baccalauréat
                            </span>
                        </div>

                        {/* Axe 2 */}
                        <div className="p-6 rounded-[2rem] bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-full bg-[#6F2B75] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
                                    <Sparkles size={22} />
                                </div>
                                <h3 className="text-lg font-display text-[#2A082D] mb-2">
                                    Ouverture Culturelle
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                    Au travers de séances d'actualités, de grands débats argumentés, d'ateliers créatifs, de sorties théâtrales et muséales, et de voyages de fin d'année.
                                </p>
                            </div>
                            <span className="text-[11px] font-school font-bold text-[#6F2B75] uppercase tracking-wider mt-4">
                                Curiosité & Débat
                            </span>
                        </div>

                        {/* Axe 3 */}
                        <div className="p-6 rounded-[2rem] bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
                                    <Compass size={22} />
                                </div>
                                <h3 className="text-lg font-display text-[#2A082D] mb-2">
                                    Aide à l'Orientation
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                    À propos des parcours d'études possibles, de leurs débouchés, des filières sélectives et de la découverte du monde professionnel et de l'entreprise.
                                </p>
                            </div>
                            <span className="text-[11px] font-school font-bold text-indigo-700 uppercase tracking-wider mt-4">
                                Ambition & Choix
                            </span>
                        </div>

                        {/* Axe 4 */}
                        <div className="p-6 rounded-[2rem] bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
                                    <Heart size={22} />
                                </div>
                                <h3 className="text-lg font-display text-[#2A082D] mb-2">
                                    Développement Personnel
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                    Au travers de conseils bienveillants et d'un suivi personnalisé : gain de confiance en soi, maîtrise de la prise de parole en public et esprit critique.
                                </p>
                            </div>
                            <span className="text-[11px] font-school font-bold text-emerald-700 uppercase tracking-wider mt-4">
                                Confiance & Éloquence
                            </span>
                        </div>
                    </div>
                </div>

                {/* ──────────────── SECTION ENRICHIE : PLANNING HEBDOMADAIRE ──────────────── */}
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-[#ECDDFD] shadow-soft-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <span className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] bg-[#ECDDFD] px-4 py-1.5 rounded-full inline-block mb-3">
                                Organisation de terrain
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] tracking-tight">
                                Planning Hebdomadaire des Projets
                            </h2>
                            <p className="text-slate-600 font-medium text-sm mt-1">
                                Les interventions Phoenix se déploient du lundi au samedi à travers les arrondissements de Marseille.
                            </p>
                        </div>
                        <div className="text-xs text-slate-600 font-medium max-w-xs bg-[#FFFBF4] p-4 rounded-2xl border border-[#ECDDFD]">
                            Pour les projets avec plusieurs séances par semaine, un système de roulement permet aux tuteurs d'effectuer 1 à 2 séances par semaine.
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-[#ECDDFD] text-xs font-school font-bold uppercase tracking-wider text-slate-500">
                                    <th className="py-3.5 px-4">Projet</th>
                                    <th className="py-3.5 px-3 text-center">Lundi</th>
                                    <th className="py-3.5 px-3 text-center">Mardi</th>
                                    <th className="py-3.5 px-3 text-center">Mercredi</th>
                                    <th className="py-3.5 px-3 text-center">Jeudi</th>
                                    <th className="py-3.5 px-3 text-center">Vendredi</th>
                                    <th className="py-3.5 px-3 text-center">Samedi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ECDDFD]/50 font-medium">
                                {weeklySchedule.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#ECDDFD]/30 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-[#2A082D] flex items-center gap-2">
                                            <span>{item.name}</span>
                                            {item.isCordee && (
                                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#ECDDFD] text-[#6F2B75] font-school font-bold uppercase">
                                                    Cordée
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.monday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EC602B] text-white shadow-soft"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.tuesday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EC602B] text-white shadow-soft"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.wednesday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EC602B] text-white shadow-soft"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.thursday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EC602B] text-white shadow-soft"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.friday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#EC602B] text-white shadow-soft"><Check size={12} className="stroke-[3]" /></span>}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.saturday && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#6F2B75] text-white shadow-soft"><Check size={12} className="stroke-[3]" /></span>}
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

