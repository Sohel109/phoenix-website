import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, AlertTriangle, Sparkles, Info } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { SPECIAL_EVENTS } from '../../data/planningData';
import { events as publicEvents } from '../../data/events';

export function PlanningMesEvenements() {
    const { currentUser, eventAttendance, setEventAttendanceStatus } = usePlanning();

    if (!currentUser) return null;

    // Helper to get current attendance record for this user & event
    const getAttendance = (eventId: string) => {
        return eventAttendance.find(a => a.userId === currentUser.id && a.eventId === eventId);
    };

    const handleSetAttendance = async (eventId: string, present: boolean) => {
        await setEventAttendanceStatus(currentUser.id, eventId, present);
    };

    return (
        <PlanningLayout title="Événements">
            {/* Header */}
            <div className="mb-8 pt-4">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={20} className="text-orange-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Participation associative</span>
                    </div>
                    <h1 className="text-3xl font-black text-white">Mes Événements</h1>
                    <p className="text-white/50 text-sm mt-1 max-w-xl">
                        Indiquez votre présence pour chacun des 4 grands événements Phoenix de l'année. 
                        La présence des tuteurs et membres est essentielle au succès de nos actions.
                    </p>
                </motion.div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {SPECIAL_EVENTS.map((event, index) => {
                    const att = getAttendance(event.id);
                    const isPresent = att?.present === true;
                    const isAbsent = att?.present === false;
                    const isUnset = att === undefined;

                    // Match with public event info for date and description if available
                    const publicInfo = publicEvents.find(e => e.id === event.id);
                    const eventDate = publicInfo?.date || 'Date à venir';
                    const eventDesc = publicInfo?.description || "Événement majeur de l'association Phoenix réunissant l'ensemble des tuteurs et tuteurés.";

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="p-5 md:p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                {/* Event Details */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                                        <h2 className="text-xl font-bold text-white">{event.label}</h2>
                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/10">
                                            <Calendar size={12} className="text-orange-400" />
                                            {eventDate}
                                        </span>
                                        {/* Status badge */}
                                        {isPresent && (
                                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                <CheckCircle size={12} />
                                                Inscrit
                                            </span>
                                        )}
                                        {isAbsent && (
                                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                                <XCircle size={12} />
                                                Non inscrit
                                            </span>
                                        )}
                                        {isUnset && (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/40 border border-white/10">
                                                À renseigner
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                                        {eventDesc}
                                    </p>
                                </div>

                                {/* Choice Buttons */}
                                <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0 pt-2 md:pt-0">
                                    <button
                                        type="button"
                                        onClick={() => handleSetAttendance(event.id, true)}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                            isPresent
                                                ? 'bg-emerald-600 text-white shadow-md'
                                                : 'bg-white/10 text-white/80 hover:bg-emerald-600/30 hover:text-emerald-200 border border-white/10'
                                        }`}
                                    >
                                        <CheckCircle size={16} />
                                        Je participe
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSetAttendance(event.id, false)}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                            isAbsent
                                                ? 'bg-rose-600/80 text-white shadow-md'
                                                : 'bg-white/10 text-white/70 hover:bg-rose-600/20 hover:text-rose-200 border border-white/10'
                                        }`}
                                    >
                                        <XCircle size={16} />
                                        Je ne participe pas
                                    </button>
                                </div>
                            </div>

                            {/* Warning box when "Je ne participe pas" is selected */}
                            {isAbsent && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-4 pt-4 border-t border-white/10"
                                >
                                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs md:text-sm font-medium">
                                        <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-amber-300">Cas exceptionnel à justifier auprès d'un membre du bureau</p>
                                            <p className="text-amber-200/80 text-xs mt-0.5">
                                                Votre absence est enregistrée. Pensez à contacter le bureau pour expliquer votre motif.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* General footer note */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Info size={18} className="text-white/40 shrink-0 mt-0.5" />
                <p className="text-white/50 text-xs leading-relaxed">
                    Les présences déclarées ici permettent au pôle Événements et au Bureau de dimensionner les équipes, la logistique et les transports. Toute modification de dernière minute doit être signalée directement aux responsables.
                </p>
            </div>
        </PlanningLayout>
    );
}
