// Actualités de l'association et réels Instagram : validation des réponses du script et petites fonctions d'affichage.

export interface PublicArticle {
    slug: string;
    title: string;
    body: string;
    coverId: string;
    photoIds: string[];
    /** Identifiant du projet lié (src/data/projects.ts), ou null. */
    projectId: string | null;
    /** Date de première publication, YYYY-MM-DD. */
    publishedAt: string;
}

export interface PublicReel {
    id: string;
    shortcode: string;
    permalink: string;
    caption: string;
    timestamp: string;
    coverId: string;
}

export interface PublicNews {
    articles: PublicArticle[];
    reels: PublicReel[];
}

export interface AdminArticle {
    id: string;
    /** Vide tant que l'article n'a jamais été publié. */
    slug: string;
    title: string;
    body: string;
    coverId: string | null;
    photoIds: string[];
    projectId: string | null;
    published: boolean;
    publishedAt: string;
    updatedAt: string;
    updatedByName: string;
}

export interface NewsMember {
    id: string;
    name: string;
    role: string;
    canPublish: boolean;
}

export interface NewsAdmin {
    isBureau: boolean;
    articles: AdminArticle[];
    /** Liste des membres et de leur case « peut publier », pour le Bureau seulement. */
    members: NewsMember[] | null;
}

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const strList = (v: unknown): string[] | null => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x !== '') : null);
const projectOf = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);

function parseArticle(raw: unknown): PublicArticle | null {
    if (!isObject(raw)) return null;
    const photoIds = strList(raw.photoIds);
    const slug = str(raw.slug);
    const title = str(raw.title);
    const coverId = str(raw.coverId);
    if (!slug || !title || !coverId || !photoIds) return null;
    return { slug, title, body: str(raw.body), coverId, photoIds, projectId: projectOf(raw.projectId), publishedAt: str(raw.publishedAt) };
}

function parseReel(raw: unknown): PublicReel | null {
    if (!isObject(raw)) return null;
    const shortcode = str(raw.shortcode);
    const coverId = str(raw.coverId);
    if (!shortcode || !coverId || !/^[A-Za-z0-9_-]+$/.test(shortcode)) return null;
    return { id: str(raw.id), shortcode, permalink: str(raw.permalink), caption: str(raw.caption), timestamp: str(raw.timestamp), coverId };
}

/** Réponse publique `?news=1`. null si le script ne répond pas comme prévu (pas encore redéployé, erreur). */
export function parseNews(raw: unknown): PublicNews | null {
    if (!isObject(raw) || raw.success !== true || !Array.isArray(raw.articles) || !Array.isArray(raw.reels)) return null;
    return {
        articles: raw.articles.map(parseArticle).filter((a): a is PublicArticle => a !== null),
        reels: raw.reels.map(parseReel).filter((r): r is PublicReel => r !== null),
    };
}

function parseAdminArticle(raw: unknown): AdminArticle | null {
    if (!isObject(raw)) return null;
    const id = str(raw.id);
    const photoIds = strList(raw.photoIds);
    if (!id || !photoIds) return null;
    return {
        id,
        slug: str(raw.slug),
        title: str(raw.title),
        body: str(raw.body),
        coverId: str(raw.coverId) || null,
        photoIds,
        projectId: projectOf(raw.projectId),
        published: raw.published === true,
        publishedAt: str(raw.publishedAt),
        updatedAt: str(raw.updatedAt),
        updatedByName: str(raw.updatedByName),
    };
}

export function parseNewsAdmin(raw: unknown): NewsAdmin | null {
    if (!isObject(raw) || raw.success !== true || !Array.isArray(raw.articles)) return null;
    const members = Array.isArray(raw.members)
        ? raw.members
              .filter(isObject)
              .map((m) => ({ id: str(m.id), name: str(m.name), role: str(m.role), canPublish: m.canPublish === true }))
              .filter((m) => m.id)
        : null;
    return {
        isBureau: raw.isBureau === true,
        articles: raw.articles.map(parseAdminArticle).filter((a): a is AdminArticle => a !== null),
        members,
    };
}

export type BodyPart = { text: string } | { text: string; href: string };

const URL_PATTERN = /https?:\/\/[^\s<>"]+/g;

function linkify(paragraph: string): BodyPart[] {
    const parts: BodyPart[] = [];
    let last = 0;
    for (const match of paragraph.matchAll(URL_PATTERN)) {
        let url = match[0];
        // La ponctuation qui suit une adresse appartient à la phrase, pas au lien.
        while (/[.,;:!?)]$/.test(url)) url = url.slice(0, -1);
        const start = match.index ?? 0;
        if (start > last) parts.push({ text: paragraph.slice(last, start) });
        parts.push({ text: url, href: url });
        last = start + url.length;
    }
    if (last < paragraph.length) parts.push({ text: paragraph.slice(last) });
    return parts;
}

/** Texte d'un article en paragraphes (séparés par une ligne vide). Seules les adresses http(s) deviennent des liens. */
export function bodyBlocks(body: string): BodyPart[][] {
    return body
        .replace(/\r\n/g, '\n')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map(linkify);
}

/** Dimensions d'une photo réduite pour tenir dans un carré de `max` pixels, sans jamais l'agrandir. */
export function fitWithin(w: number, h: number, max = 1600): { outW: number; outH: number } {
    const scale = Math.min(1, max / Math.max(w, h));
    return { outW: Math.round(w * scale), outH: Math.round(h * scale) };
}

export function formatNewsDate(key: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(key);
    if (!m) return '';
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Début d'un article pour les cartes : premier paragraphe, coupé au dernier mot entier. */
export function excerpt(body: string, max = 180): string {
    const first = (body.replace(/\r\n/g, '\n').split(/\n\s*\n/)[0] ?? '').replace(/\s+/g, ' ').trim();
    if (first.length <= max) return first;
    const cut = first.slice(0, max);
    const space = cut.lastIndexOf(' ');
    return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,;:.]+$/, '')}…`;
}
