import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
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
                <h1 className="text-3xl font-black mb-4 text-slate-900">Projet Introuvable</h1>
                <p className="text-slate-500 mb-6">Le projet demandé n'existe pas ou a été déplacé.</p>
                <Link to="/projets" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-md hover:bg-orange-600 transition-colors">
                    <ArrowLeft size={16} />
                    <span>Retour à tous les projets</span>
                </Link>
            </div>
        );
    }

    // Projets alternatifs pour la navigation en bas de page
    const otherProjects = projects.filter(p => p.id !== project.id).slice(0, 3);

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FBF9F5]">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                {/* Back Button */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <Link 
                        to="/projets" 
                        className="inline-flex items-center gap-2 text-slate-700 hover:text-black font-black text-xs sm:text-sm group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Tous les 9 projets</span>
                    </Link>

                    <Link 
                        to="/carte-des-projets" 
                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#EA580C] bg-[#FFF7ED] hover:bg-orange-100 px-3.5 py-1.5 rounded-xl border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] transition-transform active:translate-x-[1px] active:translate-y-[1px]"
                    >
                        <MapPin size={13} />
                        <span>Situer à Marseille</span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl sm:rounded-4xl shadow-[6px_6px_0px_0px_#0A1120] border-2 border-[#0A1120] overflow-hidden">
                    {/* Header with Banner Image */}
                    <div className={`h-60 sm:h-80 relative ${project.bannerFit === 'contain' ? 'bg-white' : 'bg-slate-900'} border-b-2 border-[#0A1120] flex items-center justify-center overflow-hidden`}>
                        {project.banner ? (
                            <img
                                src={project.banner}
                                alt={`${project.title} Banner`}
                                className={`w-full h-full ${
                                    project.bannerFit === 'contain'
                                        ? 'object-contain p-6 sm:p-8 max-h-[92%] object-center'
                                        : 'object-cover ' + (project.id === 'acse' ? 'object-[center_25%]' : 'object-center')
                                }`}
                            />
                        ) : (
                            <div className="bg-slate-100 w-full h-full" />
                        )}

                        {/* Soft subtle overlay */}
                        {project.bannerFit !== 'contain' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1120]/80 via-[#0A1120]/20 to-transparent pointer-events-none" />
                        )}

                        {/* Badges en haut à droite de l'image */}
                        <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 justify-end">
                            {project.isCordee && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-black text-xs border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120]">
                                    <Award size={14} />
                                    <span>Cordée de la Réussite</span>
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-[#0A1120] font-black text-xs border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120]">
                                <span>Créé en {project.creationYear}</span>
                            </span>
                        </div>

                        {/* Logo Overlay */}
                        {project.image && (
                            <div className="absolute -bottom-10 left-6 sm:left-10 w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-[4px_4px_0px_0px_#0A1120] flex items-center justify-center border-2 border-[#0A1120] overflow-hidden p-2 z-10">
                                <img src={project.image} alt={project.title} className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="pt-14 sm:pt-16 px-6 sm:px-10 pb-12">
                        {/* Tags Header */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFF7ED] text-[#EA580C] border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120]">
                                {project.category}
                            </span>
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F4EFEA] text-[#0A1120] border-2 border-[#0A1120]/15">
                                {project.type}
                            </span>
                            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border-2 border-emerald-300 flex items-center gap-1">
                                <Users size={13} />
                                <span>{project.tutorCount} élèves accompagnés</span>
                            </span>
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 ml-auto">
                                <MapPin size={13} className="text-[#EA580C]" />
                                <span>Marseille</span>
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-black text-[#0A1120] mb-4 tracking-tight">
                            {project.title}
                        </h1>

                        {/* Chefs de projet sous le titre */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4EFEA] border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] text-[#0A1120] text-xs sm:text-sm font-semibold">
                                <UserCheck size={16} className="text-[#EA580C] shrink-0" />
                                <span>{project.chefs.length > 1 ? 'Chefs de projet :' : 'Chef de projet :'} <strong className="font-display font-black text-[#0A1120]">{project.chefs.join(' & ')}</strong></span>
                            </div>
                        </div>

                        {/* Highlight intro box */}
                        <div className="mb-8 p-5 sm:p-6 bg-[#FFF7ED] rounded-2xl border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#0A1120]">
                            <p className="text-[#0A1120] text-base sm:text-lg font-medium leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        {/* 4 Key Details Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                            {/* Card 1: Horaires */}
                            <div className="bg-white border-2 border-[#0A1120] rounded-2xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_0px_#0A1120]">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                    <Clock size={15} className="text-[#EA580C]" />
                                    <span>Horaires</span>
                                </div>
                                <p className="text-sm font-bold text-[#0A1120] leading-snug">
                                    {project.schedule}
                                </p>
                            </div>

                            {/* Card 2: Lieu */}
                            <div className="bg-white border-2 border-[#0A1120] rounded-2xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_0px_#0A1120]">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                    <MapPin size={15} className="text-purple-600" />
                                    <span>Lieu</span>
                                </div>
                                <p className="text-sm font-bold text-[#0A1120] leading-snug">
                                    {project.locationName}
                                </p>
                            </div>

                            {/* Card 3: Chefs de projet */}
                            <div className="bg-white border-2 border-[#0A1120] rounded-2xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_0px_#0A1120]">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                    <UserCheck size={15} className="text-[#EA580C]" />
                                    <span>{project.chefs.length > 1 ? 'Chefs de projet' : 'Chef de projet'}</span>
                                </div>
                                <div className="space-y-0.5">
                                    {project.chefs.map((chef, idx) => (
                                        <p key={idx} className="text-sm font-bold text-[#0A1120] leading-snug">
                                            {chef}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Card 4: Voyage / Sorties */}
                            <div className="bg-white border-2 border-[#0A1120] rounded-2xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_0px_#0A1120]">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                    <Compass size={15} className="text-emerald-600" />
                                    <span>Voyage & Sorties</span>
                                </div>
                                <p className="text-sm font-bold text-[#0A1120] leading-snug">
                                    {project.trip || "Sorties culturelles annuelles"}
                                </p>
                            </div>
                        </div>

                        {/* Detailed Description Section */}
                        <div className="mb-10">
                            <h2 className="text-xl sm:text-3xl font-display font-black text-[#0A1120] tracking-tight mb-4 flex items-center gap-2.5">
                                <Sparkles size={22} className="text-[#EA580C]" />
                                <span>Présentation & Déroulement du Projet</span>
                            </h2>
                            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 font-medium">
                                <p>{project.fullDescription}</p>
                            </div>
                        </div>

                        {/* Axes de Travail */}
                        {project.axes && project.axes.length > 0 && (
                            <div className="mb-10 p-6 bg-[#F4EFEA] rounded-2xl border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#0A1120]">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
                                    Axes d'intervention prioritaires
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {project.axes.map((axe, i) => (
                                        <span 
                                            key={i} 
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border-2 border-[#0A1120] text-[#0A1120] text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_#0A1120]"
                                        >
                                            <CheckCircle2 size={14} className="text-[#EA580C]" />
                                            <span>{axe}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section Chefs de Projet Responsables */}
                        <div className="mb-10 p-5 sm:p-6 bg-white rounded-2xl border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#0A1120]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#0A1120] text-white flex items-center justify-center border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#EA580C] shrink-0">
                                        <UserCheck size={22} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-black uppercase tracking-wider text-[#EA580C] block mb-0.5">
                                            {project.chefs.length > 1 ? 'Chefs de projet responsables' : 'Chef de projet responsable'}
                                        </span>
                                        <h3 className="text-base sm:text-lg font-display font-black text-[#0A1120]">
                                            {project.chefs.join(' & ')}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {project.chefs.map((chef, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFF7ED] border-2 border-[#0A1120] text-[#0A1120] font-bold text-xs shadow-[2px_2px_0px_0px_#0A1120]">
                                            <span className="w-2 h-2 rounded-full bg-[#EA580C] shrink-0"></span>
                                            <span>{chef}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Call to Actions & Social Links */}
                        <div className="pt-8 border-t-2 border-[#0A1120]/10 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {project.instagram && (
                                    <a
                                        href={`https://instagram.com/${project.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs uppercase tracking-wider border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] hover:-translate-y-0.5 transition-transform"
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
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-black text-xs uppercase tracking-wider border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] hover:-translate-y-0.5 transition-transform"
                                    >
                                        <Facebook size={15} />
                                        <span>{project.facebook.startsWith('http') ? 'Facebook' : `@${project.facebook}`}</span>
                                    </a>
                                )}

                                <Link
                                    to="/carte-des-projets"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border-2 border-[#0A1120] text-[#0A1120] hover:text-[#EA580C] font-black text-xs uppercase tracking-wider transition-colors shadow-[2px_2px_0px_0px_#0A1120] hover:-translate-y-0.5"
                                >
                                    <MapPin size={14} className="text-[#EA580C]" />
                                    <span>Localiser sur la carte</span>
                                </Link>
                            </div>

                            <Link
                                to="/contact"
                                className="btn-tactile-primary !py-3 !px-6 !text-xs uppercase tracking-wider"
                            >
                                <span>Rejoindre ou soutenir ce projet</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Other Projects Quick Discovery */}
                <div className="mt-16">
                    <h3 className="text-xl sm:text-2xl font-display font-black text-[#0A1120] mb-6">
                        Découvrir d'autres projets de Phœnix
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {otherProjects.map(op => (
                            <Link
                                key={op.id}
                                to={`/projets/${op.id}`}
                                className="group bg-white rounded-2xl border-2 border-[#0A1120] shadow-[3px_3px_0px_0px_#0A1120] hover:shadow-[5px_5px_0px_0px_#EA580C] hover:-translate-y-1 p-5 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/40">
                                            {op.category}
                                        </span>
                                        <span className="text-xs text-slate-500 font-bold">
                                            {op.tutorCount} élèves
                                        </span>
                                    </div>
                                    <h4 className="text-base font-display font-black text-[#0A1120] group-hover:text-[#EA580C] transition-colors mb-1.5">
                                        {op.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                                        {op.description}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-[#EA580C] group-hover:translate-x-0.5 transition-transform">
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
