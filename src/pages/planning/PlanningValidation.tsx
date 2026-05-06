import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Users, ShieldCheck } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, formatWeekLabel, navigateWeek } from '../../data/planningData';

export function PlanningValidation() {
    const { currentUser, currentWeekKey, setCurrentWeekKey, bookings, validatePresence, markAbsent } = usePlanning();

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

    // Slots belonging to this chef's projects (or all projects for Bureau)
    const myProjectIds = currentUser.projectIds;
    const mySlots = isBureau 
        ? timeSlots 
        : timeSlots.filter(s => myProjectIds.includes(s.projectId));
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

    return (
        <PlanningLayout title="Validation des présences">
            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6 mt-2">
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={18} />
                </motion.button>
                <p className="text-white font-semibold text-sm">{formatWeekLabel(currentWeekKey)}</p>
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>

            {/* À valider */}
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
                À valider ({prevuBookings.length})
            </h3>

            {prevuBookings.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center mb-6 rounded-2xl bg-white/5 border border-white/10">
                    <Users size={32} className="text-white/20 mb-2" />
                    <p className="text-white/40 text-sm">Aucune présence à valider pour cette semaine.</p>
                </div>
            ) : (
                <div className="space-y-3 mb-6">
                    {prevuBookings.map((b, i) => {
                        const { slot, project, userName } = enrichBooking(b.id);
                        return (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20"
                            >
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                    {userName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white">{userName}</p>
                                    <p className="text-xs text-white/50">{slot?.day} · {slot?.startTime}–{slot?.endTime} · {project?.name}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => validatePresence(b.id)}
                                        className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition-colors"
                                        title="Confirmer la présence"
                                    >
                                        <CheckCircle size={18} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => markAbsent(b.id)}
                                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
                                        title="Marquer absent"
                                    >
                                        <XCircle size={18} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Already processed */}
            {doneBookings.length > 0 && (
                <>
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
                        Déjà traités ({doneBookings.length})
                    </h3>
                    <div className="space-y-2">
                        {doneBookings.map(b => {
                            const { slot, project, userName } = enrichBooking(b.id);
                            const isConfirme = b.status === 'confirme';
                            return (
                                <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 opacity-70">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold">
                                        {userName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white">{userName}</p>
                                        <p className="text-xs text-white/40">{slot?.day} · {project?.name}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isConfirme ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'}`}>
                                        {isConfirme ? 'Confirmé' : 'Absent'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </PlanningLayout>
    );
}
