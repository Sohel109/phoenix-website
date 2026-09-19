import { motion } from 'framer-motion';
import { PieChart, Heart, BookOpen, PartyPopper, FileText, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DonationSimulator } from '../components/DonationSimulator';
import { SEO } from '../components/common/SEO';

const donationBreakdown = [
    {
        category: 'Événements & sorties culturelles',
        percentage: 70,
        color: '#EC4899', // Rose
        icon: PartyPopper,
        description: 'Olympiades, SimONU, sorties culturelles, Marseille Cité Éloquente et JEDC.'
    },
    {
        category: 'Matériel pédagogique & activités',
        percentage: 25,
        color: '#F97316', // Orange
        icon: BookOpen,
        description: "Fournitures scolaires, livres, matériel éducatif et supports d'activités pour les jeunes."
    },
    {
        category: 'Frais administratifs',
        percentage: 5,
        color: '#10B981', // Vert
        icon: FileText,
        description: 'Assurances, outils de gestion, communication et frais de fonctionnement minimal.'
    }
];

const impactExamples = [
    {
        amount: '25€',
        impact: 'Kit complet de matériel pédagogique pour un projet'
    },
    {
        amount: '100€',
        impact: 'Matériel pour une activité culturelle collective'
    },
    {
        amount: '250€',
        impact: "Organisation d'une sortie culturelle pour un groupe"
    },
    {
        amount: '500€',
        impact: "Financement d'un événement majeur (SimONU, Olympiades)"
    }
];

const transparencyBreadcrumbSchema = {
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
            "name": "Transparence Financière & Dons",
            "item": "https://www.phoenix-egalite-des-chances.com/transparence"
        }
    ]
};

export function Transparency() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-16">
            <SEO
                title="Dons Déductibles d'Impôts (66%) & Transparence Financière – Phœnix EDC Marseille"
                description="Soutenez l'éducation à Marseille : vos dons à Phœnix EDC sont déductibles d'impôts à 66% (IR) et 60% (IS). 70% des fonds financent directement les sorties et ateliers."
                schema={transparencyBreadcrumbSchema}
            />
            <div className="container mx-auto px-4 max-w-5xl relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-[#2A082D] font-school font-bold transition-colors text-sm cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    <span>Retour</span>
                </button>

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-[#ECDDFD] text-[#6F2B75] rounded-2xl mb-5 shadow-soft">
                        <PieChart className="w-10 h-10" />
                    </div>
                    <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] mb-2 block">
                        Transparence Financière
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] mb-4 tracking-tight">
                        Comment sont utilisés vos dons ?
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Découvrez comment vos dons transforment la vie de 300 jeunes chaque année à Marseille.
                    </p>
                </div>

                {/* Trust Message */}
                <div className="bg-white border border-[#ECDDFD] rounded-xl p-6 md:p-8 mb-12 shadow-soft">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#ECDDFD] rounded-xl flex-shrink-0 text-[#6F2B75]">
                            <Heart className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-display text-[#2A082D] mb-2">Notre engagement envers vous</h2>
                            <p className="text-slate-600 leading-relaxed font-normal">
                                Phoenix Égalité des Chances est une association <strong className="text-[#6F2B75]">reconnue d'intérêt général</strong>.
                                Vos dons sont <strong className="text-emerald-700">déductibles des impôts à hauteur de 66%</strong>.
                                Nous nous engageons à une <strong className="text-[#2A082D]">transparence totale</strong> sur l'utilisation de chaque euro reçu.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Donation Breakdown - Visual Representation */}
                <div className="mb-12">
                    <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] mb-6 text-center tracking-tight">Répartition des Dons</h2>

                    <div className="bg-white border border-[#ECDDFD] rounded-xl p-6 md:p-8 shadow-soft">
                        <div className="space-y-6">
                            {donationBreakdown.map((item, index) => (
                                <div key={item.category}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-slate-800 font-semibold text-sm">{item.category}</span>
                                        </div>
                                        <span className="text-2xl font-black text-slate-900 min-w-[60px] text-right">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: item.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Details */}
                <div className="mb-12">
                    <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] mb-6 text-center tracking-tight">Détails par Catégorie</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        {donationBreakdown.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.category}
                                    className="bg-white border border-[#ECDDFD] rounded-xl p-6 hover:shadow-soft-lg transition-all hover:-translate-y-0.5 shadow-soft"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="p-3 rounded-xl flex-shrink-0"
                                            style={{ backgroundColor: `${item.color}18` }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: item.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-display text-[#2A082D] mb-1">{item.category}</h3>
                                            <p className="text-slate-600 text-sm mb-3 leading-relaxed font-normal">{item.description}</p>
                                            <span className="text-2xl font-black" style={{ color: item.color }}>
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Impact Section */}
                <div className="mb-12">
                    <h2 className="text-2xl sm:text-3xl font-display text-[#2A082D] mb-6 text-center tracking-tight">Impact Concret de Vos Dons</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {impactExamples.map((example) => (
                            <div
                                key={example.amount}
                                className="bg-white border border-[#ECDDFD] rounded-2xl p-6 hover:border-[#6F2B75] hover:shadow-soft-lg transition-all shadow-soft"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-[#ECDDFD] rounded-xl flex-shrink-0 mt-0.5 text-[#6F2B75]">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-[#EC602B] mb-1">{example.amount}</div>
                                        <p className="text-slate-600 text-sm leading-relaxed font-normal">{example.impact}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Widget don avec simulateur fiscal interactif */}
                <div className="text-center bg-[#2A082D] bg-bird-pattern-dark text-white rounded-xl p-8 md:p-12 shadow-soft-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="p-3.5 bg-white/10 rounded-xl w-fit mx-auto mb-5">
                            <Heart className="w-8 h-8 text-[#FF7E2E]" fill="currentColor" />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-display text-white mb-3">Soutenez Notre Mission</h2>
                        <p className="text-[#ECDDFD] mb-7 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base font-normal">
                            Chaque don compte. Ensemble, donnons à tous les jeunes les mêmes chances de réussir.
                        </p>

                        {/* Simulateur fiscal interactif */}
                        <DonationSimulator />

                        <a
                            href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-phoenix-orange inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-school font-bold text-sm uppercase tracking-wider shadow-glow-orange mt-6"
                        >
                            <Heart size={18} fill="currentColor" />
                            <span>Faire un don sur HelloAsso</span>
                        </a>
                        <p className="text-[#ECDDFD]/80 text-xs sm:text-sm mt-4 font-normal">
                            66% de réduction d'impôts · Reçu fiscal automatique · Paiement 100% sécurisé via HelloAsso
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
