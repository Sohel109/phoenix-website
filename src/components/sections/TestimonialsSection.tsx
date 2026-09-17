import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Quote, Heart, ArrowRight, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';

export function TestimonialsSection() {
    return (
        <section className="relative py-16 md:py-26 bg-transparent overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-200/20 via-amber-100/25 to-purple-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-1.5 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] mb-4 -rotate-1 hover:rotate-0 transition-transform">
                        <Heart size={14} className="text-orange-600 fill-orange-600" />
                        <span className="text-xs font-display font-black uppercase tracking-wider text-[#0A1120]">
                            Parole d'un élève accompagné
                        </span>
                        <span className="text-xs text-slate-300 font-bold">·</span>
                        <span className="text-xs font-display font-bold text-orange-600">
                            Témoignage authentique
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-[#0A1120] leading-[1.05] mb-4">
                        La preuve par{' '}
                        <span className="relative inline-block text-orange-600">
                            l'humain.
                            <span className="absolute -bottom-1 left-0 w-full h-3 bg-orange-400/20 rotate-1 rounded-sm -z-10" />
                        </span>
                    </h2>

                    <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                        L'impact de Phoenix ne se mesure pas seulement en statistiques : il s'entend dans les mots de ceux qui ont vu leur horizon s'ouvrir.
                    </p>
                </div>

                {/* ──────────────── UNIQUE CARTE ÉDITORIALE DE NABIL (STYLE MAGAZINE BRUT) ──────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl mx-auto bg-[#F4EFEA] rounded-3xl p-7 sm:p-10 border-2 border-[#0A1120] shadow-[6px_6px_0px_0px_#0A1120] relative overflow-hidden"
                >
                    {/* Corner Stamp Sticker */}
                    <div className="absolute top-4 right-4 z-10 hidden sm:block">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-display font-black uppercase tracking-wider bg-orange-600 text-white border border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] rotate-2">
                            Voix du Réel 🎙️
                        </span>
                    </div>

                    {/* Top Tag & Quote Icon */}
                    <div className="flex items-center justify-between gap-3 mb-6 pb-5 border-b-2 border-slate-900/10">
                        <div className="flex items-center gap-3.5">
                            {/* Initials Avatar */}
                            <div className="w-12 h-12 rounded-2xl bg-[#0A1120] text-white font-display font-black text-base flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                NA
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-display font-black text-[#0A1120] tracking-tight">
                                        Nabil
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-display font-bold">
                                        <CheckCircle2 size={11} className="text-emerald-700" />
                                        Vérifié
                                    </span>
                                </div>
                                <p className="text-xs font-display font-black uppercase tracking-wider text-orange-600 mt-0.5">
                                    Ancien tutoré du projet ACSE
                                </p>
                                <p className="text-xs text-slate-600 font-medium">
                                    Lycée Saint-Exupéry · Marseille (Promo 2023)
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0">
                            <Quote size={38} className="text-orange-500/30" />
                        </div>
                    </div>

                    {/* Testimonial Quote Text */}
                    <div className="text-slate-800 font-medium text-sm sm:text-[15px] leading-relaxed italic space-y-4 mb-7 text-left">
                        <p>
                            « En arrivant en 2023 en seconde à Saint-Exupéry, franchement, je ne croyais pas du tout en moi. Dans ma tête, le plan était basique : finir les études le plus vite possible avec un diplôme court et partir loin du quartier. Je ne voyais pas plus loin que le bout de mon nez. Et puis Phoenix est arrivé.
                        </p>
                        <p>
                            Au début, tu viens pour voir, et au final, ça change tout. Les tuteurs m'ont débloqué sur tellement de trucs : oser prendre la parole sans bégayer, m'intéresser à des sujets dont je n'avais jamais entendu parler, me créer des contacts, et surtout trouver une vraie deuxième famille qui ne te lâche jamais. C’est ça la force d’ACSE. Ils prennent des jeunes comme nous, un peu bruts et pleins de doutes, et ils nous font comprendre qu'on a de la valeur. Ça t'ouvre les yeux : tu te rends compte que la case où on veut te ranger n'est pas une fatalité. C’est vrai qu'on ne part pas avec les mêmes cartes en main que d'autres, mais grandir ici, ça nous donne aussi une dalle, une débrouillardise et un mental d'acier que personne ne peut nous enlever. »
                        </p>
                    </div>

                    {/* Card Bottom: ACSE Link */}
                    <div className="pt-5 border-t-2 border-slate-900/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-display font-bold text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-orange-600" />
                            <span>Projet ACSE · 100% Ouverture Culturelle à Marseille</span>
                        </div>

                        <Link
                            to="/projets/acse"
                            className="btn-tactile-primary px-4 py-2 rounded-xl text-xs shadow-[2px_2px_0px_0px_#0A1120] shrink-0"
                        >
                            <span>Découvrir le projet ACSE</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </motion.div>

                {/* Interactive Trust Bar */}
                <div className="mt-8 sm:mt-11 text-center">
                    <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-7 px-6 py-3.5 rounded-2xl bg-white border-1.5 border-[#0A1120] shadow-[3px_3px_0px_0px_#0A1120] text-xs font-display font-bold text-[#0A1120]">
                        <span className="flex items-center gap-1.5 text-orange-600 font-black">
                            <Sparkles size={14} /> 100% de réussite au bac pour nos élèves suivis
                        </span>
                        <span className="hidden sm:inline text-slate-300 font-bold">•</span>
                        <span className="flex items-center gap-1.5 text-purple-700 font-black">
                            <GraduationCap size={14} /> +3000 jeunes accompagnés depuis 2011
                        </span>
                        <span className="hidden sm:inline text-slate-300 font-bold">•</span>
                        <span className="flex items-center gap-1.5 text-emerald-700 font-black">
                            <CheckCircle2 size={14} /> Labellisé « Cordées de la Réussite »
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
