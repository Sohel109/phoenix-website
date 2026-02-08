import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SelectionView } from '../components/features/contact/SelectionView';
import { ContactForm } from '../components/features/contact/ContactForm';

export function Contact() {
    const location = useLocation();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        if (category) {
            setSelectedCategory(category);
        }
    }, [location.search]);

    return (
        <div className="min-h-screen bg-transparent pt-40 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600 drop-shadow-lg">
                            {selectedCategory ? 'Votre Demande' : 'Contactez-nous'}
                        </span>
                    </h1>
                    {selectedCategory && (
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                            Dites-nous en plus sur votre projet ou votre question.
                        </p>
                    )}
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
                                <SelectionView onSelect={setSelectedCategory} />
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
                                    onBack={() => setSelectedCategory(null)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
