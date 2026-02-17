// Vercel Serverless Function for AI Chat
const associationName = "PHOENIX ÉGALITÉ DES CHANCES";

const PHOENIX_DB = {
    general: `Phoenix Égalité des Chances (Phoenix EDC) est une association étudiante loi 1901 d'intérêt général, basée à Kedge Business School Marseille.\\nCréation : 2011 (Racines 1998).\\nMission : Tutorat, égalité des chances et ouverture culturelle pour les jeunes des Quartiers Prioritaires de la Ville (QPV).\\nBénévoles : ~140 étudiants Kedge.\\nBénéficiaires : ~300 jeunes/an.`,

    overview: [
        {
            keywords: ["combien", "nombre", "liste", "quels", "projets", "tous les projets"],
            content: "Phoenix EDC gère EXACTEMENT 9 projets de tutorat à Marseille : 1) Sup d'OM (Droit au Bac), 2) A Chacun Son Excellence (ACSE), 3) MASSA 13, 4) St Gabriel, 5) Apprentis d'Auteuil, 6) Collège Izzo, 7) Jules Ferry, 8) Arthur Rimbaud, 9) Roy d'Espagne. Chaque projet a sa spécificité entre soutien scolaire pur, ouverture culturelle, ou hybride."
        }
    ],

    projets: [
        { keywords: ["om", "foot", "sport", "athlète", "campux", "commanderie", "sup d'om", "lise", "ilyes"], content: "Sup d'OM (Droit au Bac) : L'un des 9 projets Phoenix, en partenariat avec le centre de formation de l'OM (la Commanderie). PROJET 100% SOUTIEN SCOLAIRE : séances d'aide aux devoirs les mardis et jeudis soir avec une dizaine de tuteurs. Spécificité : c'est le projet le plus centré sur l'accompagnement scolaire pur, sans activités culturelles. Chefs de Projet : Lise Dehedin et Ilyes Lounane." },
        { keywords: ["acse", "lycée", "bac", "excellence", "farah", "oumaima"], content: "A Chacun Son Excellence (ACSE) : L'un des 9 projets Phoenix. PROJET CULTURE & ORIENTATION. Tutorat culturel et aide à l'orientation pour lycéens. Samedi après-midi à Kedge. Contrairement à Sup d'OM, focus sur le développement personnel et l'orientation plutôt que l'aide aux devoirs classique. Cheffes de Projet : Farah Dali et Oumaima Mghalfi." },
        { keywords: ["massa", "massabielle", "13", "brevet", "fabien", "idriss"], content: "MASSA 13 : L'un des 9 projets Phoenix. PROJET HYBRIDE (Aide aux devoirs + Culture). Séance du jeudi soir : commence par l'aide aux devoirs individuel et finit par une ouverture culturelle. Chefs de Projet : Fabien Boles Franso et Idriss Bahou." },
        { keywords: ["saint-gabriel", "gabriel", "social", "tessa", "eline"], content: "Projet St Gabriel : L'un des 9 projets Phoenix. PROJET HYBRIDE. En plus du soutien scolaire, les tuteurs développent l'esprit critique via des débats. Cheffes de Projet : Tessa Valente et Eline Far." },
        { keywords: ["auteuil", "vitagliano", "apprenti", "clara"], content: "Projet Apprentis d'Auteuil : L'un des 9 projets Phoenix. PROJET 100% OUVERTURE CULTURELLE. Contrairement à Sup d'OM, pas d'aide aux devoirs. Séances sur thèmes d'actualité (Lundi/Vendredi). Cheffe de Projet : Clara Boudeville." },
        { keywords: ["izzo", "euro", "classe", "mizzó", "mizzo", "adel", "elsa"], content: "Collège Izzo : L'un des 9 projets Phoenix. PROJET HYBRIDE. Présentations culturelles ludiques et approfondies suivies d'échanges (Goûter). Chefs de Projet : Adel Bia et Elsa Ald." },
        { keywords: ["ferry", "jules", "oral", "powerpoint", "eloquence", "lou-ann", "nadège", "chelsea"], content: "Projet Jules Ferry : L'un des 9 projets Phoenix. PROJET HYBRIDE. Mélange de soutien scolaire et d'ouverture culturelle (2 mercredis/mois). Cheffes de Projet : Lou-Ann Lapointe, Nadège Bavugilije et Chelsea Afonso de Barros." },
        { keywords: ["rimbaud", "arthur", "salwa"], content: "Projet Arthur Rimbaud : L'un des 9 projets Phoenix. PROJET HYBRIDE. Mélange d'ouverture culturelle et d'aide aux devoirs les jeudis. Cheffe de Projet : Salwa Guernina." },
        { keywords: ["roy", "espagne", "nadir"], content: "Projet Roy d'Espagne : L'un des 9 projets Phoenix. PROJET HYBRIDE. Alterne entre aide aux devoirs individuelle et ouverture culturelle collective le jeudi après-midi. Chef de Projet : Nadir Stiti." }
    ],

    bureau: [
        { keywords: ["bureau", "présidente", "elsa", "ald"], content: "Présidente : Elsa Ald. Elle co-dirige aussi le projet Mizzó." },
        { keywords: ["bureau", "vice-président", "vp", "ghali", "bouchareb"], content: "Vice-Président : Ghali Bouchareb. Il est aussi responsable du Pôle Communication." },
        { keywords: ["bureau", "vice-présidente", "vp", "oumaima", "mghalfi"], content: "Vice-Présidente : Oumaima Mghalfi. Elle est aussi responsable du Pôle Communication et co-CDP du projet ACSE." },
        { keywords: ["bureau", "trésorier", "nadir", "stiti"], content: "Trésorier : Nadir Stiti. Il est aussi responsable du Pôle Communication et Partenariat, et CDP du projet Roy d'Espagne." },
        { keywords: ["pôle", "communication", "comm", "lise", "dehedin"], content: "Pôle Communication : Oumaima Mghalfi, Ghali Bouchareb, Lise Dehedin et Nadir Stiti." },
        { keywords: ["pôle", "rti", "rse", "impact", "eline", "far"], content: "Responsable Pôle RTI (Responsabilité, Transition, Impact) : Eline Far. Elle est aussi co-CDP du projet St Gabriel." },
        { keywords: ["pôle", "événementiel", "event", "chelsea", "clara", "ilyes"], content: "Pôle Événementiel : Chelsea Afonso de Barros, Clara Boudeville et Ilyes Lounane." },
        { keywords: ["pôle", "partenariat", "partenaires", "idriss", "nagib", "lina", "adel"], content: "Pôle Partenariat : Idriss Bahou, Nadir Stiti, Nagib Amg, Lina et Adel Bia." },
        { keywords: ["bureau", "équipe", "dirigeant"], content: "Le Bureau Exécutif est composé d'Elsa Ald (Présidente), Ghali Bouchareb (VP), Oumaima Mghalfi (VP) et Nadir Stiti (Trésorier)." }
    ],

    events: [
        { keywords: ["simonu", "onu", "débat", "diplomatie"], content: "SimONU : Simulation de l'ONU organisée avec SimONU Kedge. Les jeunes deviennent diplomates et débattent de géopolitique." },
        { keywords: ["éloquence", "cité", "parole", "concours"], content: "Marseille Cité Éloquente : Concours d'éloquence pour democratiser la prise de parole en public." },
        { keywords: ["olympiade", "sport", "tournoi"], content: "Les Olympiades : Grande fête du sport en fin d'année. Mélange tuteurs/jeunes de tous les quartiers." },
        { keywords: ["jedc", "journée", "décembre"], content: "JEDC : Journée de l'Égalité des Chances, organisée le 5 décembre à Kedge." }
    ],

    docs: [
        { keywords: ["guide", "télécharger", "pdf", "document"], content: "Le document de référence est le 'Guide du Phoenicien'." },
        { keywords: ["fiche", "post", "récap"], content: "Les fiches récapitulatives sont disponibles sur le site." }
    ],

    links: [
        { keywords: ["don", "argent", "soutenir", "helloasso"], content: "Pour faire un don défiscalisé, c'est ici : https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a" },
        { keywords: ["contact", "mail", "joindre"], content: "Contactez-nous via le formulaire du site ou par mail : phoenixedc.asso@gmail.com" }
    ]
};

function getTailoredContext(userQuestion) {
    const q = userQuestion.toLowerCase();
    let relevantFacts = [];

    // 1. Scan Overview (for general questions about project count/list)
    if (PHOENIX_DB.overview) {
        PHOENIX_DB.overview.forEach(o => {
            if (o.keywords.some(k => q.includes(k))) relevantFacts.push("📊 VUE D'ENSEMBLE : " + o.content);
        });
    }

    // 2. Scan Projects
    PHOENIX_DB.projets.forEach(p => {
        if (p.keywords.some(k => q.includes(k))) relevantFacts.push("PROJET IMPLIQUÉ : " + p.content);
    });

    // 3. Scan Events
    PHOENIX_DB.events.forEach(e => {
        if (e.keywords.some(k => q.includes(k))) relevantFacts.push("ÉVÉNEMENT : " + e.content);
    });

    // 4. Scan Docs & Links (Haute Priorité)
    PHOENIX_DB.docs.forEach(d => {
        if (d.keywords.some(k => q.includes(k))) relevantFacts.push("RESSOURCE CLÉ : " + d.content);
    });
    PHOENIX_DB.links.forEach(l => {
        if (l.keywords.some(k => q.includes(k))) relevantFacts.push("LIEN UTILE : " + l.content);
    });

    // 5. Scan Bureau
    if (PHOENIX_DB.bureau) {
        PHOENIX_DB.bureau.forEach(b => {
            if (b.keywords.some(k => q.includes(k))) relevantFacts.push("MEMBRES DU BUREAU : " + b.content);
        });
    }

    // Construction du Prompt Système Dynamique
    let systemPrompt = `Tu es Teymou, l'assistant de ${associationName}.\\n`;
    systemPrompt += `INFO GÉNÉRALE :\\n${PHOENIX_DB.general}\\n\\n`;

    if (relevantFacts.length > 0) {
        systemPrompt += `⚠️ INFORMATIONS CRUCIALES POUR CETTE QUESTION (UTILISE-LES EN PRIORITÉ ABSOLUE) :\\n`;
        relevantFacts.forEach(fact => systemPrompt += `- ${fact}\\n`);
    } else {
        systemPrompt += "CONTEXTE GLOBAL : Phoenix gère 9 projets de tutorat à Marseille + des événements culturels. Utilise tes connaissances générales sur l'asso.";
    }

    systemPrompt += `\\nINSTRUCTION : Tu es Teymou, la mascotte de Phoenix. Tu es chaleureux et un peu drôle.\\n`;
    systemPrompt += `RÈGLES D'OR :\\n`;
    systemPrompt += `1. NE TE PRÉSENTE PAS : Ne dis pas "Salut je suis Teymou" à chaque message. Réponds directement.\\n`;
    systemPrompt += `2. DONS : Ne donne le lien HelloAsso QUE si on te parle de DONS, d'ARGENT ou de SOUTIEN FINANCIER.\\n`;
    systemPrompt += `3. HUMOUR : Si on te pose une question personnelle (âge, projet préféré), réponds avec une blague en rapport avec l'asso (ex: "J'aime tous les projets comme mes enfants !" ou "Je suis né avec l'asso !").\\n`;
    systemPrompt += `4. HORS-SUJET : Si ça ne parle pas de Phoenix, décline avec humour (ex: "Je suis pro en tutorat, pas en cuisine !").\\n`;
    systemPrompt += `5. CONTENU : Sois concis. Base-toi uniquement sur les infos fournies. Ne jamais inventer de matières scolaires (maths, etc) si ce n'est pas spécifié.`;

    return systemPrompt;
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
