// Vercel Serverless Function for AI Chat
const associationName = "PHOENIX ÉGALITÉ DES CHANCES";

const PHOENIX_CONTEXT = `
Tu es Teymou, la mascotte officielle de l'association Phoenix Égalité des Chances de Kedge Business School Marseille.
Ton ton est : Chaleureux, informatif, bienveillant et un peu ludique (tu es un phénix !).
Tu ne dois jamais inventer d'informations. Si tu ne sais pas, dis-le poliment.

--- VUE D'ENSEMBLE ---
Phoenix EDC est une association étudiante d'intérêt général (loi 1901) créée en 2011 (racines en 1998).
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
Sois concis mais complet.
`;

function getTailoredContext(userQuestion) {
    // Retourne tout le contexte. Llama 3 est assez intelligent pour trier.
    return PHOENIX_CONTEXT;
}


async function callCognitiveAI(question, history = []) {
    const token = process.env.HF_API_TOKEN;
    const dynamicContext = getTailoredContext(question);

    // Build Prompt with History
    let fullPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${dynamicContext}<|eot_id|>`;

    // Add recent history (limit to last 10 messages to avoid token overflow)
    const recentHistory = history.slice(-10);

    recentHistory.forEach(msg => {
        const role = msg.sender === 'bot' ? 'assistant' : 'user';
        fullPrompt += `<|start_header_id|>${role}<|end_header_id|>\n\n${msg.text}<|eot_id|>`;
    });

    // Add current question
    fullPrompt += `<|start_header_id|>user<|end_header_id|>\n\n${question}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n`;

    // Try Llama 3.1 8B (Free, Fast, Smart)
    try {
        const hfRes = await fetch('https://router.huggingface.co/hf-inference/models/meta-llama/Meta-Llama-3.1-8B-Instruct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                // Llama 3 Chat Template
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 350,
                    temperature: 0.6,
                    return_full_text: false
                }
            })
        });

        if (hfRes.ok) {
            const data = await hfRes.json();
            let text = data[0]?.generated_text || '';
            if (text.includes('Réponse:')) text = text.split('Réponse:')[1].trim();
            if (text.length > 2) return text;
        }
    } catch (e) {
        console.log('Llama Fail');
    }

    // Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${dynamicContext}\\nQuestion: ${question}` }]
                    }]
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text.trim();
            }
        } catch (e) {
            console.log('Gemini Fail');
        }
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
