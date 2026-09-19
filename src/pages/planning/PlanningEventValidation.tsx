import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Search, ShieldCheck, Users, Loader2, RotateCcw } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { SPECIAL_EVENTS } from '../../data/planningData';

export function PlanningEventValidation() {
    const { currentUser, bookings, eventAttendance, toggleEventAttendance, refreshPlanningData } = usePlanning();
    const [selectedEventId, setSelectedEventId] = useState(SPECIAL_EVENTS[0].id);
    const [searchTerm, setSearchTerm] = useState('');
    const [remoteMembers, setRemoteMembers] = useState<{id: string, name: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isBureau = currentUser?.role === 'bureau';

    const loadData = useCallback(async () => {
        if (!isBureau) return;
        setIsRefreshing(true);
        try {
            await refreshPlanningData();
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
            setIsRefreshing(false);
        }
    }, [isBureau, refreshPlanningData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Récupérer tous les membres uniques (locaux + distants)
    const allMembers = useMemo(() => {
        const membersMap = new Map<string, string>();
        
        // Ajouter les membres distants (Google Sheet)
        remoteMembers.forEach(m => membersMap.set(m.id, m.name.trim()));
        
        // Ajouter les membres locaux (historique bookings) au cas où
        bookings.forEach(b => {
            if (b.userName && b.userId) {
                membersMap.set(b.userId, b.userName.trim());
            }
        });

        // Ajouter les membres présents dans eventAttendance au cas où
        eventAttendance.forEach(a => {
            if (a.userId && !membersMap.has(a.userId)) {
                membersMap.set(a.userId, a.userId);
            }
        });
        
        return Array.from(membersMap.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [bookings, remoteMembers, eventAttendance]);

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

    return (
        <PlanningLayout title="Validation Événements">
            <div className="mb-6 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-display text-white tracking-wide">Validation Événements</h1>
                    <p className="text-[#ECDDFD]/70 text-sm mt-1">Gérez les présences pour les grands événements Phœnix.</p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={loadData}
                        disabled={isRefreshing}
                        className="w-10 h-10 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white border border-[#ECDDFD]/30 flex items-center justify-center transition-colors shadow-soft"
                        title="Rafraîchir les données"
                    >
                        <RotateCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleExport}
                        className="btn-phoenix-gradient flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-school text-xs uppercase tracking-wider shadow-soft transition-all"
                    >
                        <Download size={16} />
                        Exporter CSV
                    </motion.button>
                </div>
            </div>

            {/* Event Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
                {SPECIAL_EVENTS.map(event => (
                    <button
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`px-5 py-2 rounded-full whitespace-nowrap text-xs font-school uppercase tracking-wider transition-all ${
                            selectedEventId === event.id
                                ? 'btn-phoenix-gradient text-white shadow-soft'
                                : 'bg-[#2D0A32]/90 text-[#ECDDFD]/70 hover:text-white border border-[#6F2B75]/40'
                        }`}
                    >
                        {event.label}
                    </button>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-4 sm:p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 text-center shadow-soft-lg">
                    <p className="text-[#ECDDFD]/60 text-[10px] font-school uppercase tracking-wider font-bold mb-1">Présents</p>
                    <p className="text-2xl sm:text-3xl font-display text-emerald-400">{stats.present}</p>
                </div>
                <div className="p-4 sm:p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 text-center shadow-soft-lg">
                    <p className="text-[#ECDDFD]/60 text-[10px] font-school uppercase tracking-wider font-bold mb-1">Absents</p>
                    <p className="text-2xl sm:text-3xl font-display text-rose-400">{stats.absent}</p>
                </div>
                <div className="p-4 sm:p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 text-center shadow-soft-lg">
                    <p className="text-[#ECDDFD]/60 text-[10px] font-school uppercase tracking-wider font-bold mb-1">Taux</p>
                    <p className="text-2xl sm:text-3xl font-display text-white">{stats.percent}%</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1F0422]/70 border border-[#6F2B75]/50 rounded-full py-3 pl-12 pr-4 text-white placeholder-[#ECDDFD]/40 outline-none focus:border-[#EC602B] text-sm transition-colors"
                />
            </div>

            {/* Members List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center py-20">
                        <Loader2 className="w-10 h-10 text-[#EC602B] animate-spin mb-4" />
                        <p className="text-[#ECDDFD]/60 text-sm animate-pulse">Chargement des membres depuis Google Sheet...</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-12 rounded-[2rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30">
                        <Users size={48} className="mx-auto text-[#ECDDFD]/20 mb-3" />
                        <p className="text-[#ECDDFD]/40 font-medium">Aucun membre trouvé.</p>
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
                                className={`flex items-center justify-between p-4 sm:p-5 rounded-[2rem] border transition-all cursor-pointer backdrop-blur-md shadow-soft ${
                                    isPresent 
                                        ? 'bg-[#2D0A32]/95 border-emerald-500/40' 
                                        : 'bg-[#2D0A32]/60 border-[#6F2B75]/30 hover:border-[#6F2B75]/60'
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] flex items-center justify-center font-bold text-xs text-white shadow-soft">
                                        {member.name.charAt(0)}
                                    </div>
                                    <p className="font-bold text-white text-base tracking-wide">{member.name}</p>
                                </div>
                                
                                {isPresent ? (
                                    <CheckCircle size={24} className="text-emerald-400" fill="currentColor" fillOpacity={0.2} />
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-[#6F2B75]/50" />
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </PlanningLayout>
    );
}
