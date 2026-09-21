import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SelectionView } from '../components/features/contact/SelectionView';
import { ContactForm } from '../components/features/contact/ContactForm';
import { Recruitment } from '../components/sections/Recruitment';
import { SEO } from '../components/common/SEO';

const contactBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://www.phoenix-egalite-des-chances.com/"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Contact",
            "item": "https://www.phoenix-egalite-des-chances.com/contact"
        }
    ]
};

export function Contact() {
    const location = useLocation();
    const queryCategory = new URLSearchParams(location.search).get('category');
    const [overrideCategory, setOverrideCategory] = useState<string | null | undefined>(undefined);

    const selectedCategory = overrideCategory !== undefined ? overrideCategory : queryCategory;

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-24">
            <SEO
                title="Contact & Recrutement – Devenir Tuteur Bénévole – Marseille / KEDGE BS"
                description="Contactez l'équipe de Phœnix Égalité des Chances à KEDGE Business School Marseille pour devenir tuteur bénévole, établissement ou entreprise partenaire."
                schema={contactBreadcrumbSchema}
            />
            <div className="container mx-auto px-6 max-w-5xl relative z-10">

                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Écrivez-nous · À votre écoute
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-display text-phoenix-dark mb-3">
                        {selectedCategory ? (
                            <>
                                Votre{' '}
                                <span className="marker-highlight text-[#EC602B]">
                                    <span>Demande</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="marker-highlight text-[#EC602B]">
                                    <span>Contactez-nous</span>
                                </span>
                            </>
                        )}
                    </h1>
                    <p className="text-slate-600 font-sans text-base max-w-xl mx-auto leading-relaxed font-normal">
                        {selectedCategory 
                            ? 'Dites-nous en plus sur votre projet ou votre question.'
                            : 'Une question sur nos programmes, envie de devenir partenaire ou bénévole ? Choisissez votre motif ci-dessous.'}
                    </p>
                </div>

                {/* Main Content Area */}
                <div className="relative">
                    <AnimatePresence mode="wait" initial={false}>
                        {!selectedCategory ? (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.5 }}
                                className="w-full"
                            >
                                <SelectionView onSelect={setOverrideCategory} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full"
                            >
                                <ContactForm
                                    category={selectedCategory}
                                    onBack={() => setOverrideCategory(null)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Recruitment Section */}
                <Recruitment />


            </div>
        </div>
    );
}
