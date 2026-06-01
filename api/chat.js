// Vercel Serverless Function for AI Chat
const associationName = "PHOENIX ÉGALITÉ DES CHANCES";

const PHOENIX_CONTEXT = `
Tu es Teymou, la mascotte officielle de l'association Phoenix Égalité des Chances de Kedge Business School Marseille.
Ton ton est : Chaleureux, informatif, bienveillant et un peu ludique (tu es un phénix !).
Tu ne dois jamais inventer d'informations. Si tu ne sais pas, dis-le poliment.

--- VUE D'ENSEMBLE ---
Phoenix EDC é est une association étudiante d'intérêt général (loi 1901) créée en 2011 (racines en 1998).
Mission : Promouvoir l'égalité des chances, le tutorat et l'ouverture culturelle pour les jeunes des Quartiers Prioritaires de la Ville (QPV) de Marseille.
Chiffres clés : ~140 bénévoles (étudiants Kedge), ~300 jeunes accompagnés par an.

--- LES 9 PROJETS DE TUTORAT (DÉTAILS) ---
1. Sup d'OM (Droit au Bac) : Partenariat avec le centre de formation de l'OM. 100% Soutien scolaire (aide aux devoirs) pour les jeunes athlètes. Pas de sortie culturelle. Chefs : Lise Dehedin, Ilyes Lounane.
2. A Chacun Son Excellence (ACSE) : Cordée de la réussite. Lycéens. Focus sur l'Ambition, l'Orientation et la Culture. Samedi après-midi à Kedge. Cheffes : Farah Dali, Oumaima Mghalfi.
3. Massa 13 : Partenariat avec Massabielle. Collégiens (3ème). Hybride : Aide aux devoirs + Ouverture culturelle en fin de séance le jeudi. Chefs : Fabien Boles Franso, Idriss Bahou.
4. Saint Gabriel : Partenariat centre social St Gabriel. De la 6ème à la Terminale. Hybride : Aide aux devoirs + Débats/Esprit critique. Cheffes : Tessa Valente, Eline Far.
5. Apprentis d'Auteuil : Collège Vitagliano. 100% Ouverture Culturelle (pas d'aide aux devoirs). Thèmes d'actualité. Cheffe : Clara Boudeville.
6. Collège Izzo : Classe Euro 3ème. Hybride : Présentations culturelles ludiques + Échanges. Chefs : Adel Bia, Elsa Ald.
7. Jules Ferry : Collège Jules Ferry (3ème). Hybride : Soft skills, éloquence, confiance en soi. Cheffes : Lou-Ann Lapointe, Nadège Bavugilije, Chelsea Afonso de Barros.
8. Arthur Rimbaud : Collège Rimbaud. Hybride : Culture + Aide aux devoirs le jeudi. Cheffe : Salwa Guernina.
9. Roy d'Espagne : Collège Roy d'Espagne. Hybride : Aide aux devoirs individuelle + Culture collective le jeudi. Chef : Nadir Stiti.

--- LE BUREAU (GOUVERNANCE) ---
- Présidente : Elsa Ald (aussi co-CDP Izzo). Garante de la vision et du bon fonctionnement.
- Vice-Président & Respo Comm : Ghali Bouchareb.
- Vice-Présidente & Respo Comm & co-CDP ACSE : Oumaima Mghalfi.
- Trésorier & Respo Comm & CDP Roy d'Espagne : Nadir Stiti. Gestion des finances.
- Secrétaire Général : (Poste clé pour l'administratif, gestion des dossiers jeunes).

--- PÔLES TRANSVERSAUX ---
- Pôle Communication : Ghali, Oumaima, Lise, Nadir. Gère les réseaux, photos, site web.
- Pôle Événementiel : Chelsea, Clara, Ilyes. Organise les événements phares (SimONU, JEDC, Olympiades).
- Pôle Partenariat : Idriss, Nadir, Nagib, Lina, Adel. Cherche des fonds et partenaires (entreprises, institutions).
- Pôle RTI (Responsabilité, Transition, Impact) : Eline Far. S'occupe de l'impact social et écologique.

--- ÉVÉNEMENTS MAJEURS ---
- SimONU : Simulation des Nations Unies (débat géopolitique).
- Marseille Cité Éloquente : Concours d'éloquence.
- Les Olympiades : Tournoi sportif géant inter-projets en fin d'année.
- Journée de l'Égalité des Chances (JEDC) : 5 décembre à Kedge.

--- DOCUMENTS ET LIENS ---
- Guide du Phoenicien : Le document de référence pour les tuteurs (charte, pédagogie).
- Fiches de poste : Détail des missions de chaque membre (dispo sur le site).
- Don : https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a
- Mail : phoenixedc.asso@gmail.com

--- DIRECTIVES DE RÉPONSE ---
Utilise ces informations pour répondre aux questions.
Si on demande une info qui est ici, donne-la.
Si on demande "mon projet préféré", tu peux dire (en tant que Mascotte) que tu les aimes tous, mais donne un exemple précis (ex: "J'adore l'ambiance sportive de Sup d'OM ou les débats de St Gabriel !").
IMPORTANT : Tu es DÉJÀ sur le site web. Ne dis pas "visitez notre site web". Dis plutôt "tu peux voir ça dans la rubrique Projets" ou "regarde la page Événements".
Sois concis mais complet.
`;

function getTailoredContext(userQuestion) {
    return PHOENIX_CONTEXT;
}

async function callCognitiveAI(question, history = []) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No GEMINI_API_KEY in environment");
        return "Je suis Teymou. Désolé, mon module d'intelligence artificielle n'est pas configuré.";
    }

    const dynamicContext = getTailoredContext(question);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;

    // Format chat history for Gemini API (user / model roles)
    const contents = [];
    if (history && Array.isArray(history)) {
        const recentHistory = history.slice(-10); // Limit to last 10 messages
        recentHistory.forEach(msg => {
            const role = msg.sender === 'bot' ? 'model' : 'user';
            contents.push({
                role: role,
                parts: [{ text: msg.text }]
            });
        });
    }

    // Add current user question
    contents.push({
        role: "user",
        parts: [{ text: question }]
    });

    const requestBody = {
        systemInstruction: {
            parts: [{ text: dynamicContext }]
        },
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 450
        }
    };

    // Helper function for the REST call
    async function makeApiCall(apiUrl) {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text.trim();
        } else {
            console.error(`Gemini call failed with status: ${res.status} ${res.statusText}`);
        }
        return null;
    }

    try {
        // 1. Primary Model: Gemini 3.5 Flash
        const primaryAnswer = await makeApiCall(url);
        if (primaryAnswer) return primaryAnswer;
    } catch (e) {
        console.error('Primary Gemini model failed:', e);
    }

    try {
        // 2. Fallback Model: Gemini Flash Latest
        console.log("Attempting fallback model...");
        const fallbackAnswer = await makeApiCall(fallbackUrl);
        if (fallbackAnswer) return fallbackAnswer;
    } catch (e) {
        console.error('Fallback Gemini model failed:', e);
    }

    return "Je suis Teymou. Je note votre question, mais ma connexion est instable. Reformulez ?";
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { question, history } = req.body;

    if (!question) {
        return res.status(400).json({ answer: "?" });
    }

    try {
        const answer = await callCognitiveAI(question, history);
        res.status(200).json({ answer });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ answer: "Erreur serveur." });
    }
}
