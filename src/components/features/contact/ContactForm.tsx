import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

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
    const isSubmittingRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setStatus('loading');

        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API_URL}/api/send-email`, {
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
        } finally {
            isSubmittingRef.current = false;
        }
    };

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-xl mx-auto bg-white rounded-xl p-10 sm:p-14 text-center border border-phoenix-lilac/50 shadow-xl"
            >
                <div className="w-20 h-20 bg-phoenix-lilac/40 text-phoenix-purple rounded-full flex items-center justify-center mx-auto mb-6 border border-phoenix-lilac/70">
                    <CheckCircle size={36} className="text-phoenix-purple" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-display text-phoenix-dark mb-3">Message bien reçu !</h2>
                <div className="w-12 h-1 bg-[#EC602B] mx-auto mb-6 rounded-full" />

                <p className="text-slate-600 font-sans mb-8 leading-relaxed text-sm sm:text-base">
                    Merci pour votre message concernant <span className="font-bold text-phoenix-purple">{category}</span>.<br />
                    Notre équipe vous répondra dans les plus brefs délais.
                </p>

                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-phoenix-lilac/80 bg-phoenix-cream/60 hover:bg-phoenix-purple hover:text-white text-phoenix-dark text-xs font-school uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                    <ArrowLeft size={16} />
                    <span>Retour au choix</span>
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl mx-auto"
        >
            <button
                onClick={onBack}
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-phoenix-lilac/80 hover:border-phoenix-purple text-xs font-school uppercase tracking-wider text-phoenix-dark hover:text-phoenix-purple shadow-xs transition-all group cursor-pointer"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Changer de motif</span>
            </button>

            {/* Form Container */}
            <div className="bg-white border border-[#6F2B75]/15 rounded-organic p-8 sm:p-12 shadow-phoenix-colored relative overflow-hidden">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="h-px w-6 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">Demande de contact</span>
                        <span className="h-px w-6 bg-[#EC602B]"></span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display text-phoenix-dark">
                        {category}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                    <div>
                        <label className="block text-xs font-school uppercase tracking-wider text-phoenix-dark mb-2">
                            Nom Complet
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-phoenix-cream/40 rounded-2xl border border-phoenix-lilac/80 px-4 py-3 text-phoenix-dark font-sans focus:outline-none focus:border-phoenix-purple focus:ring-2 focus:ring-phoenix-purple/20 transition-all placeholder-slate-400 text-sm"
                            placeholder="Ex: Camille Dupont"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-school uppercase tracking-wider text-phoenix-dark mb-2">
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-phoenix-cream/40 rounded-2xl border border-phoenix-lilac/80 px-4 py-3 text-phoenix-dark font-sans focus:outline-none focus:border-phoenix-purple focus:ring-2 focus:ring-phoenix-purple/20 transition-all placeholder-slate-400 text-sm"
                            placeholder="Ex: contact@exemple.fr"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 text-center">
                            <p className="text-red-700 text-xs font-school uppercase tracking-wider">
                                Une erreur est survenue lors de l'envoi. Veuillez réessayer.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-school uppercase tracking-wider text-phoenix-dark mb-2">
                            Votre message
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-phoenix-cream/40 rounded-lg border border-phoenix-lilac/80 px-4 py-3 text-phoenix-dark font-sans focus:outline-none focus:border-phoenix-purple focus:ring-2 focus:ring-phoenix-purple/20 transition-all resize-none placeholder-slate-400 text-sm"
                            placeholder="Expliquez-nous votre projet ou votre demande..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-4 px-6 btn-phoenix-orange btn-glow-orange text-white rounded-lg font-school uppercase tracking-wider text-xs shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer touch-tactile"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Envoi en cours...</span>
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                <span>Envoyer le message</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
