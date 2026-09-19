import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Award, 
    ArrowRight, 
    Download, 
    MapPin, 
    Sparkles, 
    Compass, 
    Heart, 
    ShieldCheck, 
    Target, 
    Linkedin, 
    Pencil, 
    Plus, 
    Trash2, 
    Upload, 
    X, 
    Check, 
    RotateCcw, 
    Camera,
    ChevronDown
} from 'lucide-react';
import { usePlanning } from '../context/PlanningContext';
import { 
    defaultBureauMembers, 
    defaultPoles, 
    type BureauMember,
    type PoleTeam
} from '../data/teamData';

const LOCAL_STORAGE_KEY = 'phoenix_bureau_members_v1';

export function Association() {
    const { currentUser } = usePlanning();
    const isBureau = currentUser?.role === 'bureau';

    // ─── État des membres du Bureau avec persistance ─────────────────────────
    const [bureauMembers, setBureauMembers] = useState<BureauMember[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { /* fallback */ }
        return defaultBureauMembers;
    });

    const [editingMember, setEditingMember] = useState<BureauMember | null>(null);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('Modifications enregistrées avec succès !');
    const [activePoleId, setActivePoleId] = useState<string | null>(null);

    // Synchronisation intelligente : si le navigateur a des modifications locales, on les envoie au serveur physique
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    fetch('http://localhost:3002/api/team/members', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ members: parsed })
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            if (data?.success && data.members) {
                                setBureauMembers(data.members);
                            }
                        })
                        .catch(() => {});
                    return;
                }
            }
        } catch {
            // fallback
        }

        // Si aucun cache local, charger depuis le serveur physique
        fetch('http://localhost:3002/api/team/members')
            .then((res) => res.json())
            .then((data) => {
                if (data?.success && Array.isArray(data.members) && data.members.length > 0) {
                    setBureauMembers(data.members);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.members));
                }
            })
            .catch(() => {
                // Mode hors-ligne ou GitHub Pages statique
            });
    }, []);

    // Sauvegarde automatique dans localStorage + serveur local (fichiers physiques pour Git)
    const saveMembers = async (updated: BureauMember[]) => {
        setBureauMembers(updated);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch { /* LocalStorage error handling */ }

        // Tentative de synchronisation physique sur le serveur local
        try {
            const res = await fetch('http://localhost:3002/api/team/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ members: updated })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.members) {
                    setBureauMembers(data.members);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.members));
                }
                setToastMessage('✅ Enregistré dans le projet ! Prêt pour Git push.');
            } else {
                setToastMessage('Modifications enregistrées dans le navigateur');
            }
        } catch {
            setToastMessage('Modifications enregistrées dans le navigateur');
        }

        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3500);
    };

    const handleResetDefault = () => {
        if (window.confirm("Rétablir la liste officielle par défaut du Bureau ?")) {
            saveMembers(defaultBureauMembers);
        }
    };

    // ─── État des Pôles Opérationnels avec persistance ───────────────────────
    const POLES_STORAGE_KEY = 'phoenix_poles_v1';
    const [poles, setPoles] = useState<PoleTeam[]>(() => {
        try {
            const saved = localStorage.getItem(POLES_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { /* fallback */ }
        return defaultPoles;
    });

    const [editingPole, setEditingPole] = useState<PoleTeam | null>(null);
    const [poleLead, setPoleLead] = useState('');
    const [poleMembers, setPoleMembers] = useState('');
    const [poleDesc, setPoleDesc] = useState('');

    useEffect(() => {
        fetch('http://localhost:3002/api/team/poles')
            .then(res => res.json())
            .then(data => {
                if (data?.success && Array.isArray(data.poles) && data.poles.length > 0) {
                    setPoles(data.poles);
                    localStorage.setItem(POLES_STORAGE_KEY, JSON.stringify(data.poles));
                }
            })
            .catch(() => {});
    }, []);

    const savePoles = async (updated: PoleTeam[]) => {
        setPoles(updated);
        try {
            localStorage.setItem(POLES_STORAGE_KEY, JSON.stringify(updated));
            const res = await fetch('http://localhost:3002/api/team/poles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ poles: updated })
            });
            if (res.ok) {
                setToastMessage('✅ Pôle enregistré avec succès !');
            } else {
                setToastMessage('Pôle enregistré dans le navigateur');
            }
        } catch {
            setToastMessage('Pôle enregistré dans le navigateur');
        }
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3500);
    };

    // ─── 5 Valeurs vivantes et concrètes ───────────────────────────────────────
    const values = [
        {
            title: "Ouverture d'esprit",
            principle: "Élargir les horizons",
            description: "Déconstruire les stéréotypes et stimuler la curiosité des jeunes par le débat, la culture et l'exploration.",
            icon: Compass,
            color: "text-orange-600",
            bg: "bg-orange-50 border-orange-200/80"
        },
        {
            title: "Humilité",
            principle: "Croire en chaque jeune",
            description: "Valoriser les singularités et le potentiel de chaque élève sans jamais lui imposer de trajectoire toute faite.",
            icon: Heart,
            color: "text-purple-600",
            bg: "bg-purple-50 border-purple-200/80"
        },
        {
            title: "Intégrité",
            principle: "Exemplarité de terrain",
            description: "Une éthique citoyenne constante, un engagement bénévole sincère et une transparence financière intégrale.",
            icon: ShieldCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200/80"
        },
        {
            title: "Exigence",
            principle: "Viser la progression",
            description: "De la rigueur dans la présence des tuteurs et la préparation des séances pour des résultats académiques concrets.",
            icon: Target,
            color: "text-indigo-600",
            bg: "bg-indigo-50 border-indigo-200/80"
        },
        {
            title: "Engagement",
            principle: "Présence hebdomadaire",
            description: "1 à 4 séances chaque semaine. Une assiduité sans faille qui forge un lien de confiance inestimable.",
            icon: Sparkles,
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-200/80"
        }
    ];

    // ─── 5 Dates Charnières (Chronologie épurée) ──────────────────────────────
    const keyDates = [
        {
            year: "1998",
            title: "Origines à l'OM",
            desc: "Premier soutien scolaire pionnier dispensé aux jeunes sportifs du centre de formation de l'Olympique de Marseille."
        },
        {
            year: "2011",
            title: "Naissance de Phoenix EDC",
            desc: "Fusion historique d'ACSE et Sup d'OM pour bâtir la grande association d'égalité des chances de KEDGE BS."
        },
        {
            year: "2013",
            title: "Cordées de la Réussite",
            desc: "Labellisation officielle par l'État et le Ministère de l'Éducation Nationale pour valoriser notre impact éducatif."
        },
        {
            year: "2021",
            title: "2e Asso de France & 1re Sociale",
            desc: "Consécration nationale au classement des associations étudiantes françaises pour l'excellence de nos actions de terrain."
        },
        {
            year: "Aujourd'hui",
            title: "300 jeunes chaque semaine",
            desc: "9 projets actifs du lundi au samedi, simulation SimONU, JEDC et de nouvelles perspectives d'expansion."
        }
    ];

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            {/* Toast de confirmation de sauvegarde */}
            {showSuccessToast && (
                <div className="fixed bottom-6 right-6 z-50 bg-[#2A082D] text-white px-5 py-3 rounded-full shadow-soft-lg flex items-center gap-3 border border-[#ECDDFD]/40 animate-in fade-in slide-in-from-bottom-4">
                    <Check size={18} className="text-emerald-400" />
                    <span className="text-sm font-school font-bold">{toastMessage}</span>
                </div>
            )}

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                
                {/* ──────────────── 1. HERO VIVANT EN 2 COLONNES ──────────────── */}
                <section className="mb-20 sm:mb-28">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        {/* Colonne Texte */}
                        <div className="lg:col-span-7">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ECDDFD] text-[#6F2B75] shadow-soft text-xs font-school font-bold uppercase tracking-wider mb-5">
                                <Award size={14} className="text-[#EC602B]" />
                                <span>KEDGE Business School · Association d'Intérêt Général</span>
                            </div>

                            <p className="font-script text-2xl md:text-3xl text-[#EC602B] mb-1">
                                ~ Depuis 2011 à Marseille ~
                            </p>

                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display text-[#2A082D] tracking-tight leading-[1.08] mb-6">
                                Plus qu'une association, une grande famille marseillaise engagée.
                            </h1>

                            <p className="text-[#2A082D]/80 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                                Depuis 2011, Phoenix mobilise <strong className="text-[#2A082D] font-bold">+100 étudiants bénévoles</strong> pour accompagner chaque semaine <strong className="text-[#2A082D] font-bold">300 collégiens et lycéens</strong> des quartiers prioritaires. Notre mission : créer le déclic, ouvrir les horizons et abattre l'autocensure.
                            </p>

                            {/* 3 micro-indicateurs tactiles */}
                            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#ECDDFD]/60">
                                <div className="p-4 bg-white rounded-2xl border border-[#ECDDFD] shadow-soft">
                                    <span className="block text-2xl sm:text-3xl font-display text-[#EC602B]">+100</span>
                                    <span className="text-[11px] sm:text-xs text-[#2A082D]/80 font-school font-bold uppercase tracking-wider">Tuteurs</span>
                                </div>
                                <div className="p-4 bg-[#ECDDFD]/60 rounded-2xl border border-[#ECDDFD] shadow-soft">
                                    <span className="block text-2xl sm:text-3xl font-display text-[#6F2B75]">300</span>
                                    <span className="text-[11px] sm:text-xs text-[#2A082D]/80 font-school font-bold uppercase tracking-wider">Jeunes / an</span>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-[#ECDDFD] shadow-soft">
                                    <span className="block text-2xl sm:text-3xl font-display text-[#EC602B]">9</span>
                                    <span className="text-[11px] sm:text-xs text-[#2A082D]/80 font-school font-bold uppercase tracking-wider">Projets</span>
                                </div>
                            </div>
                        </div>

                        {/* Colonne Photo Chaleureuse */}
                        <div className="lg:col-span-5">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-soft-lg border border-[#ECDDFD] group bg-[#2A082D]">
                                <img
                                    src="/images/home/voyage-culturel-1.jpg"
                                    alt="Tuteurs et tutorés de l'association Phoenix en voyage culturel"
                                    className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2A082D]/85 via-[#2A082D]/20 to-transparent pointer-events-none" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-school font-bold mb-1 shadow-soft">
                                        <MapPin size={12} className="text-[#FF7E2E]" />
                                        <span>Voyage culturel & cohésion</span>
                                    </div>
                                    <p className="text-xs text-[#ECDDFD] font-medium line-clamp-1">
                                        Rencontres, découvertes et souvenirs inoubliables sur le terrain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ──────────────── 2. VALEURS VIVANTES (GRILLE AÉRÉE) ──────────────── */}
                <section className="mb-20 sm:mb-28">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] bg-[#ECDDFD] px-4 py-1.5 rounded-full shadow-soft inline-block mb-3">
                            Notre ADN
                        </span>
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display text-[#2A082D] tracking-tight mb-3">
                            Les 5 Valeurs qui Guident Notre Action
                        </h2>
                        <p className="text-[#2A082D]/80 text-sm sm:text-base font-medium">
                            Présentes dans chaque séance de tutorat et formalisées dans la charte officielle <strong>« OHIEE »</strong>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {values.map((val, idx) => {
                            const IconComponent = val.icon;
                            return (
                                <div
                                    key={idx}
                                    className="rounded-[2rem] p-6 border border-[#ECDDFD] shadow-soft bg-white flex flex-col justify-between hover:-translate-y-1 hover:shadow-soft-lg transition-all"
                                >
                                    <div>
                                        <div className={`w-13 h-13 rounded-full flex items-center justify-center mb-4 bg-white border border-[#ECDDFD] shadow-soft ${val.color}`}>
                                            <IconComponent size={24} />
                                        </div>
                                        <h3 className="text-lg font-display text-[#2A082D] mb-1">
                                            {val.title}
                                        </h3>
                                        <p className="text-xs font-school font-bold text-[#EC602B] mb-3 uppercase tracking-wider">
                                            {val.principle}
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                                            {val.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ──────────────── 3. CHRONOLOGIE CONDENSÉE (5 DATES CLÉS) ──────────────── */}
                <section className="mb-20 sm:mb-28 bg-[#ECDDFD]/40 rounded-[2.5rem] p-8 sm:p-12 border border-[#ECDDFD] shadow-soft">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                        <div>
                            <span className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] bg-white px-4 py-1 rounded-full shadow-soft inline-block mb-3 border border-[#ECDDFD]">
                                Histoire & Transmission
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-display text-[#2A082D] tracking-tight">
                                5 Dates Repères de Phœnix
                            </h2>
                        </div>
                        <p className="text-[#2A082D]/80 text-xs sm:text-sm font-semibold max-w-sm">
                            Plus de 25 ans d'action continue auprès des élèves marseillais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                        {keyDates.map((item, idx) => (
                            <div key={idx} className="flex flex-col relative bg-white p-6 rounded-[2rem] border border-[#ECDDFD] shadow-soft">
                                <div className={`font-display text-[#EC602B] mb-2 leading-tight whitespace-nowrap ${
                                    item.year.length > 5 
                                        ? "text-lg sm:text-base lg:text-lg xl:text-xl tracking-tight" 
                                        : "text-2xl sm:text-3xl"
                                }`}>
                                    {item.year}
                                </div>
                                <h3 className="text-sm font-school font-bold text-[#2A082D] mb-2 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ──────────────── 4. L'ÉQUIPE DU BUREAU & PÔLES (AVEC ÉDITION BUREAU) ──────────────── */}
                <section className="mb-20">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-school font-bold uppercase tracking-wider text-[#EC602B]">
                                    Gouvernance 2026-2027
                                </span>
                                {isBureau && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-school font-bold uppercase tracking-wider border border-emerald-300">
                                        <Check size={11} />
                                        Connecté : Bureau
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display text-[#2A082D] tracking-tight">
                                L'Équipe du Bureau Exécutif
                            </h2>
                            <p className="text-slate-600 text-sm mt-1 font-medium">
                                Les étudiants de KEDGE Business School qui pilotent l'association cette année.
                            </p>
                        </div>

                        {/* Contrôles du Mode Bureau (visibles uniquement pour role === 'bureau') */}
                        {isBureau && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingMember(true);
                                        setEditingMember({
                                            id: `member-${Date.now()}`,
                                            firstName: "",
                                            lastName: "",
                                            role: "",
                                            photo: "",
                                            linkedin: ""
                                        });
                                    }}
                                    className="btn-phoenix-gradient !py-2.5 !px-5 !text-xs rounded-full text-white shadow-soft flex items-center gap-1.5"
                                >
                                    <Plus size={14} />
                                    <span>Ajouter un membre</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetDefault}
                                    title="Rétablir les membres par défaut du guide"
                                    className="p-2.5 rounded-full bg-white border border-[#ECDDFD] text-slate-700 hover:text-black transition-colors shadow-soft"
                                >
                                    <RotateCcw size={15} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Grille des Cartes Membres avec Avatars STRICTEMENT CIRCULAIRES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-14">
                        {bureauMembers.map((member) => (
                            <div
                                key={member.id}
                                className="bg-white rounded-[2rem] border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all p-6 flex flex-col justify-between text-center relative group"
                            >
                                {/* Bouton Crayon (visible uniquement pour role === 'bureau') */}
                                {isBureau && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingMember(false);
                                            setEditingMember(member);
                                        }}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-[#ECDDFD] hover:bg-[#D9BEF8] text-[#6F2B75] transition-colors"
                                        title="Modifier ce membre"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                )}

                                <div>
                                    {/* Avatar STRICTEMENT CIRCULAIRE entouré du gradient officiel (CERCLE AVANT LE RECTANGLE) */}
                                    <div className="w-24 h-24 rounded-full mx-auto mb-4 p-1 bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] shadow-soft">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center text-[#6F2B75] font-school font-bold text-xl">
                                            {member.photo ? (
                                                <img
                                                    src={member.photo}
                                                    alt={`${member.firstName} ${member.lastName}`}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <span>
                                                    {member.firstName.charAt(0)}
                                                    {member.lastName ? member.lastName.charAt(0) : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Nom & Prénom */}
                                    <h3 className="text-base font-display text-[#2A082D] leading-snug">
                                        {member.firstName} {member.lastName}
                                    </h3>

                                    {/* Rôle */}
                                    <p className="text-xs font-school font-bold text-[#EC602B] mt-1 uppercase tracking-wider">
                                        {member.role}
                                    </p>
                                </div>

                                {/* Pied de carte avec LinkedIn */}
                                <div className="mt-4 pt-3 border-t border-[#ECDDFD]/60 flex items-center justify-center">
                                    {member.linkedin ? (
                                        <a
                                            href={member.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#6F2B75] transition-colors font-school font-bold"
                                        >
                                            <Linkedin size={14} className="text-[#6F2B75]" />
                                            <span>LinkedIn</span>
                                        </a>
                                    ) : (
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            KEDGE Business School
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pôles Opérationnels sous forme d'accordéons / fiches légères */}
                    <div className="bg-[#ECDDFD]/30 rounded-[2.5rem] p-6 sm:p-8 border border-[#ECDDFD] shadow-soft">
                        <div className="mb-6">
                            <h3 className="text-xl font-display text-[#2A082D]">
                                Pôles Opérationnels & Équipes
                            </h3>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                                Cliquez sur un pôle pour voir sa composition et ses missions.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {poles.map((pole) => {
                                const isOpen = activePoleId === pole.id;
                                return (
                                    <div
                                        key={pole.id}
                                        className="rounded-2xl border border-[#ECDDFD] bg-white shadow-soft overflow-hidden transition-all flex flex-col justify-between"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActivePoleId(isOpen ? null : pole.id)}
                                            className="w-full p-4 text-left flex items-center justify-between gap-2 hover:bg-[#ECDDFD]/20 transition-colors cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0 pr-1">
                                                <h4 className="text-sm font-display text-[#2A082D] truncate">
                                                    {pole.title}
                                                </h4>
                                                <span className="text-xs text-[#EC602B] font-school font-bold block truncate">
                                                    {pole.lead}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {isBureau && (
                                                    <span
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingPole(pole);
                                                            setPoleLead(pole.lead);
                                                            setPoleMembers(pole.members.join(', '));
                                                            setPoleDesc(pole.description);
                                                        }}
                                                        className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#EC602B] transition-colors border border-orange-200 cursor-pointer"
                                                        title="Modifier le responsable et les chargés de mission"
                                                    >
                                                        <Pencil size={13} />
                                                    </span>
                                                )}
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-[#2A082D] transition-transform ${isOpen ? 'rotate-180 text-[#EC602B]' : ''}`}
                                                />
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="px-4 pb-4 pt-2 text-xs text-[#2A082D] border-t border-[#ECDDFD] bg-[#FFFBF4] space-y-2">
                                                <p className="leading-relaxed font-normal">
                                                    {pole.description}
                                                </p>
                                                <div className="pt-2 border-t border-[#ECDDFD] font-medium text-slate-600">
                                                    <strong className="text-[#6F2B75]">Membres & Chargés :</strong> {pole.members.join(', ')}
                                                </div>
                                                {isBureau && (
                                                    <div className="pt-2 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingPole(pole);
                                                                setPoleLead(pole.lead);
                                                                setPoleMembers(pole.members.join(', '));
                                                                setPoleDesc(pole.description);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EC602B]/10 hover:bg-[#EC602B]/20 text-[#EC602B] font-school text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                                        >
                                                            <Pencil size={11} />
                                                            <span>Modifier le pôle</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ──────────────── 5. BANDEAU DE RESSOURCES ──────────────── */}
                <section className="bg-[#2A082D] bg-bird-pattern-dark text-white rounded-[2.5rem] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-soft-lg">
                    <div>
                        <span className="text-xs font-school font-bold uppercase tracking-wider text-[#FF7E2E] block mb-1">
                            Documentation Officielle
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-display text-white">
                            Consulter le Guide du Phœnicien 2026-2027
                        </h2>
                        <p className="text-[#ECDDFD] text-xs sm:text-sm mt-1 max-w-xl font-medium">
                            Retrouvez les fiches détaillées des 9 projets, les plannings complets et la charte déontologique du tuteur.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            to="/documents"
                            className="btn-phoenix-orange !text-xs sm:!text-sm rounded-full px-6 py-3 shadow-glow-orange flex items-center gap-2"
                        >
                            <Download size={15} />
                            <span>Télécharger le PDF</span>
                        </Link>
                        <Link
                            to="/projets"
                            className="btn-phoenix-outline !bg-white/10 !text-white hover:!bg-white/20 !border-white/30 !text-xs sm:!text-sm rounded-full px-6 py-3 flex items-center gap-2"
                        >
                            <span>Nos 9 projets</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </section>

            </div>

            {/* ──────────────── MODAL D'ÉDITION DE MEMBRE (ROLE BUREAU) ──────────────── */}
            {isBureau && editingMember && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-black text-slate-900">
                                {isAddingMember ? "Ajouter un Membre du Bureau" : `Modifier ${editingMember.firstName}`}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEditingMember(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Formulaire d'édition */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!editingMember.firstName.trim() || !editingMember.role.trim()) {
                                    alert("Le prénom et le rôle sont obligatoires.");
                                    return;
                                }

                                if (isAddingMember) {
                                    saveMembers([...bureauMembers, editingMember]);
                                } else {
                                    saveMembers(bureauMembers.map(m => m.id === editingMember.id ? editingMember : m));
                                }
                                setEditingMember(null);
                            }}
                            className="space-y-4"
                        >
                            {/* Photo / Avatar Upload & Preview */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Photo de Profil
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                        {editingMember.photo ? (
                                            <img
                                                src={editingMember.photo}
                                                alt="Aperçu"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Camera size={24} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-grow space-y-1.5">
                                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors">
                                            <Upload size={13} />
                                            <span>Télécharger un fichier</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            const base64 = event.target?.result as string;
                                                            setEditingMember({ ...editingMember, photo: base64 });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        {editingMember.photo && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingMember({ ...editingMember, photo: "" })}
                                                className="block text-[11px] text-rose-600 hover:underline font-semibold"
                                            >
                                                Supprimer la photo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Prénom & Nom */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingMember.firstName}
                                        onChange={(e) => setEditingMember({ ...editingMember, firstName: e.target.value })}
                                        placeholder="Ex: Samy"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-orange-500 focus:outline-hidden"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={editingMember.lastName}
                                        onChange={(e) => setEditingMember({ ...editingMember, lastName: e.target.value })}
                                        placeholder="Ex: RABHI"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-orange-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Rôle */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Rôle / Titre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editingMember.role}
                                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                                    placeholder="Ex: Président, Trésorière..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-orange-500 focus:outline-hidden"
                                />
                            </div>

                            {/* Lien LinkedIn */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Profil LinkedIn (Optionnel)
                                </label>
                                <input
                                    type="url"
                                    value={editingMember.linkedin || ""}
                                    onChange={(e) => setEditingMember({ ...editingMember, linkedin: e.target.value })}
                                    placeholder="https://www.linkedin.com/in/..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-orange-500 focus:outline-hidden"
                                />
                            </div>

                            {/* Boutons d'action du formulaire */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                {!isAddingMember && bureauMembers.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm(`Supprimer ${editingMember.firstName} du Bureau ?`)) {
                                                saveMembers(bureauMembers.filter(m => m.id !== editingMember.id));
                                                setEditingMember(null);
                                            }
                                        }}
                                        className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold"
                                    >
                                        <Trash2 size={14} />
                                        <span>Supprimer</span>
                                    </button>
                                )}

                                <div className="flex items-center gap-2 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMember(null)}
                                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de modification de Pôle (Responsable & Chargés de mission) */}
            {editingPole && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-[10px] font-school uppercase tracking-widest text-[#EC602B] font-bold">Pôle Opérationnel</span>
                                <h3 className="text-lg font-display text-slate-900">
                                    {editingPole.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingPole(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!poleLead.trim()) {
                                    alert("Le nom du responsable est obligatoire.");
                                    return;
                                }

                                const parsedMembers = poleMembers
                                    .split(',')
                                    .map(m => m.trim())
                                    .filter(Boolean);

                                const updatedPoles = poles.map(p =>
                                    p.id === editingPole.id
                                        ? {
                                              ...p,
                                              lead: poleLead.trim(),
                                              members: parsedMembers,
                                              description: poleDesc.trim() || p.description
                                          }
                                        : p
                                );

                                savePoles(updatedPoles);
                                setEditingPole(null);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Responsable de Pôle (Lead) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={poleLead}
                                    onChange={(e) => setPoleLead(e.target.value)}
                                    placeholder="Ex: Sohel (Responsable)"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-orange-500 focus:outline-hidden"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">Nom et titre affichés sur l'en-tête du pôle.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Chargés de Mission & Membres
                                </label>
                                <input
                                    type="text"
                                    value={poleMembers}
                                    onChange={(e) => setPoleMembers(e.target.value)}
                                    placeholder="Ex: Maxime, Samy, Sarah"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-orange-500 focus:outline-hidden"
                                />
                                <p className="text-[11px] text-slate-500 mt-1">Séparez les différents prénoms/noms par des virgules.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Description des Missions
                                </label>
                                <textarea
                                    rows={3}
                                    value={poleDesc}
                                    onChange={(e) => setPoleDesc(e.target.value)}
                                    placeholder="Missions et responsabilités..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-orange-500 focus:outline-hidden resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingPole(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                                >
                                    Enregistrer le pôle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
