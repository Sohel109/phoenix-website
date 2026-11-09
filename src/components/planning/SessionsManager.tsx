import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, CalendarX, RotateCcw, LoaderCircle, Users } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { DAY_ORDER, getWeekStartDate, type TimeSlot } from '../../data/planningData';
import { dayOfDate, weekKeyOfDate } from '../../data/sessionCalendar';
import { AddSessionDialog } from './AddSessionDialog';

interface SessionsManagerProps {
    weekKey: string;
    /** Projets dont l'utilisateur gère les séances (tous pour le Bureau). */
    projectIds: number[];
    onNotify: (message: string) => void;
}

const projectName = (id: number) => projectsData.find((p) => p.id === id)?.name ?? `Projet ${id}`;

/** Date (yyyy-MM-dd) d'une séance pour la semaine affichée : celle d'une séance ajoutée, ou le jour de la règle fixe. */
function dateOfSlot(slot: TimeSlot, weekKey: string): string {
    if (slot.date) return slot.date;
    const start = getWeekStartDate(weekKey);
    start.setDate(start.getDate() + Math.max(0, DAY_ORDER.indexOf(slot.day)));
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
}

const formatDay = (date: string) => {
    const text = new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Ajouter ou annuler une séance à une date, pour les projets de l'utilisateur (le serveur revérifie les droits). */
export function SessionsManager({ weekKey, projectIds, onNotify }: SessionsManagerProps) {
    const { bookings, slotsForWeek, cancelledSlotsForWeek, addSession, cancelSession, restoreSession } = usePlanning();
    const [adding, setAdding] = useState(false);
    const [toCancel, setToCancel] = useState<TimeSlot | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [cancelError, setCancelError] = useState<string | null>(null);

    const allowed = useMemo(() => new Set(projectIds), [projectIds]);
    const sessions = slotsForWeek(weekKey)
        .filter((s) => allowed.has(s.projectId))
        .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.startTime.localeCompare(b.startTime) || projectName(a.projectId).localeCompare(projectName(b.projectId), 'fr'));
    const cancelled = cancelledSlotsForWeek(weekKey).filter(({ slot }) => allowed.has(slot.projectId));

    const registered = (slotId: string) => bookings.filter((b) => b.slotId === slotId && b.weekKey === weekKey && b.status !== 'annule').length;
    const validated = (slotId: string) => bookings.filter((b) => b.slotId === slotId && b.weekKey === weekKey && (b.status === 'confirme' || b.status === 'absent')).length;

    const projects = projectsData.filter((p) => allowed.has(p.id)).map((p) => ({ id: p.id, name: p.name }));

    const existingOn = (projectId: number, date: string) => {
        const day = dayOfDate(date);
        const wk = weekKeyOfDate(date);
        if (!day || !wk) return [];
        return slotsForWeek(wk).filter((s) => s.projectId === projectId && s.day === day).map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
    };

    const confirmCancel = async () => {
        if (!toCancel) return;
        setBusyId(toCancel.id);
        setCancelError(null);
        const result = await cancelSession(toCancel.id, weekKey);
        setBusyId(null);
        if (result.ok) {
            onNotify(`Séance annulée : ${projectName(toCancel.projectId)}, ${toCancel.day}`);
            setToCancel(null);
        } else {
            setCancelError(result.message);
        }
    };

    const restore = async (slot: TimeSlot) => {
        setBusyId(slot.id);
        const result = await restoreSession(slot.id, weekKey);
        setBusyId(null);
        onNotify(result.ok ? `Séance rétablie : ${projectName(slot.projectId)}, ${slot.day}` : result.message);
    };

    return (
        <>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="flex-1 text-sm text-[#ECDDFD]/80">
                    Annulez une séance qui n’a pas lieu cette semaine, ou ajoutez-en une à la date et aux horaires de votre choix.
                </p>
                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    disabled={projects.length === 0}
                    className="btn-phoenix-gradient min-h-[48px] px-5 rounded-full text-white font-school uppercase tracking-wider text-xs font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    <CalendarPlus size={16} aria-hidden="true" />
                    Ajouter une séance
                </button>
            </div>

            {sessions.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center mb-8 rounded-2xl bg-[#2D0A32]/60 border border-[#6F2B75]/30 shadow-soft-lg">
                    <Users size={32} className="text-[#ECDDFD]/30 mb-2" aria-hidden="true" />
                    <p className="text-[#ECDDFD]/60 text-sm">Aucune séance prévue cette semaine pour vos projets.</p>
                </div>
            ) : (
                <ul className="space-y-3 mb-8">
                    {sessions.map((slot) => {
                        const date = dateOfSlot(slot, weekKey);
                        const added = Boolean(slot.date);
                        return (
                            <li key={slot.id} className="rounded-2xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 shadow-soft-lg">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-lg tracking-wide">{projectName(slot.projectId)}</h3>
                                    <p className="text-[#ECDDFD]/70 text-sm mt-0.5">{formatDay(date)} · {slot.startTime} à {slot.endTime}</p>
                                    <p className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-school uppercase tracking-wider">
                                        <span className={`px-2.5 py-0.5 rounded-full border ${added ? 'border-[#EC602B]/50 bg-[#EC602B]/15 text-[#F9B79A]' : 'border-[#6F2B75]/60 bg-[#6F2B75]/20 text-[#ECDDFD]/80'}`}>
                                            {added ? 'Ajoutée' : 'Habituelle'}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-[#ECDDFD]/70">
                                            {registered(slot.id)} inscrit{registered(slot.id) > 1 ? 's' : ''}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setCancelError(null); setToCancel(slot); }}
                                    className="min-h-[44px] px-4 rounded-full bg-red-500/15 hover:bg-red-500/30 text-red-100 border border-red-400/50 font-school text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                >
                                    <CalendarX size={15} aria-hidden="true" />
                                    Annuler la séance
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {cancelled.length > 0 && (
                <>
                    <h2 className="mb-3 flex items-center gap-3 text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">
                        Séances annulées ({cancelled.length})
                        <span className="h-px flex-1 bg-[#6F2B75]/40" aria-hidden="true" />
                    </h2>
                    <ul className="space-y-2.5">
                        {cancelled.map(({ slot }) => (
                            <li key={slot.id} className="rounded-2xl bg-[#2D0A32]/60 border border-[#6F2B75]/30 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/80 font-semibold line-through decoration-white/30">{projectName(slot.projectId)}</p>
                                    <p className="text-[#ECDDFD]/60 text-sm">{formatDay(dateOfSlot(slot, weekKey))} · {slot.startTime} à {slot.endTime}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void restore(slot)}
                                    disabled={busyId === slot.id}
                                    className="min-h-[44px] px-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#ECDDFD]/80 hover:text-white font-school text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {busyId === slot.id ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <RotateCcw size={14} aria-hidden="true" />}
                                    Rétablir
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <AnimatePresence>
                {adding && (
                    <AddSessionDialog
                        projects={projects}
                        existingOn={existingOn}
                        onClose={() => setAdding(false)}
                        onSubmit={async (input) => {
                            const result = await addSession(input);
                            if (!result.ok) return result.message || 'Impossible d’ajouter la séance.';
                            onNotify(`Séance ajoutée : ${projectName(input.projectId)}, ${formatDay(input.date)}`);
                            setAdding(false);
                            return null;
                        }}
                    />
                )}
            </AnimatePresence>

            {toCancel && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="cancel-session-title">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-sm rounded-2xl bg-[#2D0A32] border border-[#6F2B75]/60 p-7 text-center shadow-2xl text-white"
                    >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] flex items-center justify-center mx-auto mb-4 text-white shadow-soft">
                            <CalendarX size={26} aria-hidden="true" />
                        </div>
                        <h4 id="cancel-session-title" className="text-lg font-bold text-white mb-2 tracking-wide">Annuler cette séance ?</h4>
                        <p className="text-sm text-[#ECDDFD]/75 mb-2 leading-relaxed">
                            <strong className="text-white">{projectName(toCancel.projectId)}</strong>, {formatDay(dateOfSlot(toCancel, weekKey))}, de {toCancel.startTime} à {toCancel.endTime}.
                        </p>
                        <p className="text-sm text-[#ECDDFD]/75 mb-5 leading-relaxed">
                            {validated(toCancel.id) > 0
                                ? 'Des présences sont déjà validées : l’annulation sera refusée tant qu’elles ne sont pas remises en attente.'
                                : registered(toCancel.id) > 0
                                    ? `${registered(toCancel.id)} inscrit${registered(toCancel.id) > 1 ? 's seront retirés' : ' sera retiré'}.`
                                    : 'Personne n’est inscrit sur cette séance.'}
                        </p>
                        {cancelError && <p role="alert" className="mb-4 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2 text-left">{cancelError}</p>}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setToCancel(null)}
                                disabled={busyId === toCancel.id}
                                className="flex-1 min-h-[44px] rounded-full bg-white/10 hover:bg-white/15 text-white font-school uppercase text-xs tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                Garder
                            </button>
                            <button
                                type="button"
                                onClick={() => void confirmCancel()}
                                disabled={busyId === toCancel.id}
                                className="flex-1 min-h-[44px] rounded-full bg-rose-600 hover:bg-rose-500 font-school uppercase text-xs tracking-wider text-white transition-colors shadow-soft disabled:opacity-60 inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {busyId === toCancel.id && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
                                Annuler la séance
                            </button>
                        </div>
                    </motion.div>
                </div>,
                document.body
            )}
        </>
    );
}
