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
        <div className="min-h-screen bg-transparent pt-40 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-2.5 mb-3">
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-orange-600">
                            Écrivez-nous
                        </span>
                        <span className="w-5 h-0.5 bg-orange-500 rounded-full" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight mb-4 text-slate-900">
                        {selectedCategory ? 'Votre Demande' : 'Contactez-nous'}
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                        {selectedCategory 
                            ? 'Dites-nous en plus sur votre projet ou votre question.'
                            : 'Une question sur nos programmes, envie de devenir partenaire ou bénévole ? Choisissez votre motif ci-dessous.'}
                    </p>
                </motion.div>

                {/* Main Content Area */}
                <div className="min-h-[600px] flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
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
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
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
