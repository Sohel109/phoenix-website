import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SelectionView } from '../components/features/contact/SelectionView';
import { ContactForm } from '../components/features/contact/ContactForm';
import { Recruitment } from '../components/sections/Recruitment';
import { SEO } from '../components/common/SEO';

export function Contact() {
    const location = useLocation();
    const queryCategory = new URLSearchParams(location.search).get('category');
    const [overrideCategory, setOverrideCategory] = useState<string | null | undefined>(undefined);

    const selectedCategory = overrideCategory !== undefined ? overrideCategory : queryCategory;

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-24">
            <SEO
                title="Contactez-nous & Devenez Bénévole | Phœnix Égalité des Chances"
                description="Écrivez à l'équipe de Phœnix Égalité des Chances pour devenir partenaire, bénévole ou poser vos questions sur nos programmes d'accompagnement scolaire."
            />
            <div className="container mx-auto px-6 max-w-5xl relative z-10">

                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] mb-2 block">
                        Écrivez-nous
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-display text-phoenix-dark mb-2">
                        {selectedCategory ? 'Votre Demande' : 'Contactez-nous'}
                    </h1>
                    <p className="font-script text-2xl text-[#2A082D] mb-3">
                        ~ À votre écoute pour faire grandir l'égalité des chances ~
                    </p>
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
