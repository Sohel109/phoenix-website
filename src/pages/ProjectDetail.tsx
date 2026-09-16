import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { ArrowLeft, MapPin } from 'lucide-react';

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
                <h1 className="text-3xl font-bold mb-4 text-slate-900">Projet Introuvable</h1>
                <Link to="/projets" className="text-orange-600 hover:underline font-semibold">Retour aux projets</Link>
            </div>
        );
    }

    return (
        <div className="pt-28 sm:pt-32 pb-20 min-h-screen bg-transparent">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/projets" className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 font-semibold transition-colors mb-6 text-sm">
                    <ArrowLeft size={18} />
                    <span>Retour à tous les projets</span>
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header with Banner Image */}
                    <div className={`h-56 sm:h-72 relative ${project.bannerFit === 'contain' ? 'bg-white' : 'bg-slate-100'} border-b border-slate-100 flex items-center justify-center overflow-hidden`}>
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

                        {/* Soft subtle overlay (uniquement pour les photos réelles) */}
                        {project.bannerFit !== 'contain' && (
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                        )}

                        {/* Logo Overlay */}
                        {project.image && (
                            <div className="absolute -bottom-12 left-6 sm:left-10 w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-md flex items-center justify-center border-4 border-white overflow-hidden p-1.5">
                                <img src={project.image} alt={project.title} className="w-full h-full object-contain" />
                            </div>
                        )}
                        {!project.image && (
                            <div className="absolute -bottom-12 left-6 sm:left-10 w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl shadow-md p-3 flex items-center justify-center text-orange-500 border-4 border-white">
                                <project.icon size={40} />
                            </div>
                        )}
                    </div>

                    <div className="pt-16 px-6 sm:px-10 pb-10">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200/80">
                                {project.category}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                {project.type}
                            </span>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1 ml-auto">
                                <MapPin size={14} className="text-orange-500" />
                                <span>Marseille</span>
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-6 tracking-tight">{project.title}</h1>

                        <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed">
                            <p className="text-base sm:text-lg leading-relaxed mb-6 font-normal border-l-4 border-orange-400 pl-4 bg-orange-50/40 py-2 rounded-r-xl text-slate-700">
                                {project.description}
                            </p>

                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">À propos de l'action</h3>
                            <p className="mb-4 text-sm sm:text-base leading-relaxed">
                                Ce projet s'inscrit au cœur de la mission de Phoenix Égalité des Chances. Chaque semaine, nos étudiants bénévoles de KEDGE Business School s'investissent directement auprès des collégiens et lycéens marseillais pour favoriser la persévérance scolaire, la confiance en soi et l'ambition professionnelle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
