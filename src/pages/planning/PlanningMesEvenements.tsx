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
            <div className="mb-8 pt-2">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={16} className="text-[#EC602B]" />
                        <span className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">Participation associative</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">Mes Événements</h1>
                    <p className="text-[#ECDDFD]/70 text-sm mt-1 max-w-xl leading-relaxed">
                        Indiquez votre présence pour chacun des 4 grands événements Phœnix de l'année. 
                        La présence des tuteurs et membres est essentielle au succès de nos actions.
                    </p>
                </motion.div>
            </div>

            {/* Events List */}
            <div className="space-y-5">
                {SPECIAL_EVENTS.map((event, index) => {
                    const att = getAttendance(event.id);
                    const isPresent = att?.present === true;
                    const isAbsent = att?.present === false;
                    const isUnset = att === undefined;

                    // Match with public event info for date and description if available
                    const publicInfo = publicEvents.find(e => e.id === event.id);
                    const eventDate = publicInfo?.date || 'Date à venir';
                    const eventDesc = publicInfo?.description || "Événement majeur de l'association Phœnix réunissant l'ensemble des tuteurs et tuteurés.";

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="p-6 sm:p-7 rounded-xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 hover:border-[#EC602B]/50 transition-all duration-300 backdrop-blur-md shadow-soft-lg"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                                {/* Event Details */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                                        <h2 className="text-xl font-bold text-white tracking-wide">{event.label}</h2>
                                        <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-[#1F0422]/80 text-[#ECDDFD] border border-[#6F2B75]/40">
                                            <Calendar size={12} className="text-[#EC602B]" />
                                            {eventDate}
                                        </span>
                                        {/* Status badge */}
                                        {isPresent && (
                                            <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                <CheckCircle size={12} />
                                                Inscrit
                                            </span>
                                        )}
                                        {isAbsent && (
                                            <span className="flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                                                <XCircle size={12} />
                                                Non inscrit
                                            </span>
                                        )}
                                        {isUnset && (
                                            <span className="px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-white/5 text-[#ECDDFD]/50 border border-white/10">
                                                À renseigner
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[#ECDDFD]/75 text-sm leading-relaxed max-w-2xl">
                                        {eventDesc}
                                    </p>
                                </div>

                                {/* Choice Buttons */}
                                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0 pt-2 md:pt-0">
                                    <button
                                        type="button"
                                        onClick={() => handleSetAttendance(event.id, true)}
                                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider transition-all ${
                                            isPresent
                                                ? 'btn-phoenix-gradient text-white shadow-soft'
                                                : 'bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:bg-[#6F2B75]/40 hover:text-white border border-[#6F2B75]/40'
                                        }`}
                                    >
                                        <CheckCircle size={15} />
                                        Je participe
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSetAttendance(event.id, false)}
                                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider transition-all ${
                                            isAbsent
                                                ? 'bg-rose-900/60 border border-rose-500/50 text-rose-200 shadow-soft'
                                                : 'bg-[#1F0422]/70 text-[#ECDDFD]/60 hover:bg-rose-900/20 hover:text-rose-200 border border-[#6F2B75]/40'
                                        }`}
                                    >
                                        <XCircle size={15} />
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
                                    className="mt-4 pt-4 border-t border-[#6F2B75]/30"
                                >
                                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs md:text-sm font-medium">
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
            <div className="mt-8 p-5 rounded-[2rem] bg-[#2D0A32]/70 border border-[#6F2B75]/30 flex items-start gap-3.5 backdrop-blur-sm shadow-soft">
                <Info size={18} className="text-[#EC602B] shrink-0 mt-0.5" />
                <p className="text-[#ECDDFD]/70 text-xs leading-relaxed">
                    Les présences déclarées ici permettent au pôle Événements et au Bureau de dimensionner les équipes, la logistique et les transports. Toute modification de dernière minute doit être signalée directement aux responsables.
                </p>
            </div>
        </PlanningLayout>
    );
}
