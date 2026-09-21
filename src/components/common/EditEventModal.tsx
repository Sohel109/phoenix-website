import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Tag, Check, AlertCircle } from 'lucide-react';
import type { EventItem } from '../../data/events';

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventItem | null;
    onSave: (updatedEvent: EventItem) => Promise<boolean | void>;
}

export function EditEventModal({ isOpen, onClose, event, onSave }: EditEventModalProps) {
    const [formData, setFormData] = useState<Partial<EventItem>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (event) {
            setFormData({
                id: event.id,
                title: event.title || '',
                date: event.date || '',
                location: event.location || '',
                badge: event.badge || '',
                description: event.description || '',
                fullDescription: event.fullDescription || '',
            });
            setError(null);
        }
    }, [event, isOpen]);

    if (!isOpen || !event) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title?.trim()) {
            setError('Le titre est requis');
            return;
        }
        if (!formData.date?.trim()) {
            setError('La date est requise');
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            const fullUpdated: EventItem = {
                ...event,
                title: formData.title.trim(),
                date: formData.date.trim(),
                location: formData.location?.trim() || '',
                badge: formData.badge?.trim() || '',
                description: formData.description?.trim() || '',
                fullDescription: formData.fullDescription?.trim() || '',
            };
            await onSave(fullUpdated);
            onClose();
        } catch (err) {
            console.error('Erreur sauvegarde événement:', err);
            setError('Une erreur est survenue lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#1F0422]/80 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-xl bg-white rounded-2xl shadow-soft-xl border border-[#ECDDFD] overflow-hidden my-8 z-10"
                >
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-[#2A082D] to-[#46124B] text-white flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar size={16} className="text-[#EC602B]" />
                                <span className="text-[10px] font-school font-bold uppercase tracking-widest text-[#ECDDFD]/80">
                                    Mode Modification Bureau
                                </span>
                            </div>
                            <h3 className="text-xl font-display font-bold">Modifier l'événement</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-[#ECDDFD]/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                                <AlertCircle size={15} className="shrink-0 text-red-500" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-school font-bold uppercase tracking-wider text-[#2A082D] mb-1.5">
                                Titre de l'événement *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#2A082D] focus:ring-2 focus:ring-[#EC602B]/20 focus:border-[#EC602B] outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-school font-bold uppercase tracking-wider text-[#2A082D] mb-1.5">
                                    Date affichée *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ex: 5 Décembre, Mars, 15 Mai..."
                                        value={formData.date || ''}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#2A082D] focus:ring-2 focus:ring-[#EC602B]/20 focus:border-[#EC602B] outline-none transition-all"
                                    />
                                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Sera répercutée dans le planning et sur le site public.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-school font-bold uppercase tracking-wider text-[#2A082D] mb-1.5">
                                    Badge / Catégorie
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ex: Concours d'Éloquence"
                                        value={formData.badge || ''}
                                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#2A082D] focus:ring-2 focus:ring-[#EC602B]/20 focus:border-[#EC602B] outline-none transition-all"
                                    />
                                    <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-school font-bold uppercase tracking-wider text-[#2A082D] mb-1.5">
                                Lieu / Emplacement
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ex: Campus KEDGE Business School"
                                    value={formData.location || ''}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#2A082D] focus:ring-2 focus:ring-[#EC602B]/20 focus:border-[#EC602B] outline-none transition-all"
                                />
                                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-school font-bold uppercase tracking-wider text-[#2A082D] mb-1.5">
                                Résumé (Affiché sur les cartes et planning)
                            </label>
                            <textarea
                                rows={3}
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#2A082D] focus:ring-2 focus:ring-[#EC602B]/20 focus:border-[#EC602B] outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-school font-bold uppercase tracking-wider text-[#2A082D] mb-1.5">
                                Description complète (Page détail)
                            </label>
                            <div className="relative">
                                <textarea
                                    rows={4}
                                    value={formData.fullDescription || ''}
                                    onChange={e => setFormData({ ...formData, fullDescription: e.target.value })}
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-[#2A082D] focus:ring-2 focus:ring-[#EC602B]/20 focus:border-[#EC602B] outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSaving}
                                className="px-4 py-2 rounded-lg text-xs font-school font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="btn-phoenix-orange px-5 py-2 rounded-lg text-xs font-school font-bold uppercase tracking-wider text-white shadow-soft inline-flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <span>Enregistrement...</span>
                                ) : (
                                    <>
                                        <Check size={14} />
                                        <span>Enregistrer</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
