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
        const { action } = req.query;
        if (action === 'listUsers') {
            try {
                const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=listUsers`);
                if (!response.ok) return res.status(response.status).json({ success: false });
                const data = await response.json();
                return res.status(200).json(data);
            } catch (error) {
                return res.status(500).json({ success: false });
            }
        }
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ success: false, message: 'Identifiants manquants' });
    }

    try {
        let response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ login: login.trim(), password: password.trim() }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });

        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: 'Erreur HTTP de Google Apps Script' });
        }

        let text = await response.text();
        try {
            let data = JSON.parse(text);
            
            // Si échec, tentative automatique avec un \t (au cas où une tabulation a été insérée dans Google Sheets)
            if (!data.success) {
                const retryResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ login: login.trim() + '\t', password: password.trim() }),
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                });
                if (retryResponse.ok) {
                    const retryText = await retryResponse.text();
                    try {
                        const retryData = JSON.parse(retryText);
                        if (retryData.success) {
                            data = retryData;
                        }
                    } catch (e) {
                        // ignore retry parse error
                    }
                }
            }

            return res.status(200).json(data);
        } catch (err) {
            console.error('Non-JSON response from Google Apps Script in login:', text.slice(0, 200));
            return res.status(502).json({ success: false, message: 'Google Apps Script a renvoyé du contenu non-JSON (vérifier les permissions).' });
        }
    } catch (error) {
        console.error('Erreur proxy login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion' });
    }
}
