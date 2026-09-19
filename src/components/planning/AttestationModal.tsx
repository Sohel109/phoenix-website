import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, X, ShieldCheck, Award, AlertCircle, Clock, Loader2, Sparkles } from 'lucide-react';
import type { PlanningUser, Booking } from '../../data/planningData';
import { timeSlots, getSlotDuration } from '../../data/planningData';
import { projectsData } from '../../data/projectsData';
import { getBureauPresident } from '../../data/teamData';
import { usePlanning } from '../../context/PlanningContext';

interface AttestationModalProps {
    user: PlanningUser;
    bookings: Booking[];
    onClose: () => void;
}

export function AttestationModal({ user, bookings, onClose }: AttestationModalProps) {
    const { manualHours, isQuotaExempt } = usePlanning();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [president, setPresident] = useState(() => getBureauPresident());

    // Seuil officiel d'heures pour valider l'attestation définitive
    const ATTESTATION_THRESHOLD = 50;

    // Bloquer le scroll d'arrière-plan et écouter la touche Échap
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        setPresident(getBureauPresident());

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    // Filtrer les créneaux confirmés du bénévole
    const myConfirmedBookings = bookings.filter(b => b.userId === user.id && b.status === 'confirme');

    const slotHours = myConfirmedBookings.reduce((sum, b) => {
        const slot = timeSlots.find(s => s.id === b.slotId);
        return sum + (slot ? getSlotDuration(slot) : 0);
    }, 0);

    // Heures manuelles / exceptionnelles accordées par le Bureau
    const userManualHours = manualHours.filter(m => m.userId === user.id);
    const totalManualHours = userManualHours.reduce((sum, m) => sum + m.hours, 0);

    // Total consolidé
    const totalHours = slotHours + totalManualHours;
    const isExempt = isQuotaExempt(user.id);
    const isValidated = isExempt || totalHours >= ATTESTATION_THRESHOLD;
    const remainingHours = Math.max(0, ATTESTATION_THRESHOLD - totalHours);

    // Répartition par projet (créneaux de planning)
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

    // Téléchargement direct au format PDF via html2pdf
    const handleDownloadPdf = async () => {
        const element = document.getElementById('printable-attestation-content');
        if (!element) return;

        setIsGeneratingPdf(true);
        try {
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            const opt = {
                margin: [8, 10, 8, 10] as [number, number, number, number],
                filename: `Attestation_Phoenix_${user.name.replace(/\s+/g, '_')}_${new Date().getFullYear()}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('Erreur génération PDF directe, bascule impression:', err);
            window.print();
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div
            id="printable-attestation-container"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 md:p-8 flex justify-center items-start print:p-0 print:bg-white"
        >
            {/* Bouton de fermeture flottant garanti visible sur tout écran */}
            <button
                type="button"
                onClick={onClose}
                className="fixed top-4 right-4 z-[110] bg-[#2A082D]/95 hover:bg-[#6F2B75] text-white border border-[#6F2B75]/60 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-2 font-school text-xs tracking-wider uppercase transition-all print:hidden cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                title="Fermer (Échap)"
                aria-label="Fermer l'attestation"
            >
                <X size={16} />
                <span className="hidden sm:inline">Fermer</span>
            </button>

            {/* Document blanc A4 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                id="printable-attestation-content"
                className="bg-white text-zinc-900 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-10 relative my-4 sm:my-8 print:shadow-none print:max-w-none print:w-full print:p-8 print:m-0 print:rounded-none"
            >
                {/* ── BARRE D'ACTIONS DU HAUT (NON IMPRIMABLE) ────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-200 print:hidden">
                    <div className="flex items-center gap-2 text-[#EC602B] font-school uppercase tracking-wider font-bold text-xs">
                        <Award size={18} />
                        <span>
                            {isValidated
                                ? "Attestation Officielle Validée (50h+)"
                                : `Pré-Attestation d'Engagement (${totalHours}h / ${ATTESTATION_THRESHOLD}h)`}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="btn-phoenix-gradient flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-white font-school text-xs uppercase tracking-wider shadow-soft transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                            title="Télécharger directement le fichier PDF"
                        >
                            {isGeneratingPdf ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : (
                                <Download size={15} />
                            )}
                            <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-school text-xs uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                            title="Imprimer ou enregistrer au format PDF"
                        >
                            <Printer size={15} />
                            <span className="hidden sm:inline">Imprimer</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                            title="Fermer la modale"
                            aria-label="Fermer la modale d'attestation"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── BANNIÈRE SEUIL 50H (NON IMPRIMABLE) ────────────────────────── */}
                {isExempt ? (
                    <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-3 text-purple-900 print:hidden text-xs">
                        <ShieldCheck size={18} className="shrink-0 text-purple-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-purple-950 font-school uppercase tracking-wider">
                                🎓 Membre renouvelant · Quota 50h statutaire déjà certifié (Année précédente)
                            </p>
                            <p className="mt-1 text-purple-800 leading-relaxed font-sans">
                                Ce bénévole a déjà accompli son quota d'engagement de 50 heures lors de son mandat précédent. Les <strong>{totalHours} heure(s)</strong> enregistrées cette année représentent un investissement complémentaire d'excellence. L'attestation est immédiatement valide.
                            </p>
                        </div>
                    </div>
                ) : !isValidated ? (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 print:hidden text-xs">
                        <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-950 font-school uppercase tracking-wider">
                                Seuil officiel d'attestation : 50 heures ({totalHours}h / 50h validées)
                            </p>
                            <p className="mt-1 text-amber-850 leading-relaxed font-sans">
                                L'attestation officielle d'engagement n'est définitivement validée qu'à partir de <strong>50 heures d'engagement</strong> (reste : {remainingHours}h). Ce document est une <strong>pré-attestation provisoire</strong> reflétant fidèlement votre progression dans le registre Phoenix.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900 print:hidden text-xs">
                        <ShieldCheck size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                        <div>
                            <p className="font-bold text-emerald-950 font-school uppercase tracking-wider">
                                ✅ Engagement complet validé : {totalHours}h effectuées
                            </p>
                            <p className="mt-1 text-emerald-800 leading-relaxed font-sans">
                                Félicitations ! Vous avez atteint et validé le seuil officiel de 50 heures. Cette attestation est définitive, certifiée conforme et téléchargeable pour vos démarches universitaires ou professionnelles.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── CONTENU OFFICIEL IMPRIMABLE DE L'ATTESTATION ───────────────── */}
                <div className="space-y-6 text-zinc-800 font-sans">
                    {/* Header Officiel */}
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
                            <p>Rue Antoine Bourdelle</p>
                            <p>13009 Marseille</p>
                            <p className="font-mono text-[11px] text-zinc-500 mt-0.5">phoenixedc.asso@gmail.com</p>
                        </div>
                    </div>

                    {/* Titre du Document */}
                    <div className="text-center py-3">
                        <h2 className="text-2xl font-black text-zinc-900 uppercase tracking-wide">
                            {isValidated
                                ? "Attestation d'Engagement Bénévolat"
                                : "Attestation Provisoire d'Engagement Bénévolat"}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mt-1.5">
                            <p className="text-sm font-semibold text-orange-600">
                                Année Académique 2025–2026
                            </p>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                isExempt
                                    ? "bg-purple-100 text-purple-900 border-purple-300"
                                    : isValidated
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}>
                                {isExempt
                                    ? `Validée · Quota N-1 acquis (+${totalHours}h en 2025-2026)`
                                    : isValidated
                                    ? `Validée · ${totalHours}h effectuées`
                                    : `En cours · ${totalHours}h / ${ATTESTATION_THRESHOLD}h requises`}
                            </span>
                        </div>
                    </div>

                    {/* Déclaration Officielle */}
                    <div className="text-sm leading-relaxed text-zinc-700 space-y-4">
                        <p>
                            Le Bureau de l'association <strong>Phoenix Égalité des Chances</strong> certifie par la présente que :
                        </p>
                        <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-4 text-center my-3">
                            <p className="text-xl font-black text-zinc-900">{user.name}</p>
                            <p className="text-xs font-bold text-orange-700 mt-1 uppercase tracking-wider">
                                Statut : {user.role === 'chef_projet' ? 'Chef de Projet' : user.role === 'bureau' ? 'Membre du Bureau' : 'Tuteur Bénévolat'}
                                {isExempt && " · Membre Renouvelant"}
                            </p>
                        </div>

                        {isExempt ? (
                            <p>
                                a d'ores et déjà satisfait avec assiduité à l'obligation statutaire d'engagement de 50 heures au titre de son mandat précédent (2024–2025, membre renouvelant). Au cours de la présente année académique 2025–2026, l'intéressé(e) poursuit activement son investissement bénévole avec <strong>{totalHours} heure(s)</strong> validée(s) au registre officiel de l'association.
                            </p>
                        ) : isValidated ? (
                            <p>
                                a accompli avec succès, régularité et assiduité son engagement bénévole auprès des élèves accompagnés par l'association dans les Quartiers Prioritaires de la Ville (QPV) de Marseille pour l'année académique 2025–2026. Le volume total validé de <strong>{totalHours} heures</strong> satisfait et valide pleinement le seuil officiel de 50 heures requis pour la reconnaissance associative étudiante.
                            </p>
                        ) : totalHours > 0 ? (
                            <p>
                                est activement engagé(e) au sein des programmes de tutorat pédagogique et d'ouverture citoyenne de l'association pour l'année universitaire 2025–2026. À ce jour, <strong>{totalHours} heure(s)</strong> ont été officiellement validées au registre sur le volume de <strong>{ATTESTATION_THRESHOLD} heures</strong> requis pour la validation définitive complète du parcours associatif.
                            </p>
                        ) : (
                            <p>
                                est dûment inscrit(e) et engagé(e) au sein de l'association en qualité de bénévole pour l'année universitaire 2025–2026. À ce jour, les séances de tutorat sont en cours de planification ou en attente de validation administrative dans le registre Phoenix (0h / {ATTESTATION_THRESHOLD}h requises). Le présent document atteste de sa participation officielle en cours.
                            </p>
                        )}
                    </div>

                    {/* Tableau Récapitulatif avec Heures Manuelles */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Récapitulatif des heures validées au registre
                        </h3>
                        <table className="w-full text-xs text-left border border-zinc-200 rounded-xl overflow-hidden">
                            <thead className="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-200">
                                <tr>
                                    <th className="p-3">Programme / Mission</th>
                                    <th className="p-3 text-center">Type de validation</th>
                                    <th className="p-3 text-right">Volume Validé</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200">
                                {/* Ligne Quota N-1 validé pour membre renouvelant */}
                                {isExempt && (
                                    <tr className="bg-purple-50/60">
                                        <td className="p-3 font-semibold text-purple-950">
                                            Validation Statutaire Antérieure (Mandat 2024–2025)
                                            <span className="block text-[10px] text-purple-700 font-normal">Quota de 50h requis déjà certifié au titre de l'année N-1</span>
                                        </td>
                                        <td className="p-3 text-center text-purple-800 font-medium text-[11px]">
                                            Acquis (Renouvelant)
                                        </td>
                                        <td className="p-3 text-right font-bold text-purple-900 tabular-nums">
                                            50 h
                                        </td>
                                    </tr>
                                )}

                                {/* Heures de séances de tutorat confirmées */}
                                {projectBreakdown.map(({ project, hours, count }) => (
                                    <tr key={project?.id}>
                                        <td className="p-3 font-semibold text-zinc-900">{project?.name}</td>
                                        <td className="p-3 text-center text-zinc-600 tabular-nums">{count} séance{count > 1 ? 's' : ''} effective{count > 1 ? 's' : ''}</td>
                                        <td className="p-3 text-right font-bold text-zinc-900 tabular-nums">{hours} h</td>
                                    </tr>
                                ))}

                                {/* Heures manuelles / valorisations Bureau avec motif obligatoire */}
                                {userManualHours.map(mh => (
                                    <tr key={mh.id} className="bg-orange-50/40">
                                        <td className="p-3 font-semibold text-zinc-900">
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles size={12} className="text-[#EC602B] shrink-0" />
                                                <span>Mission exceptionnelle : {mh.reason}</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                Validé par {mh.grantedBy} ({new Date(mh.createdAt).toLocaleDateString('fr-FR')})
                                            </p>
                                        </td>
                                        <td className="p-3 text-center text-orange-700 font-medium text-[11px]">
                                            Valorisation Bureau
                                        </td>
                                        <td className="p-3 text-right font-bold text-orange-600 tabular-nums">
                                            +{mh.hours} h
                                        </td>
                                    </tr>
                                ))}

                                {projectBreakdown.length === 0 && userManualHours.length === 0 && !isExempt && (
                                    <tr>
                                        <td className="p-3 text-zinc-500 italic" colSpan={2}>
                                            {user.projectIds.length > 0
                                                ? `Projets affectés : ${user.projectIds.map(id => projectsData.find(p => p.id === id)?.name || id).join(', ')} (Séances en cours de validation)`
                                                : "Aucun projet affecté"}
                                        </td>
                                        <td className="p-3 text-right font-bold text-zinc-500 tabular-nums">0 h</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-zinc-50 font-bold border-t-2 border-zinc-300">
                                <tr>
                                    <td className="p-3 text-sm text-zinc-900">
                                        {isExempt ? "Total Heures 2025–2026 (Année en cours)" : "Total d'Heures Consolidé"}
                                    </td>
                                    <td className="p-3 text-center text-xs font-mono text-zinc-500 tabular-nums">
                                        {isExempt ? "Quota 50h acquis N-1" : isValidated ? "Seuil officiel 50h atteint" : `Reste : ${remainingHours}h`}
                                    </td>
                                    <td className={`p-3 text-right text-base font-black tabular-nums ${isValidated ? 'text-emerald-600' : 'text-orange-600'}`}>
                                        {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)} h
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Mention Légale */}
                    <p className="text-xs text-zinc-500 italic leading-relaxed pt-2">
                        Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit, notamment dans le cadre de la validation de son engagement associatif étudiant, de son bonus engagement ou de son parcours citoyen.
                    </p>

                    {/* Pied de Page & Signature Dynamique */}
                    <div className="pt-6 flex justify-between items-end border-t border-zinc-200">
                        <div>
                            <p className="text-xs text-zinc-500">Fait à Marseille, le {todayStr}</p>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold mt-2">
                                {isValidated ? (
                                    <>
                                        <ShieldCheck size={15} className="text-emerald-600" />
                                        <span className="text-emerald-700">Document officiel certifié · Seuil 50h validé</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock size={15} className="text-amber-600" />
                                        <span className="text-amber-700">Pré-attestation · {totalHours}h / 50h (En cours)</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Signature Dynamique du Président en exercice */}
                        <div className="text-center">
                            <p className="text-xs font-bold text-zinc-900">Le Bureau Phoenix EDC</p>
                            <p className="text-[11px] text-zinc-700 font-semibold mt-0.5">
                                {president.name} · {president.role}
                            </p>
                            <div className="mt-2 w-28 h-12 mx-auto border-2 border-dashed border-orange-300 rounded-xl flex items-center justify-center text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50/50">
                                TAMPON PHX
                            </div>
                        </div>
                    </div>

                    {/* QR Code d'authentification certifié */}
                    <div className="mt-4 pt-4 border-t border-zinc-200 flex justify-between items-center">
                        <div className="flex-1">
                            <p className="text-[10px] text-zinc-500 font-mono">Réf. : {refNumber}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                                Document délivré par l'Association Phoenix Égalité des Chances<br />
                                Enregistrée à la Préfecture des Bouches-du-Rhône · KEDGE Business School Marseille
                            </p>
                        </div>
                        {/* QR Code dynamique via api.qrserver.com */}
                        <div className="flex flex-col items-center gap-1 ml-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&color=2A082D&bgcolor=FFFFFF&data=${encodeURIComponent(`https://phoenixedc.fr/verifier?ref=${refNumber}&u=${user.id}&h=${totalHours}&y=${new Date().getFullYear()}`)}`}
                                alt={`QR Code attestation ${refNumber}`}
                                width={80}
                                height={80}
                                className="rounded border border-zinc-200"
                                crossOrigin="anonymous"
                            />
                            <span className="text-[9px] text-zinc-400 font-mono text-center">Scanner pour vérifier</span>
                        </div>
                    </div>
                </div>


                {/* ── PIED DE MODALE (NON IMPRIMABLE) ────────────────────────────── */}
                <div className="mt-8 pt-6 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 print:hidden">
                    <span className="font-mono text-[11px]">Réf : {refNumber}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-school uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                    >
                        Fermer l'aperçu
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
