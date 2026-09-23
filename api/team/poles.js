// Vercel Serverless Function : persistance des pôles opérationnels (texte)
// pour tout le monde, via Google Apps Script + Google Sheets — même mécanisme
// que /api/login et /api/planning. Les photos passent par /api/upload-image
// (commit GitHub) car une Sheet n'est pas faite pour stocker des images.
export default async function handler(req, res) {
    const DEFAULT_URL = "https://script.google.com/macros/s/AKfycbyyMsp23ni8GWsIVXrj8xuBpjLLNgqRsxlsyEBWmQt4xAlKDBHzLqXtKW5vAdzMESMeXg/exec";
    const envUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const GOOGLE_APPS_SCRIPT_URL = (envUrl && !envUrl.includes('...')) ? envUrl : DEFAULT_URL;

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getSiteContent&key=poles`);
            const data = await response.json();
            if (!data.success) {
                return res.status(500).json({ success: false, error: data.error || 'Erreur Google Apps Script' });
            }
            // value est null tant que personne n'a encore sauvegardé de pôles via ce circuit
            return res.status(200).json({ success: true, poles: data.value || [] });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    if (req.method === 'POST') {
        try {
            const { pole } = req.body;
            if (!pole || typeof pole !== 'object' || !pole.id) {
                return res.status(400).json({ success: false, error: 'Format invalide: pole doit être un objet avec un id' });
            }
            // Fusion atomique côté Apps Script (sous verrou) : évite qu'une sauvegarde
            // n'écrase le travail fait entre-temps sur un autre pôle par quelqu'un d'autre.
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updateSiteContentEntry', key: 'poles', entryId: pole.id, entry: pole }),
            });
            const data = await response.json();
            if (!data.success) {
                return res.status(500).json({ success: false, error: data.error || 'Erreur Google Apps Script' });
            }
            return res.status(200).json({ success: true, poles: data.value || [] });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
