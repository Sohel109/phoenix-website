# Fiches des nommés au tuteur du mois : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à chaque nommé du tuteur du mois une fiche (photo, accomplissements, stats) remplie par le Bureau, affichée en galerie façon Ballon d'Or sur le site public et dans la page Vote de l'espace membre.

**Architecture:** Un onglet `FichesNommes` et un dossier Drive privé côté Apps Script, trois actions Bureau en `POST` (jeton) et deux lectures publiques en `GET` relayées par `api/planning.js` (cache CDN). Côté React : validation des réponses et calculs purs testés sous Node, trois composants partagés (collage animé, carte, fiche), deux pages publiques, la page Vote enrichie et un formulaire Bureau.

**Tech Stack:** Google Apps Script (ES5), Node `node:test` + harnais `scripts/lib/apps-script-harness.mjs`, React 19 + TypeScript + Tailwind, react-router 7, framer-motion.

**Spec:** [docs/superpowers/specs/2026-11-23-fiches-nommes-design.md](../specs/2026-11-23-fiches-nommes-design.md)

## Global Constraints

- Onglet `FichesNommes` : `monthKey`, `userId`, `displayName`, `accomplishments` (JSON), `stats` (JSON), `photoFileId`, `updatedAt`. `monthKey` = `win.selectionMonthKey` au moment de l'écriture.
- Dossier Drive « Phoenix - Photos nommés », jamais partagé ; un dossier ou un fichier à la corbeille est ignoré.
- Limites : nom affiché 1 à 60 caractères ; accomplissements 0 à 12 lignes non vides de 160 caractères max ; stats 0 à 8 lignes, libellé 1 à 30 et valeur 1 à 30 caractères ; photo JPEG en base64, 1 500 000 caractères max.
- Écritures réservées au rôle `bureau` lu dans la première feuille, avec jeton valide. Lectures publiques sans jeton, qui ne renvoient jamais `userId`.
- Photo recadrée en 4:5 et réduite à 900 px de large (JPEG, qualité 0,85) sur l'appareil.
- Slug : nom affiché sans accents, en minuscules, `[^a-z0-9]+` remplacé par `-`, tirets de bord retirés ; doublon du même mois suffixé `-2`, `-3`.
- Pas de nouveau fichier dans `api/`. Aucune modification de l'authentification ni des actions existantes autres que `getVoteData` et `setVoteCandidate`.
- Textes en français, sans émojis ni tirets cadratins. Texte saisi affiché comme du texte, jamais en HTML.
- Animation du collage coupée avec `prefers-reduced-motion: reduce`.
- Pas de `push` sans « push » de l'utilisateur. `seintinelles/` jamais commité.

## Review Focus

1. **Un non-Bureau qui force l'API** : `saveNomineeProfile`, `uploadNomineePhoto`, `removeNomineePhoto` refusés, fiche inchangée. Test Task 1.
2. **Fuite de données par la lecture publique** : `getNominees` ne contient ni `userId`, ni fiche sans photo, ni fiche d'un membre qui n'est plus candidat. `getNomineePhoto` refuse un identifiant Drive qui n'est pas la photo d'une fiche (par exemple l'identifiant du Sheet). Test Task 2.
3. **Mois affiché pendant la bascule** : le 1er du mois, le nouveau mois n'a pas encore de photo ; la page doit garder le mois précédent avec son gagnant. Test Task 2.
4. **Décocher un nommé** : la fiche disparaît et la photo part à la corbeille ; recocher repart d'une fiche vide. Test Task 1.
5. **Réponse d'un script pas encore redéployé** : `parseNominees` et `parseVoteData` acceptent l'absence de fiches sans planter, la page publique affiche « Les nommés du mois arrivent bientôt ». Test Task 4.

---

### Task 1: Fiches côté script (écritures Bureau et lecture dans `getVoteData`)

**Files:**
- Modify: `scripts/lib/apps-script-harness.mjs` (faux Drive : `folder.createFile(blob)`, `DriveApp.getFileById` pour les photos, `Utilities.base64Decode/base64Encode/newBlob`, méthode `get(action, params)` qui appelle `doGet`)
- Modify: `google-apps-script.js` (section vote)
- Create: `scripts/test-nominees-logic.mjs`, ajouté à `test:vote` dans `package.json`

**Interfaces:**
- Produces (POST, jeton Bureau) :
  - `saveNomineeProfile { requesterId, userId, displayName, accomplishments: string[], stats: {label, value}[] }` → `{ success: true }`
  - `uploadNomineePhoto { requesterId, userId, data: string(base64 JPEG) }` → `{ success: true, photoId }`
  - `removeNomineePhoto { requesterId, userId }` → `{ success: true }`
  - codes d'erreur : `forbidden`, `not_candidate`, `bad_request`, `too_large`
- Produces (`getVoteData`) : chaque élément de `candidates` gagne `profile: NomineeProfile | null` (fiche du `monthKey`) ; chaque élément de `bureau.members` gagne `profile: NomineeProfile | null` (fiche du `selectionMonthKey`). `NomineeProfile = { displayName, slug, accomplishments, stats, photoId: string | null, updatedAt }`.
- Fonctions de script : `nomineeSlug(name)`, `readNomineeProfiles(sheet, monthKey)`, `getNomineePhotoFolder()`.

- [ ] **Step 1: Tests qui échouent** (`test-nominees-logic.mjs`, vote du 2026-11-24, Bureau `d4`) :
  - `saveNomineeProfile : le Bureau enregistre la fiche d'un candidat du mois en préparation` (ligne écrite, `getVoteData` du Bureau renvoie `members[a1].profile.displayName`)
  - `saveNomineeProfile : refusé à un tuteur, rien n'est écrit` (`code === 'forbidden'`)
  - `saveNomineeProfile : refusé pour un membre non candidat` (`not_candidate`)
  - `saveNomineeProfile : limites` (nom vide, 13 accomplissements, accomplissement de 161 caractères, 9 stats → `bad_request` ; lignes vides retirées)
  - `uploadNomineePhoto : range la photo dans le dossier privé et met l'ancienne à la corbeille`
  - `uploadNomineePhoto : refusée au-delà de 1 500 000 caractères` (`too_large`)
  - `removeNomineePhoto : retire la photo et la met à la corbeille`
  - `setVoteCandidate selected=false : supprime la fiche et met la photo à la corbeille ; recocher donne profile null`
  - `getVoteData : un tuteur voit la fiche des candidats mais pas bureau`
  - `nomineeSlug : « Chloé Dû-Pont » donne « chloe-du-pont »`
- [ ] **Step 2:** `npm run test:vote` → les nouveaux tests échouent (actions inconnues).
- [ ] **Step 3:** Implémenter dans `google-apps-script.js` : `VOTE_SHEETS.profiles`, les trois actions dans `handleVoteAction`, les fiches dans `voteGetData`, la suppression dans `voteSetCandidate`. Le slug est calculé à la lecture (doublons du même mois suffixés dans l'ordre de la feuille).
- [ ] **Step 4:** `npm run test:vote` → tout passe.
- [ ] **Step 5:** Commit `feat(vote): fiches des nommés côté script`.

### Task 2: Lectures publiques `getNominees` et `getNomineePhoto`

**Files:**
- Modify: `google-apps-script.js` (`doGet`)
- Modify: `scripts/test-nominees-logic.mjs`

**Interfaces:**
- Consumes: Task 1 (`readNomineeProfiles`, onglets).
- Produces (GET, public) :
  - `action=getNominees` → `{ success: true, monthKey: string | null, nominees: PublicNominee[] }`, `PublicNominee = { displayName, slug, accomplishments, stats, photoId, updatedAt, isWinner }`. Gagnant en premier, puis ordre de la feuille des utilisateurs.
  - `action=getNomineePhoto&id=<photoId>` → `{ success: true, mimeType: 'image/jpeg', data: base64 }` ou `{ success: false, code: 'not_found' }`.

- [ ] **Step 1: Tests qui échouent** :
  - `getNominees : seulement les fiches avec photo, sans userId` (`JSON.stringify` de la réponse ne contient aucun identifiant de compte)
  - `getNominees : prend le mois le plus récent qui a une photo` (fiches en octobre avec photo, novembre sans photo → `monthKey === '2026-10'`)
  - `getNominees : ignore une fiche dont le membre n'est plus candidat`
  - `getNominees : marque le gagnant publié et le place en premier`
  - `getNominees : aucun nommé → monthKey null, liste vide`
  - `getNomineePhoto : renvoie la photo d'une fiche, refuse l'identifiant du Sheet et une photo à la corbeille`
- [ ] **Step 2:** `npm run test:vote` → échec.
- [ ] **Step 3:** Implémenter les deux branches de `doGet`.
- [ ] **Step 4:** `npm run test:vote` → tout passe.
- [ ] **Step 5:** Commit `feat(vote): lecture publique des fiches des nommés`.

### Task 3: Relais `api/planning.js`

**Files:**
- Modify: `api/planning.js`

**Interfaces:**
- Produces : `GET /api/planning?nominees=1` → JSON de `getNominees`, `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600`. `GET /api/planning?photo=<id>&v=<updatedAt>` → octets JPEG, `Content-Type: image/jpeg`, `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800` ; 404 si `success` est faux. `id` limité à `[A-Za-z0-9_-]{10,100}`. Sans paramètre : comportement actuel inchangé.

- [ ] **Step 1:** Ajouter les deux branches avant la branche `GET` actuelle.
- [ ] **Step 2:** Vérification : `node -e` qui importe le handler avec un faux `fetch` et un faux `res`, pour `?photo=abc` invalide (400), `?photo=<id valide>` (200, en-têtes), sans paramètre (appel `getPlanningData`).
- [ ] **Step 3:** Commit `feat(api): relais public des fiches et photos des nommés`.

### Task 4: Données côté client

**Files:**
- Create: `src/data/nominees.ts`
- Modify: `src/data/planningData.ts` (types `NomineeProfile`, `NomineeStat`, `PublicNominee`, champs `profile`, fonctions API), `src/data/voteResponse.ts`
- Create: `scripts/test-nominees-client.mjs`, ajouté à `test:vote`

**Interfaces:**
- Produces :
  - `parseNominees(raw: unknown): { monthKey: string | null; nominees: PublicNominee[] } | null`
  - `parseVoteData` : normalise `profile` absent en `null` pour chaque candidat et membre.
  - `computeNomineeStats(input: { userId: string; projectIds: number[]; bookings; manualHours; slots; today: Date; projectName: (id: number) => string }): NomineeStat[]` → `[{label:'Projet', value}, {label:'Heures validées', value:'42 h'}, {label:'Séances', value:'18'}]` depuis le 1er septembre de l'année scolaire ; heures avec une décimale au plus (« 12,5 h »).
  - `AUTO_STAT_LABELS = ['Projet', 'Heures validées', 'Séances']` et `mergeAutoStats(current: NomineeStat[], fresh: NomineeStat[]): NomineeStat[]` (remplace les lignes automatiques, garde les autres et leur ordre).
  - `portraitCrop(width: number, height: number): { sx, sy, sw, sh, outW: 900, outH: 1125 }` (recadrage centré 4:5 ; pas d'agrandissement : `outW = min(900, sw)`).
  - `fetchPublicNominees()`, `nomineePhotoUrl(photoId, updatedAt)`, `saveNomineeProfileApi`, `uploadNomineePhotoApi`, `removeNomineePhotoApi`.

- [ ] **Step 1: Tests qui échouent** : `parseNominees` (réponse valide, réponse de connexion → null, nominee incomplet écarté), `parseVoteData` sans `profile` → `profile === null`, `computeNomineeStats` (réservation d'août exclue, heures manuelles comptées, « 12,5 h »), `mergeAutoStats`, `portraitCrop` (paysage 4000x3000, portrait 900x2000, petite image 600x750).
- [ ] **Step 2:** `npm run test:vote` → échec.
- [ ] **Step 3:** Implémenter.
- [ ] **Step 4:** `npm run test:vote` + `npx tsc --noEmit -p .` → OK.
- [ ] **Step 5:** Commit `feat(vote): données des fiches côté client`.

### Task 5: Composants partagés

**Files:**
- Create: `src/components/nominees/NomineeCollage.tsx`, `NomineeCard.tsx`, `NomineeProfileView.tsx`
- Modify: `src/index.css` (animation `nominee-jitter`)

**Interfaces:**
- `NomineeCollage({ photoUrl: string | null; name: string; animated?: boolean; tone: 'light' | 'dark' })` : photo 4:5, bord blanc, angle de -2°, `MaskingTape` en haut ; sans photo, initiales. `animated` applique `nominee-jitter` (3 positions, `steps`, environ 0,9 s par cycle) sauf `prefers-reduced-motion`.
- `NomineeCard({ name, photoUrl, subtitle?, isWinner?, tone, href?: string, onClick?, footer?: ReactNode })`.
- `NomineeProfileView({ name, photoUrl, accomplishments, stats, isWinner, monthLabel, tone, actions?: ReactNode, others?: {name, href}[] })` : nom en très gros, collage animé, bandeau de stats, liste « Ses accomplissements ».

- [ ] **Step 1:** Implémenter les trois composants et l'animation.
- [ ] **Step 2:** `npx tsc --noEmit -p .` et `npx eslint` sur les fichiers → OK.
- [ ] **Step 3:** Commit `feat(vote): composants des fiches des nommés`.

### Task 6: Pages publiques

**Files:**
- Create: `src/pages/TuteurDuMois.tsx` (grille et fiche selon `:slug`)
- Modify: `src/App.tsx` (routes `/tuteur-du-mois` et `/tuteur-du-mois/:slug`), `src/components/layout/Header.tsx` (lien entre « Événements » et « Partenaires »), `public/sitemap.xml`

- [ ] **Step 1:** Implémenter : chargement via `fetchPublicNominees`, état de chargement, « Les nommés du mois arrivent bientôt » si vide ou erreur, « Ce nommé n'existe pas » pour un slug inconnu, titre de page et `SEO` comme les autres pages publiques.
- [ ] **Step 2:** `npx tsc --noEmit -p .`, `npx eslint`, `npx vite build` → OK.
- [ ] **Step 3:** Commit `feat(site): page publique des nommés au tuteur du mois`.

### Task 7: Page Vote de l'espace membre

**Files:**
- Modify: `src/pages/planning/PlanningVote.tsx`, `src/App.tsx` (route `/planning/vote/:slug`)

- [ ] **Step 1:** Implémenter : quand le vote est ouvert, les candidats deviennent des `NomineeCard` (tone `dark`) qui mènent à `/planning/vote/<slug>` ; la fiche (`NomineeProfileView`) porte le bouton « Voter pour Prénom » ou « Votre vote » (second clic : retrait), jamais pour soi. Candidat sans fiche : slug calculé côté client avec la même règle, fiche réduite au nom.
- [ ] **Step 2:** `npx tsc --noEmit -p .`, `npx eslint` → OK.
- [ ] **Step 3:** Commit `feat(vote): galerie et fiches dans la page Vote`.

### Task 8: Formulaire Bureau

**Files:**
- Create: `src/components/planning/NomineeProfileEditor.tsx`
- Modify: `src/components/planning/VoteBureauPanel.tsx`

- [ ] **Step 1:** Implémenter : bouton « Fiche » à côté de chaque nommé coché ; modale avec photo (aperçu, choisir, remplacer, retirer ; recadrage via `portraitCrop` et `canvas.toDataURL('image/jpeg', 0.85)`), nom affiché, accomplissements (un par ligne), stats (préremplies avec `computeNomineeStats` si la fiche n'existe pas, « Ajouter une ligne », « Supprimer », « Recalculer » via `mergeAutoStats`), « Enregistrer ». Décocher un nommé qui a une fiche demande confirmation.
- [ ] **Step 2:** `npx tsc --noEmit -p .`, `npx eslint` → OK.
- [ ] **Step 3:** Commit `feat(vote): le Bureau remplit les fiches des nommés`.

### Task 9: Vérification sur une démo locale

**Files:**
- Create (scratchpad, non commité) : serveur Node sur le port 3002 qui sert `/api/planning` en GET et POST à partir du harnais, avec des comptes et une photo de démonstration.

- [ ] **Step 1:** Lancer la démo et le site (`phoenix-dev`), captures Playwright : grille et fiche publiques (téléphone 390 px et ordinateur 1280 px), page Vote ouverte en tuteur, formulaire Bureau avec envoi de photo, mode « réduire les animations ».
- [ ] **Step 2:** `npm run test:vote`, `npx tsc --noEmit -p .`, `npx vite build` → OK.
- [ ] **Step 3:** Corriger ce qui ne va pas, commit si besoin.
