import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { MapPin, ArrowRight } from 'lucide-react';

import { useState } from 'react';

export function Projects() {
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

    return (
        <div className="pt-28 sm:pt-32 pb-24 min-h-screen bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="flex items-center justify-center gap-2.5 mb-3">
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-600">
                            Nos 9 Projets Phares
                        </span>
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Des Projets Concrets pour l'Égalité
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Du collège au lycée, nos tuteurs accompagnent plus de 300 jeunes chaque année à travers des projets ciblés de tutorat académique, d'ouverture culturelle et d'orientation.
                    </p>

                    <div className="mt-6 flex justify-center">
                        <Link
                            to="/carte-des-projets"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:border-orange-500 text-slate-800 hover:text-orange-600 text-xs sm:text-sm font-bold transition-colors bg-white shadow-xs"
                        >
                            <MapPin size={16} className="text-orange-500" />
                            <span>Voir la carte interactive des projets</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={isMobile ? false : { opacity: 0, y: 20 }}
                            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                            className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm hover:border-orange-400 transition-colors duration-200 overflow-hidden flex flex-col group"
                        >
                            {/* Image nette au ratio fixe 16:9 */}
                            <div className={`relative aspect-video w-full overflow-hidden ${project.bannerFit === 'contain' ? 'bg-white' : 'bg-slate-100'} border-b border-slate-100 flex items-center justify-center`}>
                                <img
                                    src={project.banner || project.image}
                                    alt={project.title}
                                    className={`w-full h-full ${
                                        project.bannerFit === 'contain'
                                            ? 'object-contain p-4 max-h-[92%]'
                                            : 'object-cover object-center'
                                    } group-hover:scale-105 transition-transform duration-500 ease-out`}
                                />
                                {/* Overlay gradient doux (uniquement pour les photos réelles) */}
                                {project.bannerFit !== 'contain' && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
                                )}

                                {/* Badge de catégorie doux en haut à gauche */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs border border-slate-200/80">
                                        {project.category}
                                    </span>
                                </div>

                                {/* Logo pastille en bas à droite */}
                                {project.image && (
                                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-200/80 flex items-center justify-center overflow-hidden">
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
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60">
                                        {project.type}
                                    </span>
                                </div>

                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors leading-snug tracking-tight">
                                    {project.title}
                                </h3>

                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5 flex-grow font-normal line-clamp-3">
                                    {project.description}
                                </p>

                                {/* Footer de la carte */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        <MapPin size={13} className="text-orange-500" />
                                        <span>Marseille</span>
                                    </span>
                                    <Link
                                        to={`/projets/${project.id}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs hover:shadow-md hover:shadow-orange-500/20 active:scale-95 transition-all"
                                    >
                                        <span>Découvrir</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
