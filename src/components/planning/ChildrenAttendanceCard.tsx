import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sessionDateKey, todayKeyParis } from '../../data/childrenResponse';
import { DAY_ORDER, formatWeekLabel, type ChildrenData, type TimeSlot } from '../../data/planningData';
import { cardClass, primaryButtonClass } from './childrenStyles';

interface ChildrenAttendanceCardProps {
    data: ChildrenData;
    weekKey: string;
    slotId: string | null;
    /** Séances (créneaux) du projet qui ont lieu cette semaine. */
    slots: TimeSlot[];
    disabled: boolean;
    onWeekChange: (direction: 'prev' | 'next') => void;
    onSlotChange: (slotId: string) => void;
    onSave: (presentIds: string[]) => Promise<void>;
}

const slotLabel = (slot: TimeSlot) => `${slot.day} ${slot.startTime.replace(':', 'h')} - ${slot.endTime.replace(':', 'h')}`;

/** Appel d'une séance. À remonter avec une `key` qui change quand le projet, la séance ou l'appel enregistré changent. */
export function ChildrenAttendanceCard({ data, weekKey, slotId, slots, disabled, onWeekChange, onSlotChange, onSave }: ChildrenAttendanceCardProps) {
    const [checked, setChecked] = useState<Set<string>>(() => new Set(data.attendance?.presentIds ?? []));
    const alreadyDone = data.attendance !== null;
    const today = todayKeyParis();
    const selected = slots.find((s) => s.id === slotId) ?? null;

    const toggle = (id: string) =>
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <div className={cardClass}>
            <h3 className="text-white font-bold tracking-wide mb-1">Appel</h3>
            <p className="text-[#ECDDFD]/70 text-xs mb-4">Choisissez la séance, cochez les enfants présents, puis enregistrez.</p>

            <div className="flex items-center justify-between mb-4 p-3 rounded-full bg-[#1F0422]/70 border border-[#6F2B75]/40">
                <button type="button" disabled={disabled} onClick={() => onWeekChange('prev')} aria-label="Semaine précédente" className="w-9 h-9 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white flex items-center justify-center disabled:opacity-60">
                    <ChevronLeft size={16} />
                </button>
                <span className="text-white font-school text-xs md:text-sm uppercase tracking-wider text-center">{formatWeekLabel(weekKey)}</span>
                <button type="button" disabled={disabled} onClick={() => onWeekChange('next')} aria-label="Semaine suivante" className="w-9 h-9 rounded-full bg-[#6F2B75]/30 hover:bg-[#6F2B75]/60 text-white flex items-center justify-center disabled:opacity-60">
                    <ChevronRight size={16} />
                </button>
            </div>

            {slots.length === 0 ? (
                <p className="text-sm text-[#ECDDFD]/70">Aucune séance prévue cette semaine pour ce projet.</p>
            ) : (
                <ul className="flex flex-col gap-2 mb-5">
                    {slots.map((slot) => {
                        const date = sessionDateKey(weekKey, DAY_ORDER.indexOf(slot.day));
                        const upcoming = date !== null && date > today;
                        const isSelected = slot.id === slotId;
                        return (
                            <li key={slot.id}>
                                <button
                                    type="button"
                                    disabled={disabled || upcoming}
                                    onClick={() => onSlotChange(slot.id)}
                                    aria-pressed={isSelected}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left text-sm border transition-all disabled:opacity-50 ${
                                        isSelected ? 'bg-[#EC602B]/15 border-[#EC602B]/60 text-white' : 'bg-[#1F0422]/70 border-[#6F2B75]/40 text-[#ECDDFD]/90 hover:border-[#EC602B]/50'
                                    }`}
                                >
                                    <span className="font-bold">{slotLabel(slot)}</span>
                                    {upcoming ? (
                                        <span className="text-xs text-[#ECDDFD]/60">À venir</span>
                                    ) : data.doneSlots.includes(slot.id) ? (
                                        <span className="px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Appel fait</span>
                                    ) : null}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {selected && data.slotId === selected.id && (
                <>
                    {alreadyDone && <p className="text-xs text-emerald-300 mb-3">L'appel de cette séance est déjà enregistré. Vous pouvez le corriger.</p>}
                    {data.children.length === 0 ? (
                        <p className="text-sm text-[#ECDDFD]/70">Aucun enfant dans la liste de ce projet. Ajoutez-les dans la carte « Liste des enfants ».</p>
                    ) : (
                        <>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-5">
                                {data.children.map((child) => (
                                    <li key={child.id}>
                                        <label className="flex items-center gap-3 py-2 text-sm text-white cursor-pointer">
                                            <input type="checkbox" checked={checked.has(child.id)} disabled={disabled} onChange={() => toggle(child.id)} className="accent-[#EC602B] w-5 h-5" />
                                            {child.name}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-[#ECDDFD]/70 mb-3">{checked.size} présent{checked.size > 1 ? 's' : ''} sur {data.children.length}</p>
                            <button type="button" disabled={disabled} onClick={() => void onSave([...checked])} className={primaryButtonClass}>
                                {alreadyDone ? 'Enregistrer les corrections' : "Enregistrer l'appel"}
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
