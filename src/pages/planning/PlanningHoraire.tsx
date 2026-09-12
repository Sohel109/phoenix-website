import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Calendar, Users, X, Download, Filter, AlertTriangle, Grid, User } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'mine' | 'global'>('global');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    if (!currentUser) return null;

    const weekBookings = getWeekBookings(currentWeekKey, currentUser.id);

    const enrichedMyBookings = weekBookings
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

    // Filter time slots for global view based on project filter and active weeks
    const filteredGlobalSlots = timeSlots.filter(slot => {
        if (!isSlotActiveThisWeek(slot.id, currentWeekKey)) return false;
        if (selectedProjectId !== 'all' && slot.projectId !== Number(selectedProjectId)) return false;
        return true;
    });

    // Group slots by day
    const slotsByDay = DAY_ORDER.map(day => ({
        day,
        slots: filteredGlobalSlots.filter(s => s.day === day)
    })).filter(group => group.slots.length > 0);

    return (
        <PlanningLayout title="Horaire">
            {/* Navigation Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'global'
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Grid size={15} />
                        <span>Vue globale par projet</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'mine'
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <User size={15} />
                        <span>Mon Emploi du Temps</span>
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportCalendar}
                    className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-bold border border-orange-500/30 transition-all self-stretch sm:self-auto shrink-0"
                >
                    <Download size={14} />
                    <span>Exporter mon agenda (.ics)</span>
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

            {/* TAB 1: MON EMPLOI DU TEMPS */}
            {activeTab === 'mine' && (
                enrichedMyBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white/5 border border-white/10">
                        <Clock size={40} className="text-white/20 mb-3" />
                        <p className="text-white/50 font-medium">Aucun créneau pour vous cette semaine</p>
                        <p className="text-white/30 text-sm mt-1">Activez vos disponibilités dans la section dédiée ou consultez le planning global.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {enrichedMyBookings.map(({ booking, slot, project }, i) => {
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
                                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center group-hover:border-orange-500/50 transition-colors">
                                        <span className="text-xs text-white/50 leading-none">{slot!.day.slice(0, 3)}</span>
                                        <span className="text-lg font-black text-white mt-0.5">{slot!.startTime}</span>
                                    </div>

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

                                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}>
                                        {config.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                )
            )}

            {/* TAB 2: VUE GLOBALE PAR PROJET */}
            {activeTab === 'global' && (
                <div className="space-y-6">
                    {/* Project Filter Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider">
                            <Filter size={14} className="text-orange-400" />
                            <span>Filtrer par projet :</span>
                        </div>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-[#1a1438] text-white text-xs font-medium border border-white/15 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
                        >
                            <option value="all">Tous les projets ({projectsData.length})</option>
                            {projectsData.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {slotsByDay.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-white/5 border border-white/10">
                            <Clock size={40} className="text-white/20 mb-3" />
                            <p className="text-white/50 font-medium">Aucun créneau programmé pour ce filtre cette semaine</p>
                        </div>
                    ) : (
                        slotsByDay.map(({ day, slots }) => (
                            <div key={day} className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                                    <Calendar size={14} className="text-orange-400" />
                                    <h3 className="text-sm font-black uppercase tracking-wider text-white">{day}</h3>
                                    <span className="text-xs text-white/40 font-medium">({slots.length} séance{slots.length > 1 ? 's' : ''})</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {slots.map(slot => {
                                        const project = projectsData.find(p => p.id === slot.projectId);
                                        const attendees = getSlotAttendees(slot.id);
                                        const hasAttendees = attendees.length > 0;

                                        return (
                                            <motion.div
                                                key={slot.id}
                                                whileHover={{ scale: 1.01 }}
                                                onClick={() => setSelectedSlotForModal(slot)}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                                    hasAttendees
                                                        ? 'bg-white/5 border-white/10 hover:border-orange-500/40 hover:bg-white/[0.08]'
                                                        : 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/10'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <h4 className="text-white font-bold text-sm leading-snug">{project?.name}</h4>
                                                            <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                                                                <MapPin size={10} />
                                                                {project?.address.split(',')[0]}
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 text-xs font-bold text-orange-300 bg-orange-500/20 px-2.5 py-1 rounded-lg border border-orange-500/30">
                                                            {slot.startTime} – {slot.endTime}
                                                        </span>
                                                    </div>

                                                    {/* Attendees preview list */}
                                                    <div className="mt-3 pt-3 border-t border-white/10">
                                                        <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                            <span>Inscrits ({attendees.length})</span>
                                                            {!hasAttendees && (
                                                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                                                    <AlertTriangle size={12} />
                                                                    Aucun tuteur
                                                                </span>
                                                            )}
                                                        </p>

                                                        {hasAttendees ? (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {attendees.map(att => {
                                                                    const conf = STATUS_CONFIG[att.status] || STATUS_CONFIG.prevu;
                                                                    return (
                                                                        <span
                                                                            key={att.id}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white font-medium"
                                                                        >
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                                            {att.userName || att.userId}
                                                                            <span className={`text-[9px] px-1 rounded ${conf.color}`}>
                                                                                {conf.label}
                                                                            </span>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium flex items-center gap-2">
                                                                <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                                                                <span>⚠️ Personne ne s'est encore inscrit sur cette séance.</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 text-right">
                                                    <span className="text-[11px] font-semibold text-orange-400 hover:underline">
                                                        Cliquer pour détails & liste →
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
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
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                                    <AlertTriangle size={24} className="mx-auto text-amber-400 mb-2" />
                                    <p className="text-amber-200 text-xs font-bold">Aucun tuteur inscrit pour cette séance</p>
                                    <p className="text-amber-200/60 text-[11px] mt-1">N'hésitez pas à vous inscrire dans l'onglet Disponibilités !</p>
                                </div>
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
