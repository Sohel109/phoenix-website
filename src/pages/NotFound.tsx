import { useMemo, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, Calendar, Mail, Compass, ArrowLeft, ArrowRight, ShieldCheck, Map } from 'lucide-react';

import { SEO } from '../components/common/SEO';
import { HandDrawnCircle, MaskingTape } from '../components/common/HandDrawnElements';
import { useDrawnOnInteract } from '../hooks/useDrawnOnInteract';

// Carte de navigation avec le même cercle tracé au feutre que Documents/Partenaires/Recrutement
// (motif d'interaction unifié du site) plutôt que le survol générique bordure+ombre.
function NotFoundNavCard({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
    const { isDrawn, interactionProps } = useDrawnOnInteract();
    return (
        <Link
            to={to}
            {...interactionProps}
            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-[#ECDDFD] hover:border-[#6F2B75]/40 hover:shadow-soft-lg text-[#2A082D] transition-all shadow-soft"
        >
            <div className="relative w-10 h-10 flex items-center justify-center">
                <HandDrawnCircle stroke="#EC602B" strokeWidth={2.2} className="inset-0 w-full h-full" animated drawn={isDrawn} />
                <div className="w-8 h-8 rounded-full bg-white text-[#2A082D] flex items-center justify-center border border-[#2A082D]/10">
                    {icon}
                </div>
            </div>
            <span className="text-xs font-school font-bold">{label}</span>
        </Link>
    );
}

export function NotFound() {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname.toLowerCase();

    // Détection intelligente d'une page correspondante pour les anciens liens Wix
    const suggestedRedirect = useMemo(() => {
        // Simonu
        if (path.includes('simonu')) {
            return {
                label: 'Simulation ONU (SimONU)',
                to: '/evenements/simonu',
                icon: <Calendar size={18} className="text-orange-500" />
            };
        }
        // Dons / Donner
        if (path.includes('don') || path.includes('donner') || path.includes('soutenir')) {
            return {
                label: 'Transparence & Soutien',
                to: '/transparence',
                icon: <ShieldCheck size={18} className="text-orange-500" />
            };
        }
        // Olympiades
        if (path.includes('olympiade')) {
            return {
                label: 'Les Olympiades Phoenix',
                to: '/evenements/olympiades',
                icon: <Calendar size={18} className="text-orange-500" />
            };
        }
        // Plan / Carte des projets
        if (path.includes('plan') || path.includes('carte') || path.includes('map')) {
            return {
                label: 'Carte & Plan des Projets',
                to: '/carte-des-projets',
                icon: <Map size={18} className="text-orange-500" />
            };
        }
        // Devenir partenaire / Recrutement / Contact
        if (path.includes('devenir-partenaire') || path.includes('devenir-parteniare') || path.includes('contact') || path.includes('rejoindre') || path.includes('recrutement') || path.includes('tuteur')) {
            return {
                label: 'Contact & Devenir Partenaire',
                to: '/contact',
                icon: <Mail size={18} className="text-orange-500" />
            };
        }
        // JEDC / MEC
        if (path.includes('mec') || path.includes('jedc') || path.includes('journee')) {
            return {
                label: 'Journée Égalité des Chances (JEDC)',
                to: '/evenements/jedc',
                icon: <Calendar size={18} className="text-orange-500" />
            };
        }
        // Projets spécifiques
        if (path.includes('massa')) {
            return {
                label: 'Projet Massa 13',
                to: '/projets/massa-13',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('acse')) {
            return {
                label: 'Projet ACSE',
                to: '/projets/acse',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('gabriel')) {
            return {
                label: 'Projet Saint Gabriel',
                to: '/projets/saint-gabriel',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('auteuil')) {
            return {
                label: "Projet Apprentis d'Auteuil",
                to: '/projets/apprentis-d-auteuil',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('rimbaud')) {
            return {
                label: 'Projet Arthur Rimbaud',
                to: '/projets/arthur-rimbaud',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('izzo')) {
            return {
                label: 'Projet Collège Izzo',
                to: '/projets/izzo',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('ferry')) {
            return {
                label: 'Projet Jules Ferry',
                to: '/projets/jules-ferry',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('roy') || path.includes('espagne')) {
            return {
                label: "Projet Roy d'Espagne",
                to: '/projets/roy-despagne',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        if (path.includes('sup') || path.includes('om')) {
            return {
                label: "Projet Sup d'OM",
                to: '/projets/sup-d-om',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        // Fallback global projets
        if (path.includes('projet') || path.includes('tutorat') || path.includes('massalia')) {
            return {
                label: 'Nos Projets de tutorat',
                to: '/projets',
                icon: <FolderOpen size={18} className="text-orange-500" />
            };
        }
        // Partenaires
        if (path.includes('partenaire')) {
            return {
                label: 'Nos Partenaires',
                to: '/partenaires',
                icon: <Compass size={18} className="text-orange-500" />
            };
        }
        return null;
    }, [path]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 pt-page-safe pb-16 bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title="Page Introuvable – Erreur 404 – Marseille / KEDGE BS"
                description="La page que vous recherchez sur le site de Phœnix Égalité des Chances KEDGE BS Marseille n'existe pas ou a été déplacée."
            />
            <div className="max-w-xl w-full text-center relative z-10">
                {/* Grand numéro "404" façon carnet de bord, avec cercle feutre autour du 0 central */}
                <div className="relative inline-block mb-3">
                    <MaskingTape variant="warm" angle="left" className="-top-3 left-1/2 -translate-x-1/2 z-20" />
                    <span className="relative font-display text-6xl sm:text-7xl text-[#2A082D] leading-none tracking-tight">
                        4
                        <span className="relative inline-block px-1">
                            0
                            <HandDrawnCircle stroke="#EC602B" strokeWidth={3} className="-inset-x-1.5 -inset-y-1 w-[calc(100%+0.75rem)] h-[calc(100%+0.5rem)]" />
                        </span>
                        4
                    </span>
                </div>

                {/* 404 Badge */}
                <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] mb-2 block">
                    Erreur 404 · Page introuvable
                </span>

                <h1 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-tight mb-4">
                    Oups, cette page{' '}
                    <span className="marker-highlight text-[#EC602B]">
                        <span>n'existe plus</span>
                    </span>{' '}!
                </h1>

                <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto font-normal">
                    Le site de <strong className="text-[#2A082D] font-semibold">Phoenix Égalité des Chances</strong> a fait peau neuve. 
                    Si vous venez d'un ancien lien ou d'une recherche Google, la page que vous recherchez a probablement changé d'adresse.
                </p>

                {/* Suggestion intelligente si ancien lien détecté */}
                {suggestedRedirect && (
                    <div className="p-4 rounded-2xl bg-white border border-[#ECDDFD] shadow-soft mb-8 text-left flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shrink-0">
                                {suggestedRedirect.icon}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Vous cherchiez peut-être :</p>
                                <p className="text-sm font-bold text-[#2A082D]">{suggestedRedirect.label}</p>
                            </div>
                        </div>
                        <Link
                            to={suggestedRedirect.to}
                            className="btn-phoenix-orange !py-2 !px-4 !text-xs rounded-xl shadow-glow-orange flex items-center gap-1 shrink-0"
                        >
                            <span>Y aller</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                )}

                {/* Navigation Links */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    <NotFoundNavCard to="/" icon={<Home size={16} />} label="Accueil" />
                    <NotFoundNavCard to="/projets" icon={<FolderOpen size={16} />} label="Projets" />
                    <NotFoundNavCard to="/evenements" icon={<Calendar size={16} />} label="Événements" />
                    <NotFoundNavCard to="/contact" icon={<Mail size={16} />} label="Contact" />
                </div>

                {/* Return Button */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors border border-slate-200 shadow-xs"
                    >
                        <ArrowLeft size={14} />
                        Page précédente
                    </button>
                    <Link
                        to="/"
                        className="btn-phoenix-orange !py-2 !px-5 !text-xs rounded-xl inline-flex items-center gap-2"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
