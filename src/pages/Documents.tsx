import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Archive, Sparkles, ChevronDown, Plus, Pencil, Trash2, X } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { usePlanning } from '../context/PlanningContext';

export interface DocumentItem {
    id: string;
    title: string;
    description: string;
    filename: string;
    url?: string;
    type: string;
    size: string;
    category: 'current' | 'archive';
    isNew?: boolean;
    year?: string;
}

const defaultDocuments: DocumentItem[] = [
    {
        id: "guide-2026-2027",
        title: "Guide du Phoenicien 2026-2027",
        description: "Le guide officiel complet pour tout savoir sur l'association, ses valeurs, ses 9 projets, ses événements phares et son organigramme.",
        filename: "Guide du phoenicien 2026-2027.pdf",
        url: "/documents/Guide du phoenicien 2026-2027.pdf",
        type: "PDF",
        size: "4.8 MB",
        category: "current",
        isNew: true
    },
    {
        id: "fiches-posts-2026-2027",
        title: "Fiches de Posts 2026-2027",
        description: "Présentation détaillée des rôles, missions et compétences acquises : Bureau Exécutif, Pôles et Chefs de projet.",
        filename: "Fiches de posts 2026-2027.pdf",
        url: "/documents/Fiches de posts 2026-2027.pdf",
        type: "PDF",
        size: "2.9 MB",
        category: "current",
        isNew: true
    },
    {
        id: "fiches-2-posts-2025-2026",
        title: "Fiches 2 Posts Phoenix EDC",
        description: "Ancienne édition du recueil des fiches de postes et visuels de l'association.",
        filename: "fiches2posts Phoenix edc.pdf",
        url: "/documents/fiches2posts Phoenix edc.pdf",
        type: "PDF",
        size: "2.2 MB",
        category: "archive",
        year: "2025-2026"
    },
    {
        id: "guide-2025-2026",
        title: "Guide du Phoenicien 2025-2026",
        description: "Ancienne édition du guide de l'association (Année universitaire 2025-2026).",
        filename: "Guide du phoenicien 2025-2026.pdf",
        url: "/documents/Guide du phoenicien 2025-2026.pdf",
        type: "PDF",
        size: "1.5 MB",
        category: "archive",
        year: "2025-2026"
    }
];

const documentsBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Accueil",
            "item": "https://www.phoenix-egalite-des-chances.com/"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Documents & Ressources",
            "item": "https://www.phoenix-egalite-des-chances.com/documents"
        }
    ]
};

export function Documents() {
    const { currentUser, isEditModeActive } = usePlanning();
    const isBureau = currentUser?.role === 'bureau';
    const canEdit = Boolean(isBureau && isEditModeActive);

    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [documents, setDocuments] = useState<DocumentItem[]>(() => {
        try {
            const saved = localStorage.getItem('phoenix_documents_v1');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {}
        return defaultDocuments;
    });

    const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
    const [isAddingDoc, setIsAddingDoc] = useState(false);

    // Synchronisation avec l'API backend
    useEffect(() => {
        fetch('/api/documents')
            .then(res => res.json())
            .then(data => {
                if (data?.success && Array.isArray(data.documents) && data.documents.length > 0) {
                    setDocuments(data.documents);
                    localStorage.setItem('phoenix_documents_v1', JSON.stringify(data.documents));
                }
            })
            .catch(() => {});
    }, []);

    const saveDocuments = async (updated: DocumentItem[]) => {
        setDocuments(updated);
        try {
            localStorage.setItem('phoenix_documents_v1', JSON.stringify(updated));
            await fetch('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents: updated })
            });
        } catch (e) {
            console.error('Erreur sauvegarde documents:', e);
        }
    };

    const currentDocuments = documents.filter(d => d.category !== 'archive');
    const archiveDocuments = documents.filter(d => d.category === 'archive');

    const handleOpenAddModal = () => {
        setIsAddingDoc(true);
        setEditingDoc({
            id: `doc-${Date.now()}`,
            title: '',
            description: '',
            filename: '',
            url: '',
            type: 'PDF',
            size: '2.5 MB',
            category: 'current',
            isNew: true,
            year: '2026-2027'
        });
    };

    const handleSaveDoc = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDoc || !editingDoc.title.trim() || !editingDoc.filename.trim()) return;

        const updatedDoc: DocumentItem = {
            ...editingDoc,
            url: editingDoc.url || (editingDoc.filename.startsWith('http') ? editingDoc.filename : `/documents/${editingDoc.filename}`)
        };

        let updatedList: DocumentItem[];
        if (isAddingDoc) {
            updatedList = [updatedDoc, ...documents];
        } else {
            updatedList = documents.map(d => d.id === updatedDoc.id ? updatedDoc : d);
        }

        saveDocuments(updatedList);
        setEditingDoc(null);
        setIsAddingDoc(false);
    };

    const handleDeleteDoc = (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            const updated = documents.filter(d => d.id !== id);
            saveDocuments(updated);
            setEditingDoc(null);
        }
    };

    return (
        <div className="pt-page-safe pb-24 min-h-screen bg-[#FFFBF4] bg-bird-pattern">
            <SEO
                title="Documentation & Guides – Ressources Associatives – Marseille / KEDGE BS"
                description="Consultez et téléchargez les ressources officielles de Phœnix EDC : Guide du Phœnicien 2026-2027, fiches de postes du Bureau et des Pôles associatifs."
                schema={documentsBreadcrumbSchema}
            />
            <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Ressources &amp; Documentation
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display text-[#2A082D] tracking-tight mb-4">
                        Documents{' '}
                        <span className="marker-highlight text-[#EC602B]">
                            <span>Utiles</span>
                        </span>
                    </h1>
                    <p className="text-[#2A082D]/80 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
                        Téléchargez les guides officiels, présentations et ressources de l'association Phoenix Égalité des Chances.
                    </p>

                    {/* Bouton d'ajout Bureau en Mode Édition */}
                    {canEdit && (
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={handleOpenAddModal}
                                className="btn-phoenix-gradient !py-2.5 !px-6 text-xs uppercase tracking-wider font-school font-bold rounded-full text-white shadow-glow-orange inline-flex items-center gap-2 cursor-pointer active:scale-95"
                            >
                                <Plus size={16} />
                                <span>Ajouter un document (Bureau)</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {currentDocuments.map((doc) => {
                        const fileHref = doc.url || (doc.filename.startsWith('http') ? doc.filename : `/documents/${doc.filename}`);
                        return (
                            <div
                                key={doc.id}
                                className="bg-white rounded-organic-sm border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg hover:-translate-y-2 transition-all duration-300 p-8 flex flex-col justify-between group relative will-change-transform"
                            >
                                {/* Boutons Bureau (visibles uniquement en mode édition) */}
                                {canEdit && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                        <button
                                            type="button"
                                            onClick={() => { setIsAddingDoc(false); setEditingDoc(doc); }}
                                            className="p-1.5 rounded-full bg-[#ECDDFD] hover:bg-[#6F2B75] text-[#6F2B75] hover:text-white transition-colors cursor-pointer shadow-xs"
                                            title="Modifier ce document"
                                            aria-label="Modifier ce document"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteDoc(doc.id)}
                                            className="p-1.5 rounded-full bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer shadow-xs"
                                            title="Supprimer ce document"
                                            aria-label="Supprimer ce document"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-start gap-5 mb-6">
                                        <div className="w-12 h-12 rounded-lg bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shrink-0 shadow-soft">
                                            <FileText size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="text-lg sm:text-xl font-display text-[#2A082D] leading-snug">
                                                    {doc.title}
                                                </h3>
                                                {doc.isNew && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-school font-bold px-2.5 py-0.5 rounded bg-[#ECDDFD] text-[#6F2B75] shrink-0">
                                                        <Sparkles size={11} />
                                                        <span>Édition en cours</span>
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
                                        <span className="bg-[#ECDDFD]/50 px-2.5 py-1 rounded text-[#6F2B75]">{doc.type}</span>
                                        <span>{doc.size}</span>
                                    </div>
                                    <a
                                        href={fileHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-phoenix-orange btn-glow-orange !py-2 !px-4 !text-xs rounded-lg text-white shadow-soft flex items-center gap-1.5 touch-tactile"
                                    >
                                        <Download size={14} />
                                        <span>Télécharger</span>
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Section Archives (Dépliable) */}
                <div className="pt-8 border-t border-[#ECDDFD]/60">
                    <button
                        onClick={() => setIsArchiveOpen(!isArchiveOpen)}
                        className="w-full flex items-center justify-between p-6 sm:p-7 rounded-organic-sm bg-white border border-[#6F2B75]/15 shadow-phoenix-colored hover:shadow-phoenix-colored-lg transition-all group cursor-pointer text-left"
                        aria-expanded={isArchiveOpen}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-[#ECDDFD] text-[#6F2B75] flex items-center justify-center shrink-0 group-hover:bg-[#6F2B75] group-hover:text-white transition-all shadow-soft">
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
                                    {archiveDocuments.map((doc) => {
                                        const fileHref = doc.url || (doc.filename.startsWith('http') ? doc.filename : `/documents/${doc.filename}`);
                                        return (
                                            <div
                                                key={doc.id}
                                                className="bg-white rounded-organic-sm border border-[#6F2B75]/15 p-6 flex flex-col justify-between shadow-phoenix-colored hover:shadow-phoenix-colored-lg transition-all relative"
                                            >
                                                {/* Boutons Bureau en mode édition */}
                                                {canEdit && (
                                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setIsAddingDoc(false); setEditingDoc(doc); }}
                                                            className="p-1.5 rounded-full bg-[#ECDDFD] hover:bg-[#6F2B75] text-[#6F2B75] hover:text-white transition-colors cursor-pointer shadow-xs"
                                                            title="Modifier"
                                                            aria-label="Modifier"
                                                        >
                                                            <Pencil size={11} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteDoc(doc.id)}
                                                            className="p-1.5 rounded-full bg-red-100 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer shadow-xs"
                                                            title="Supprimer"
                                                            aria-label="Supprimer"
                                                        >
                                                            <Trash2 size={11} />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#ECDDFD]/60 text-[#6F2B75] flex items-center justify-center shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-8">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h3 className="text-base font-display text-[#2A082D]">
                                                                {doc.title}
                                                            </h3>
                                                            {doc.year && (
                                                                <span className="text-[10px] font-school font-bold px-2.5 py-0.5 rounded-full bg-[#ECDDFD] text-[#6F2B75]">
                                                                    Archive {doc.year}
                                                                </span>
                                                            )}
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
                                                        href={fileHref}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-[#6F2B75] hover:text-[#2A082D] font-school font-bold transition-colors"
                                                    >
                                                        <Download size={14} />
                                                        <span>Télécharger</span>
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── MODALE D'AJOUT / ÉDITION DE DOCUMENT (BUREAU) ── */}
            <AnimatePresence>
                {canEdit && editingDoc && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200"
                        >
                            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EC602B] flex items-center justify-center">
                                        <FileText size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {isAddingDoc ? 'Ajouter un Document' : 'Modifier le Document'}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingDoc(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveDoc} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Titre du document *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingDoc.title}
                                        onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                                        placeholder="Ex: Guide du Phoenicien 2026-2027"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC602B]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Description courte
                                    </label>
                                    <textarea
                                        value={editingDoc.description}
                                        onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                                        placeholder="Présentation rapide du document..."
                                        rows={3}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC602B]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Fichier (nom ou lien URL) *
                                        </label>
                                        <input
                                            type="text"
                                            value={editingDoc.filename}
                                            onChange={(e) => setEditingDoc({ ...editingDoc, filename: e.target.value })}
                                            placeholder="Ex: mon-fichier.pdf ou https://..."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC602B]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Format &amp; Taille
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editingDoc.type}
                                                onChange={(e) => setEditingDoc({ ...editingDoc, type: e.target.value })}
                                                placeholder="PDF"
                                                className="w-20 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC602B]"
                                            />
                                            <input
                                                type="text"
                                                value={editingDoc.size}
                                                onChange={(e) => setEditingDoc({ ...editingDoc, size: e.target.value })}
                                                placeholder="2.5 MB"
                                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC602B]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Catégorie
                                        </label>
                                        <select
                                            value={editingDoc.category}
                                            onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value as 'current' | 'archive' })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC602B]"
                                        >
                                            <option value="current">Document en cours (Page principale)</option>
                                            <option value="archive">Archive (Édition précédente)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Année (si archive)
                                        </label>
                                        <input
                                            type="text"
                                            value={editingDoc.year || ''}
                                            onChange={(e) => setEditingDoc({ ...editingDoc, year: e.target.value })}
                                            placeholder="Ex: 2025-2026"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#EC602B]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(editingDoc.isNew)}
                                            onChange={(e) => setEditingDoc({ ...editingDoc, isNew: e.target.checked })}
                                            className="w-4 h-4 text-[#EC602B] rounded border-slate-300 focus:ring-[#EC602B]"
                                        />
                                        <span>Afficher le badge « Édition en cours »</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setEditingDoc(null)}
                                        className="px-4 py-2 rounded-xl text-xs font-school uppercase tracking-wider font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-phoenix-orange px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider text-white shadow-glow-orange cursor-pointer"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
