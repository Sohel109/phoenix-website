import { Link } from 'react-router-dom';
import { ArrowRight, Handshake, School, GraduationCap, Building2, Gift, Sparkles, type LucideIcon } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { MaskingTape, HandDrawnCircle } from '../components/common/HandDrawnElements';
import { useDrawnOnInteract } from '../hooks/useDrawnOnInteract';

const majorPartners = [
    { name: "Olympique de Marseille", logo: "/partners/om.webp", desc: "Soutien et accueil des séances OM Campus & Commanderie" },
    { name: "KEDGE Business School", logo: "/partners/kedge.webp", desc: "École de rattachement, hébergement et accompagnement" },
    { name: "Decathlon", logo: "/partners/decathlon.webp", desc: "Partenaire solidaire et opérations papiers cadeaux" },
    { name: "Deloitte", logo: "/partners/deloitte.webp", desc: "Mécénat et soutien aux initiatives d'égalité des chances" },
    { name: "Apprentis d'Auteuil", logo: "/partners/apprentis-auteuil.webp", desc: "Tutorat et ouverture culturelle au collège Vitagliano" },
    { name: "Darty", logo: "/partners/darty.webp", desc: "Partenaire des Terrasses du Port pour l'autofinancement" },
    { name: "Lydia", logo: "/partners/lydia.webp", desc: "Partenaire digital pour nos projets solidaires" },
];

// Rotations et rubans alternés pour casser la symétrie "mur de logos" façon SaaS
const CARD_VARIANTS = [
    { rotation: '-rotate-1', tape: 'warm' as const, angle: 'left' as const },
    { rotation: 'rotate-1', tape: 'lilac' as const, angle: 'right' as const },
    { rotation: '-rotate-[0.5deg]', tape: 'warm' as const, angle: 'center' as const },
    { rotation: 'rotate-[1.5deg]', tape: 'lilac' as const, angle: 'left' as const },
    { rotation: '-rotate-[1.5deg]', tape: 'warm' as const, angle: 'right' as const },
    { rotation: 'rotate-[0.5deg]', tape: 'lilac' as const, angle: 'center' as const },
    { rotation: '-rotate-1', tape: 'warm' as const, angle: 'left' as const },
];

const schoolPartners = {
    colleges: [
        { name: "Collège Jean-Claude Izzo", city: "Marseille (2e)", project: "Projet IZZO" },
        { name: "Collège Roy d'Espagne", city: "Marseille (9e)", project: "Projet Roy d'Espagne" },
        { name: "Collège Vitagliano", city: "Marseille (4e)", project: "Projet Apprentis d'Auteuil" },
        { name: "Collège Jules Ferry", city: "Marseille (15e)", project: "Projet Jules Ferry" },
    ],
    lycees: [
        { name: "Lycée Saint-Exupéry", city: "Marseille (15e)", project: "Projet ACSE" },
        { name: "Lycée Victor Hugo", city: "Marseille (3e)", project: "Projet ACSE" },
    ],
    centres: [
        { name: "Fondation Apprentis d'Auteuil", type: "Fondation reconnue d'utilité publique" },
        { name: "Association Massabielle", type: "Maison de quartier Bernadette (13e)" },
        { name: "Centre Social Saint Gabriel", type: "Centre d'animation sociale (14e)" },
        { name: "Centre de Formation de l'OM", type: "La Commanderie & OM Campus" },
    ]
};

const otherPartners = [
    { name: "Le Mucem", category: "Culture", icon: Sparkles },
    { name: "La Fnac", category: "Culture & Savoir", icon: Gift },
    { name: "LCL", category: "Banque & Mécénat", icon: Building2 },
    { name: "Plum Énergie", category: "Énergie Verte", icon: Building2 },
    { name: "SimONU Marseille", category: "Association étudiante", icon: Handshake },
    { name: "Échanges Phocéens", category: "Association étudiante", icon: Handshake },
];

function CultureBadge({ item }: { item: { name: string; category: string; icon: LucideIcon } }) {
    // Seule animation : le cercle au feutre qui se dessine autour de l'icône (survol / tap).
    const { isDrawn, interactionProps } = useDrawnOnInteract();

    return (
        <div
            className="bg-white border border-[#6F2B75]/15 rounded-organic-sm p-4 text-center flex flex-col items-center justify-center shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 will-change-transform"
            {...interactionProps}
        >
            <div className="relative w-11 h-11 flex items-center justify-center mb-2.5">
                <HandDrawnCircle stroke="#EC602B" strokeWidth={2.2} className="inset-0 w-full h-full" animated drawn={isDrawn} />
                <div className="w-8 h-8 rounded-full bg-white text-[#2A082D] flex items-center justify-center border border-[#2A082D]/10 shadow-soft">
                    <item.icon size={17} />
                </div>
            </div>
            <p className="font-display text-sm text-[#2A082D] leading-snug">{item.name}</p>
            <span className="text-[10px] font-school font-bold text-slate-500 mt-1 uppercase tracking-wider">
                {item.category}
            </span>
        </div>
    );
}

const partnersBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://www.phoenix-egalite-des-chances.com/"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Partenaires",
            "item": "https://www.phoenix-egalite-des-chances.com/partenaires"
        }
    ]
};

export function Partners() {

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title="Nos Partenaires – Mécénat & Réseau Partenaire – Marseille / KEDGE BS"
                description="Devenez entreprise partenaire mécène de Phœnix EDC : soutenez l'égalité des chances à Marseille, valorisez votre démarche RSE et défiscalisez vos dons à 60%."
                schema={partnersBreadcrumbSchema}
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Réseau &amp; Écosystème
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display text-[#2A082D] tracking-tight mb-4">
                        Nos{' '}
                        <span className="marker-highlight text-[#EC602B]">
                            <span>Partenaires Engagés</span>
                        </span>
                    </h1>
                    <p className="text-[#2A082D]/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                        L'action de Phoenix EDC repose sur la confiance de grandes entreprises, d'institutions éducatives et d'associations locales mobilisées pour l'égalité des chances à Marseille.
                    </p>
                </div>

                {/* Section 1: Grands Partenaires (mur de fiches façon carnet, pas une grille SaaS) */}
                <div className="mb-24">
                    <h2 className="text-xl sm:text-3xl font-display text-[#2A082D] tracking-tight mb-10 flex items-center gap-3">
                        <Building2 className="text-[#EC602B]" size={26} />
                        <span>Grands Partenaires & Entreprises</span>
                    </h2>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-12 pattern-notebook-grid rounded-organic py-10 px-4 sm:px-8">
                        {majorPartners.map((partner, i) => {
                            const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];
                            return (
                                <div
                                    key={partner.name}
                                    className={`relative group w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm ${variant.rotation} hover:rotate-0 transition-transform duration-300`}
                                >
                                    <MaskingTape variant={variant.tape} angle={variant.angle} className="-top-3 left-1/2 -translate-x-1/2 z-30" />
                                    <div className="bg-white border border-[#6F2B75]/15 rounded-organic-sm card-polaroid p-6 flex flex-col justify-between will-change-transform h-full">
                                        <div className="h-22 w-full flex items-center justify-center p-3 mb-4 bg-[#FFFBF4] rounded-organic-sm border border-[#6F2B75]/10 group-hover:bg-[#ECDDFD]/30 transition-colors">
                                            <img
                                                src={partner.logo}
                                                alt={`Logo officiel de l'entreprise partenaire ${partner.name} – Mécénat Phœnix Égalité des Chances Marseille`}
                                                className="max-h-14 max-w-[85%] object-contain filter transition-all group-hover:scale-105"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-[#2A082D] text-base mb-1 group-hover:text-[#EC602B] transition-colors">
                                                {partner.name}
                                            </h3>
                                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                                {partner.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section 2: Établissements Scolaires (Collèges & Lycées) */}
                <div className="mb-20">
                    <h2 className="text-xl sm:text-3xl font-display text-[#2A082D] tracking-tight mb-8 flex items-center gap-3">
                        <School className="text-[#EC602B]" size={26} />
                        <span>Établissements Scolaires & Structures Partenaires</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Collèges */}
                        <div className="bg-white border border-[#6F2B75]/15 rounded-organic-sm p-6 shadow-phoenix-colored">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#6F2B75]/15">
                                <School size={20} className="text-[#EC602B]" />
                                <h3 className="font-display text-[#2A082D] text-base">Collèges</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.colleges.map((college) => (
                                    <div key={college.name} className="p-3.5 rounded-xl bg-[#ECDDFD]/30 hover:bg-[#ECDDFD]/60 border border-[#6F2B75]/10 transition-colors">
                                        <p className="font-bold text-sm text-[#2A082D]">{college.name}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                                            <span>{college.city}</span>
                                            <span className="font-school font-bold text-[#6F2B75] bg-[#ECDDFD] px-2.5 py-0.5 rounded-full text-[10px]">
                                                {college.project}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lycées */}
                        <div className="bg-white border border-[#6F2B75]/15 rounded-organic-sm p-6 shadow-phoenix-colored">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#6F2B75]/15">
                                <GraduationCap size={20} className="text-[#EC602B]" />
                                <h3 className="font-display text-[#2A082D] text-base">Lycées</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.lycees.map((lycee) => (
                                    <div key={lycee.name} className="p-3.5 rounded-xl bg-[#ECDDFD]/30 hover:bg-[#ECDDFD]/60 border border-[#6F2B75]/10 transition-colors">
                                        <p className="font-bold text-sm text-[#2A082D]">{lycee.name}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                                            <span>{lycee.city}</span>
                                            <span className="font-school font-bold text-[#6F2B75] bg-[#ECDDFD] px-2.5 py-0.5 rounded-full text-[10px]">
                                                {lycee.project}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Centres sociaux & structures */}
                        <div className="bg-white border border-[#6F2B75]/15 rounded-organic-sm p-6 shadow-phoenix-colored">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#6F2B75]/15">
                                <Building2 size={20} className="text-[#EC602B]" />
                                <h3 className="font-display text-[#2A082D] text-base">Centres & Fondations</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.centres.map((centre) => (
                                    <div key={centre.name} className="p-3.5 rounded-xl bg-[#ECDDFD]/30 hover:bg-[#ECDDFD]/60 border border-[#6F2B75]/10 transition-colors">
                                        <p className="font-bold text-sm text-[#2A082D]">{centre.name}</p>
                                        <p className="text-xs text-slate-600 font-medium mt-0.5">{centre.type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Culture & Associatifs */}
                <div className="mb-20">
                    <h2 className="text-xl sm:text-3xl font-display text-[#2A082D] tracking-tight mb-6 flex items-center gap-3">
                        <Sparkles className="text-[#EC602B]" size={26} />
                        <span>Partenaires Culturels & Associatifs</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {otherPartners.map((item) => (
                            <CultureBadge key={item.name} item={item} />
                        ))}
                    </div>
                </div>

                {/* CTA Devenir Partenaire */}
                <div className="bg-[#2A082D] bg-bird-pattern-dark text-white rounded-organic p-8 sm:p-12 shadow-phoenix-colored flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="max-w-xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-school font-bold mb-4 shadow-soft">
                            <Handshake size={14} className="text-[#FF7E2E]" />
                            <span>Rejoindre notre réseau</span>
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-display tracking-tight mb-3 text-white">
                            Vous souhaitez devenir partenaire ?
                        </h3>
                        <p className="text-[#ECDDFD] text-sm sm:text-base leading-relaxed font-medium">
                            Participez au développement de l'égalité des chances à Marseille en soutenant nos projets de tutorat, nos sorties culturelles et nos événements annuels.
                        </p>
                    </div>

                    <Link
                        to="/contact?category=partenariat"
                        className="btn-phoenix-orange btn-glow-orange !py-3.5 !px-7 rounded-lg shadow-glow-orange shrink-0 flex items-center gap-2 touch-tactile"
                    >
                        <span>Nous contacter</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

