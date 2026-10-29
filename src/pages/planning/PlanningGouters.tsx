import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cookie, RefreshCw } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { useGouters } from '../../hooks/useGouters';
import { formatGouterDate } from '../../data/gouterResponse';
import { addGouterItemApi, addGoutersApi, cancelGouterApi, removeGouterItemApi, setGouterSlotApi, type Gouter } from '../../data/planningData';
import { projectsData } from '../../data/projectsData';
import { GouterSlotsCard } from '../../components/planning/GouterSlotsCard';
import { GouterItemsCard } from '../../components/planning/GouterItemsCard';
import { GouterAddDatesCard } from '../../components/planning/GouterAddDatesCard';
import { cardClass, secondaryButtonClass } from '../../components/planning/childrenStyles';

const projectName = (id: number) => projectsData.find((p) => p.id === id)?.name ?? `Projet ${id}`;

function GouterButton({ gouter, selected, onSelect }: { gouter: Gouter; selected: boolean; onSelect: () => void }) {
    const taken = gouter.slots.reduce((sum, s) => sum + s.users.length, 0);
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`w-full text-left px-5 py-4 rounded-xl border transition-all backdrop-blur-md ${
                selected ? 'bg-[#EC602B]/15 border-[#EC602B]/60 shadow-soft' : 'bg-[#2D0A32]/90 border-[#6F2B75]/40 hover:border-[#EC602B]/50'
            }`}
        >
            <p className="text-white font-bold tracking-wide first-letter:uppercase">{formatGouterDate(gouter.date)}</p>
            <p className="text-[#ECDDFD]/70 text-xs mt-0.5">
                {projectName(gouter.projectId)}
                {gouter.note ? ` · ${gouter.note}` : ''} · {taken} inscription{taken > 1 ? 's' : ''}
            </p>
        </button>
    );
}

export function PlanningGouters() {
    const { currentUser, logout } = usePlanning();
    const navigate = useNavigate();
    const { data, loading, error, errorCode, reload } = useGouters();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionCode, setActionCode] = useState<string | null>(null);

    if (!currentUser) return null;

    const token = currentUser.token ?? '';
    const needsLogin = errorCode === 'unauthenticated' || actionCode === 'unauthenticated';
    const locked = busy || loading;
    // Un goûter sélectionné qui a disparu (annulé, ou hors de l'année) ne doit rien casser : on retombe sur « aucun ».
    const selected = data?.gouters.find((g) => g.id === selectedId) ?? null;
    const upcoming = data?.gouters.filter((g) => !g.isPast) ?? [];
    const past = data?.gouters.filter((g) => g.isPast) ?? [];

    const run = async (action: () => Promise<{ success: boolean; message: string; code?: string }>): Promise<boolean> => {
        setBusy(true);
        setActionError(null);
        setActionCode(null);
        const result = await action();
        if (!result.success) {
            setActionError(result.message);
            setActionCode(result.code ?? null);
        }
        await reload();
        setBusy(false);
        return result.success;
    };

    const handleReconnect = () => {
        logout();
        navigate('/planning/login');
    };

    return (
        <PlanningLayout title="Goûters">
            <div className="mb-8 pt-2">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Cookie size={16} className="text-[#EC602B]" />
                        <span className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">Vie des projets</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">Goûters</h1>
                    <p className="text-[#ECDDFD]/70 text-sm mt-1 max-w-xl leading-relaxed">
                        Chaque projet organise des goûters pour se financer. Inscrivez-vous aux heures où vous pouvez aider et indiquez ce que vous apportez.
                    </p>
                </motion.div>
            </div>

            {loading && !data && <p className="text-[#ECDDFD]/70 text-sm">Chargement...</p>}

            {needsLogin && (
                <div role="alert" className="mb-6 p-5 rounded-xl bg-[#2D0A32]/90 border border-[#EC602B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-[#ECDDFD]/85">Votre session doit être renouvelée. Reconnectez-vous, cela ne prend que quelques secondes.</p>
                    <button type="button" onClick={handleReconnect} className="px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider btn-phoenix-gradient text-white">
                        Se reconnecter
                    </button>
                </div>
            )}

            {error && !needsLogin && (
                <div role="alert" className="mb-6 p-5 rounded-xl bg-[#2D0A32]/90 border border-[#EC602B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-[#ECDDFD]/85">{error}</p>
                    <button type="button" onClick={() => void reload()} disabled={loading} className={`${secondaryButtonClass} flex items-center justify-center gap-2`}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Réessayer
                    </button>
                </div>
            )}

            {data && (
                <div className="space-y-5">
                    <section aria-label="Goûters à venir" className="space-y-3">
                        <h2 className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">À venir</h2>
                        {upcoming.length === 0 && <p className="text-sm text-[#ECDDFD]/70">Aucun goûter n'est prévu pour le moment.</p>}
                        {upcoming.map((g) => (
                            <GouterButton key={g.id} gouter={g} selected={g.id === selectedId} onSelect={() => { setSelectedId(g.id); setConfirmCancel(false); }} />
                        ))}
                    </section>

                    {past.length > 0 && (
                        <details className="group">
                            <summary className="cursor-pointer text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70 mb-3">Goûters passés ({past.length})</summary>
                            <div className="space-y-3">
                                {[...past].reverse().map((g) => (
                                    <GouterButton key={g.id} gouter={g} selected={g.id === selectedId} onSelect={() => { setSelectedId(g.id); setConfirmCancel(false); }} />
                                ))}
                            </div>
                        </details>
                    )}

                    {selected && (
                        <>
                            <GouterSlotsCard
                                key={`slots-${selected.id}`}
                                gouter={selected}
                                currentUserId={currentUser.id}
                                disabled={locked}
                                onToggle={(hour, joined, userId) => void run(() => setGouterSlotApi(currentUser.id, token, selected.id, hour, joined, userId))}
                            />
                            <GouterItemsCard
                                key={`items-${selected.id}`}
                                gouter={selected}
                                disabled={locked}
                                onAdd={(item) => run(() => addGouterItemApi(currentUser.id, token, selected.id, item))}
                                onRemove={(itemId) => void run(() => removeGouterItemApi(currentUser.id, token, itemId))}
                            />
                            {selected.canManage && (
                                <div className={cardClass}>
                                    <h3 className="text-white font-bold tracking-wide mb-1">Gérer ce goûter</h3>
                                    {confirmCancel ? (
                                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                            <p className="text-sm text-[#ECDDFD]/85">Annuler ce goûter ? Il disparaîtra de la liste pour tous.</p>
                                            <span className="flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={locked}
                                                    onClick={() => { setConfirmCancel(false); setSelectedId(null); void run(() => cancelGouterApi(currentUser.id, token, selected.id)); }}
                                                    className="px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider btn-phoenix-gradient text-white disabled:opacity-60"
                                                >
                                                    Confirmer
                                                </button>
                                                <button type="button" onClick={() => setConfirmCancel(false)} className={secondaryButtonClass}>Garder</button>
                                            </span>
                                        </div>
                                    ) : (
                                        <button type="button" disabled={locked} onClick={() => setConfirmCancel(true)} className={secondaryButtonClass}>
                                            Annuler ce goûter
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {data.manageableProjects.length > 0 && (
                        <GouterAddDatesCard
                            projects={data.manageableProjects}
                            disabled={locked}
                            onAdd={(projectId, dates, note) => run(() => addGoutersApi(currentUser.id, token, projectId, dates, note))}
                        />
                    )}

                    {actionError && !needsLogin && <p role="alert" className="text-sm text-red-300">{actionError}</p>}
                </div>
            )}
        </PlanningLayout>
    );
}
