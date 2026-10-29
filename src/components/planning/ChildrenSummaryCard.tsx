import { projectsData } from '../../data/projectsData';
import type { ChildrenData } from '../../data/planningData';
import { cardClass, formatRate } from './childrenStyles';

const projectName = (id: number) => projectsData.find((p) => p.id === id)?.name ?? `Projet ${id}`;

export function ChildrenSummaryCard({ data }: { data: ChildrenData }) {
    const { summary, overview } = data;
    return (
        <div className="space-y-5">
            {summary && (
                <div className={cardClass}>
                    <h3 className="text-white font-bold tracking-wide mb-1">Bilan de l'année {summary.schoolYear}</h3>
                    <p className="text-[#ECDDFD]/70 text-xs mb-4">
                        {summary.sessionCount === 0
                            ? "Aucun appel enregistré cette année."
                            : `${summary.sessionCount} séance${summary.sessionCount > 1 ? 's' : ''} avec appel, ${summary.childCount} enfant${summary.childCount > 1 ? 's' : ''} dans la liste, taux de présence ${formatRate(summary.rate)}.`}
                    </p>
                    {summary.children.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70">
                                        <th className="py-2 pr-4">Enfant</th>
                                        <th className="py-2 px-3 text-right">Séances</th>
                                        <th className="py-2 px-3 text-right">Présences</th>
                                        <th className="py-2 pl-3 text-right">Taux</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#6F2B75]/30">
                                    {summary.children.map((child) => (
                                        <tr key={child.id} className="text-white">
                                            <td className="py-2 pr-4">{child.name}</td>
                                            <td className="py-2 px-3 text-right">{child.sessions}</td>
                                            <td className="py-2 px-3 text-right">{child.present}</td>
                                            <td className="py-2 pl-3 text-right font-bold">{formatRate(child.rate)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            {overview && (
                <div className={cardClass}>
                    <h3 className="text-white font-bold tracking-wide mb-1">Tous les projets (Bureau)</h3>
                    <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-xs font-school uppercase tracking-wider text-[#ECDDFD]/70">
                                    <th className="py-2 pr-4">Projet</th>
                                    <th className="py-2 px-3 text-right">Enfants</th>
                                    <th className="py-2 px-3 text-right">Séances</th>
                                    <th className="py-2 pl-3 text-right">Taux</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#6F2B75]/30">
                                {overview.map((row) => (
                                    <tr key={row.projectId} className="text-white">
                                        <td className="py-2 pr-4">{projectName(row.projectId)}</td>
                                        <td className="py-2 px-3 text-right">{row.childCount}</td>
                                        <td className="py-2 px-3 text-right">{row.sessionCount}</td>
                                        <td className="py-2 pl-3 text-right font-bold">{formatRate(row.rate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
