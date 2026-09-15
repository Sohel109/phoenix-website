import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { FileText, Download, Archive, Sparkles } from 'lucide-react';

export function Documents() {
    const containerRef = useRef<HTMLDivElement>(null);
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
            title: "Fiches 2 Posts Phoenix EDC",
            description: "Recueil des fiches et visuels pour la communication sur les réseaux sociaux.",
            filename: "fiches2posts Phoenix edc.pdf",
            type: "PDF",
            size: "2.2 MB",
            isNew: false
        }
    ];

    const archiveDocuments = [
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
        <div ref={containerRef} className="min-h-screen bg-transparent overflow-hidden relative transition-colors duration-300">
            {/* Abstract Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50 dark:opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-secondary/10 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-4 uppercase tracking-wider relative inline-block text-gray-900 dark:text-white"
                    >
                        Documents Utiles
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-orange-500 rounded-full"></span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-sm mt-3"
                    >
                        Téléchargez les guides officiels, présentations et ressources de l'association Phoenix Égalité des Chances.
                    </motion.p>
                </div>

                {/* Main Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                    {currentDocuments.map((doc, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-white dark:bg-current-card rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02] dark:shadow-none" />

                            <div className="relative p-8 flex flex-col h-full">
                                {doc.isNew && (
                                    <div className="absolute top-6 right-6 flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                        <Sparkles size={12} />
                                        <span>Édition 2026-2027</span>
                                    </div>
                                )}

                                <div className="flex items-start gap-6 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                        <FileText size={32} />
                                    </div>
                                    <div className="pr-12">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                            {doc.title}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                            {doc.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5">
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 dark:text-gray-500">
                                        <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{doc.type}</span>
                                        <span>{doc.size}</span>
                                    </div>
                                    <a
                                        href={`/documents/${doc.filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
                                    >
                                        <Download size={18} />
                                        Télécharger
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Section Archives */}
                <div className="max-w-5xl mx-auto pt-10 border-t border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <Archive size={20} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Archives</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Consultez les éditions précédentes des documents de l'association.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {archiveDocuments.map((doc, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="group relative"
                            >
                                <div className="absolute inset-0 bg-white/60 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-md transition-all duration-300 group-hover:shadow-lg dark:shadow-none" />

                                <div className="relative p-7 flex flex-col h-full">
                                    <div className="flex items-start gap-5 mb-5">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                                            <FileText size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                                                    {doc.title}
                                                </h3>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200/60 dark:bg-white/10 text-gray-600 dark:text-gray-400">
                                                    Archive {doc.year}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xs">
                                                {doc.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                                            <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{doc.type}</span>
                                            <span>{doc.size}</span>
                                        </div>
                                        <a
                                            href={`/documents/${doc.filename}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-semibold hover:text-primary transition-colors"
                                        >
                                            <Download size={15} />
                                            Télécharger l'archive
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
