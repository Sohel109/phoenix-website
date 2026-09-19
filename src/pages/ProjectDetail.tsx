import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { SEO } from '../components/common/SEO';
import { 
    ArrowLeft, 
    MapPin, 
    Clock, 
    Award, 
    Users, 
    UserCheck, 
    Compass, 
    Instagram, 
    Facebook, 
    Sparkles, 
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

const projectMapById: Record<string, string> = {
    '1': 'sup-d-om',
    '2': 'acse',
    '3': 'massa-13',
    '4': 'saint-gabriel',
    '5': 'apprentis-d-auteuil',
    '6': 'izzo',
    '7': 'jules-ferry',
    '8': 'arthur-rimbaud',
    '9': 'roy-despagne',
};

export function ProjectDetail() {
    const { id } = useParams();
    const resolvedId = (id && projectMapById[id]) ? projectMapById[id] : id;
    const project = projects.find(p => p.id === resolvedId);

    if (!project) {
        return (
            <div className="pt-32 pb-20 text-center container mx-auto px-4">
                <h1 className="text-3xl font-display text-[#2A082D] mb-4">Projet Introuvable</h1>
                <p className="text-slate-500 mb-6">Le projet demandé n'existe pas ou a été déplacé.</p>
                <Link to="/projets" className="btn-phoenix-orange inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-school font-bold text-sm shadow-soft">
                    <ArrowLeft size={16} />
                    <span>Retour à tous les projets</span>
                </Link>
            </div>
        );
    }

    const otherProjects = projects.filter(p => p.id !== project.id).slice(0, 3);

    const projectBreadcrumbSchema = {
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
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": project.title,
                "item": `https://www.phoenix-egalite-des-chances.com/projets/${project.id}`
            }
        ]
    };

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title={`${project.title} – Tutorat ${project.category} & Égalité des Chances – Marseille (13)`}
                description={`${project.description.slice(0, 140)}... Tutorat scolaire et mentorat étudiant KEDGE BS à Marseille.`}
                ogImage={project.banner || project.image}
                schema={projectBreadcrumbSchema}
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                {/* Back Button & Map Link */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <Link 
                        to="/projets" 
                        className="inline-flex items-center gap-2 text-[#6F2B75] hover:text-[#EC602B] font-school font-bold text-xs sm:text-sm group transition-colors"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Tous les 9 projets</span>
                    </Link>

                    <Link 
                        to="/carte-des-projets" 
                        className="inline-flex items-center gap-1.5 text-xs font-school font-bold text-[#6F2B75] bg-[#ECDDFD] hover:bg-[#D9BEF8] px-3.5 py-1.5 rounded-lg shadow-soft transition-all"
                    >
                        <MapPin size={13} className="text-[#EC602B]" />
                        <span>Situer à Marseille</span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-soft-lg border border-[#ECDDFD] overflow-hidden">
                    {/* Header with Banner Image */}
                    <div className={`h-64 sm:h-84 relative ${project.id === 'sup-d-om' ? 'bg-white border-b border-[#ECDDFD]' : 'bg-slate-900'} flex items-center justify-center overflow-hidden`}>
                        {project.banner ? (
                            <img
                                src={project.banner}
                                alt={`Bannière du projet ${project.title} - Phœnix Égalité des Chances`}
                                className={`w-full h-full ${
                                    project.id === 'sup-d-om'
                                        ? 'object-contain p-6 sm:p-10 object-center'
                                        : 'object-cover ' + (project.id === 'acse' ? 'object-[center_25%]' : 'object-center')
                                }`}
                            />
                        ) : (
                            <div className="bg-[#ECDDFD] w-full h-full" />
                        )}

                        {/* Soft subtle overlay */}
                        {project.id !== 'sup-d-om' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/85 via-[#2A082D]/25 to-transparent pointer-events-none" />
                        )}

                        {/* Badges en haut à droite de l'image */}
                        <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 justify-end">
                            {project.isCordee && (
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6F2B75] text-white font-school font-bold text-xs shadow-soft">
                                    <Award size={14} />
                                    <span>Cordée de la Réussite</span>
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/95 text-[#2A082D] font-school font-bold text-xs shadow-soft">
                                <span>Créé en {project.creationYear}</span>
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-6 sm:px-10 pb-12 relative">
                        {/* Round Macaron Logo Overlay (Unclipped, perfectly proportioned circular avatar) */}
                        {project.image && (
                            <div className="-mt-12 sm:-mt-14 mb-4 relative z-20 inline-block">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-soft-lg flex items-center justify-center border-4 border-white overflow-hidden p-2">
                                    <img 
                                        src={project.image} 
                                        alt={`Logo officiel du projet ${project.title}`} 
                                        className="w-full h-full object-contain rounded-full" 
                                    />
                                </div>
                            </div>
                        )}

                        {/* Tags Header */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <span className="px-4 py-1.5 rounded-full text-xs font-school font-bold uppercase tracking-wider bg-[#ECDDFD] text-[#6F2B75] shadow-soft">
                                {project.category}
                            </span>
                            <span className="px-4 py-1.5 rounded-full text-xs font-school font-bold bg-[#FFFBF4] text-[#2A082D] border border-[#ECDDFD]">
                                {project.type}
                            </span>
                            <span className="px-4 py-1.5 rounded-full text-xs font-school font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <Users size={13} />
                                <span>{project.tutorCount} élèves accompagnés</span>
                            </span>
                            <span className="text-xs font-school font-bold text-slate-600 flex items-center gap-1 ml-auto">
                                <MapPin size={13} className="text-[#EC602B]" />
                                <span>Marseille</span>
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] mb-4 tracking-tight">
                            {project.title}
                        </h1>

                        {/* Chefs de projet sous le titre */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ECDDFD]/60 border border-[#ECDDFD] text-[#2A082D] text-xs sm:text-sm font-school font-bold shadow-soft">
                                <UserCheck size={16} className="text-[#EC602B] shrink-0" />
                                <span>{project.chefs.length > 1 ? 'Chefs de projet :' : 'Chef de projet :'} <strong className="text-[#6F2B75]">{project.chefs.join(' & ')}</strong></span>
                            </div>
                        </div>

                        {/* Highlight intro box */}
                        <div className="mb-8 p-6 sm:p-7 bg-[#ECDDFD]/30 rounded-xl border border-[#ECDDFD] shadow-soft">
                            <p className="text-[#2A082D] text-base sm:text-lg font-medium leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        {/* 4 Key Details Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                            {/* Card 1: Horaires */}
                            <div className="bg-white border border-[#ECDDFD] rounded-xl p-5 flex flex-col justify-between shadow-soft">
                                <div className="flex items-center gap-2 text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mb-2">
                                    <Clock size={15} />
                                    <span>Horaires</span>
                                </div>
                                <p className="text-sm font-bold text-[#2A082D] leading-snug">
                                    {project.schedule}
                                </p>
                            </div>

                            {/* Card 2: Lieu */}
                            <div className="bg-white border border-[#ECDDFD] rounded-xl p-5 flex flex-col justify-between shadow-soft">
                                <div className="flex items-center gap-2 text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mb-2">
                                    <MapPin size={15} />
                                    <span>Lieu</span>
                                </div>
                                <p className="text-sm font-bold text-[#2A082D] leading-snug">
                                    {project.locationName}
                                </p>
                            </div>

                            {/* Card 3: Chefs de projet */}
                            <div className="bg-white border border-[#ECDDFD] rounded-xl p-5 flex flex-col justify-between shadow-soft">
                                <div className="flex items-center gap-2 text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mb-2">
                                    <UserCheck size={15} />
                                    <span>{project.chefs.length > 1 ? 'Chefs de projet' : 'Chef de projet'}</span>
                                </div>
                                <div className="space-y-0.5">
                                    {project.chefs.map((chef, idx) => (
                                        <p key={idx} className="text-sm font-bold text-[#2A082D] leading-snug">
                                            {chef}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Card 4: Voyage / Sorties */}
                            <div className="bg-white border border-[#ECDDFD] rounded-xl p-5 flex flex-col justify-between shadow-soft">
                                <div className="flex items-center gap-2 text-xs font-school font-bold uppercase tracking-wider text-emerald-700 mb-2">
                                    <Compass size={15} />
                                    <span>Voyage & Sorties</span>
                                </div>
                                <p className="text-sm font-bold text-[#2A082D] leading-snug">
                                    {project.trip || "Sorties culturelles annuelles"}
                                </p>
                            </div>
                        </div>

                        {/* Detailed Description Section */}
                        <div className="mb-10">
                            <h2 className="text-xl sm:text-3xl font-display text-[#2A082D] tracking-tight mb-4 flex items-center gap-2.5">
                                <Sparkles size={22} className="text-[#EC602B]" />
                                <span>Présentation & Déroulement du Projet</span>
                            </h2>
                            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
                                <p>{project.fullDescription}</p>
                            </div>
                        </div>

                        {/* Axes de Travail */}
                        {project.axes && project.axes.length > 0 && (
                            <div className="mb-10 p-6 bg-[#ECDDFD]/30 rounded-xl border border-[#ECDDFD] shadow-soft">
                                <h3 className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mb-3">
                                    Axes d'intervention prioritaires
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {project.axes.map((axe, i) => (
                                        <span 
                                            key={i} 
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-[#ECDDFD] text-[#2A082D] text-xs sm:text-sm font-school font-bold shadow-soft"
                                        >
                                            <CheckCircle2 size={14} className="text-[#EC602B]" />
                                            <span>{axe}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section Chefs de Projet Responsables */}
                        <div className="mb-10 p-6 sm:p-7 bg-white rounded-xl border border-[#ECDDFD] shadow-soft">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#6F2B75] text-white flex items-center justify-center shadow-soft shrink-0">
                                        <UserCheck size={22} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-school font-bold uppercase tracking-wider text-[#6F2B75] block mb-0.5">
                                            {project.chefs.length > 1 ? 'Chefs de projet responsables' : 'Chef de projet responsable'}
                                        </span>
                                        <h3 className="text-base sm:text-lg font-display text-[#2A082D]">
                                            {project.chefs.join(' & ')}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {project.chefs.map((chef, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#ECDDFD] text-[#6F2B75] font-school font-bold text-xs shadow-soft">
                                            <span className="w-2 h-2 rounded-full bg-[#EC602B] shrink-0"></span>
                                            <span>{chef}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Call to Actions & Social Links */}
                        <div className="pt-8 border-t border-[#ECDDFD]/60 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {project.instagram && (
                                    <a
                                        href={`https://instagram.com/${project.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E1306C] text-white font-school font-bold text-xs uppercase tracking-wider shadow-soft hover:-translate-y-0.5 transition-transform"
                                    >
                                        <Instagram size={15} />
                                        <span>@{project.instagram}</span>
                                    </a>
                                )}

                                {project.facebook && (
                                    <a
                                        href={project.facebook.startsWith('http') ? project.facebook : `https://facebook.com/${project.facebook}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-school font-bold text-xs uppercase tracking-wider shadow-soft hover:-translate-y-0.5 transition-transform"
                                    >
                                        <Facebook size={15} />
                                        <span>{project.facebook.startsWith('http') ? 'Facebook' : `@${project.facebook}`}</span>
                                    </a>
                                )}

                                <Link
                                    to="/carte-des-projets"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#ECDDFD] text-[#2A082D] hover:text-[#EC602B] font-school font-bold text-xs uppercase tracking-wider transition-colors shadow-soft hover:-translate-y-0.5"
                                >
                                    <MapPin size={14} className="text-[#EC602B]" />
                                    <span>Localiser sur la carte</span>
                                </Link>
                            </div>

                            <Link
                                to="/contact"
                                className="btn-phoenix-orange !py-3 !px-6 !text-xs uppercase tracking-wider rounded-lg shadow-glow-orange flex items-center gap-2"
                            >
                                <span>Rejoindre ou soutenir ce projet</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Other Projects Quick Discovery */}
                <div className="mt-16">
                    <h3 className="text-xl sm:text-2xl font-display text-[#2A082D] mb-6">
                        Découvrir d'autres projets de Phœnix
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {otherProjects.map(op => (
                            <Link
                                key={op.id}
                                to={`/projets/${op.id}`}
                                className="group bg-white rounded-xl border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1 p-6 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[10px] font-school font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#ECDDFD] text-[#6F2B75]">
                                            {op.category}
                                        </span>
                                        <span className="text-xs text-slate-500 font-school font-bold">
                                            {op.tutorCount} élèves
                                        </span>
                                    </div>
                                    <h4 className="text-base font-display text-[#2A082D] group-hover:text-[#EC602B] transition-colors mb-1.5">
                                        {op.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                                        {op.description}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-[#ECDDFD]/60 flex items-center justify-between text-xs font-school font-bold text-[#6F2B75] group-hover:text-[#EC602B] group-hover:translate-x-0.5 transition-all">
                                    <span>Voir le projet</span>
                                    <ArrowRight size={13} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

