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
                className="w-full max-w-xl mx-auto bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-md"
            >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                    <CheckCircle size={32} />
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-3">Message bien reçu !</h2>
                <div className="w-12 h-1 bg-orange-500 mx-auto mb-6 rounded-full" />

                <p className="text-slate-600 font-normal mb-8 leading-relaxed text-sm sm:text-base">
                    Merci pour votre message concernant <span className="font-bold text-slate-900">{category}</span>.<br />
                    Notre équipe vous répondra dans les plus brefs délais.
                </p>

                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-sm font-semibold transition-all"
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
                className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-slate-300 hover:border-orange-500 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-orange-600 shadow-xs transition-all group cursor-pointer"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Changer de motif</span>
            </button>

            {/* Form Container */}
            <div className="bg-white border-2 border-slate-300/80 rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
                <div className="text-center mb-8">
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200/80 px-3 py-1 rounded-full mb-3 inline-block">
                        Demande de contact
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                        {category}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                            Nom Complet
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white rounded-xl border-2 border-slate-300 px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-orange-500 transition-all placeholder-slate-400 text-sm shadow-xs"
                            placeholder="Ex: Camille Dupont"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white rounded-xl border-2 border-slate-300 px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-orange-500 transition-all placeholder-slate-400 text-sm shadow-xs"
                            placeholder="Ex: contact@exemple.fr"
                        />
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3.5 text-center">
                            <p className="text-red-700 text-xs font-bold">
                                Une erreur est survenue lors de l'envoi. Veuillez réessayer.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                            Votre Message
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-white rounded-xl border-2 border-slate-300 px-4 py-3 text-slate-900 font-medium focus:outline-none focus:border-orange-500 transition-all resize-none placeholder-slate-400 text-sm shadow-xs"
                            placeholder="Expliquez-nous votre projet ou votre demande..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl border-2 border-orange-500 shadow-md shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
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
