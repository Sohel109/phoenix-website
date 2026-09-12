import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar, Users, X, Download } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, formatWeekLabel, navigateWeek, DAY_ORDER, isSlotActiveThisWeek, type TimeSlot } from '../../data/planningData';
import { generateICS, downloadICSFile } from '../../utils/icsExport';

const STATUS_CONFIG = {
    prevu:    { label: 'Prévu',     color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    confirme: { label: 'Confirmé',  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    absent:   { label: 'Absent',    color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    annule:   { label: 'Annulé',    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export function PlanningHoraire() {
    const { currentUser, currentWeekKey, setCurrentWeekKey, getWeekBookings, bookings } = usePlanning();
    const [selectedSlotForModal, setSelectedSlotForModal] = useState<TimeSlot | null>(null);

    if (!currentUser) return null;

    const weekBookings = getWeekBookings(currentWeekKey, currentUser.id);

    const enrichedBookings = weekBookings
        .map(booking => {
            const slot = timeSlots.find(s => s.id === booking.slotId);
            const project = slot ? projectsData.find(p => p.id === slot.projectId) : null;
            return { booking, slot, project };
        })
        .filter(e => e.slot && e.project && isSlotActiveThisWeek(e.slot.id, currentWeekKey))
        .sort((a, b) => DAY_ORDER.indexOf(a.slot!.day) - DAY_ORDER.indexOf(b.slot!.day));

    // Handler pour télécharger le fichier .ics de l'agenda
    const handleExportCalendar = () => {
        const allMyBookings = bookings.filter(b => b.userId === currentUser.id);
        const icsContent = generateICS(allMyBookings, timeSlots, projectsData, currentUser.name);
        downloadICSFile(`planning-phoenix-${currentUser.name.toLowerCase().replace(/\s+/g, '_')}.ics`, icsContent);
    };

    // Obtenir la liste de tous les tuteurs inscrits sur un créneau donné cette semaine
    const getSlotAttendees = (slotId: string) => {
        return bookings.filter(b => b.slotId === slotId && b.weekKey === currentWeekKey && b.status !== 'annule');
    };

    return (
        <PlanningLayout title="Horaire">
            {/* Top action bar : Export agenda */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 mt-2">
                <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-orange-400" />
                    <span className="text-sm font-bold text-white">Mon Emploi du Temps</span>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportCalendar}
                    className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-bold border border-orange-500/30 transition-all self-start sm:self-auto"
                >
                    <Download size={14} />
                    <span>Exporter vers mon agenda (.ics)</span>
                </motion.button>
            </div>

            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={18} />
                </motion.button>
                <div className="text-center">
                    <p className="text-white font-bold text-sm">{formatWeekLabel(currentWeekKey)}</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-0.5">{currentWeekKey}</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'next'))}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>

            {enrichedBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white/5 border border-white/10">
                    <Clock size={40} className="text-white/20 mb-3" />
                    <p className="text-white/50 font-medium">Aucun créneau cette semaine</p>
                    <p className="text-white/30 text-sm mt-1">Activez vos disponibilités dans la section dédiée.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {enrichedBookings.map(({ booking, slot, project }, i) => {
                        const config = STATUS_CONFIG[booking.status];
                        const attendees = getSlotAttendees(slot!.id);
                        return (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
                                onClick={() => setSelectedSlotForModal(slot!)}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/40 hover:bg-white/[0.08] transition-all cursor-pointer group"
                            >
                                {/* Day pill */}
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center group-hover:border-orange-500/50 transition-colors">
                                    <span className="text-xs text-white/50 leading-none">{slot!.day.slice(0, 3)}</span>
                                    <span className="text-lg font-black text-white mt-0.5">{slot!.startTime}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-semibold truncate">{project!.name}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-white/50">
                                            <Clock size={11} />
                                            {slot!.startTime} – {slot!.endTime}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-white/50 truncate">
                                            <MapPin size={11} />
                                            {project!.address.split(',')[0]}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                                            <Users size={11} />
                                            {attendees.length} tuteur{attendees.length > 1 ? 's' : ''} inscrit{attendees.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
                                    {config.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modale des tuteurs inscrits à la séance */}
            {selectedSlotForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-[#120e2e] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
                    >
                        <button
                            onClick={() => setSelectedSlotForModal(null)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">
                                    {projectsData.find(p => p.id === selectedSlotForModal.projectId)?.name}
                                </h3>
                                <p className="text-white/50 text-xs mt-0.5">
                                    {selectedSlotForModal.day} · {selectedSlotForModal.startTime} – {selectedSlotForModal.endTime} ({formatWeekLabel(currentWeekKey)})
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 my-4">
                            {getSlotAttendees(selectedSlotForModal.id).length === 0 ? (
                                <p className="text-white/40 text-xs text-center py-6">Aucun tuteur inscrit pour cette séance.</p>
                            ) : (
                                getSlotAttendees(selectedSlotForModal.id).map(att => {
                                    const conf = STATUS_CONFIG[att.status] || STATUS_CONFIG.prevu;
                                    return (
                                        <div key={att.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 text-orange-400 border border-primary/30 flex items-center justify-center font-bold text-xs">
                                                    {(att.userName || att.userId).slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{att.userName || att.userId}</p>
                                                    <p className="text-[10px] text-white/40">Tuteur inscrit</p>
                                                </div>
                                            </div>
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${conf.color}`}>
                                                {conf.label}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedSlotForModal(null)}
                            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
                        >
                            Fermer
                        </button>
                    </motion.div>
                </div>
            )}
        </PlanningLayout>
    );
}

