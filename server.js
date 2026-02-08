import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPV4 to avoid EHOSTUNREACH on IPv6
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

dotenv.config();

// Configuration Email
// Configuration Email - Force IPv4
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4 // Force IPv4
});

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const associationName = "PHOENIX ÉGALITÉ DES CHANCES";

// ==========================================
// 🧠 BASE DE DONNÉES STRUCTURÉE (DATA POINTS)
// ==========================================
const PHOENIX_DB = {
    general: `Phoenix Égalité des Chances (Phoenix EDC) est une association étudiante loi 1901 d'intérêt général, basée à Kedge Business School Marseille.\nCréation : 2011 (Racines 1998).\nMission : Tutorat, égalité des chances et ouverture culturelle pour les jeunes des Quartiers Prioritaires de la Ville (QPV).\nBénévoles : ~140 étudiants Kedge.\nBénéficiaires : ~300 jeunes/an.`,

    projets: [
        { keywords: ["om", "foot", "sport", "athlète", "campux", "commanderie", "sup d'om", "lise", "ilyes"], content: "Sup d'OM (Droit au Bac) : PROJET 100% SOUTIEN SCOLAIRE. C'est le seul projet uniquement dédié à l'aide aux devoirs (pas d'ouverture culturelle). Une dizaine de tuteurs se rendent au centre de formation de l'OM (la Commanderie) pour les mardis et jeudis soir. Chefs de Projet : Lise Dehedin et Ilyes Lounane." },
        { keywords: ["acse", "lycée", "bac", "excellence", "farah", "oumaima"], content: "A Chacun Son Excellence (ACSE) : PROJET CULTURE & ORIENTATION. Tutorat culturel et aide à l'orientation pour lycéens. Samedi après-midi à Kedge. Pas d'aide aux devoirs classique. Cheffes de Projet : Farah Dali et Oumaima Mghalfi." },
        { keywords: ["massa", "massabielle", "13", "brevet", "fabien", "idriss"], content: "MASSA 13 : PROJET HYBRIDE (Aide aux devoirs + Culture). Séance du jeudi soir : commence par l'aide aux devoirs individuel et finit par une ouverture culturelle. Chefs de Projet : Fabien Boles Franso ou Idriss Bahou." },
        { keywords: ["saint-gabriel", "gabriel", "social", "tessa", "eline"], content: "Projet St Gabriel : PROJET HYBRIDE. En plus du soutien scolaire, les tuteurs développent l'esprit critique via des débats. Cheffes de Projet : Tessa Valente et Eline Far." },
        { keywords: ["auteuil", "vitagliano", "apprenti", "clara"], content: "Projet Apprentis d'Auteuil : PROJET 100% OUVERTURE CULTURELLE. Pas d'aide aux devoirs. Séances sur thèmes d'actualité (Lundi/Vendredi). Cheffe de Projet : Clara Boudeville." },
        { keywords: ["izzo", "euro", "classe", "mizzó", "mizzo", "adel", "elsa"], content: "Mizzó (Collège Izzo) : PROJET HYBRIDE. Présentations culturelles ludiques et approfondies suivies d'échanges (Goûter). Chefs de Projet : Adel Bia et Elsa Ald." },
        { keywords: ["ferry", "jules", "oral", "powerpoint", "eloquence", "lou-ann", "nadège", "chelsea"], content: "Projet Jules Ferry : PROJET HYBRIDE. Mélange de soutien scolaire et d'ouverture culturelle (2 mercredis/mois). Cheffes de Projet : Lou-Ann Lapointe, Nadège Bavugilije et Chelsea Afonso de Barros." },
        { keywords: ["rimbaud", "arthur", "salwa"], content: "Projet Arthur Rimbaud : PROJET HYBRIDE. Mélange d'ouverture culturelle et d'aide aux devoirs les jeudis. Cheffe de Projet : Salwa Guernina." },
        { keywords: ["roy", "espagne", "nadir"], content: "Projet Roy d'Espagne : PROJET HYBRIDE. Alterne entre aide aux devoirs individuelle et ouverture culturelle collective le jeudi après-midi. Chef de Projet : Nadir Stiti." }
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
        { keywords: ["guide", "télécharger", "pdf", "document"], content: "Le document de référence est le 'Guide du Phoenicien'. Lien : http://localhost:5174/documents/Guide%20du%20phoenicien%202025-2026.pdf" },
        { keywords: ["fiche", "post", "récap"], content: "Les fiches récapitulatives sont dispo ici : http://localhost:5174/documents/fiches2posts%20Phoenix%20edc.pdf" }
    ],

    links: [
        { keywords: ["don", "argent", "soutenir", "helloasso"], content: "Pour faire un don défiscalisé, c'est ici : https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a" },
        { keywords: ["contact", "mail", "joindre"], content: "Contactez-nous via le formulaire du site ou par mail : phoenix@kedgebs.com" },
        { keywords: ["partenaire"], content: "Nos partenaires sont visibles sur la page : http://localhost:5174/partenaires" }
    ]
};

// ⚙️ ALGORITHME DE PRIORITÉ (Le "Truc" demandé par l'utilisateur)
function getTailoredContext(userQuestion) {
    const q = userQuestion.toLowerCase();
    let relevantFacts = [];

    // 1. Scan Projects
    PHOENIX_DB.projets.forEach(p => {
        if (p.keywords.some(k => q.includes(k))) relevantFacts.push("PROJET IMPLIQUÉ : " + p.content);
    });

    // 2. Scan Events
    PHOENIX_DB.events.forEach(e => {
        if (e.keywords.some(k => q.includes(k))) relevantFacts.push("ÉVÉNEMENT : " + e.content);
    });

    // 3. Scan Docs & Links (Haute Priorité)
    PHOENIX_DB.docs.forEach(d => {
        if (d.keywords.some(k => q.includes(k))) relevantFacts.push("RESSOURCE CLÉ : " + d.content);
    });
    PHOENIX_DB.links.forEach(l => {
        if (l.keywords.some(k => q.includes(k))) relevantFacts.push("LIEN UTILE : " + l.content);
    });

    // 4. Scan Bureau
    if (PHOENIX_DB.bureau) {
        PHOENIX_DB.bureau.forEach(b => {
            if (b.keywords.some(k => q.includes(k))) relevantFacts.push("MEMBRES DU BUREAU : " + b.content);
        });
    }

    // Construction du Prompt Système Dynamique
    let systemPrompt = `Tu es Teymou, l'assistant de ${associationName}.\n`;
    systemPrompt += `INFO GÉNÉRALE :\n${PHOENIX_DB.general}\n\n`;

    if (relevantFacts.length > 0) {
        systemPrompt += `⚠️ INFORMATIONS CRUCIALES POUR CETTE QUESTION (UTILISE-LES EN PRIORITÉ ABSOLUE) :\n`;
        relevantFacts.forEach(fact => systemPrompt += `- ${fact}\n`);
    } else {
        // Si pas de mot clé précis, on donne un résumé global pour éviter l'hallucination
        systemPrompt += "CONTEXTE GLOBAL : Phoenix gère 9 projets de tutorat à Marseille + des événements culturels. Utilise tes connaissances générales sur l'asso.";
    }

    systemPrompt += `\nINSTRUCTION : Tu es Teymou, la mascotte de Phoenix. Tu es chaleureux et un peu drôle.\n`;
    systemPrompt += `RÈGLES D'OR :\n`;
    systemPrompt += `1. NE TE PRÉSENTE PAS : Ne dis pas "Salut je suis Teymou" à chaque message. Réponds directement.\n`;
    systemPrompt += `2. DONS : Ne donne le lien HelloAsso QUE si on te parle de DONS, d'ARGENT ou de SOUTIEN FINANCIER.\n`;
    systemPrompt += `3. HUMOUR : Si on te pose une question personnelle (âge, projet préféré), réponds avec une blague en rapport avec l'asso (ex: "J'aime tous les projets comme mes enfants !" ou "Je suis né avec l'asso !").\n`;
    systemPrompt += `4. HORS-SUJET : Si ça ne parle pas de Phoenix, décline avec humour (ex: "Je suis pro en tutorat, pas en cuisine !").\n`;
    systemPrompt += `5. CONTENU : Sois concis. Base-toi uniquement sur les infos fournies. Ne jamais inventer de matières scolaires (maths, etc) si ce n'est pas spécifié.`;

    return systemPrompt;
}

// ==========================================
// 🧠 COGNITIVE AI LOGIC
// ==========================================
async function callCognitiveAI(question) {
    const token = process.env.HF_API_TOKEN;

    // 🔥 GÉNÉRATION DU CONTEXTE SUR-MESURE
    const dynamicContext = getTailoredContext(question);
    console.log("🧠 Contexte généré :", dynamicContext.split('\n')[3] || "Général");

    // 1. TENTATIVE PRINCIPALE : MIXTRAL (Art&Fakt)
    // Note : On remet le Header Authorization car sans ça il retourne 401 chez l'user aussi finalement. 
    // L'astuce "Gemma Token" est appliquée au fallback.
    try {
        const hfRes = await fetch('https://router.huggingface.co/hf-inference/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Token dynamique
            },
            body: JSON.stringify({
                inputs: `${dynamicContext}\n\nQuestion: ${question}\nRéponse:`,
                parameters: { max_new_tokens: 350, temperature: 0.5 } // Temp basse pour fidélité
            })
        });

        if (hfRes.ok) {
            const data = await hfRes.json();
            let text = data[0]?.generated_text || '';
            if (text.includes('Réponse:')) text = text.split('Réponse:')[1].trim();
            if (text.length > 2) return text;
        }
    } catch (e) { console.log('Mixtral Fail'); }

    // 2. FALLBACK : GEMINI (Clé Art&Fakt = Gemma)
    if (process.env.GEMINI_API_KEY) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `${dynamicContext}\nQuestion: ${question}` }] }] })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text.trim();
            }
        } catch (e) { }
    }

    // 3. FALLBACK CURL
    // 3. FALLBACK ULTIME : SYSTEM CURL (POLLINATIONS)
    try {
        const { exec } = await import('child_process');

        // On prépare un prompt court avec le contexte CRUCIAL seulement
        const relevantPart = dynamicContext.includes("CRUCIAL") ? dynamicContext.split("CRUCIAL")[1].split("INSTRUCTION")[0] : "";
        const finalPrompt = `Tu es Teymou. ${relevantPart}. Question: ${question}. Réponse courte:`;

        const safePrompt = finalPrompt.replace(/[^a-zA-Z0-9 àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ?.,!':/-]/g, "");
        const url = `https://text.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}`;

        console.log("☠️ Fallback Smart Curl...");

        return new Promise((resolve) => {
            exec(`curl -s --max-time 5 "${url}"`, (err, stdout) => {
                if (!err && stdout && stdout.length > 5 && !stdout.includes("Error")) {
                    resolve(stdout.trim());
                } else {
                    resolve("Je suis Teymou. Je note votre question, mais ma connexion est instable. Reformulez ?");
                }
            });
        });
    } catch (e) {
        return "Je suis Teymou. (Mode hors ligne)";
    }
}

app.post('/api/chat', async (req, res) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ answer: "?" });
    const answer = await callCognitiveAI(question);
    res.json({ answer: answer });
});

// 📧 ENDPOINT EMAIL (RECRUTEMENT / CONTACT / PARTENARIAT)
app.post('/api/send-email', async (req, res) => {
    const { category, name, firstName, lastName, email, role, subject, partnershipType, message, fullName } = req.body;

    if (!email || !message) {
        return res.status(400).json({ success: false, error: "Champs manquants" });
    }

    // Determine display name
    const displayName = fullName || name || (firstName && lastName ? `${firstName} ${lastName}` : 'Inconnu');

    // Build Specific Details Block based on Category
    let detailsHtml = '';
    if (category === 'recrutement' && role) {
        detailsHtml = `<p><strong>Poste visé :</strong> ${role}</p>`;
    } else if (category === 'information' && subject) {
        detailsHtml = `<p><strong>Sujet :</strong> ${subject}</p>`;
    } else if (category === 'partenariat' && partnershipType) {
        detailsHtml = `<p><strong>Type de Partenariat :</strong> ${partnershipType}</p>`;
    }

    try {
        // 1. Email pour l'admin
        const mailOptionsAdmin = {
            from: process.env.EMAIL_USER,
            to: 'phoenixedc.asso@gmail.com',
            subject: `[Phoenix Web] ${category.toUpperCase()} - ${displayName}`,
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background: #1A103C; padding: 20px; text-align: center;">
                        <h2 style="color: #fff; margin: 0; text-transform: uppercase; font-size: 18px; letter-spacing: 2px;">Nouvelle Demande</h2>
                    </div>
                    <div style="padding: 30px; background: #fff;">
                        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Catégorie</p>
                        <h3 style="color: #FF6B00; margin: 0 0 20px 0; font-size: 24px;">${category.toUpperCase()}</h3>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                            <p style="margin: 5px 0;"><strong>Nom :</strong> ${displayName}</p>
                            <p style="margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${email}" style="color: #666;">${email}</a></p>
                            ${detailsHtml}
                        </div>

                        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Message</p>
                        <blockquote style="background: #fff; padding: 15px; border-left: 4px solid #FF6B00; margin: 0; font-style: italic; color: #555; line-height: 1.6;">
                            "${message}"
                        </blockquote>
                    </div>
                    <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                        Envoyé depuis le site web Phoenix EDC
                    </div>
                </div>
            `
        };

        // 2. Accusé de réception pour l'utilisateur
        const mailOptionsUser = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Phoenix EDC - Nous avons bien reçu votre demande !`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #FF6B00;">Merci de nous avoir contactés !</h2>
                    <p>Bonjour <strong>${displayName}</strong>,</p>
                    <p>Nous confirmons la bonne réception de votre message concernant : <strong>${category}</strong>.</p>
                    <p>Notre équipe va traiter votre demande dans les plus brefs délais.</p>
                    <br>
                    <p>À très vite,</p>
                    <p><strong>L'équipe Phoenix Égalité des Chances</strong> 🦅</p>
                </div>
            `
        };

        // Envoi en parallèle
        await Promise.all([
            transporter.sendMail(mailOptionsAdmin),
            transporter.sendMail(mailOptionsUser)
        ]);

        console.log(`✅ Email envoyé pour ${category} de ${email}`);
        res.json({ success: true, message: "Email envoyé avec succès" });

    } catch (error) {
        console.error("❌ Erreur envoi email:", error);
        res.status(500).json({ success: false, error: "Erreur lors de l'envoi de l'email" });
    }
});

app.listen(port, () => {
    console.log(`🧠 Serveur TEYMOU (ALGORITHME PRIORITAIRE) lancé sur http://localhost:${port}`);
});
