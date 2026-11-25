import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Plus, RefreshCw } from 'lucide-react';
import { PlanningLayout } from './PlanningLayout';
import { PlanningPageHeader } from '../../components/planning/PlanningPageHeader';
import { NewsEditor } from '../../components/planning/NewsEditor';
import { NewsPublishersPanel } from '../../components/planning/NewsPublishersPanel';
import { primaryButtonClass, secondaryButtonClass } from '../../components/planning/childrenStyles';
import { usePlanning } from '../../context/PlanningContext';
import { fetchNewsAdmin, publicImageUrl } from '../../data/planningData';
import { formatNewsDate, type AdminArticle, type NewsAdmin } from '../../data/news';

export function PlanningActualites() {
    const { currentUser, logout } = usePlanning();
    const navigate = useNavigate();
    const [data, setData] = useState<NewsAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<{ message: string; code?: string } | null>(null);
    const [editing, setEditing] = useState<AdminArticle | 'new' | null>(null);
    const userId = currentUser?.id ?? '';
    const token = currentUser?.token ?? '';

    const reload = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        const result = await fetchNewsAdmin(userId, token);
        if (result.ok) {
            setData(result.data);
            setError(null);
        } else {
            setError({ message: result.message, code: result.code });
        }
        setLoading(false);
    }, [userId, token]);

    useEffect(() => {
        void reload();
    }, [reload]);

    if (!currentUser) return null;

    const reconnect = () => {
        logout();
        navigate('/planning/login');
    };

    return (
        <PlanningLayout title="Actualités">
            <PlanningPageHeader
                icon={<Newspaper size={16} />}
                section="Mon activité"
                title="Actualités"
                description="Publiez les nouvelles de l'association : elles apparaissent sur la page Actualités du site public, l'accueil et le pied de page."
                actions={
                    data ? (
                        <button type="button" onClick={() => setEditing('new')} className={`${primaryButtonClass} inline-flex items-center gap-2`}>
                            <Plus size={14} />
                            Nouvel article
                        </button>
                    ) : undefined
                }
            />

            {loading && !data && <p className="text-[#ECDDFD]/70 text-sm">Chargement...</p>}

            {error && (
                <div role="alert" className="mb-6 p-5 rounded-2xl bg-[#2D0A32]/90 border border-[#EC602B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-[#ECDDFD]/85">
                        {error.code === 'forbidden' ? "Vous n'avez pas accès à cette page." : error.code === 'unauthenticated' ? 'Votre session doit être renouvelée. Reconnectez-vous, cela ne prend que quelques secondes.' : error.message}
                    </p>
                    {error.code === 'unauthenticated' ? (
                        <button type="button" onClick={reconnect} className={primaryButtonClass}>Se reconnecter</button>
                    ) : error.code !== 'forbidden' ? (
                        <button type="button" onClick={() => void reload()} disabled={loading} className={`${secondaryButtonClass} flex items-center justify-center gap-2`}>
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Réessayer
                        </button>
                    ) : null}
                </div>
            )}

            {data && data.articles.length === 0 && (
                <p className="p-6 rounded-xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 text-sm text-[#ECDDFD]/75">Aucun article pour l'instant. Cliquez sur « Nouvel article » pour écrire le premier.</p>
            )}

            {data && data.articles.length > 0 && (
                <ul className="space-y-3">
                    {data.articles.map((article) => (
                        <li key={article.id}>
                            <button
                                type="button"
                                onClick={() => setEditing(article)}
                                className="w-full text-left flex items-center gap-4 p-3 sm:p-4 rounded-xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 hover:border-[#EC602B]/50 transition-colors"
                            >
                                <span className="shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-[#6F2B75] to-[#2A082D] flex items-center justify-center">
                                    {article.published && article.coverId ? (
                                        <img src={publicImageUrl(article.coverId)} alt="" loading="lazy" className="w-full h-full object-cover" />
                                    ) : (
                                        <Newspaper size={18} className="text-[#ECDDFD]/40" aria-hidden="true" />
                                    )}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-white font-semibold truncate">{article.title || 'Sans titre'}</span>
                                    <span className="block mt-0.5 text-xs text-[#ECDDFD]/60">
                                        {article.published ? `Publié le ${formatNewsDate(article.publishedAt)}` : 'Non publié'}
                                        {article.updatedByName ? ` · modifié par ${article.updatedByName}` : ''}
                                    </span>
                                </span>
                                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-school font-bold uppercase tracking-wider ${article.published ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-[#ECDDFD]/70'}`}>
                                    {article.published ? 'En ligne' : 'Non publié'}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {data?.isBureau && data.members && <NewsPublishersPanel members={data.members} requesterId={userId} token={token} onChanged={reload} />}

            {editing && (
                <NewsEditor
                    key={editing === 'new' ? 'new' : editing.id}
                    article={editing === 'new' ? null : editing}
                    requesterId={userId}
                    token={token}
                    onClose={() => setEditing(null)}
                    onChanged={reload}
                />
            )}
        </PlanningLayout>
    );
}
