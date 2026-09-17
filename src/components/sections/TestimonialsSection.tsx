import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Quote, Heart, ArrowRight, CheckCircle2, GraduationCap, Sparkles, ChevronDown } from 'lucide-react';

export function TestimonialsSection() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="relative py-16 md:py-26 bg-transparent overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#ECDDFD]/60 via-[#E1BBCB]/40 to-[#ECDDFD]/60 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ECDDFD] text-[#6F2B75] shadow-soft mb-4 -rotate-1 hover:rotate-0 transition-transform">
                        <Heart size={14} className="text-[#EC602B] fill-[#EC602B]" />
                        <span className="text-xs font-school font-bold uppercase tracking-wider">
                            Parole d'un élève accompagné
                        </span>
                        <span className="text-xs text-[#904990] font-bold">·</span>
                        <span className="text-xs font-school font-bold text-[#EC602B]">
                            Témoignage authentique
                        </span>
                    </div>

                    <p className="font-script text-2xl md:text-3xl text-[#EC602B] mb-1">
                        ~ La voix du terrain ~
                    </p>

                    <h2 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-tight leading-[1.1] mb-4">
                        La preuve par{' '}
                        <span className="bg-gradient-to-r from-[#6F2B75] to-[#EC602B] text-transparent bg-clip-text">
                            l'humain.
                        </span>
                    </h2>

                    <p className="text-[#2A082D]/80 font-medium text-sm sm:text-base leading-relaxed">
                        L'impact de Phoenix ne se mesure pas seulement en statistiques : il s'entend dans les mots de ceux qui ont vu leur horizon s'ouvrir.
                    </p>
                </div>

                {/* ──────────────── UNIQUE CARTE ÉDITORIALE DE NABIL ──────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mx-auto bg-[#ECDDFD] rounded-[2.5rem] p-8 sm:p-12 border border-[#D9BEF8] shadow-soft-lg relative overflow-hidden bg-bird-pattern"
                >
                    {/* Corner Stamp Sticker */}
                    <div className="absolute top-5 right-5 z-10 hidden sm:block">
                        <span className="inline-block px-3.5 py-1.5 rounded-full text-[11px] font-school font-bold uppercase tracking-wider bg-[#EC602B] text-white shadow-soft rotate-2">
                            Voix du Réel 🎙️
                        </span>
                    </div>

                    {/* Top Tag & Quote Icon */}
                    <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b border-[#6F2B75]/15">
                        <div className="flex items-center gap-4">
                            {/* Circular Initials Avatar */}
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white font-school font-bold text-base flex items-center justify-center border-2 border-white shadow-soft shrink-0">
                                NA
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-display text-[#2A082D] tracking-tight">
                                        Nabil
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 text-emerald-800 border border-emerald-300 text-[10px] font-school font-bold">
                                        <CheckCircle2 size={11} className="text-emerald-700" />
                                        Vérifié
                                    </span>
                                </div>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mt-0.5">
                                    Ancien tutoré du projet ACSE
                                </p>
                                <p className="text-xs text-[#2A082D]/70 font-medium">
                                    Lycée Saint-Exupéry · Marseille (Promo 2023)
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <Quote size={40} className="text-[#6F2B75]/25" />
                        </div>
                    </div>

                    {/* Citation choc — toujours visible */}
                    <div className="text-[#2A082D] font-medium text-sm sm:text-[15px] leading-relaxed italic mb-4 text-left">
                        <p>
                            « En arrivant en 2023 en seconde à Saint-Exupéry, franchement, je ne croyais pas du tout en moi. Dans ma tête, le plan était basique : finir les études le plus vite possible. Et puis Phoenix est arrivé. »
                        </p>
                    </div>

                    {/* Accordéon — suite du témoignage */}
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden text-[#2A082D] font-medium text-sm sm:text-[15px] leading-relaxed italic mb-4 text-left space-y-3"
                        >
                            <p>
                                Au début, tu viens pour voir, et au final, ça change tout. Les tuteurs m'ont débloqué sur tellement de trucs : oser prendre la parole sans bégayer, m'intéresser à des sujets dont je n'avais jamais entendu parler, me créer des contacts, et surtout trouver une vraie deuxième famille qui ne te lâche jamais.
                            </p>
                            <p>
                                C'est ça la force d'ACSE. Ils prennent des jeunes comme nous, un peu bruts et pleins de doutes, et ils nous font comprendre qu'on a de la valeur. Tu te rends compte que la case où on veut te ranger n'est pas une fatalité. Grandir ici, ça nous donne une dalle, une débrouillardise et un mental d'acier que personne ne peut nous enlever. »
                            </p>
                        </motion.div>
                    )}

                    {/* Bouton accordéon */}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1.5 text-xs font-school font-bold text-[#6F2B75] hover:text-[#EC602B] transition-colors mb-6 group"
                    >
                        <span>{isExpanded ? 'Réduire le témoignage' : 'Lire tout son témoignage'}</span>
                        <ChevronDown
                            size={15}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Card Bottom: ACSE Link */}
                    <div className="pt-5 border-t border-[#6F2B75]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-school font-bold text-[#6F2B75]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#EC602B]" />
                            <span>Projet ACSE · 100% Ouverture Culturelle à Marseille</span>
                        </div>

                        <Link
                            to="/projets/acse"
                            className="btn-phoenix-gradient px-5 py-2.5 rounded-full text-xs text-white shadow-soft flex items-center gap-1.5 shrink-0"
                        >
                            <span>Découvrir le projet ACSE</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </motion.div>

                {/* Trust Bar in Rounded Full Pill */}
                <div className="mt-8 sm:mt-12 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-7 px-8 py-4 rounded-full bg-white border border-[#ECDDFD] shadow-soft text-xs font-school font-bold text-[#2A082D]">
                        <span className="flex items-center gap-1.5 text-[#EC602B]">
                            <Sparkles size={15} /> 100% de réussite au bac pour nos élèves suivis
                        </span>
                        <span className="hidden sm:inline text-[#ECDDFD] font-bold">•</span>
                        <span className="flex items-center gap-1.5 text-[#6F2B75]">
                            <GraduationCap size={15} /> +3000 jeunes accompagnés depuis 2011
                        </span>
                        <span className="hidden sm:inline text-[#ECDDFD] font-bold">•</span>
                        <span className="flex items-center gap-1.5 text-emerald-700">
                            <CheckCircle2 size={15} /> Labellisé « Cordées de la Réussite »
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
