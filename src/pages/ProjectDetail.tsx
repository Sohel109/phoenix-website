import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { ArrowLeft } from 'lucide-react';

export function ProjectDetail() {
    const { id } = useParams();
    const project = projects.find(p => p.id === id);

    if (!project) {
        return (
            <div className="pt-32 pb-20 text-center container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-4">Projet Introuvable</h1>
                <Link to="/projets" className="text-primary hover:underline">Retour aux projets</Link>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 min-h-screen bg-transparent transition-colors duration-300">
            <div className="container mx-auto px-4">
                <Link to="/projets" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-8">
                    <ArrowLeft size={20} />
                    Retour aux projets
                </Link>

                <div className="bg-white dark:bg-current-card rounded-3xl shadow-xl dark:shadow-none overflow-hidden max-w-4xl mx-auto border border-gray-100 dark:border-white/5">
                    {/* Header with Color */}
                    {/* Header with Banner Image */}
                    <div className="h-48 md:h-64 relative bg-gray-100 dark:bg-zinc-800">
                        {project.banner ? (
                            <img
                                src={project.banner}
                                alt={`${project.title} Banner`}
                                className={`w-full h-full object-cover ${project.id === 'acse' ? 'object-[center_25%]' : ''}`}
                            />
                        ) : (
                            <div className="bg-gray-200 w-full h-full" />
                        )}

                        {/* Logo Overlay */}
                        {project.image && (
                            <div className="absolute -bottom-16 left-8 md:left-12 w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white overflow-hidden">
                                <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        {!project.image && (
                            <div className="absolute -bottom-16 left-8 md:left-12 w-32 h-32 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-3 flex items-center justify-center text-primary border-4 border-white dark:border-zinc-900">
                                <project.icon size={48} />
                            </div>
                        )}
                    </div>

                    <div className="pt-20 px-8 md:px-12 pb-12">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{project.title}</h1>

                        <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
                            <p className="text-xl leading-relaxed mb-8 font-light border-l-4 border-primary/30 pl-6 dark:border-primary/50">
                                {project.description}
                            </p>

                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">À propos du projet</h3>
                            <p className="mb-4">
                                Ce projet s'inscrit dans notre mission d'égalité des chances. Nos bénévoles interviennent régulièrement pour accompagner les élèves.
                                (Contenu détaillé à venir...)
                            </p>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
