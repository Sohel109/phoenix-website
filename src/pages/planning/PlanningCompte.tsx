import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, XCircle, AlertTriangle, User, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Award } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, getSlotDuration } from '../../data/planningData';
import { AttestationModal } from '../../components/planning/AttestationModal';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    gradient: string;
    shadow?: string;
}

function StatCard({ icon, label, value, unit, gradient }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 p-5 rounded-xl bg-white/5 border border-white/10"
        >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
                {icon}
            </div>
            <div>
                <p className="text-3xl font-black text-white">
                    {value}<span className="text-lg font-semibold text-white/50 ml-1">{unit}</span>
                </p>
                <p className="text-sm text-white/50 mt-0.5">{label}</p>
            </div>
        </motion.div>
    );
}

export function PlanningCompte() {
    const { currentUser, bookings, changePassword } = usePlanning();
    
    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Attestation PDF state
    const [showAttestation, setShowAttestation] = useState(false);

    if (!currentUser) return null;

    const myBookings = bookings.filter(b => b.userId === currentUser.id);

    // Compute stats
    const heuresPresteesH = myBookings
        .filter(b => b.status === 'confirme')
        .reduce((sum, b) => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            return sum + (slot ? getSlotDuration(slot) : 0);
        }, 0);

    const annulations = myBookings.filter(b => b.status === 'annule').length;
    const absences = myBookings.filter(b => b.status === 'absent').length;

    // Recent bookings (last 5)
    const recentBookings = [...myBookings]
        .reverse()
        .slice(0, 5)
        .map(b => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            const project = slot ? projectsData.find(p => p.id === slot.projectId) : null;
            return { b, slot, project };
        });

    const myProjects = projectsData.filter(p => currentUser.projectIds.includes(p.id));
    const isChef = currentUser.role === 'chef_projet';

    const STATUS_COLORS: Record<string, string> = {
        prevu: 'text-blue-300',
        confirme: 'text-emerald-400',
        absent: 'text-red-400',
        annule: 'text-gray-500',
    };
    const STATUS_LABELS: Record<string, string> = {
        prevu: 'Prévu', confirme: 'Confirmé', absent: 'Absent', annule: 'Annulé',
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setFeedback({ type: 'error', text: 'Veuillez remplir tous les champs.' });
            return;
        }

        if (newPassword.length < 4) {
            setFeedback({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setFeedback({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await changePassword(oldPassword, newPassword);
            if (res.success) {
                setFeedback({ type: 'success', text: res.message || 'Mot de passe modifié avec succès !' });
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setFeedback({ type: 'error', text: res.message || "Impossible de modifier le mot de passe." });
            }
        } catch {
            setFeedback({ type: 'error', text: 'Une erreur est survenue lors de la mise à jour.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PlanningLayout title="Mon compte">
            {/* Profile header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white/5 border border-white/10 mb-6 mt-2"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        {isChef ? <ShieldCheck size={26} className="text-orange-400" /> : <User size={26} className="text-orange-400" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">{currentUser.name}</h2>
                        <p className="text-orange-400 text-sm font-semibold">{isChef ? 'Chef de Projet' : 'Tuteur'}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {myProjects.map(p => (
                                <span key={p.id} className="px-2 py-0.5 rounded-full text-xs bg-white/10 border border-white/20 text-white/60">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Attestation PDF button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAttestation(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
                >
                    <Award size={16} />
                    <span>Attestation d'Heures (PDF)</span>
                </motion.button>
            </motion.div>


            {/* Modifier mon mot de passe */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-6 relative overflow-hidden"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <KeyRound size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white">Modifier mon mot de passe</h3>
                        <p className="text-xs text-white/50">Mettez à jour votre mot de passe de connexion en toute sécurité.</p>
                    </div>
                </div>

                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-xs font-medium border ${
                            feedback.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/10 border-red-500/20 text-red-300'
                        }`}
                    >
                        {feedback.type === 'success' ? (
                            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                        ) : (
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                        )}
                        <span>{feedback.text}</span>
                    </motion.div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                    {/* Ancien mot de passe */}
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">
                            Ancien mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showOld ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Votre mot de passe actuel"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-orange-500/60 transition-colors pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowOld(!showOld)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                tabIndex={-1}
                            >
                                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Nouveau mot de passe + Confirmation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-1">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Au moins 4 caractères"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-orange-500/60 transition-colors pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                    tabIndex={-1}
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-white/70 mb-1">
                                Confirmer le nouveau mot de passe
                            </label>
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Répéter le mot de passe"
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md hover:shadow-orange-500/20 active:scale-98"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Modification...</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound size={15} />
                                    <span>Enregistrer le mot de passe</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Stats */}
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Statistiques</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard
                    icon={<Clock size={20} />}
                    label="Heures prestées"
                    value={heuresPresteesH % 1 === 0 ? heuresPresteesH : heuresPresteesH.toFixed(1)}
                    unit="h"
                    gradient="from-emerald-500 to-teal-600"
                    shadow="shadow-emerald-500/20"
                />
                <StatCard
                    icon={<XCircle size={20} />}
                    label="Annulations"
                    value={annulations}
                    gradient="from-orange-500 to-pink-600"
                    shadow="shadow-orange-500/20"
                />
                <StatCard
                    icon={<AlertTriangle size={20} />}
                    label="Absences"
                    value={absences}
                    gradient="from-red-500 to-rose-600"
                    shadow="shadow-red-500/20"
                />
            </div>

            {/* Recent history */}
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Historique récent</h3>
            {recentBookings.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Aucun créneau enregistré.</p>
            ) : (
                <div className="space-y-2">
                    {recentBookings.map(({ b, slot, project }) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <p className="text-sm font-semibold text-white">{project?.name ?? '—'}</p>
                                <p className="text-xs text-white/40">{slot?.day} · {slot?.startTime}–{slot?.endTime} · {b.weekKey}</p>
                            </div>
                            <span className={`text-xs font-semibold ${STATUS_COLORS[b.status]}`}>
                                {STATUS_LABELS[b.status]}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Modale Attestation PDF */}
            {showAttestation && (
                <AttestationModal
                    user={currentUser}
                    bookings={bookings}
                    onClose={() => setShowAttestation(false)}
                />
            )}
        </PlanningLayout>
    );
}


