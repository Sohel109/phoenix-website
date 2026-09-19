import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Quote, ArrowRight, CheckCircle2, ChevronDown, MapPin } from 'lucide-react';

export function TestimonialsSection() {
    const [isExpanded, setIsExpanded] = useState(false);

    const student = {
        author: "Nabil",
        role: "Ancien lycéen tutoré du projet ACSE",
        location: "Lycée Saint-Exupéry · Marseille (Promo 2023)",
        projectTag: "Projet ACSE · 100% Ouverture Culturelle",
        projectLink: "/projets/acse",
        initials: "NA",
        punchline: "« En arrivant en seconde à Saint-Exupéry, je ne croyais pas du tout en moi. Et puis Phœnix est arrivé : les tuteurs m'ont fait comprendre que la case où on veut nous ranger n'est pas une fatalité. »",
        fullStory: [
            "Dans ma tête, le plan était basique : faire le minimum et quitter les études le plus vite possible. Au début, tu viens à Phœnix juste pour voir, et au final, ça change tout.",
            "Les tuteurs m'ont débloqué sur tellement de choses : oser prendre la parole sans bégayer, m'intéresser à des sujets dont je n'avais jamais entendu parler, me créer un réseau, et surtout trouver une vraie deuxième famille qui ne te lâche jamais.",
            "C'est ça la force d'ACSE. Ils prennent des jeunes comme nous, un peu bruts et pleins de doutes, et ils nous font comprendre qu'on a de la valeur. Grandir ici, ça nous donne une dalle, une débrouillardise et un mental d'acier que personne ne peut nous enlever."
        ]
    };

    return (
        <section className="relative py-20 md:py-32 bg-transparent overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                {/* En-tête éditorial */}
                <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
                    <div className="flex justify-center items-center gap-2.5 mb-4">
                        <span className="w-6 h-[2px] bg-[#EC602B] shrink-0" />
                        <span className="text-[11px] uppercase font-school font-bold tracking-widest text-[#904990]">
                            Impact concret &amp; histoires vraies
                        </span>
                        <span className="w-6 h-[2px] bg-[#EC602B] shrink-0" />
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-display text-[#2A082D] tracking-tight leading-[1.1] mb-4">
                        La preuve par le terrain.
                    </h2>

                    <p className="text-[#2A082D]/80 font-medium text-sm sm:text-base leading-relaxed">
                        L'impact de Phœnix ne se résume pas à des chiffres. Il s'entend dans les mots de ceux dont le parcours a basculé grâce au tutorat hebdomadaire.
                    </p>
                </div>

                {/* ── CARTE TÉMOIGNAGE ÉDITORIALE ── */}
                <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 sm:p-12 border border-[#E5E5E5] shadow-soft relative overflow-hidden">
                    {/* Étiquette simple — pas de pill */}
                    <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-1.5 text-[10px] font-school font-bold uppercase tracking-wider text-[#EC602B]">
                        <span className="w-3 h-px bg-[#EC602B]" />
                        Parole d'Élève
                    </div>

                    {/* Top : Avatar + Identité */}
                    <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-[#6F2B75]/15">
                        <div className="flex items-center gap-4">
                            {/* Avatar Initials */}
                            <div className="w-16 h-16 rounded-full bg-[#6F2B75] text-white font-school font-bold text-lg flex items-center justify-center border-2 border-white shadow-soft shrink-0">
                                {student.initials}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-2xl font-display text-[#2A082D] tracking-tight">
                                        {student.author}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-800 border border-emerald-300 text-[10px] font-school font-bold">
                                        <CheckCircle2 size={11} className="text-emerald-700" />
                                        Témoignage vérifié
                                    </span>
                                </div>
                                <p className="text-xs font-school font-bold uppercase tracking-wider text-[#6F2B75] mt-0.5">
                                    {student.role}
                                </p>
                                <p className="text-xs text-[#2A082D]/75 font-medium flex items-center gap-1 mt-0.5">
                                    <MapPin size={12} className="text-[#EC602B]" />
                                    <span>{student.location}</span>
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0 hidden sm:block">
                            <Quote size={48} className="text-[#6F2B75]/20" />
                        </div>
                    </div>

                    {/* Citation Choc (2 phrases percutantes) */}
                    <blockquote className="text-[#2A082D] font-display text-lg sm:text-xl leading-relaxed mb-6 text-left border-l-4 border-[#EC602B] pl-4 sm:pl-6 py-1">
                        {student.punchline}
                    </blockquote>

                    {/* Accordéon : Récit complet */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.35, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="text-[#2A082D]/90 font-sans text-sm sm:text-base leading-relaxed space-y-3 mb-6 pt-2 border-t border-[#6F2B75]/10">
                                    {student.fullStory.map((paragraph, idx) => (
                                        <p key={idx} className="italic">{paragraph}</p>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bouton Toggle Accordéon */}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-school font-bold text-[#6F2B75] hover:text-[#EC602B] border border-[#D9BEF8] active:opacity-80 transition-all mb-6 cursor-pointer"
                    >
                        <span>{isExpanded ? 'Réduire le récit' : 'Lire tout son témoignage'}</span>
                        <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Pied de Carte : Lien vers le projet ACSE */}
                    <div className="pt-5 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-school font-bold text-[#6F2B75]">
                            <span className="w-2.5 h-px bg-[#EC602B]" />
                            <span>{student.projectTag}</span>
                        </div>

                        <Link
                            to={student.projectLink}
                            className="btn-phoenix-gradient px-5 py-2.5 text-xs flex items-center gap-1.5 shrink-0"
                        >
                            <span>Découvrir le projet ACSE</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Trust Bar — style éditorial simple (pas de pill container) */}
                <div className="mt-10 pt-8 border-t border-[#2A082D]/8 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-school font-bold text-[#2A082D]">
                        <span className="text-[#EC602B]">100% de réussite au bac pour nos élèves suivis</span>
                        <span className="hidden sm:inline text-[#2A082D]/20">/</span>
                        <span className="text-[#6F2B75]">+3000 jeunes accompagnés depuis 2011</span>
                        <span className="hidden sm:inline text-[#2A082D]/20">/</span>
                        <span className="text-slate-600">Labellisé « Cordées de la Réussite »</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
