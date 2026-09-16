import { ArrowRight, BookOpen, Globe, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { KeyFigures } from '../components/sections/KeyFigures';
import { HeroScroll } from '../components/sections/HeroScroll';
import { useTranslation } from 'react-i18next';

export function Home() {
    const { t } = useTranslation();
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Scroll Reveal Hero */}
            <HeroScroll />

            {/* Stats Section - Animated Key Figures (instantané sur mobile) */}
            <KeyFigures />

            {/* Missions Section */}
            <section className="py-14 sm:py-28 bg-transparent transition-colors duration-300">
                <div className="container mx-auto px-4 max-w-7xl">
                    <motion.div
                        initial={isMobile ? false : { opacity: 0, y: 20 }}
                        whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center max-w-3xl mx-auto mb-10 md:mb-16"
                    >
                        <div className="flex items-center justify-center gap-2.5 mb-3">
                            <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-600">
                                Nos Piliers Fondateurs
                            </span>
                            <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                        </div>
                        <h2 className="text-2xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-4 text-slate-900">
                            {t('home.missions.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">{t('home.missions.titleHighlight')}</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                number: "01",
                                icon: <BookOpen size={24} />,
                                title: t('home.missions.academic.title'),
                                desc: t('home.missions.academic.desc')
                            },
                            {
                                number: "02",
                                icon: <Globe size={24} />,
                                title: t('home.missions.culture.title'),
                                desc: t('home.missions.culture.desc')
                            },
                            {
                                number: "03",
                                icon: <GraduationCap size={24} />,
                                title: t('home.missions.orientation.title'),
                                desc: t('home.missions.orientation.desc')
                            }
                        ].map((mission, i) => (
                            <motion.div
                                key={i}
                                initial={isMobile ? false : { opacity: 0, y: 25 }}
                                whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.1,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                className="h-full"
                            >
                                <MissionCard
                                    number={mission.number}
                                    icon={mission.icon}
                                    title={mission.title}
                                    description={mission.desc}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-14 md:py-24 bg-transparent transition-colors duration-300">
                <div className="container mx-auto px-4 text-center max-w-7xl">
                    <div className="flex items-center justify-center gap-2.5 mb-3">
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-600">
                            Réseau Associatif & Éducatif
                        </span>
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                    </div>
                    <h2 className="text-2xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-10 text-slate-900">
                        {t('partners.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">{t('partners.titleHighlight')}</span>
                    </h2>

                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5 items-center mb-10 max-w-6xl mx-auto">
                        {[
                            { name: "Olympique de Marseille", src: "/partners/om.png" },
                            { name: "Decathlon", src: "/partners/decathlon.png" },
                            { name: "Deloitte", src: "/partners/deloitte.jpg" },
                            { name: "Apprentis d'Auteuil", src: "/partners/apprentis-auteuil.png", rounded: true },
                            { name: "Darty", src: "/partners/darty.png", rounded: true },
                            { name: "Kedge Business School", src: "/partners/kedge.png" },
                            { name: "Lydia", src: "/partners/lydia.png" },
                        ].map((partner) => (
                            <div
                                key={partner.name}
                                className="bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4 w-[calc(50%-0.5rem)] xs:w-[calc(33.333%-0.75rem)] sm:w-[calc(25%-0.75rem)] lg:w-36 xl:w-40 h-20 sm:h-24 flex items-center justify-center overflow-hidden shadow-xs hover:border-orange-400 hover:shadow-sm transition-colors duration-200"
                            >
                                <img
                                    src={partner.src}
                                    alt={partner.name}
                                    className={`max-h-12 sm:max-h-14 max-w-[85%] w-auto h-auto object-contain ${
                                        partner.rounded ? "rounded-md" : ""
                                    }`}
                                />
                            </div>
                        ))}
                    </div>

                    <Link to="/partenaires" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-bold transition-colors text-sm sm:text-base">
                        {t('partners.viewAll')}
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function MissionCard({
    number,
    icon,
    title,
    description
}: {
    number: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="h-full bg-white p-7 sm:p-8 rounded-xl border border-slate-200/90 hover:border-orange-400 shadow-xs hover:shadow-sm transition-colors duration-200 flex flex-col justify-between text-left relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200/60 transition-colors duration-200 group-hover:bg-orange-500 group-hover:text-white">
                    {icon}
                </div>
                <span className="text-2xl font-black text-slate-200 group-hover:text-orange-300 transition-colors select-none font-mono">
                    {number}
                </span>
            </div>
            <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2.5 tracking-tight">
                    {title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm font-normal">
                    {description}
                </p>
            </div>
        </div>
    );
}
