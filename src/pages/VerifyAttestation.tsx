import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Clock, Building2, User, Award, ArrowLeft, Search, FileText } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { getAcademicYear } from '../utils/academicYear';

export function VerifyAttestation() {
    const [searchParams, setSearchParams] = useSearchParams();

    const { academicYear: currentAcademicYear } = getAcademicYear();
    const ref = searchParams.get('ref');
    const name = searchParams.get('name') || 'Bénévole Phœnix';
    const rawRole = searchParams.get('role') || 'tuteur';
    const hours = searchParams.get('hours') || searchParams.get('h') || '50';
    const validParam = searchParams.get('valid');
    const statusParam = searchParams.get('status');
    const year = searchParams.get('y') || currentAcademicYear;

    const [inputRef, setInputRef] = useState('');

    const roleLabels: Record<string, string> = {
        bureau: 'Membre du Bureau Exécutif',
        chef_projet: 'Chef de Projet Tutorat',
        tuteur: 'Tuteur / Bénévole Accompagnateur'
    };

    const roleTitle = roleLabels[rawRole.toLowerCase()] || rawRole;

    const isValid = validParam === '1' || validParam === 'true' || statusParam === 'Renouvelant' || statusParam === 'Valide' || Number(hours) >= 50;
    const isRenouvelant = statusParam === 'Renouvelant' || searchParams.get('exempt') === '1';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputRef.trim()) {
            setSearchParams({ ref: inputRef.trim().toUpperCase() });
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-28 pb-20 px-4 sm:px-6">
            <SEO
                title="Vérification Attestation – Authentification Bénévole – Marseille / KEDGE BS"
                description="Service officiel d'authentification numérique des attestations d'engagement bénévole délivrées par l'association Phœnix Égalité des Chances (KEDGE BS Marseille)."
            />

            <div className="container mx-auto max-w-3xl">
                {/* Bouton retour */}
                <div className="mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-xs font-school font-bold text-[#6F2B75] hover:text-[#EC602B] uppercase tracking-wider transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>Retour au site officiel</span>
                    </Link>
                </div>

                {ref ? (
                    <div className="bg-white rounded-3xl shadow-soft-lg border border-[#ECDDFD] overflow-hidden">
                        {/* En-tête officiel */}
                        <div className="bg-gradient-to-r from-[#2A082D] via-[#6F2B75] to-[#EC602B] text-white p-6 sm:p-8">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/app-icon.png"
                                        alt="Logo officiel Phœnix Égalité des Chances – KEDGE BS Marseille"
                                        className="w-12 h-12 rounded-xl object-contain bg-white/10 p-1"
                                    />
                                    <div>
                                        <h1 className="font-school text-sm sm:text-base font-black tracking-wider uppercase">
                                            Phœnix Égalité des Chances
                                        </h1>
                                        <p className="text-xs text-white/80 font-sans">
                                            Registre Officiel des Certificats d'Engagement · KEDGE BS Marseille
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-mono font-bold tracking-wider">
                                    Réf. {ref}
                                </div>
                            </div>
                        </div>

                        {/* Bannière de Statut d'Authenticité */}
                        <div className={`p-6 sm:p-8 border-b ${
                            isValid
                                ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                                : 'bg-amber-50/70 border-amber-100 text-amber-950'
                        }`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-2xl shrink-0 ${
                                    isValid ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                } shadow-md`}>
                                    {isValid ? <ShieldCheck size={32} /> : <Clock size={32} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-lg sm:text-xl font-bold font-school tracking-tight">
                                            {isValid
                                                ? "Attestation Authentifiée & Certifiée Conforme"
                                                : "Pré-Attestation d'Engagement en Cours"}
                                        </h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider font-school ${
                                            isValid ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                                        }`}>
                                            {isRenouvelant ? 'Statut Renouvelant (Quota N-1 Acquis)' : isValid ? 'Validée (50h+)' : 'En Cours'}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs sm:text-sm text-zinc-700 leading-relaxed">
                                        {isValid
                                            ? "Le présent document a été émis par le système officiel de registre de l'association Phœnix Égalité des Chances. Son authenticité, son volume d'heures et son statut ont été formellement validés par le Bureau exécutif."
                                            : "Ce document est actuellement en cours de constitution dans le registre officiel de l'association. Les heures indiquées reflètent fidèlement les séances confirmées au registre à ce jour."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Grille des Détails Officiels */}
                        <div className="p-6 sm:p-8 space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#6F2B75] font-school flex items-center gap-2">
                                <Award size={16} className="text-[#EC602B]" />
                                <span>Informations Enregistrées au Registre</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                                        <User size={14} />
                                        <span>Bénévole Titulaire</span>
                                    </div>
                                    <p className="text-base font-bold text-zinc-900">{name}</p>
                                    <p className="text-xs text-[#EC602B] font-semibold mt-0.5">{roleTitle}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                                        <Clock size={14} />
                                        <span>Volume Horaire Validé</span>
                                    </div>
                                    <p className="text-base font-black text-zinc-900">{hours} heure{Number(hours) > 1 ? 's' : ''}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {isRenouvelant ? 'Quota 50h statutaire acquis N-1' : isValid ? 'Seuil statutaire 50h atteint' : 'Seuil statutaire requis : 50h'}
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                                        <Building2 size={14} />
                                        <span>Organisme Émetteur</span>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-900">Phœnix Égalité des Chances</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Association Loi 1901 d'Intérêt Général</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                                        <FileText size={14} />
                                        <span>Année Universitaire & Campus</span>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-900">{year}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">KEDGE Business School · Campus Marseille Luminy</p>
                                </div>
                            </div>

                            {/* Mentions de conformité */}
                            <div className="p-4 rounded-2xl bg-[#ECDDFD]/30 border border-[#ECDDFD] text-xs text-zinc-700 space-y-2">
                                <div className="flex items-center gap-2 font-bold text-[#2A082D]">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                                    <span>Valeur juridique et universitaire</span>
                                </div>
                                <p className="leading-relaxed">
                                    Cette certification numérique fait foi auprès de la direction académique de KEDGE Business School, des comités de validation de l'engagement associatif, des jurys de bourses et des employeurs.
                                </p>
                            </div>
                        </div>

                        {/* Pied de carte */}
                        <div className="bg-zinc-50 p-6 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-4 text-xs text-zinc-500">
                            <span className="font-mono">Référence certificat : {ref}</span>
                            <span>Contact vérification : phoenixedc.asso@gmail.com</span>
                        </div>
                    </div>
                ) : (
                    /* Formulaire de recherche si pas de paramètres */
                    <div className="bg-white rounded-3xl shadow-soft-lg border border-[#ECDDFD] p-8 sm:p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-2xl font-black font-school text-[#2A082D] mb-2 uppercase tracking-tight">
                            Vérification d'Attestation Officielle
                        </h1>
                        <p className="text-sm text-zinc-600 max-w-md mx-auto mb-8">
                            Entrez la référence unique figurant en haut de l'attestation ou sous le QR Code (format : <code className="font-mono bg-zinc-100 px-2 py-0.5 rounded text-[#EC602B]">PHX-ATT-2026-XXXX</code>).
                        </p>

                        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
                            <input
                                type="text"
                                value={inputRef}
                                onChange={(e) => setInputRef(e.target.value)}
                                placeholder="PHX-ATT-2026-..."
                                className="flex-1 px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#EC602B] font-mono text-sm uppercase"
                            />
                            <button
                                type="submit"
                                className="btn-phoenix-gradient px-6 py-3 rounded-xl text-white font-school text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Search size={16} />
                                <span>Vérifier</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
