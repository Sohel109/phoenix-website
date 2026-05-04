import { motion } from 'framer-motion';
import { Clock, XCircle, AlertTriangle, User, ShieldCheck } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, getSlotDuration } from '../../data/planningData';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    gradient: string;
    shadow: string;
}

function StatCard({ icon, label, value, unit, gradient, shadow }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl ${shadow}`}
        >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg ${shadow}`}>
                {icon}
            </div>
            <div>
                <p className="text-3xl font-black text-white">
                    {value}<span className="text-lg font-semibold text-white/50 ml-1">{unit}</span>
                </p>
                <p className="text-sm text-white/50 mt-0.5">{label}</p>
            </div>
        </motion.div>
    );
}

export function PlanningCompte() {
    const { currentUser, bookings } = usePlanning();
    if (!currentUser) return null;

    const myBookings = bookings.filter(b => b.userId === currentUser.id);

    // Compute stats
    const heuresPresteesH = myBookings
        .filter(b => b.status === 'confirme')
        .reduce((sum, b) => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            return sum + (slot ? getSlotDuration(slot) : 0);
        }, 0);

    const annulations = myBookings.filter(b => b.status === 'annule').length;
    const absences = myBookings.filter(b => b.status === 'absent').length;

    // Recent bookings (last 5)
    const recentBookings = [...myBookings]
        .reverse()
        .slice(0, 5)
        .map(b => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            const project = slot ? projectsData.find(p => p.id === slot.projectId) : null;
            return { b, slot, project };
        });

    const myProjects = projectsData.filter(p => currentUser.projectIds.includes(p.id));
    const isChef = currentUser.role === 'chef_projet';

    const STATUS_COLORS: Record<string, string> = {
        prevu: 'text-blue-300',
        confirme: 'text-emerald-400',
        absent: 'text-red-400',
        annule: 'text-gray-500',
    };
    const STATUS_LABELS: Record<string, string> = {
        prevu: 'Prévu', confirme: 'Confirmé', absent: 'Absent', annule: 'Annulé',
    };

    return (
        <PlanningLayout title="Mon compte">
            {/* Profile header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 mb-6 mt-2"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20">
                    {isChef ? <ShieldCheck size={28} className="text-white" /> : <User size={28} className="text-white" />}
                </div>
                <div>
                    <h2 className="text-xl font-black text-white">{currentUser.name}</h2>
                    <p className="text-orange-400 text-sm font-semibold">{isChef ? 'Chef de Projet' : 'Tuteur'}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {myProjects.map(p => (
                            <span key={p.id} className="px-2 py-0.5 rounded-full text-xs bg-white/10 border border-white/20 text-white/60">
                                {p.name}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Statistiques</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard
                    icon={<Clock size={20} />}
                    label="Heures prestées"
                    value={heuresPresteesH % 1 === 0 ? heuresPresteesH : heuresPresteesH.toFixed(1)}
                    unit="h"
                    gradient="from-emerald-500 to-teal-600"
                    shadow="shadow-emerald-500/20"
                />
                <StatCard
                    icon={<XCircle size={20} />}
                    label="Annulations"
                    value={annulations}
                    gradient="from-orange-500 to-pink-600"
                    shadow="shadow-orange-500/20"
                />
                <StatCard
                    icon={<AlertTriangle size={20} />}
                    label="Absences"
                    value={absences}
                    gradient="from-red-500 to-rose-600"
                    shadow="shadow-red-500/20"
                />
            </div>

            {/* Recent history */}
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">Historique récent</h3>
            {recentBookings.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">Aucun créneau enregistré.</p>
            ) : (
                <div className="space-y-2">
                    {recentBookings.map(({ b, slot, project }) => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <p className="text-sm font-semibold text-white">{project?.name ?? '—'}</p>
                                <p className="text-xs text-white/40">{slot?.day} · {slot?.startTime}–{slot?.endTime} · {b.weekKey}</p>
                            </div>
                            <span className={`text-xs font-semibold ${STATUS_COLORS[b.status]}`}>
                                {STATUS_LABELS[b.status]}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </PlanningLayout>
    );
}
