import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Award, CheckCircle, Lock, RefreshCw } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { PlanningPageHeader } from '../../components/planning/PlanningPageHeader';
import { usePlanning } from '../../context/PlanningContext';
import { useVoteData } from '../../hooks/useVoteData';
import { castVoteApi, withdrawVoteApi, nomineePhotoUrl, type VoteCandidate } from '../../data/planningData';
import { nomineeSlug } from '../../data/nominees';
import { VoteBureauPanel } from '../../components/planning/VoteBureauPanel';
import { NomineeCard } from '../../components/nominees/NomineeCard';
import { NomineeProfileView } from '../../components/nominees/NomineeProfileView';

function parseDay(key: string): Date {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function formatDay(key: string): string {
    return parseDay(key).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

/** Slug de chaque candidat : celui de sa fiche, sinon calculé depuis son nom (doublons suffixés). */
function withSlugs(candidates: VoteCandidate[]): { candidate: VoteCandidate; slug: string }[] {
    const used = new Set(candidates.map((c) => c.profile?.slug).filter((s): s is string => Boolean(s)));
    return candidates.map((candidate) => {
        if (candidate.profile) return { candidate, slug: candidate.profile.slug };
        const base = nomineeSlug(candidate.name);
        let slug = base;
        for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
        used.add(slug);
        return { candidate, slug };
    });
}

const displayNameOf = (c: VoteCandidate) => c.profile?.displayName || c.name;
const photoOf = (c: VoteCandidate) => (c.profile?.photoId ? nomineePhotoUrl(c.profile.photoId) : null);

function formatMonth(monthKey: string): string {
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export function PlanningVote() {
    const { currentUser, logout } = usePlanning();
    const navigate = useNavigate();
    const { slug } = useParams<{ slug?: string }>();
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

    const entries = data ? withSlugs(data.candidates) : [];
    const current = slug ? entries.find((e) => e.slug === slug) : undefined;

    const voteButton = (candidate: VoteCandidate) => {
        if (!data?.isOpen) return null;
        if (candidate.id === currentUser.id) {
            return <p className="text-sm text-[#ECDDFD]/75">Vous êtes nommé : vous ne pouvez pas voter pour vous-même.</p>;
        }
        const isMine = data.myVote === candidate.id;
        const firstName = displayNameOf(candidate).split(/\s+/)[0];
        return (
            <div>
                <button
                    type="button"
                    disabled={pendingId !== null || loading}
                    onClick={() => void handleVote(candidate.id)}
                    aria-pressed={isMine}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-school text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-60 ${
                        isMine ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50' : 'btn-phoenix-gradient text-white shadow-soft'
                    }`}
                >
                    {isMine ? <CheckCircle size={16} /> : <Award size={16} />}
                    {isMine ? 'Votre vote' : `Voter pour ${firstName}`}
                </button>
                {isMine && <p className="text-[#ECDDFD]/60 text-xs mt-2 text-center">Cliquez de nouveau pour retirer votre vote.</p>}
                {actionError && !needsLogin && <p role="alert" className="text-sm text-red-300 mt-2">{actionError}</p>}
            </div>
        );
    };

    return (
        <PlanningLayout title="Tuteur du mois">
            <PlanningPageHeader
                icon={<Award size={16} />}
                section="Mon activité"
                title="Tuteur du mois"
                description={data?.isOpen && !slug ? `Du ${formatDay(data.opensOn)} au ${formatDay(data.closesOn)}, choisissez parmi les candidats celui qui vous a le plus marqué ce mois-ci. Votre vote reste secret. Vous pouvez le modifier ou le retirer jusqu'à la fermeture.` : undefined}
            />

            {loading && !data && <p className="text-[#ECDDFD]/70 text-sm">Chargement du vote...</p>}

            {needsLogin && (
                <div role="alert" className="mb-6 p-5 rounded-2xl bg-[#2D0A32]/90 border border-[#EC602B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <div role="alert" className="mb-6 p-5 rounded-2xl bg-[#2D0A32]/90 border border-[#EC602B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <div className="p-6 sm:p-7 rounded-2xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg flex items-start gap-4">
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

            {data?.isOpen && slug && !current && (
                <div className="p-6 rounded-2xl bg-[#2D0A32]/90 border border-[#6F2B75]/40">
                    <p className="text-white font-bold">Ce nommé n'est pas dans le vote en cours.</p>
                    <Link to="/planning/vote" className="mt-3 inline-block text-sm text-[#EC602B] font-semibold">Voir tous les nommés</Link>
                </div>
            )}

            {data?.isOpen && current && (
                <NomineeProfileView
                    name={displayNameOf(current.candidate)}
                    photoUrl={photoOf(current.candidate)}
                    accomplishments={current.candidate.profile?.accomplishments ?? []}
                    stats={current.candidate.profile?.stats ?? []}
                    monthLabel={formatMonth(data.monthKey)}
                    tone="dark"
                    backHref="/planning/vote"
                    backLabel="Tous les nommés"
                    actions={voteButton(current.candidate)}
                    others={entries.filter((e) => e.slug !== current.slug).map((e) => ({ name: displayNameOf(e.candidate), href: `/planning/vote/${e.slug}` }))}
                />
            )}

            {data?.isOpen && !slug && (
                <div>
                    {entries.length > 0 && (
                        <p className="text-[#ECDDFD]/75 text-sm mb-6">Ouvrez la fiche d'un nommé pour découvrir ses accomplissements et voter pour lui.</p>
                    )}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                        {entries.map(({ candidate, slug: candidateSlug }) => (
                            <li key={candidate.id}>
                                <NomineeCard
                                    name={displayNameOf(candidate)}
                                    photoUrl={photoOf(candidate)}
                                    subtitle={candidate.profile?.stats.find((st) => st.label === 'Projet')?.value}
                                    tone="dark"
                                    href={`/planning/vote/${candidateSlug}`}
                                    footer={
                                        data.myVote === candidate.id ? (
                                            <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-school uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                <CheckCircle size={12} />
                                                Votre vote
                                            </span>
                                        ) : candidate.id === currentUser.id ? (
                                            <span className="mt-2 inline-block text-xs text-[#ECDDFD]/60">C'est vous</span>
                                        ) : null
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                    {data.myVote && (
                        <div className="pt-6">
                            <button
                                type="button"
                                disabled={pendingId !== null || loading}
                                onClick={() => void handleWithdraw()}
                                className="px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:bg-[#6F2B75]/40 hover:text-white border border-[#6F2B75]/40 transition-all disabled:opacity-60"
                            >
                                Retirer mon vote
                            </button>
                        </div>
                    )}
                    {entries.length === 0 && (
                        <p className="text-[#ECDDFD]/70 text-sm">Les candidats de ce vote ne sont pas encore connus. Revenez bientôt.</p>
                    )}
                    {actionError && !needsLogin && <p role="alert" className="text-sm text-red-300 mt-3">{actionError}</p>}
                </div>
            )}
            {data?.bureau && !slug && <VoteBureauPanel data={data} requesterId={currentUser.id} token={currentUser.token ?? ''} onChanged={reload} disabled={pendingId !== null || loading} />}
        </PlanningLayout>
    );
}
