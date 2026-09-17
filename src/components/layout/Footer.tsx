import { Facebook, Instagram, Mail, MapPin, Music2, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="relative bg-[#2A082D] bg-bird-pattern-dark text-slate-300 pt-16 pb-12 border-t border-[#6F2B75]/40 overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3.5">
                            <img
                                src="/logo-badge.jpg"
                                alt="Phœnix EDC Logo"
                                className="w-12 h-12 rounded-full object-contain border-2 border-white/20 shadow-md"
                            />
                            <div className="flex flex-col">
                                <span translate="no" className="notranslate font-display text-2xl tracking-normal text-white leading-none">
                                    Phœnix <span className="text-[#FF7E2E]">EDC</span>
                                </span>
                                <span className="text-[10px] font-school font-bold uppercase tracking-wider text-[#ECDDFD] mt-1">
                                    Marseille · Depuis 2011 · KEDGE BS
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-300/80 text-xs sm:text-sm leading-relaxed max-w-xs font-normal">
                            {t('footer.description')}
                        </p>
                    </div>

                    {/* Quick Links Section */}
                    <div>
                        <h3 className="font-display text-base tracking-normal text-white mb-4">
                            {t('footer.quickLinks')}
                        </h3>
                        <ul className="space-y-2.5 text-xs sm:text-sm">
                            <li>
                                <Link to="/association" className="text-slate-300 hover:text-[#FF7E2E] transition-colors duration-200">
                                    L'Association (Histoire & Valeurs)
                                </Link>
                            </li>
                            <li>
                                <Link to="/projets" className="text-slate-300 hover:text-[#FF7E2E] transition-colors duration-200">
                                    {t('footer.ourProjects')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/evenements" className="text-slate-300 hover:text-[#FF7E2E] transition-colors duration-200">
                                    {t('footer.events')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/partenaires" className="text-slate-300 hover:text-[#FF7E2E] transition-colors duration-200">
                                    {t('footer.becomePartner')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/documents" className="text-slate-300 hover:text-[#FF7E2E] transition-colors duration-200">
                                    Documents & Guides
                                </Link>
                            </li>
                            <li>
                                <Link to="/transparence" className="text-slate-300 hover:text-[#FF7E2E] transition-colors duration-200">
                                    {t('footer.transparency')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/mentions-legales" className="text-slate-300 hover:text-[#FF7E2E] transition-colors duration-200">
                                    {t('footer.legalMentions')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="font-display text-base tracking-normal text-white mb-4">
                            {t('footer.contact')}
                        </h3>
                        <ul className="space-y-3 text-xs sm:text-sm">
                            <li className="flex items-start gap-2.5">
                                <MapPin size={16} className="text-[#EC602B] shrink-0 mt-0.5" />
                                <span className="leading-relaxed text-slate-300">
                                    KEDGE Business School<br />
                                    Domaine de Luminy<br />
                                    13009 Marseille
                                </span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Mail size={16} className="text-[#EC602B] shrink-0" />
                                <a
                                    href="mailto:phoenixedc.asso@gmail.com"
                                    className="text-slate-300 hover:text-[#FF7E2E] transition-colors hover:underline"
                                >
                                    phoenixedc.asso@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media Section */}
                    <div>
                        <h3 className="font-display text-base tracking-normal text-white mb-4">
                            {t('footer.followUs')}
                        </h3>
                        <div className="flex gap-2.5 mb-5">
                            <a
                                href="https://www.instagram.com/phoenixedc/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-all duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram size={17} />
                            </a>
                            <a
                                href="https://fr.linkedin.com/company/phoenix-egalit%C3%A9deschances"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-all duration-200"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={17} />
                            </a>
                            <a
                                href="https://www.tiktok.com/@phoenixedc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-all duration-200"
                                aria-label="TikTok"
                            >
                                <Music2 size={17} />
                            </a>
                            <a
                                href="https://www.facebook.com/phoenix.egalitedeschances/?locale=fr_FR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#EC602B] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-all duration-200"
                                aria-label="Facebook"
                            >
                                <Facebook size={17} />
                            </a>
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECDDFD]/15 border border-[#ECDDFD]/20 text-[11px] text-[#ECDDFD]">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>100% sur le terrain</span>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="text-center pt-8 border-t border-white/10">
                    <p className="text-slate-400 text-xs font-medium">
                        © {new Date().getFullYear()} <span className="text-[#FF7E2E] font-bold">Phœnix Égalité des Chances</span>. {t('footer.rights')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
