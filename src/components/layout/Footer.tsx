import { Facebook, Instagram, Mail, MapPin, Music2, Linkedin, Phone, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MaskingTape } from '../common/HandDrawnElements';
import { usePublicNews } from '../../hooks/usePublicNews';
import { formatNewsDate } from '../../data/news';

/** Les 2 derniers articles ; sans article (ou service indisponible), un renvoi vers Instagram. */
function FooterNews() {
    const { data } = usePublicNews();
    const latest = (data?.articles ?? []).slice(0, 2);
    if (latest.length === 0) {
        return (
            <div className="space-y-3">
                <p className="text-xs sm:text-sm text-[#ECDDFD]/80 leading-relaxed">Suivez la vie de l'association sur Instagram.</p>
                <a
                    href="https://www.instagram.com/phoenixedc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 btn-phoenix-orange text-xs shadow-md hover:shadow-lg touch-tactile"
                >
                    <Instagram size={14} />
                    <span>@phoenixedc</span>
                </a>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            <ul className="space-y-3">
                {latest.map((article) => (
                    <li key={article.slug}>
                        <Link to={`/actualites/${article.slug}`} className="group block rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:border-[#EC602B]/60 hover:bg-white/10 transition-colors">
                            <span className="block text-[11px] font-school font-bold uppercase tracking-wider text-[#ECDDFD]/55">{formatNewsDate(article.publishedAt)}</span>
                            <span className="block mt-0.5 text-sm font-semibold text-white leading-snug group-hover:text-[#FF7E2E] transition-colors">{article.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link to="/actualites" className="inline-flex items-center gap-2 px-6 py-2.5 btn-phoenix-orange text-xs shadow-md hover:shadow-lg touch-tactile">
                <span>Toutes les actus</span>
                <ArrowRight size={14} />
            </Link>
        </div>
    );
}

export function Footer() {
    const location = useLocation();
    // Masquer le footer dans l'intranet planning (design sombre, pas de footer public)
    if (location.pathname.startsWith('/planning')) return null;

    return (
        <footer className="relative bg-[#2A082D] text-[#ECDDFD]/75 pt-16 pb-10 border-t border-[#6F2B75]/40 overflow-hidden">
            {/* Trame filigrane Phœnix officielle sur fond violet sombre */}
            <div className="pattern-watermark-dark" aria-hidden="true" />

            <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                {/* 3 Grandes Colonnes inspirées du site Action Grand Sud */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-14 border-b border-white/10">

                    {/* Colonne 1 : Identité, Coordonnées & Réseaux sociaux (Action Grand Sud Style) */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-badge-128.webp"
                                width={44}
                                height={46}
                                alt="Logo officiel de l'association Phœnix Égalité des Chances – KEDGE BS Marseille"
                                loading="lazy"
                                className="w-11 h-11 rounded-full object-contain border border-white/20 shadow-md"
                            />
                            <div>
                                <h3 className="font-display text-2xl text-white tracking-normal leading-none">
                                    Phœnix <span className="text-[#EC602B]">EDC</span>
                                </h3>
                                <p className="text-[11px] font-school font-bold uppercase tracking-wider text-[#ECDDFD] mt-1">
                                    Égalité des Chances · KEDGE BS
                                </p>
                            </div>
                        </div>

                        <ul className="space-y-3.5 text-xs sm:text-sm text-[#ECDDFD]/75 font-medium">
                            <li className="flex items-center gap-3 group">
                                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#EC602B] shrink-0 group-hover:bg-[#EC602B] group-hover:text-white transition-colors">
                                    <Phone size={15} />
                                </span>
                                <a href="tel:0491827844" className="hover:text-white hover:underline transition-colors">
                                    04 91 82 78 44
                                </a>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#EC602B] shrink-0 group-hover:bg-[#EC602B] group-hover:text-white transition-colors">
                                    <Mail size={15} />
                                </span>
                                <a href="mailto:phoenixedc.asso@gmail.com" className="hover:text-white hover:underline transition-colors">
                                    phoenixedc.asso@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#EC602B] shrink-0 mt-0.5 group-hover:bg-[#EC602B] group-hover:text-white transition-colors">
                                    <MapPin size={15} />
                                </span>
                                <span className="leading-relaxed">
                                    KEDGE Business School<br />
                                    Domaine de Luminy · Rue Antoine Bourdelle<br />
                                    13009 Marseille · FRANCE
                                </span>
                            </li>
                        </ul>

                        {/* Liens réseaux sociaux carrés/arrondis style Action Grand Sud */}
                        <div className="pt-2">
                            <p className="text-xs uppercase font-school font-bold tracking-wider text-[#ECDDFD] mb-3">
                                Suivez-nous
                            </p>
                            <div className="flex gap-2.5">
                                <a
                                    href="https://www.instagram.com/phoenixedc/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                                    aria-label="Instagram de Phœnix EDC"
                                >
                                    <Instagram size={17} />
                                </a>
                                <a
                                    href="https://fr.linkedin.com/company/phoenix-egalit%C3%A9deschances"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                                    aria-label="LinkedIn de Phœnix EDC"
                                >
                                    <Linkedin size={17} />
                                </a>
                                <a
                                    href="https://www.tiktok.com/@phoenixedc"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                                    aria-label="TikTok de Phœnix EDC"
                                >
                                    <Music2 size={17} />
                                </a>
                                <a
                                    href="https://www.facebook.com/phoenix.egalitedeschances/?locale=fr_FR"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
                                    aria-label="Facebook de Phœnix EDC"
                                >
                                    <Facebook size={17} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Colonne 2 : Navigation claire (Action Grand Sud Style) */}
                    <div className="md:col-span-3 space-y-4">
                        <h4 className="text-base font-bold text-white tracking-wide border-b border-white/10 pb-2">
                            Navigation
                        </h4>
                        <ul className="space-y-2.5 text-xs sm:text-sm text-[#ECDDFD]/75">
                            <li>
                                <Link to="/" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link to="/association" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    L'Association
                                </Link>
                            </li>
                            <li>
                                <Link to="/projets" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Nos Projets &amp; Actions
                                </Link>
                            </li>
                            <li>
                                <Link to="/soutien-scolaire-marseille" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Soutien scolaire à Marseille
                                </Link>
                            </li>
                            <li>
                                <Link to="/evenements" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Nos Événements (SimONU &amp; JEDC)
                                </Link>
                            </li>
                            <li>
                                <Link to="/actualites" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Actualités
                                </Link>
                            </li>
                            <li>
                                <Link to="/tuteur-du-mois" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Tuteur du mois
                                </Link>
                            </li>
                            <li>
                                <Link to="/partenaires" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Partenaires &amp; Réseau
                                </Link>
                            </li>
                            <li>
                                <Link to="/documents" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Documents &amp; Guides
                                </Link>
                            </li>
                            <li>
                                <Link to="/transparence" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Transparence Financière &amp; Dons
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all">
                                    Contact &amp; Devenir Partenaire
                                </Link>
                            </li>
                            <li>
                                <Link to="/planning/login" className="hover:text-[#EC602B] hover:translate-x-1 inline-block transition-all font-semibold text-[#ECDDFD]">
                                    Espace Membre (Tuteurs &amp; Bureau)
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 3 : dernières actualités (fiche carnet scotchée) */}
                    <div className="md:col-span-5 space-y-4 relative">
                        <MaskingTape variant="lilac" angle="right" className="hidden sm:block -top-2 right-6 z-30" />
                        <div className="flex items-baseline gap-3 border-b border-white/10 pb-2">
                            <h4 className="font-display text-xl text-white tracking-normal">
                                Dernières actus
                            </h4>
                            <span className="font-script text-lg text-[#FF7E2E] -rotate-1 select-none hidden sm:inline">
                                Restez connectés ✦
                            </span>
                        </div>
                        <FooterNews />
                    </div>
                </div>

                {/* Bas de page / Copyright & Mentions légales (Action Grand Sud Style) */}
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#ECDDFD]/60">
                    <p>
                        © {new Date().getFullYear()} <span className="text-white font-medium">Phœnix Égalité des Chances</span> - Tous droits réservés -{' '}
                        <Link to="/mentions-legales" className="hover:text-white underline transition-colors">
                            Mentions légales
                        </Link>
                    </p>
                    <p className="text-[#ECDDFD]/50 text-[11px] sm:text-xs">
                        Association reconnue d'intérêt général (Loi 1901) · KEDGE Business School Marseille
                    </p>
                </div>
            </div>
        </footer>
    );
}
