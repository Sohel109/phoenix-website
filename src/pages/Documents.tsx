import { useState, useRef } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { FileText, Download, Archive, Sparkles, ChevronDown } from 'lucide-react';

export function Documents() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);

    useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

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
        <div ref={containerRef} className="pt-page-safe pb-24 min-h-screen bg-[#FBF9F5]">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#EA580C] bg-[#FFF7ED] border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120] px-4 py-1.5 rounded-full inline-block mb-4">
                        Ressources & Guides
                    </span>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-[#0A1120] uppercase tracking-tight mb-4">
                        Documents Utiles
                    </h1>
                    <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                        Téléchargez les guides officiels, présentations et ressources de l'association Phoenix Égalité des Chances.
                    </p>
                </div>

                {/* Main Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {currentDocuments.map((doc, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className="bg-white rounded-3xl border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#0A1120] hover:shadow-[6px_6px_0px_0px_#EA580C] hover:-translate-y-1 transition-all duration-200 p-7 sm:p-8 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex items-start gap-5 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 border-2 border-[#0A1120] shadow-[2px_2px_0px_0px_#0A1120]">
                                        <FileText size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg sm:text-xl font-display font-black text-[#0A1120] leading-snug">
                                                {doc.title}
                                            </h3>
                                            {doc.isNew && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/40 shrink-0">
                                                    <Sparkles size={11} />
                                                    <span>Édition 2026-2027</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                            {doc.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t-2 border-[#0A1120]/10 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <span className="bg-[#F4EFEA] px-2.5 py-1 rounded-md border border-[#0A1120]/20 text-[#0A1120]">{doc.type}</span>
                                    <span>{doc.size}</span>
                                </div>
                                <a
                                    href={`/documents/${doc.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-tactile-primary !py-2 !px-4 !text-xs"
                                >
                                    <Download size={15} />
                                    <span>Télécharger</span>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Section Archives (Dépliable) */}
                <div className="pt-8 border-t-2 border-[#0A1120]/10">
                    <button
                        onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                        className="w-full flex items-center justify-between p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#0A1120] shadow-[4px_4px_0px_0px_#0A1120] hover:shadow-[5px_5px_0px_0px_#EA580C] transition-all group cursor-pointer text-left"
                        aria-expanded={isArchiveOpen}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#F4EFEA] border-2 border-[#0A1120] text-[#0A1120] flex items-center justify-center shrink-0 group-hover:bg-[#FFF7ED] group-hover:text-[#EA580C] transition-colors shadow-[2px_2px_0px_0px_#0A1120]">
                                <Archive size={22} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-base sm:text-xl font-display font-black text-[#0A1120]">
                                        Archives des documents
                                    </h2>
                                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F4EFEA] text-[#0A1120] border border-[#0A1120]/20">
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
                            className="w-9 h-9 rounded-xl bg-[#F4EFEA] border-2 border-[#0A1120] flex items-center justify-center text-[#0A1120] group-hover:text-[#EA580C] shrink-0 ml-2"
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
                                            className="bg-white rounded-2xl border-2 border-[#0A1120] p-6 flex flex-col justify-between shadow-[3px_3px_0px_0px_#0A1120]"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-[#F4EFEA] border-2 border-[#0A1120] text-slate-700 flex items-center justify-center shrink-0">
                                                    <FileText size={22} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="text-base font-display font-black text-[#0A1120]">
                                                            {doc.title}
                                                        </h3>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/30">
                                                            Archive {doc.year}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 leading-relaxed text-xs font-medium">
                                                        {doc.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between pt-4 border-t-2 border-[#0A1120]/10">
                                                <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                                    <span className="bg-[#F4EFEA] px-2 py-0.5 rounded text-[11px] text-[#0A1120]">{doc.type}</span>
                                                    <span>{doc.size}</span>
                                                </div>
                                                <a
                                                    href={`/documents/${doc.filename}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs text-[#EA580C] hover:underline font-black transition-colors"
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
