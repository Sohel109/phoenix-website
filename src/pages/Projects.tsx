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
    ChevronDown,
    Calendar,
    Search,
    X
} from 'lucide-react';
import { useState } from 'react';
import { SEO } from '../components/common/SEO';
import { MaskingTape } from '../components/common/HandDrawnElements';

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


const projectAnnotations: Record<string, string> = {
    'massa-13': '« Le pionnier de Phœnix depuis 2011 »',
    'jules-ferry': '« Ateliers au cœur des quartiers »',
    'acse': '« Projet phare Cordées & culture »',
    'sup-d-om': '« Partenariat d exception avec l OM »'
};

export function Projects() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);

    const filteredProjects = projects.filter(p => {
        if (activeFilter === 'cordees' && !p.isCordee) return false;
        if (activeFilter === 'college' && p.category !== 'Collège') return false;
        if (activeFilter === 'lycee' && p.category !== 'Lycée' && p.category !== 'Phoenix x OM' && p.category !== 'Association') return false;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchesTitle = p.title.toLowerCase().includes(q);
            const matchesTarget = p.targetAudience?.toLowerCase().includes(q) || false;
            const matchesLocation = p.locationName?.toLowerCase().includes(q) || false;
            const matchesDesc = p.description?.toLowerCase().includes(q) || false;
            const matchesCategory = p.category?.toLowerCase().includes(q) || false;
            const matchesType = p.type?.toLowerCase().includes(q) || false;
            return matchesTitle || matchesTarget || matchesLocation || matchesDesc || matchesCategory || matchesType;
        }

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
                title="Nos Projets – Tutorat Scolaire & Cordées – Marseille / KEDGE BS"
                description="Découvrez les 9 projets de tutorat et soutien scolaire menés par les étudiants de KEDGE BS à Marseille : ACSE, Arthur Rimbaud, Izzo, Jules Ferry, Roy d'Espagne, Sup d'OM, Saint-Gabriel..."
                schema={projectsBreadcrumbSchema}
            />

            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section Aéré */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Nos Antennes de Terrain · 5 Cordées de la Réussite
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight mb-4 leading-[1.1] text-balance">
                        Des{' '}
                        <span className="marker-highlight text-[#EC602B]">
                            <span>Projets Concrets</span>
                        </span>{' '}
                        pour l'Égalité
                    </h1>
                    <p className="text-[#2A082D]/80 font-medium max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8 text-pretty">
                        Chaque semaine, nos bénévoles accompagnent 300 collégiens et lycéens marseillais à travers soutien scolaire, éveil culturel et aide à l'orientation.
                    </p>

                    {/* Action Link & Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                        <Link
                            to="/carte-des-projets"
                            className="btn-phoenix-outline px-6 py-3 rounded-full text-xs sm:text-sm font-school font-bold shadow-soft flex items-center gap-2 active:scale-95 touch-tactile hover:border-[#6F2B75] uppercase tracking-wider border-2 hover:bg-[#ECDDFD]/30 transition-all"
                        >
                            <MapPin size={16} className="text-[#EC602B]" />
                            <span>Carte interactive des projets</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Search Input */}
                    <div className="relative max-w-md mx-auto mb-5">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#904990] pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un établissement, quartier (ex: Izzo, 15e, OM)..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white border border-[#6F2B75]/20 text-xs sm:text-sm text-[#2A082D] placeholder-[#904990]/60 shadow-soft focus:outline-none focus:ring-2 focus:ring-[#EC602B]/50 focus:border-[#EC602B] transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#904990] hover:text-[#EC602B] p-1 cursor-pointer"
                                title="Effacer la recherche"
                                aria-label="Effacer la recherche"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all shadow-soft active:scale-95 cursor-pointer ${
                                activeFilter === 'all'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#6F2B75]/15'
                            }`}
                        >
                            Tous les projets (9)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('cordees')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all flex items-center gap-1.5 shadow-soft active:scale-95 cursor-pointer ${
                                activeFilter === 'cordees'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#6F2B75] hover:bg-[#ECDDFD] border border-[#6F2B75]/15'
                            }`}
                        >
                            <Award size={14} className="text-[#EC602B]" />
                            <span>5 Cordées de la Réussite</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('college')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all shadow-soft active:scale-95 cursor-pointer ${
                                activeFilter === 'college'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#6F2B75]/15'
                            }`}
                        >
                            Collèges (4)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveFilter('lycee')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-school font-bold transition-all shadow-soft active:scale-95 cursor-pointer ${
                                activeFilter === 'lycee'
                                    ? 'bg-[#6F2B75] text-white shadow-soft-lg'
                                    : 'bg-white text-[#2A082D] hover:bg-[#ECDDFD]/60 border border-[#6F2B75]/15'
                            }`}
                        >
                            Lycées & Structures (4)
                        </button>
                    </div>
                </div>

                {/* Empty State if search matches nothing */}
                {filteredProjects.length === 0 ? (
                    <div className="bg-white rounded-organic-sm border border-[#6F2B75]/15 p-10 text-center max-w-lg mx-auto shadow-phoenix-colored mb-20">
                        <Search size={36} className="mx-auto text-[#904990]/50 mb-3" />
                        <h3 className="font-display text-xl text-[#2A082D] mb-1">Aucun projet trouvé</h3>
                        <p className="text-slate-500 text-xs sm:text-sm mb-5">
                            Aucun projet ne correspond à « <strong className="text-[#2A082D]">{searchQuery}</strong> ». Essayez avec un autre nom ou réinitialisez.
                        </p>
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                            className="btn-phoenix-orange btn-glow-orange px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider text-white cursor-pointer touch-tactile"
                        >
                            Réinitialiser la recherche
                        </button>
                    </div>
                ) : (
                    /* Grille des Projets : Format Fiches de terrain / Polaroids avec Trame Cahier d'écolier */
                    <div className="relative pattern-notebook-grid p-3 sm:p-8 rounded-3xl border border-[#6F2B75]/10 mb-20 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 relative z-10">
                            {filteredProjects.map((project, idx) => (
                                <div key={project.id} className="h-full relative group/card pt-3">
                                    {/* Ruban adhésif Masking Tape centré avec bords dentelés */}
                                    <MaskingTape
                                        variant={idx % 2 === 0 ? "warm" : "lilac"}
                                        angle={idx % 2 === 0 ? "left" : "right"}
                                        className="-top-1.5 left-1/2 -translate-x-1/2 z-30"
                                    />

                                    <Link
                                        to={`/projets/${project.id}`}
                                        className="bg-white rounded-xl border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg transition-all duration-300 overflow-hidden flex flex-col h-full group cursor-pointer relative active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#EC602B] will-change-transform sm:hover:rotate-1 border-b-[14px] border-b-white"
                                    >
                                        {/* Image Header */}
                                        <div className={`relative aspect-video w-full overflow-hidden ${project.id === 'sup-d-om' ? 'bg-white border-b border-[#ECDDFD]/60' : 'bg-slate-900'} flex items-center justify-center`}>
                                            <img
                                                src={project.banner || project.image}
                                                alt={`Projet de tutorat ${project.title} - Phœnix EDC Marseille`}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                            {project.id !== 'sup-d-om' && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/75 via-[#2A082D]/15 to-transparent pointer-events-none" />
                                            )}

                                            {/* Macaron du projet en haut à gauche avec liseré pointillé */}
                                            {project.id !== 'sup-d-om' && project.image && (
                                                <div className="absolute top-3 left-3 w-11 h-11 rounded-full bg-white/95 p-1 shadow-md border-2 border-dashed border-[#6F2B75]/40 flex items-center justify-center overflow-hidden z-20 group-hover:rotate-6 transition-transform">
                                                    <img
                                                        src={project.image}
                                                        alt={`Logo officiel du projet ${project.title}`}
                                                        className="w-full h-full object-contain rounded-full"
                                                    />
                                                </div>
                                            )}

                                            {/* Badges top décalés à droite du macaron */}
                                            <div className={`absolute top-3.5 ${project.id !== 'sup-d-om' && project.image ? 'left-16' : 'left-3.5'} flex flex-wrap gap-1.5 z-10`}>
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
                                        </div>

                                        {/* Corps de la carte épuré */}
                                        <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between bg-white">
                                            <div>
                                                {/* Micro-annotation manuscrite Allura intégrée au projet de façon lisible et logique */}
                                                {projectAnnotations[project.id] && (
                                                    <div className="mb-1.5">
                                                        <span className="inline-block font-script text-xl sm:text-2xl text-[#2A082D] select-none -rotate-1">
                                                            {projectAnnotations[project.id]}
                                                        </span>
                                                    </div>
                                                )}

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
                    </div>
                )}

                {/* ──────────────── SECTION ENRICHIE : LES 4 AXES DE TRAVAIL ──────────────── */}
                <div className="mb-20 bg-[#ECDDFD]/40 rounded-organic p-8 sm:p-12 border border-[#6F2B75]/20 shadow-phoenix-colored">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] bg-white px-3.5 py-1.5 rounded-full border border-[#6F2B75]/15 shadow-soft inline-block mb-3">
                            Méthodologie Phoenix
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-display text-[#2A082D] tracking-tight mb-3">
                            Nos{' '}
                            <span className="marker-highlight text-[#EC602B]">
                                <span>4 Axes de Travail</span>
                            </span>
                        </h2>
                        <p className="text-[#2A082D]/80 font-medium text-sm sm:text-base">
                            Chaque séance dans nos 9 projets est construite autour de 4 piliers fondamentaux pour ouvrir le champ des possibles de nos tutorés.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Axe 1 */}
                        <div className="p-6 rounded-organic-sm bg-white border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 will-change-transform flex flex-col justify-between">
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
                        <div className="p-6 rounded-organic-sm bg-white border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 will-change-transform flex flex-col justify-between">
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
                        <div className="p-6 rounded-organic-sm bg-white border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 will-change-transform flex flex-col justify-between">
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
                        <div className="p-6 rounded-organic-sm bg-white border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 will-change-transform flex flex-col justify-between">
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

                {/* ──────────────── SECTION PLANNING HEBDOMADAIRE (ACCORDÉON ÉPURÉ) ──────────────── */}
                <div className="bg-[#ECDDFD]/50 border border-[#6F2B75]/20 rounded-organic p-6 sm:p-8 shadow-phoenix-colored overflow-hidden transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl bg-[#6F2B75] text-white flex items-center justify-center shadow-soft shrink-0">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <span className="text-[11px] font-school font-bold uppercase tracking-wider text-[#6F2B75] block">
                                    Organisation & Rythme
                                </span>
                                <h2 className="text-xl sm:text-2xl font-display text-[#2A082D] tracking-tight">
                                    Planning Hebdomadaire des Séances
                                </h2>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsScheduleOpen(!isScheduleOpen)}
                            className="btn-phoenix-gradient !py-2.5 !px-5 rounded-lg text-white font-school font-bold text-xs uppercase tracking-wider shadow-soft flex items-center gap-2 cursor-pointer active:scale-95"
                            aria-expanded={isScheduleOpen}
                        >
                            <span>{isScheduleOpen ? "Masquer le planning" : "Consulter la semaine type"}</span>
                            <ChevronDown
                                size={16}
                                className={`transition-transform duration-300 ${isScheduleOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                    </div>

                    {/* Schedule Table (Visible si déplié) */}
                    {isScheduleOpen && (
                        <div className="mt-6 pt-6 border-t border-[#ECDDFD]">
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

                            <p className="text-center text-xs text-slate-600 font-medium mt-4 max-w-2xl mx-auto leading-relaxed">
                                Pour les projets comptant plusieurs séances hebdomadaires, un système de rotation est mis en place afin que chaque tuteur n'effectue qu'une à deux séances par semaine.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

