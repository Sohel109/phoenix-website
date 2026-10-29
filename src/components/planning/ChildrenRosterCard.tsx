import { useState } from 'react';
import type { ChildrenData } from '../../data/planningData';
import { cardClass, primaryButtonClass, secondaryButtonClass } from './childrenStyles';

interface ChildrenRosterCardProps {
    data: ChildrenData;
    disabled: boolean;
    /** Renvoie vrai quand les noms ont été enregistrés (le champ est alors vidé). */
    onAdd: (names: string[]) => Promise<boolean>;
    onRemove: (childId: string) => Promise<void>;
}

export function ChildrenRosterCard({ data, disabled, onAdd, onRemove }: ChildrenRosterCardProps) {
    const [text, setText] = useState('');
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const names = text.split('\n').map((line) => line.trim()).filter(Boolean);

    const add = async () => {
        if (await onAdd(names)) setText('');
    };

    return (
        <div className={cardClass}>
            <h3 className="text-white font-bold tracking-wide mb-1">Liste des enfants</h3>
            <p className="text-[#ECDDFD]/70 text-xs mb-4">
                Prénom et initiale du nom seulement (par exemple Inès B.). Un enfant par ligne. En début d'année, ajoutez les nouveaux et retirez ceux qui sont partis : leurs présences passées restent dans le bilan.
            </p>
            <label className="sr-only" htmlFor="children-names">Noms des enfants à ajouter</label>
            <textarea
                id="children-names"
                value={text}
                rows={4}
                disabled={disabled}
                onChange={(e) => setText(e.target.value)}
                placeholder={'Inès B.\nKarim D.'}
                className="w-full px-4 py-3 rounded-xl bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm mb-3"
            />
            <button type="button" disabled={disabled || names.length === 0} onClick={() => void add()} className={primaryButtonClass}>
                Ajouter {names.length > 1 ? `${names.length} enfants` : 'à la liste'}
            </button>
            <ul className="mt-6 divide-y divide-[#6F2B75]/30">
                {data.children.map((child) => (
                    <li key={child.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                        <span className="text-white">{child.name}</span>
                        {confirmId === child.id ? (
                            <span className="flex gap-2">
                                <button type="button" disabled={disabled} onClick={() => { setConfirmId(null); void onRemove(child.id); }} className={`${primaryButtonClass} !px-3 !py-1.5`}>Confirmer</button>
                                <button type="button" onClick={() => setConfirmId(null)} className={`${secondaryButtonClass} !px-3 !py-1.5`}>Annuler</button>
                            </span>
                        ) : (
                            <button type="button" disabled={disabled} onClick={() => setConfirmId(child.id)} className={`${secondaryButtonClass} !px-3 !py-1.5`}>Retirer</button>
                        )}
                    </li>
                ))}
            </ul>
            {data.children.length === 0 && <p className="text-sm text-[#ECDDFD]/70 mt-6">Aucun enfant pour le moment.</p>}
        </div>
    );
}
