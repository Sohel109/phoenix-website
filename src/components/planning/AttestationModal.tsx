import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, X, ShieldCheck, Award, AlertCircle, Clock, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import type { PlanningUser, Booking } from '../../data/planningData';
import { timeSlots, getSlotDuration } from '../../data/planningData';
import { projectsData } from '../../data/projectsData';
import { getBureauPresident } from '../../data/teamData';
import { usePlanning } from '../../context/PlanningContext';
import { getAcademicYear } from '../../utils/academicYear';

interface AttestationModalProps {
    user: PlanningUser;
    bookings: Booking[];
    onClose: () => void;
}


export function AttestationModal({ user, bookings, onClose }: AttestationModalProps) {
    const { manualHours, isQuotaExempt } = usePlanning();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [president, setPresident] = useState(() => getBureauPresident());
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

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

    const { academicYear, academicYearSlug, previousAcademicYear } = getAcademicYear();

    const todayStr = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const refNumber = `PHX-ATT-${new Date().getFullYear()}-${user.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

    // URL officielle de vérification pour le QR code
    const verificationUrl = `https://www.phoenix-egalite-des-chances.com/verifier?ref=${encodeURIComponent(refNumber)}&name=${encodeURIComponent(user.name)}&role=${encodeURIComponent(user.role)}&hours=${totalHours}&valid=${isValidated ? '1' : '0'}&status=${encodeURIComponent(isExempt ? 'Renouvelant' : isValidated ? 'Valide' : 'En cours')}&y=${encodeURIComponent(academicYear)}`;

    // Pré-génération du QR code en base64 pour un rendu immédiat et sans latence dans html2pdf
    useEffect(() => {
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=2A082D&bgcolor=FFFFFF&margin=1&data=${encodeURIComponent(verificationUrl)}`;
        fetch(qrApiUrl)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setQrDataUrl(reader.result as string);
                };
                reader.readAsDataURL(blob);
            })
            .catch(() => {
                setQrDataUrl(qrApiUrl);
            });
    }, [verificationUrl]);

    // Téléchargement direct au format PDF via html2pdf (ciblage strict de la feuille A4)
    const handleDownloadPdf = async () => {
        const element = document.getElementById('official-certificate-a4');
        if (!element) return;

        setIsGeneratingPdf(true);
        try {
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            const opt = {
                margin: 0,
                filename: `Attestation_Phoenix_${user.name.replace(/\s+/g, '_')}_${academicYearSlug}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 794
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait' as const
                },
                pagebreak: { mode: ['avoid-all'] }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('Erreur génération PDF directe, bascule impression native:', err);
            window.print();
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const userRoleLabel = user.role === 'chef_projet'
        ? 'Chef de Projet Tutorat'
        : user.role === 'bureau'
        ? 'Membre du Bureau Exécutif'
        : 'Tuteur / Bénévole Accompagnateur';

    return (
        <div
            id="printable-attestation-container"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible"
        >
            {/* Règles CSS pour impression papier / PDF navigateur parfaite */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #official-certificate-a4, #official-certificate-a4 * {
                        visibility: visible !important;
                    }
                    #official-certificate-a4 {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        margin: 0 !important;
                        padding: 12mm 15mm !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                }
            `}</style>

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

            {/* Enveloppe de la modale */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-[850px] w-full flex flex-col items-center my-2 sm:my-6 print:m-0 print:p-0 print:max-w-none"
            >
                {/* ── BARRE D'ACTIONS DU HAUT (NON IMPRIMABLE) ────────────────────── */}
                <div className="bg-[#2A082D] text-white rounded-2xl p-4 sm:p-5 w-full mb-4 shadow-xl border border-[#6F2B75]/40 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
                    <div className="flex items-center gap-3 text-left">
                        <div className={`p-2.5 rounded-xl ${isValidated ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            <Award size={22} />
                        </div>
                        <div>
                            <p className="font-school text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                                {isValidated
                                    ? "Attestation Officielle Validée (50h+)"
                                    : `Pré-Attestation d'Engagement (${totalHours}h / ${ATTESTATION_THRESHOLD}h)`}
                            </p>
                            <p className="text-[11px] text-white/70 font-sans mt-0.5">
                                Conforme au barème de reconnaissance associative KEDGE Business School
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="btn-phoenix-gradient flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white font-school text-xs uppercase tracking-wider shadow-soft transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#EC602B]"
                            title="Télécharger le fichier PDF officiel (1 page A4 propre)"
                        >
                            {isGeneratingPdf ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-school text-xs uppercase tracking-wider transition-colors cursor-pointer active:scale-[0.98] border border-white/15"
                            title="Imprimer ou enregistrer via le navigateur"
                        >
                            <Printer size={16} />
                            <span className="hidden sm:inline">Imprimer</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 border border-white/15"
                            title="Fermer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── BANNIÈRE STATUT / EXPLICATION (NON IMPRIMABLE) ───────────────── */}
                <div className="w-full mb-4 print:hidden">
                    {isExempt ? (
                        <div className="p-4 rounded-2xl bg-purple-950/70 border border-purple-400/40 text-purple-100 flex items-start gap-3 text-xs shadow-md backdrop-blur-sm">
                            <ShieldCheck size={20} className="shrink-0 text-purple-300 mt-0.5" />
                            <div>
                                <p className="font-bold text-white font-school uppercase tracking-wider">
                                    Membre renouvelant · Quota 50h statutaire déjà certifié (Année précédente)
                                </p>
                                <p className="mt-1 text-purple-200 leading-relaxed font-sans">
                                    Ce bénévole a déjà accompli son quota d'engagement de 50 heures lors de son mandat précédent. Les <strong>{totalHours} heure(s)</strong> enregistrées cette année représentent un investissement complémentaire d'excellence. L'attestation est immédiatement valide et certifiée.
                                </p>
                            </div>
                        </div>
                    ) : !isValidated ? (
                        <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-400/40 text-amber-100 flex items-start gap-3 text-xs shadow-md backdrop-blur-sm">
                            <AlertCircle size={20} className="shrink-0 text-amber-300 mt-0.5" />
                            <div>
                                <p className="font-bold text-white font-school uppercase tracking-wider">
                                    Seuil officiel d'attestation : 50 heures ({totalHours}h / 50h validées)
                                </p>
                                <p className="mt-1 text-amber-200 leading-relaxed font-sans">
                                    L'attestation officielle d'engagement n'est définitivement validée qu'à partir de <strong>50 heures d'engagement</strong> (reste : {remainingHours}h). Ce document est une <strong>pré-attestation provisoire</strong> reflétant fidèlement votre progression dans le registre Phoenix.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-400/40 text-emerald-100 flex items-start gap-3 text-xs shadow-md backdrop-blur-sm">
                            <CheckCircle2 size={20} className="shrink-0 text-emerald-300 mt-0.5" />
                            <div>
                                <p className="font-bold text-white font-school uppercase tracking-wider">
                                    Engagement complet validé : {totalHours}h effectuées
                                </p>
                                <p className="mt-1 text-emerald-200 leading-relaxed font-sans">
                                    Félicitations ! Vous avez atteint et validé le seuil officiel de 50 heures. Cette attestation est définitive, certifiée conforme et téléchargeable pour vos démarches universitaires ou professionnelles.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── CONTENEUR VISUEL DE LA FEUILLE A4 ──────────────────────────── */}
                <div className="w-full flex justify-center overflow-x-auto pb-4">
                    {/*
                        FEUILLE A4 OFFICIELLE CERTIFIÉE (id="official-certificate-a4")
                        Calibrée strictement au format 1 page A4 (794px à 96DPI)
                    */}
                    <div
                        id="official-certificate-a4"
                        className="bg-white text-zinc-900 w-[794px] min-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative select-text border border-zinc-200 box-border overflow-hidden"
                    >
                        {/* Liseré tricolore / Phœnix officiel en haut de page */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2A082D] via-[#6F2B75] to-[#EC602B]" />

                        {/* PARTIE HAUTE : En-tête officiel & Titre */}
                        <div>
                            {/* En-tête Institutionnel */}
                            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-4 pt-1">
                                <div className="flex items-center gap-3.5">
                                    <img
                                        src="/app-icon.png"
                                        alt="Phoenix EDC Logo"
                                        className="w-14 h-14 object-contain rounded-xl shadow-xs"
                                        crossOrigin="anonymous"
                                    />
                                    <div>
                                        <h1 className="font-black text-lg tracking-tight text-[#2A082D] uppercase font-school">
                                            PHOENIX ÉGALITÉ DES CHANCES
                                        </h1>
                                        <p className="text-[11px] text-zinc-600 font-medium">
                                            Association d'Intérêt Général régie par la Loi 1901 · Fondée en 2011
                                        </p>
                                        <p className="text-[10px] text-zinc-500 font-sans">
                                            KEDGE Business School · Campus Marseille Luminy · Réf : <span className="font-mono font-bold text-zinc-700">{refNumber}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right text-[11px] text-zinc-500 leading-tight">
                                    <p className="font-bold text-zinc-800 font-school uppercase tracking-wider">Domaine de Luminy</p>
                                    <p>Rue Antoine Bourdelle · 13009 Marseille</p>
                                    <p className="text-[10px] font-mono text-[#6F2B75] font-semibold mt-1">phoenix-egalite-des-chances.com</p>
                                    <p className="text-[10px] font-mono text-zinc-500">phoenixedc.asso@gmail.com</p>
                                </div>
                            </div>

                            {/* Titre Solennel du Document */}
                            <div className="text-center py-4">
                                <h2 className="text-xl font-black text-[#2A082D] uppercase tracking-wide font-school">
                                    {isValidated
                                        ? "Attestation d'Engagement Bénévolat"
                                        : "Attestation Provisoire d'Engagement Bénévolat"}
                                </h2>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <span className="text-xs font-bold text-[#EC602B] uppercase tracking-wider">
                                        Année Universitaire {academicYear}
                                    </span>
                                    <span className="text-zinc-300">·</span>
                                    <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                        isExempt
                                            ? "bg-purple-100 text-purple-900 border-purple-300"
                                            : isValidated
                                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                            : "bg-amber-100 text-amber-800 border-amber-300"
                                    }`}>
                                        {isExempt
                                            ? `Validée · Quota N-1 acquis (+${totalHours}h en ${academicYear})`
                                            : isValidated
                                            ? `Validée · ${totalHours}h effectuées (Seuil 50h atteint)`
                                            : `En cours · ${totalHours}h / ${ATTESTATION_THRESHOLD}h requises`}
                                    </span>
                                </div>
                            </div>

                            {/* Encadré d'Identification Officielle du Bénévole */}
                            <div className="bg-[#FFFBF4] border border-[#ECDDFD] rounded-xl p-4 text-center mb-4">
                                <p className="text-xs text-zinc-500 font-medium">
                                    Le Bureau de l'association Phœnix Égalité des Chances certifie par la présente que :
                                </p>
                                <p className="text-xl font-black text-[#2A082D] tracking-tight font-school uppercase mt-1">
                                    {user.name}
                                </p>
                                <p className="text-[11px] font-bold text-[#EC602B] uppercase tracking-wider mt-0.5">
                                    Qualité : {userRoleLabel}
                                    {isExempt && " · Membre Renouvelant"}
                                </p>
                            </div>

                            {/* Déclaration Officielle de Réussite / Engagement */}
                            <div className="text-xs leading-relaxed text-zinc-700 mb-4 text-justify">
                                {isExempt ? (
                                    <p>
                                        a d'ores et déjà satisfait avec assiduité à l'obligation statutaire d'engagement de 50 heures au titre de son mandat précédent ({previousAcademicYear}, membre renouvelant). Au cours de la présente année académique {academicYear}, l'intéressé(e) poursuit activement son investissement citoyen au sein de l'association. Les heures ci-dessous récapitulent fidèlement les séances et missions enregistrées au registre officiel.
                                    </p>
                                ) : isValidated ? (
                                    <p>
                                        a accompli avec succès, régularité et assiduité son engagement bénévole auprès des élèves accompagnés par l'association dans les Quartiers Prioritaires de la Ville (QPV) de Marseille pour l'année académique {academicYear}. Le volume total validé de <strong>{totalHours} heures</strong> satisfait et valide pleinement le seuil officiel de 50 heures requis pour la reconnaissance associative étudiante.
                                    </p>
                                ) : totalHours > 0 ? (
                                    <p>
                                        est activement engagé(e) au sein des programmes de tutorat pédagogique et d'ouverture citoyenne de l'association pour l'année universitaire {academicYear}. À ce jour, <strong>{totalHours} heure(s)</strong> ont été officiellement validées au registre sur le volume de <strong>{ATTESTATION_THRESHOLD} heures</strong> requis pour la validation définitive complète du parcours associatif.
                                    </p>
                                ) : (
                                    <p>
                                        est dûment inscrit(e) et engagé(e) au sein de l'association en qualité de bénévole pour l'année universitaire {academicYear}. À ce jour, les séances de tutorat sont en cours de planification ou en attente de validation administrative dans le registre Phoenix (0h / {ATTESTATION_THRESHOLD}h requises). Le présent document atteste de sa participation officielle en cours.
                                    </p>
                                )}
                            </div>

                            {/* Tableau Récapitulatif Compact des Heures */}
                            <div className="mb-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6F2B75] mb-1.5 font-school">
                                    Récapitulatif des heures enregistrées au registre officiel
                                </h3>
                                <table className="w-full text-xs text-left border border-zinc-200 rounded-lg overflow-hidden">
                                    <thead className="bg-zinc-100/90 text-zinc-700 font-bold border-b border-zinc-200 text-[11px]">
                                        <tr>
                                            <th className="py-2 px-3">Mission / Programme de Tutorat</th>
                                            <th className="py-2 px-3 text-center">Nature de l'intervention</th>
                                            <th className="py-2 px-3 text-right">Volume Validé</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 text-[11px]">
                                        {/* Ligne Quota N-1 validé pour membre renouvelant */}
                                        {isExempt && (
                                            <tr className="bg-purple-50/50">
                                                <td className="py-2 px-3 font-semibold text-purple-950">
                                                    Validation Statutaire Antérieure (Mandat {previousAcademicYear})
                                                    <span className="block text-[9.5px] text-purple-700 font-normal">Quota de 50h requis certifié au titre de l'année N-1</span>
                                                </td>
                                                <td className="py-2 px-3 text-center text-purple-800 font-medium text-[10px]">
                                                    Acquis (Renouvelant N-1)
                                                </td>
                                                <td className="py-2 px-3 text-right font-bold text-purple-900 tabular-nums">
                                                    50 h
                                                </td>
                                            </tr>
                                        )}

                                        {/* Heures de séances de tutorat confirmées */}
                                        {projectBreakdown.map(({ project, hours, count }) => (
                                            <tr key={project?.id}>
                                                <td className="py-2 px-3 font-semibold text-zinc-900">{project?.name}</td>
                                                <td className="py-2 px-3 text-center text-zinc-600 tabular-nums">{count} séance{count > 1 ? 's' : ''} effective{count > 1 ? 's' : ''}</td>
                                                <td className="py-2 px-3 text-right font-bold text-zinc-900 tabular-nums">{hours} h</td>
                                            </tr>
                                        ))}

                                        {/* Heures exceptionnelles valorisées par le Bureau */}
                                        {userManualHours.map(mh => (
                                            <tr key={mh.id} className="bg-orange-50/40">
                                                <td className="py-2 px-3 font-semibold text-zinc-900">
                                                    <div className="flex items-center gap-1.5">
                                                        <Sparkles size={11} className="text-[#EC602B] shrink-0" />
                                                        <span>Mission exceptionnelle : {mh.reason}</span>
                                                    </div>
                                                    <p className="text-[9.5px] text-zinc-500">
                                                        Validé par {mh.grantedBy} ({new Date(mh.createdAt).toLocaleDateString('fr-FR')})
                                                    </p>
                                                </td>
                                                <td className="py-2 px-3 text-center text-orange-700 font-medium text-[10px]">
                                                    Valorisation Bureau
                                                </td>
                                                <td className="py-2 px-3 text-right font-bold text-orange-600 tabular-nums">
                                                    +{mh.hours} h
                                                </td>
                                            </tr>
                                        ))}

                                        {projectBreakdown.length === 0 && userManualHours.length === 0 && !isExempt && (
                                            <tr>
                                                <td className="py-2 px-3 text-zinc-500 italic" colSpan={2}>
                                                    {user.projectIds.length > 0
                                                        ? `Projets affectés : ${user.projectIds.map(id => projectsData.find(p => p.id === id)?.name || id).join(', ')} (Séances en cours)`
                                                        : "Aucun créneau enregistré"}
                                                </td>
                                                <td className="py-2 px-3 text-right font-bold text-zinc-500 tabular-nums">0 h</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-zinc-50 font-bold border-t-2 border-zinc-300 text-xs">
                                        <tr>
                                            <td className="py-2.5 px-3 text-zinc-900 font-school uppercase tracking-wider">
                                                {isExempt ? `Total Heures ${academicYear} (Année en cours)` : "Total d'Heures Consolidé"}
                                            </td>
                                            <td className="py-2.5 px-3 text-center text-[10.5px] font-mono text-zinc-500 tabular-nums">
                                                {isExempt ? "Quota 50h acquis N-1" : isValidated ? "Seuil officiel 50h atteint" : `Reste à accomplir : ${remainingHours}h`}
                                            </td>
                                            <td className={`py-2.5 px-3 text-right text-sm font-black tabular-nums ${isValidated ? 'text-emerald-600' : 'text-[#EC602B]'}`}>
                                                {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)} h
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Mention Légale de Validité */}
                            <p className="text-[10px] text-zinc-500 italic leading-snug">
                                Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit, notamment dans le cadre de la validation de son engagement associatif étudiant, de son bonus engagement ou de son parcours citoyen auprès de KEDGE Business School et des institutions partenaires.
                            </p>
                        </div>

                        {/* PARTIE BASSE : Signatures, Cachet Associatif & QR Code d'Authenticité */}
                        <div className="pt-4 border-t-2 border-zinc-200">
                            <div className="flex justify-between items-end gap-6">
                                {/* Colonne Gauche : Lieu, Date & QR Code d'Authenticité Numérique */}
                                <div className="space-y-3 max-w-[340px]">
                                    <div>
                                        <p className="text-xs text-zinc-700 font-medium">Fait à Marseille, le {todayStr}</p>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold mt-1">
                                            {isValidated ? (
                                                <>
                                                    <ShieldCheck size={14} className="text-emerald-600" />
                                                    <span className="text-emerald-700">Document officiel certifié conforme · Registre Phœnix EDC</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Clock size={14} className="text-amber-600" />
                                                    <span className="text-amber-700">Pré-attestation · {totalHours}h / 50h (En cours)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bloc QR Code Haute Définition */}
                                    <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 border border-zinc-200/80">
                                        <div className="w-[72px] h-[72px] bg-white p-1 rounded-lg border border-zinc-200 shrink-0 flex items-center justify-center">
                                            {qrDataUrl ? (
                                                <img
                                                    src={qrDataUrl}
                                                    alt={`QR Code attestation ${refNumber}`}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-contain"
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-zinc-100 animate-pulse rounded" />
                                            )}
                                        </div>
                                        <div className="text-[9.5px] leading-tight text-zinc-500 space-y-1">
                                            <p className="font-bold font-school uppercase tracking-wider text-[#6F2B75]">
                                                Vérification Numérique
                                            </p>
                                            <p className="font-mono text-[9px] text-zinc-700 font-semibold">
                                                Réf : {refNumber}
                                            </p>
                                            <p className="text-[8.5px] text-zinc-400">
                                                Scannez ce QR Code ou accédez au registre en ligne :<br />
                                                <span className="font-mono text-zinc-600">phoenix-egalite-des-chances.com/verifier</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Colonne Droite : Espace officiel réservé au tampon et à la signature manuscrite */}
                                <div className="text-right flex flex-col items-end">
                                    <div className="w-[260px] min-w-[260px] h-28 border border-dashed border-zinc-300 rounded-xl bg-zinc-50/40 p-2.5 flex flex-col justify-between text-center">
                                        <div>
                                            <p className="text-[10.5px] font-bold text-zinc-900 font-school uppercase tracking-wider">
                                                Le Bureau Exécutif Phœnix EDC
                                            </p>
                                            <p className="text-[9.5px] text-zinc-600 font-semibold">
                                                {president.name} · {president.role}
                                            </p>
                                        </div>

                                        {/* Espace libre réservé au tampon et à la signature manuscrite */}
                                        <div className="py-2">
                                            <p className="text-[9.5px] text-zinc-400 font-medium italic">
                                                (À faire tamponner et signer par Samy RABHI)
                                            </p>
                                        </div>

                                        <p className="text-[8.5px] text-zinc-400 uppercase tracking-widest font-mono">
                                            Signature &amp; Cachet Officiel
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mentions Légales Pied de Document */}
                            <div className="mt-3 pt-2 border-t border-zinc-100 flex justify-between items-center text-[8.5px] text-zinc-400 font-sans">
                                <span>Phœnix Égalité des Chances · Association Loi 1901 · KEDGE BS Marseille Luminy</span>
                                <span className="font-mono">Document officiel certifié conforme · Page 1/1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── PIED DE MODALE (NON IMPRIMABLE) ────────────────────────────── */}
                <div className="w-full mt-4 flex items-center justify-between text-xs text-white/70 print:hidden px-2">
                    <span className="font-mono text-[11px]">Réf. unique : {refNumber}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-school uppercase tracking-wider font-semibold transition-colors cursor-pointer border border-white/20"
                    >
                        Fermer l'aperçu
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
