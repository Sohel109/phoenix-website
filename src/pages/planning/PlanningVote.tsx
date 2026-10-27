import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Lock, RefreshCw } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { useVoteData } from '../../hooks/useVoteData';
import { castVoteApi, withdrawVoteApi } from '../../data/planningData';
import { VoteBureauPanel } from '../../components/planning/VoteBureauPanel';

function parseDay(key: string): Date {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDay(key: string): string {
    return parseDay(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

function formatMonth(monthKey: string): string {
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export function PlanningVote() {
    const { currentUser, logout } = usePlanning();
    const navigate = useNavigate();
    const { data, loading, error, errorCode, reload } = useVoteData();
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionCode, setActionCode] = useState<string | null>(null);

    if (!currentUser) return null;

    const submit = async (pendingKey: string, action: () => Promise<{ success: boolean; message: string; code?: string }>) => {
        setPendingId(pendingKey);
        setActionError(null);
        setActionCode(null);
        const result = await action();
        if (!result.success) {
            setActionError(result.message);
            setActionCode(result.code ?? null);
        }
        await reload();
        setPendingId(null);
    };

    const token = currentUser.token ?? '';
    // Un second clic sur son choix actuel retire le vote.
    const handleVote = (candidateId: string) =>
        submit(candidateId, () =>
            data?.myVote === candidateId ? withdrawVoteApi(currentUser.id, token) : castVoteApi(currentUser.id, candidateId, token)
        );
    const handleWithdraw = () => submit('withdraw', () => withdrawVoteApi(currentUser.id, token));

    const needsLogin = errorCode === 'unauthenticated' || actionCode === 'unauthenticated';
    const handleReconnect = () => {
        logout();
        navigate('/planning/login');
    };

    const candidates = data ? data.candidates.filter((c) => c.id !== currentUser.id) : [];

    return (
        <PlanningLayout title="Vote du mois">
            <div className="mb-8 pt-2">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Award size={16} className="text-[#EC602B]" />
                        <span className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">Vie de l'association</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">Tuteur du mois</h1>
                    {data?.isOpen && (
                        <p className="text-[#ECDDFD]/70 text-sm mt-1 max-w-xl leading-relaxed">
                            Du {formatDay(data.opensOn)} au {formatDay(data.closesOn)}, choisissez le tuteur qui vous a le plus marqué ce mois-ci.
                            Votre vote reste secret. Vous pouvez le modifier ou le retirer jusqu'à la fermeture.
                        </p>
                    )}
                </motion.div>
            </div>

            {loading && !data && <p className="text-[#ECDDFD]/70 text-sm">Chargement du vote...</p>}

            {needsLogin && (
                <div role="alert" className="mb-6 p-5 rounded-xl bg-[#2D0A32]/90 border border-[#EC602B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-[#ECDDFD]/85">Votre session doit être renouvelée pour voter. Reconnectez-vous, cela ne prend que quelques secondes.</p>
                    <button
                        type="button"
                        onClick={handleReconnect}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider btn-phoenix-gradient text-white"
                    >
                        Se reconnecter
                    </button>
                </div>
            )}

            {error && !needsLogin && (
                <div role="alert" className="mb-6 p-5 rounded-xl bg-[#2D0A32]/90 border border-[#EC602B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-[#ECDDFD]/85">{error}</p>
                    <button
                        type="button"
                        onClick={() => void reload()}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:bg-[#6F2B75]/40 hover:text-white border border-[#6F2B75]/40 transition-all disabled:opacity-60"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Réessayer
                    </button>
                </div>
            )}

            {data && !data.isOpen && (
                <div className="p-6 sm:p-7 rounded-xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg bg-white/5 border border-[#ECDDFD]/10 text-[#ECDDFD]/70 flex items-center justify-center shrink-0">
                        <Lock size={18} />
                    </div>
                    <div>
                        <p className="text-white font-bold tracking-wide">Le vote est fermé</p>
                        <p className="text-[#ECDDFD]/75 text-sm mt-1 leading-relaxed">
                            Prochaine ouverture le {formatDay(data.nextOpensOn)}.
                        </p>
                        {data.winner && (
                            <p className="text-sm mt-3 text-[#ECDDFD]/90">
                                Tuteur du mois de {formatMonth(data.monthKey)} : <span className="font-bold text-white">{data.winner.name}</span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {data?.isOpen && (
                <div className="space-y-3">
                    {candidates.map((candidate, index) => {
                        const isMine = data.myVote === candidate.id;
                        return (
                            <motion.button
                                key={candidate.id}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index, 12) * 0.03 }}
                                disabled={pendingId !== null || loading}
                                onClick={() => void handleVote(candidate.id)}
                                aria-pressed={isMine}
                                className={`w-full flex items-center justify-between gap-4 px-5 py-4 rounded-xl text-left border transition-all backdrop-blur-md disabled:opacity-60 ${
                                    isMine
                                        ? 'bg-[#EC602B]/15 border-[#EC602B]/60 shadow-soft'
                                        : 'bg-[#2D0A32]/90 border-[#6F2B75]/40 hover:border-[#EC602B]/50'
                                }`}
                            >
                                <span className="text-white font-bold tracking-wide">{candidate.name}</span>
                                {isMine && (
                                    <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        <CheckCircle size={12} />
                                        Votre vote
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                    {data.myVote && (
                        <div className="pt-2">
                            <button
                                type="button"
                                disabled={pendingId !== null || loading}
                                onClick={() => void handleWithdraw()}
                                className="px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:bg-[#6F2B75]/40 hover:text-white border border-[#6F2B75]/40 transition-all disabled:opacity-60"
                            >
                                Retirer mon vote
                            </button>
                            <p className="text-[#ECDDFD]/60 text-xs mt-2">Vous pouvez aussi cliquer de nouveau sur votre choix pour le retirer.</p>
                        </div>
                    )}
                    {candidates.length === 0 && (
                        <p className="text-[#ECDDFD]/70 text-sm">Aucun candidat disponible ce mois-ci.</p>
                    )}
                    {actionError && !needsLogin && <p role="alert" className="text-sm text-red-300">{actionError}</p>}
                </div>
            )}
            {data?.bureau && <VoteBureauPanel data={data} requesterId={currentUser.id} token={currentUser.token ?? ''} onChanged={reload} disabled={pendingId !== null || loading} />}
        </PlanningLayout>
    );
}
