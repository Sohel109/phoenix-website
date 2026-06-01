import { ArrowRight, BookOpen, Globe, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyFigures } from '../components/sections/KeyFigures';
import { HeroScroll } from '../components/sections/HeroScroll';
// AISection import removed

import { useTranslation } from 'react-i18next';

export function Home() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Scroll Reveal Hero */}
            <HeroScroll />

            {/* Stats Section - Animated Key Figures */}
            <KeyFigures />

            {/* Missions Section */}
            <section className="py-32 bg-transparent transition-colors duration-300">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center max-w-3xl mx-auto mb-24"
                    >
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
                            {t('home.missions.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600">{t('home.missions.titleHighlight')}</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <BookOpen size={32} />,
                                title: t('home.missions.academic.title'),
                                desc: t('home.missions.academic.desc')
                            },
                            {
                                icon: <Globe size={32} />,
                                title: t('home.missions.culture.title'),
                                desc: t('home.missions.culture.desc')
                            },
                            {
                                icon: <GraduationCap size={32} />,
                                title: t('home.missions.orientation.title'),
                                desc: t('home.missions.orientation.desc')
                            }
                        ].map((mission, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 60, rotateX: 5 }}
                                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.9,
                                    delay: i * 0.15,
                                    ease: [0.2, 0.65, 0.3, 0.9]
                                }}
                                className="h-full"
                            >
                                <MissionCard
                                    icon={mission.icon}
                                    title={mission.title}
                                    description={mission.desc}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Section removed */}

            {/* Partners Section */}
            <section className="py-32 bg-transparent transition-colors duration-300">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-16">
                        {t('partners.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600">{t('partners.titleHighlight')}</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 justify-items-center items-center mb-12">
                        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-4 w-full h-24 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                            <img src="/partners/om.png" alt="Olympique de Marseille" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-4 w-full h-24 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                            <img src="/partners/decathlon.png" alt="Decathlon" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-4 w-full h-24 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                            <img src="/partners/deloitte.jpg" alt="Deloitte" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-4 w-full h-24 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                            <img src="/partners/apprentis-auteuil.png" alt="Apprentis d'Auteuil" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-4 w-full h-24 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                            <img src="/partners/lydia.png" alt="Lydia" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-4 w-full h-24 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                            <img src="/partners/darty.png" alt="Darty" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-4 w-full h-24 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all duration-300">
                            <img src="/partners/kedge.png" alt="Kedge Business School" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                    </div>

                    <Link to="/partenaires" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors">
                        {t('partners.viewAll')}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function MissionCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="h-full bg-white dark:bg-current-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 dark:bg-white/10 text-primary dark:text-primary-light rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
