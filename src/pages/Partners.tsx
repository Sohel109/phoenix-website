import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Handshake, School, GraduationCap, Building2, Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';

const majorPartners = [
    { name: "Olympique de Marseille", logo: "/partners/om.png", desc: "Soutien et accueil des séances OM Campus & Commanderie" },
    { name: "KEDGE Business School", logo: "/partners/kedge.png", desc: "École de rattachement, hébergement et accompagnement" },
    { name: "Decathlon", logo: "/partners/decathlon.png", desc: "Partenaire solidaire et opérations papiers cadeaux" },
    { name: "Deloitte", logo: "/partners/deloitte.jpg", desc: "Mécénat et soutien aux initiatives d'égalité des chances" },
    { name: "Apprentis d'Auteuil", logo: "/partners/apprentis-auteuil.png", desc: "Tutorat et ouverture culturelle au collège Vitagliano" },
    { name: "Darty", logo: "/partners/darty.png", desc: "Partenaire des Terrasses du Port pour l'autofinancement" },
    { name: "Lydia", logo: "/partners/lydia.png", desc: "Partenaire digital pour nos projets solidaires" },
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

export function Partners() {
    const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4]">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] bg-[#ECDDFD] shadow-soft px-5 py-2 rounded-full inline-block mb-4">
                        Réseau & Écosystème
                    </span>
                    <p className="font-script text-2xl md:text-3xl text-[#EC602B] mb-1">
                        ~ Mobilisés ensemble pour la jeunesse ~
                    </p>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display text-[#2A082D] tracking-tight mb-4">
                        Nos Partenaires Engagés
                    </h1>
                    <p className="text-[#2A082D]/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                        L'action de Phoenix EDC repose sur la confiance de grandes entreprises, d'institutions éducatives et d'associations locales mobilisées pour l'égalité des chances à Marseille.
                    </p>
                </div>

                {/* Section 1: Grands Partenaires (Logo Grid) */}
                <div className="mb-20">
                    <h2 className="text-xl sm:text-3xl font-display text-[#2A082D] tracking-tight mb-8 flex items-center gap-3">
                        <Building2 className="text-[#EC602B]" size={26} />
                        <span>Grands Partenaires & Entreprises</span>
                    </h2>

                    <div className="flex flex-wrap justify-center gap-6">
                        {majorPartners.map((partner, index) => (
                            <motion.div
                                key={partner.name}
                                initial={isMobile ? false : { opacity: 0, y: 20 }}
                                whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={isMobile ? undefined : { delay: index * 0.06 }}
                                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm bg-white border border-[#ECDDFD] rounded-[2rem] p-6 flex flex-col justify-between shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 group"
                            >
                                <div className="h-22 w-full flex items-center justify-center p-3 mb-4 bg-[#FFFBF4] rounded-2xl border border-[#ECDDFD] group-hover:bg-[#ECDDFD]/30 transition-colors">
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
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
                            </motion.div>
                        ))}
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
                        <div className="bg-white border border-[#ECDDFD] rounded-[2rem] p-6 shadow-soft">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#ECDDFD]/60">
                                <School size={20} className="text-[#EC602B]" />
                                <h3 className="font-display text-[#2A082D] text-base">Collèges</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.colleges.map((college) => (
                                    <div key={college.name} className="p-3.5 rounded-2xl bg-[#ECDDFD]/30 hover:bg-[#ECDDFD]/60 border border-[#ECDDFD] transition-colors">
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
                        <div className="bg-white border border-[#ECDDFD] rounded-[2rem] p-6 shadow-soft">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#ECDDFD]/60">
                                <GraduationCap size={20} className="text-[#EC602B]" />
                                <h3 className="font-display text-[#2A082D] text-base">Lycées</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.lycees.map((lycee) => (
                                    <div key={lycee.name} className="p-3.5 rounded-2xl bg-[#ECDDFD]/30 hover:bg-[#ECDDFD]/60 border border-[#ECDDFD] transition-colors">
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
                        <div className="bg-white border border-[#ECDDFD] rounded-[2rem] p-6 shadow-soft">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#ECDDFD]/60">
                                <Building2 size={20} className="text-[#EC602B]" />
                                <h3 className="font-display text-[#2A082D] text-base">Centres & Fondations</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.centres.map((centre) => (
                                    <div key={centre.name} className="p-3.5 rounded-2xl bg-[#ECDDFD]/30 hover:bg-[#ECDDFD]/60 border border-[#ECDDFD] transition-colors">
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
                            <div
                                key={item.name}
                                className="bg-white border border-[#ECDDFD] rounded-2xl p-4 text-center flex flex-col items-center justify-center shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all"
                            >
                                <div className="w-11 h-11 rounded-full bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center mb-2.5 shadow-soft">
                                    <item.icon size={20} />
                                </div>
                                <p className="font-display text-sm text-[#2A082D] leading-snug">{item.name}</p>
                                <span className="text-[10px] font-school font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                    {item.category}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Devenir Partenaire */}
                <div className="bg-gradient-to-r from-[#6F2B75] via-[#4A154B] to-[#2A082D] text-white rounded-[2.5rem] p-8 sm:p-12 shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-8 bg-bird-pattern-dark">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-[#FF7E2E] border border-white/20 text-xs font-school font-bold mb-4 shadow-soft">
                            <Handshake size={14} />
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
                        className="btn-phoenix-orange !py-3.5 !px-8 rounded-full shadow-glow-orange shrink-0 flex items-center gap-2"
                    >
                        <span>Nous contacter</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

