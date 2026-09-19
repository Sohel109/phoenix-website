import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, XCircle, AlertTriangle, User, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Award, Sparkles, GraduationCap, CalendarPlus } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, getSlotDuration, getWeekStartDate } from '../../data/planningData';
import { AttestationModal } from '../../components/planning/AttestationModal';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    sublabel?: string;
    gradient: string;
    progressBar?: {
        current: number;
        max: number;
        isEligible: boolean;
        customLabel?: string;
    };
}

function StatCard({ icon, label, value, unit, sublabel, gradient, progressBar }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 p-5 sm:p-6 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg hover:border-[#EC602B]/50 transition-all duration-300"
        >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-soft`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl sm:text-3xl font-display text-white tabular-nums">
                    {value}<span className="text-base font-school text-[#ECDDFD]/70 ml-1">{unit}</span>
                </p>
                <p className="text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 mt-1">{label}</p>
                {sublabel && (
                    <p className="text-[11px] text-[#ECDDFD]/60 mt-1 font-mono">{sublabel}</p>
                )}
                {progressBar && (
                    <div className="mt-3 pt-2 border-t border-white/10">
                        <div className="flex justify-between text-[10px] font-school uppercase tracking-wider text-[#ECDDFD]/70 mb-1">
                            <span>Objectif attestation</span>
                            <span className="tabular-nums">{progressBar.customLabel || `${progressBar.current}/${progressBar.max}h`}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${progressBar.isEligible ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-[#EC602B] to-[#F1885C]'}`}
                                style={{ width: `${Math.min(100, Math.round((progressBar.current / progressBar.max) * 100))}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export function PlanningCompte() {
    const { currentUser, bookings, changePassword, manualHours, isQuotaExempt } = usePlanning();
    
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

    const myManualHours = (manualHours || []).filter(m => m.userId === currentUser.id);
    const totalManualHours = myManualHours.reduce((sum, m) => sum + m.hours, 0);

    // Compute stats
    const heuresPresteesH = myBookings
        .filter(b => b.status === 'confirme')
        .reduce((sum, b) => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            return sum + (slot ? getSlotDuration(slot) : 0);
        }, 0);

    const totalConsolide = heuresPresteesH + totalManualHours;
    const ATTESTATION_THRESHOLD = 50;
    const isExempt = currentUser ? isQuotaExempt(currentUser.id) : false;
    const isAttestationEligible = isExempt || totalConsolide >= ATTESTATION_THRESHOLD;

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

    const STATUS_BADGES: Record<string, string> = {
        prevu: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        confirme: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        absent: 'bg-red-500/20 text-red-300 border-red-500/30',
        annule: 'bg-white/10 text-[#ECDDFD]/50 border-white/15',
    };
    const STATUS_LABELS: Record<string, string> = {
        prevu: 'Prévu', confirme: 'Confirmé', absent: 'Absent', annule: 'Annulé',
    };
    // Export iCal / .ics — compatible Google Calendar, Apple Calendar, Outlook
    const handleExportIcal = () => {
        const confirmedBookings = myBookings.filter(b => b.status === 'confirme' || b.status === 'prevu');
        if (confirmedBookings.length === 0) {
            alert('Aucun créneau confirmé ou prévu à exporter.');
            return;
        }

        const DAY_OFFSET: Record<string, number> = {
            Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5, Dimanche: 6
        };

        const formatIcalDate = (date: Date, timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            const d = new Date(date);
            d.setHours(h, m, 0, 0);
            return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const lines: string[] = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Phoenix EDC//Planning Bénévoles//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            `X-WR-CALNAME:Phoenix EDC – ${currentUser.name}`,
            'X-WR-TIMEZONE:Europe/Paris',
        ];

        confirmedBookings.forEach(b => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            if (!slot) return;
            const project = projectsData.find(p => p.id === slot.projectId);
            const weekStart = getWeekStartDate(b.weekKey);
            const dayOffset = DAY_OFFSET[slot.day] ?? 0;
            const eventDate = new Date(weekStart);
            eventDate.setDate(eventDate.getDate() + dayOffset);

            const dtstart = formatIcalDate(eventDate, slot.startTime);
            const dtend = formatIcalDate(eventDate, slot.endTime);
            const uid = `${b.id}@phoenixedc.fr`;
            const summary = `Phoenix EDC – ${project?.name || slot.projectId}`;
            const location = project?.address || 'Marseille';

            lines.push(
                'BEGIN:VEVENT',
                `UID:${uid}`,
                `DTSTART:${dtstart}`,
                `DTEND:${dtend}`,
                `SUMMARY:${summary}`,
                `LOCATION:${location}`,
                `DESCRIPTION:Créneau bénévole Phoenix EDC · Statut : ${b.status}`,
                `STATUS:${b.status === 'confirme' ? 'CONFIRMED' : 'TENTATIVE'}`,
                'END:VEVENT',
            );
        });

        lines.push('END:VCALENDAR');
        const icsContent = lines.join('\r\n');
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Phoenix_Planning_${currentUser.name.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
            {/* Profile header card */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 rounded-[2.5rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg mb-8 mt-2"
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center flex-shrink-0 shadow-soft">
                        {isChef ? <ShieldCheck size={28} /> : <User size={28} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-school text-xs uppercase tracking-widest text-[#ECDDFD]/70 font-semibold">
                                Profil
                            </span>
                            <span className="text-[#EC602B] text-xs">•</span>
                            <span className="px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-[#6F2B75]/40 border border-[#ECDDFD]/30 text-[#ECDDFD]">
                                {isChef ? 'Chef de Projet' : currentUser.role === 'bureau' ? 'Bureau' : 'Tuteur'}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-display text-white tracking-wide">{currentUser.name}</h2>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {myProjects.map(p => (
                                <span key={p.id} className="px-3 py-1 rounded-full text-xs font-school uppercase tracking-wider bg-[#1F0422]/80 border border-[#6F2B75]/40 text-[#ECDDFD]">
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions du profil : Attestation + Export Calendrier */}
                <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
                    {/* Attestation PDF button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAttestation(true)}
                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider shadow-soft transition-all cursor-pointer ${
                            isAttestationEligible
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40'
                                : 'btn-phoenix-gradient text-white'
                        }`}
                    >
                        <Award size={16} className={isAttestationEligible ? 'text-emerald-200' : ''} />
                        <span>
                            {isExempt
                                ? `Attestation validée (Quota N-1 · ${totalConsolide}h)`
                                : isAttestationEligible
                                    ? `Attestation validée (${totalConsolide}h)`
                                    : `Attestation (${totalConsolide}h / ${ATTESTATION_THRESHOLD}h)`}
                        </span>
                    </motion.button>

                    {/* Export iCal button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportIcal}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-school text-xs uppercase tracking-wider border border-[#ECDDFD]/30 bg-[#6F2B75]/30 hover:bg-[#6F2B75]/50 text-[#ECDDFD] transition-all cursor-pointer"
                        title="Exporter mes créneaux vers Google Calendar / Apple Calendar (.ics)"
                    >
                        <CalendarPlus size={15} />
                        <span>Sync Calendrier</span>
                    </motion.button>
                </div>
            </motion.div>


            {/* Banner for Renewing Member (Quota N-1 Acquis) */}
            {isExempt && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 rounded-[2.2rem] bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-900/20 border border-emerald-500/35 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-lg"
                >
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-soft">
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm font-bold text-white tracking-wide">
                                    Membre Renouvelant · Quota 50h Statutaire Certifié (Année N-1)
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-school uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                                    Statut Officiel
                                </span>
                            </div>
                            <p className="text-xs text-[#ECDDFD]/80 mt-1 leading-relaxed">
                                Vos 50 heures statutaires d'engagement associatif ont déjà été validées lors de l'année universitaire précédente. Votre attestation officielle est immédiatement disponible et certifiée, et vos heures effectuées sur la saison 2025-2026 continuent d'être comptabilisées ci-dessous.
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Modifier mon mot de passe */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 sm:p-7 rounded-[2.5rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 mb-8 backdrop-blur-md shadow-soft-lg relative overflow-hidden"
            >
                <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shrink-0 shadow-soft">
                        <KeyRound size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white tracking-wide">Modifier mon mot de passe</h3>
                        <p className="text-xs text-[#ECDDFD]/70 mt-0.5">Mettez à jour votre mot de passe de connexion en toute sécurité.</p>
                    </div>
                </div>

                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-2.5 p-4 rounded-2xl mb-5 text-xs font-medium border ${
                            feedback.type === 'success'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-red-500/15 border-red-500/30 text-red-300'
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

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {/* Ancien mot de passe */}
                    <div>
                        <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5">
                            Ancien mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showOld ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Votre mot de passe actuel"
                                className="w-full px-4 py-3 rounded-2xl bg-[#1F0422]/70 border border-[#6F2B75]/50 text-white placeholder-[#ECDDFD]/30 text-sm focus:outline-none focus:border-[#EC602B] transition-colors pr-11"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowOld(!showOld)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/50 hover:text-white transition-colors"
                                tabIndex={-1}
                            >
                                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Nouveau mot de passe + Confirmation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Au moins 4 caractères"
                                    className="w-full px-4 py-3 rounded-2xl bg-[#1F0422]/70 border border-[#6F2B75]/50 text-white placeholder-[#ECDDFD]/30 text-sm focus:outline-none focus:border-[#EC602B] transition-colors pr-11"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/50 hover:text-white transition-colors"
                                    tabIndex={-1}
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5">
                                Confirmer le mot de passe
                            </label>
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Répéter le mot de passe"
                                className="w-full px-4 py-3 rounded-2xl bg-[#1F0422]/70 border border-[#6F2B75]/50 text-white placeholder-[#ECDDFD]/30 text-sm focus:outline-none focus:border-[#EC602B] transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-phoenix-gradient flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-school text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-soft"
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
            <div className="flex items-center gap-2 mb-3">
                <span className="font-school text-xs uppercase tracking-widest text-[#ECDDFD]/70 font-semibold">
                    Statistiques de présence
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={isExempt ? <GraduationCap size={22} /> : <Clock size={22} />}
                    label={isExempt ? "Heures saison 2025-2026" : "Heures validées"}
                    value={totalConsolide % 1 === 0 ? totalConsolide : totalConsolide.toFixed(1)}
                    unit="h"
                    sublabel={
                        isExempt
                            ? `Quota 50h statutaire validé (N-1)${totalManualHours > 0 ? ` · dont ${totalManualHours}h Bureau` : ''}`
                            : totalManualHours > 0 ? `(dont ${totalManualHours}h Bureau)` : undefined
                    }
                    gradient={isExempt ? "from-emerald-600 to-teal-500" : "from-[#6F2B75] to-[#EC602B]"}
                    progressBar={{
                        current: isExempt ? ATTESTATION_THRESHOLD : totalConsolide,
                        max: ATTESTATION_THRESHOLD,
                        isEligible: isAttestationEligible,
                        customLabel: isExempt ? `50h validées (N-1) + ${totalConsolide}h en 2025-2026` : undefined,
                    }}
                />
                <StatCard
                    icon={<XCircle size={22} />}
                    label="Annulations"
                    value={annulations}
                    gradient="from-[#EC602B] to-[#F1885C]"
                />
                <StatCard
                    icon={<AlertTriangle size={22} />}
                    label="Absences"
                    value={absences}
                    gradient="from-[#83338A] to-[#D32F2F]"
                />
            </div>

            {/* Heures valorisées par le Bureau */}
            {myManualHours.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-7 rounded-[2.5rem] bg-[#2D0A32]/90 border border-purple-500/30 mb-8 backdrop-blur-md shadow-soft-lg"
                >
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-[#EC602B] text-white flex items-center justify-center shrink-0 shadow-soft">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white tracking-wide">
                                    Heures valorisées par le Bureau ({totalManualHours}h)
                                </h3>
                                <p className="text-xs text-[#ECDDFD]/70 mt-0.5">
                                    Crédits d'heures accordés pour missions exceptionnelles ou investissement associatif
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-school uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-500/30">
                            +{totalManualHours}h ajoutées
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {myManualHours.map(m => (
                            <div key={m.id} className="p-4 rounded-2xl bg-[#1F0422]/70 border border-[#6F2B75]/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-sm">+{m.hours}h</span>
                                        <span className="text-[#ECDDFD]/40">•</span>
                                        <span className="text-[#ECDDFD]/70 font-mono text-[11px]">{new Date(m.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        <span className="text-[#ECDDFD]/40">•</span>
                                        <span className="text-purple-300 font-school uppercase tracking-wider text-[10px]">Accordé par {m.grantedBy}</span>
                                    </div>
                                    <p className="text-[#ECDDFD]/90 italic bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 mt-1">
                                        « {m.reason} »
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Recent history */}
            <div className="flex items-center gap-2 mb-3">
                <span className="font-school text-xs uppercase tracking-widest text-[#ECDDFD]/70 font-semibold">
                    Historique récent
                </span>
            </div>
            {recentBookings.length === 0 ? (
                <div className="p-8 rounded-[2rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30 text-center">
                    <p className="text-[#ECDDFD]/40 text-sm">Aucun créneau enregistré.</p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {recentBookings.map(({ b, slot, project }) => (
                        <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#2D0A32]/80 border border-[#6F2B75]/30 hover:border-[#6F2B75]/60 transition-all shadow-sm">
                            <div>
                                <p className="text-sm font-bold text-white tracking-wide">{project?.name ?? '—'}</p>
                                <p className="text-xs text-[#ECDDFD]/60 mt-0.5 font-mono">{slot?.day} · {slot?.startTime}–{slot?.endTime} · {b.weekKey}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-school uppercase tracking-wider border ${STATUS_BADGES[b.status] || 'bg-white/10 text-[#ECDDFD]'}`}>
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


