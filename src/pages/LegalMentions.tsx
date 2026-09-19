
import { SEO } from '../components/common/SEO';

export function LegalMentions() {
    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-20">
            <SEO
                title="Mentions Légales | Phœnix Égalité des Chances"
                description="Consultez les mentions légales et informations administratives de l'association Phœnix Égalité des Chances (KEDGE Business School Marseille)."
            />
            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <div className="mb-12 text-center">
                    <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] mb-2 block">
                        Transparence & Cadre Légal
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-display text-[#2A082D] mb-4 tracking-tight">
                        Mentions Légales
                    </h1>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-soft border border-[#ECDDFD] space-y-8 text-slate-700 leading-relaxed font-normal">
                    <section>
                        <h2 className="text-xl sm:text-2xl font-display text-[#2A082D] mb-3">1. Édition du site</h2>
                        <p>
                            En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site internet <strong>Phoenix Égalité des Chances</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-slate-600">
                            <li><strong>Propriétaire du site :</strong> Association Phoenix Égalité des Chances</li>
                            <li><strong>Statut :</strong> Association loi 1901 d'intérêt général</li>
                            <li><strong>Adresse :</strong> KEDGE Business School, Domaine de Luminy, 13009 Marseille</li>
                            <li><strong>Contact :</strong> phoenixedc.asso@gmail.com</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-display text-[#2A082D] mb-3">2. Hébergement</h2>
                        <p>
                            Le site est hébergé par :<br />
                            <strong>GitHub Pages</strong><br />
                            88 Colin P Kelly Jr St, San Francisco, CA 94107, United States
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-display text-[#2A082D] mb-3">3. Propriété intellectuelle et contrefaçons</h2>
                        <p>
                            <strong>Phoenix Égalité des Chances</strong> est propriétaire des droits de propriété intellectuelle et détient les droits d'usage sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, vidéos, architecture, icônes et sons.
                        </p>
                        <p className="mt-4">
                            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'association.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-display text-[#2A082D] mb-3">4. Limitations de responsabilité</h2>
                        <p>
                            Phoenix Égalité des Chances ne pourra être tenu pour responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site.
                        </p>
                        <p className="mt-4">
                            L'association décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur le site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl sm:text-2xl font-display text-[#2A082D] mb-3">5. Données personnelles</h2>
                        <p>
                            Conformément aux dispositions de la loi 78-17 du 6 janvier 1978 modifiée, l'utilisateur du site dispose d'un droit d'accès, de modification et de suppression des informations collectées. Pour exercer ce droit, envoyez un message à notre délégué à la protection des données via le formulaire de contact ou par email.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
