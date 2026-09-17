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
        <div ref={containerRef} className="pt-page-safe pb-24 min-h-screen bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200/60 px-4 py-1.5 rounded-full inline-block mb-3">
                        Ressources & Guides
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight mb-4">
                        Documents Utiles
                    </h1>
                    <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-normal">
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
                            className="bg-white rounded-2xl border-2 border-slate-200 hover:border-orange-400 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex items-start gap-5 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border-2 border-orange-100">
                                        <FileText size={28} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                                                {doc.title}
                                            </h3>
                                            {doc.isNew && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200/80 shrink-0">
                                                    <Sparkles size={11} />
                                                    <span>Édition 2026-2027</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 leading-relaxed text-sm font-normal">
                                            {doc.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{doc.type}</span>
                                    <span>{doc.size}</span>
                                </div>
                                <a
                                    href={`/documents/${doc.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-orange-200 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-100/80 text-orange-600 hover:text-orange-700 font-bold text-sm transition-all"
                                >
                                    <Download size={16} />
                                    <span>Télécharger</span>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Section Archives (Dépliable) */}
                <div className="pt-8 border-t border-slate-200">
                    <button
                        onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm hover:border-orange-400 transition-all group cursor-pointer text-left"
                        aria-expanded={isArchiveOpen}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                <Archive size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                        Archives des documents
                                    </h2>
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                        {archiveDocuments.length} document{archiveDocuments.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                                    {isArchiveOpen ? "Cliquez pour masquer les anciennes éditions" : "Cliquez pour afficher les anciennes éditions"}
                                </p>
                            </div>
                        </div>

                        <motion.div
                            animate={{ rotate: isArchiveOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-orange-600 shrink-0 ml-2"
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
                                            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300"
                                        >
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                                                    <FileText size={22} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="text-base font-bold text-slate-900">
                                                            {doc.title}
                                                        </h3>
                                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                                            Archive {doc.year}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 leading-relaxed text-xs font-normal">
                                                        {doc.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">{doc.type}</span>
                                                    <span>{doc.size}</span>
                                                </div>
                                                <a
                                                    href={`/documents/${doc.filename}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors"
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
