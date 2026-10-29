import { useState } from 'react';
import type { Gouter } from '../../data/planningData';
import { cardClass, primaryButtonClass, secondaryButtonClass } from './childrenStyles';

interface GouterItemsCardProps {
    gouter: Gouter;
    disabled: boolean;
    /** Renvoie vrai quand l'apport a été enregistré (le champ est alors vidé). */
    onAdd: (item: string) => Promise<boolean>;
    onRemove: (itemId: string) => void;
}

export function GouterItemsCard({ gouter, disabled, onAdd, onRemove }: GouterItemsCardProps) {
    const [text, setText] = useState('');
    const locked = disabled || gouter.isPast;

    const add = async () => {
        if (await onAdd(text.trim())) setText('');
    };

    return (
        <div className={cardClass}>
            <h3 className="text-white font-bold tracking-wide mb-1">Qui apporte quoi</h3>
            <p className="text-[#ECDDFD]/70 text-xs mb-4">Indiquez ce que vous apportez à manger. Ce n'est pas lié aux créneaux.</p>
            {gouter.items.length === 0 ? (
                <p className="text-sm text-[#ECDDFD]/70 mb-4">Personne n'a encore indiqué ce qu'il apporte.</p>
            ) : (
                <ul className="divide-y divide-[#6F2B75]/30 mb-4">
                    {gouter.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                            <span className="text-white">
                                {item.item} <span className="text-[#ECDDFD]/60">({item.name})</span>
                            </span>
                            {item.canRemove && !gouter.isPast && (
                                <button type="button" disabled={disabled} onClick={() => onRemove(item.id)} className={`${secondaryButtonClass} !px-3 !py-1.5`}>
                                    Retirer
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {!gouter.isPast && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <label className="sr-only" htmlFor="gouter-item">Ce que j'apporte</label>
                    <input
                        id="gouter-item"
                        type="text"
                        value={text}
                        maxLength={80}
                        disabled={locked}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Par exemple : gâteau au chocolat"
                        className="flex-1 px-4 py-2.5 rounded-full bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm"
                    />
                    <button type="button" disabled={locked || text.trim() === ''} onClick={() => void add()} className={primaryButtonClass}>
                        Ajouter
                    </button>
                </div>
            )}
        </div>
    );
}
