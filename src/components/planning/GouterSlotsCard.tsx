import { formatSlotHours } from '../../data/gouterResponse';
import type { Gouter } from '../../data/planningData';
import { cardClass, primaryButtonClass, secondaryButtonClass } from './childrenStyles';

interface GouterSlotsCardProps {
    gouter: Gouter;
    currentUserId: string;
    disabled: boolean;
    /** `userId` n'est renseigné que pour retirer un autre membre (gestionnaires). */
    onToggle: (hour: number, joined: boolean, userId?: string) => void;
}

export function GouterSlotsCard({ gouter, currentUserId, disabled, onToggle }: GouterSlotsCardProps) {
    const locked = disabled || gouter.isPast;
    return (
        <div className={cardClass}>
            <h3 className="text-white font-bold tracking-wide mb-1">Créneaux</h3>
            <p className="text-[#ECDDFD]/70 text-xs mb-4">
                {gouter.isPast ? 'Ce goûter est passé : les inscriptions ne peuvent plus être modifiées.' : "Inscrivez-vous aux heures où vous pouvez aider. Plusieurs personnes peuvent s'inscrire sur le même créneau."}
            </p>
            <ul className="divide-y divide-[#6F2B75]/30">
                {gouter.slots.map((slot) => {
                    const mine = slot.users.some((u) => u.userId === currentUserId);
                    return (
                        <li key={slot.hour} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <p className="text-white font-bold text-sm">{formatSlotHours(slot.hour)}</p>
                                {slot.users.length === 0 ? (
                                    <p className="text-xs text-amber-300/80">Personne pour l'instant</p>
                                ) : (
                                    <ul className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                        {slot.users.map((u) => (
                                            <li key={u.userId} className="text-xs text-[#ECDDFD]/90 flex items-center gap-1.5">
                                                {u.name}
                                                {gouter.canManage && u.userId !== currentUserId && !gouter.isPast && (
                                                    <button
                                                        type="button"
                                                        disabled={disabled}
                                                        onClick={() => onToggle(slot.hour, false, u.userId)}
                                                        aria-label={`Retirer ${u.name} de ce créneau`}
                                                        className="text-[#EC602B] hover:text-white disabled:opacity-60"
                                                    >
                                                        retirer
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={locked}
                                onClick={() => onToggle(slot.hour, !mine)}
                                aria-pressed={mine}
                                className={`${mine ? secondaryButtonClass : primaryButtonClass} shrink-0`}
                            >
                                {mine ? 'Me retirer' : "Je m'inscris"}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
