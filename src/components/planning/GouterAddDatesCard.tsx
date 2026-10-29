import { useState } from 'react';
import { projectsData } from '../../data/projectsData';
import { cardClass, primaryButtonClass } from './childrenStyles';

interface GouterAddDatesCardProps {
    projects: number[];
    disabled: boolean;
    /** Renvoie vrai quand les dates ont été enregistrées (le champ est alors vidé). */
    onAdd: (projectId: number, dates: string[], note: string) => Promise<boolean>;
}

const projectName = (id: number) => projectsData.find((p) => p.id === id)?.name ?? `Projet ${id}`;

export function GouterAddDatesCard({ projects, disabled, onAdd }: GouterAddDatesCardProps) {
    const [projectId, setProjectId] = useState<number>(projects[0]);
    const [text, setText] = useState('');
    const [note, setNote] = useState('');
    const dates = text.split('\n').map((line) => line.trim()).filter(Boolean);

    const add = async () => {
        if (await onAdd(projectId, dates, note.trim())) setText('');
    };

    return (
        <div className={cardClass}>
            <h3 className="text-white font-bold tracking-wide mb-1">Ajouter des dates de goûter</h3>
            <p className="text-[#ECDDFD]/70 text-xs mb-4">Une date par ligne, au format AAAA-MM-JJ (par exemple 2026-11-14). Seules les dates à venir sont acceptées.</p>
            {projects.length > 1 && (
                <>
                    <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 mb-1" htmlFor="gouter-project">Projet</label>
                    <select
                        id="gouter-project"
                        value={projectId}
                        disabled={disabled}
                        onChange={(e) => setProjectId(Number(e.target.value))}
                        className="mb-3 px-4 py-2.5 rounded-full bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm"
                    >
                        {projects.map((id) => (
                            <option key={id} value={id}>{projectName(id)}</option>
                        ))}
                    </select>
                </>
            )}
            {projects.length === 1 && <p className="text-white font-bold tracking-wide mb-3">{projectName(projects[0])}</p>}
            <label className="sr-only" htmlFor="gouter-dates">Dates à ajouter</label>
            <textarea
                id="gouter-dates"
                value={text}
                rows={3}
                disabled={disabled}
                onChange={(e) => setText(e.target.value)}
                placeholder={'2026-11-14\n2026-12-12'}
                className="w-full px-4 py-3 rounded-xl bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm mb-3"
            />
            <label className="sr-only" htmlFor="gouter-note">Note (facultative)</label>
            <input
                id="gouter-note"
                type="text"
                value={note}
                maxLength={80}
                disabled={disabled}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note facultative (lieu, par exemple)"
                className="w-full px-4 py-2.5 rounded-full bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm mb-4"
            />
            <button type="button" disabled={disabled || dates.length === 0} onClick={() => void add()} className={primaryButtonClass}>
                Ajouter {dates.length > 1 ? `${dates.length} dates` : 'la date'}
            </button>
        </div>
    );
}
