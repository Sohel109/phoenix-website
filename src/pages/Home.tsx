import { ArrowRight, BookOpen, Globe, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyFigures } from '../components/sections/KeyFigures';
import { HeroScroll } from '../components/sections/HeroScroll';
import { AISection } from '../components/sections/AISection';

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

            {/* AI Section */}
            <AISection />

            {/* Partners Section */}
            <section className="py-32 bg-transparent transition-colors duration-300">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-16">
                        {t('partners.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600">{t('partners.titleHighlight')}</span>
                    </h2>

                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 mb-12 opacity-80 dark:opacity-100">
                        <div className="bg-white dark:bg-white/90 p-2 rounded-lg"><img src="/partners/om.png" alt="Olympique de Marseille" className="h-20 md:h-24 hover:scale-110 transition-all duration-300 object-contain" /></div>
                        <div className="bg-white dark:bg-white/90 p-2 rounded-lg"><img src="/partners/decathlon.png" alt="Decathlon" className="h-14 md:h-20 hover:scale-110 transition-all duration-300 object-contain" /></div>
                        <div className="bg-white dark:bg-white/90 p-2 rounded-lg"><img src="/partners/deloitte.jpg" alt="Deloitte" className="h-10 md:h-12 hover:scale-110 transition-all duration-300 object-contain mix-blend-multiply" /></div>
                        <div className="bg-white dark:bg-white/90 p-2 rounded-lg"><img src="/partners/apprentis-auteuil.jpg" alt="Apprentis d'Auteuil" className="h-16 md:h-20 hover:scale-110 transition-all duration-300 object-contain mix-blend-multiply" /></div>
                        <div className="bg-white dark:bg-white/90 p-2 rounded-lg"><img src="/partners/lydia.png" alt="Lydia" className="h-10 md:h-12 hover:scale-110 transition-all duration-300 object-contain" /></div>
                        <div className="bg-white dark:bg-white/90 p-2 rounded-lg"><img src="/partners/darty.png" alt="Darty" className="h-10 md:h-12 hover:scale-110 transition-all duration-300 object-contain" /></div>
                        <div className="bg-white dark:bg-white/90 p-2 rounded-lg"><img src="/partners/kedge.png" alt="Kedge Business School" className="h-16 md:h-24 hover:scale-110 transition-all duration-300 object-contain" /></div>
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
