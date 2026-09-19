import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Archive, Sparkles, ChevronDown } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export function Documents() {
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);

    const currentDocuments = [
        {
            title: "Guide du Phoenicien 2026-2027",
            description: "Le guide officiel complet pour tout savoir sur l'association, ses valeurs, ses 9 projets, ses événements phares et son organigramme.",
            filename: "Guide du phoenicien 2026-2027.pdf",
            type: "PDF",
            size: "4.8 MB",
            isNew: true
        },
        {
            title: "Fiches de Posts 2026-2027",
            description: "Présentation détaillée des rôles, missions et compétences acquises : Bureau Exécutif, Pôles et Chefs de projet.",
            filename: "Fiches de posts 2026-2027.pdf",
            type: "PDF",
            size: "2.9 MB",
            isNew: true
        }
    ];

    const archiveDocuments = [
        {
            title: "Fiches 2 Posts Phoenix EDC",
            description: "Ancienne édition du recueil des fiches de postes et visuels de l'association.",
            filename: "fiches2posts Phoenix edc.pdf",
            type: "PDF",
            size: "2.2 MB",
            year: "2025-2026"
        },
        {
            title: "Guide du Phoenicien 2025-2026",
            description: "Ancienne édition du guide de l'association (Année universitaire 2025-2026).",
            filename: "Guide du phoenicien 2025-2026.pdf",
            type: "PDF",
            size: "1.5 MB",
            year: "2025-2026"
        }
    ];

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title="Documents & Ressources Officielles | Phœnix Égalité des Chances"
                description="Téléchargez le Guide du Phœnicien 2026-2027, les fiches de postes et toutes les documentations officielles de l'association Phœnix EDC."
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs sm:text-sm font-school font-bold uppercase tracking-widest text-[#6F2B75] mb-2 block">
                        Ressources & Guides
                    </span>
                    <p className="font-script text-2xl md:text-3xl text-[#2A082D] mb-1">
                        ~ Documentation & transparence ~
                    </p>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display text-[#2A082D] tracking-tight mb-4">
                        Documents Utiles
                    </h1>
                    <p className="text-[#2A082D]/80 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                        Téléchargez les guides officiels, présentations et ressources de l'association Phoenix Égalité des Chances.
                    </p>
                </div>

                {/* Main Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {currentDocuments.map((doc, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-[2.5rem] border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg hover:-translate-y-1.5 transition-all duration-300 p-8 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex items-start gap-5 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shrink-0 shadow-soft">
                                        <FileText size={26} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg sm:text-xl font-display text-[#2A082D] leading-snug">
                                                {doc.title}
                                            </h3>
                                            {doc.isNew && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-school font-bold px-3 py-0.5 rounded-full bg-[#ECDDFD] text-[#6F2B75] shrink-0">
                                                    <Sparkles size={11} />
                                                    <span>Édition 2026-2027</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-700 leading-relaxed text-sm font-medium">
                                            {doc.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-[#ECDDFD]/60 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3 text-xs font-school font-bold text-slate-600">
                                    <span className="bg-[#ECDDFD]/50 px-3 py-1 rounded-full text-[#6F2B75]">{doc.type}</span>
                                    <span>{doc.size}</span>
                                </div>
                                <a
                                    href={`/documents/${doc.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-phoenix-gradient !py-2 !px-5 !text-xs rounded-full text-white shadow-soft flex items-center gap-1.5"
                                >
                                    <Download size={14} />
                                    <span>Télécharger</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section Archives (Dépliable) */}
                <div className="pt-8 border-t border-[#ECDDFD]/60">
                    <button
                        onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                        className="w-full flex items-center justify-between p-6 sm:p-7 rounded-[2rem] bg-white border border-[#ECDDFD] shadow-soft hover:shadow-soft-lg transition-all group cursor-pointer text-left"
                        aria-expanded={isArchiveOpen}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shrink-0 group-hover:bg-gradient-to-r group-hover:from-[#6F2B75] group-hover:to-[#EC602B] group-hover:text-white transition-all shadow-soft">
                                <Archive size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-base sm:text-xl font-display text-[#2A082D]">
                                        Archives des documents
                                    </h2>
                                    <span className="text-xs font-school font-bold px-3 py-0.5 rounded-full bg-[#ECDDFD] text-[#6F2B75]">
                                        {archiveDocuments.length} document{archiveDocuments.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                                    {isArchiveOpen ? "Cliquez pour masquer les anciennes éditions" : "Cliquez pour afficher les anciennes éditions"}
                                </p>
                            </div>
                        </div>

                        <motion.div
                            animate={{ rotate: isArchiveOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-10 h-10 rounded-full bg-[#ECDDFD] flex items-center justify-center text-[#6F2B75] group-hover:text-[#EC602B] shrink-0 ml-2 shadow-soft"
                        >
                            <ChevronDown size={18} />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {isArchiveOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                    {archiveDocuments.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-[2rem] border border-[#ECDDFD] p-6 flex flex-col justify-between shadow-soft"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-[#ECDDFD]/60 text-[#6F2B75] flex items-center justify-center shrink-0">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="text-base font-display text-[#2A082D]">
                                                            {doc.title}
                                                        </h3>
                                                        <span className="text-[10px] font-school font-bold px-2.5 py-0.5 rounded-full bg-[#ECDDFD] text-[#6F2B75]">
                                                            Archive {doc.year}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 leading-relaxed text-xs font-medium">
                                                        {doc.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#ECDDFD]/60">
                                                <div className="flex items-center gap-3 text-xs font-school font-bold text-slate-600">
                                                    <span className="bg-[#ECDDFD]/50 px-2.5 py-0.5 rounded-full text-[11px] text-[#6F2B75]">{doc.type}</span>
                                                    <span>{doc.size}</span>
                                                </div>
                                                <a
                                                    href={`/documents/${doc.filename}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs text-[#EC602B] hover:text-[#6F2B75] font-school font-bold transition-colors"
                                                >
                                                    <Download size={14} />
                                                    <span>Télécharger</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

