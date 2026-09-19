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
    Heart
} from 'lucide-react';
import { useState } from 'react';
import { SEO } from '../components/common/SEO';

type FilterType = 'all' | 'cordees' | 'college' | 'lycee';

const projectsBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://www.phoenix-egalite-des-chances.com/"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Projets de Tutorat",
            "item": "https://www.phoenix-egalite-des-chances.com/projets"
        }
    ]
};

export function Projects() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const filteredProjects = projects.filter(p => {
        if (activeFilter === 'cordees') return p.isCordee;
        if (activeFilter === 'college') return p.category === 'Collège';
        if (activeFilter === 'lycee') return p.category === 'Lycée' || p.category === 'Phoenix x OM' || p.category === 'Association';
        return true;
    });

    const weeklySchedules = [
        { name: "ACSE", isCordee: true, monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: true, saturdayFilled: true },
        { name: "APPRENTIS D'AUTEUIL", isCordee: false, monday: false, tuesday: true, wednesday: false, thursday: true, friday: false, saturday: false, saturdayFilled: false },
        { name: "ARTHUR RIMBAUD", isCordee: true, monday: false, tuesday: false, wednesday: false, thursday: true, friday: false, saturday: false, saturdayFilled: false },
        { name: "IZZO", isCordee: true, monday: false, tuesday: false, wednesday: false, thursday: true, friday: false, saturday: false, saturdayFilled: false },
        { name: "JULES FERRY", isCordee: true, monday: false, tuesday: false, wednesday: true, thursday: false, friday: false, saturday: false, saturdayFilled: false },
        { name: "MASSA 13", isCordee: false, monday: false, tuesday: false, wednesday: true, thursday: false, friday: false, saturday: false, saturdayFilled: false },
        { name: "ROY D'ESPAGNE", isCordee: true, monday: false, tuesday: false, wednesday: false, thursday: true, friday: false, saturday: false, saturdayFilled: false },
        { name: "SAINT GABRIEL", isCordee: false, monday: true, tuesday: true, wednesday: false, thursday: true, friday: true, saturday: false, saturdayFilled: false },
        { name: "SUP D'OM", isCordee: false, monday: false, tuesday: true, wednesday: true, thursday: true, friday: false, saturday: true, saturdayFilled: true },
    ];

    return (
        <div className="pt-page-safe pb-28 bg-[#FFFBF4] bg-bird-pattern min-h-screen">
            {/* Balises SEO dynamiques */}
            <SEO
                title="Projets de Tutorat Scolaire – Cordées de la Réussite & Lycées – Marseille (13)"
                description="Découvrez les 9 projets de tutorat et soutien scolaire menés par les étudiants de KEDGE BS à Marseille : ACSE, Arthur Rimbaud, Izzo, Jules Ferry, Roy d'Espagne, Sup d'OM, Saint-Gabriel..."
                schema={projectsBreadcrumbSchema}
            />

            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Nos Antennes de Terrain · 5 Cordées de la Réussite
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight mb-4 leading-[1.1] text-balance">
                        Des Projets Concrets pour l'Égalité
                    </h1>
                    <p className="text-[#2A082D]/80 font-medium max-w-3xl mx-auto text-sm sm:text-base leading-relaxed mb-8 text-pretty">
                        Chaque semaine, nos +100 étudiants bénévoles accompagnent <strong className="text-[#2A082D] font-bold">300 jeunes marseillais</strong> de la 6ème à la Terminale. Nos actions combinent soutien scolaire, éveil culturel, aide à l'orientation et développement personnel.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
                        <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#ECDDFD] text-xs font-school font-bold text-[#2A082D] shadow-soft">
                            <strong className="text-[#EC602B] font-black tabular-nums">300</strong> tutorés suivis
                        </span>
                        <span className="px-3.5 py-1.5 rounded-lg bg-[#ECDDFD] border border-[#D9BEF8] text-xs font-school font-bold text-[#6F2B75] shadow-soft">
                            <strong className="text-[#6F2B75] font-black tabular-nums">5</strong> Cordées de la Réussite
                        </span>
                        <span className="px-3.5 py-1.5 rounded-lg bg-[#E1BBCB]/50 border border-[#E1BBCB] text-xs font-school font-bold text-[#2A082D] shadow-soft">
                            <strong className="text-[#EC602B] font-black tabular-nums">9</strong> implantations à Marseille
                        </span>
                        <span className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-school font-bold text-emerald-800 shadow-soft">
                            <strong className="text-emerald-900 font-black">Du lundi au samedi</strong>
                        </span>
                    </div>

                    {/* Action Links & Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/carte-des-projets"
                            className="btn-phoenix-outline px-6 py-3 rounded-lg text-xs sm:text-sm font-school font-bold shadow-soft flex items-center gap-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                        >
                            <MapPin size={16} className="text-[#EC602B]" />
                            <span>Voir la carte interactive des projets</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all shadow-soft active:scale-95 focus-visible:ring-2 focus-visible:ring-[#EC602B] ${
                                activeFilter === 'all'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#ECDDFD]'
                            }`}
                        >
                            Tous les projets (9)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('cordees')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all flex items-center gap-1.5 shadow-soft active:scale-95 focus-visible:ring-2 focus-visible:ring-[#EC602B] ${
                                activeFilter === 'cordees'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#6F2B75] hover:bg-[#ECDDFD] border border-[#ECDDFD]'
                            }`}
                        >
                            <Award size={14} />
                            <span>Cordées de la Réussite (5)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('college')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all shadow-soft active:scale-95 focus-visible:ring-2 focus-visible:ring-[#EC602B] ${
                                activeFilter === 'college'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#ECDDFD]'
                            }`}
                        >
                            Collèges (5)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('lycee')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all shadow-soft active:scale-95 focus-visible:ring-2 focus-visible:ring-[#EC602B] ${
                                activeFilter === 'lycee'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#ECDDFD]'
                            }`}
                        >
                            Lycées, OM & Asso (4)
                        </button>
                    </div>
                </div>

                {/* Grid des Projets Épurée (Les détails complets sont sur la fiche dédiée) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="h-full"
                        >
                            <Link
                                to={`/projets/${project.id}`}
                                className="bg-white rounded-xl border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full group cursor-pointer relative active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                            >
                                {/* Image Header */}
                                <div className={`relative aspect-video w-full overflow-hidden ${project.id === 'sup-d-om' ? 'bg-white border-b border-[#ECDDFD]/60' : 'bg-slate-900'} flex items-center justify-center`}>
                                    <img
                                        src={project.banner || project.image}
                                        alt={project.title}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />
                                    {project.id !== 'sup-d-om' && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/75 via-[#2A082D]/15 to-transparent pointer-events-none" />
                                    )}

                                    {/* Badges top */}
                                    <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
                                        <span className="px-2.5 py-1 rounded text-xs font-school font-bold bg-white/95 backdrop-blur-md text-[#2A082D] shadow-soft border border-slate-200/80">
                                            {project.category}
                                        </span>
                                        {project.isCordee && (
                                            <span className="px-2.5 py-1 rounded text-xs font-school font-bold bg-[#6F2B75] text-white shadow-soft flex items-center gap-1">
                                                <Award size={12} />
                                                <span>Cordée</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Creation Year top right */}
                                    <div className="absolute top-3.5 right-3.5 z-10">
                                        <span className="px-2.5 py-1 rounded text-[11px] font-school font-bold bg-[#2A082D]/85 backdrop-blur-md text-white shadow-soft">
                                            Depuis {project.creationYear}
                                        </span>
                                    </div>

                                    {/* Round Macaron Logo Pastille bottom right */}
                                    {project.id !== 'sup-d-om' && project.image && (
                                        <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center overflow-hidden z-10">
                                            <img
                                                src={project.image}
                                                alt={`${project.title} logo`}
                                                className="w-full h-full object-contain rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Corps de la carte épuré */}
                                <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between bg-white">
                                    <div>
                                        <h3 className="text-2xl font-display text-[#2A082D] mb-2.5 group-hover:text-[#EC602B] transition-colors leading-snug tracking-tight">
                                            {project.title}
                                        </h3>

                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 font-normal mb-6">
                                            {project.description}
                                        </p>
                                    </div>

                                    {/* Footer épuré de la carte */}
                                    <div className="pt-4 border-t border-[#ECDDFD]/60 flex items-center justify-between gap-3">
                                        <span className="text-xs font-school font-bold text-[#6F2B75] flex items-center gap-1.5">
                                            <Users size={14} className="text-[#EC602B]" />
                                            <span>{project.tutorCount} élèves</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-school font-bold text-[#EC602B] group-hover:translate-x-1 transition-transform">
                                            <span>Voir la fiche</span>
                                            <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* ──────────────── SECTION ENRICHIE : LES 4 AXES DE TRAVAIL ──────────────── */}
                <div className="mb-20 bg-[#ECDDFD]/40 rounded-xl p-8 sm:p-12 border border-[#ECDDFD] shadow-soft">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] bg-white px-3.5 py-1.5 rounded border border-[#ECDDFD] shadow-soft inline-block mb-3">
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
                        <div className="p-6 rounded-xl bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-[#EC602B] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
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
                        <div className="p-6 rounded-xl bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-[#6F2B75] text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
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
                        <div className="p-6 rounded-xl bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
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
                        <div className="p-6 rounded-xl bg-white border border-[#ECDDFD] shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-soft">
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

                {/* ──────────────── SECTION ENRICHIE : PLANNING HEBDOMADAIRE (TABLEAU RÉCAPITULATIF) ──────────────── */}
                <div className="bg-[#ECDDFD]/70 border-2 border-[#6F2B75]/20 rounded-xl p-6 sm:p-10 shadow-soft-lg overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-badge.jpg"
                                alt="Phœnix EDC"
                                className="w-12 h-12 rounded-full border-2 border-white shadow-soft object-contain"
                            />
                            <div>
                                <span className="text-[11px] font-school font-bold uppercase tracking-wider text-[#6F2B75]">
                                    Organisation de terrain
                                </span>
                                <p className="text-xs text-[#2A082D]/80 font-medium">9 antennes actives à Marseille</p>
                            </div>
                        </div>

                        <h2 className="font-script text-4xl sm:text-5xl text-[#2A082D] tracking-wide text-center">
                            Tableau récapitulatif
                        </h2>

                        <div className="hidden sm:block text-right">
                            <span className="text-[11px] font-school font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/90 text-[#6F2B75] border border-[#ECDDFD] shadow-soft">
                                Semaine type
                            </span>
                        </div>
                    </div>

                    {/* Schedule Table */}
                    <div className="overflow-x-auto bg-white rounded-xl border border-[#D6C4EC] shadow-soft">
                        <table className="w-full text-left text-sm border-collapse min-w-[640px]">
                            <thead>
                                <tr className="border-b border-[#D6C4EC] bg-[#EBDFF5] text-xs font-school font-bold uppercase tracking-wider text-[#2A082D]">
                                    <th className="py-4 px-5 border-r border-[#D6C4EC]/70">PROJET</th>
                                    <th className="py-4 px-3 text-center border-r border-[#D6C4EC]/70">LUNDI</th>
                                    <th className="py-4 px-3 text-center border-r border-[#D6C4EC]/70">MARDI</th>
                                    <th className="py-4 px-3 text-center border-r border-[#D6C4EC]/70">MERCREDI</th>
                                    <th className="py-4 px-3 text-center border-r border-[#D6C4EC]/70">JEUDI</th>
                                    <th className="py-4 px-3 text-center border-r border-[#D6C4EC]/70">VENDREDI</th>
                                    <th className="py-4 px-3 text-center">SAMEDI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5D7F2] font-medium">
                                {weeklySchedules.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#ECDDFD]/30 transition-colors">
                                        <td className="py-3.5 px-5 font-school font-bold text-[#2A082D] border-r border-[#E5D7F2] flex items-center justify-between gap-3">
                                            <span className="text-sm tracking-wide">{item.name}</span>
                                            {item.isCordee && (
                                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#501354] text-white font-school font-bold uppercase tracking-wider shrink-0 shadow-2xs">
                                                    CORDÉE
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center border-r border-[#E5D7F2]">
                                            {item.monday && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF5FE] text-[#6F2B75] border border-[#ECDDFD] font-bold text-xs select-none shadow-2xs">✕</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center border-r border-[#E5D7F2]">
                                            {item.tuesday && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF5FE] text-[#6F2B75] border border-[#ECDDFD] font-bold text-xs select-none shadow-2xs">✕</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center border-r border-[#E5D7F2]">
                                            {item.wednesday && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF5FE] text-[#6F2B75] border border-[#ECDDFD] font-bold text-xs select-none shadow-2xs">✕</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center border-r border-[#E5D7F2]">
                                            {item.thursday && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF5FE] text-[#6F2B75] border border-[#ECDDFD] font-bold text-xs select-none shadow-2xs">✕</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center border-r border-[#E5D7F2]">
                                            {item.friday && (
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF5FE] text-[#6F2B75] border border-[#ECDDFD] font-bold text-xs select-none shadow-2xs">✕</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-3 text-center">
                                            {item.saturday && (
                                                item.saturdayFilled ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#501354] text-white font-bold text-xs select-none shadow-sm">✕</span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF5FE] text-[#6F2B75] border border-[#ECDDFD] font-bold text-xs select-none shadow-2xs">✕</span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-center text-xs sm:text-sm text-[#2A082D]/85 font-school font-medium mt-6 max-w-2xl mx-auto leading-relaxed">
                        Pour les projets qui ont plusieurs séances par semaine, un système de roulement est mis en place afin que les tuteurs n'aient qu'une ou deux séances par semaine.
                    </p>
                </div>
            </div>
        </div>
    );
}

