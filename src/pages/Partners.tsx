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
        <div className="pt-28 sm:pt-32 pb-24 min-h-screen bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200/60 px-4 py-1.5 rounded-full inline-block mb-3">
                        Réseau & Écosystème
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Nos Partenaires Engagés
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-normal">
                        L'action de Phoenix EDC repose sur la confiance de grandes entreprises, d'institutions éducatives et d'associations locales mobilisées pour l'égalité des chances à Marseille.
                    </p>
                </div>

                {/* Section 1: Grands Partenaires (Logo Grid) */}
                <div className="mb-20">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2.5">
                        <Building2 className="text-orange-500" size={24} />
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
                                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm bg-white border-2 border-slate-200 hover:border-orange-400 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                <div className="h-20 w-full flex items-center justify-center p-2 mb-4 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                                    <img
                                        src={partner.logo}
                                        alt={partner.name}
                                        className="max-h-14 max-w-[85%] object-contain filter transition-all group-hover:scale-105"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-orange-600 transition-colors">
                                        {partner.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        {partner.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Section 2: Établissements Scolaires (Collèges & Lycées) */}
                <div className="mb-20">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-2.5">
                        <School className="text-orange-500" size={24} />
                        <span>Établissements Scolaires & Structures Partenaires</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Collèges */}
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                                <School size={18} className="text-orange-500" />
                                <h3 className="font-bold text-slate-900 text-base">Collèges</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.colleges.map((college) => (
                                    <div key={college.name} className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-100 transition-colors">
                                        <p className="font-bold text-sm text-slate-900">{college.name}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                            <span>{college.city}</span>
                                            <span className="font-semibold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md text-[10px]">
                                                {college.project}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lycées */}
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                                <GraduationCap size={18} className="text-orange-500" />
                                <h3 className="font-bold text-slate-900 text-base">Lycées</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.lycees.map((lycee) => (
                                    <div key={lycee.name} className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-100 transition-colors">
                                        <p className="font-bold text-sm text-slate-900">{lycee.name}</p>
                                        <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                            <span>{lycee.city}</span>
                                            <span className="font-semibold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md text-[10px]">
                                                {lycee.project}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Centres sociaux & structures */}
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                                <Building2 size={18} className="text-orange-500" />
                                <h3 className="font-bold text-slate-900 text-base">Centres & Fondations</h3>
                            </div>
                            <div className="space-y-3">
                                {schoolPartners.centres.map((centre) => (
                                    <div key={centre.name} className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-100 transition-colors">
                                        <p className="font-bold text-sm text-slate-900">{centre.name}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{centre.type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Culture & Associatifs */}
                <div className="mb-20">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2.5">
                        <Sparkles className="text-orange-500" size={24} />
                        <span>Partenaires Culturels & Associatifs</span>
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {otherPartners.map((item) => (
                            <div
                                key={item.name}
                                className="bg-white border-2 border-slate-200 hover:border-orange-400 rounded-2xl p-4 text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2.5">
                                    <item.icon size={20} />
                                </div>
                                <p className="font-bold text-sm text-slate-900 leading-snug">{item.name}</p>
                                <span className="text-[10px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                                    {item.category}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Devenir Partenaire */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-700">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold mb-4">
                            <Handshake size={14} />
                            <span>Rejoindre notre réseau</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
                            Vous souhaitez devenir partenaire ?
                        </h3>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                            Participez au développement de l'égalité des chances à Marseille en soutenant nos projets de tutorat, nos sorties culturelles et nos événements annuels.
                        </p>
                    </div>

                    <Link
                        to="/contact?category=partenariat"
                        className="shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <span>Nous contacter</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
