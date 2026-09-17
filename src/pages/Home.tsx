import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KeyFigures } from '../components/sections/KeyFigures';
import { HeroScroll } from '../components/sections/HeroScroll';
import { ConcreteActions } from '../components/sections/ConcreteActions';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { useTranslation } from 'react-i18next';

export function Home() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Scroll Reveal Hero */}
            <HeroScroll />

            {/* Stats Section - Animated Key Figures */}
            <KeyFigures />

            {/* Section 1: Ce que nous faisons concrètement (3 piliers de terrain avec photos) */}
            <ConcreteActions />

            {/* Section 2: Paroles de jeunes & tuteurs (Témoignages incarnés) */}
            <TestimonialsSection />

            {/* Partners Section */}
            <section className="py-16 md:py-24 bg-transparent transition-colors duration-300">
                <div className="container mx-auto px-4 text-center max-w-7xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-1.5 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] mb-4 rotate-1 hover:rotate-0 transition-transform">
                        <Sparkles size={14} className="text-orange-600" />
                        <span className="text-xs font-display font-black uppercase tracking-wider text-[#0A1120]">
                            Réseau Associatif & Éducatif
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tight mb-4 text-[#0A1120] leading-[1.05]">
                        {t('partners.title')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500">
                            {t('partners.titleHighlight')}
                        </span>
                    </h2>

                    <p className="text-slate-600 font-medium text-sm sm:text-base max-w-xl mx-auto mb-10">
                        Entreprises engagées, fondations et institutions marseillaises : ils soutiennent nos actions pour l'égalité des chances.
                    </p>

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
                                className="bg-white border-1.5 border-[#0A1120]/15 hover:border-[#0A1120] rounded-2xl p-3 sm:p-4 w-[calc(50%-0.5rem)] xs:w-[calc(33.333%-0.75rem)] sm:w-[calc(25%-0.75rem)] lg:w-36 xl:w-40 h-20 sm:h-24 flex items-center justify-center overflow-hidden shadow-xs hover:shadow-[3px_3px_0px_0px_#EA580C] hover:-translate-y-0.5 transition-all duration-200 group"
                            >
                                <img
                                    src={partner.src}
                                    alt={partner.name}
                                    className={`max-h-12 sm:max-h-14 max-w-[85%] w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-105 ${
                                        partner.rounded ? "rounded-md" : ""
                                    }`}
                                />
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/partenaires"
                        className="btn-tactile-secondary px-7 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_#0A1120]"
                    >
                        <span>{t('partners.viewAll')}</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}

