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
        <div className="pt-28 sm:pt-32 pb-24 min-h-screen bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                {/* Back Button */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <Link 
                        to="/projets" 
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-bold transition-colors text-xs sm:text-sm group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Tous les 9 projets</span>
                    </Link>

                    <Link 
                        to="/carte-des-projets" 
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200/80 transition-colors"
                    >
                        <MapPin size={13} />
                        <span>Situer à Marseille</span>
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl sm:rounded-4xl shadow-md border border-slate-200/90 overflow-hidden">
                    {/* Header with Banner Image */}
                    <div className={`h-60 sm:h-80 relative ${project.bannerFit === 'contain' ? 'bg-white' : 'bg-slate-900'} border-b border-slate-100 flex items-center justify-center overflow-hidden`}>
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
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none" />
                        )}

                        {/* Badges en haut à droite de l'image */}
                        <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-2 justify-end">
                            {project.isCordee && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md">
                                    <Award size={14} />
                                    <span>Cordée de la Réussite</span>
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 font-bold text-xs shadow-md border border-white/60">
                                <span>Créé en {project.creationYear}</span>
                            </span>
                        </div>

                        {/* Logo Overlay */}
                        {project.image && (
                            <div className="absolute -bottom-10 left-6 sm:left-10 w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-white overflow-hidden p-2 z-10">
                                <img src={project.image} alt={project.title} className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="pt-14 sm:pt-16 px-6 sm:px-10 pb-12">
                        {/* Tags Header */}
                        <div className="flex flex-wrap items-center gap-2.5 mb-4">
                            <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/80">
                                {project.category}
                            </span>
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                                {project.type}
                            </span>
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                                <Users size={13} />
                                <span>{project.tutorCount} élèves accompagnés</span>
                            </span>
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 ml-auto">
                                <MapPin size={13} className="text-orange-500" />
                                <span>Marseille</span>
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            {project.title}
                        </h1>

                        {/* Chefs de projet sous le titre */}
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-900 text-xs sm:text-sm font-semibold">
                                <UserCheck size={16} className="text-indigo-600 shrink-0" />
                                <span>{project.chefs.length > 1 ? 'Chefs de projet :' : 'Chef de projet :'} <strong className="font-black text-indigo-950">{project.chefs.join(' & ')}</strong></span>
                            </div>
                        </div>

                        {/* Highlight intro box */}
                        <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-orange-50/30 rounded-2xl border-l-4 border-orange-500 shadow-xs">
                            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed">
                                {project.description}
                            </p>
                        </div>

                        {/* 4 Key Details Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                            {/* Card 1: Horaires */}
                            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    <Clock size={15} className="text-orange-500" />
                                    <span>Horaires</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 leading-snug">
                                    {project.schedule}
                                </p>
                            </div>

                            {/* Card 2: Lieu */}
                            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    <MapPin size={15} className="text-purple-600" />
                                    <span>Lieu</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 leading-snug">
                                    {project.locationName}
                                </p>
                            </div>

                            {/* Card 3: Chefs de projet */}
                            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    <UserCheck size={15} className="text-indigo-600" />
                                    <span>{project.chefs.length > 1 ? 'Chefs de projet' : 'Chef de projet'}</span>
                                </div>
                                <div className="space-y-0.5">
                                    {project.chefs.map((chef, idx) => (
                                        <p key={idx} className="text-sm font-bold text-slate-800 leading-snug">
                                            {chef}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Card 4: Voyage / Sorties */}
                            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    <Compass size={15} className="text-emerald-600" />
                                    <span>Voyage & Sorties</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-800 leading-snug">
                                    {project.trip || "Sorties culturelles annuelles"}
                                </p>
                            </div>
                        </div>

                        {/* Detailed Description Section */}
                        <div className="mb-10">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                                <Sparkles size={20} className="text-orange-500" />
                                <span>Présentation & Déroulement du Projet</span>
                            </h2>
                            <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4">
                                <p>{project.fullDescription}</p>
                            </div>
                        </div>

                        {/* Axes de Travail */}
                        {project.axes && project.axes.length > 0 && (
                            <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                                    Axes d'intervention prioritaires
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {project.axes.map((axe, i) => (
                                        <span 
                                            key={i} 
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold shadow-2xs"
                                        >
                                            <CheckCircle2 size={14} className="text-orange-500" />
                                            <span>{axe}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section Chefs de Projet Responsables */}
                        <div className="mb-10 p-5 sm:p-6 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white rounded-2xl border border-indigo-100/90 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                                        <UserCheck size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 block mb-0.5">
                                            {project.chefs.length > 1 ? 'Chefs de projet responsables' : 'Chef de projet responsable'}
                                        </span>
                                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                                            {project.chefs.join(' & ')}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {project.chefs.map((chef, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-indigo-200 text-slate-800 font-bold text-xs shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                                            <span>{chef}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Call to Actions & Social Links */}
                        <div className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {project.instagram && (
                                    <a
                                        href={`https://instagram.com/${project.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-opacity"
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
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
                                    >
                                        <Facebook size={15} />
                                        <span>{project.facebook.startsWith('http') ? 'Facebook' : `@${project.facebook}`}</span>
                                    </a>
                                )}

                                <Link
                                    to="/carte-des-projets"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-400 text-slate-700 hover:text-orange-600 font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs"
                                >
                                    <MapPin size={14} className="text-orange-500" />
                                    <span>Localiser sur la carte</span>
                                </Link>
                            </div>

                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all"
                            >
                                <span>Rejoindre ou soutenir ce projet</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Other Projects Quick Discovery */}
                <div className="mt-16">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6">
                        Découvrir d'autres projets de Phoenix
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {otherProjects.map(op => (
                            <Link
                                key={op.id}
                                to={`/projets/${op.id}`}
                                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-orange-400 p-4 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-200/60">
                                            {op.category}
                                        </span>
                                        <span className="text-xs text-slate-400 font-semibold">
                                            {op.tutorCount} élèves
                                        </span>
                                    </div>
                                    <h4 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                                        {op.title}
                                    </h4>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                        {op.description}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:translate-x-0.5 transition-transform">
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
