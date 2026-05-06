import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Filter, ShieldCheck } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, getSlotDuration, getWeekStartDate, formatWeekLabel } from '../../data/planningData';

export function PlanningRecap() {
    const { currentUser, bookings, currentWeekKey } = usePlanning();
    
    const currentDate = new Date();
    const [filterType, setFilterType] = useState<'week' | 'month' | 'year' | 'all'>('all');
    const [selectedWeek, setSelectedWeek] = useState(currentWeekKey);
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedProjectId, setSelectedProjectId] = useState<number | 'all'>('all');

    const isBureau = currentUser?.role === 'bureau';

    if (!currentUser || (currentUser.role !== 'chef_projet' && !isBureau)) {
        return (
            <PlanningLayout title="Récapitulatif">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShieldCheck size={48} className="text-white/20 mb-4" />
                    <p className="text-white font-bold text-lg">Accès restreint</p>
                    <p className="text-white/40 text-sm mt-1">Cette page est réservée aux responsables.</p>
                </div>
            </PlanningLayout>
        );
    }

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Obtenir toutes les années uniques des bookings
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        years.add(currentDate.getFullYear());
        bookings.forEach(b => {
            const y = parseInt(b.weekKey.split('-')[0], 10);
            if (!isNaN(y)) years.add(y);
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [bookings, currentDate]);

    // Calculer les heures
    const recapData = useMemo(() => {
        // Filtrer les bookings
        const filteredBookings = bookings.filter(b => {
            if (b.status !== 'confirme') return false;
            
            const slot = timeSlots.find(s => s.id === b.slotId);
            if (!slot) return false;

            if (selectedProjectId !== 'all' && slot.projectId !== selectedProjectId) return false;

            const weekStart = getWeekStartDate(b.weekKey);
            
            if (filterType === 'week' && b.weekKey !== selectedWeek) return false;
            if (filterType === 'month' && (weekStart.getMonth() !== selectedMonth || weekStart.getFullYear() !== selectedYear)) return false;
            if (filterType === 'year' && weekStart.getFullYear() !== selectedYear) return false;

            return true;
        });

        // Agréger par utilisateur et projet
        const userStats: Record<string, { name: string, totalHours: number, byProject: Record<number, number> }> = {};
        
        filteredBookings.forEach(b => {
            const slot = timeSlots.find(s => s.id === b.slotId)!;
            const duration = getSlotDuration(slot);
            const userName = b.userName || b.userId;
            
            if (!userStats[b.userId]) {
                userStats[b.userId] = { name: userName, totalHours: 0, byProject: {} };
            }
            
            userStats[b.userId].totalHours += duration;
            userStats[b.userId].byProject[slot.projectId] = (userStats[b.userId].byProject[slot.projectId] || 0) + duration;
        });

        return Object.values(userStats).sort((a, b) => b.totalHours - a.totalHours);
    }, [bookings, filterType, selectedWeek, selectedMonth, selectedYear, selectedProjectId]);

    const totalPeriodHours = recapData.reduce((acc, u) => acc + u.totalHours, 0);

    const handleDownload = () => {
        let content = "Récapitulatif des heures\n";
        content += "===========================\n\n";
        
        if (filterType === 'week') content += `Période : Semaine ${selectedWeek}\n`;
        else if (filterType === 'month') content += `Période : ${months[selectedMonth]} ${selectedYear}\n`;
        else if (filterType === 'year') content += `Période : Année ${selectedYear}\n`;
        else content += "Période : Toutes les données\n";
        
        const projectLabel = selectedProjectId === 'all' ? 'Tous les projets' : projectsData.find(p => p.id === selectedProjectId)?.name;
        content += `Projet(s) : ${projectLabel}\n\n`;
        
        // Résumé par projet global
        content += "--- TOTAL PAR PROJET ---\n";
        const totalByProject: Record<number, number> = {};
        recapData.forEach(u => {
            Object.entries(u.byProject).forEach(([pId, hrs]) => {
                totalByProject[Number(pId)] = (totalByProject[Number(pId)] || 0) + hrs;
            });
        });
        
        if (Object.keys(totalByProject).length === 0) {
             content += "Aucune heure validée.\n";
        } else {
            Object.entries(totalByProject).forEach(([pId, hrs]) => {
                const pName = projectsData.find(p => p.id === Number(pId))?.name || 'Inconnu';
                content += `${pName} : ${hrs} heure(s)\n`;
            });
        }
        
        content += "\n--- DÉTAIL PAR MEMBRE ---\n";
        if (recapData.length === 0) {
            content += "Aucun membre n'a d'heures validées sur cette période.\n";
        } else {
            recapData.forEach(u => {
                content += `${u.name} : ${u.totalHours} heure(s)\n`;
                if (selectedProjectId === 'all') {
                    Object.entries(u.byProject).forEach(([pId, hrs]) => {
                        const pName = projectsData.find(p => p.id === Number(pId))?.name || 'Inconnu';
                        content += `  - ${pName} : ${hrs} heure(s)\n`;
                    });
                }
                content += "\n";
            });
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Recap_Heures_${filterType}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <PlanningLayout title="Récapitulatif">
            <div className="mb-6 pt-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">Récapitulatif des heures</h1>
                    <p className="text-white/50 text-sm mt-1">Exportez et analysez les heures validées.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Télécharger</span>
                </motion.button>
            </div>

            {/* Filters */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Filter size={16} className="text-white/40" />
                    <span className="text-sm font-semibold text-white/70 uppercase tracking-wide">Filtres</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Filter Type */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                    >
                        <option value="all" className="bg-gray-900">Toutes les dates</option>
                        <option value="year" className="bg-gray-900">Par année</option>
                        <option value="month" className="bg-gray-900">Par mois</option>
                        <option value="week" className="bg-gray-900">Par semaine</option>
                    </select>

                    {/* Conditional Date Filters */}
                    {filterType === 'week' && (
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                        >
                            <option value={currentWeekKey} className="bg-gray-900">Semaine actuelle ({selectedWeek})</option>
                            {Array.from(new Set(bookings.map(b => b.weekKey))).sort().reverse().map(wk => (
                                <option key={wk} value={wk} className="bg-gray-900">{formatWeekLabel(wk)}</option>
                            ))}
                        </select>
                    )}

                    {filterType === 'month' && (
                        <>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                            >
                                {months.map((m, i) => (
                                    <option key={i} value={i} className="bg-gray-900">{m}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/40"
                            >
                                {availableYears.map(y => (
                                    <option key={y} value={y} className="bg-gray-900">{y}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {filterType === 'year' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/40 lg:col-span-2"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y} className="bg-gray-900">{y}</option>
                            ))}
                        </select>
                    )}

                    {/* Project Filter */}
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className={`bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-white/40 ${filterType === 'all' || filterType === 'week' ? 'sm:col-span-3 lg:col-span-3' : 'lg:col-span-1'}`}
                    >
                        <option value="all" className="bg-gray-900">Tous les projets</option>
                        {projectsData.map(p => (
                            <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Heures totales</p>
                    <p className="text-3xl font-black text-white mt-1">{totalPeriodHours} <span className="text-lg text-white/40 font-medium">h</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">Membres actifs</p>
                    <p className="text-3xl font-black text-white mt-1">{recapData.length}</p>
                </div>
            </div>

            {/* List */}
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wide mb-3">
                Détail par membre
            </h3>
            
            {recapData.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center rounded-2xl bg-white/5 border border-white/10">
                    <FileText size={40} className="text-white/20 mb-3" />
                    <p className="text-white/50 font-medium">Aucune heure validée pour ces critères.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recapData.map((u, i) => (
                        <motion.div
                            key={u.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xs">
                                        {u.name.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-white">{u.name}</p>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                                    {u.totalHours} h
                                </div>
                            </div>
                            
                            {selectedProjectId === 'all' && Object.keys(u.byProject).length > 0 && (
                                <div className="mt-3 pl-11 space-y-1.5">
                                    {Object.entries(u.byProject).map(([pId, hrs]) => {
                                        const p = projectsData.find(proj => proj.id === Number(pId));
                                        return (
                                            <div key={pId} className="flex items-center justify-between text-xs">
                                                <span className="text-white/50 flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-white/30" />
                                                    {p?.name}
                                                </span>
                                                <span className="text-white/70 font-medium">{hrs} h</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

        </PlanningLayout>
    );
}
