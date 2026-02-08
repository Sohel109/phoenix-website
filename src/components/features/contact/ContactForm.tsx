import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Loader2, CheckCircle, ChevronRight } from 'lucide-react';

interface ContactFormProps {
    category: string;
    onBack: () => void;
}

export function ContactForm({ category, onBack }: ContactFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('http://localhost:3001/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    ...formData
                })
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl mx-auto bg-[#1A103C]/90 backdrop-blur-md rounded-3xl p-16 text-center border border-white/5 shadow-2xl"
            >
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="w-20 h-20 border border-green-500/20 bg-green-500/5 rounded-full flex items-center justify-center mx-auto mb-8"
                >
                    <CheckCircle strokeWidth={1} className="w-8 h-8 text-green-400" />
                </motion.div>

                <h2 className="text-2xl font-light uppercase tracking-widest text-white mb-4">Message Transmis</h2>
                <div className="w-12 h-[1px] bg-white/20 mx-auto mb-6" />

                <p className="text-gray-400 font-light mb-12 leading-relaxed">
                    Nous avons bien reçu votre demande concernant <span className="text-white uppercase tracking-wider text-sm border-b border-white/20 pb-0.5">{category}</span>.<br />
                    Une confirmation a été envoyée à votre adresse email.
                </p>

                <button
                    onClick={onBack}
                    className="group relative px-8 py-3 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-colors duration-500"
                >
                    <span className="relative z-10 text-xs uppercase tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors duration-500">Retour à l'accueil</span>
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl mx-auto"
        >
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-3 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors duration-500 group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-500" />
                Retour
            </button>

            {/* Form Container - Matches Card Style */}
            <div className="bg-[#1A103C]/90 backdrop-blur-md border border-white/5 rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden">

                {/* Subtle top light */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="text-center mb-10">
                    <span className="text-xs font-light uppercase tracking-[0.3em] text-white/50 mb-2 block">Formulaire</span>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider font-display">
                        {category}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-white transition-colors duration-500">Nom Complet</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 rounded-lg border border-white/5 px-4 py-3 text-white font-light focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all duration-300 placeholder-white/20"
                            placeholder="Votre nom"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-white transition-colors duration-500">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white/5 rounded-lg border border-white/5 px-4 py-3 text-white font-light focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all duration-300 placeholder-white/20"
                            placeholder="votre@email.com"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                            <p className="text-red-400 text-xs uppercase tracking-wider">
                                Erreur lors de l'envoi. Veuillez réessayer.
                            </p>
                        </div>
                    )}

                    <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-white transition-colors duration-500">Message</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-white/5 rounded-lg border border-white/5 px-4 py-3 text-white font-light focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all duration-300 resize-none placeholder-white/20"
                            placeholder="Votre message"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full mt-8 group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 hover:scale-[1.02]"
                    >
                        {status === 'loading' ? (
                            <Loader2 className="animate-spin text-white/80" />
                        ) : (
                            <>
                                <span className="text-sm font-bold uppercase tracking-wider text-white">
                                    Envoyer
                                </span>
                                <Send size={16} className="text-white group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
