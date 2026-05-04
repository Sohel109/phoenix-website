import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, formatWeekLabel, navigateWeek, DAY_ORDER } from '../../data/planningData';

const STATUS_CONFIG = {
    prevu:    { label: 'Prévu',     color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    confirme: { label: 'Confirmé',  color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    absent:   { label: 'Absent',    color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    annule:   { label: 'Annulé',    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export function PlanningHoraire() {
    const { currentUser, currentWeekKey, setCurrentWeekKey, getWeekBookings } = usePlanning();
    if (!currentUser) return null;

    const weekBookings = getWeekBookings(currentWeekKey, currentUser.id);

    const enrichedBookings = weekBookings
        .map(booking => {
            const slot = timeSlots.find(s => s.id === booking.slotId);
            const project = slot ? projectsData.find(p => p.id === slot.projectId) : null;
            return { booking, slot, project };
        })
        .filter(e => e.slot && e.project)
        .sort((a, b) => DAY_ORDER.indexOf(a.slot!.day) - DAY_ORDER.indexOf(b.slot!.day));

    return (
        <PlanningLayout title="Horaire">
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

            {enrichedBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Clock size={40} className="text-white/20 mb-3" />
                    <p className="text-white/50 font-medium">Aucun créneau cette semaine</p>
                    <p className="text-white/30 text-sm mt-1">Activez vos disponibilités dans la section dédiée.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {enrichedBookings.map(({ booking, slot, project }, i) => {
                        const config = STATUS_CONFIG[booking.status];
                        return (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 24 }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                            >
                                {/* Day pill */}
                                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500/20 to-violet-600/20 border border-white/10 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs text-white/50 leading-none">{slot!.day.slice(0, 3)}</span>
                                    <span className="text-lg font-black text-white mt-0.5">{slot!.startTime}</span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold truncate">{project!.name}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-white/50">
                                            <Clock size={11} />
                                            {slot!.startTime} – {slot!.endTime}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-white/50 truncate">
                                            <MapPin size={11} />
                                            {project!.address.split(',')[0]}
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
        </PlanningLayout>
    );
}
