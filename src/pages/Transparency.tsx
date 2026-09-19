import { motion } from 'framer-motion';
import { PieChart, Heart, BookOpen, PartyPopper, FileText, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export function Transparency() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FFFBF4] bg-bird-pattern pt-page-safe pb-16">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-colors text-sm cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    Retour
                </button>

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-4 bg-orange-100 rounded-2xl mb-5">
                        <PieChart className="w-10 h-10 text-orange-600" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200/60 px-4 py-1.5 rounded-full inline-block mb-4">
                        Transparence Financière
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Comment sont utilisés<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">vos dons ?</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Découvrez comment vos dons transforment la vie de 300 jeunes chaque année à Marseille.
                    </p>
                </div>

                {/* Trust Message */}
                <div className="bg-white border border-orange-200/70 rounded-2xl p-6 md:p-8 mb-12 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-100 rounded-xl flex-shrink-0">
                            <Heart className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Notre engagement envers vous</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Phoenix Égalité des Chances est une association <span className="text-orange-600 font-semibold">reconnue d'intérêt général</span>.
                                Vos dons sont <span className="text-emerald-600 font-semibold">déductibles des impôts à hauteur de 66%</span>.
                                Nous nous engageons à une <span className="text-slate-900 font-semibold">transparence totale</span> sur l'utilisation de chaque euro reçu.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Donation Breakdown - Visual Representation */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 text-center tracking-tight">Répartition des Dons</h2>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
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
                    <h2 className="text-2xl font-black text-slate-900 mb-6 text-center tracking-tight">Détails par Catégorie</h2>
                    <div className="grid md:grid-cols-2 gap-5">
                        {donationBreakdown.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.category}
                                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all hover:-translate-y-0.5 shadow-sm"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="p-3 rounded-xl flex-shrink-0"
                                            style={{ backgroundColor: `${item.color}18` }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: item.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{item.category}</h3>
                                            <p className="text-slate-500 text-sm mb-3 leading-relaxed">{item.description}</p>
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
                    <h2 className="text-2xl font-black text-slate-900 mb-6 text-center tracking-tight">Impact Concret de Vos Dons</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {impactExamples.map((example) => (
                            <div
                                key={example.amount}
                                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all shadow-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0 mt-0.5">
                                        <TrendingUp className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-orange-500 mb-1">{example.amount}</div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{example.impact}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 shadow-lg">
                    <div className="p-4 bg-white/20 rounded-full w-fit mx-auto mb-5">
                        <Heart className="w-12 h-12 text-white" fill="currentColor" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-3">Soutenez Notre Mission</h2>
                    <p className="text-white/90 mb-7 max-w-2xl mx-auto leading-relaxed">
                        Chaque don compte. Ensemble, donnons à tous les jeunes les mêmes chances de réussir.
                    </p>
                    <a
                        href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-base hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Heart size={20} fill="currentColor" />
                        Faire un don déductible
                    </a>
                    <p className="text-white/75 text-sm mt-4">
                        66% de réduction d'impôts · Reçu fiscal automatique
                    </p>
                </div>
            </div>
        </div>
    );
}
