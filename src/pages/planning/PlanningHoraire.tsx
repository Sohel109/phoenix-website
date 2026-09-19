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
    absent:   { label: 'Absent',    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    annule:   { label: 'Annulé',    color: 'bg-white/10 text-[#ECDDFD]/50 border-white/15' },
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
                <div className="flex bg-[#2D0A32]/90 p-1.5 rounded-full border border-[#6F2B75]/40 shrink-0 backdrop-blur-md shadow-soft">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                            activeTab === 'global'
                                ? 'btn-phoenix-gradient text-white shadow-soft'
                                : 'text-[#ECDDFD]/70 hover:text-white'
                        }`}
                    >
                        <Grid size={15} />
                        <span>Vue globale</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('mine')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-school uppercase tracking-wider transition-all ${
                            activeTab === 'mine'
                                ? 'btn-phoenix-gradient text-white shadow-soft'
                                : 'text-[#ECDDFD]/70 hover:text-white'
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
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white text-xs font-school uppercase tracking-wider border border-[#ECDDFD]/30 hover:border-[#EC602B]/60 shadow-soft transition-all self-stretch sm:self-auto shrink-0"
                >
                    <Download size={14} className="text-[#EC602B]" />
                    <span>Exporter (.ics)</span>
                </motion.button>
            </div>

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

            {/* TAB 1: MON EMPLOI DU TEMPS */}
            {activeTab === 'mine' && (
                enrichedMyBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30 shadow-soft-lg">
                        <div className="w-14 h-14 rounded-full bg-[#6F2B75]/30 border border-[#6F2B75]/50 flex items-center justify-center text-[#ECDDFD]/60 mb-3 shadow-soft">
                            <Clock size={28} />
                        </div>
                        <p className="text-white font-bold text-base">Aucun créneau pour vous cette semaine</p>
                        <p className="text-[#ECDDFD]/60 text-xs mt-1">Activez vos disponibilités dans la section dédiée ou consultez la vue globale.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {enrichedMyBookings.map(({ booking, slot, project }, i) => {
                            const config = STATUS_CONFIG[booking.status];
                            const attendees = getSlotAttendees(slot!.id);
                            return (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedSlotForModal(slot!)}
                                    className="flex items-center gap-4 p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 hover:border-[#EC602B]/60 backdrop-blur-md transition-all cursor-pointer group shadow-soft-lg hover:-translate-y-0.5"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex flex-col items-center justify-center text-center shadow-soft group-hover:scale-105 transition-transform">
                                        <span className="text-[11px] font-school uppercase tracking-wider text-white/90 leading-none">{slot!.day.slice(0, 3)}</span>
                                        <span className="text-base font-black text-white mt-0.5 font-mono">{slot!.startTime}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-bold text-base truncate tracking-wide">{project!.name}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                            <span className="flex items-center gap-1.5 text-xs text-[#ECDDFD]/70 font-mono">
                                                <Clock size={12} className="text-[#EC602B]" />
                                                {slot!.startTime} – {slot!.endTime}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs text-[#ECDDFD]/70 truncate">
                                                <MapPin size={12} className="text-[#EC602B]" />
                                                {project!.address.split(',')[0]}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-school uppercase tracking-wider text-[#ECDDFD] bg-[#6F2B75]/40 px-2.5 py-0.5 rounded-full border border-[#ECDDFD]/20">
                                                <Users size={11} className="text-[#EC602B]" />
                                                {attendees.length} tuteur{attendees.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={`flex-shrink-0 text-xs font-school uppercase tracking-wider px-3 py-1 rounded-full border ${config.color}`}>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg">
                        <div className="flex items-center gap-2.5 text-[#ECDDFD] text-xs font-school uppercase tracking-wider font-semibold">
                            <Filter size={15} className="text-[#EC602B]" />
                            <span>Filtrer par projet :</span>
                        </div>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="bg-[#1F0422]/80 text-white text-xs font-school uppercase tracking-wider border border-[#6F2B75]/50 rounded-full px-4 py-2.5 focus:outline-none focus:border-[#EC602B] transition-colors cursor-pointer"
                        >
                            <option value="all">Tous les projets ({projectsData.length})</option>
                            {projectsData.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {slotsByDay.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30 shadow-soft-lg">
                            <Clock size={36} className="text-[#ECDDFD]/30 mb-3" />
                            <p className="text-white font-medium">Aucun créneau programmé pour ce filtre cette semaine</p>
                        </div>
                    ) : (
                        slotsByDay.map(({ day, slots }) => (
                            <div key={day} className="space-y-4">
                                <div className="flex items-center gap-2.5 border-b border-[#6F2B75]/40 pb-2.5">
                                    <Calendar size={16} className="text-[#EC602B]" />
                                    <h3 className="text-base font-school font-bold uppercase tracking-widest text-white">{day}</h3>
                                    <span className="text-xs text-[#ECDDFD]/60 font-school">({slots.length} séance{slots.length > 1 ? 's' : ''})</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {slots.map(slot => {
                                        const project = projectsData.find(p => p.id === slot.projectId);
                                        const attendees = getSlotAttendees(slot.id);
                                        const hasAttendees = attendees.length > 0;

                                        return (
                                            <motion.div
                                                key={slot.id}
                                                whileHover={{ y: -2 }}
                                                onClick={() => setSelectedSlotForModal(slot)}
                                                className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md shadow-soft-lg ${
                                                    hasAttendees
                                                        ? 'bg-[#2D0A32]/90 border-[#6F2B75]/40 hover:border-[#EC602B]/60'
                                                        : 'bg-[#2D0A32]/60 border-amber-500/30 hover:border-amber-500/60'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-2 mb-3">
                                                        <div>
                                                            <h4 className="text-white font-bold text-base leading-snug tracking-wide">{project?.name}</h4>
                                                            <p className="text-[#ECDDFD]/60 text-xs flex items-center gap-1 mt-1">
                                                                <MapPin size={11} className="text-[#EC602B]" />
                                                                {project?.address.split(',')[0]}
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 text-xs font-mono font-bold text-[#EC602B] bg-[#EC602B]/15 px-3 py-1 rounded-full border border-[#EC602B]/30">
                                                            {slot.startTime} – {slot.endTime}
                                                        </span>
                                                    </div>

                                                    {/* Attendees preview list */}
                                                    <div className="mt-4 pt-3 border-t border-[#6F2B75]/30">
                                                        <p className="text-[11px] font-school font-semibold text-[#ECDDFD]/70 uppercase tracking-wider mb-2 flex items-center justify-between">
                                                            <span>Inscrits ({attendees.length})</span>
                                                            {!hasAttendees && (
                                                                <span className="text-amber-300 font-bold flex items-center gap-1">
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
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F0422]/80 border border-[#6F2B75]/40 text-xs text-white font-medium"
                                                                        >
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                                            {att.userName || att.userId}
                                                                            <span className={`text-[10px] font-school uppercase px-1.5 py-0.5 rounded-full border ${conf.color}`}>
                                                                                {conf.label}
                                                                            </span>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium flex items-center gap-2">
                                                                <AlertTriangle size={14} className="shrink-0 text-amber-400" />
                                                                <span>Personne ne s'est encore inscrit sur cette séance.</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-2 text-right">
                                                    <span className="text-xs font-school uppercase tracking-wider text-[#EC602B] hover:underline">
                                                        Détails & liste →
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-[#2D0A32] border border-[#6F2B75]/60 rounded-xl p-7 max-w-md w-full shadow-2xl relative text-white"
                    >
                        <button
                            onClick={() => setSelectedSlotForModal(null)}
                            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-[#ECDDFD]/10 flex items-center justify-center text-[#ECDDFD]/60 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3.5 mb-5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shrink-0 shadow-soft">
                                <Users size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight tracking-wide">
                                    {projectsData.find(p => p.id === selectedSlotForModal.projectId)?.name}
                                </h3>
                                <p className="text-[#ECDDFD]/70 text-xs mt-0.5">
                                    {selectedSlotForModal.day} · {selectedSlotForModal.startTime} – {selectedSlotForModal.endTime} ({formatWeekLabel(currentWeekKey)})
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 my-5">
                            {getSlotAttendees(selectedSlotForModal.id).length === 0 ? (
                                <div className="p-5 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 text-center">
                                    <AlertTriangle size={24} className="mx-auto text-amber-400 mb-2" />
                                    <p className="text-amber-200 text-xs font-bold">Aucun tuteur inscrit pour cette séance</p>
                                    <p className="text-amber-200/60 text-[11px] mt-1">N'hésitez pas à vous inscrire dans l'onglet Disponibilités !</p>
                                </div>
                            ) : (
                                getSlotAttendees(selectedSlotForModal.id).map(att => {
                                    const conf = STATUS_CONFIG[att.status] || STATUS_CONFIG.prevu;
                                    return (
                                        <div key={att.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1F0422]/80 border border-[#6F2B75]/30">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center font-bold text-xs shadow-soft">
                                                    {(att.userName || att.userId).slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{att.userName || att.userId}</p>
                                                    <p className="text-[10px] text-[#ECDDFD]/50 font-school uppercase">Tuteur inscrit</p>
                                                </div>
                                            </div>
                                            <span className={`text-[11px] font-school uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${conf.color}`}>
                                                {conf.label}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedSlotForModal(null)}
                            className="btn-phoenix-gradient w-full py-3 rounded-full text-white font-school text-xs uppercase tracking-wider shadow-soft transition-all"
                        >
                            Fermer
                        </button>
                    </motion.div>
                </div>
            )}
        </PlanningLayout>
    );
}
