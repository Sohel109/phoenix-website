import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, CalendarPlus, TriangleAlert } from 'lucide-react';
import { dayOfDate, schoolYearBounds } from '../../data/sessionCalendar';

interface AddSessionDialogProps {
    /** Projets sur lesquels l'utilisateur peut ajouter une séance. */
    projects: { id: number; name: string }[];
    /** Séances déjà prévues ce jour-là pour ce projet, pour prévenir avant d'en ajouter une deuxième. */
    existingOn: (projectId: number, date: string) => { startTime: string; endTime: string }[];
    onClose: () => void;
    /** Renvoie un message d'erreur à afficher dans la fenêtre, ou null si tout s'est bien passé (la fenêtre se ferme alors). */
    onSubmit: (input: { projectId: number; date: string; startTime: string; endTime: string }) => Promise<string | null>;
}

const toMinutes = (time: string): number => {
    const m = /^(\d{2}):(\d{2})$/.exec(time);
    return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
};

const todayKey = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatDay = (date: string): string => {
    const text = new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const FIELD = 'w-full min-h-[48px] px-3.5 py-3 rounded-2xl bg-[#1F0422] border border-[#6F2B75]/50 text-white text-sm focus:outline-none focus:border-[#EC602B] [color-scheme:dark]';
const LABEL = 'block mb-1.5 text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80';

/** Fenêtre d'ajout d'une séance à une date et à des horaires choisis. */
export function AddSessionDialog({ projects, existingOn, onClose, onSubmit }: AddSessionDialogProps) {
    const [projectId, setProjectId] = useState<number>(projects[0]?.id ?? 0);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('14:00');
    const [endTime, setEndTime] = useState('16:00');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const bounds = useMemo(() => schoolYearBounds(todayKey()), []);

    const firstFieldRef = useRef<HTMLSelectElement>(null);
    // `onClose` change à chaque rendu du parent : on le garde en référence pour que l'effet ne se relance pas
    // (sinon le focus reviendrait au premier champ en pleine saisie).
    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    useEffect(() => {
        // Le focus va au premier champ à l'ouverture et revient au bouton qui a ouvert la fenêtre à la fermeture.
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        firstFieldRef.current?.focus();
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onCloseRef.current(); };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            opener?.focus();
        };
    }, []);

    const day = date ? dayOfDate(date) : null;
    const sundayChosen = date !== '' && day === null;
    const outOfYear = date !== '' && (date < bounds.start || date > bounds.end);
    const timesInvalid = toMinutes(startTime) < 0 || toMinutes(endTime) < 0 || toMinutes(endTime) <= toMinutes(startTime)
        || toMinutes(startTime) < 7 * 60 || toMinutes(endTime) > 22 * 60
        || toMinutes(startTime) % 5 !== 0 || toMinutes(endTime) % 5 !== 0;
    const existing = date !== '' && day !== null ? existingOn(projectId, date) : [];

    let problem: string | null = null;
    if (sundayChosen) problem = 'Il n’y a pas de séance le dimanche.';
    else if (outOfYear) problem = 'Cette date n’est pas dans l’année scolaire en cours.';
    else if (timesInvalid) problem = 'Les horaires doivent être entre 07:00 et 22:00, par pas de 5 minutes, avec une fin après le début.';
    const canSubmit = !busy && projectId !== 0 && date !== '' && problem === null;

    const submit = async () => {
        setBusy(true);
        setError(null);
        const failure = await onSubmit({ projectId, date, startTime, endTime });
        setBusy(false);
        if (failure) setError(failure);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Ajouter une séance"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(event) => event.stopPropagation()}
                className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-2xl bg-[#2D0A32] border border-[#6F2B75]/60 shadow-2xl"
            >
                <div className="p-5 pb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-display text-white tracking-wide">Ajouter une séance</h2>
                        <p className="text-xs text-[#ECDDFD]/70 mt-0.5">À la date et aux horaires de votre choix, en plus des séances habituelles.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="w-11 h-11 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] flex items-center justify-center cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-5 pb-4 space-y-4">
                    <div>
                        <label htmlFor="session-project" className={LABEL}>Projet</label>
                        <select id="session-project" ref={firstFieldRef} value={projectId} onChange={(event) => setProjectId(Number(event.target.value))} className={FIELD}>
                            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="session-date" className={LABEL}>Date</label>
                        <input id="session-date" type="date" value={date} min={bounds.start} max={bounds.end} onChange={(event) => setDate(event.target.value)} className={FIELD} />
                        {date !== '' && day !== null && <p className="mt-1.5 text-xs text-[#ECDDFD]/70">{formatDay(date)}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="session-start" className={LABEL}>Début</label>
                            <input id="session-start" type="time" step={900} value={startTime} onChange={(event) => setStartTime(event.target.value)} className={FIELD} />
                        </div>
                        <div>
                            <label htmlFor="session-end" className={LABEL}>Fin</label>
                            <input id="session-end" type="time" step={900} value={endTime} onChange={(event) => setEndTime(event.target.value)} className={FIELD} />
                        </div>
                    </div>

                    {existing.length > 0 && (
                        <div className="flex gap-2.5 px-3.5 py-3 rounded-2xl text-xs leading-relaxed bg-[#EC602B]/10 border border-[#EC602B]/40 text-[#F9B79A]">
                            <TriangleAlert size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                            <p>
                                Ce projet a déjà une séance ce jour-là ({existing.map((s) => `${s.startTime} à ${s.endTime}`).join(', ')}).
                                Si elle est remplacée, annulez-la pour qu’elle ne soit pas comptée en double.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-5 pt-3 border-t border-[#6F2B75]/30">
                    {(problem || error) && <p role="alert" className="mb-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2">{error ?? problem}</p>}
                    <button
                        type="button"
                        disabled={!canSubmit}
                        onClick={() => void submit()}
                        className="btn-phoenix-gradient w-full min-h-[48px] px-5 py-2.5 rounded-full text-white font-school uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        <CalendarPlus size={15} aria-hidden="true" />
                        {busy ? 'Ajout en cours...' : date === '' ? 'Choisissez une date' : 'Ajouter la séance'}
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
