import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, ExternalLink, ImagePlus, Trash2, X } from 'lucide-react';
import {
    deleteNewsApi,
    fetchNewsPhotoApi,
    publicImageUrl,
    removeNewsPhotoApi,
    saveNewsApi,
    setNewsPublishedApi,
    uploadNewsPhotoApi,
} from '../../data/planningData';
import { fitWithin, type AdminArticle } from '../../data/news';
import { projects } from '../../data/projects';

interface NewsEditorProps {
    article: AdminArticle | null;
    requesterId: string;
    token: string;
    onClose: () => void;
    onChanged: () => void | Promise<void>;
}

const MAX_TITLE = 120;
const MAX_BODY = 5000;
const MAX_PHOTOS = 6;

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm placeholder:text-[#ECDDFD]/35 focus:outline-none focus:border-[#EC602B]';
const smallButton = 'inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-school text-xs uppercase tracking-wider border transition-all disabled:opacity-60';

/** Lit une image choisie et la réduit à 1600 px sur son plus grand côté, sans recadrage (JPEG). */
async function toNewsJpeg(file: File): Promise<string> {
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Image illisible'));
            image.src = url;
        });
        const { outW, outH } = fitWithin(img.naturalWidth, img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Image illisible');
        context.drawImage(img, 0, 0, outW, outH);
        return canvas.toDataURL('image/jpeg', 0.85);
    } finally {
        URL.revokeObjectURL(url);
    }
}

type Busy = null | 'save' | 'publish' | 'unpublish' | 'delete' | 'photo';

/** Formulaire d'un article : titre, texte, couverture, galerie, projet lié, publication. */
export function NewsEditor({ article, requesterId, token, onClose, onChanged }: NewsEditorProps) {
    const [id, setId] = useState<string | null>(article?.id ?? null);
    const [title, setTitle] = useState(article?.title ?? '');
    const [body, setBody] = useState(article?.body ?? '');
    const [projectId, setProjectId] = useState<string>(article?.projectId ?? '');
    const [cover, setCover] = useState<string | null>(article?.coverId ?? null);
    const [photos, setPhotos] = useState<string[]>(article?.photoIds ?? []);
    const [published, setPublished] = useState(article?.published ?? false);
    const [slug, setSlug] = useState(article?.slug ?? '');
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [dirty, setDirty] = useState(false);
    // L'ordre des photos n'est envoyé que s'il a été changé ici.
    const [reordered, setReordered] = useState(false);
    const [busy, setBusy] = useState<Busy>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const titleInput = useRef<HTMLInputElement>(null);
    const coverInput = useRef<HTMLInputElement>(null);
    const galleryInput = useRef<HTMLInputElement>(null);

    const requestClose = () => {
        if (busy) return;
        if (dirty && !window.confirm('Fermer sans enregistrer vos modifications ?')) return;
        onClose();
    };
    const closeRef = useRef(requestClose);
    closeRef.current = requestClose;

    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        titleInput.current?.focus();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeRef.current();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = overflow;
            previous?.focus();
        };
    }, []);

    // Photos d'un article non publié : la lecture publique les refuse, on les demande au script avec le jeton.
    useEffect(() => {
        if (!article || article.published) return;
        let alive = true;
        const ids = [article.coverId, ...article.photoIds].filter((x): x is string => Boolean(x));
        for (const photoId of ids) {
            void fetchNewsPhotoApi(requesterId, article.id, photoId, token).then((data) => {
                if (alive && data) setPreviews((current) => ({ ...current, [photoId]: data }));
            });
        }
        return () => {
            alive = false;
        };
    }, [article, requesterId, token]);

    const srcOf = (photoId: string) => previews[photoId] ?? (published ? publicImageUrl(photoId) : undefined);
    const edit = <T,>(setter: (v: T) => void) => (v: T) => {
        setter(v);
        setDirty(true);
        setNotice(null);
    };

    const fail = (message: string) => {
        setError(message);
        setBusy(null);
    };

    /** Enregistre le texte (et crée l'article s'il est nouveau). Renvoie l'identifiant, ou null en cas d'erreur. */
    const persist = async (): Promise<string | null> => {
        if (!title.trim()) {
            setError("Donnez d'abord un titre à l'article.");
            return null;
        }
        const result = await saveNewsApi(requesterId, { id: id ?? undefined, title, body, projectId: projectId || null, photoIds: id && reordered ? photos : undefined }, token);
        if (!result.success || !result.id) {
            setError(result.message);
            return null;
        }
        setId(result.id);
        setDirty(false);
        setReordered(false);
        return result.id;
    };

    const save = async () => {
        setError(null);
        setBusy('save');
        const saved = await persist();
        if (saved) {
            setNotice('Modifications enregistrées.');
            await onChanged();
        }
        setBusy(null);
    };

    const setOnline = async (online: boolean) => {
        setError(null);
        setBusy(online ? 'publish' : 'unpublish');
        const saved = await persist();
        if (!saved) {
            setBusy(null);
            return;
        }
        const result = await setNewsPublishedApi(requesterId, saved, online, token);
        if (!result.success) {
            await onChanged();
            return fail(result.message);
        }
        setPublished(online);
        if (result.slug) setSlug(result.slug);
        setNotice(online ? "L'article est en ligne. Il apparaît sur le site d'ici une minute." : "L'article n'est plus visible sur le site.");
        await onChanged();
        setBusy(null);
    };

    const remove = async () => {
        if (!id) return onClose();
        if (!window.confirm('Supprimer définitivement cet article et ses photos ?')) return;
        setError(null);
        setBusy('delete');
        const result = await deleteNewsApi(requesterId, id, token);
        if (!result.success) return fail(result.message);
        await onChanged();
        onClose();
    };

    const upload = async (files: File[], slot: 'cover' | 'gallery') => {
        if (files.length === 0) return;
        setError(null);
        setBusy('photo');
        const articleId = id ?? (await persist());
        if (!articleId) return setBusy(null);
        let gallery = photos;
        for (const file of files) {
            if (slot === 'gallery' && gallery.length >= MAX_PHOTOS) {
                setError(`Au plus ${MAX_PHOTOS} photos en plus de la couverture.`);
                break;
            }
            let dataUrl: string;
            try {
                dataUrl = await toNewsJpeg(file);
            } catch {
                setError(`« ${file.name} » n'est pas une image lisible.`);
                continue;
            }
            const result = await uploadNewsPhotoApi(requesterId, articleId, slot, dataUrl, token);
            if (!result.success || !result.photoId) {
                setError(result.message);
                break;
            }
            const photoId = result.photoId;
            setPreviews((current) => ({ ...current, [photoId]: dataUrl }));
            if (slot === 'cover') setCover(photoId);
            else {
                gallery = [...gallery, photoId];
                setPhotos(gallery);
            }
        }
        await onChanged();
        setBusy(null);
    };

    const removePhoto = async (photoId: string) => {
        if (!id) return;
        setError(null);
        setBusy('photo');
        const result = await removeNewsPhotoApi(requesterId, id, photoId, token);
        if (!result.success) return fail(result.message);
        if (cover === photoId) setCover(null);
        setPhotos((current) => current.filter((p) => p !== photoId));
        await onChanged();
        setBusy(null);
    };

    const move = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= photos.length) return;
        const next = [...photos];
        [next[index], next[target]] = [next[target], next[index]];
        setPhotos(next);
        setReordered(true);
        setDirty(true);
        setNotice(null);
    };

    const locked = busy !== null;

    return (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="news-editor-title">
            <div className="min-h-full flex items-start sm:items-center justify-center p-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
                <div className="w-full max-w-2xl rounded-2xl bg-[#2A082D] border border-[#6F2B75]/50 shadow-2xl p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/60">{published ? 'Article en ligne' : 'Article non publié'}</p>
                            <h2 id="news-editor-title" className="mt-1 text-xl font-bold text-white">{article ? "Modifier l'article" : 'Nouvel article'}</h2>
                        </div>
                        <button type="button" onClick={requestClose} disabled={locked} aria-label="Fermer" className="w-9 h-9 rounded-full bg-white/5 border border-[#ECDDFD]/15 flex items-center justify-center text-[#ECDDFD]/70 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="news-title" className="flex justify-between text-xs font-semibold text-[#ECDDFD]/80 mb-1.5">
                                <span>Titre</span>
                                <span className={title.length > MAX_TITLE ? 'text-[#FF7E2E]' : 'text-[#ECDDFD]/45'}>{title.length} / {MAX_TITLE}</span>
                            </label>
                            <input id="news-title" ref={titleInput} value={title} maxLength={MAX_TITLE} onChange={(e) => edit(setTitle)(e.target.value)} className={inputClass} placeholder="Sortie au Mucem avec les élèves de Sup d'OM" />
                        </div>

                        <div>
                            <label htmlFor="news-body" className="flex justify-between text-xs font-semibold text-[#ECDDFD]/80 mb-1.5">
                                <span>Texte</span>
                                <span className={body.length > MAX_BODY ? 'text-[#FF7E2E]' : 'text-[#ECDDFD]/45'}>{body.length} / {MAX_BODY}</span>
                            </label>
                            <textarea id="news-body" value={body} maxLength={MAX_BODY} rows={9} onChange={(e) => edit(setBody)(e.target.value)} className={`${inputClass} resize-y leading-relaxed`} aria-describedby="news-body-help" />
                            <p id="news-body-help" className="mt-1.5 text-xs text-[#ECDDFD]/55">Laissez une ligne vide entre deux paragraphes. Les liens sont cliquables.</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-[#ECDDFD]/80 mb-1.5">Photo de couverture</p>
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="w-40 aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-[#6F2B75] to-[#2A082D] border border-[#6F2B75]/50 flex items-center justify-center">
                                    {cover && srcOf(cover) ? <img src={srcOf(cover)} alt="Couverture" className="w-full h-full object-cover" /> : <Camera size={22} className="text-[#ECDDFD]/40" aria-hidden="true" />}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" disabled={locked} onClick={() => coverInput.current?.click()} className={`${smallButton} bg-[#1F0422]/70 text-[#ECDDFD] border-[#6F2B75]/40 hover:border-[#EC602B]`}>
                                        <Camera size={13} />
                                        {cover ? 'Remplacer' : 'Choisir une photo'}
                                    </button>
                                    {cover && !published && (
                                        <button type="button" disabled={locked} onClick={() => void removePhoto(cover)} className={`${smallButton} bg-transparent text-[#ECDDFD]/70 border-[#ECDDFD]/15 hover:text-white`}>
                                            <Trash2 size={13} />
                                            Retirer
                                        </button>
                                    )}
                                </div>
                                <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload([f], 'cover'); }} />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-[#ECDDFD]/80 mb-1.5">Autres photos ({photos.length} / {MAX_PHOTOS})</p>
                            {photos.length > 0 && (
                                <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                                    {photos.map((photoId, i) => (
                                        <li key={photoId} className="relative">
                                            <div className="aspect-square rounded-lg overflow-hidden bg-[#1F0422] border border-[#6F2B75]/40">
                                                {srcOf(photoId) && <img src={srcOf(photoId)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="mt-1 flex justify-between">
                                                <button type="button" disabled={locked || i === 0} onClick={() => move(i, -1)} aria-label={`Avancer la photo ${i + 1}`} className="w-7 h-7 rounded-full bg-white/5 text-[#ECDDFD]/80 disabled:opacity-30 flex items-center justify-center"><ArrowLeft size={13} /></button>
                                                <button type="button" disabled={locked} onClick={() => void removePhoto(photoId)} aria-label={`Retirer la photo ${i + 1}`} className="w-7 h-7 rounded-full bg-white/5 text-[#ECDDFD]/80 hover:text-white flex items-center justify-center"><Trash2 size={13} /></button>
                                                <button type="button" disabled={locked || i === photos.length - 1} onClick={() => move(i, 1)} aria-label={`Reculer la photo ${i + 1}`} className="w-7 h-7 rounded-full bg-white/5 text-[#ECDDFD]/80 disabled:opacity-30 flex items-center justify-center"><ArrowRight size={13} /></button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {photos.length < MAX_PHOTOS && (
                                <button type="button" disabled={locked} onClick={() => galleryInput.current?.click()} className={`${smallButton} bg-[#1F0422]/70 text-[#ECDDFD] border-[#6F2B75]/40 hover:border-[#EC602B]`}>
                                    <ImagePlus size={13} />
                                    Ajouter des photos
                                </button>
                            )}
                            <input ref={galleryInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files ?? []); e.target.value = ''; void upload(fs, 'gallery'); }} />
                        </div>

                        <div>
                            <label htmlFor="news-project" className="block text-xs font-semibold text-[#ECDDFD]/80 mb-1.5">Projet lié</label>
                            <select id="news-project" value={projectId} onChange={(e) => edit(setProjectId)(e.target.value)} className={inputClass}>
                                <option value="">Aucun</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {busy === 'photo' && <p className="mt-5 text-sm text-[#ECDDFD]/75" role="status">Envoi de la photo...</p>}
                    {error && <p className="mt-5 text-sm text-[#FF7E2E]" role="alert">{error}</p>}
                    {notice && !error && (
                        <p className="mt-5 text-sm text-emerald-300 flex flex-wrap items-center gap-2" role="status">
                            {notice}
                            {published && slug && (
                                <a href={`/actualites/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 text-[#ECDDFD] hover:text-white">
                                    Voir sur le site
                                    <ExternalLink size={12} />
                                </a>
                            )}
                        </p>
                    )}

                    <div className="mt-7 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button type="button" disabled={locked} onClick={() => void remove()} className={`${smallButton} justify-center bg-transparent text-[#ECDDFD]/70 border-[#ECDDFD]/15 hover:text-white hover:border-[#FF7E2E]/60`}>
                            <Trash2 size={13} />
                            {busy === 'delete' ? 'Suppression...' : 'Supprimer'}
                        </button>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {published && (
                                <button type="button" disabled={locked} onClick={() => void setOnline(false)} className="px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider border bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:text-white border-[#6F2B75]/40 disabled:opacity-60">
                                    {busy === 'unpublish' ? 'Retrait...' : 'Dépublier'}
                                </button>
                            )}
                            {published ? (
                                <button type="button" disabled={locked} onClick={() => void save()} className="px-6 py-2.5 rounded-full font-school text-xs uppercase tracking-wider btn-phoenix-gradient text-white disabled:opacity-60">
                                    {busy === 'save' ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            ) : (
                                <>
                                    <button type="button" disabled={locked} onClick={() => void save()} className="px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider border bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:text-white border-[#6F2B75]/40 disabled:opacity-60">
                                        {busy === 'save' ? 'Enregistrement...' : 'Enregistrer sans publier'}
                                    </button>
                                    <button type="button" disabled={locked} onClick={() => void setOnline(true)} className="px-6 py-2.5 rounded-full font-school text-xs uppercase tracking-wider btn-phoenix-gradient text-white disabled:opacity-60">
                                        {busy === 'publish' ? 'Publication...' : 'Publier'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
