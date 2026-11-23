import { useEffect, useRef, useState } from 'react';
import { Camera, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';
import { projectsData } from '../../data/projectsData';
import { getSlotDuration, getWeekStartDate, nomineePhotoUrl, removeNomineePhotoApi, saveNomineeProfileApi, uploadNomineePhotoApi } from '../../data/planningData';
import { computeNomineeStats, mergeAutoStats, portraitCrop, type NomineeProfile, type NomineeStat } from '../../data/nominees';

interface NomineeProfileEditorProps {
    member: { id: string; name: string; profile: NomineeProfile | null };
    requesterId: string;
    token: string;
    onClose: () => void;
    onChanged: () => void | Promise<void>;
}

const MAX_ITEMS = 12;
const MAX_ITEM = 160;
const MAX_STATS = 8;

/** Lit une image choisie, la recadre en 4:5 et la réduit à 900 px de large (JPEG). */
async function toPortraitJpeg(file: File): Promise<string> {
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Image illisible'));
            image.src = url;
        });
        const crop = portraitCrop(img.naturalWidth, img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = crop.outW;
        canvas.height = crop.outH;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Image illisible');
        context.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.outW, crop.outH);
        return canvas.toDataURL('image/jpeg', 0.85);
    } finally {
        URL.revokeObjectURL(url);
    }
}

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-[#1F0422]/70 text-white border border-[#6F2B75]/40 text-sm placeholder:text-[#ECDDFD]/35 focus:outline-none focus:border-[#EC602B]';
const smallButton = 'inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-school text-xs uppercase tracking-wider border transition-all disabled:opacity-60';

/** Formulaire du Bureau : photo, nom affiché, accomplissements et stats d'un nommé. */
export function NomineeProfileEditor({ member, requesterId, token, onClose, onChanged }: NomineeProfileEditorProps) {
    const { bookings, manualHours, allSlots, allUsers } = usePlanning();
    const fileInput = useRef<HTMLInputElement>(null);

    const freshStats = (): NomineeStat[] => {
        const projectIds = allUsers.find((u) => u.id === member.id)?.projectIds ?? [];
        return computeNomineeStats({
            userId: member.id,
            projectIds,
            bookings,
            manualHours,
            slots: allSlots,
            today: new Date(),
            weekStart: getWeekStartDate,
            duration: getSlotDuration,
            projectName: (id) => projectsData.find((p) => p.id === id)?.name,
        });
    };

    // Le formulaire garde sa saisie pendant que la page se recharge après l'envoi d'une photo.
    const [displayName, setDisplayName] = useState(member.profile?.displayName || member.name);
    const [itemsText, setItemsText] = useState((member.profile?.accomplishments ?? []).join('\n'));
    const [stats, setStats] = useState<NomineeStat[]>(() => (member.profile && member.profile.stats.length > 0 ? member.profile.stats : freshStats()));
    const [localPhoto, setLocalPhoto] = useState<string | null>(null);
    const [photoRemoved, setPhotoRemoved] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Saisie de départ, pour savoir s'il y a des modifications non enregistrées.
    const [initial] = useState(() => JSON.stringify([displayName, itemsText, stats]));
    const dirty = JSON.stringify([displayName, itemsText, stats]) !== initial;
    const nameInput = useRef<HTMLInputElement>(null);

    const requestClose = () => {
        if (busy) return;
        if (dirty && !window.confirm('Fermer sans enregistrer ? Vos modifications de la fiche seront perdues.')) return;
        onClose();
    };
    const closeRef = useRef(requestClose);
    useEffect(() => {
        closeRef.current = requestClose;
    });

    // Focus dans la fenêtre à l'ouverture, rendu au bouton d'origine à la fermeture ; la page derrière ne défile plus.
    useEffect(() => {
        const previous = document.activeElement as HTMLElement | null;
        nameInput.current?.focus();
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

    const serverPhoto = member.profile?.photoId ? nomineePhotoUrl(member.profile.photoId) : null;
    const photo = localPhoto ?? (photoRemoved ? null : serverPhoto);
    const items = itemsText.split('\n').map((line) => line.trim()).filter(Boolean);
    const tooMany = items.length > MAX_ITEMS;
    const tooLong = items.some((line) => line.length > MAX_ITEM);

    const pickPhoto = async (file: File | undefined) => {
        if (!file) return;
        setError(null);
        setBusy('photo');
        try {
            const dataUrl = await toPortraitJpeg(file);
            const result = await uploadNomineePhotoApi(requesterId, member.id, dataUrl, token);
            if (!result.success) {
                setError(result.message);
            } else {
                setLocalPhoto(dataUrl);
                setPhotoRemoved(false);
                await onChanged();
            }
        } catch {
            setError("Cette image n'a pas pu être lue. Essayez une photo au format JPEG ou PNG.");
        } finally {
            setBusy(null);
            if (fileInput.current) fileInput.current.value = '';
        }
    };

    const removePhoto = async () => {
        setError(null);
        setBusy('photo');
        const result = await removeNomineePhotoApi(requesterId, member.id, token);
        if (!result.success) {
            setError(result.message);
        } else {
            setLocalPhoto(null);
            setPhotoRemoved(true);
            await onChanged();
        }
        setBusy(null);
    };

    const save = async () => {
        setError(null);
        setBusy('save');
        const result = await saveNomineeProfileApi(requesterId, member.id, { displayName: displayName.trim(), accomplishments: items, stats }, token);
        if (!result.success) {
            setError(result.message);
            setBusy(null);
            return;
        }
        await onChanged();
        setBusy(null);
        onClose();
    };

    const updateStat = (index: number, key: keyof NomineeStat, value: string) =>
        setStats((current) => current.map((s, i) => (i === index ? { ...s, [key]: value } : s)));

    return (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-md overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="nominee-editor-title">
            <div className="min-h-full flex items-start sm:items-center justify-center p-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
                <div className="w-full max-w-2xl rounded-2xl bg-[#2A082D] border border-[#6F2B75]/50 shadow-2xl p-5 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/60">Fiche du nommé</p>
                            <h2 id="nominee-editor-title" className="mt-1 text-xl font-bold text-white">{member.name}</h2>
                        </div>
                        <button type="button" onClick={requestClose} disabled={busy !== null} aria-label="Fermer" className="w-9 h-9 rounded-full bg-white/5 border border-[#ECDDFD]/15 flex items-center justify-center text-[#ECDDFD]/70 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-[160px_1fr]">
                        <div>
                            <div className="aspect-[4/5] w-full max-w-[160px] rounded-lg overflow-hidden bg-gradient-to-br from-[#6F2B75] to-[#2A082D] border border-[#6F2B75]/50 flex items-center justify-center">
                                {photo ? <img src={photo} alt={`Photo de ${member.name}`} className="w-full h-full object-cover" /> : <Camera size={28} className="text-[#ECDDFD]/50" />}
                            </div>
                            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => void pickPhoto(e.target.files?.[0])} />
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button type="button" disabled={busy !== null} onClick={() => fileInput.current?.click()} className={`${smallButton} btn-phoenix-gradient text-white border-transparent`}>
                                    <Camera size={13} />
                                    {busy === 'photo' ? 'Envoi...' : photo ? 'Changer' : 'Ajouter'}
                                </button>
                                {photo && (
                                    <button type="button" disabled={busy !== null} onClick={() => void removePhoto()} className={`${smallButton} bg-transparent text-[#ECDDFD]/80 border-[#6F2B75]/50 hover:text-white`}>
                                        Retirer
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-[11px] text-[#ECDDFD]/55 leading-snug">Recadrée en portrait. Sans photo, la fiche n'apparaît pas sur le site public.</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="nominee-name" className="block text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70 mb-2">Nom affiché</label>
                                <input ref={nameInput} id="nominee-name" value={displayName} maxLength={60} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="nominee-items" className="block text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70 mb-2">Accomplissements</label>
                                <textarea
                                    id="nominee-items"
                                    rows={6}
                                    value={itemsText}
                                    onChange={(e) => setItemsText(e.target.value)}
                                    placeholder={'Un accomplissement par ligne, par exemple :\nA encadré la sortie au Mucem'}
                                    className={`${inputClass} resize-y leading-relaxed`}
                                />
                                <p className={`mt-1 text-[11px] ${tooMany || tooLong ? 'text-amber-300' : 'text-[#ECDDFD]/55'}`}>
                                    {items.length} / {MAX_ITEMS} lignes{tooLong ? `, une ligne dépasse ${MAX_ITEM} caractères` : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <p className="text-xs font-school font-bold uppercase tracking-widest text-[#ECDDFD]/70">Stats</p>
                            <button type="button" disabled={busy !== null} onClick={() => setStats((current) => mergeAutoStats(current, freshStats()))} className={`${smallButton} bg-transparent text-[#ECDDFD]/80 border-[#6F2B75]/50 hover:text-white`}>
                                <RefreshCw size={13} />
                                Recalculer
                            </button>
                        </div>
                        <ul className="space-y-2">
                            {stats.map((stat, index) => (
                                <li key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                    <input aria-label={`Libellé ${index + 1}`} value={stat.label} maxLength={30} placeholder="Libellé" onChange={(e) => updateStat(index, 'label', e.target.value)} className={inputClass} />
                                    <input aria-label={`Valeur ${index + 1}`} value={stat.value} maxLength={30} placeholder="Valeur" onChange={(e) => updateStat(index, 'value', e.target.value)} className={inputClass} />
                                    <button type="button" aria-label={`Supprimer la stat ${stat.label || index + 1}`} onClick={() => setStats((current) => current.filter((_, i) => i !== index))} className="w-10 rounded-xl border border-[#6F2B75]/40 text-[#ECDDFD]/60 hover:text-red-300 flex items-center justify-center">
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {stats.length < MAX_STATS && (
                            <button type="button" onClick={() => setStats((current) => [...current, { label: '', value: '' }])} className={`${smallButton} mt-3 bg-transparent text-[#ECDDFD]/80 border-[#6F2B75]/50 hover:text-white`}>
                                <Plus size={13} />
                                Ajouter une ligne
                            </button>
                        )}
                        <p className="mt-2 text-[11px] text-[#ECDDFD]/55">Projet, heures et séances sont calculés depuis le 1er septembre. « Recalculer » les remet à jour sans toucher aux autres lignes.</p>
                    </div>

                    {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}

                    <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button type="button" onClick={requestClose} disabled={busy !== null} className={`${smallButton} justify-center py-2.5 bg-transparent text-[#ECDDFD]/80 border-[#6F2B75]/50 hover:text-white`}>
                            Fermer
                        </button>
                        <button type="button" onClick={() => void save()} disabled={busy !== null || !displayName.trim() || tooMany || tooLong} className={`${smallButton} justify-center py-2.5 btn-phoenix-gradient text-white border-transparent`}>
                            {busy === 'save' ? 'Enregistrement...' : 'Enregistrer la fiche'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
