import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Check, Clock, X, XCircle, UserPlus } from 'lucide-react';
import { projectsData } from '../../data/projectsData';
import { DAY_ORDER, getWeekStartDate, type Booking, type TimeSlot } from '../../data/planningData';
import { MemberPickerDialog, type PickableMember } from './MemberPickerDialog';

interface SlotPlacementPanelProps {
    weekKey: string;
    /** Créneaux des projets du responsable (tous pour le Bureau). */
    slots: TimeSlot[];
    bookings: Booking[];
    members: { id: string; name: string; role?: string; projectIds?: number[] }[];
    onPlace: (slotId: string, userIds: string[]) => Promise<{ ok: boolean; message: string; added: number; updated: number; already: number }>;
    onUnplace: (bookingId: string) => Promise<{ ok: boolean; message: string }>;
    onNotify: (message: string) => void;
}

type SlotMoment = 'past' | 'today' | 'future';

const cleanName = (name: string) => name.replace(/\t/g, '').trim();

/** Jour du créneau dans la semaine affichée, et s'il est passé, d'aujourd'hui ou à venir (heure locale). */
function slotDay(slot: TimeSlot, weekKey: string): { date: Date; moment: SlotMoment } {
    const date = getWeekStartDate(weekKey);
    date.setDate(date.getDate() + DAY_ORDER.indexOf(slot.day));
    const now = new Date();
    const dayKey = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    const moment: SlotMoment = dayKey(date) < dayKey(now) ? 'past' : dayKey(date) === dayKey(now) ? 'today' : 'future';
    return { date, moment };
}

const MOMENT_BADGE: Record<SlotMoment, { label: string; className: string }> = {
    past: { label: 'Passé', className: 'bg-white/10 text-[#ECDDFD]/70 border-white/15' },
    today: { label: "Aujourd'hui", className: 'bg-[#EC602B]/20 text-[#FFB48F] border-[#EC602B]/50' },
    future: { label: 'À venir', className: 'bg-[#6F2B75]/40 text-[#ECDDFD] border-[#6F2B75]/70' },
};

const STATUS_CHIP: Record<string, { label: string; className: string }> = {
    prevu: { label: 'Prévu', className: 'bg-[#6F2B75]/30 border-[#6F2B75]/70 text-white' },
    confirme: { label: 'Présent', className: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100' },
    absent: { label: 'Absent', className: 'bg-red-500/15 border-red-500/40 text-red-100' },
};

function SlotCard({ slot, weekKey, bookings, members, onPlace, onUnplace, onNotify }: Omit<SlotPlacementPanelProps, 'slots'> & { slot: TimeSlot }) {
    const [picking, setPicking] = useState(false);
    const [toRemove, setToRemove] = useState<Booking | null>(null);
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState<string | null>(null);

    const project = projectsData.find((p) => p.id === slot.projectId);
    const { date, moment } = slotDay(slot, weekKey);
    const badge = MOMENT_BADGE[moment];
    const here = bookings
        .filter((b) => b.slotId === slot.id && b.weekKey === weekKey && b.status !== 'annule')
        .sort((a, b) => (a.userName || a.userId).localeCompare(b.userName || b.userId, 'fr', { sensitivity: 'base' }));
    const takenIds = new Set(here.map((b) => b.userId));

    const pickable: PickableMember[] = members.map((m) => ({
        id: m.id,
        name: cleanName(m.name),
        role: m.role,
        inProject: Array.isArray(m.projectIds) && m.projectIds.includes(slot.projectId),
    }));

    const dayLabel = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    const submit = async (userIds: string[]): Promise<string | null> => {
        const result = await onPlace(slot.id, userIds);
        if (!result.ok) return result.message || "L'ajout n'a pas pu être enregistré.";
        const total = result.added + result.updated;
        const parts = [`${total} membre${total > 1 ? 's' : ''} ajouté${total > 1 ? 's' : ''}${moment === 'past' ? ' (présents)' : ''}`];
        if (result.already > 0) parts.push(`${result.already} déjà sur le créneau`);
        onNotify(parts.join(', '));
        setPicking(false);
        return null;
    };

    const confirmRemove = async () => {
        if (!toRemove) return;
        setRemoving(true);
        setRemoveError(null);
        const result = await onUnplace(toRemove.id);
        setRemoving(false);
        if (result.ok) {
            onNotify(`${toRemove.userName || toRemove.userId} retiré(e) du créneau`);
            setToRemove(null);
        } else {
            setRemoveError(result.message || "Le retrait n'a pas pu être enregistré.");
        }
    };

    return (
        <motion.li
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 shadow-soft-lg backdrop-blur-md list-none"
        >
            <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex flex-col items-center justify-center shadow-soft" aria-hidden="true">
                    <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                    <span className="text-[10px] uppercase tracking-wider mt-0.5">{date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xl sm:text-2xl font-display text-white tracking-wide leading-tight">{project?.name ?? `Projet ${slot.projectId}`}</p>
                    <p className="text-sm font-semibold text-[#ECDDFD] mt-1 first-letter:uppercase">{dayLabel}</p>
                    <p className="text-xs text-[#ECDDFD]/70 mt-0.5 flex items-center gap-1.5">
                        <Clock size={12} aria-hidden="true" />
                        <span className="font-mono">{slot.startTime}–{slot.endTime}</span>
                    </p>
                </div>
                <span className={`shrink-0 text-[10px] font-school uppercase tracking-wider px-2.5 py-1 rounded-full border ${badge.className}`}>{badge.label}</span>
            </div>

            <div className="mt-4">
                {here.length === 0 ? (
                    <p className="text-sm text-[#ECDDFD]/60 italic">Personne sur ce créneau pour l'instant.</p>
                ) : (
                    <ul className="flex flex-wrap gap-2" aria-label="Membres sur ce créneau">
                        {here.map((b) => {
                            const chip = STATUS_CHIP[b.status] ?? STATUS_CHIP.prevu;
                            const name = b.userName || b.userId;
                            return (
                                <li key={b.id} className={`inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-full border text-sm ${chip.className}`}>
                                    <span className="truncate max-w-[12rem]">{name}</span>
                                    <span className="text-[10px] font-school uppercase tracking-wider opacity-70">{chip.label}</span>
                                    <button
                                        type="button"
                                        onClick={() => { setRemoveError(null); setToRemove(b); }}
                                        aria-label={`Retirer ${name} du créneau`}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 cursor-pointer"
                                    >
                                        <X size={14} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <AnimatePresence>
                {toRemove && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div role="alertdialog" aria-label="Confirmer le retrait" className="mt-3 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-sm text-rose-100">
                            <p>
                                Retirer <strong>{toRemove.userName || toRemove.userId}</strong> de ce créneau ?
                                {toRemove.status === 'confirme' && ' Sa présence validée et les heures correspondantes seront supprimées.'}
                            </p>
                            {removeError && <p role="alert" className="mt-2 text-xs text-rose-300">{removeError}</p>}
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    disabled={removing}
                                    onClick={() => void confirmRemove()}
                                    className="min-h-[44px] px-4 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white font-school text-xs uppercase tracking-wider disabled:opacity-60 cursor-pointer"
                                >
                                    {removing ? 'Retrait...' : 'Retirer'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setToRemove(null)}
                                    className="min-h-[44px] px-4 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] font-school text-xs uppercase tracking-wider cursor-pointer"
                                >
                                    Garder
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-[#ECDDFD]/60">{here.length} membre{here.length > 1 ? 's' : ''}</span>
                <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className="btn-phoenix-gradient min-h-[44px] px-4 py-2 rounded-full text-white font-school uppercase tracking-wider text-xs flex items-center gap-2 shadow-soft cursor-pointer"
                >
                    <UserPlus size={15} aria-hidden="true" />
                    Ajouter des membres
                </button>
            </div>

            <AnimatePresence>
                {picking && (
                    <MemberPickerDialog
                        title="Ajouter des membres"
                        subtitle={`${dayLabel}, ${slot.startTime}–${slot.endTime} · ${project?.name ?? ''}`}
                        isPast={moment === 'past'}
                        members={pickable}
                        takenIds={takenIds}
                        onClose={() => setPicking(false)}
                        onSubmit={submit}
                    />
                )}
            </AnimatePresence>
        </motion.li>
    );
}

/** Placer des membres sur les créneaux de la semaine affichée (utile avant que tous les tuteurs aient leur code). */
export function SlotPlacementPanel({ weekKey, slots, bookings, members, onPlace, onUnplace, onNotify }: SlotPlacementPanelProps) {
    const [projectFilter, setProjectFilter] = useState<number | 'all'>('all');
    // `slots` contient déjà les séances de cette semaine (alternance, annulations et ajouts compris).
    const weekSlots = slots;
    // Un filtre par projet dès qu'il y a plusieurs projets (Bureau, ou chef de plusieurs projets).
    const projectIds = [...new Set(weekSlots.map((slot) => slot.projectId))]
        .sort((a, b) => (projectsData.find((p) => p.id === a)?.name ?? '').localeCompare(projectsData.find((p) => p.id === b)?.name ?? '', 'fr', { sensitivity: 'base' }));
    const filter = projectFilter !== 'all' && projectIds.includes(projectFilter) ? projectFilter : 'all';
    const active = weekSlots
        .filter((slot) => filter === 'all' || slot.projectId === filter)
        .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || a.startTime.localeCompare(b.startTime) || a.projectId - b.projectId);

    return (
        <section aria-label="Placer des membres sur les créneaux">
            <p className="text-sm text-[#ECDDFD]/75 mb-4 leading-relaxed flex items-start gap-2">
                <CalendarPlus size={16} className="mt-0.5 shrink-0 text-[#EC602B]" aria-hidden="true" />
                <span>
                    Ajoutez vous-même les membres qui n'ont pas encore leur code, sur un créneau passé, d'aujourd'hui ou à venir.
                    Un créneau passé les compte présents tout de suite.
                </span>
            </p>
            {projectIds.length > 1 && (
                <div role="group" aria-label="Filtrer par projet" className="mb-5 -mx-1 px-1 flex gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {(['all', ...projectIds] as const).map((id) => {
                        const label = id === 'all' ? 'Tous les projets' : projectsData.find((p) => p.id === id)?.name ?? `Projet ${id}`;
                        const count = id === 'all' ? weekSlots.length : weekSlots.filter((slot) => slot.projectId === id).length;
                        const on = filter === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={on}
                                onClick={() => setProjectFilter(id)}
                                className={`shrink-0 min-h-[44px] px-4 rounded-full border font-school text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                    on ? 'btn-phoenix-gradient text-white border-transparent shadow-soft' : 'bg-[#1F0422]/70 text-[#ECDDFD]/80 border-[#6F2B75]/50 hover:text-white hover:border-[#EC602B]/60'
                                }`}
                            >
                                {label} <span className="opacity-60">({count})</span>
                            </button>
                        );
                    })}
                </div>
            )}
            {active.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center rounded-2xl bg-[#2D0A32]/60 border border-[#6F2B75]/30 shadow-soft-lg">
                    <XCircle size={32} className="text-[#ECDDFD]/30 mb-2" aria-hidden="true" />
                    <p className="text-[#ECDDFD]/60 text-sm">Aucun créneau cette semaine pour vos projets.</p>
                </div>
            ) : (
                <ul className="space-y-4 p-0">
                    {active.map((slot) => (
                        <SlotCard key={slot.id} slot={slot} weekKey={weekKey} bookings={bookings} members={members} onPlace={onPlace} onUnplace={onUnplace} onNotify={onNotify} />
                    ))}
                </ul>
            )}
            <p className="mt-4 text-[11px] text-[#ECDDFD]/45 flex items-center gap-1.5">
                <Check size={12} aria-hidden="true" />
                Changez de semaine avec les flèches du haut pour placer des membres sur d'autres dates.
            </p>
        </section>
    );
}
