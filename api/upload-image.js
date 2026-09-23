// Vercel Serverless Function : upload d'image persistant en production.
//
// Une Google Sheet n'est pas faite pour stocker des photos, et Vercel n'a pas
// de disque persistant. On commit donc directement le fichier dans le repo
// GitHub via l'API Contents — Vercel redéploie automatiquement le site à
// chaque push, donc la photo devient "en dur" dans le site comme n'importe
// quelle autre image, en ~1-2 minutes.
//
// Nécessite la variable d'environnement GITHUB_TOKEN (Personal Access Token,
// scope "repo" ou fine-grained "Contents: Read and write" sur ce dépôt).

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Sohel109';
const GITHUB_REPO = process.env.GITHUB_REPO || 'phoenix-website';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const ALLOWED_FOLDERS = new Set(['poles', 'team']);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(500).json({
            success: false,
            error: "GITHUB_TOKEN manquant côté serveur : ajoute cette variable d'environnement dans les réglages Vercel du projet.",
        });
    }

    try {
        const { dataUrl, folder, id } = req.body;

        if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
            return res.status(400).json({ success: false, error: 'dataUrl manquant ou invalide (attendu: data:image/...;base64,...)' });
        }
        if (!ALLOWED_FOLDERS.has(folder)) {
            return res.status(400).json({ success: false, error: `folder invalide, attendu: ${[...ALLOWED_FOLDERS].join(', ')}` });
        }

        const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (!match) {
            return res.status(400).json({ success: false, error: 'Format de data URL non reconnu' });
        }
        let ext = match[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';
        const base64Content = match[2];

        // ~5 Mo max en base64 (limite raisonnable pour une photo de profil)
        if (base64Content.length > 7_000_000) {
            return res.status(400).json({ success: false, error: 'Image trop volumineuse (5 Mo max).' });
        }

        const safeId = (id || 'photo').toString().replace(/[^a-zA-Z0-9-_]/g, '') || 'photo';
        const filename = `${safeId}-${Date.now()}.${ext}`;
        const repoPath = `public/images/${folder}/${filename}`;

        const ghResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                body: JSON.stringify({
                    message: `feat(content): ajout photo ${folder}/${filename} (upload en ligne)`,
                    content: base64Content,
                    branch: GITHUB_BRANCH,
                }),
            }
        );

        if (!ghResponse.ok) {
            const errBody = await ghResponse.text();
            console.error('Erreur GitHub API:', ghResponse.status, errBody);
            return res.status(502).json({ success: false, error: `Échec de l'enregistrement sur GitHub (${ghResponse.status})` });
        }

        return res.status(200).json({
            success: true,
            path: `/images/${folder}/${filename}`,
            note: 'Le site se reconstruit automatiquement, la photo sera visible pour tout le monde dans 1 à 2 minutes.',
        });
    } catch (error) {
        console.error('Erreur upload-image:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
