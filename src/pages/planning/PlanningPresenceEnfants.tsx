import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { usePlanning } from '../../context/PlanningContext';
import { useChildrenData } from '../../hooks/useChildrenData';
import { isStaleChildrenData } from '../../data/childrenResponse';
import { addChildrenApi, getWeekKey, isSlotActiveThisWeek, navigateWeek, removeChildApi, saveChildAttendanceApi, timeSlots } from '../../data/planningData';
import { projectsData } from '../../data/projectsData';
import { ChildrenAttendanceCard } from '../../components/planning/ChildrenAttendanceCard';
import { ChildrenRosterCard } from '../../components/planning/ChildrenRosterCard';
import { ChildrenSummaryCard } from '../../components/planning/ChildrenSummaryCard';
import { secondaryButtonClass } from '../../components/planning/childrenStyles';

const projectName = (id: number) => projectsData.find((p) => p.id === id)?.name ?? `Projet ${id}`;

export function PlanningPresenceEnfants() {
    const { currentUser, logout } = usePlanning();
    const navigate = useNavigate();
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [weekKey, setWeekKey] = useState(() => getWeekKey(new Date()));
    const [slotId, setSlotId] = useState<string | null>(null);
    const { data, loading, error, errorCode, reload } = useChildrenData(selectedProject, weekKey, slotId);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionCode, setActionCode] = useState<string | null>(null);

    if (!currentUser) return null;

    if (currentUser.role !== 'chef_projet' && currentUser.role !== 'bureau') {
        return (
            <PlanningLayout title="Présence enfants">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <ShieldCheck size={48} className="text-white/20 mb-4" />
                    <p className="text-white font-bold text-lg">Accès restreint</p>
                    <p className="text-white/40 text-sm mt-1">Cette page est réservée aux chefs de projet et au Bureau.</p>
                </div>
            </PlanningLayout>
        );
    }

    const token = currentUser.token ?? '';
    const needsLogin = errorCode === 'unauthenticated' || actionCode === 'unauthenticated';
    // Le projet de la réponse fait foi : c'est celui dont l'appel et la liste sont affichés.
    const projectId = data?.projectId ?? null;
    // Après un échec de chargement, `data` peut être celui d'une autre semaine, séance ou projet : on ne l'affiche plus,
    // pour ne jamais enregistrer un appel sur autre chose que ce que l'écran annonce.
    const stale = isStaleChildrenData(data, selectedProject, weekKey, slotId);
    const showCards = data !== null && projectId !== null && (!stale || loading);
    const locked = busy || loading || stale;
    const projectSlots = projectId === null ? [] : timeSlots.filter((slot) => slot.projectId === projectId && isSlotActiveThisWeek(slot.id, weekKey));

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
        <PlanningLayout title="Présence enfants">
            <div className="mb-8 pt-2">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <ClipboardCheck size={16} className="text-[#EC602B]" />
                        <span className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">Vie des projets</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">Présence enfants</h1>
                    <p className="text-[#ECDDFD]/70 text-sm mt-1 max-w-xl leading-relaxed">
                        Tenez la liste des enfants de votre projet et faites l'appel à chaque séance.
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

            {data && data.projects.length === 0 && (
                <p className="text-sm text-[#ECDDFD]/70">Aucun projet n'est rattaché à votre compte. Contactez le Bureau.</p>
            )}

            {data && showCards && projectId !== null && (
                <div className="space-y-5">
                    {data.projects.length > 1 && (
                        <div>
                            <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70 mb-1" htmlFor="children-project">Projet</label>
                            <select
                                id="children-project"
                                value={projectId}
                                disabled={locked}
                                onChange={(e) => {
                                    setSelectedProject(Number(e.target.value));
                                    setSlotId(null);
                                }}
                                className="px-4 py-2.5 rounded-full bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm"
                            >
                                {data.projects.map((id) => (
                                    <option key={id} value={id}>{projectName(id)}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {data.projects.length === 1 && <p className="text-white font-bold tracking-wide">{projectName(projectId)}</p>}

                    <ChildrenAttendanceCard
                        key={`${projectId}|${data.weekKey}|${data.slotId ?? 'none'}|${data.attendance ? data.attendance.presentIds.join(',') : 'none'}|${data.children.length}`}
                        data={data}
                        weekKey={weekKey}
                        slotId={slotId}
                        slots={projectSlots}
                        disabled={locked}
                        onWeekChange={(direction) => {
                            setWeekKey(navigateWeek(weekKey, direction));
                            setSlotId(null);
                        }}
                        onSlotChange={setSlotId}
                        onSave={async (presentIds) => {
                            if (data.slotId === null) return;
                            await run(() => saveChildAttendanceApi(currentUser.id, token, projectId, data.slotId as string, data.weekKey, presentIds));
                        }}
                    />
                    <ChildrenRosterCard
                        data={data}
                        disabled={locked}
                        onAdd={(names) => run(() => addChildrenApi(currentUser.id, token, projectId, names))}
                        onRemove={async (childId) => {
                            await run(() => removeChildApi(currentUser.id, token, projectId, childId));
                        }}
                    />
                    <ChildrenSummaryCard data={data} />
                    {actionError && !needsLogin && <p role="alert" className="text-sm text-red-300">{actionError}</p>}
                </div>
            )}
        </PlanningLayout>
    );
}
