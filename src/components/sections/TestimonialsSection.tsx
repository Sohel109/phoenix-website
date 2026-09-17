import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Quote, Heart, ArrowRight, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';

export function TestimonialsSection() {
    return (
        <section className="relative py-14 md:py-22 bg-slate-50/70 transition-colors duration-300 border-y border-slate-200/60 overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-200/25 via-amber-100/30 to-purple-200/25 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs mb-4 rotate-1 hover:rotate-0 transition-transform">
                        <Heart size={14} className="text-rose-500 fill-rose-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Parole d'un élève accompagné
                        </span>
                        <span className="text-xs text-slate-300">·</span>
                        <span className="text-xs font-semibold text-orange-600">
                            Témoignage authentique
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-slate-900 leading-[1.08] mb-4">
                        La preuve par{' '}
                        <span className="relative inline-block text-orange-600">
                            l'humain.
                            <span className="absolute -bottom-1 left-0 w-full h-2.5 bg-orange-300/30 rotate-1 rounded-sm -z-10" />
                        </span>
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        L'impact de Phoenix ne se mesure pas seulement en statistiques : il s'entend dans les mots de ceux qui ont vu leur horizon s'ouvrir.
                    </p>
                </div>

                {/* ──────────────── UNIQUE CARTE CENTRÉE DE NABIL (CADRE COMPACT) ──────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-orange-200/90 shadow-lg shadow-orange-500/5 relative overflow-hidden"
                >
                    {/* Top Tag & Quote Icon */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            {/* Initials Avatar */}
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                                NA
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                                        Nabil
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                        <CheckCircle2 size={11} className="text-emerald-600" />
                                        Vérifié
                                    </span>
                                </div>
                                <p className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-orange-600 mt-0.5">
                                    Ancien tutoré du projet ACSE
                                </p>
                                <p className="text-xs text-slate-500 font-medium">
                                    Lycée Saint-Exupéry · Marseille (Promo 2023)
                                </p>
                            </div>
                        </div>

                        <div className="self-end sm:self-center">
                            <Quote size={34} className="text-orange-200/80" />
                        </div>
                    </div>

                    {/* Testimonial Quote Text (2 Paragraphes authentiques intégraux) */}
                    <div className="text-slate-700 font-medium text-sm sm:text-[15px] leading-relaxed italic space-y-3.5 mb-6 text-left">
                        <p>
                            « En arrivant en 2023 en seconde à Saint-Exupéry, franchement, je ne croyais pas du tout en moi. Dans ma tête, le plan était basique : finir les études le plus vite possible avec un diplôme court et partir loin du quartier. Je ne voyais pas plus loin que le bout de mon nez. Et puis Phoenix est arrivé.
                        </p>
                        <p>
                            Au début, tu viens pour voir, et au final, ça change tout. Les tuteurs m'ont débloqué sur tellement de trucs : oser prendre la parole sans bégayer, m'intéresser à des sujets dont je n'avais jamais entendu parler, me créer des contacts, et surtout trouver une vraie deuxième famille qui ne te lâche jamais. C’est ça la force d’ACSE. Ils prennent des jeunes comme nous, un peu bruts et pleins de doutes, et ils nous font comprendre qu'on a de la valeur. Ça t'ouvre les yeux : tu te rends compte que la case où on veut te ranger n'est pas une fatalité. C’est vrai qu'on ne part pas avec les mêmes cartes en main que d'autres, mais grandir ici, ça nous donne aussi une dalle, une débrouillardise et un mental d'acier que personne ne peut nous enlever. »
                        </p>
                    </div>

                    {/* Card Bottom: ACSE Link */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            <span>Projet ACSE · 100% Ouverture Culturelle à Marseille</span>
                        </div>

                        <Link
                            to="/projets/acse"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs uppercase tracking-wider transition-colors border border-orange-200/80 shrink-0"
                        >
                            <span>Découvrir le projet ACSE</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </motion.div>

                {/* Interactive Trust Bar */}
                <div className="mt-8 sm:mt-10 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-6 py-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5 text-orange-600">
                            <Sparkles size={14} /> 100% de réussite au bac pour nos élèves suivis
                        </span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="flex items-center gap-1.5 text-purple-700">
                            <GraduationCap size={14} /> +3000 jeunes accompagnés depuis 2011
                        </span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="flex items-center gap-1.5 text-emerald-600">
                            <CheckCircle2 size={14} /> Labellisé « Cordées de la Réussite »
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
