import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle, LoaderCircle } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import {
    timeSlots, DAY_ORDER, formatWeekLabel, navigateWeek, isSlotActiveThisWeek
} from '../../data/planningData';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled, loading }: { checked: boolean; onChange: () => void; disabled?: boolean; loading?: boolean }) {
    return (
        <button
            onClick={onChange}
            disabled={disabled || loading}
            className={`relative inline-flex h-[20px] w-[36px] items-center rounded-full transition-all focus:outline-none ${
                disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${checked ? 'bg-orange-500' : 'bg-slate-700 border border-slate-600'}`}
        >
            <span className={`inline-flex items-center justify-center h-[16px] w-[16px] transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}>
                {loading && <LoaderCircle size={10} className="animate-spin text-orange-500" />}
            </span>
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PlanningDisponibilites() {
    const { currentUser, currentWeekKey, setCurrentWeekKey, bookings, toggleAvailability, isWeekUnavailable, toggleWeekUnavailable, isPending } = usePlanning();
    const [activeProjectId, setActiveProjectId] = useState<number | null>(null);

    const weekLabel = formatWeekLabel(currentWeekKey);
    const unavailable = currentUser ? isWeekUnavailable(currentUser.id, currentWeekKey) : false;

    // Tous les projets disponibles
    const allProjects = projectsData;

    // Slots filtrés par le projet sélectionné (tous par défaut) + logique bi-hebdomadaire
    const filteredSlots = useMemo(() => {
        return timeSlots
            .filter(s => (activeProjectId === null || s.projectId === activeProjectId) && isSlotActiveThisWeek(s.id, currentWeekKey))
            .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
    }, [activeProjectId, currentWeekKey]);

    if (!currentUser) return null;

    const isBooked = (slotId: string) =>
        bookings.some(b => b.slotId === slotId && b.weekKey === currentWeekKey && b.userId === currentUser.id);

    const bookedCount = filteredSlots.filter(s => isBooked(s.id)).length;

    return (
        <PlanningLayout title="Disponibilités">
            {/* Week navigator */}
            <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
                >
                    <ChevronLeft size={16} />
                </motion.button>
                <div className="text-center">
                    <p className="text-white font-bold text-xs md:text-sm">{weekLabel}</p>
                    <p className="text-slate-400 text-[10px] md:text-xs mt-0.5">{bookedCount} créneau{bookedCount > 1 ? 'x' : ''} sélectionné{bookedCount > 1 ? 's' : ''}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors"
                >
                    <ChevronRight size={16} />
                </motion.button>
            </div>

            {/* Global unavailability switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <AlertTriangle size={18} className={unavailable ? 'text-orange-400' : 'text-slate-500'} />
                    <div>
                        <p className="text-xs md:text-sm font-semibold text-white">Pas disponible toute la semaine</p>
                        <p className="text-[10px] md:text-xs text-slate-400">Supprime toutes vos disponibilités de la semaine</p>
                    </div>
                </div>
                <Toggle checked={unavailable} onChange={() => toggleWeekUnavailable(currentUser.id, currentWeekKey)} />
            </div>

            {/* Project filter chips */}
            {allProjects.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <button
                        onClick={() => setActiveProjectId(null)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                            activeProjectId === null
                                ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        Tous
                    </button>
                    {allProjects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProjectId(p.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                                activeProjectId === p.id
                                    ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                            }`}
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
                        className="flex flex-col items-center justify-center py-12 text-center bg-slate-900 rounded-xl border border-slate-800"
                    >
                        <AlertTriangle size={36} className="text-orange-400 mb-2" />
                        <p className="text-white font-bold text-sm">Indisponible toute la semaine</p>
                        <p className="text-slate-400 text-xs mt-0.5">Désactivez le switch pour re-saisir des disponibilités.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-sm"
                    >
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px bg-slate-800/80 px-3 py-2.5 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                            <span>Jour</span>
                            <span>Début</span>
                            <span>Fin</span>
                            <span>Établissement</span>
                            <span className="text-right">Disponible</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-slate-800/60">
                            {filteredSlots.map((slot, i) => {
                                const project = projectsData.find(p => p.id === slot.projectId);
                                const booked = isBooked(slot.id);
                                return (
                                    <motion.div
                                        key={slot.id}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className={`grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px items-center px-3 py-2 transition-colors ${
                                            booked ? 'bg-orange-500/10' : 'bg-transparent hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <span className="text-xs md:text-sm font-semibold text-white">{slot.day}</span>
                                        <span className="text-xs md:text-sm text-slate-400 font-mono">{slot.startTime}</span>
                                        <span className="text-xs md:text-sm text-slate-400 font-mono">{slot.endTime}</span>
                                        <span className="text-xs md:text-sm text-slate-300 truncate">{project?.name ?? '—'}</span>
                                        <div className="flex justify-end">
                                            <Toggle 
                                                checked={booked} 
                                                loading={isPending(`${slot.id}_${currentWeekKey}`)}
                                                onChange={() => toggleAvailability(slot.id, currentWeekKey)} 
                                            />
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
