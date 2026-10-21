// Génère, après `vite build`, un HTML statique par page publique (titre, description, canonical,
// JSON-LD et contenu texte). Sans cela, les robots qui n'exécutent pas JavaScript (la plupart des
// robots d'IA) ne voient qu'un squelette vide identique pour toutes les URLs.
// React remplace ce contenu au chargement (createRoot, pas d'hydratation).
// En cas d'échec, le script n'interrompt jamais le build : le site reste un SPA classique.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const SITE = 'https://www.phoenix-egalite-des-chances.com';

const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
    ['/', 'Accueil'],
    ['/association', "L'association"],
    ['/projets', 'Nos projets'],
    ['/soutien-scolaire-marseille', 'Soutien scolaire à Marseille'],
    ['/evenements', 'Événements'],
    ['/partenaires', 'Partenaires'],
    ['/transparence', 'Transparence et dons'],
    ['/documents', 'Documents'],
    ['/contact', 'Contact'],
];

const p = (text) => `<p>${esc(text)}</p>`;
const link = (href, label) => `<a href="${href}">${esc(label)}</a>`;

// Le script inline retire le contenu pré-rendu avant le premier affichage si l'URL ne correspond pas à la page
// générée : les routes qui retombent sur dist/index.html (planning, 404...) ne montrent ainsi jamais le texte de l'accueil.
function shell(body, pagePath) {
    const nav = NAV.map(([href, label]) => link(href, label)).join(' · ');
    return `<div data-prerendered data-path="${pagePath}" style="max-width:720px;margin:0 auto;padding:96px 16px 48px;line-height:1.6;font-family:Montserrat,system-ui,sans-serif">
<nav aria-label="Navigation principale">${nav}</nav>
<main>${body}</main>
<footer><p>Phœnix Égalité des Chances, association d'étudiants de KEDGE Business School. Domaine de Luminy, 13009 Marseille. <a href="mailto:phoenixedc.asso@gmail.com">phoenixedc.asso@gmail.com</a></p></footer>
</div>
<script>(function(){var w=document.querySelector('[data-prerendered]');var p=location.pathname.replace(/\\/+$/,'')||'/';if(w&&w.getAttribute('data-path')!==p){w.remove();}})();</script>`;
}

function setTitle(html, v) {
    return html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(v)}</title>`);
}
function setMeta(html, attr, name, v) {
    const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`);
    return html.replace(re, (_, a, b) => `${a}${esc(v)}${b}`);
}
function setCanonical(html, url) {
    return html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${url}${b}`);
}

function breadcrumb(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map(([name, pathname], i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name,
            item: `${SITE}${pathname}`,
        })),
    };
}

function render(template, page) {
    const url = `${SITE}${page.path === '/' ? '' : page.path}`;
    let html = setTitle(template, page.title);
    html = setMeta(html, 'name', 'description', page.description);
    html = setMeta(html, 'property', 'og:title', page.title);
    html = setMeta(html, 'property', 'og:description', page.description);
    html = setMeta(html, 'property', 'og:url', url);
    html = setMeta(html, 'name', 'twitter:title', page.title);
    html = setMeta(html, 'name', 'twitter:description', page.description);
    if (page.image) {
        html = setMeta(html, 'property', 'og:image', page.image);
        html = setMeta(html, 'name', 'twitter:image', page.image);
    }
    html = setCanonical(html, url);

    const schemas = page.schema ?? (page.path === '/' ? [] : [breadcrumb([['Accueil', '/'], [page.crumb ?? page.title, page.path]])]);
    if (schemas.length > 0) {
        const json = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas).replace(/</g, '\\u003c');
        html = html.replace('</head>', () => `  <script type="application/ld+json" id="dynamic-page-schema">${json}</script>\n</head>`);
    }

    if (page.head) {
        html = html.replace('</head>', () => `  ${page.head}\n</head>`);
    }

    return html.replace('<div id="root"></div>', () => `<div id="root">${shell(page.body, page.path)}</div>`);
}

async function main() {
    const template = await readFile(path.join(dist, 'index.html'), 'utf8');
    if (!template.includes('<div id="root"></div>')) {
        console.warn('[prerender] <div id="root"></div> introuvable dans dist/index.html, étape ignorée.');
        return;
    }

    const vite = await createServer({
        root,
        appType: 'custom',
        logLevel: 'error',
        server: { middlewareMode: true },
    });
    let projects, events, soutien;
    try {
        projects = (await vite.ssrLoadModule('/src/data/projects.ts')).projects;
        events = (await vite.ssrLoadModule('/src/data/events.ts')).events;
        soutien = await vite.ssrLoadModule('/src/data/soutienScolaire.ts');
    } finally {
        await vite.close();
    }

    const cordees = projects.filter((x) => x.isCordee).length;
    const projectList = (items) =>
        `<ul>${items
            .map(
                (x) =>
                    `<li>${link(`/projets/${x.id}`, x.title)}${soutien.PAUSED_PROJECT_IDS.includes(x.id) ? ' (en pause cette année)' : ''} : ${esc(x.targetAudience)}. ${esc(x.locationName)}. ${esc(x.schedule)}.</li>`,
            )
            .join('')}</ul>`;

    const pages = [];

    pages.push({
        path: '/',
        title: 'Phœnix EDC – Tutorat & Égalité des Chances – Marseille / KEDGE BS',
        description:
            "Association étudiante de KEDGE Business School : tutorat scolaire gratuit, mentorat académique et ouverture culturelle pour 300 collégiens et lycéens à Marseille depuis 2011.",
        // L'image du hero (élément LCP) n'est découverte qu'après l'exécution de React : on la précharge dès le HTML.
        head: '<link rel="preload" as="image" href="/images/projects/hero-1.webp" type="image/webp" fetchpriority="high">',
        body: `<h1>Faire briller tous les talents de Marseille</h1>
${p("Chaque semaine, plus de 100 étudiants de KEDGE Business School accompagnent 300 collégiens et lycéens des quartiers prioritaires de Marseille. Association reconnue d'intérêt général, Phœnix Égalité des Chances agit depuis 2011 : tutorat, ouverture culturelle et orientation.")}
<h2>Nos ${projects.length} projets de terrain</h2>
${projectList(projects)}
<p>${link(soutien.SOUTIEN_PATH, 'Soutien scolaire et ouverture culturelle à Marseille : qui est accompagné et comment')}</p>
<p>Étudiant à KEDGE ? Phœnix EDC permet de valider le Pro Act (50 heures). <a href="${soutien.MYKEDGE_URL}">Postuler sur MyKedge Asso</a>.</p>`,
    });

    pages.push({
        path: '/association',
        title: "L'Association – Histoire & Équipe de Tuteurs – Marseille / KEDGE BS",
        description:
            "Depuis 2011, Phœnix EDC mobilise plus de 100 étudiants tuteurs de KEDGE Business School pour l'égalité des chances et la réussite scolaire à Marseille.",
        crumb: "L'association",
        body: `<h1>L'association Phœnix Égalité des Chances</h1>
${p(`Association étudiante de KEDGE Business School, active à Marseille depuis 2011. Plus de 100 étudiants tuteurs bénévoles accompagnent chaque semaine 300 jeunes dans ${projects.length} projets de terrain, dont ${cordees} labellisés Cordées de la réussite.`)}`,
    });

    pages.push({
        path: '/projets',
        title: 'Nos Projets – Tutorat Scolaire & Cordées – Marseille / KEDGE BS',
        description:
            "Découvrez les 9 projets de tutorat et soutien scolaire menés par les étudiants de KEDGE BS à Marseille : ACSE, Arthur Rimbaud, Izzo, Jules Ferry, Roy d'Espagne, Sup d'OM, Saint-Gabriel...",
        crumb: 'Nos projets',
        body: `<h1>Nos ${projects.length} projets de tutorat à Marseille</h1>
${p('Chaque projet s\'adresse à un public précis : niveau scolaire, établissement ou structure partenaire, lieu et rythme sont indiqués ci-dessous.')}
${projectList(projects)}`,
    });

    for (const x of projects) {
        pages.push({
            path: `/projets/${x.id}`,
            title: `${x.title} – Tutorat Scolaire & Cordées – Marseille / KEDGE BS`,
            description: `${x.description.slice(0, 140)}... Tutorat scolaire et mentorat étudiant KEDGE BS à Marseille.`,
            image: x.banner || x.image ? `${SITE}${x.banner || x.image}` : undefined,
            schema: [breadcrumb([['Accueil', '/'], ['Nos projets', '/projets'], [x.title, `/projets/${x.id}`]])],
            body: `<h1>${esc(x.title)}</h1>
${p(x.fullDescription)}
<ul><li>Public : ${esc(x.targetAudience)}</li><li>Lieu : ${esc(x.locationName)}</li><li>Rythme : ${esc(x.schedule)}</li><li>Axes : ${esc(x.axes.join(', '))}</li>${x.isCordee ? '<li>Projet labellisé Cordées de la réussite</li>' : ''}</ul>
<p>${link('/projets', 'Voir tous les projets')}</p>`,
        });
    }

    pages.push({
        path: '/evenements',
        title: 'Nos Événements – Éloquence & Ouverture Culturelle – Marseille / KEDGE BS',
        description:
            'Participez aux événements phares de Phœnix EDC : Concours d\'Éloquence KEDGE, simulation diplomatique SIMONU Marseille, Journée de l\'Égalité des Chances.',
        crumb: 'Événements',
        body: `<h1>Nos événements : éloquence, simulation de l'ONU et olympiades</h1>
${p("Phœnix EDC organise la Journée de l'Égalité des Chances et son concours d'éloquence, la simulation diplomatique SimONU et les Olympiades, pour développer l'art oratoire et l'ambition des jeunes accompagnés.")}
<ul>${events.map((e) => `<li>${link(`/evenements/${e.id}`, e.title)} : ${esc(e.description)}</li>`).join('')}</ul>`,
    });

    for (const e of events) {
        pages.push({
            path: `/evenements/${e.id}`,
            title: `${e.title} – Événement & Éloquence – Marseille / KEDGE BS`,
            description: `${e.description.slice(0, 140)}... Événement organisé par l'association Phœnix EDC à Marseille.`,
            image: e.image ? `${SITE}${e.image}` : undefined,
            schema: [breadcrumb([['Accueil', '/'], ['Événements', '/evenements'], [e.title, `/evenements/${e.id}`]])],
            body: `<h1>${esc(e.title)}</h1>
${e.fullDescription
    .split('\n\n')
    .map((para) => p(para))
    .join('\n')}
<p>${link('/evenements', 'Voir tous les événements')}</p>`,
        });
    }

    pages.push({
        path: '/partenaires',
        title: 'Nos Partenaires – Mécénat & Réseau Partenaire – Marseille / KEDGE BS',
        description:
            "Devenez entreprise partenaire mécène de Phœnix EDC : soutenez l'égalité des chances à Marseille, valorisez votre démarche RSE et défiscalisez vos dons à 60%.",
        crumb: 'Partenaires',
        body: `<h1>Nos partenaires et mécènes</h1>
${p("Entreprises, institutions et établissements scolaires soutiennent Phœnix EDC. Les dons des entreprises ouvrent droit à une réduction d'impôt de 60 %.")}`,
    });

    pages.push({
        path: '/transparence',
        title: 'Transparence & Dons – Soutien & Déduction Fiscale – Marseille / KEDGE BS',
        description:
            "Soutenez l'éducation à Marseille : vos dons à Phœnix EDC sont déductibles d'impôts à 66% (IR) et 60% (IS). 70% des fonds financent directement les sorties et ateliers.",
        crumb: 'Transparence et dons',
        body: `<h1>Transparence et dons</h1>
${p("Les dons à Phœnix EDC sont déductibles des impôts à hauteur de 66 % pour les particuliers et de 60 % pour les entreprises. Selon l'association, 70 % des fonds financent directement les sorties et les ateliers.")}`,
    });

    pages.push({
        path: '/documents',
        title: 'Documentation & Guides – Ressources Associatives – Marseille / KEDGE BS',
        description:
            'Consultez et téléchargez les ressources officielles de Phœnix EDC : Guide du Phœnicien 2026-2027, fiches de postes du Bureau et des Pôles associatifs.',
        crumb: 'Documents',
        body: `<h1>Documents et ressources</h1>
${p('Guide du Phœnicien, fiches de postes du Bureau et des Pôles associatifs : les ressources officielles de Phœnix EDC.')}`,
    });

    pages.push({
        path: '/contact',
        title: 'Contact & Recrutement – Devenir Tuteur Bénévole – Marseille / KEDGE BS',
        description:
            "Contactez l'équipe de Phœnix Égalité des Chances à KEDGE Business School Marseille pour devenir tuteur bénévole, établissement ou entreprise partenaire.",
        crumb: 'Contact',
        body: `<h1>Contact et recrutement</h1>
${p("Une question, un partenariat ou l'envie de devenir tuteur ? Écrivez-nous. Les étudiants de KEDGE peuvent candidater sur MyKedge Asso.")}
<p><a href="${soutien.MYKEDGE_URL}">Postuler sur MyKedge Asso</a></p>`,
    });

    pages.push({
        path: '/carte-des-projets',
        title: 'Carte des Antennes – Collèges & Lycées Partenaires – Marseille / KEDGE BS',
        description:
            'Explorez la carte interactive des 9 antennes de tutorat de Phœnix EDC réparties dans les collèges, lycées et quartiers prioritaires de Marseille.',
        crumb: 'Carte des projets',
        body: `<h1>Carte des projets à Marseille</h1>
<ul>${projects.map((x) => `<li>${link(`/projets/${x.id}`, x.title)} : ${esc(x.locationName)}</li>`).join('')}</ul>`,
    });

    pages.push({
        path: soutien.SOUTIEN_PATH,
        title: soutien.SOUTIEN_TITLE,
        description: soutien.SOUTIEN_DESCRIPTION,
        crumb: 'Soutien scolaire à Marseille',
        schema: [soutien.faqSchema, soutien.breadcrumbSchema],
        body: `<h1>${esc(soutien.SOUTIEN_H1)}</h1>
<p>Mis à jour : ${esc(soutien.LAST_UPDATED_LABEL)}</p>
${p(soutien.DIRECT_ANSWER)}
<h2>Qui est accompagné, et comment ?</h2>
${soutien.ACCESS_PARAGRAPHS.map((t) => p(t)).join('\n')}
<h2>Les ${projects.length} projets de terrain</h2>
${projectList(projects)}
<h2>Étudiant KEDGE : deviens tuteur</h2>
<p>Les tuteurs sont des étudiants de KEDGE Business School Marseille. L'engagement permet de valider les 50 heures du Pro Act. <a href="${soutien.MYKEDGE_URL}">Postuler sur MyKedge Asso</a>.</p>
<h2>Questions fréquentes</h2>
${soutien.FAQ_ITEMS.map((f) => `<h3>${esc(f.question)}</h3>\n${p(f.answer)}`).join('\n')}`,
    });

    for (const page of pages) {
        const html = render(template, page);
        const outFile = page.path === '/' ? path.join(dist, 'index.html') : path.join(dist, page.path, 'index.html');
        await mkdir(path.dirname(outFile), { recursive: true });
        await writeFile(outFile, html, 'utf8');
    }
    console.log(`[prerender] ${pages.length} pages générées dans dist/.`);
}

main().catch((err) => {
    console.warn('[prerender] ÉCHEC, le site reste en SPA classique :', err);
    process.exit(0);
});
