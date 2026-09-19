import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KeyFigures } from '../components/sections/KeyFigures';
import { HeroScroll } from '../components/sections/HeroScroll';
import { ConcreteActions } from '../components/sections/ConcreteActions';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { DonationSection } from '../components/sections/DonationSection';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';

const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Comment bénéficier du tutorat scolaire gratuit avec Phœnix Égalité des Chances ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Le tutorat s'adresse aux collégiens et lycéens de Marseille scolarisés dans nos collèges et lycées partenaires ainsi que dans le cadre des Cordées de la Réussite. L'accompagnement hebdomadaire par les étudiants tuteurs de KEDGE Business School est 100% gratuit."
            }
        },
        {
            "@type": "Question",
            "name": "Les dons à l'association Phœnix Égalité des Chances sont-ils déductibles d'impôts ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Oui. En tant qu'association d'intérêt général (loi 1901), vos dons ouvrent droit à une réduction d'impôt sur le revenu de 66% pour les particuliers (dans la limite de 20% du revenu imposable) et de 60% pour les entreprises au titre du mécénat."
            }
        },
        {
            "@type": "Question",
            "name": "Qui sont les tuteurs de l'association Phœnix EDC ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Les tuteurs sont des étudiants de KEDGE Business School Marseille engagés bénévolement. Ils sont formés et interviennent chaque semaine pour du soutien scolaire, de la méthodologie, du mentorat et des sorties culturelles auprès de plus de 300 jeunes."
            }
        },
        {
            "@type": "Question",
            "name": "Quelles sont les actions concrètes menées à Marseille ?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Phœnix mène 9 projets de terrain (ACSE, Massa 13, Jules Ferry, Sup d'OM...), organise des sorties culturelles (musées, théâtre, opéra), des visites d'entreprises et d'institutions, ainsi que des concours d'éloquence et des simulations diplomatiques (SIMONU)."
            }
        }
    ]
};

export function Home() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            {/* Balises SEO dynamiques & Rich Snippets FAQ Schema.org */}
            <SEO
                title="Tutorat Scolaire & Égalité des Chances – Mentorat Étudiant KEDGE BS – Marseille (13)"
                description="Association étudiante de KEDGE Business School : tutorat scolaire gratuit, mentorat académique et ouverture culturelle pour 300 collégiens et lycéens à Marseille depuis 2011."
                schema={homeFaqSchema}
            />

            {/* Scroll Reveal Hero */}
            <HeroScroll />

            {/* Stats Section - Animated Key Figures */}
            <KeyFigures />

            {/* Section 1: Ce que nous faisons concrètement (3 piliers de terrain avec photos) */}
            <ConcreteActions />

            {/* Section 2: Paroles de jeunes & tuteurs (Témoignages incarnés) */}
            <TestimonialsSection />

            {/* Section 3: Soutien financier & Collecte de dons déductibles (66%) */}
            <DonationSection />

            {/* Section 4: Partenaires & Réseau */}
            <section className="py-20 md:py-28 bg-transparent">
                <div className="container mx-auto px-4 text-center max-w-7xl">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Réseau Associatif &amp; Partenaires
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight mb-4 leading-[1.1]">
                        {t('partners.title')} {t('partners.titleHighlight')}
                    </h2>

                    <p className="text-[#2A082D]/80 font-medium text-sm sm:text-base max-w-xl mx-auto mb-12">
                        Entreprises engagées, fondations et institutions marseillaises : ils soutiennent nos actions pour l'égalité des chances.
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 justify-items-center mb-10 max-w-4xl mx-auto">
                        {[
                            { name: "Olympique de Marseille", src: "/partners/om.png", alt: "Logo partenaire officiel Olympique de Marseille" },
                            { name: "Decathlon", src: "/partners/decathlon.png", alt: "Logo partenaire officiel Decathlon" },
                            { name: "Deloitte", src: "/partners/deloitte.jpg", alt: "Logo partenaire officiel Deloitte" },
                            { name: "Apprentis d'Auteuil", src: "/partners/apprentis-auteuil.png", rounded: true, alt: "Logo partenaire officiel Apprentis d'Auteuil" },
                            { name: "Darty", src: "/partners/darty.png", rounded: true, alt: "Logo partenaire officiel Darty" },
                            { name: "Kedge Business School", src: "/partners/kedge.png", alt: "Logo institutionnel Kedge Business School" },
                            { name: "Lydia", src: "/partners/lydia.png", alt: "Logo partenaire officiel Lydia" },
                        ].map((partner) => (
                            <div
                                key={partner.name}
                                className="bg-white border border-[#ECDDFD] rounded-xl p-3 sm:p-4 w-full h-20 sm:h-24 flex items-center justify-center overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 group"
                            >
                                <img
                                    src={partner.src}
                                    alt={partner.alt}
                                    className={`max-h-12 sm:max-h-14 max-w-[85%] w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-105 ${
                                        partner.rounded ? "rounded-md" : ""
                                    }`}
                                />
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/partenaires"
                        className="btn-phoenix-orange px-7 py-3 rounded-lg text-xs sm:text-sm uppercase tracking-wider text-white shadow-glow-orange inline-flex items-center gap-2"
                    >
                        <span>{t('partners.viewAll')}</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
