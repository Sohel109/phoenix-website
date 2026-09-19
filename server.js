import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Force IPV4 to avoid EHOSTUNREACH on IPv6
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

// Configuration Email - Force IPv4
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4 // Force IPv4
});

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ─── Gestion de l'équipe du Bureau (Persistance locale pour Git) ─────────────

// GET /api/team/members
app.get('/api/team/members', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'src', 'data', 'bureauMembers.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return res.json({ success: true, members: JSON.parse(data) });
        }
        return res.json({ success: true, members: [] });
    } catch (err) {
        console.error('Erreur lecture membres:', err);
        return res.status(500).json({ success: false, error: 'Impossible de lire les membres' });
    }
});

// POST /api/team/members
app.post('/api/team/members', (req, res) => {
    try {
        const { members } = req.body;
        if (!Array.isArray(members)) {
            return res.status(400).json({ success: false, error: 'Format invalide: members doit être un tableau' });
        }

        const teamImagesDir = path.join(__dirname, 'public', 'images', 'team');
        if (!fs.existsSync(teamImagesDir)) {
            fs.mkdirSync(teamImagesDir, { recursive: true });
        }

        // Traitement des photos si envoyées en base64
        const processedMembers = members.map((member) => {
            if (member.photo && typeof member.photo === 'string' && member.photo.startsWith('data:image/')) {
                const match = member.photo.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
                if (match) {
                    let ext = match[1].toLowerCase();
                    if (ext === 'jpeg') ext = 'jpg';
                    if (ext === 'svg+xml') ext = 'svg';
                    const base64Data = match[2];
                    const safeId = (member.id || 'member').replace(/[^a-zA-Z0-9-_]/g, '');
                    const filename = `${safeId}-${Date.now()}.${ext}`;
                    const targetFile = path.join(teamImagesDir, filename);

                    fs.writeFileSync(targetFile, Buffer.from(base64Data, 'base64'));
                    console.log(`📸 Photo sauvegardée pour ${member.firstName} ${member.lastName}: /images/team/${filename}`);
                    return {
                        ...member,
                        photo: `/images/team/${filename}`
                    };
                }
            }
            return member;
        });

        // Écriture dans src/data/bureauMembers.json
        const dataFilePath = path.join(__dirname, 'src', 'data', 'bureauMembers.json');
        fs.writeFileSync(dataFilePath, JSON.stringify(processedMembers, null, 2), 'utf-8');
        console.log(`💾 ${processedMembers.length} membres enregistrés dans src/data/bureauMembers.json`);

        return res.json({
            success: true,
            message: 'Membres enregistrés avec succès dans le fichier du projet',
            members: processedMembers
        });
    } catch (err) {
        console.error('Erreur sauvegarde membres:', err);
        return res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde' });
    }
});

// GET /api/team/poles
app.get('/api/team/poles', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'src', 'data', 'poles.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return res.json({ success: true, poles: JSON.parse(data) });
        }
        return res.json({ success: true, poles: [] });
    } catch (err) {
        console.error('Erreur lecture pôles:', err);
        return res.status(500).json({ success: false, error: 'Impossible de lire les pôles' });
    }
});

// POST /api/team/poles
app.post('/api/team/poles', (req, res) => {
    try {
        const { poles } = req.body;
        if (!Array.isArray(poles)) {
            return res.status(400).json({ success: false, error: 'Format invalide: poles doit être un tableau' });
        }
        const dataFilePath = path.join(__dirname, 'src', 'data', 'poles.json');
        fs.writeFileSync(dataFilePath, JSON.stringify(poles, null, 2), 'utf-8');
        console.log(`💾 ${poles.length} pôles enregistrés dans src/data/poles.json`);
        return res.json({ success: true, message: 'Pôles mis à jour avec succès', poles });
    } catch (err) {
        console.error('Erreur sauvegarde pôles:', err);
        return res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde des pôles' });
    }
});

// GET /api/planning/manual-hours
app.get('/api/planning/manual-hours', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'src', 'data', 'manualHours.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return res.json({ success: true, manualHours: JSON.parse(data) });
        }
        return res.json({ success: true, manualHours: [] });
    } catch (err) {
        console.error('Erreur lecture heures manuelles:', err);
        return res.status(500).json({ success: false, error: 'Impossible de lire les heures manuelles' });
    }
});

// POST /api/planning/manual-hours
app.post('/api/planning/manual-hours', (req, res) => {
    try {
        const { manualHours } = req.body;
        if (!Array.isArray(manualHours)) {
            return res.status(400).json({ success: false, error: 'Format invalide: manualHours doit être un tableau' });
        }
        const dataFilePath = path.join(__dirname, 'src', 'data', 'manualHours.json');
        fs.writeFileSync(dataFilePath, JSON.stringify(manualHours, null, 2), 'utf-8');
        console.log(`⏱️ ${manualHours.length} entrées d\'heures manuelles enregistrées`);
        return res.json({ success: true, message: 'Heures manuelles mises à jour', manualHours });
    } catch (err) {
        console.error('Erreur sauvegarde heures manuelles:', err);
        return res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde des heures manuelles' });
    }
});

// ─── Exemptions de quota / Membres renouvelants (Persistance locale) ─────────

// GET /api/planning/exemptions
app.get('/api/planning/exemptions', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'src', 'data', 'exemptions.json');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            return res.json({ success: true, exemptions: JSON.parse(data) });
        }
        return res.json({ success: true, exemptions: [] });
    } catch (err) {
        console.error('Erreur lecture exemptions:', err);
        return res.status(500).json({ success: false, error: 'Impossible de lire les exemptions' });
    }
});

// POST /api/planning/exemptions
app.post('/api/planning/exemptions', (req, res) => {
    try {
        const { exemptions } = req.body;
        if (!Array.isArray(exemptions)) {
            return res.status(400).json({ success: false, error: 'Format invalide: exemptions doit être un tableau' });
        }
        const dataFilePath = path.join(__dirname, 'src', 'data', 'exemptions.json');
        fs.writeFileSync(dataFilePath, JSON.stringify(exemptions, null, 2), 'utf-8');
        console.log(`🎓 ${exemptions.length} exemptions de quota enregistrées`);
        return res.json({ success: true, message: 'Exemptions mises à jour', exemptions });
    } catch (err) {
        console.error('Erreur sauvegarde exemptions:', err);
        return res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde des exemptions' });
    }
});


// 🛡️ Rate Limiter en mémoire (sécurisation anti-spam et anti-bruteforce)
function createRateLimiter({ windowMs, maxRequests, message }) {
    const requests = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [ip, timestamps] of requests.entries()) {
            const valid = timestamps.filter(t => now - t < windowMs);
            if (valid.length === 0) {
                requests.delete(ip);
            } else {
                requests.set(ip, valid);
            }
        }
    }, 5 * 60 * 1000).unref();

    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const timestamps = (requests.get(ip) || []).filter(t => now - t < windowMs);

        if (timestamps.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: message || 'Trop de requêtes, veuillez patienter avant de réessayer.'
            });
        }

        timestamps.push(now);
        requests.set(ip, timestamps);
        next();
    };
}

const loginLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 15,
    message: 'Trop de tentatives de connexion. Veuillez patienter une minute avant de réessayer.'
});

const emailLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
    message: 'Trop de messages envoyés. Veuillez patienter avant de renouveler votre demande.'
});

// 🛡️ Utilitaires d'assainissement
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sanitizeSubject(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[\r\n]/g, ' ').trim().slice(0, 100);
}


// 🗓️ ENDPOINT PLANNING (PROXY VERS GOOGLE APPS SCRIPT)
app.get('/api/planning', async (req, res) => {
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyMsp23ni8GWsIVXrj8xuBpjLLNgqRsxlsyEBWmQt4xAlKDBHzLqXtKW5vAdzMESMeXg/exec";
    try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getPlanningData`);
        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: 'Erreur HTTP de Google Apps Script' });
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur proxy get planning:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la récupération du planning' });
    }
});

app.post('/api/planning', async (req, res) => {
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyMsp23ni8GWsIVXrj8xuBpjLLNgqRsxlsyEBWmQt4xAlKDBHzLqXtKW5vAdzMESMeXg/exec";
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: 'Erreur HTTP de Google Apps Script' });
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur proxy post planning:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la mise à jour du planning' });
    }
});

// 🔐 ENDPOINT LOGIN (PROXY VERS GOOGLE APPS SCRIPT)
app.get('/api/login', async (req, res) => {
    const { action } = req.query;
    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyMsp23ni8GWsIVXrj8xuBpjLLNgqRsxlsyEBWmQt4xAlKDBHzLqXtKW5vAdzMESMeXg/exec";

    if (action === 'listUsers') {
        try {
            const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=listUsers`);
            if (!response.ok) return res.status(response.status).json({ success: false });
            const data = await response.json();
            return res.status(200).json(data);
        } catch (error) {
            console.error('Erreur proxy listUsers:', error);
            return res.status(500).json({ success: false });
        }
    }
    return res.status(405).json({ error: 'Method not allowed' });
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ success: false, message: 'Identifiants manquants' });
    }

    const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyMsp23ni8GWsIVXrj8xuBpjLLNgqRsxlsyEBWmQt4xAlKDBHzLqXtKW5vAdzMESMeXg/exec";

    try {
        // En local, on utilise node-fetch pour interroger Google Apps Script
        let response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ login: login.trim(), password: password.trim() }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });

        if (!response.ok) {
            return res.status(response.status).json({ success: false, message: 'Erreur HTTP de Google Apps Script' });
        }

        let data = await response.json();

        // Si échec, tentative automatique avec un \t (au cas où une tabulation a été insérée dans Google Sheets)
        if (!data.success) {
            const retryResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ login: login.trim() + '\t', password: password.trim() }),
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
            if (retryResponse.ok) {
                try {
                    const retryData = await retryResponse.json();
                    if (retryData.success) {
                        data = retryData;
                    }
                } catch (e) {}
            }
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Erreur proxy login:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion' });
    }
});

// 📧 ENDPOINT EMAIL (RECRUTEMENT / CONTACT / PARTENARIAT)
app.post('/api/send-email', emailLimiter, async (req, res) => {
    const { category, name, firstName, lastName, email, role, subject, partnershipType, message, fullName } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, error: "Adresse email invalide" });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ success: false, error: "Message manquant" });
    }

    // Determine and sanitize display name
    const rawDisplayName = fullName || name || (firstName && lastName ? `${firstName} ${lastName}` : 'Inconnu');
    const safeDisplayName = escapeHtml(rawDisplayName);
    const safeCategory = escapeHtml(category || 'CONTACT');
    const safeCategoryUpper = safeCategory.toUpperCase();
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br>');

    // Build Specific Details Block based on Category with HTML escaping
    let detailsHtml = '';
    if (category === 'recrutement' && role) {
        detailsHtml = `<p><strong>Poste visé :</strong> ${escapeHtml(role)}</p>`;
    } else if (category === 'information' && subject) {
        detailsHtml = `<p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>`;
    } else if (category === 'partenariat' && partnershipType) {
        detailsHtml = `<p><strong>Type de Partenariat :</strong> ${escapeHtml(partnershipType)}</p>`;
    }

    const safeAdminSubject = sanitizeSubject(`[Phoenix Web] ${safeCategoryUpper} - ${rawDisplayName}`);

    try {
        // 1. Email pour l'admin
        const mailOptionsAdmin = {
            from: process.env.EMAIL_USER,
            to: 'phoenixedc.asso@gmail.com',
            subject: safeAdminSubject,
            html: `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background: #1A103C; padding: 20px; text-align: center;">
                        <h2 style="color: #fff; margin: 0; text-transform: uppercase; font-size: 18px; letter-spacing: 2px;">Nouvelle Demande</h2>
                    </div>
                    <div style="padding: 30px; background: #fff;">
                        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Catégorie</p>
                        <h3 style="color: #FF6B00; margin: 0 0 20px 0; font-size: 24px;">${safeCategoryUpper}</h3>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
                            <p style="margin: 5px 0;"><strong>Nom :</strong> ${safeDisplayName}</p>
                            <p style="margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${safeEmail}" style="color: #666;">${safeEmail}</a></p>
                            ${detailsHtml}
                        </div>

                        <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Message</p>
                        <blockquote style="background: #fff; padding: 15px; border-left: 4px solid #FF6B00; margin: 0; font-style: italic; color: #555; line-height: 1.6;">
                            ${safeMessage}
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
            to: email.trim(),
            subject: `Phoenix EDC - Nous avons bien reçu votre demande !`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #FF6B00;">Merci de nous avoir contactés !</h2>
                    <p>Bonjour <strong>${safeDisplayName}</strong>,</p>
                    <p>Nous confirmons la bonne réception de votre message concernant : <strong>${safeCategory}</strong>.</p>
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
    console.log(`🚀 Serveur API Phoenix lancé sur http://localhost:${port}`);
});
