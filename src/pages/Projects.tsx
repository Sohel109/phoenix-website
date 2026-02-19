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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative pt-10 group"
                        >
                            {/* Logo / Icon Area */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-24 h-24 bg-white dark:bg-current-card rounded-2xl shadow-lg flex items-center justify-center border-4 border-white dark:border-current-bg overflow-hidden z-20">
                                {project.image ? (
                                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                ) : (
                                    <project.icon size={40} className="text-gray-700 dark:text-white" />
                                )}
                            </div>

                            {/* Card Body */}
                            <motion.div
                                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                className="bg-white dark:bg-current-card border border-gray-100 dark:border-white/5 pt-16 pb-6 px-8 rounded-3xl min-h-[280px] flex flex-col items-center text-center shadow-sm hover:shadow-2xl hover:shadow-violet-900/20 transition-all relative z-10"
                            >
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-2 font-display">{project.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-10 flex-grow font-medium">
                                    {project.description}
                                </p>

                                {/* Button */}
                                <Link
                                    to={`/projets/${project.id}`}
                                    className="absolute bottom-6 right-6 px-6 py-2 bg-gradient-to-tr from-orange-500 to-pink-500 text-white font-semibold rounded-full text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    Découvrir
                                </Link>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
