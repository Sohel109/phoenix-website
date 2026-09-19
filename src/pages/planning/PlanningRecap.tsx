import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Filter, ShieldCheck, Plus, Clock, X, Trash2, History, AlertCircle, CheckCircle, GraduationCap, Search, ArrowUpDown, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { timeSlots, getSlotDuration, getWeekStartDate, formatWeekLabel } from '../../data/planningData';

export function PlanningRecap() {
    const { currentUser, bookings, currentWeekKey, manualHours, addManualHours, deleteManualHours, allUsers, isQuotaExempt, toggleQuotaExemption } = usePlanning();
    const [filterType, setFilterType] = useState<'week' | 'month' | 'year' | 'all'>('all');
    const [selectedWeek, setSelectedWeek] = useState(currentWeekKey);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [selectedProjectId, setSelectedProjectId] = useState<number | 'all'>('all');
    const [showAllMembers, setShowAllMembers] = useState(true);

    // Recherche par nom et tri des bénévoles
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'alpha-asc' | 'alpha-desc' | 'hours-desc' | 'hours-asc'>('alpha-asc');

    // États du module d'heures manuelles (Bureau)
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isCustomMember, setIsCustomMember] = useState(false);
    const [customMemberName, setCustomMemberName] = useState('');
    const [manualHoursInput, setManualHoursInput] = useState('5');
    const [manualReasonInput, setManualReasonInput] = useState('');
    const [selectedManualProject, setSelectedManualProject] = useState<string>('general');
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [manualSuccessToast, setManualSuccessToast] = useState('');

    const isBureau = currentUser?.role === 'bureau';
    const isAuthorized = Boolean(currentUser && (currentUser.role === 'chef_projet' || isBureau));

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    // Obtenir toutes les années uniques des bookings
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        years.add(new Date().getFullYear());
        bookings.forEach(b => {
            const y = parseInt(b.weekKey.split('-')[0], 10);
            if (!isNaN(y)) years.add(y);
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [bookings]);

    // Calculer les heures consolidées (créneaux de planning + heures manuelles bureau)
    const recapData = useMemo(() => {
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
        const userStats: Record<string, { id: string, name: string, totalHours: number, slotHours: number, manualHoursCount: number, byProject: Record<number, number> }> = {};
        
        filteredBookings.forEach(b => {
            const slot = timeSlots.find(s => s.id === b.slotId)!;
            const duration = getSlotDuration(slot);
            const userName = b.userName || b.userId;
            
            if (!userStats[b.userId]) {
                userStats[b.userId] = { id: b.userId, name: userName, totalHours: 0, slotHours: 0, manualHoursCount: 0, byProject: {} };
            }
            
            userStats[b.userId].totalHours += duration;
            userStats[b.userId].slotHours += duration;
            userStats[b.userId].byProject[slot.projectId] = (userStats[b.userId].byProject[slot.projectId] || 0) + duration;
        });

        // Intégrer les heures manuelles accordées par le Bureau
        manualHours.forEach(mh => {
            if (!userStats[mh.userId]) {
                userStats[mh.userId] = { id: mh.userId, name: mh.userName || mh.userId, totalHours: 0, slotHours: 0, manualHoursCount: 0, byProject: {} };
            }
            userStats[mh.userId].totalHours += mh.hours;
            userStats[mh.userId].manualHoursCount += mh.hours;
            if (mh.projectId) {
                userStats[mh.userId].byProject[mh.projectId] = (userStats[mh.userId].byProject[mh.projectId] || 0) + mh.hours;
            }
        });

        // Si showAllMembers est activé, ajouter tous les membres de l'association à 0h
        if (showAllMembers) {
            (allUsers || []).forEach(u => {
                const cleanedName = u.name.replace(/\t/g, '').trim();
                if (!userStats[u.id]) {
                    userStats[u.id] = { id: u.id, name: cleanedName, totalHours: 0, slotHours: 0, manualHoursCount: 0, byProject: {} };
                }
            });
        }

        return Object.values(userStats).sort((a, b) => {
            if (b.totalHours !== a.totalHours) return b.totalHours - a.totalHours;
            return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
        });
    }, [bookings, manualHours, filterType, selectedWeek, selectedMonth, selectedYear, selectedProjectId, showAllMembers, allUsers]);

    // Bénévoles filtrés par recherche et triés dynamiquement
    const displayedMembers = useMemo(() => {
        let list = [...recapData];

        // 1. Recherche par nom ou prénom (insensible à la casse et aux accents)
        if (searchQuery.trim()) {
            const queryNorm = searchQuery.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            list = list.filter(u => {
                const nameNorm = u.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                return nameNorm.includes(queryNorm);
            });
        }

        // 2. Tri dynamique
        list.sort((a, b) => {
            if (sortBy === 'alpha-asc') {
                return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
            }
            if (sortBy === 'alpha-desc') {
                return b.name.localeCompare(a.name, 'fr', { sensitivity: 'base' });
            }
            if (sortBy === 'hours-desc') {
                if (b.totalHours !== a.totalHours) return b.totalHours - a.totalHours;
                return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
            }
            if (sortBy === 'hours-asc') {
                if (a.totalHours !== b.totalHours) return a.totalHours - b.totalHours;
                return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
            }
            return 0;
        });

        return list;
    }, [recapData, searchQuery, sortBy]);

    // Membres disponibles pour la sélection dans le modal d'ajout d'heures (Tous les membres de l'association)
    const memberOptions = useMemo(() => {
        const map = new Map<string, string>();

        // 1. Tous les membres officiels de l'association
        (allUsers || []).forEach(u => {
            if (u.id && u.name) map.set(u.id, u.name.replace(/\t/g, '').trim());
        });

        // 2. Membres ayant des créneaux
        bookings.forEach(b => {
            if (b.userId && b.userName) map.set(b.userId, b.userName.trim());
        });

        // 3. Utilisateur courant
        if (currentUser) {
            map.set(currentUser.id, currentUser.name.trim());
        }

        // 4. Membres ayant déjà des heures manuelles
        manualHours.forEach(m => {
            if (m.userId && m.userName) map.set(m.userId, m.userName.trim());
        });

        return Array.from(map.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    }, [allUsers, bookings, currentUser, manualHours]);

    const totalPeriodHours = recapData.reduce((acc, u) => acc + u.totalHours, 0);

    const handleDownload = () => {
        let content = "Récapitulatif des heures Phoenix EDC\n";
        content += "====================================\n\n";
        
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
        
        content += "\n--- DÉTAIL PAR MEMBRE (SEUIL OFFICIEL : 50H) ---\n";
        if (displayedMembers.length === 0) {
            content += "Aucun membre trouvé pour ces critères.\n";
        } else {
            displayedMembers.forEach(u => {
                const statutAttestation = u.totalHours >= 50 ? "[ATTESTATION VALIDÉE (50h+)]" : `[EN COURS : ${u.totalHours}/50h]`;
                content += `${u.name} : ${u.totalHours} heure(s) ${statutAttestation}\n`;
                if (u.manualHoursCount > 0) {
                    content += `  - Dont valorisations Bureau : +${u.manualHoursCount}h\n`;
                }
                if (selectedProjectId === 'all') {
                    Object.entries(u.byProject).forEach(([pId, hrs]) => {
                        const pName = projectsData.find(p => p.id === Number(pId))?.name || 'Inconnu';
                        content += `    • ${pName} : ${hrs} h\n`;
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

    // Soumission du formulaire d'heures manuelles
    const handleAddManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let targetId = selectedUserId;
        let targetName = '';

        if (isCustomMember) {
            if (!customMemberName.trim()) {
                alert('Veuillez saisir le prénom et le nom du membre.');
                return;
            }
            targetName = customMemberName.trim();
            targetId = `custom-${targetName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        } else {
            if (!selectedUserId) {
                alert('Veuillez sélectionner un membre bénéficiaire.');
                return;
            }
            const targetMember = memberOptions.find(m => m.id === selectedUserId);
            targetName = targetMember ? targetMember.name : selectedUserId;
        }

        const hoursNum = parseFloat(manualHoursInput);
        if (isNaN(hoursNum) || hoursNum <= 0) {
            alert('Veuillez saisir un nombre d\'heures valide.');
            return;
        }
        if (!manualReasonInput.trim() || manualReasonInput.trim().length < 8) {
            alert('La justification écrite est obligatoire (minimum 8 caractères) pour consigner l\'attribution au registre.');
            return;
        }

        setIsSubmittingManual(true);

        const success = await addManualHours(
            targetId,
            targetName,
            hoursNum,
            manualReasonInput.trim(),
            selectedManualProject === 'general' ? undefined : Number(selectedManualProject)
        );

        setIsSubmittingManual(false);
        if (success) {
            setShowAddModal(false);
            setManualReasonInput('');
            setManualHoursInput('5');
            setIsCustomMember(false);
            setCustomMemberName('');
            setManualSuccessToast(`✅ +${hoursNum}h créditées à ${targetName} avec justification enregistrée !`);
            setTimeout(() => setManualSuccessToast(''), 4500);
        } else {
            alert("Erreur lors de l'enregistrement des heures.");
        }
    };

    if (!isAuthorized) {
        return (
            <PlanningLayout title="Récapitulatif">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShieldCheck size={48} className="text-white/20 mb-4" />
                    <p className="text-white font-bold text-lg font-school">Accès restreint</p>
                    <p className="text-white/40 text-sm mt-1">Cette page est réservée aux responsables de projet et au Bureau.</p>
                </div>
            </PlanningLayout>
        );
    }

    return (
        <PlanningLayout title="Récapitulatif">
            {/* Toast de succès */}
            {manualSuccessToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#2D0A32] border border-[#EC602B] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium">{manualSuccessToast}</span>
                </div>
            )}

            {/* En-tête de la page */}
            <div className="mb-6 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-display text-white tracking-wide">Récapitulatif des heures</h1>
                    <p className="text-[#ECDDFD]/70 text-sm mt-1">
                        Suivi des heures validées et avancement vers le seuil officiel de <strong>50 heures</strong>.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Boutons Bureau : Ajout manuel & Historique des justifications */}
                    {isBureau && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    setIsCustomMember(false);
                                    setCustomMemberName('');
                                    if (memberOptions.length > 0 && !selectedUserId) {
                                        setSelectedUserId(memberOptions[0].id);
                                    }
                                    setShowAddModal(true);
                                }}
                                className="btn-phoenix-gradient flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-white font-school text-xs uppercase tracking-wider shadow-soft transition-all cursor-pointer"
                                title="Créditer des heures manuelles avec justification écrite obligatoire"
                            >
                                <Plus size={15} />
                                <span>Ajouter des heures (Bureau)</span>
                            </motion.button>

                            {manualHours.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(true)}
                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] font-school text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/10"
                                    title="Consulter l'historique des justifications écrites"
                                >
                                    <History size={14} />
                                    <span>Justifications ({manualHours.length})</span>
                                </button>
                            )}
                        </>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#6F2B75]/40 hover:bg-[#6F2B75]/70 border border-[#ECDDFD]/30 text-white font-school text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                        <Download size={15} />
                        <span>Télécharger</span>
                    </motion.button>
                </div>
            </div>

            {/* Filtres */}
            <div className="p-6 rounded-[2.5rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 mb-6 backdrop-blur-md shadow-soft-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-[#EC602B]" />
                        <span className="text-xs font-school font-bold text-[#ECDDFD]/80 uppercase tracking-widest">Filtres de période</span>
                    </div>

                    {/* Toggle Tous les membres de l'association */}
                    {isBureau && (
                        <button
                            type="button"
                            onClick={() => setShowAllMembers(!showAllMembers)}
                            className={`px-4 py-1.5 rounded-full text-xs font-school uppercase tracking-wider transition-all cursor-pointer border self-start sm:self-auto ${
                                showAllMembers
                                    ? 'bg-[#EC602B]/20 text-[#EC602B] border-[#EC602B]/50 font-bold'
                                    : 'bg-white/5 text-[#ECDDFD]/60 border-white/10 hover:text-white'
                            }`}
                            title="Afficher tous les membres de l'association ou uniquement ceux ayant des heures"
                        >
                            {showAllMembers ? 'Affichage : Tous les membres (y compris 0h)' : 'Affichage : Membres avec heures uniquement'}
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Filter Type */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as 'week' | 'month' | 'year' | 'all')}
                        className="bg-[#1F0422]/80 border border-[#6F2B75]/50 rounded-full px-4 py-2.5 text-white text-xs font-school uppercase tracking-wider outline-none focus:border-[#EC602B] cursor-pointer"
                    >
                        <option value="all" className="bg-[#2D0A32]">Toutes les dates</option>
                        <option value="year" className="bg-[#2D0A32]">Par année</option>
                        <option value="month" className="bg-[#2D0A32]">Par mois</option>
                        <option value="week" className="bg-[#2D0A32]">Par semaine</option>
                    </select>

                    {/* Conditional Date Filters */}
                    {filterType === 'week' && (
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="bg-[#1F0422]/80 border border-[#6F2B75]/50 rounded-full px-4 py-2.5 text-white text-xs font-school uppercase tracking-wider outline-none focus:border-[#EC602B] cursor-pointer"
                        >
                            <option value={currentWeekKey} className="bg-[#2D0A32]">Semaine actuelle ({selectedWeek})</option>
                            {Array.from(new Set(bookings.map(b => b.weekKey))).sort().reverse().map(wk => (
                                <option key={wk} value={wk} className="bg-[#2D0A32]">{formatWeekLabel(wk)}</option>
                            ))}
                        </select>
                    )}

                    {filterType === 'month' && (
                        <>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="bg-[#1F0422]/80 border border-[#6F2B75]/50 rounded-full px-4 py-2.5 text-white text-xs font-school uppercase tracking-wider outline-none focus:border-[#EC602B] cursor-pointer"
                            >
                                {months.map((m, idx) => (
                                    <option key={m} value={idx} className="bg-[#2D0A32]">{m}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-[#1F0422]/80 border border-[#6F2B75]/50 rounded-full px-4 py-2.5 text-white text-xs font-school uppercase tracking-wider outline-none focus:border-[#EC602B] cursor-pointer"
                            >
                                {availableYears.map(y => (
                                    <option key={y} value={y} className="bg-[#2D0A32]">{y}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {filterType === 'year' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="bg-[#1F0422]/80 border border-[#6F2B75]/50 rounded-full px-4 py-2.5 text-white text-xs font-school uppercase tracking-wider outline-none focus:border-[#EC602B] cursor-pointer"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y} className="bg-[#2D0A32]">{y}</option>
                            ))}
                        </select>
                    )}

                    {/* Project Filter */}
                    <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="bg-[#1F0422]/80 border border-[#6F2B75]/50 rounded-full px-4 py-2.5 text-white text-xs font-school uppercase tracking-wider outline-none focus:border-[#EC602B] cursor-pointer"
                    >
                        <option value="all" className="bg-[#2D0A32]">Tous les projets</option>
                        {projectsData.map(p => (
                            <option key={p.id} value={p.id} className="bg-[#2D0A32]">{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft">
                    <p className="text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 font-semibold">Total période</p>
                    <p className="text-3xl font-display text-white mt-1 tabular-nums">
                        {totalPeriodHours}<span className="text-lg text-[#EC602B] font-school ml-1">h</span>
                    </p>
                </div>

                <div className="p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft">
                    <p className="text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 font-semibold">Bénévoles actifs</p>
                    <p className="text-3xl font-display text-white mt-1 tabular-nums">
                        {recapData.length}
                    </p>
                </div>

                <div className="p-5 rounded-[2rem] bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft">
                    <p className="text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 font-semibold">Attestations validées (≥ 50h ou N-1)</p>
                    <p className="text-3xl font-display text-emerald-400 mt-1 tabular-nums">
                        {recapData.filter(u => u.totalHours >= 50 || isQuotaExempt(u.id)).length}
                        <span className="text-xs font-school text-[#ECDDFD]/60 ml-2 font-normal">/ {recapData.length}</span>
                    </p>
                </div>
            </div>

            {/* Titre & Barre de Recherche et Tri */}
            <div className="space-y-3 mb-4">
                {/* En-tête de section avec compteurs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <span className="font-school text-xs uppercase tracking-widest text-[#ECDDFD]/80 font-bold">
                            Détail par bénévole
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#6F2B75]/40 border border-[#6F2B75]/60 text-[11px] font-mono text-[#ECDDFD] tabular-nums font-semibold">
                            {displayedMembers.length} {displayedMembers.length > 1 ? 'bénévoles' : 'bénévole'}
                            {searchQuery.trim() && ` (sur ${recapData.length})`}
                        </span>
                    </div>
                    <span className="text-[11px] text-[#ECDDFD]/50 font-mono hidden sm:inline">
                        Seuil d'attestation : 50 heures (ou Quota N-1 validé)
                    </span>
                </div>

                {/* Barre de Recherche & Tri */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-[1.75rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30">
                    {/* Recherche par nom / prénom */}
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/50 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par nom ou prénom..."
                            className="w-full bg-[#1F0422]/90 border border-[#6F2B75]/50 focus:border-[#EC602B] rounded-full pl-9 pr-9 py-2 text-xs text-white placeholder-[#ECDDFD]/40 outline-none transition-all focus:ring-1 focus:ring-[#EC602B]"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                                title="Effacer la recherche"
                                aria-label="Effacer la recherche"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Contrôles de Tri */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:flex-initial">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="w-full appearance-none bg-[#1F0422]/90 border border-[#6F2B75]/50 hover:border-[#EC602B]/60 focus:border-[#EC602B] rounded-full pl-3.5 pr-8 py-2 text-xs text-white font-school uppercase tracking-wider outline-none cursor-pointer transition-all"
                                aria-label="Trier les bénévoles"
                            >
                                <option value="alpha-asc" className="bg-[#2D0A32]">Nom : A → Z (Alphabétique)</option>
                                <option value="alpha-desc" className="bg-[#2D0A32]">Nom : Z → A</option>
                                <option value="hours-desc" className="bg-[#2D0A32]">Heures : Du + au -</option>
                                <option value="hours-asc" className="bg-[#2D0A32]">Heures : Du - au +</option>
                            </select>
                            <ArrowUpDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ECDDFD]/60 pointer-events-none" />
                        </div>

                        {/* Bouton rapide de bascule A-Z / Z-A */}
                        <button
                            type="button"
                            onClick={() => {
                                if (sortBy === 'alpha-asc') setSortBy('alpha-desc');
                                else setSortBy('alpha-asc');
                            }}
                            className={`min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-school uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 active:scale-95 ${
                                sortBy === 'alpha-asc' || sortBy === 'alpha-desc'
                                    ? 'bg-[#EC602B]/20 text-[#EC602B] border-[#EC602B]/50'
                                    : 'bg-white/5 text-[#ECDDFD]/60 border-white/10 hover:text-white'
                            }`}
                            title={sortBy === 'alpha-asc' ? 'Tri alphabétique A → Z actif. Cliquer pour inverser (Z → A)' : 'Trier par ordre alphabétique'}
                        >
                            {sortBy === 'alpha-desc' ? <ArrowUpZA size={14} /> : <ArrowDownAZ size={14} />}
                            <span className="hidden xs:inline">{sortBy === 'alpha-desc' ? 'Z → A' : 'A → Z'}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {displayedMembers.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center rounded-[2rem] bg-[#2D0A32]/60 border border-[#6F2B75]/30 p-6">
                    <FileText size={40} className="text-[#ECDDFD]/30 mb-3" />
                    {searchQuery.trim() ? (
                        <>
                            <p className="text-white font-medium text-sm">
                                Aucun bénévole ne correspond à « <span className="text-[#EC602B] font-bold">{searchQuery}</span> »
                            </p>
                            <p className="text-xs text-[#ECDDFD]/60 mt-1">
                                Vérifiez l'orthographe ou réinitialisez le filtre de recherche.
                            </p>
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="mt-4 px-4 py-2 rounded-full bg-[#EC602B]/20 text-[#EC602B] hover:bg-[#EC602B]/30 border border-[#EC602B]/50 text-xs font-school uppercase tracking-wider font-bold transition-all cursor-pointer active:scale-95"
                            >
                                Effacer la recherche
                            </button>
                        </>
                    ) : (
                        <p className="text-[#ECDDFD]/60 font-medium">Aucune heure validée pour ces critères.</p>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {displayedMembers.map((u, i) => {
                        const isExempt = isQuotaExempt(u.id);
                        return (
                            <motion.div
                                key={u.id || u.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="p-5 rounded-[2rem] bg-[#2D0A32]/80 border border-[#6F2B75]/30 hover:border-[#6F2B75]/60 transition-all shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] flex items-center justify-center text-white font-bold text-xs shadow-soft shrink-0">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white tracking-wide">{u.name}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                {isExempt ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-school uppercase tracking-wider font-bold flex items-center gap-1">
                                                        <GraduationCap size={12} />
                                                        <span>Quota N-1 Validé · Renouvelant</span>
                                                    </span>
                                                ) : (
                                                    <span className={`text-[10px] font-school uppercase tracking-wider font-bold ${
                                                        u.totalHours >= 50 ? 'text-emerald-400' : 'text-amber-300'
                                                    }`}>
                                                        {u.totalHours >= 50
                                                            ? '✅ Seuil 50h atteint (Attestation Validée)'
                                                            : `⏳ ${u.totalHours}/50h (Reste ${Math.max(0, 50 - u.totalHours)}h)`}
                                                    </span>
                                                )}

                                                {u.manualHoursCount > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full bg-[#EC602B]/20 border border-[#EC602B]/40 text-[#EC602B] text-[10px] font-school uppercase tracking-wider font-bold">
                                                        +{u.manualHoursCount}h valorisées
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                                        {isBureau && (
                                            <>
                                                {/* Bouton de validation / bascule Quota N-1 pour membre renouvelant */}
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const newStatus = !isExempt;
                                                        const confirmMsg = newStatus
                                                            ? `Confirmer que ${u.name} a déjà validé son quota de 50h l'année dernière (Membre renouvelant) ?`
                                                            : `Retirer le statut renouvelant (quota N-1) de ${u.name} ?`;
                                                        if (window.confirm(confirmMsg)) {
                                                            await toggleQuotaExemption(u.id, u.name, newStatus);
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-school uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1 border active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                                                        isExempt
                                                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                                                            : 'bg-white/5 text-[#ECDDFD]/60 border-white/10 hover:border-purple-400/50 hover:text-purple-300'
                                                    }`}
                                                    title={isExempt ? "Cliquer pour retirer la validation N-1" : "Valider le quota 50h acquis l'an dernier"}
                                                >
                                                    <GraduationCap size={13} />
                                                    <span>{isExempt ? 'Quota N-1 Acquis' : 'Valider N-1'}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomMember(false);
                                                        setCustomMemberName('');
                                                        setSelectedUserId(u.id);
                                                        setShowAddModal(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-full bg-[#EC602B]/15 hover:bg-[#EC602B]/30 border border-[#EC602B]/40 text-[#EC602B] text-xs font-school uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                                                    title={`Ajouter des heures manuelles à ${u.name}`}
                                                >
                                                    <Plus size={13} />
                                                    <span>+ Heures</span>
                                                </button>
                                            </>
                                        )}

                                        <div className={`px-4 py-1.5 rounded-full border font-school font-bold text-sm tabular-nums ${
                                            isExempt || u.totalHours >= 50
                                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                : 'bg-[#6F2B75]/40 border-[#ECDDFD]/30 text-white'
                                        }`}>
                                            {u.totalHours} h
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Barre de progression vers les 50h */}
                                <div className="w-full h-1.5 rounded-full bg-[#1F0422] overflow-hidden my-2.5">
                                    <div
                                        className={`h-full rounded-full transition-all ${
                                            isExempt
                                                ? 'bg-gradient-to-r from-purple-500 to-indigo-400'
                                                : u.totalHours >= 50
                                                ? 'bg-emerald-500'
                                                : 'bg-gradient-to-r from-[#6F2B75] to-[#EC602B]'
                                        }`}
                                        style={{ width: `${isExempt ? 100 : Math.min(100, (u.totalHours / 50) * 100)}%` }}
                                    />
                                </div>

                            {/* Détail par projet */}
                            {selectedProjectId === 'all' && Object.keys(u.byProject).length > 0 && (
                                <div className="mt-2 pl-2 sm:pl-12 space-y-1.5 border-t border-[#6F2B75]/20 pt-2">
                                    {Object.entries(u.byProject).map(([pId, hrs]) => {
                                        const p = projectsData.find(proj => proj.id === Number(pId));
                                        return (
                                            <div key={pId} className="flex items-center justify-between text-xs">
                                                <span className="text-[#ECDDFD]/60 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#EC602B]" />
                                                    <span>{p?.name || 'Projet'}</span>
                                                </span>
                                                <span className="font-mono tabular-nums text-white/80">{hrs}h</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
                </div>
            )}

            {/* Modal d'ajout d'heures manuelles (Bureau uniquement) */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#2D0A32] text-white rounded-[2.5rem] max-w-lg w-full p-6 sm:p-8 border border-[#6F2B75]/50 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#6F2B75]/40">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] flex items-center justify-center text-white shadow-soft">
                                        <Clock size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-display text-white">Ajout d'heures manuelles</h3>
                                        <p className="text-[11px] text-[#ECDDFD]/60 font-school uppercase tracking-wider">Réservé aux membres du Bureau</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
                                    aria-label="Fermer la boîte de dialogue"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleAddManualSubmit} className="space-y-4 text-xs font-sans">
                                {/* Bénéficiaire */}
                                <div>
                                    <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5 font-bold">
                                        Membre bénéficiaire *
                                    </label>
                                    <select
                                        value={isCustomMember ? '__custom__' : selectedUserId}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                setIsCustomMember(true);
                                                setSelectedUserId('');
                                            } else {
                                                setIsCustomMember(false);
                                                setSelectedUserId(e.target.value);
                                            }
                                        }}
                                        required={!isCustomMember}
                                        className="w-full bg-[#1F0422] border border-[#6F2B75]/50 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#EC602B] transition-all cursor-pointer font-sans"
                                    >
                                        <option value="" disabled>Sélectionnez un membre ({memberOptions.length} membres disponibles)</option>
                                        {memberOptions.map(m => (
                                            <option key={m.id} value={m.id} className="bg-[#2D0A32]">
                                                {m.name} {currentUser?.id === m.id ? '(Vous)' : ''}
                                            </option>
                                        ))}
                                        <option value="__custom__" className="bg-[#2D0A32] text-[#EC602B] font-bold">
                                            ➕ Autre membre (saisie manuelle du prénom & nom)...
                                        </option>
                                    </select>

                                    {isCustomMember && (
                                        <div className="mt-3 p-3.5 rounded-2xl bg-[#1F0422] border border-[#EC602B]/60 space-y-2">
                                            <label className="block text-[11px] font-school uppercase tracking-wider text-[#EC602B] font-bold">
                                                Prénom et Nom du membre bénéficiaire *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={customMemberName}
                                                onChange={(e) => setCustomMemberName(e.target.value)}
                                                placeholder="Ex: Clara Martin"
                                                className="w-full bg-[#2D0A32] border border-white/20 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-[#EC602B]"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomMember(false);
                                                    if (memberOptions.length > 0) setSelectedUserId(memberOptions[0].id);
                                                }}
                                                className="text-[11px] text-[#ECDDFD]/60 hover:text-white underline cursor-pointer"
                                            >
                                                Annuler et choisir un membre dans la liste officielle
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Nombre d'heures */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5 font-bold">
                                            Nombre d'heures *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0.5"
                                            max="50"
                                            required
                                            value={manualHoursInput}
                                            onChange={(e) => setManualHoursInput(e.target.value)}
                                            placeholder="Ex: 5"
                                            className="w-full bg-[#1F0422] border border-[#6F2B75]/50 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#EC602B] transition-all font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5 font-bold">
                                            Projet rattaché
                                        </label>
                                        <select
                                            value={selectedManualProject}
                                            onChange={(e) => setSelectedManualProject(e.target.value)}
                                            className="w-full bg-[#1F0422] border border-[#6F2B75]/50 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#EC602B] transition-all cursor-pointer font-sans"
                                        >
                                            <option value="general" className="bg-[#2D0A32]">Mission Générale / Bureau</option>
                                            {projectsData.map(p => (
                                                <option key={p.id} value={p.id} className="bg-[#2D0A32]">{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Justification écrite obligatoire */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 font-bold">
                                            Justification écrite obligatoire *
                                        </label>
                                        <span className="text-[10px] text-amber-400 font-school">Min. 8 caractères</span>
                                    </div>
                                    <textarea
                                        required
                                        minLength={8}
                                        rows={3}
                                        value={manualReasonInput}
                                        onChange={(e) => setManualReasonInput(e.target.value)}
                                        placeholder="Ex: Participation active à l'organisation des Olympiades tout le weekend, création des supports pédagogiques, remplacement d'urgence..."
                                        className="w-full bg-[#1F0422] border border-[#6F2B75]/50 rounded-2xl p-3 text-white placeholder-white/25 focus:outline-none focus:border-[#EC602B] transition-all resize-none leading-relaxed"
                                    />
                                </div>

                                {/* Notice de transparence */}
                                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200">
                                    <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Règle de traçabilité et de transparence :</p>
                                        <p className="text-amber-200/80 mt-0.5">
                                            Ce motif sera consigné dans le registre officiel de l'association, signé par <strong>{currentUser?.name}</strong>, et imprimé sur l'attestation finale du membre.
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-3 border-t border-[#6F2B75]/30 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="min-h-[44px] px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] font-school uppercase tracking-wider transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingManual}
                                        className="btn-phoenix-gradient min-h-[44px] px-5 py-2 rounded-full text-white font-school uppercase tracking-wider font-bold shadow-soft transition-all active:scale-95 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                                    >
                                        {isSubmittingManual ? 'Enregistrement...' : 'Valider l\'attribution'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── MODAL : HISTORIQUE DES HEURES MANUELLES ACCORDÉES (BUREAU) ───── */}
            <AnimatePresence>
                {showHistoryModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-[#2D0A32] text-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 border border-[#6F2B75]/50 shadow-2xl relative max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#6F2B75]/40 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] flex items-center justify-center text-white shadow-soft">
                                        <History size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-display text-white">Registre des valorisations manuelles</h3>
                                        <p className="text-[11px] text-[#ECDDFD]/60 font-school uppercase tracking-wider">
                                            {manualHours.length} attribution{manualHours.length > 1 ? 's' : ''} consignée{manualHours.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(false)}
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer"
                                    aria-label="Fermer la boîte de dialogue"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                                {manualHours.length === 0 ? (
                                    <p className="text-center py-8 text-[#ECDDFD]/60 text-xs">Aucune heure manuelle enregistrée.</p>
                                ) : (
                                    manualHours.map((mh) => (
                                        <div
                                            key={mh.id}
                                            className="p-4 rounded-2xl bg-[#1F0422]/80 border border-[#6F2B75]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm">{mh.userName}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] tabular-nums">
                                                        +{mh.hours} h
                                                    </span>
                                                </div>
                                                <p className="text-[#ECDDFD]/90 font-medium italic">
                                                    « {mh.reason} »
                                                </p>
                                                <p className="text-[10px] text-[#ECDDFD]/50 font-mono">
                                                    Accordé par {mh.grantedBy} · {new Date(mh.createdAt).toLocaleString('fr-FR')}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`Supprimer cette attribution de ${mh.hours}h accordée à ${mh.userName} ?`)) {
                                                        deleteManualHours(mh.id);
                                                    }
                                                }}
                                                className="self-end sm:self-center w-11 h-11 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all active:scale-95 cursor-pointer shrink-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                                                title="Révoquer cette attribution"
                                                aria-label={`Révoquer l'attribution de ${mh.hours} heures à ${mh.userName}`}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-4 border-t border-[#6F2B75]/30 flex justify-end shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowHistoryModal(false)}
                                    className="min-h-[44px] px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] font-school uppercase tracking-wider text-xs transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PlanningLayout>
    );
}
