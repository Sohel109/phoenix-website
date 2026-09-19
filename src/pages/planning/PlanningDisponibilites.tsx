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
            className={`relative inline-flex h-[24px] w-[42px] items-center rounded-full transition-all focus:outline-none ${
                disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${checked ? 'bg-[#EC602B] shadow-sm' : 'bg-[#1F0422] border border-[#6F2B75]/60'}`}
        >
            <span className={`inline-flex items-center justify-center h-[18px] w-[18px] transform rounded-full bg-white shadow-soft transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-[3px]'}`}>
                {loading && <LoaderCircle size={10} className="animate-spin text-[#EC602B]" />}
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
            <div className="flex items-center justify-between mb-5 p-4 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    className="w-10 h-10 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white border border-[#ECDDFD]/30 flex items-center justify-center transition-colors shadow-soft"
                >
                    <ChevronLeft size={18} />
                </motion.button>
                <div className="text-center">
                    <p className="text-white font-school font-bold text-sm md:text-base uppercase tracking-wider">{weekLabel}</p>
                    <p className="text-[#ECDDFD]/70 font-school text-xs mt-0.5">{bookedCount} créneau{bookedCount > 1 ? 'x' : ''} sélectionné{bookedCount > 1 ? 's' : ''}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
                    className="w-10 h-10 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white border border-[#ECDDFD]/30 flex items-center justify-center transition-colors shadow-soft"
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>

            {/* Global unavailability switch */}
            <div className="flex items-center justify-between p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 mb-6 shadow-soft-lg backdrop-blur-md">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shrink-0 shadow-soft">
                        <AlertTriangle size={18} className={unavailable ? 'text-amber-200' : 'text-white'} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white tracking-wide">Indisponible toute la semaine</p>
                        <p className="text-xs text-[#ECDDFD]/70 mt-0.5">Désactive automatiquement tous vos créneaux de cette semaine</p>
                    </div>
                </div>
                <Toggle checked={unavailable} onChange={() => toggleWeekUnavailable(currentUser.id, currentWeekKey)} />
            </div>

            {/* Project filter chips */}
            {allProjects.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveProjectId(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-school uppercase tracking-wider transition-all border ${
                            activeProjectId === null
                                ? 'btn-phoenix-gradient text-white border-transparent shadow-soft'
                                : 'bg-[#2D0A32]/90 text-[#ECDDFD]/80 border-[#6F2B75]/40 hover:text-white hover:border-[#EC602B]/60'
                        }`}
                    >
                        Tous les projets
                    </button>
                    {allProjects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProjectId(p.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-school uppercase tracking-wider transition-all border ${
                                activeProjectId === p.id
                                    ? 'btn-phoenix-gradient text-white border-transparent shadow-soft'
                                    : 'bg-[#2D0A32]/90 text-[#ECDDFD]/80 border-[#6F2B75]/40 hover:text-white hover:border-[#EC602B]/60'
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
                        className="flex flex-col items-center justify-center py-12 text-center bg-[#2D0A32]/90 rounded-[2rem] border border-[#6F2B75]/40 shadow-soft-lg"
                    >
                        <div className="w-14 h-14 rounded-full bg-[#EC602B]/20 border border-[#EC602B]/40 text-[#EC602B] flex items-center justify-center mb-3">
                            <AlertTriangle size={28} />
                        </div>
                        <p className="text-white font-bold text-base tracking-wide">Indisponible toute la semaine</p>
                        <p className="text-[#ECDDFD]/70 text-xs mt-1">Désactivez le switch ci-dessus pour réactiver la sélection de créneaux.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-[2rem] overflow-hidden border border-[#6F2B75]/40 bg-[#2D0A32]/90 backdrop-blur-md shadow-soft-lg"
                    >
                        {/* Table header */}
                        <div className="grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px bg-[#1F0422]/80 px-4 py-3 text-xs font-school font-bold text-[#ECDDFD]/70 uppercase tracking-widest border-b border-[#6F2B75]/40">
                            <span>Jour</span>
                            <span>Début</span>
                            <span>Fin</span>
                            <span>Projet</span>
                            <span className="text-right">Action</span>
                        </div>

                        {/* Rows */}
                        <div className="divide-y divide-[#6F2B75]/20">
                            {filteredSlots.map((slot, i) => {
                                const project = projectsData.find(p => p.id === slot.projectId);
                                const booked = isBooked(slot.id);
                                return (
                                    <motion.div
                                        key={slot.id}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className={`grid grid-cols-[1fr_80px_80px_1fr_80px] gap-px items-center px-4 py-3 transition-colors ${
                                            booked ? 'bg-[#EC602B]/15 hover:bg-[#EC602B]/20' : 'bg-transparent hover:bg-[#6F2B75]/20'
                                        }`}
                                    >
                                        <span className="text-xs sm:text-sm font-bold text-white tracking-wide">{slot.day}</span>
                                        <span className="text-xs sm:text-sm text-[#ECDDFD]/80 font-mono">{slot.startTime}</span>
                                        <span className="text-xs sm:text-sm text-[#ECDDFD]/80 font-mono">{slot.endTime}</span>
                                        <span className="text-xs sm:text-sm text-[#ECDDFD] font-medium truncate">{project?.name ?? '—'}</span>
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
