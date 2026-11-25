# Actualités et réels Instagram : plan de réalisation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Une rubrique Actualités publiée depuis l'espace membre par le Bureau et les publieurs, et les réels Instagram de @phoenixedc récupérés chaque jour, affichés sur le site public.

**Architecture:** Même chemin que les fiches des nommés. Le script Apps Script (`google-apps-script.js`) stocke les articles dans le Sheet et les photos dans Drive, synchronise Instagram par un déclencheur quotidien, et expose une lecture publique `getNews` et `getPublicImage`. Le relais `api/planning.js` met ces lectures en cache. Le site React lit `?news=1` une fois par visite.

**Tech Stack:** Google Apps Script (V8), Vercel serverless (relais existant), React 19, TypeScript, Vite, Tailwind, tests `node:test` avec le harnais `scripts/lib/apps-script-harness.mjs`.

**Spec:** [docs/superpowers/specs/2026-11-25-actualites-design.md](../specs/2026-11-25-actualites-design.md)

## Global Constraints

- Tout texte visible en français, sans emoji, sans tiret cadratin, sans formule creuse.
- Aucun nouveau fichier dans `api/` (limite de fonctions Vercel).
- Ne pas modifier l'authentification de `/planning` ni les actions historiques non authentifiées (`syncBooking`, `deleteBooking`, etc.).
- Le dossier `seintinelles/` n'est jamais ajouté à un commit. Ajouter les fichiers par chemin, jamais `git add -A`.
- Ne pas pousser : l'utilisateur dit « push » lui-même.
- Ne jamais arrêter le serveur local sur le port 3002. Démo locale sur 3003, Vite sur 5175.
- Le script est collé à la main et redéployé en « Nouvelle version » par l'utilisateur ; le site doit fonctionner avant ce redéploiement (pas d'erreur visible).
- Limites : titre 120 caractères, texte 5 000, 6 photos de galerie, photo 1 500 000 caractères base64 (`NOMINEE_PHOTO_MAX`), 60 articles publics, 8 réels publics, 25 publications lues sur Instagram.
- La clé Instagram n'apparaît que dans les propriétés du script (`INSTAGRAM_TOKEN`).
- Lancer les fichiers de test un par un (`npm run test:vote` peut bloquer quand il tourne avec `tsc`).

## Review Focus

1. **Script pas encore redéployé** : `getNews` répond `{success:false, message:'Action inconnue'}` et les actions d'écriture tombent dans la connexion (« Identifiants incorrects »). Attendu : page « arrivent bientôt », pied de page réduit au lien Instagram, espace membre « Les actualités ne sont pas disponibles pour le moment. ». Tests : Task 4 (`parseNews` rejette), message géré par `postPlanningAction`.
2. **Conversions de Google Sheets** : une date de publication relue comme objet `Date`, un titre qui commence par `=` ou `+`, un identifiant numérique. Attendu : `getNews` renvoie toujours `publishedAt` en `YYYY-MM-DD` et le titre tel quel. Test : Task 1 (`setSheetCell` avec une `Date`, format texte des colonnes).
3. **Texte malveillant** : `<script>` dans un titre, `javascript:alert(1)` dans le texte. Attendu : affiché en texte, aucun lien. Test : Task 4 (`bodyBlocks`).
4. **Clé Instagram expirée ou Instagram en panne** : attendu, rien ne change dans `ReelsInstagram`, `INSTAGRAM_LAST_ERROR` renseigné, `getNews` renvoie les réels déjà connus. Test : Task 3.
5. **Publieur décoché pendant qu'il travaille** : attendu, `forbidden` sur l'action suivante. Test : Task 1.

---

### Task 1: Script, articles et publieurs

**Files:**
- Modify: `google-apps-script.js` (nouvelle section « ACTUALITÉS » après la section des fiches des nommés ; routage dans `doPost` juste après `handleVoteAction`)
- Create: `scripts/test-news-logic.mjs`
- Modify: `package.json` (ajouter `scripts/test-news-logic.mjs` à `test:vote`)

**Interfaces:**
- Consumes: `verifySessionToken(userId, token)`, `readVoteUsers()`, `findVoteUser(users, id)`, `voteFail(code, message)`, `getVoteSheet(def)` (applique `textColumns` à la création), `readVoteRows(sheet)`, `readVoteRowsIfAny(def)`, `nomineeSlug(name)`.
- Produces:
  - `NEWS_SHEETS = { articles: { name: 'Actualites', headers: ['id','slug','title','body','coverFileId','photoFileIds','projectId','published','publishedAt','createdBy','updatedBy','updatedAt'], textColumns: 'A:L' }, publishers: { name: 'Publieurs', headers: ['userId','grantedBy','grantedAt'], textColumns: 'A:C' } }`.
  - `NEWS_LIMITS = { title: 120, body: 5000, photos: 6, publicArticles: 60, reels: 8, igFetch: 25 }`.
  - `readNewsArticles(rows)` → `{ sheetRow, id, slug, title, body, coverFileId, photoFileIds: string[], projectId: string|null, published: boolean, publishedAt: string /* 'YYYY-MM-DD' ou '' */, createdBy, updatedBy, updatedAt }[]`. Une `Date` en `publishedAt` est relue en `YYYY-MM-DD` (fuseau Paris).
  - `newsCanPublish(users, publisherRows, userId)` → boolean (rôle `bureau` ou présent dans `Publieurs`).
  - `handleNewsAction(action, postData)` → résultat ou `null` si l'action n'est pas une action `news*`. Vérifie le jeton de `postData.requesterId`, prend le verrou du script pour les écritures.
  - Actions (toutes avec `requesterId`, `token`) :
    - `newsAccess` → `{ success, canPublish, isBureau }` (accessible à tout membre connecté).
    - `newsGetAdmin` → `{ success, isBureau, articles: AdminArticle[], members?: { id, name, role, canPublish }[] }` ; `members` seulement pour le Bureau. `AdminArticle = { id, slug, title, body, coverId, photoIds, projectId, published, publishedAt, updatedAt, updatedByName }`, du plus récent (`updatedAt`) au plus ancien.
    - `newsSave { id?, title, body, projectId, photoIds? }` → `{ success, id }`. Sans `id` : création (`id` = `Utilities.getUuid()`, non publié). `photoIds`, si fourni, doit être une permutation exacte des photos de galerie existantes, sinon `bad_request`.
    - `newsSetPublished { id, published }` → `{ success, slug }`. Publier exige titre, texte et couverture utilisable (`incomplete`). À la première publication : `slug` = `nomineeSlug(title)` (repli `actu`), suffixé `-2`, `-3` si déjà pris par un autre article ; `publishedAt` = aujourd'hui. Ni l'un ni l'autre ne change ensuite.
    - `newsDelete { id }` → `{ success }` ; supprime la ligne et met couverture et galerie à la corbeille (`trashNomineePhoto`).
    - `newsSetPublisher { userId, allowed }` → `{ success }` ; Bureau seulement ; inutile pour un membre du Bureau (`bad_request`).
  - Codes d'erreur : `unauthenticated`, `forbidden`, `not_found`, `bad_request`, `incomplete`.

- [ ] **Step 1: Write the failing tests** in `scripts/test-news-logic.mjs` (utilisateurs : tuteur `a1`, tuteur `b2`, Bureau `d4`) :
  - `tuteur non publieur : newsAccess canPublish false, newsSave forbidden`
  - `Bureau coche a1 : a1 crée, modifie et voit l'article dans newsGetAdmin ; members absent pour a1, présent pour d4`
  - `décocher a1 : son newsSave suivant est forbidden` (Review Focus 5)
  - `newsSetPublisher par un tuteur : forbidden`
  - `titre vide ou de 121 caractères, texte de 5001 : bad_request ; 120 et 5000 acceptés`
  - `publier sans couverture : incomplete` (la couverture vient de Task 2 ; ici on vérifie seulement le refus)
  - `slug fixé à la première publication et inchangé après modification du titre ; deux titres identiques donnent x et x-2` (injecter `coverFileId` via `h.setSheetCell` sur un fichier créé par `h.drive` pour pouvoir publier avant Task 2, ou écrire ce test dans Task 2)
  - `publishedAt relu en YYYY-MM-DD quand Sheets le convertit en Date` (`h.setSheetCell('Actualites', 2, 9, new Date(...))`) (Review Focus 2)
  - `onglets créés avec le format texte` : `h.formats('Actualites')` contient `['A:L', '@']`
  - `newsDelete met les photos à la corbeille et retire la ligne`
  - `jeton invalide : unauthenticated`
- [ ] **Step 2: Run** `node --experimental-strip-types --no-warnings --test scripts/test-news-logic.mjs`. Expected: FAIL (actions inconnues).
- [ ] **Step 3: Implement** la section dans `google-apps-script.js` et le routage `var newsResult = handleNewsAction(action, postData); if (newsResult) return ...` dans `doPost`, sur le modèle de `handleVoteAction`.
- [ ] **Step 4: Run** le même fichier, puis `scripts/test-nominees-logic.mjs` et `scripts/test-vote-logic.mjs`. Expected: tout PASS.
- [ ] **Step 5: Commit** `feat(actus): articles et publieurs côté script`.

### Task 2: Script, photos et lectures publiques

**Files:**
- Modify: `google-apps-script.js` (section ACTUALITÉS, branche `doGet`)
- Modify: `scripts/test-news-logic.mjs`

**Interfaces:**
- Consumes: Task 1 ; `NOMINEE_PHOTO_MAX`, `nomineePhotoUsable(id)`, `trashNomineePhoto(id)`, le contrôle JPEG de `nomineeUploadPhoto` (à extraire en `decodeJpegUpload(data)` → `{ bytes } | { error }` et réutiliser dans les deux).
- Produces:
  - `getNewsPhotoFolder()` : même logique que `getNomineePhotoFolder`, propriété `NEWS_PHOTO_FOLDER_ID`, dossier « Phoenix - Photos actualités ».
  - `newsUploadPhoto { id, data, slot: 'cover'|'gallery' }` → `{ success, photoId }` ; `too_large`, `bad_request`, `too_many` (7e photo de galerie). Une nouvelle couverture met l'ancienne à la corbeille.
  - `newsRemovePhoto { id, photoId }` → `{ success }`.
  - `getPublicNews()` → `{ success: true, articles: PublicArticle[], reels: PublicReel[] }`. `PublicArticle = { slug, title, body, coverId, photoIds, projectId, publishedAt }` : articles publiés dont la couverture est utilisable, galerie filtrée sur les photos utilisables, tri `publishedAt` décroissant puis ordre de publication, 60 au plus, jamais `createdBy`/`updatedBy`/`id`. `reels` : `[]` dans cette tâche (rempli en Task 3). Ne crée aucun onglet (`readVoteRowsIfAny`).
  - `getPublicImage(id)` → même forme que `getPublicNomineePhoto` ; accepte une photo de fiche de nommé, la couverture ou une photo de galerie d'un article publié, ou une couverture de réel (Task 3 ajoute ce cas).
  - `doGet` : `action === 'getNews'` → `getPublicNews()` ; `getPublicImage` et `getNomineePhoto` → `getPublicImage(e.parameter.id)`.

- [ ] **Step 1: Write the failing tests**:
  - `couverture PNG refusée, trop lourde refusée, JPEG accepté`
  - `7e photo de galerie : too_many`
  - `nouvelle couverture : l'ancienne à la corbeille`
  - `getNews : ni article non publié, ni article sans couverture utilisable, ni identifiant de compte` (chercher `'a1'`, `'d4'` et `createdBy` dans `JSON.stringify`)
  - `getNews : publishedAt en YYYY-MM-DD, plus récent d'abord, 60 au plus`
  - `getNews avant toute publication : articles [] et aucun onglet créé`
  - `getPublicImage : photo d'un article publié servie, d'un article dépublié refusée, fichier quelconque refusé, photo de nommé toujours servie, alias getNomineePhoto identique`
  - `newsSave avec photoIds dans un autre ordre : ordre enregistré ; avec un identifiant étranger : bad_request`
- [ ] **Step 2: Run** `node --experimental-strip-types --no-warnings --test scripts/test-news-logic.mjs`. Expected: FAIL sur les nouveaux tests.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `test-news-logic.mjs` et `test-nominees-logic.mjs`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(actus): photos des articles et lecture publique`.

### Task 3: Script, réels Instagram

**Files:**
- Modify: `scripts/lib/apps-script-harness.mjs` (faux `UrlFetchApp`, `everyDays` sur les déclencheurs)
- Modify: `google-apps-script.js`
- Create: `scripts/test-instagram-sync.mjs` ; ajouter à `test:vote`

**Interfaces:**
- Consumes: Task 2 (`getPublicNews`, `getPublicImage`).
- Produces (harnais) : `loadScript` expose `h.setFetch(fn)` où `fn(url)` renvoie `{ code, json? , bytes? }`, et `h.fetches` (liste des URL appelées). `UrlFetchApp.fetch(url, { muteHttpExceptions: true })` renvoie `getResponseCode()`, `getContentText()`, `getBlob()` (blob JPEG avec `setName`). `newTrigger(...).timeBased().everyDays(n).atHour(h).create()` enregistre `{ handler, everyDays, hour }`.
- Produces (script) :
  - `NEWS_SHEETS.reels = { name: 'ReelsInstagram', headers: ['mediaId','shortcode','permalink','caption','timestamp','coverFileId','syncedAt'], textColumns: 'A:G' }`.
  - `reelShortcode(permalink)` → code ou `''` (`/reel/<code>/`, `/reels/<code>/`, `/p/<code>/`).
  - `synchroInstagram()` : lit `INSTAGRAM_TOKEN` (absent : note l'erreur, sort) ; appelle `https://graph.instagram.com/me/media?fields=id,media_type,thumbnail_url,permalink,caption,timestamp&limit=25&access_token=…` ; garde `media_type === 'VIDEO'` avec `thumbnail_url` et un code ; pour chaque nouvel `id`, télécharge la couverture dans le dossier `INSTAGRAM_REEL_FOLDER_ID` (« Phoenix - Couvertures réels ») et ajoute la ligne ; retire (et met à la corbeille) les lignes absentes du fil dont le `timestamp` est postérieur ou égal à la plus ancienne publication lue ; met à jour `caption` des lignes existantes. Renouvelle la clé (`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=…`) quand `INSTAGRAM_TOKEN_REFRESHED_AT` date de plus de 30 jours ; absente, elle est fixée à maintenant sans renouveler. Toute réponse non 200 ou JSON illisible : aucune écriture dans le Sheet ni dans Drive, `INSTAGRAM_LAST_ERROR` = date et message ; succès : `INSTAGRAM_LAST_ERROR` vidé. Prend le verrou du script.
  - `installerSynchroInstagram()` : supprime les déclencheurs existants de `synchroInstagram`, en crée un quotidien à 6 h.
  - `getPublicNews().reels` : 8 plus récents dont la couverture est utilisable, `{ id, shortcode, permalink, caption, timestamp, coverId }` ; `getPublicImage` accepte leurs couvertures.

- [ ] **Step 1: Write the failing tests** :
  - `garde les vidéos, ignore images et carrousels, copie la couverture dans Drive`
  - `deuxième synchro sans nouveauté : aucun nouveau fichier`
  - `vidéo supprimée dans la fenêtre lue : ligne retirée, couverture à la corbeille ; vidéo plus ancienne que la fenêtre : gardée`
  - `clé expirée (400, code 190) : rien ne change, INSTAGRAM_LAST_ERROR renseigné, getNews renvoie les réels déjà connus` (Review Focus 4)
  - `sans INSTAGRAM_TOKEN : aucun appel réseau, erreur notée`
  - `renouvellement : pas avant 30 jours, oui après, nouvelle clé enregistrée`
  - `installerSynchroInstagram deux fois : un seul déclencheur quotidien`
  - `reelShortcode : /reel/, /reels/, /p/, adresse étrangère`
  - `getNews : 8 réels au plus, couverture servie par getPublicImage`
- [ ] **Step 2: Run** `node --experimental-strip-types --no-warnings --test scripts/test-instagram-sync.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement** (harnais puis script).
- [ ] **Step 4: Run** `test-instagram-sync.mjs`, `test-news-logic.mjs`, `test-backup.mjs` (utilise les déclencheurs). Expected: PASS.
- [ ] **Step 5: Commit** `feat(actus): synchronisation quotidienne des réels Instagram`.

### Task 4: Données client et relais

**Files:**
- Create: `src/data/news.ts`, `src/hooks/usePublicNews.ts`, `scripts/test-news-client.mjs` (ajouter à `test:vote`)
- Modify: `src/data/planningData.ts`, `api/planning.js`

**Interfaces:**
- Consumes: réponses des Tasks 1 à 3 ; `postPlanningAction(body, unavailableMessage)`, `nomineePhotoUrl(id)`.
- Produces :
  - `news.ts` : types `PublicArticle`, `PublicReel`, `PublicNews = { articles, reels }`, `AdminArticle`, `NewsMember`, `NewsAdmin = { isBureau, articles, members: NewsMember[] | null }`.
  - `parseNews(raw): PublicNews | null` : `null` si `success !== true` ou tableaux absents ; écarte les éléments mal formés.
  - `parseNewsAdmin(raw): NewsAdmin | null`.
  - `type BodyPart = { text: string } | { text: string; href: string }` ; `bodyBlocks(body): BodyPart[][]` : paragraphes séparés par une ou plusieurs lignes vides, retours simples gardés dans le texte, seules les adresses `https?://` deviennent des liens (ponctuation finale `.,;:!?)` exclue du lien).
  - `fitWithin(w, h, max = 1600): { outW, outH }` sans agrandir.
  - `formatNewsDate('2026-11-12')` → `12 novembre 2026`.
  - `excerpt(body, max = 180)` : premier paragraphe coupé au dernier mot, suivi de « … » si coupé.
  - `planningData.ts` : `fetchPublicNews()`, `publicImageUrl = nomineePhotoUrl`, et `newsAccessApi`, `fetchNewsAdmin`, `saveNewsApi`, `setNewsPublishedApi`, `uploadNewsPhotoApi`, `removeNewsPhotoApi`, `deleteNewsApi`, `setNewsPublisherApi` (même forme que les API des nommés, message par défaut `Les actualités ne sont pas disponibles pour le moment.`).
  - `usePublicNews(): { data: PublicNews | null; loading: boolean }` : une requête par visite, cache de module, comme `usePublicNominees`.
  - `api/planning.js` : branche `GET ?news=1` (seul paramètre accepté, sinon 400) vers `?action=getNews`, cache `public, s-maxage=60, stale-while-revalidate=60` si succès ; la branche `?photo=` appelle `getPublicImage`.

- [ ] **Step 1: Write the failing tests** :
  - `parseNews : vraie réponse acceptée ; Action inconnue, réponse de connexion, null rejetés` (Review Focus 1)
  - `parseNews écarte un article sans slug ou sans couverture et un réel sans code`
  - `bodyBlocks : deux paragraphes, lien https, ponctuation finale hors du lien, javascript: et <script> restent du texte` (Review Focus 3)
  - `fitWithin : 4000x3000 → 1600x1200 ; 3000x4000 → 1200x1600 ; 800x600 inchangé`
  - `formatNewsDate et excerpt`
- [ ] **Step 2: Run** `node --experimental-strip-types --no-warnings --test scripts/test-news-client.mjs`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** le fichier, puis `npx tsc -b`. Expected: PASS, aucune erreur de type.
- [ ] **Step 5: Commit** `feat(actus): lecture des actualités côté site et relais`.

### Task 5: Pages publiques, menu et référencement

**Files:**
- Create: `src/pages/Actualites.tsx`, `src/components/news/NewsCard.tsx`, `src/components/news/ReelStrip.tsx`, `src/components/news/ReelModal.tsx`, `src/components/news/NewsBody.tsx`
- Modify: `src/App.tsx` (routes `/actualites`, `/actualites/:slug`, chargement différé comme les autres pages), `src/components/layout/Header.tsx`, `scripts/prerender.mjs`, `public/sitemap.xml`

**Interfaces:**
- Consumes: Task 4 (`usePublicNews`, `bodyBlocks`, `formatNewsDate`, `excerpt`, `publicImageUrl`), `projects` de `src/data/projects.ts` pour le nom du projet lié.
- Produces : `NewsCard({ article, featured? })`, utilisé aussi par Task 6.

Contenu fixé par la spec (section « Ce qu'on voit ») :
- Liste : bande « Nos derniers réels » (absente sans réel), puis « Actualités » : grande carte du dernier article, puis grille 1/2/3 colonnes. Sans article : « Les premières actualités arrivent bientôt » et lien vers `https://www.instagram.com/phoenixedc/`.
- Réel : couverture 9:16, icône lecture, `loading="lazy"`. Clic : `ReelModal` avec `<iframe src="https://www.instagram.com/reel/<code>/embed" title="Réel Instagram de Phœnix EDC">` monté seulement à l'ouverture, lien « Voir sur Instagram », fermeture par Échap, clic à côté et bouton ; focus piégé et rendu au déclencheur ; défilement de la page bloqué.
- Article : titre, date, étiquette du projet lié vers `/projets/<id>`, couverture, `NewsBody`, galerie (clic : photo en grand, même règles de fenêtre), « Les autres actus » (3), retour. Slug inconnu : « Cette actualité n'existe pas » et lien vers la liste. `document.title` = titre de l'article.
- Menu : « Actualités » entre « Événements » et « Tuteur du mois », ordinateur et téléphone.
- `prerender.mjs` : entrée `/actualites` (titre « Actualités de l'association | Phœnix EDC », court texte générique sans article) et ajout dans `NAV` ; `sitemap.xml` : `/actualites`.

- [ ] **Step 1: Implement** les composants et routes.
- [ ] **Step 2: Run** `npx tsc -b` puis `npm run build`. Expected: build OK, `[prerender]` compte une page de plus.
- [ ] **Step 3: Verify** dans le navigateur (démo de Task 8 si déjà prête, sinon Vite avec une réponse simulée) : menu sans débordement à 1280, 1440, 1600, 1920 px (`document.documentElement.scrollWidth <= innerWidth` et liens sur une ligne). Resserrer comme pour « Tuteur du mois » si besoin.
- [ ] **Step 4: Commit** `feat(actus): pages publiques, réels et lien dans le menu`.

### Task 6: Accueil et pied de page

**Files:**
- Create: `src/components/news/NewsHomeSection.tsx`
- Modify: `src/pages/Home.tsx` (juste après `<NomineeSpotlightSection variant="home" />`), `src/components/layout/Footer.tsx`

**Interfaces:**
- Consumes: Task 4 (`usePublicNews`), Task 5 (`NewsCard`).

Contenu :
- Accueil : « Les dernières actus », 3 articles, lien « Toutes les actus » ; rien sans article.
- Pied de page : supprimer le formulaire, son état et l'import `CheckCircle2` s'il n'est plus utilisé. Bloc « Dernières actus » : 2 titres (lien chacun, date en petit) et « Toutes les actus ». Sans article (ou en chargement) : « Suivez la vie de l'association sur Instagram. » et lien `https://www.instagram.com/phoenixedc/`. Garder le titre de colonne et le style fanzine existants.

- [ ] **Step 1: Implement.**
- [ ] **Step 2: Run** `npx tsc -b` et `grep -n "newsletter\|Je m'abonne" src/components/layout/Footer.tsx`. Expected: aucune erreur, aucune occurrence.
- [ ] **Step 3: Commit** `feat(actus): dernières actus sur l'accueil et dans le pied de page`.

### Task 7: Espace membre

**Files:**
- Create: `src/pages/planning/PlanningActualites.tsx`, `src/components/planning/NewsEditor.tsx`, `src/components/planning/NewsPublishersPanel.tsx`, `src/hooks/useNewsAccess.ts`
- Modify: `src/App.tsx` (route `/planning/actualites` sous `PlanningGuard`), `src/pages/planning/PlanningDashboard.tsx`

**Interfaces:**
- Consumes: Task 4 (API `news*`, `parseNewsAdmin`, `fitWithin`, `publicImageUrl`), `usePlanning()` pour `currentUser` (id, rôle, jeton), `projects` de `src/data/projects.ts` pour la liste des projets.
- Produces : `useNewsAccess(): { canPublish: boolean; loading: boolean }` : `true` d'office pour le Bureau sans requête ; sinon un appel `newsAccess` par utilisateur et par chargement de l'application (cache de module par identifiant) ; `false` en cas d'échec.

Contenu fixé par la spec (« Espace membre ») :
- Carte « Actualités » sur le tableau de bord (section `activite`, description « Publiez les nouvelles de l'association »), visible seulement si `canPublish`.
- Page : liste de tous les articles avec état « En ligne » ou « Non publié », date, bouton « Nouvel article ». Le serveur répond `forbidden` : message « Vous n'avez pas accès à cette page. ».
- Éditeur (fenêtre comme `NomineeProfileEditor` : focus, Échap, confirmation si modifications non enregistrées, défilement bloqué) : titre (compteur 120), texte (compteur 5 000, aide « Laissez une ligne vide entre deux paragraphes. Les liens sont cliquables. »), couverture, galerie (6, flèches pour changer l'ordre, retirer), projet lié (liste, « Aucun »). Photos réduites sur l'appareil avec `fitWithin` puis `canvas.toBlob('image/jpeg', 0.85)`, envoyées une par une. Un nouvel article est enregistré (`newsSave`) avant le premier envoi de photo. Boutons « Publier » / « Enregistrer », « Dépublier », « Supprimer » (confirmation « Supprimer définitivement cet article et ses photos ? »). Après publication : lien « Voir sur le site » vers `/actualites/<slug>`.
- Bureau : `NewsPublishersPanel` sous la liste, « Qui peut publier », une case par membre non Bureau, enregistrée à chaque clic (`newsSetPublisher`), la case revient en arrière si l'appel échoue.

- [ ] **Step 1: Implement.**
- [ ] **Step 2: Run** `npx tsc -b`. Expected: aucune erreur.
- [ ] **Step 3: Commit** `feat(actus): publication depuis l'espace membre`.

### Task 8: Vérification visuelle, guide Instagram, mémoire

**Files:**
- Create (hors dépôt) : `<scratchpad>/tuto/demo-actus.mjs` sur le modèle de `demo-vrais.mjs` (harnais, port 3003, `/api/planning` servi par le harnais, le reste relayé vers Vite 5175), avec un faux `UrlFetchApp` qui renvoie 3 vidéos et 1 image.
- Create: `docs/guide-instagram.md` (pas à pas pour l'utilisateur, voir ci-dessous)
- Modify: mémoire du projet (nouveau fichier `project_phoenix_actualites.md` et ligne dans `MEMORY.md`)

- [ ] **Step 1: Run** la démo et vérifier avec captures, téléphone (375) et ordinateur (1440) : liste vide, liste avec articles et réels, fenêtre d'un réel (iframe seulement après clic : vérifier `document.querySelectorAll('iframe').length === 0` avant), article avec galerie, accueil, pied de page, menu de 1280 à 1920 px, espace membre (tuteur sans carte, publieur, Bureau avec « Qui peut publier »), création d'un article avec photo jusqu'à sa publication, « réduire les animations ».
- [ ] **Step 2: Write** `docs/guide-instagram.md` : créer une application sur developers.facebook.com (type Entreprise), ajouter le produit « Instagram » (API avec connexion Instagram), ajouter @phoenixedc comme testeur Instagram et accepter l'invitation depuis l'application Instagram, générer la clé du compte, la coller dans Apps Script (Paramètres du projet, Propriétés du script) sous `INSTAGRAM_TOKEN`, lancer `installerSynchroInstagram` puis `synchroInstagram` depuis l'éditeur, vérifier l'onglet `ReelsInstagram`, lire `INSTAGRAM_LAST_ERROR` en cas de souci.
- [ ] **Step 3: Run** tous les fichiers de test un par un. Expected: tous PASS.
- [ ] **Step 4: Commit** `docs(actus): guide de branchement Instagram` (le guide seulement ; la démo reste hors dépôt).
