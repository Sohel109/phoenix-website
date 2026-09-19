import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Users, ShieldCheck, RotateCcw, LoaderCircle, Check } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, formatWeekLabel, navigateWeek } from '../../data/planningData';

interface ConfirmationTarget {
    bookingId: string;
    actionType: 'validate' | 'absent' | 'reset';
    userName: string;
    projectName: string;
    day: string;
}

export function PlanningValidation() {
    const { currentUser, currentWeekKey, setCurrentWeekKey, bookings, validatePresence, markAbsent, resetValidation, isPending } = usePlanning();
    const [confirmTarget, setConfirmTarget] = useState<ConfirmationTarget | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const isBureau = currentUser?.role === 'bureau';

    if (!currentUser || (currentUser.role !== 'chef_projet' && !isBureau)) {
        return (
            <PlanningLayout title="Validation">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShieldCheck size={48} className="text-white/20 mb-4" />
                    <p className="text-white font-bold text-lg">Accès restreint</p>
                    <p className="text-white/40 text-sm mt-1">Cette page est réservée aux responsables.</p>
                </div>
            </PlanningLayout>
        );
    }

    // Slots belonging to this chef's projects (or all projects for Bureau/unassigned chefs)
    const myProjectIds = (currentUser?.projectIds || []).map(Number);
    const mySlots = isBureau || myProjectIds.length === 0
        ? timeSlots 
        : timeSlots.filter(s => myProjectIds.includes(Number(s.projectId)));
    const mySlotIds = new Set(mySlots.map(s => s.id));

    // All bookings for this week on my slots
    const weekBookings = bookings.filter(
        b => b.weekKey === currentWeekKey && mySlotIds.has(b.slotId)
    );

    const prevuBookings = weekBookings.filter(b => b.status === 'prevu');
    const doneBookings = weekBookings.filter(b => b.status === 'confirme' || b.status === 'absent');

    const enrichBooking = (bookingId: string) => {
        const b = bookings.find(x => x.id === bookingId)!;
        const slot = timeSlots.find(s => s.id === b.slotId);
        const project = slot ? projectsData.find(p => p.id === slot.projectId) : null;
        const userName = b.userName || b.userId;
        return { b, slot, project, userName };
    };

    const handleConfirm = async () => {
        if (!confirmTarget) return;
        const { bookingId, actionType, userName } = confirmTarget;
        setConfirmTarget(null);

        let ok = false;
        if (actionType === 'validate') {
            ok = await validatePresence(bookingId);
            if (ok) showToast(`Présence de ${userName} confirmée avec succès`);
        } else if (actionType === 'absent') {
            ok = await markAbsent(bookingId);
            if (ok) showToast(`${userName} marqué(e) comme absent(e)`);
        } else if (actionType === 'reset') {
            ok = await resetValidation(bookingId);
            if (ok) showToast(`Validation annulée pour ${userName}`);
        }
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    return (
        <PlanningLayout title="Validation des présences">
            {/* Toast notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs md:text-sm shadow-xl flex items-center gap-2 border border-emerald-400/40"
                    >
                        <Check size={16} />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    className="w-10 h-10 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white border border-[#ECDDFD]/30 flex items-center justify-center transition-colors shadow-soft"
                >
                    <ChevronLeft size={18} />
                </motion.button>
                <div className="text-center">
                    <p className="text-white font-school font-bold text-sm sm:text-base uppercase tracking-wider">{formatWeekLabel(currentWeekKey)}</p>
                    <p className="text-[#ECDDFD]/70 font-mono text-xs mt-0.5">{currentWeekKey}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
                    className="w-10 h-10 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white border border-[#ECDDFD]/30 flex items-center justify-center transition-colors shadow-soft"
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>

            {/* À valider */}
            <div className="flex items-center gap-2 mb-3">
                <span className="font-school text-xs uppercase tracking-widest text-[#ECDDFD]/70 font-semibold">
                    À valider ({prevuBookings.length})
                </span>
            </div>

            {prevuBookings.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center mb-8 rounded-[2rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30 shadow-soft-lg">
                    <Users size={32} className="text-[#ECDDFD]/30 mb-2" />
                    <p className="text-[#ECDDFD]/60 text-sm">Aucune présence à valider pour cette semaine.</p>
                </div>
            ) : (
                <div className="space-y-4 mb-8">
                    {prevuBookings.map((b, i) => {
                        const { slot, project, userName } = enrichBooking(b.id);
                        const loading = isPending(b.id);
                        return (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-4 p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 hover:border-[#EC602B]/50 transition-all duration-300 shadow-soft-lg backdrop-blur-md"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center font-bold text-sm shadow-soft">
                                    {userName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-bold text-white tracking-wide">{userName}</p>
                                    <p className="text-xs text-[#ECDDFD]/70 mt-0.5 font-mono">{slot?.day} · {slot?.startTime}–{slot?.endTime} · {project?.name}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    {loading ? (
                                        <div className="w-10 h-10 rounded-full bg-[#1F0422]/60 border border-[#6F2B75]/40 flex items-center justify-center">
                                            <LoaderCircle size={18} className="animate-spin text-[#EC602B]" />
                                        </div>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => setConfirmTarget({
                                                    bookingId: b.id,
                                                    actionType: 'validate',
                                                    userName,
                                                    projectName: project?.name || '',
                                                    day: `${slot?.day} (${slot?.startTime}-${slot?.endTime})`
                                                })}
                                                className="w-10 h-10 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center transition-colors shadow-soft"
                                                title="Confirmer la présence"
                                            >
                                                <CheckCircle size={18} />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                onClick={() => setConfirmTarget({
                                                    bookingId: b.id,
                                                    actionType: 'absent',
                                                    userName,
                                                    projectName: project?.name || '',
                                                    day: `${slot?.day} (${slot?.startTime}-${slot?.endTime})`
                                                })}
                                                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center justify-center transition-colors shadow-soft"
                                                title="Marquer absent"
                                            >
                                                <XCircle size={18} />
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Already processed */}
            {doneBookings.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="font-school text-xs uppercase tracking-widest text-[#ECDDFD]/70 font-semibold">
                            Déjà traités ({doneBookings.length})
                        </span>
                    </div>
                    <div className="space-y-2.5">
                        {doneBookings.map(b => {
                            const { slot, project, userName } = enrichBooking(b.id);
                            const isConfirme = b.status === 'confirme';
                            const loading = isPending(b.id);
                            return (
                                <div key={b.id} className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#2D0A32]/70 border border-[#6F2B75]/30">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1F0422]/80 border border-[#6F2B75]/40 flex items-center justify-center text-white text-xs font-bold">
                                        {userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white tracking-wide">{userName}</p>
                                        <p className="text-xs text-[#ECDDFD]/60 font-mono mt-0.5">{slot?.day} · {project?.name}</p>
                                    </div>
                                    <span className={`text-xs font-school uppercase tracking-wider px-3 py-1 rounded-full border ${isConfirme ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/15' : 'text-red-300 border-red-500/30 bg-red-500/15'}`}>
                                        {isConfirme ? 'Confirmé' : 'Absent'}
                                    </span>
                                    {loading ? (
                                        <LoaderCircle size={14} className="animate-spin text-[#EC602B]" />
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                            onClick={() => setConfirmTarget({
                                                bookingId: b.id,
                                                actionType: 'reset',
                                                userName,
                                                projectName: project?.name || '',
                                                day: `${slot?.day}`
                                            })}
                                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#ECDDFD]/60 hover:text-white flex items-center justify-center transition-colors border border-white/10"
                                            title="Annuler la validation (remettre en attente)"
                                        >
                                            <RotateCcw size={14} />
                                        </motion.button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Confirmation Dialog Modal */}
            <AnimatePresence>
                {confirmTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm rounded-[2.5rem] bg-[#2D0A32] border border-[#6F2B75]/60 p-7 text-center shadow-2xl text-white"
                        >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] flex items-center justify-center mx-auto mb-4 text-white shadow-soft">
                                {confirmTarget.actionType === 'validate' && <CheckCircle size={26} />}
                                {confirmTarget.actionType === 'absent' && <XCircle size={26} />}
                                {confirmTarget.actionType === 'reset' && <RotateCcw size={26} />}
                            </div>

                            <h4 className="text-lg font-bold text-white mb-2 tracking-wide">
                                {confirmTarget.actionType === 'validate' && 'Confirmer la présence'}
                                {confirmTarget.actionType === 'absent' && 'Marquer comme absent'}
                                {confirmTarget.actionType === 'reset' && 'Annuler la validation'}
                            </h4>

                            <p className="text-xs text-[#ECDDFD]/75 mb-6 leading-relaxed">
                                {confirmTarget.actionType === 'validate' && (
                                    <>Voulez-vous valider la présence de <strong className="text-white">{confirmTarget.userName}</strong> pour le projet <strong className="text-white">{confirmTarget.projectName}</strong> le <span className="text-[#EC602B] font-bold">{confirmTarget.day}</span> ?</>
                                )}
                                {confirmTarget.actionType === 'absent' && (
                                    <>Voulez-vous marquer <strong className="text-white">{confirmTarget.userName}</strong> comme <span className="text-rose-400 font-bold">absent(e)</span> le <span className="text-white">{confirmTarget.day}</span> ?</>
                                )}
                                {confirmTarget.actionType === 'reset' && (
                                    <>Voulez-vous réinitialiser le statut de <strong className="text-white">{confirmTarget.userName}</strong> et le remettre en attente ?</>
                                )}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmTarget(null)}
                                    className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-school uppercase text-xs tracking-wider transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className={`flex-1 py-2.5 rounded-full font-school uppercase text-xs tracking-wider text-white transition-all shadow-soft ${
                                        confirmTarget.actionType === 'validate' ? 'bg-emerald-600 hover:bg-emerald-500' :
                                        confirmTarget.actionType === 'absent' ? 'bg-rose-600 hover:bg-rose-500' :
                                        'btn-phoenix-gradient'
                                    }`}
                                >
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PlanningLayout>
    );
}
