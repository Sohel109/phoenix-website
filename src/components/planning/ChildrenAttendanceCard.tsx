import { useState } from 'react';
import { todayKeyParis } from '../../data/childrenResponse';
import type { ChildrenData } from '../../data/planningData';
import { cardClass, primaryButtonClass } from './childrenStyles';

interface ChildrenAttendanceCardProps {
    data: ChildrenData;
    date: string;
    disabled: boolean;
    onDateChange: (date: string) => void;
    onSave: (presentIds: string[]) => Promise<void>;
}

/** Appel d'une séance. À remonter avec une `key` qui change quand le projet, la date ou l'appel enregistré changent. */
export function ChildrenAttendanceCard({ data, date, disabled, onDateChange, onSave }: ChildrenAttendanceCardProps) {
    const [checked, setChecked] = useState<Set<string>>(() => new Set(data.attendance?.presentIds ?? []));
    const alreadyDone = data.attendance !== null;

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
            <p className="text-[#ECDDFD]/70 text-xs mb-4">Cochez les enfants présents à la séance, puis enregistrez.</p>
            <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 mb-1" htmlFor="children-date">Date de la séance</label>
            <input
                id="children-date"
                type="date"
                value={date}
                max={todayKeyParis()}
                disabled={disabled}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="mb-5 px-4 py-2.5 rounded-full bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm"
            />
            {alreadyDone && <p className="text-xs text-emerald-300 mb-3">L'appel de ce jour est déjà enregistré. Vous pouvez le corriger.</p>}
            {data.children.length === 0 ? (
                <p className="text-sm text-[#ECDDFD]/70">Aucun enfant dans la liste de ce projet. Ajoutez-les dans la carte « Liste des enfants ».</p>
            ) : (
                <>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-5">
                        {data.children.map((child) => (
                            <li key={child.id}>
                                <label className="flex items-center gap-3 py-2 text-sm text-white cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checked.has(child.id)}
                                        disabled={disabled}
                                        onChange={() => toggle(child.id)}
                                        className="accent-[#EC602B] w-5 h-5"
                                    />
                                    {child.name}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-[#ECDDFD]/70 mb-3">{checked.size} présent{checked.size > 1 ? 's' : ''} sur {data.children.length}</p>
                    <button type="button" disabled={disabled} onClick={() => void onSave([...checked])} className={primaryButtonClass}>
                        {alreadyDone ? 'Enregistrer les corrections' : 'Enregistrer'}
                    </button>
                </>
            )}
        </div>
    );
}
