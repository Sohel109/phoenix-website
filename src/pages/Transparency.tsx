import { motion } from 'framer-motion';
import { PieChart, Heart, BookOpen, PartyPopper, FileText, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const donationBreakdown = [
    {
        category: 'Matériel pédagogique & activités',
        percentage: 70,
        color: '#FF6B00', // Orange
        icon: BookOpen,
        description: 'Fournitures scolaires, livres, matériel éducatif et supports d\'activités pour les jeunes.'
    },
    {
        category: 'Événements & sorties culturelles',
        percentage: 25,
        color: '#EC4899', // Rose
        icon: PartyPopper,
        description: 'Olympiades, SimONU, sorties culturelles, Marseille Cité Éloquente et JEDC.'
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
        amount: '10€',
        impact: 'Fournitures scolaires pour 1 jeune pendant un an'
    },
    {
        amount: '25€',
        impact: 'Kit complet de matériel pédagogique pour un projet'
    },
    {
        amount: '50€',
        impact: 'Participation d\'un jeune à un atelier d\'éloquence'
    },
    {
        amount: '100€',
        impact: 'Matériel pour une activité culturelle collective'
    },
    {
        amount: '250€',
        impact: 'Organisation d\'une sortie culturelle pour un groupe'
    },
    {
        amount: '500€',
        impact: 'Financement d\'un événement majeur (SimONU, Olympiades)'
    }
];

export function Transparency() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1A103C] to-[#0A0118] pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <motion.button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <ArrowLeft size={20} />
                    Retour
                </motion.button>

                {/* Hero Section */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl mb-4">
                        <PieChart className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Transparence Financière
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Découvrez comment vos dons sont utilisés pour transformer la vie de 300 jeunes chaque année
                    </p>
                </motion.div>

                {/* Trust Message */}
                <motion.div
                    className="bg-gradient-to-br from-orange-500/10 to-purple-600/10 border border-orange-500/20 rounded-2xl p-6 md:p-8 mb-12"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-start gap-4">
                        <Heart className="w-8 h-8 text-orange-500 flex-shrink-0 mt-1" />
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Notre engagement</h2>
                            <p className="text-gray-300 leading-relaxed">
                                Phoenix Égalité des Chances est une association <span className="text-orange-500 font-semibold">reconnue d'intérêt général</span>.
                                Vos dons sont <span className="text-purple-500 font-semibold">déductibles des impôts à hauteur de 66%</span>.
                                Nous nous engageons à une <span className="text-pink-500 font-semibold">transparence totale</span> sur l'utilisation de chaque euro reçu.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Donation Breakdown - Visual Representation */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Répartition des Dons</h2>

                    {/* Simple Visual Bars */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="space-y-6">
                            {donationBreakdown.map((item, index) => (
                                <motion.div
                                    key={item.category}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-white font-medium">{item.category}</span>
                                        </div>
                                        <span className="text-2xl font-bold text-white min-w-[60px] text-right">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: item.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ delay: 0.6 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Category Details */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Détails par Catégorie</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {donationBreakdown.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.category}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="p-3 rounded-xl flex-shrink-0"
                                            style={{ backgroundColor: `${item.color}20` }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: item.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2">{item.category}</h3>
                                            <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                                            <span className="text-2xl font-bold" style={{ color: item.color }}>
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Impact Section */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Impact Concret de Vos Dons</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {impactExamples.map((example, index) => (
                            <motion.div
                                key={example.amount}
                                className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-orange-500/50 transition-all"
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                            >
                                <div className="flex items-start gap-4">
                                    <TrendingUp className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="text-2xl font-bold text-orange-500 mb-2">{example.amount}</div>
                                        <p className="text-gray-300">{example.impact}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    className="text-center bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl p-8 md:p-12"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <Heart className="w-16 h-16 text-white mx-auto mb-4" fill="currentColor" />
                    <h2 className="text-3xl font-bold text-white mb-4">Soutenez Notre Mission</h2>
                    <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                        Chaque don compte. Ensemble, donnons à tous les jeunes les mêmes chances de réussir.
                    </p>
                    <a
                        href="https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Heart size={20} fill="currentColor" />
                        Faire un don déductible
                    </a>
                    <p className="text-white/70 text-sm mt-4">
                        66% de réduction d'impôts • Reçu fiscal automatique
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
