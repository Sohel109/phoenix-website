import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

export function Projects() {
    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider relative inline-block text-gray-900 dark:text-white">
                        Nos Projets
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-orange-500 rounded-full"></span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group"
                        >
                            <motion.div
                                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                className="bg-white dark:bg-current-card border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-violet-900/20 transition-all relative flex flex-col"
                            >
                                {/* Banner Image */}
                                <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                    {project.banner ? (
                                        <img
                                            src={project.banner}
                                            alt={`${project.title} bannière`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-orange-500/20" />
                                    )}
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Logo badge over the banner */}
                                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-white overflow-hidden">
                                        {project.image ? (
                                            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <project.icon size={28} className="text-gray-700" />
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="pt-4 pb-6 px-6 flex flex-col items-start text-left flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 font-display">{project.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-grow">
                                        {project.description}
                                    </p>

                                    {/* Button */}
                                    <Link
                                        to={`/projets/${project.id}`}
                                        className="px-6 py-2 bg-gradient-to-tr from-orange-500 to-pink-500 text-white font-semibold rounded-full text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
                                    >
                                        Découvrir
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
