import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SelectionView } from '../components/features/contact/SelectionView';
import { ContactForm } from '../components/features/contact/ContactForm';
import { Recruitment } from '../components/sections/Recruitment';


export function Contact() {
    const location = useLocation();
    const queryCategory = new URLSearchParams(location.search).get('category');
    const [overrideCategory, setOverrideCategory] = useState<string | null | undefined>(undefined);

    const selectedCategory = overrideCategory !== undefined ? overrideCategory : queryCategory;

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-24">
            <div className="container mx-auto px-6 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-phoenix-lilac/40 border border-phoenix-lilac/70 text-phoenix-purple text-xs font-school uppercase tracking-widest mb-3">
                        <span className="w-2 h-2 rounded-full bg-phoenix-orange animate-pulse" />
                        <span>Écrivez-nous</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-display text-phoenix-dark mb-2">
                        {selectedCategory ? 'Votre Demande' : 'Contactez-nous'}
                    </h1>
                    <p className="font-script text-2xl text-phoenix-purple mb-3">
                        ~ À votre écoute pour faire grandir l'égalité des chances ~
                    </p>
                    <p className="text-slate-600 font-sans text-base max-w-xl mx-auto leading-relaxed">
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
