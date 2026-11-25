// Vercel Serverless Function for Planning Sync
export default async function handler(req, res) {
    const DEFAULT_URL = "https://script.google.com/macros/s/AKfycbyyMsp23ni8GWsIVXrj8xuBpjLLNgqRsxlsyEBWmQt4xAlKDBHzLqXtKW5vAdzMESMeXg/exec";
    const envUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const GOOGLE_APPS_SCRIPT_URL = (envUrl && !envUrl.includes('...')) ? envUrl : DEFAULT_URL;

    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Fiches publiques des nommés au tuteur du mois, mises en cache par Vercel. Tout autre paramètre est refusé :
    // le cache est indexé sur l'adresse complète, un paramètre au hasard ferait appeler le script à chaque fois.
    const queryKeys = Object.keys(req.query || {});
    if (req.method === 'GET' && req.query && req.query.nominees !== undefined) {
        if (queryKeys.length !== 1 || req.query.nominees !== '1') return res.status(400).json({ success: false, message: 'Requête invalide' });
        try {
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getNominees`);
            const data = JSON.parse(await response.text());
            if (data && data.success) res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
            return res.status(200).json(data);
        } catch (error) {
            console.error('Erreur serverless nominees:', error);
            return res.status(502).json({ success: false, message: 'Fiches indisponibles' });
        }
    }

    // Photo d'un nommé : une nouvelle photo a un nouvel identifiant, l'adresse change donc d'elle-même.
    if (req.method === 'GET' && req.query && req.query.photo !== undefined) {
        const id = String(req.query.photo);
        if (queryKeys.length !== 1 || !/^[A-Za-z0-9_-]{10,100}$/.test(id)) return res.status(400).json({ success: false, message: 'Photo invalide' });
        try {
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getNomineePhoto&id=${encodeURIComponent(id)}`);
            const data = JSON.parse(await response.text());
            if (!data || !data.success || typeof data.data !== 'string') return res.status(404).json({ success: false, message: 'Photo introuvable' });
            res.setHeader('Content-Type', 'image/jpeg');
            // Une heure : une photo retirée disparaît du site au plus tard une heure après.
            res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
            return res.status(200).send(Buffer.from(data.data, 'base64'));
        } catch (error) {
            console.error('Erreur serverless photo:', error);
            return res.status(502).json({ success: false, message: 'Photo indisponible' });
        }
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getPlanningData`);
            if (!response.ok) {
                return res.status(response.status).json({ success: false, message: 'Erreur HTTP de Google Apps Script' });
            }
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                return res.status(200).json(data);
            } catch (err) {
                console.error('Non-JSON response from Google Apps Script:', text.slice(0, 200));
                return res.status(502).json({ success: false, message: 'Google Apps Script a renvoyé du contenu non-JSON (vérifier les permissions).' });
            }
        } catch (error) {
            console.error('Erreur serverless get planning:', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération du planning' });
        }
    }

    if (req.method === 'POST') {
        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            if (!response.ok) {
                return res.status(response.status).json({ success: false, message: 'Erreur HTTP de Google Apps Script' });
            }
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                return res.status(200).json(data);
            } catch (err) {
                console.error('Non-JSON response from Google Apps Script:', text.slice(0, 200));
                return res.status(502).json({ success: false, message: 'Google Apps Script a renvoyé du contenu non-JSON (vérifier les permissions).' });
            }
        } catch (error) {
            console.error('Erreur serverless post planning:', error);
            return res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour du planning' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
