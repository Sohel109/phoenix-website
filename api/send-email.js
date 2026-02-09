// Vercel Serverless Function for Email Sending
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

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
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { category, name, firstName, lastName, email, role, subject, partnershipType, message, fullName } = req.body;

    if (!email || !message) {
        return res.status(400).json({ success: false, error: "Champs manquants" });
    }

    const displayName = fullName || name || (firstName && lastName ? `${firstName} ${lastName}` : 'Inconnu');

    let detailsHtml = '';
    if (category === 'recrutement' && role) {
        detailsHtml = `<p><strong>Poste visé :</strong> ${role}</p>`;
    } else if (category === 'information' && subject) {
        detailsHtml = `<p><strong>Sujet :</strong> ${subject}</p>`;
    } else if (category === 'partenariat' && partnershipType) {
        detailsHtml = `<p><strong>Type de Partenariat :</strong> ${partnershipType}</p>`;
    }

    try {
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

        await Promise.all([
            transporter.sendMail(mailOptionsAdmin),
            transporter.sendMail(mailOptionsUser)
        ]);

        console.log(`✅ Email envoyé pour ${category} de ${email}`);
        res.status(200).json({ success: true, message: "Email envoyé avec succès" });

    } catch (error) {
        console.error("❌ Erreur envoi email:", error);
        res.status(500).json({ success: false, error: "Erreur lors de l'envoi de l'email" });
    }
}
