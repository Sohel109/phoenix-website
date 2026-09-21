import { KeyFigures } from '../components/sections/KeyFigures';
import { HeroScroll } from '../components/sections/HeroScroll';
import { ConcreteActions } from '../components/sections/ConcreteActions';
import { TestimonialsSection } from '../components/sections/TestimonialsSection';
import { DonationSection } from '../components/sections/DonationSection';
import { PartnersCarousel } from '../components/sections/PartnersCarousel';
import { SEO } from '../components/common/SEO';

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
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            {/* Balises SEO dynamiques & Rich Snippets FAQ Schema.org */}
            <SEO
                title="Phœnix EDC – Tutorat & Égalité des Chances – Marseille / KEDGE BS"
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

            {/* Section 4: Partenaires - Carrousel inspiré d'Action Grand Sud */}
            <PartnersCarousel />
        </div>
    );
}
