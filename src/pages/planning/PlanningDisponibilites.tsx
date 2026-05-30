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
            className={`relative inline-flex h-[18px] w-[32px] items-center rounded-full transition-colors focus:outline-none ${
                disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            } ${checked ? 'bg-gradient-to-r from-orange-500 to-violet-500' : 'bg-gray-200 dark:bg-white/20'}`}
        >
            <span className={`inline-block h-[14px] w-[14px] transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
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
            <div className="flex items-center justify-between mb-4 mt-1">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-250 dark:hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={16} className="text-gray-700 dark:text-white" />
                </motion.button>
                <div className="text-center">
                    <p className="text-gray-800 dark:text-white font-semibold text-xs md:text-sm">{weekLabel}</p>
                    <p className="text-gray-400 dark:text-white/40 text-[10px] md:text-xs mt-0.5">{bookedCount} créneau{bookedCount > 1 ? 'x' : ''} sélectionné{bookedCount > 1 ? 's' : ''}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-250 dark:hover:bg-white/20 transition-colors"
                >
                    <ChevronRight size={16} className="text-gray-700 dark:text-white" />
                </motion.button>
            </div>

            {/* Global unavailability switch */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 mb-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className={unavailable ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400 dark:text-white/40'} />
                    <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-800 dark:text-white">Pas disponible toute la semaine</p>
                        <p className="text-[10px] md:text-xs text-gray-400 dark:text-white/40">Supprime toutes vos disponibilités de la semaine</p>
                    </div>
                </div>
                <Toggle checked={unavailable} onChange={() => toggleWeekUnavailable(currentUser.id, currentWeekKey)} />
            </div>

            {/* Project filter chips */}
            {allProjects.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <button
                        onClick={() => setActiveProjectId(null)}
                        className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-colors ${activeProjectId === null ? 'bg-gradient-to-r from-orange-500 to-violet-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'}`}
                    >
                        Tous
                    </button>
                    {allProjects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProjectId(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold transition-colors ${activeProjectId === p.id ? 'bg-gradient-to-r from-orange-500 to-violet-600 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20'}`}
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
                        className="flex flex-col items-center justify-center py-12 text-center"
                    >
                        <AlertTriangle size={36} className="text-orange-500 dark:text-orange-400 mb-2" />
                        <p className="text-gray-800 dark:text-white font-semibold text-sm">Indisponible toute la semaine</p>
                        <p className="text-gray-400 dark:text-white/40 text-xs mt-0.5">Désactivez le switch pour re-saisir des disponibilités.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm"
                    >
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px bg-gray-100 dark:bg-white/5 px-3 py-2 text-[10px] md:text-xs font-bold text-gray-500 dark:text-white/50 uppercase tracking-wide border-b border-gray-200 dark:border-white/10">
                            <span>Jour</span>
                            <span>Début</span>
                            <span>Fin</span>
                            <span>Établissement</span>
                            <span className="text-right">Disponible</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-gray-150 dark:divide-white/5">
                            {filteredSlots.map((slot, i) => {
                                const project = projectsData.find(p => p.id === slot.projectId);
                                const booked = isBooked(slot.id);
                                return (
                                    <motion.div
                                        key={slot.id}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className={`grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px items-center px-3 py-1.5 transition-colors ${booked ? 'bg-orange-500/5' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                    >
                                        <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-white">{slot.day}</span>
                                        <span className="text-xs md:text-sm text-gray-500 dark:text-white/60">{slot.startTime}</span>
                                        <span className="text-xs md:text-sm text-gray-500 dark:text-white/60">{slot.endTime}</span>
                                        <span className="text-xs md:text-sm text-gray-600 dark:text-white/70 truncate">{project?.name ?? '—'}</span>
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
