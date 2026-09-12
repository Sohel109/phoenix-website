import { motion } from 'framer-motion';
import { Printer, X, ShieldCheck, Award } from 'lucide-react';
import type { PlanningUser, Booking } from '../../data/planningData';
import { timeSlots, getSlotDuration } from '../../data/planningData';
import { projectsData } from '../../data/projectsData';

interface AttestationModalProps {
    user: PlanningUser;
    bookings: Booking[];
    onClose: () => void;
}

export function AttestationModal({ user, bookings, onClose }: AttestationModalProps) {
    const myConfirmedBookings = bookings.filter(b => b.userId === user.id && b.status === 'confirme');

    const totalHours = myConfirmedBookings.reduce((sum, b) => {
        const slot = timeSlots.find(s => s.id === b.slotId);
        return sum + (slot ? getSlotDuration(slot) : 0);
    }, 0);

    // Breakdown per project
    const projectBreakdown = user.projectIds.map(projId => {
        const project = projectsData.find(p => p.id === projId);
        const projBookings = myConfirmedBookings.filter(b => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            return slot && slot.projectId === projId;
        });
        const hours = projBookings.reduce((sum, b) => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            return sum + (slot ? getSlotDuration(slot) : 0);
        }, 0);
        return { project, hours, count: projBookings.length };
    }).filter(p => p.project);

    const todayStr = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const refNumber = `PHX-ATT-${new Date().getFullYear()}-${user.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white text-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-10 relative my-8 print:shadow-none print:max-w-none print:w-full print:p-8 print:m-0 print:rounded-none"
            >
                {/* Non-printable action bar */}
                <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-200 print:hidden">
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                        <Award size={20} />
                        <span>Attestation Officielle Bénévolat</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
                        >
                            <Printer size={15} />
                            <span>Imprimer / Télécharger PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* --- PRINTABLE ATTESTATION CONTENT --- */}
                <div className="space-y-6 text-zinc-800">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-orange-500 pb-5">
                        <div className="flex items-center gap-4">
                            <img
                                src="/app-icon.png"
                                alt="Phoenix EDC Logo"
                                className="w-16 h-16 object-contain"
                            />
                            <div>
                                <h1 className="font-black text-xl tracking-tight text-zinc-900 uppercase">
                                    Phoenix Égalité des Chances
                                </h1>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Association d'Intérêt Général (Loi 1901) · KEDGE Business School Marseille
                                </p>
                                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                    Réf : {refNumber}
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:block text-right text-xs text-zinc-400">
                            <p className="font-semibold text-zinc-700">Domaine de Luminy</p>
                            <p>13009 Marseille</p>
                            <p>phoenixedc.asso@gmail.com</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center py-4">
                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-wide">
                            Attestation d'Engagement Bénévolat
                        </h2>
                        <p className="text-sm font-semibold text-orange-600 mt-1">
                            Année Académique 2025–2026
                        </p>
                    </div>

                    {/* Official Statement */}
                    <div className="text-sm leading-relaxed text-zinc-700 space-y-4">
                        <p>
                            Le Bureau de l'association <strong>Phoenix Égalité des Chances</strong> certifie par la présente que :
                        </p>
                        <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-4 text-center my-3">
                            <p className="text-xl font-black text-zinc-900">{user.name}</p>
                            <p className="text-xs font-semibold text-orange-700 mt-0.5">
                                Statut : {user.role === 'chef_projet' ? 'Chef de Projet' : user.role === 'bureau' ? 'Membre du Bureau' : 'Tuteur Bénévolat'}
                            </p>
                        </div>
                        <p>
                            a participé de manière active et régulière aux actions de tutorat pédagogique, d'aide aux devoirs et d'ouverture culturelle dispensées auprès des élèves accompagnés par l'association dans les Quartiers Prioritaires de la Ville (QPV) de Marseille.
                        </p>
                    </div>

                    {/* Breakdown Table */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Récapitulatif des heures validées
                        </h3>
                        <table className="w-full text-xs text-left border border-zinc-200 rounded-lg overflow-hidden">
                            <thead className="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-200">
                                <tr>
                                    <th className="p-3">Programme / Projet</th>
                                    <th className="p-3 text-center">Séances effectives</th>
                                    <th className="p-3 text-right">Volume Horaire Validé</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {projectBreakdown.map(({ project, hours, count }) => (
                                    <tr key={project?.id}>
                                        <td className="p-3 font-semibold text-zinc-900">{project?.name}</td>
                                        <td className="p-3 text-center text-zinc-600">{count} séance{count > 1 ? 's' : ''}</td>
                                        <td className="p-3 text-right font-bold text-zinc-900">{hours} h</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-zinc-50 font-bold border-t-2 border-zinc-300">
                                <tr>
                                    <td className="p-3 text-sm text-zinc-900">Total d'Heures Réalisées</td>
                                    <td className="p-3"></td>
                                    <td className="p-3 text-right text-base text-orange-600 font-black">
                                        {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)} h
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Legal note */}
                    <p className="text-xs text-zinc-500 italic leading-relaxed pt-2">
                        Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit, notamment dans le cadre de la validation de son engagement étudiant ou de son parcours associatif.
                    </p>

                    {/* Footer / Signature */}
                    <div className="pt-8 flex justify-between items-end border-t border-zinc-200">
                        <div>
                            <p className="text-xs text-zinc-500">Fait à Marseille, le {todayStr}</p>
                            <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold mt-2">
                                <ShieldCheck size={14} />
                                <span>Document certifié par le registre Phoenix</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-xs font-bold text-zinc-900">Le Bureau Phoenix EDC</p>
                            <p className="text-[10px] text-zinc-500">Elsa ALD · Présidente</p>
                            <div className="mt-2 w-28 h-12 mx-auto border-2 border-dashed border-orange-300 rounded-lg flex items-center justify-center text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50/50">
                                TAMPAX PHX
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
