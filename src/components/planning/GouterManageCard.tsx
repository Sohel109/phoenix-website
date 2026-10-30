import { useState } from 'react';
import { formatGouterDate } from '../../data/gouterResponse';
import type { Gouter } from '../../data/planningData';
import { cardClass, primaryButtonClass, secondaryButtonClass } from './childrenStyles';

interface GouterManageCardProps {
    gouter: Gouter;
    disabled: boolean;
    /** Renvoie vrai si le serveur a accepté la nouvelle date. */
    onMove: (date: string) => Promise<boolean>;
    onCancel: () => void;
    onExport: () => Promise<void>;
}

const inputClass = 'px-4 py-2.5 rounded-xl bg-[#1F0422]/70 border border-[#6F2B75]/50 text-white text-sm focus:outline-none focus:border-[#EC602B]';

/** Aujourd'hui au format AAAA-MM-JJ, heure locale (le serveur recontrôle la date à l'heure de Paris). */
function todayKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function GouterManageCard({ gouter, disabled, onMove, onCancel, onExport }: GouterManageCardProps) {
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [editingDate, setEditingDate] = useState(false);
    const [newDate, setNewDate] = useState(gouter.date);
    const [exporting, setExporting] = useState(false);

    const move = async () => {
        if (await onMove(newDate)) setEditingDate(false);
    };

    const exportSheet = async () => {
        setExporting(true);
        await onExport();
        setExporting(false);
    };

    return (
        <div className={cardClass}>
            <h3 className="text-white font-bold tracking-wide mb-1">Gérer ce goûter</h3>
            {!gouter.isPast && (
                <p className="text-[#ECDDFD]/70 text-xs mb-4">
                    Les inscriptions et les apports restent attachés au goûter si vous changez sa date.
                </p>
            )}

            <div className="flex flex-col gap-4">
                {!gouter.isPast && (
                    editingDate ? (
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <label className="text-sm text-[#ECDDFD]/85" htmlFor="gouter-new-date">Nouvelle date</label>
                            <input
                                id="gouter-new-date"
                                type="date"
                                min={todayKey()}
                                value={newDate}
                                onChange={(event) => setNewDate(event.target.value)}
                                className={inputClass}
                            />
                            <span className="flex gap-2">
                                <button type="button" disabled={disabled || !newDate || newDate === gouter.date} onClick={() => void move()} className={primaryButtonClass}>
                                    Enregistrer
                                </button>
                                <button type="button" onClick={() => { setEditingDate(false); setNewDate(gouter.date); }} className={secondaryButtonClass}>
                                    Annuler
                                </button>
                            </span>
                        </div>
                    ) : (
                        <div>
                            <button type="button" disabled={disabled} onClick={() => { setNewDate(gouter.date); setEditingDate(true); }} className={secondaryButtonClass}>
                                Changer la date
                            </button>
                            <span className="ml-3 text-xs text-[#ECDDFD]/60 first-letter:uppercase">Actuellement : {formatGouterDate(gouter.date)}</span>
                        </div>
                    )
                )}

                <div>
                    <button type="button" disabled={disabled || exporting} onClick={() => void exportSheet()} className={secondaryButtonClass}>
                        {exporting ? 'Création du fichier...' : 'Exporter en Excel'}
                    </button>
                </div>

                {!gouter.isPast && (
                    confirmCancel ? (
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <p className="text-sm text-[#ECDDFD]/85">Annuler ce goûter ? Il disparaîtra de la liste pour tous.</p>
                            <span className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => { setConfirmCancel(false); onCancel(); }}
                                    className="px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider btn-phoenix-gradient text-white disabled:opacity-60"
                                >
                                    Confirmer
                                </button>
                                <button type="button" onClick={() => setConfirmCancel(false)} className={secondaryButtonClass}>Garder</button>
                            </span>
                        </div>
                    ) : (
                        <div>
                            <button type="button" disabled={disabled} onClick={() => setConfirmCancel(true)} className={secondaryButtonClass}>
                                Annuler ce goûter
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
