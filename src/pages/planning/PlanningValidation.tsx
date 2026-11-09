import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Users, ShieldCheck, LoaderCircle, Check, ChevronDown, X, CheckCheck } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { PlanningPageHeader } from '../../components/planning/PlanningPageHeader';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { formatWeekLabel, navigateWeek } from '../../data/planningData';
import { groupValidationSessions, type ValidationSession } from '../../data/validationSessions';
import { SlotPlacementPanel } from '../../components/planning/SlotPlacementPanel';
import { SessionsManager } from '../../components/planning/SessionsManager';

const PROJECT_NAMES: Record<number, string> = Object.fromEntries(projectsData.map((p) => [p.id, p.name]));

interface BulkTarget {
    session: ValidationSession;
}

export function PlanningValidation() {
    const { currentUser, currentWeekKey, setCurrentWeekKey, bookings, validatePresence, markAbsent, resetValidation, isPending, placeMembers, unplaceMember, allUsers, slotsForWeek, allSlots } = usePlanning();
    const [bulkTarget, setBulkTarget] = useState<BulkTarget | null>(null);
    const [bulkRunning, setBulkRunning] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [view, setView] = useState<'validate' | 'place' | 'sessions'>('validate');
    const [projectFilter, setProjectFilter] = useState<number | 'all'>('all');
    const [openDone, setOpenDone] = useState<Set<string>>(new Set());

    const isBureau = currentUser?.role === 'bureau';
    const allowed = !!currentUser && (currentUser.role === 'chef_projet' || isBureau);

    // Séances de mes projets (tous les projets pour le Bureau ou un responsable sans projet rattaché).
    // Pour valider on prend toutes les séances connues : une réservation déjà faite ne disparaît pas parce que
    // l'alternance ou une annulation a changé.
    const myProjectIds = useMemo(() => (currentUser?.projectIds || []).map(Number), [currentUser]);
    const seesAllProjects = isBureau || myProjectIds.length === 0;
    const mySlots = useMemo(
        () => (seesAllProjects ? allSlots : allSlots.filter((s) => myProjectIds.includes(Number(s.projectId)))),
        [allSlots, seesAllProjects, myProjectIds]
    );
    // Projets dont cette personne gère les séances : tous pour le Bureau, sinon les siens.
    const managedProjectIds = useMemo(() => (seesAllProjects ? projectsData.map((p) => p.id) : myProjectIds), [seesAllProjects, myProjectIds]);
    // Pour placer des membres, seulement les séances qui ont lieu cette semaine.
    const placementSlots = useMemo(
        () => (seesAllProjects ? slotsForWeek(currentWeekKey) : slotsForWeek(currentWeekKey).filter((s) => myProjectIds.includes(Number(s.projectId)))),
        [seesAllProjects, slotsForWeek, currentWeekKey, myProjectIds]
    );

    const allSessions = useMemo(
        () => groupValidationSessions({ bookings, slots: mySlots, weekKey: currentWeekKey, projectNames: PROJECT_NAMES }),
        [bookings, mySlots, currentWeekKey]
    );

    // Pastilles de filtre : un projet par ligne, avec le nombre de présences à valider
    const projectChips = useMemo(() => {
        const map = new Map<number, { id: number; name: string; pending: number }>();
        for (const s of allSessions) {
            const entry = map.get(s.projectId) ?? { id: s.projectId, name: s.projectName, pending: 0 };
            entry.pending += s.counts.prevu;
            map.set(s.projectId, entry);
        }
        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    }, [allSessions]);

    // Un filtre qui ne correspond à aucune séance de cette semaine retombe sur « Tous »
    const effectiveFilter = projectFilter !== 'all' && projectChips.some((c) => c.id === projectFilter) ? projectFilter : 'all';
    const sessions = effectiveFilter === 'all' ? allSessions : allSessions.filter((s) => s.projectId === effectiveFilter);
    const todoSessions = sessions.filter((s) => !s.done);
    const doneSessions = sessions.filter((s) => s.done);
    const pendingTotal = todoSessions.reduce((n, s) => n + s.counts.prevu, 0);

    if (!allowed) {
        return (
            <PlanningLayout title="Valider les présences">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShieldCheck size={48} className="text-white/20 mb-4" />
                    <p className="text-white font-bold text-lg">Accès restreint</p>
                    <p className="text-white/40 text-sm mt-1">Cette page est réservée aux responsables.</p>
                </div>
            </PlanningLayout>
        );
    }

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleValidate = async (bookingId: string, userName: string) => {
        if (await validatePresence(bookingId)) showToast(`${userName} : présent(e)`);
    };
    const handleAbsent = async (bookingId: string, userName: string) => {
        if (await markAbsent(bookingId)) showToast(`${userName} : absent(e)`);
    };
    const handleReset = async (bookingId: string, userName: string) => {
        if (await resetValidation(bookingId)) showToast(`${userName} : remis en attente`);
    };

    // Une demande après l'autre : le serveur écrit dans un Sheet, pas besoin de le bousculer
    const handleBulkConfirm = async () => {
        if (!bulkTarget) return;
        const ids = bulkTarget.session.pendingIds;
        setBulkRunning(true);
        let ok = 0;
        for (const id of ids) {
            if (await validatePresence(id)) ok += 1;
        }
        setBulkRunning(false);
        setBulkTarget(null);
        showToast(ok === ids.length
            ? `${ok} présence${ok > 1 ? 's' : ''} confirmée${ok > 1 ? 's' : ''}`
            : `${ok} sur ${ids.length} confirmées, réessayez pour les autres`);
    };

    const toggleDone = (slotId: string) =>
        setOpenDone((prev) => {
            const next = new Set(prev);
            if (next.has(slotId)) next.delete(slotId); else next.add(slotId);
            return next;
        });

    const renderSession = (session: ValidationSession, collapsible: boolean) => {
        const expanded = !collapsible || openDone.has(session.slotId);
        const { counts } = session;
        return (
            <section
                key={session.slotId}
                aria-label={`${session.projectName}, ${session.day} ${session.startTime} à ${session.endTime}`}
                className="rounded-2xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg overflow-hidden"
            >
                <header className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg tracking-wide">{session.projectName}</h3>
                        <p className="text-[#ECDDFD]/70 text-sm mt-0.5">{session.day} · {session.startTime} à {session.endTime}</p>
                        <p className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-school uppercase tracking-wider">
                            {counts.prevu > 0 && <span className="px-2.5 py-0.5 rounded-full border border-[#EC602B]/50 bg-[#EC602B]/15 text-[#F9B79A]">{counts.prevu} à valider</span>}
                            {counts.confirme > 0 && <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">{counts.confirme} présent{counts.confirme > 1 ? 's' : ''}</span>}
                            {counts.absent > 0 && <span className="px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/15 text-red-300">{counts.absent} absent{counts.absent > 1 ? 's' : ''}</span>}
                        </p>
                    </div>
                    {session.pendingIds.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => setBulkTarget({ session })}
                            className="min-h-[44px] px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-school text-xs uppercase tracking-wider shadow-soft transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <CheckCheck size={16} />
                            Tout confirmer ({session.pendingIds.length})
                        </button>
                    ) : collapsible ? (
                        <button
                            type="button"
                            onClick={() => toggleDone(session.slotId)}
                            aria-expanded={expanded}
                            className="min-h-[44px] px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#ECDDFD]/80 hover:text-white font-school text-xs uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {expanded ? 'Masquer' : 'Voir'}
                            <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                        </button>
                    ) : null}
                </header>

                {expanded && (
                    <ul className="border-t border-[#6F2B75]/30 divide-y divide-[#6F2B75]/20">
                        {session.members.map((m) => {
                            const loading = isPending(m.bookingId);
                            return (
                                <li key={m.bookingId} className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center font-bold text-sm" aria-hidden="true">
                                            {m.userName.charAt(0)}
                                        </span>
                                        <span className="text-white font-semibold text-sm sm:text-base truncate">{m.userName}</span>
                                    </div>

                                    {loading ? (
                                        <span className="self-end sm:self-auto min-h-[44px] w-11 flex items-center justify-center" role="status" aria-label="Enregistrement en cours">
                                            <LoaderCircle size={18} className="animate-spin text-[#EC602B]" />
                                        </span>
                                    ) : m.status === 'prevu' ? (
                                        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleValidate(m.bookingId, m.userName)}
                                                className="min-h-[44px] sm:px-5 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-100 border border-emerald-400/60 font-school text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <Check size={16} />
                                                Présent
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAbsent(m.bookingId, m.userName)}
                                                className="min-h-[44px] sm:px-5 rounded-full bg-red-600/25 hover:bg-red-600/45 text-red-100 border border-red-400/55 font-school text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                            >
                                                <X size={16} />
                                                Absent
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 self-end sm:self-auto sm:shrink-0">
                                            <span className={`text-xs font-school uppercase tracking-wider px-3 py-1 rounded-full border ${m.status === 'confirme' ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/15' : 'text-red-300 border-red-500/30 bg-red-500/15'}`}>
                                                {m.status === 'confirme' ? 'Présent' : 'Absent'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleReset(m.bookingId, m.userName)}
                                                className="min-h-[44px] px-3 rounded-full text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 hover:text-white hover:bg-white/10 underline underline-offset-4 transition-colors cursor-pointer"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        );
    };

    return (
        <PlanningLayout title="Valider les présences">
            {/* Toast notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        role="status"
                        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs md:text-sm shadow-xl flex items-center gap-2 border border-emerald-400/40"
                    >
                        <Check size={16} />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <PlanningPageHeader
                icon={<CheckCircle size={16} />}
                section="Gestion"
                title="Valider les présences"
                description="Confirmez qui est venu à chaque séance, placez des membres sur les créneaux, ou ajoutez et annulez une séance."
            />

            {/* Week navigator */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg">
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentWeekKey(navigateWeek(currentWeekKey, 'prev'))}
                    aria-label="Semaine précédente"
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
                    aria-label="Semaine suivante"
                    className="w-10 h-10 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white border border-[#ECDDFD]/30 flex items-center justify-center transition-colors shadow-soft"
                >
                    <ChevronRight size={18} />
                </motion.button>
            </div>

            {/* Trois vues : valider les présences, placer des membres sur les créneaux, ou gérer les séances de la semaine */}
            <div role="tablist" aria-label="Que voulez-vous faire ?" className="mb-6 p-1.5 rounded-full bg-[#1F0422]/80 border border-[#6F2B75]/40 flex gap-1.5">
                {([['validate', 'Présences'], ['place', 'Placer des membres'], ['sessions', 'Séances']] as const).map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={view === id}
                        onClick={() => setView(id)}
                        className={`flex-1 min-h-[44px] px-3 rounded-full font-school text-xs uppercase tracking-wider transition-all cursor-pointer ${
                            view === id ? 'btn-phoenix-gradient text-white shadow-soft' : 'text-[#ECDDFD]/70 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {view === 'sessions' ? (
                <SessionsManager
                    weekKey={currentWeekKey}
                    projectIds={managedProjectIds}
                    onNotify={showToast}
                />
            ) : view === 'place' ? (
                <SlotPlacementPanel
                    weekKey={currentWeekKey}
                    slots={placementSlots}
                    bookings={bookings}
                    members={allUsers}
                    onPlace={(slotId, userIds) => placeMembers(slotId, currentWeekKey, userIds)}
                    onUnplace={unplaceMember}
                    onNotify={showToast}
                />
            ) : (
                <>
                    {/* Résumé de la semaine */}
                    <p className="mb-4 text-sm text-[#ECDDFD]/80">
                        {pendingTotal > 0
                            ? <><strong className="text-white">{pendingTotal} présence{pendingTotal > 1 ? 's' : ''} à valider</strong> sur {todoSessions.length} séance{todoSessions.length > 1 ? 's' : ''}.</>
                            : allSessions.length > 0
                                ? 'Tout est à jour pour cette semaine.'
                                : 'Aucune réservation sur cette semaine.'}
                    </p>

                    {/* Filtre par projet, seulement quand il y a plusieurs projets */}
                    {projectChips.length > 1 && (
                        <div role="group" aria-label="Filtrer par projet" className="mb-5 flex flex-wrap gap-2">
                            {([{ id: 'all' as const, name: 'Tous', pending: allSessions.reduce((n, s) => n + s.counts.prevu, 0) }, ...projectChips]).map((chip) => {
                                const active = effectiveFilter === chip.id;
                                return (
                                    <button
                                        key={chip.id}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => setProjectFilter(chip.id)}
                                        className={`min-h-[44px] px-4 rounded-full border text-xs font-school uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer ${
                                            active
                                                ? 'btn-phoenix-gradient text-white border-transparent shadow-soft'
                                                : 'bg-[#2D0A32]/80 border-[#6F2B75]/40 text-[#ECDDFD]/80 hover:text-white hover:border-[#EC602B]/50'
                                        }`}
                                    >
                                        {chip.name}
                                        {chip.pending > 0 && (
                                            <span className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${active ? 'bg-white/25 text-white' : 'bg-[#EC602B] text-white'}`}>
                                                {chip.pending}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {sessions.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center mb-8 rounded-2xl bg-[#2D0A32]/60 border border-[#6F2B75]/30 shadow-soft-lg">
                            <Users size={32} className="text-[#ECDDFD]/30 mb-2" />
                            <p className="text-[#ECDDFD]/60 text-sm">Aucune séance avec des réservations pour cette semaine.</p>
                        </div>
                    ) : (
                        <>
                            {todoSessions.length > 0 && (
                                <div className="space-y-4 mb-8">
                                    {todoSessions.map((s) => renderSession(s, false))}
                                </div>
                            )}
                            {doneSessions.length > 0 && (
                                <>
                                    <h2 className="mb-3 flex items-center gap-3 text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">
                                        Séances terminées ({doneSessions.length})
                                        <span className="h-px flex-1 bg-[#6F2B75]/40" aria-hidden="true" />
                                    </h2>
                                    <div className="space-y-3">
                                        {doneSessions.map((s) => renderSession(s, true))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Confirmation, seulement pour « Tout confirmer » */}
            <AnimatePresence>
                {bulkTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="bulk-title">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm rounded-2xl bg-[#2D0A32] border border-[#6F2B75]/60 p-7 text-center shadow-2xl text-white"
                        >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] flex items-center justify-center mx-auto mb-4 text-white shadow-soft">
                                <CheckCheck size={26} />
                            </div>
                            <h4 id="bulk-title" className="text-lg font-bold text-white mb-2 tracking-wide">Tout confirmer</h4>
                            <p className="text-sm text-[#ECDDFD]/75 mb-6 leading-relaxed">
                                Confirmer la présence des <strong className="text-white">{bulkTarget.session.pendingIds.length} membres</strong> encore en attente pour{' '}
                                <strong className="text-white">{bulkTarget.session.projectName}</strong>, {bulkTarget.session.day} de {bulkTarget.session.startTime} à {bulkTarget.session.endTime} ?
                                Vous pourrez corriger chaque personne ensuite.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBulkTarget(null)}
                                    disabled={bulkRunning}
                                    className="flex-1 min-h-[44px] rounded-full bg-white/10 hover:bg-white/15 text-white font-school uppercase text-xs tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleBulkConfirm}
                                    disabled={bulkRunning}
                                    className="flex-1 min-h-[44px] rounded-full bg-emerald-600 hover:bg-emerald-500 font-school uppercase text-xs tracking-wider text-white transition-colors shadow-soft disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {bulkRunning ? <LoaderCircle size={16} className="animate-spin" /> : null}
                                    Confirmer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PlanningLayout>
    );
}
