import { Facebook, Instagram, Mail, MapPin, Music2, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="relative bg-transparent text-white py-20 border-t border-white/10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo-badge.jpg"
                                alt="Phoenix EDC Logo"
                                className="w-12 h-12 object-contain bg-white rounded-full shadow-lg"
                            />
                            <span className="font-black text-2xl tracking-tight">
                                Phoenix <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600">EDC</span>
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="font-black text-lg mb-6 uppercase tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">{t('footer.contact')}</span>
                        </h3>
                        <ul className="space-y-4 text-gray-300 text-sm">
                            <li className="flex items-start gap-3 group">
                                <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                <span className="leading-relaxed">
                                    KEDGE Business School<br />
                                    Domaine de Luminy<br />
                                    13009 Marseille
                                </span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <Mail size={18} className="text-purple-500 shrink-0 group-hover:scale-110 transition-transform" />
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
                        <h3 className="font-black text-lg mb-6 uppercase tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">{t('footer.quickLinks')}</span>
                        </h3>
                        <ul className="space-y-3 text-gray-300 text-sm">
                            <li>
                                <Link
                                    to="/projets"
                                    className="hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                                >
                                    → {t('footer.ourProjects')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/evenements"
                                    className="hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                                >
                                    → {t('footer.events')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contact?category=partenariat"
                                    className="hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                                >
                                    → {t('footer.becomePartner')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/transparence"
                                    className="hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                                >
                                    → {t('footer.transparency')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/mentions-legales"
                                    className="hover:text-white transition-colors hover:translate-x-1 inline-block transform duration-200"
                                >
                                    → {t('footer.legalMentions')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media Section */}
                    <div>
                        <h3 className="font-black text-lg mb-6 uppercase tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-orange-500">{t('footer.followUs')}</span>
                        </h3>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/phoenixedc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 hover:scale-110 transition-all duration-300 shadow-lg"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href="https://fr.linkedin.com/company/phoenix-egalit%C3%A9deschances"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 hover:scale-110 transition-all duration-300 shadow-lg"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@phoenixedc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 hover:scale-110 transition-all duration-300 shadow-lg"
                                aria-label="TikTok"
                            >
                                <Music2 size={20} />
                            </a>
                            <a
                                href="https://www.facebook.com/phoenix.egalitedeschances/?locale=fr_FR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 hover:scale-110 transition-all duration-300 shadow-lg"
                                aria-label="Facebook"
                            >
                                <Facebook size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="text-center mt-12">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-violet-600 font-semibold">Phoenix Égalité des Chances</span>. {t('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
