// Vercel Serverless Function for Planning Sync
export default async function handler(req, res) {
    const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!GOOGLE_APPS_SCRIPT_URL) {
        console.error('GOOGLE_APPS_SCRIPT_URL is not set in environment variables.');
        return res.status(500).json({ success: false, message: 'Erreur de configuration serveur.' });
    }
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
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
