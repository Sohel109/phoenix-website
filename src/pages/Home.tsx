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
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ECDDFD] text-[#6F2B75] shadow-soft mb-4 rotate-1 hover:rotate-0 transition-transform">
                        <Sparkles size={14} className="text-[#EC602B]" />
                        <span className="text-xs font-school font-bold uppercase tracking-wider">
                            Réseau Associatif & Éducatif
                        </span>
                    </div>

                    <p className="font-script text-2xl md:text-3xl text-[#EC602B] mb-1">
                        ~ Ils nous font confiance ~
                    </p>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight mb-4 leading-[1.1]">
                        {t('partners.title')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F2B75] to-[#EC602B]">
                            {t('partners.titleHighlight')}
                        </span>
                    </h2>

                    <p className="text-[#2A082D]/80 font-medium text-sm sm:text-base max-w-xl mx-auto mb-10">
                        Entreprises engagées, fondations et institutions marseillaises : ils soutiennent nos actions pour l'égalité des chances.
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 justify-items-center mb-10 max-w-4xl mx-auto">
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
                                className="bg-white border border-[#ECDDFD] rounded-2xl p-3 sm:p-4 w-full h-20 sm:h-24 flex items-center justify-center overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 group"
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
                        className="btn-phoenix-gradient px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider text-white shadow-soft inline-flex items-center gap-2"
                    >
                        <span>{t('partners.viewAll')}</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}


