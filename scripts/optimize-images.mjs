import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), 'public');

// ── Groupe A : conversion WebP (jamais utilisées comme og:image) ──
// [cheminRelatifPublic, maxWidth, quality]
const WEBP_TARGETS = [
    // Hero
    ['/images/projects/hero-1.png', 900, 80],
    ['/images/projects/hero-3.png', 400, 80],
    // Filigrane (texture tuilée à 5-7% opacité)
    ['/assets/phoenix-pattern.png', 450, 68],
    // Logos de projets (badges ~44-80px, un peu de marge retina)
    ['/images/projects/acse-logo.png', 400, 85],
    ['/images/projects/arthur-rimbaud-logo.png', 400, 85],
    ['/images/projects/izzo-logo.png', 400, 85],
    ['/images/projects/jules-ferry-logo.png', 400, 85],
    ['/images/projects/massa-13-logo.png', 400, 85],
    ['/images/projects/roy-despagne-logo.png', 400, 85],
    ['/images/projects/saint-gabriel-logo.png', 400, 85],
    ['/images/projects/apprentis-auteuil.png', 400, 85],
    ['/images/projects/sup-d-om-clean-logo.jpg', 400, 85],
    // Logos partenaires
    ['/partners/om.png', 500, 85],
    ['/partners/kedge.png', 500, 85],
    ['/partners/decathlon.png', 500, 85],
    ['/partners/apprentis-auteuil.png', 500, 85],
    ['/partners/darty.png', 500, 85],
    ['/partners/lydia.png', 500, 85],
    ['/partners/lexpress.png', 500, 85],
    ['/partners/deloitte.jpg', 500, 85],
    // Photos home / carrousels
    ['/images/home/voyage-culturel-1.jpg', 1000, 78],
    ['/images/home/voyage-culturel-3.jpg', 1000, 78],
    ['/images/home/tutorat-hebdo-terrain.jpg', 1000, 78],
    ['/images/home/jedc-discours.png', 1000, 78],
    // Événements (hors headerImage/og:image)
    ['/images/events/olympiades-new.png', 900, 78],
    ['/images/events/jedc/affiche_2024.png', 900, 78],
    ['/images/events/jedc/programme_2024.png', 900, 78],
    ['/images/events/simonu/simonu-group-argentine.jpg', 900, 78],
    ['/images/events/simonu/simonu-speaker.jpg', 900, 78],
    ['/images/events/simonu/img1.png', 900, 78],
    ['/images/events/simonu/img2.png', 900, 78],
    ['/images/events/simonu/img3.png', 900, 78],
    ['/images/events/olympiades/olympiades-group-1.png', 900, 78],
    ['/images/events/olympiades/olympiades-group-2.jpg', 900, 78],
    ['/images/events/olympiades/olympiades-group-3.jpg', 900, 78],
    ['/images/events/olympiades/img1.png', 900, 78],
    ['/images/events/olympiades/img2.png', 900, 78],
    // Équipe
    ['/images/team/elyas-1789646120940.jpg', 400, 82],
    ['/images/team/lina-1789646076510.jpg', 400, 82],
    ['/images/team/ryan-1789646022585.jpg', 400, 82],
    ['/images/team/samir-1789645967909.jpg', 400, 82],
    ['/images/team/samy-rabhi-1789645941754.jpg', 400, 82],
];

// ── Groupe B : conservation du format d'origine (utilisées en og:image) ──
// Juste redimensionnées + recompressées, jamais converties.
const REENCODE_SAME_FORMAT_TARGETS = [
    ['/images/banners/acse-banner-v2.jpg', 1200, 78],
    ['/images/banners/apprentis-auteuil-banner-new.jpg', 1200, 78],
    ['/images/banners/arthur-rimbaud-banner-new.png', 1200, 78],
    ['/images/banners/izzo-banner-new.jpg', 1200, 78],
    ['/images/banners/jules-ferry-banner-new.jpg', 1200, 78],
    ['/images/banners/massa-13-banner-new.jpg', 1200, 78],
    ['/images/banners/roy-despagne-banner-new.png', 1200, 78],
    ['/images/banners/saint-gabriel-new.jpeg', 1200, 78],
    ['/images/banners/sup-d-om-banner-white.jpg', 1200, 78],
    ['/images/events/jedc-new.png', 1200, 78],
    ['/images/events/entretiens-excellence.png', 1200, 78],
    ['/images/events/simonu-new.jpg', 1200, 78],
    ['/images/home/voyage-culturel-2.jpg', 1200, 78],
    ['/images/events/olympiades-banner-new.jpg', 1200, 78],
    ['/images/events/ceremonie-fin-parcours.jpg', 1200, 78],
];

let totalBefore = 0;
let totalAfter = 0;

async function convertToWebp(relPath, maxWidth, quality) {
    const srcPath = path.join(ROOT, relPath);
    const destPath = srcPath.replace(/\.(png|jpe?g)$/i, '.webp');
    const before = (await fs.stat(srcPath)).size;

    await sharp(srcPath)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality })
        .toFile(destPath);

    const after = (await fs.stat(destPath)).size;
    totalBefore += before;
    totalAfter += after;
    console.log(`WEBP  ${relPath} -> ${path.basename(destPath)}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);

    await fs.unlink(srcPath);
}

async function reencodeSameFormat(relPath, maxWidth, quality) {
    const srcPath = path.join(ROOT, relPath);
    const ext = path.extname(srcPath).toLowerCase();
    const before = (await fs.stat(srcPath)).size;

    const tmpPath = srcPath + '.tmp';
    let pipeline = sharp(srcPath).resize({ width: maxWidth, withoutEnlargement: true });

    if (ext === '.png') {
        pipeline = pipeline.png({ quality, compressionLevel: 9, palette: true });
    } else {
        // .jpg / .jpeg
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    await pipeline.toFile(tmpPath);
    const after = (await fs.stat(tmpPath)).size;

    if (after < before) {
        await fs.rename(tmpPath, srcPath);
        totalBefore += before;
        totalAfter += after;
        console.log(`SAME  ${relPath}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
    } else {
        await fs.unlink(tmpPath);
        totalBefore += before;
        totalAfter += before;
        console.log(`SAME  ${relPath}  déjà optimale, conservée (${(before / 1024).toFixed(0)}KB)`);
    }
}

for (const [relPath, maxWidth, quality] of WEBP_TARGETS) {
    try {
        await convertToWebp(relPath, maxWidth, quality);
    } catch (e) {
        console.error(`ERREUR sur ${relPath}:`, e.message);
    }
}

for (const [relPath, maxWidth, quality] of REENCODE_SAME_FORMAT_TARGETS) {
    try {
        await reencodeSameFormat(relPath, maxWidth, quality);
    } catch (e) {
        console.error(`ERREUR sur ${relPath}:`, e.message);
    }
}

console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)} Mo -> ${(totalAfter / 1024 / 1024).toFixed(2)} Mo (gain ${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}%)`);
