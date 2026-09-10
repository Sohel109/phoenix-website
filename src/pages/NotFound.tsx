import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FolderOpen, Calendar, Mail, Compass, ArrowLeft, ArrowRight } from 'lucide-react';

export function NotFound() {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname.toLowerCase();

    useEffect(() => {
        document.title = 'Page introuvable (404) | Phoenix Égalité des Chances';
    }, []);

    // Détection intelligente d'une page correspondante pour les anciens liens
    const suggestedRedirect = useMemo(() => {
        if (path.includes('projet') || path.includes('tutorat') || path.includes('gabriel') || path.includes('acse') || path.includes('massalia') || path.includes('izzo') || path.includes('auteuil') || path.includes('rimbaud')) {
            return {
                label: 'Nos Projets de tutorat',
                to: '/projets',
                icon: <FolderOpen size={18} className="text-orange-400" />
            };
        }
        if (path.includes('mec') || path.includes('jedc') || path.includes('simonu') || path.includes('olympiade') || path.includes('entretien') || path.includes('event')) {
            return {
                label: 'Nos Événements phares',
                to: '/evenements',
                icon: <Calendar size={18} className="text-orange-400" />
            };
        }
        if (path.includes('partenaire')) {
            return {
                label: 'Nos Partenaires',
                to: '/partenaires',
                icon: <Compass size={18} className="text-orange-400" />
            };
        }
        if (path.includes('contact') || path.includes('rejoindre') || path.includes('recrutement')) {
            return {
                label: 'Nous Contacter',
                to: '/contact',
                icon: <Mail size={18} className="text-orange-400" />
            };
        }
        return null;
    }, [path]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-xl w-full text-center"
            >
                {/* 404 Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-wider mb-6">
                    <Compass size={14} />
                    Erreur 404 · Page introuvable
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                    Oups, cette page n'existe plus !
                </h1>

                <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
                    Le site de <strong className="text-white font-semibold">Phoenix Égalité des Chances</strong> a fait peau neuve. 
                    Si vous venez d'un ancien lien ou d'une recherche Google, la page que vous recherchez a probablement changé d'adresse.
                </p>

                {/* Suggestion intelligente si ancien lien détecté */}
                {suggestedRedirect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-white/5 border border-orange-500/30 mb-8 text-left flex items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                                {suggestedRedirect.icon}
                            </div>
                            <div>
                                <p className="text-xs text-white/50 font-medium">Vous cherchiez peut-être :</p>
                                <p className="text-sm font-bold text-white">{suggestedRedirect.label}</p>
                            </div>
                        </div>
                        <Link
                            to={suggestedRedirect.to}
                            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shrink-0"
                        >
                            Y aller
                            <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                )}

                {/* Navigation Links */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    <Link
                        to="/"
                        className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white transition-all group"
                    >
                        <Home size={20} className="text-orange-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Accueil</span>
                    </Link>
                    <Link
                        to="/projets"
                        className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white transition-all group"
                    >
                        <FolderOpen size={20} className="text-orange-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Projets</span>
                    </Link>
                    <Link
                        to="/evenements"
                        className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white transition-all group"
                    >
                        <Calendar size={20} className="text-orange-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Événements</span>
                    </Link>
                    <Link
                        to="/contact"
                        className="flex flex-col items-center gap-2 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white transition-all group"
                    >
                        <Mail size={20} className="text-orange-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold">Contact</span>
                    </Link>
                </div>

                {/* Return Button */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors border border-white/10"
                    >
                        <ArrowLeft size={14} />
                        Page précédente
                    </button>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
