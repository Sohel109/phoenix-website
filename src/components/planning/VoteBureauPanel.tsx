import { useState } from 'react';
import { Award, EyeOff } from 'lucide-react';
import { publishWinnerApi, setVoteExclusionApi } from '../../data/planningData';
import type { VoteData } from '../../data/planningData';

interface VoteBureauPanelProps {
    data: VoteData;
    requesterId: string;
    token: string;
    onChanged: () => void | Promise<void>;
    /** Vrai quand la page est déjà en train d'envoyer ou de recharger : évite deux actions simultanées. */
    disabled?: boolean;
}

const cardClass = 'p-6 rounded-xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg';
const buttonClass =
    'px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider transition-all border disabled:opacity-60';

export function VoteBureauPanel({ data, requesterId, token, onChanged, disabled = false }: VoteBureauPanelProps) {
    const [working, setWorking] = useState(false);
    const busy = working || disabled;
    const [error, setError] = useState<string | null>(null);
    const [choice, setChoice] = useState('');

    if (!data.bureau) return null;
    const { counts, members } = data.bureau;
    const totalVotes = counts.reduce((sum, c) => sum + c.count, 0);
    const selectedWinner = choice || data.winner?.userId || counts[0]?.userId || '';

    const run = async (action: () => Promise<{ success: boolean; message: string }>) => {
        setWorking(true);
        setError(null);
        const result = await action();
        if (!result.success) setError(result.message);
        await onChanged();
        setWorking(false);
    };

    return (
        <section className="mt-10 space-y-5" aria-label="Espace Bureau du vote">
            <div className="flex items-center gap-2">
                <EyeOff size={16} className="text-[#EC602B]" />
                <h2 className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">
                    Réservé au Bureau : les électeurs ne voient pas ces informations
                </h2>
            </div>

            <div className={cardClass}>
                <h3 className="text-white font-bold tracking-wide mb-1">Décompte</h3>
                <p className="text-[#ECDDFD]/70 text-xs mb-4">
                    {totalVotes} vote{totalVotes > 1 ? 's' : ''} pour le mois de référence ({data.monthKey}).
                </p>
                <ul className="divide-y divide-[#6F2B75]/30">
                    {counts.map((c) => (
                        <li key={c.userId} className="flex items-center justify-between py-2 text-sm">
                            <span className="text-white">{c.name}</span>
                            <span className="font-school text-[#ECDDFD]/80">
                                {c.count} voix
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={cardClass}>
                <h3 className="text-white font-bold tracking-wide mb-1">Candidats du mois</h3>
                <p className="text-[#ECDDFD]/70 text-xs mb-4">
                    Tout le monde est candidat par défaut. Décochez un membre pour le retirer de la liste de ce mois.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    {members.map((m) => (
                        <li key={m.id}>
                            <label className="flex items-center gap-3 py-1.5 text-sm text-white cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!m.excluded}
                                    disabled={busy}
                                    onChange={() => void run(() => setVoteExclusionApi(requesterId, m.id, !m.excluded, token))}
                                    className="accent-[#EC602B] w-4 h-4"
                                />
                                {m.name}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={cardClass}>
                <h3 className="text-white font-bold tracking-wide mb-1">Publication</h3>
                {data.winner ? (
                    <p className="text-sm text-[#ECDDFD]/85 mb-4 flex items-center gap-2">
                        <Award size={16} className="text-[#EC602B]" />
                        Gagnant publié : <span className="font-bold text-white">{data.winner.name}</span>
                    </p>
                ) : (
                    <p className="text-[#ECDDFD]/70 text-xs mb-4">
                        Rien n'est affiché sur le site tant que vous ne publiez pas. Vous pouvez aussi annoncer le gagnant en réunion ou sur les réseaux.
                    </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                    <label className="sr-only" htmlFor="vote-winner-select">Choisir le gagnant</label>
                    <select
                        id="vote-winner-select"
                        value={selectedWinner}
                        onChange={(e) => setChoice(e.target.value)}
                        disabled={busy}
                        className="flex-1 px-4 py-2.5 rounded-full bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm"
                    >
                        {counts.map((c) => (
                            <option key={c.userId} value={c.userId}>
                                {c.name} ({c.count} voix)
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        disabled={busy || !selectedWinner}
                        onClick={() => void run(() => publishWinnerApi(requesterId, selectedWinner, token))}
                        className={`${buttonClass} btn-phoenix-gradient text-white border-transparent`}
                    >
                        Publier le gagnant
                    </button>
                    {data.winner && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void run(() => publishWinnerApi(requesterId, null, token))}
                            className={`${buttonClass} bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:bg-[#6F2B75]/40 hover:text-white border-[#6F2B75]/40`}
                        >
                            Dépublier
                        </button>
                    )}
                </div>
                {error && <p role="alert" className="text-sm text-red-300 mt-3">{error}</p>}
            </div>
        </section>
    );
}
