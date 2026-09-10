import { Facebook, Instagram, Mail, MapPin, Music2, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="relative bg-transparent text-white pt-20 pb-safe-nav md:pb-20 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-phoenix-footer-new.png"
                                alt="Phoenix EDC Logo"
                                className="w-16 h-16 object-contain"
                            />
                            <span translate="no" className="notranslate font-black text-2xl tracking-tight">
                                Phoenix <span className="text-orange-500">EDC</span>
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="font-black text-lg mb-6 uppercase tracking-tight text-white">
                            {t('footer.contact')}
                        </h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li className="flex items-start gap-3 group">
                                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">
                                    KEDGE Business School<br />
                                    Domaine de Luminy<br />
                                    13009 Marseille
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <Mail size={18} className="text-orange-500 shrink-0" />
                                <a
                                    href="mailto:phoenixedc.asso@gmail.com"
                                    className="hover:text-white transition-colors hover:underline"
                                >
                                    phoenixedc.asso@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links Section */}
                    <div>
                        <h3 className="font-black text-lg mb-6 uppercase tracking-tight text-white">
                            {t('footer.quickLinks')}
                        </h3>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            <li>
                                <Link
                                    to="/projets"
                                    className="hover:text-white transition-colors"
                                >
                                    → {t('footer.ourProjects')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/evenements"
                                    className="hover:text-white transition-colors"
                                >
                                    → {t('footer.events')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact?category=partenariat"
                                    className="hover:text-white transition-colors"
                                >
                                    → {t('footer.becomePartner')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/transparence"
                                    className="hover:text-white transition-colors"
                                >
                                    → {t('footer.transparency')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/mentions-legales"
                                    className="hover:text-white transition-colors"
                                >
                                    → {t('footer.legalMentions')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media Section */}
                    <div>
                        <h3 className="font-black text-lg mb-6 uppercase tracking-tight text-white">
                            {t('footer.followUs')}
                        </h3>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/phoenixedc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="https://fr.linkedin.com/company/phoenix-egalit%C3%A9deschances"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={18} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@phoenixedc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="TikTok"
                            >
                                <Music2 size={18} />
                            </a>
                            <a
                                href="https://www.facebook.com/phoenix.egalitedeschances/?locale=fr_FR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 hover:scale-105 transition-all duration-200"
                                aria-label="Facebook"
                            >
                                <Facebook size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} <span className="text-orange-500 font-semibold">Phoenix Égalité des Chances</span>. {t('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
