import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderOpen, Calendar, Mail, Compass, ArrowLeft, ArrowRight, ShieldCheck, Map } from 'lucide-react';

export function NotFound() {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname.toLowerCase();

    useEffect(() => {
        document.title = 'Page introuvable (404) | Phoenix Égalité des Chances';
        return () => {
            document.title = 'Phoenix Égalité des Chances';
        };
    }, []);

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
            <div className="max-w-xl w-full text-center relative z-10">
                {/* 404 Badge */}
                <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] mb-2 block">
                    Erreur 404 · Page introuvable
                </span>

                <h1 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-tight mb-4">
                    Oups, cette page n'existe plus !
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
                    <Link
                        to="/"
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#ECDDFD] hover:border-[#6F2B75] hover:shadow-soft-lg text-[#2A082D] hover:text-[#6F2B75] transition-all group shadow-soft"
                    >
                        <Home size={20} className="text-[#EC602B] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-school font-bold">Accueil</span>
                    </Link>
                    <Link
                        to="/projets"
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#ECDDFD] hover:border-[#6F2B75] hover:shadow-soft-lg text-[#2A082D] hover:text-[#6F2B75] transition-all group shadow-soft"
                    >
                        <FolderOpen size={20} className="text-[#EC602B] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-school font-bold">Projets</span>
                    </Link>
                    <Link
                        to="/evenements"
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#ECDDFD] hover:border-[#6F2B75] hover:shadow-soft-lg text-[#2A082D] hover:text-[#6F2B75] transition-all group shadow-soft"
                    >
                        <Calendar size={20} className="text-[#EC602B] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-school font-bold">Événements</span>
                    </Link>
                    <Link
                        to="/contact"
                        className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-[#ECDDFD] hover:border-[#6F2B75] hover:shadow-soft-lg text-[#2A082D] hover:text-[#6F2B75] transition-all group shadow-soft"
                    >
                        <Mail size={20} className="text-[#EC602B] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-school font-bold">Contact</span>
                    </Link>
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
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
