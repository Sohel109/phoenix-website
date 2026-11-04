import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Search, X, Check, Users } from 'lucide-react';

export interface PickableMember {
    id: string;
    name: string;
    role?: string;
    /** Vrai si le membre est rattaché au projet du créneau : ces membres sont proposés en premier. */
    inProject: boolean;
}

interface MemberPickerDialogProps {
    title: string;
    subtitle: string;
    /** Créneau déjà passé : les membres ajoutés seront comptés présents. */
    isPast: boolean;
    members: PickableMember[];
    /** Membres déjà sur ce créneau : affichés, mais non sélectionnables. */
    takenIds: Set<string>;
    onClose: () => void;
    /** Renvoie un message d'erreur à afficher dans la fenêtre, ou null si tout s'est bien passé (la fenêtre se ferme alors). */
    onSubmit: (userIds: string[]) => Promise<string | null>;
}

const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Fenêtre de choix de plusieurs membres : recherche, membres du projet en premier, sélection multiple. */
export function MemberPickerDialog({ title, subtitle, isPast, members, takenIds, onClose, onSubmit }: MemberPickerDialogProps) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        searchRef.current?.focus();
        const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const visible = useMemo(() => {
        const wanted = normalize(query.trim());
        return members
            .filter((member) => wanted === '' || normalize(member.name).includes(wanted))
            .sort((a, b) => Number(b.inProject) - Number(a.inProject) || a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    }, [members, query]);

    const selectable = visible.filter((member) => !takenIds.has(member.id));
    const allVisibleSelected = selectable.length > 0 && selectable.every((member) => selected.has(member.id));

    const toggle = (id: string) => setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const toggleAllVisible = () => setSelected((previous) => {
        const next = new Set(previous);
        for (const member of selectable) { if (allVisibleSelected) next.delete(member.id); else next.add(member.id); }
        return next;
    });

    const submit = async () => {
        setBusy(true);
        setError(null);
        const problem = await onSubmit([...selected]);
        setBusy(false);
        if (problem) setError(problem);
    };

    const count = selected.size;

    // Rendu dans <body> : la carte qui l'ouvre a un flou d'arrière-plan, qui ferait de elle le repère d'une fenêtre « fixe ».
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md" onClick={onClose}>
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                onClick={(event) => event.stopPropagation()}
                className="w-full sm:max-w-lg max-h-[92vh] flex flex-col rounded-t-[2rem] sm:rounded-2xl bg-[#2D0A32] border border-[#6F2B75]/60 shadow-2xl overflow-hidden"
            >
                <div className="p-5 pb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-display text-white tracking-wide">{title}</h2>
                        <p className="text-xs text-[#ECDDFD]/70 mt-0.5">{subtitle}</p>
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

                <div className={`mx-5 mb-3 px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed border ${isPast ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-[#1F0422]/70 border-[#6F2B75]/40 text-[#ECDDFD]/80'}`}>
                    {isPast
                        ? 'Ce créneau est passé : les membres ajoutés seront comptés présents et leurs heures seront validées.'
                        : 'Les membres ajoutés seront prévus sur ce créneau. Vous validerez leur présence ensuite, comme d\'habitude.'}
                </div>

                <div className="px-5 pb-3">
                    <div className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/50" aria-hidden="true" />
                        <input
                            ref={searchRef}
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Rechercher un nom"
                            aria-label="Rechercher un membre"
                            className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#1F0422] border border-[#6F2B75]/50 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#EC602B]"
                        />
                    </div>
                    {selectable.length > 1 && (
                        <button type="button" onClick={toggleAllVisible} className="mt-2 text-xs text-[#EC602B] hover:text-white underline underline-offset-2 cursor-pointer">
                            {allVisibleSelected ? 'Tout désélectionner' : `Tout sélectionner (${selectable.length})`}
                        </button>
                    )}
                </div>

                <ul className="flex-1 overflow-y-auto px-3 pb-2 min-h-[8rem]">
                    {visible.length === 0 && (
                        <li className="flex flex-col items-center py-8 text-center text-[#ECDDFD]/60 text-sm">
                            <Users size={28} className="mb-2 opacity-40" aria-hidden="true" />
                            Aucun membre ne correspond à « {query} ».
                        </li>
                    )}
                    {visible.map((member) => {
                        const taken = takenIds.has(member.id);
                        const checked = selected.has(member.id);
                        return (
                            <li key={member.id}>
                                <label className={`flex items-center gap-3 px-3 min-h-[3rem] rounded-xl transition-colors ${taken ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'} ${checked ? 'bg-[#EC602B]/10' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={checked || taken}
                                        disabled={taken}
                                        onChange={() => toggle(member.id)}
                                        className="w-5 h-5 accent-[#EC602B] shrink-0"
                                    />
                                    <span className="flex-1 min-w-0 text-sm text-white truncate">{member.name}</span>
                                    {taken && <span className="text-[10px] font-school uppercase tracking-wider text-[#ECDDFD]/70">Déjà sur le créneau</span>}
                                    {!taken && member.inProject && <span className="text-[10px] font-school uppercase tracking-wider text-[#EC602B]">Ce projet</span>}
                                </label>
                            </li>
                        );
                    })}
                </ul>

                <div className="p-5 pt-3 border-t border-[#6F2B75]/30 bg-[#2D0A32]">
                    {error && <p role="alert" className="mb-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl px-3 py-2">{error}</p>}
                    <button
                        type="button"
                        disabled={count === 0 || busy}
                        onClick={() => void submit()}
                        className="btn-phoenix-gradient w-full min-h-[48px] px-5 py-2.5 rounded-full text-white font-school uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        <Check size={15} aria-hidden="true" />
                        {busy ? 'Ajout en cours...' : count === 0 ? 'Choisissez au moins un membre' : `Ajouter ${count} membre${count > 1 ? 's' : ''}`}
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
