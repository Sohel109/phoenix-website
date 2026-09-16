import { Facebook, Instagram, Mail, MapPin, Music2, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="relative bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-phoenix-footer-new.png"
                                alt="Phoenix EDC Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <span translate="no" className="notranslate font-black text-2xl tracking-tight text-white">
                                Phoenix <span className="text-orange-500">EDC</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs font-normal">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Quick Links Section */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-4">
                            {t('footer.quickLinks')}
                        </h3>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link to="/projets" className="text-slate-400 hover:text-white transition-colors duration-200">
                                    {t('footer.ourProjects')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/evenements" className="text-slate-400 hover:text-white transition-colors duration-200">
                                    {t('footer.events')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/partenaires" className="text-slate-400 hover:text-white transition-colors duration-200">
                                    {t('footer.becomePartner')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/documents" className="text-slate-400 hover:text-white transition-colors duration-200">
                                    Documents & Guides
                                </Link>
                            </li>
                            <li>
                                <Link to="/transparence" className="text-slate-400 hover:text-white transition-colors duration-200">
                                    {t('footer.transparency')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/mentions-legales" className="text-slate-400 hover:text-white transition-colors duration-200">
                                    {t('footer.legalMentions')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-4">
                            {t('footer.contact')}
                        </h3>
                        <ul className="space-y-3 text-xs sm:text-sm">
                            <li className="flex items-start gap-2.5">
                                <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                <span className="leading-relaxed text-slate-400">
                                    KEDGE Business School<br />
                                    Domaine de Luminy<br />
                                    13009 Marseille
                                </span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail size={16} className="text-orange-500 shrink-0" />
                                <a
                                    href="mailto:phoenixedc.asso@gmail.com"
                                    className="text-slate-400 hover:text-orange-400 transition-colors hover:underline"
                                >
                                    phoenixedc.asso@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media Section */}
                    <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-4">
                            {t('footer.followUs')}
                        </h3>
                        <div className="flex gap-2.5 mb-5">
                            <a
                                href="https://www.instagram.com/phoenixedc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram size={17} />
                            </a>
                            <a
                                href="https://fr.linkedin.com/company/phoenix-egalit%C3%A9deschances"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={17} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@phoenixedc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="TikTok"
                            >
                                <Music2 size={17} />
                            </a>
                            <a
                                href="https://www.facebook.com/phoenix.egalitedeschances/?locale=fr_FR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="Facebook"
                            >
                                <Facebook size={17} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="text-center pt-8 border-t border-slate-800/80">
                    <p className="text-slate-500 text-xs">
                        © {new Date().getFullYear()} <span className="text-orange-500 font-medium">Phoenix Égalité des Chances</span>. {t('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
