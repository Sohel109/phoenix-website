import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Search, ShieldCheck, Users, Loader2 } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { SPECIAL_EVENTS } from '../../data/planningData';

export function PlanningEventValidation() {
    const { currentUser, bookings, eventAttendance, toggleEventAttendance } = usePlanning();
    const [selectedEventId, setSelectedEventId] = useState(SPECIAL_EVENTS[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [remoteMembers, setRemoteMembers] = useState<{id: string, name: string}[]>([]);
    const [loading, setLoading] = useState(true);

    const isBureau = currentUser?.role === 'bureau';

    useEffect(() => {
        if (!isBureau) return;
        
        async function fetchMembers() {
            try {
                const API_URL = import.meta.env.VITE_API_URL || '';
                const response = await fetch(`${API_URL}/api/login?action=listUsers`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.users) {
                        setRemoteMembers(data.users);
                    }
                }
            } catch (error) {
                console.error("Erreur chargement membres:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchMembers();
    }, [isBureau]);

    if (!currentUser || !isBureau) {
        return (
            <PlanningLayout title="Événements">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShieldCheck size={48} className="text-white/20 mb-4" />
                    <p className="text-white font-bold text-lg">Accès restreint</p>
                    <p className="text-white/40 text-sm mt-1">Cette page est réservée au Bureau.</p>
                </div>
            </PlanningLayout>
        );
    }

    // Récupérer tous les membres uniques (locaux + distants)
    const allMembers = useMemo(() => {
        const membersMap = new Map<string, string>();
        
        // Ajouter les membres distants (Google Sheet)
        remoteMembers.forEach(m => membersMap.set(m.id, m.name));
        
        // Ajouter les membres locaux (historique bookings) au cas où
        bookings.forEach(b => {
            if (b.userName && b.userId) {
                membersMap.set(b.userId, b.userName);
            }
        });
        
        return Array.from(membersMap.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [bookings, remoteMembers]);

    const filteredMembers = allMembers.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getAttendanceStatus = (userId: string, eventId: string) => {
        const att = eventAttendance.find(a => a.userId === userId && a.eventId === eventId);
        return att ? att.present : false;
    };

    const handleExport = () => {
        const event = SPECIAL_EVENTS.find(e => e.id === selectedEventId);
        const eventName = event?.label || selectedEventId;

        let csv = "Nom;Presence\n";
        allMembers.forEach(m => {
            const isPresent = getAttendanceStatus(m.id, selectedEventId);
            csv += `${m.name};${isPresent ? 'Présent' : 'Absent'}\n`;
        });

        const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Presences_${eventName.replace(/ /g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const stats = useMemo(() => {
        const presentCount = allMembers.filter(m => getAttendanceStatus(m.id, selectedEventId)).length;
        return {
            total: allMembers.length,
            present: presentCount,
            absent: allMembers.length - presentCount,
            percent: allMembers.length > 0 ? Math.round((presentCount / allMembers.length) * 100) : 0
        };
    }, [allMembers, selectedEventId, eventAttendance]);

    return (
        <PlanningLayout title="Validation Événements">
            <div className="mb-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white">Validation Événements</h1>
                    <p className="text-white/50 text-sm mt-1">Gérez les présences pour les grands événements.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                    <Download size={18} />
                    Exporter CSV
                </motion.button>
            </div>

            {/* Event Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
                {SPECIAL_EVENTS.map(event => (
                    <button
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                            selectedEventId === event.id
                                ? 'bg-white text-gray-900 shadow-lg'
                                : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }`}
                    >
                        {event.label}
                    </button>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Présents</p>
                    <p className="text-xl font-black text-emerald-400">{stats.present}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Absents</p>
                    <p className="text-xl font-black text-rose-400">{stats.absent}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-white/40 text-[10px] font-bold uppercase mb-1">Taux</p>
                    <p className="text-xl font-black text-white">{stats.percent}%</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-white/30 transition-colors"
                />
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                        <p className="text-white/40 animate-pulse">Chargement des membres depuis Google Sheet...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-12 rounded-3xl bg-white/5 border border-white/10">
                        <Users size={48} className="mx-auto text-white/10 mb-3" />
                        <p className="text-white/30 font-medium">Aucun membre trouvé.</p>
                    </div>
                ) : (
                    filteredMembers.map((member, index) => {
                        const isPresent = getAttendanceStatus(member.id, selectedEventId);
                        return (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                onClick={() => toggleEventAttendance(member.id, selectedEventId)}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                    isPresent 
                                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white ${
                                        isPresent ? 'bg-emerald-500' : 'bg-white/10'
                                    }`}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <p className="font-bold text-white">{member.name}</p>
                                </div>
                                
                                {isPresent ? (
                                    <CheckCircle size={24} className="text-emerald-500" fill="currentColor" fillOpacity={0.2} />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-white/10" />
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </PlanningLayout>
    );
}
