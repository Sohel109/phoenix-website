import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import {
    timeSlots, DAY_ORDER, formatWeekLabel, navigateWeek, isSlotActiveThisWeek
} from '../../data/planningData';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${checked ? 'bg-gradient-to-r from-orange-500 to-violet-500' : 'bg-white/20'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PlanningDisponibilites() {
    const { currentUser, currentWeekKey, setCurrentWeekKey, bookings, toggleAvailability, isWeekUnavailable, toggleWeekUnavailable } = usePlanning();
    const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

    if (!currentUser) return null;

    const weekLabel = formatWeekLabel(currentWeekKey);
    const unavailable = isWeekUnavailable(currentUser.id, currentWeekKey);

    // Tous les projets disponibles
    const allProjects = projectsData;

    // Slots filtrés par le projet sélectionné (tous par défaut) + logique bi-hebdomadaire
    const filteredSlots = useMemo(() => {
        return timeSlots
            .filter(s => (activeProjectId === null || s.projectId === activeProjectId) && isSlotActiveThisWeek(s.id, currentWeekKey))
            .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
    }, [activeProjectId, currentWeekKey]);

    const isBooked = (slotId: string) =>
        bookings.some(b => b.slotId === slotId && b.weekKey === currentWeekKey && b.userId === currentUser.id);

    const bookedCount = filteredSlots.filter(s => isBooked(s.id)).length;

    return (
        <PlanningLayout title="Disponibilités">
            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6 mt-2">
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={18} />
                </motion.button>
                <div className="text-center">
                    <p className="text-white font-semibold text-sm">{weekLabel}</p>
                    <p className="text-white/40 text-xs mt-0.5">{bookedCount} créneau{bookedCount > 1 ? 'x' : ''} sélectionné{bookedCount > 1 ? 's' : ''}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>

            {/* Global unavailability switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={18} className={unavailable ? 'text-orange-400' : 'text-white/40'} />
                    <div>
                        <p className="text-sm font-semibold text-white">Pas disponible toute la semaine</p>
                        <p className="text-xs text-white/40">Supprime toutes vos disponibilités de la semaine</p>
                    </div>
                </div>
                <Toggle checked={unavailable} onChange={() => toggleWeekUnavailable(currentUser.id, currentWeekKey)} />
            </div>

            {/* Project filter chips */}
            {allProjects.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    <button
                        onClick={() => setActiveProjectId(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeProjectId === null ? 'bg-gradient-to-r from-orange-500 to-violet-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                    >
                        Tous
                    </button>
                    {allProjects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProjectId(p.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeProjectId === p.id ? 'bg-gradient-to-r from-orange-500 to-violet-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Slots table */}
            <AnimatePresence>
                {unavailable ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <AlertTriangle size={40} className="text-orange-400 mb-3" />
                        <p className="text-white font-semibold">Indisponible toute la semaine</p>
                        <p className="text-white/40 text-sm mt-1">Désactivez le switch pour re-saisir des disponibilités.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-2xl overflow-hidden border border-white/10"
                    >
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px bg-white/5 px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wide">
                            <span>Jour</span>
                            <span>Début</span>
                            <span>Fin</span>
                            <span>Établissement</span>
                            <span className="text-right">Disponible</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-white/5">
                            {filteredSlots.map((slot, i) => {
                                const project = projectsData.find(p => p.id === slot.projectId);
                                const booked = isBooked(slot.id);
                                return (
                                    <motion.div
                                        key={slot.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className={`grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px items-center px-4 py-3 transition-colors ${booked ? 'bg-orange-500/5' : 'bg-transparent hover:bg-white/5'}`}
                                    >
                                        <span className="text-sm font-medium text-white">{slot.day}</span>
                                        <span className="text-sm text-white/60">{slot.startTime}</span>
                                        <span className="text-sm text-white/60">{slot.endTime}</span>
                                        <span className="text-sm text-white/70 truncate">{project?.name ?? '—'}</span>
                                        <div className="flex justify-end">
                                            <Toggle checked={booked} onChange={() => toggleAvailability(slot.id, currentWeekKey)} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PlanningLayout>
    );
}
