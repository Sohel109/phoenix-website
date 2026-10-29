# Présence des enfants par projet : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un onglet « Présence enfants » où le chef de projet tient la liste des enfants de son projet, fait l'appel à chaque séance et consulte les taux, et où le Bureau voit et corrige tous les projets.

**Architecture:** Quatre actions dans le Google Apps Script existant (`getChildrenData`, `addChildren`, `removeChild`, `saveChildAttendance`), appelées en `POST` via le relais `/api/planning`, protégées par le jeton de session du vote. Deux nouveaux onglets du Sheet (`Enfants`, `PresencesEnfants`). Côté React : fonctions réseau dans `planningData.ts`, validation de réponse, hook, trois cartes et une page, sur le modèle du vote.

**Tech Stack:** Google Apps Script (ES5, exécuté sous Node avec `scripts/lib/apps-script-harness.mjs`), `node:test`, React 19 + TypeScript + Tailwind, react-router 7.

**Spec:** [docs/superpowers/specs/2026-10-29-presence-enfants-design.md](../specs/2026-10-29-presence-enfants-design.md)

## Global Constraints

- Accès : rôles `chef_projet` et `bureau` seulement. Un CDP n'accède qu'aux projets de la colonne J « Projets enfants » de son compte (liste d'entiers séparés par des virgules, éventuellement un nombre seul), remplie par le Bureau. La colonne F ne donne aucun accès. Un CDP sans projet ne voit rien. Le Bureau accède aux projets 1 à 9 (`CHILDREN_PROJECT_IDS`).
- Le rôle et les projets viennent toujours de la première feuille du Sheet, jamais de la requête. Jeton vérifié avant toute lecture ou écriture (`code: unauthenticated`), puis rôle (`forbidden`), puis projet (`forbidden`).
- Données sur les enfants : prénom et initiale du nom. Nom nettoyé (espaces en trop retirés), coupé à 40 caractères, refusé s'il est vide. Doublon (même nom, casse ignorée, dans le même projet parmi les enfants actifs) ignoré.
- Séance = (projet, date `YYYY-MM-DD` heure de Paris). Date future ou mal formée refusée (`code: invalid`). Au plus un appel par projet et par jour : réenregistrer remplace.
- Année scolaire : du 1er septembre au 31 août, calculée à partir de la date du jour à Paris (`2026-2027` à partir du 2026-09-01).
- Retirer un enfant le désactive (`active` = `false`), il n'est jamais effacé. Ses présences passées restent dans le bilan du projet.
- Onglets : `Enfants` (`id`, `projectId`, `name`, `active`, `createdAt`), `PresencesEnfants` (`projectId`, `date`, `childId`, `present`, `markedBy`, `markedAt`).
- Réponses d'erreur : `{ success: false, code, message }` avec les codes `unauthenticated`, `forbidden`, `invalid`, `error` (réutiliser `voteFail`).
- Aucune modification de la connexion, des mots de passe, des réservations ni du vote. Aucun nouveau fichier dans `api/`.
- Textes en français, sans émojis ni tirets cadratins. Style des pages du planning existantes. Pas de `push` sans confirmation de l'utilisateur. `seintinelles/` n'entre jamais dans un commit.

## Review Focus

- Un tuteur, ou un CDP d'un autre projet, qui devine un `projectId` ou un `childId` : refus, aucun nom renvoyé (Tâches 1 et 2).
- Sheets convertit la date `2026-10-29` en objet `Date` à la relecture : les appels et les bilans doivent rester corrects (Tâche 2).
- Un nom collé avec des lignes vides, des espaces en trop ou un doublon (Tâche 1).
- Enregistrer un appel pour un projet sans enfant actif, ou avec un `childId` d'un autre projet dans `presentIds` (Tâche 2).
- Un enfant retiré après des appels : le taux du projet ne bouge pas, il disparaît des listes (Tâche 2).

## Structure des fichiers

- `google-apps-script.js` : modifié. Bloc « PRÉSENCE DES ENFANTS » (constantes, aides, `handleChildrenAction`, les quatre actions), appelé dans `doPost` après le vote.
- `scripts/lib/apps-script-harness.mjs` : modifié. Les utilisateurs de test ont une colonne projets ; la date des appels est convertie en `Date` comme le fait Sheets.
- `scripts/test-children-logic.mjs`, `scripts/test-children-client.mjs` : créés, ajoutés à `npm run test:vote`.
- `src/data/planningData.ts` : modifié (type `ChildrenData`, quatre fonctions réseau). `src/data/childrenResponse.ts` : créé. `src/hooks/useChildrenData.ts` : créé.
- `src/components/planning/ChildrenAttendanceCard.tsx`, `ChildrenRosterCard.tsx`, `ChildrenSummaryCard.tsx`, `src/pages/planning/PlanningPresenceEnfants.tsx` : créés. `App.tsx`, `PlanningDashboard.tsx` : modifiés.

---

### Task 1: Droits, liste des enfants et lecture

**Files:**
- Modify: `google-apps-script.js` (nouveau bloc après le vote, appel dans `doPost` ligne ~69), `scripts/lib/apps-script-harness.mjs`, `package.json`, `docs/superpowers/specs/2026-10-29-presence-enfants-design.md`
- Create: `scripts/test-children-logic.mjs`

**Interfaces:**
- Produces (script) : `handleChildrenAction(action, postData)` renvoie `null` si l'action n'est pas une des quatre, sinon l'objet de réponse. `readChildrenUsers()` renvoie `{ id: string, name: string, role: string, projectIds: number[] }[]`. `childrenAccess(users, requesterId, projectId)` renvoie l'utilisateur ou une erreur `voteFail`. Réponse de `getChildrenData` :
  `{ success: true, isBureau: boolean, projects: number[], projectId: number | null, date: string, children: { id: string, name: string }[], attendance: { date: string, presentIds: string[] } | null, summary: null | { schoolYear: string, childCount: number, sessionCount: number, rate: number | null, children: { id: string, name: string, sessions: number, present: number, rate: number | null }[] }, overview: null | { projectId: number, childCount: number, sessionCount: number, rate: number | null }[] }`. Dans cette tâche `attendance`, `summary` et `overview` valent `null` (remplis en Tâche 2).
- Produces (harness) : `loadScript({ users: [{ id, name, role, login, password, projects?: string }], ... })` remplit la colonne F avec `projects`.
- Erreurs : `addChildren` renvoie `{ success: true, added: number }`, `removeChild` renvoie `{ success: true }`.

- [ ] **Step 1: Étendre le harness.** Dans `FakeSpreadsheet`, la colonne F des utilisateurs prend `u.projects ?? ''`. Aucun test ne doit changer de résultat : `npm run test:vote` reste vert.
- [ ] **Step 2: Écrire les tests (rouges).** Fixture : `b1` bureau (projet `2`), `c4` chef_projet (`4`), `c47` chef_projet (`4,7`), `c0` chef_projet (vide), `t4` tuteur (`4`). Dans `scripts/test-children-logic.mjs`, avec `h.call('getChildrenData', { requesterId })` :
  - `un tuteur est refusé` : `code === 'forbidden'` pour `getChildrenData`, `addChildren`, `removeChild`, `saveChildAttendance`.
  - `sans jeton valide : unauthenticated` : `h.raw('getChildrenData', { requesterId: 'c4' })` et un jeton d'un autre compte donnent `unauthenticated`.
  - `un CDP voit ses projets` : `c4` → `projects` `[4]`, `c47` → `[4, 7]`, `b1` → `[1,2,3,4,5,6,7,8,9]` avec `isBureau: true`, `c0` → `projects: []`, `projectId: null`.
  - `un CDP est refusé sur le projet d'un autre` : `c4` avec `projectId: 7` → `forbidden`, et la réponse ne contient aucun nom d'enfant du projet 7 (ajouté par `c47`).
  - `la colonne projets numérique est acceptée` : avec `numericIds: true`, `c4` voit `[4]`.
  - `ajout` : `addChildren` avec `['Inès B.', '  Karim   D. ', '', 'inès b.']` ajoute 2 enfants (`added: 2`), noms `Inès B.` et `Karim D.`, ordre conservé, `active` vaut `true` dans la feuille `Enfants`.
  - `nom coupé et refus du vide` : un nom de 60 caractères est coupé à 40 ; `names: []` ou `['  ']` donne `code: 'invalid'`.
  - `retrait` : après `removeChild`, l'enfant n'est plus dans `children`, sa ligne existe toujours avec `active === false` ; un `childId` d'un autre projet ou inconnu donne `invalid`.
  - `projectId absent` : sans `projectId`, la réponse porte sur le premier projet accessible. `projectId: 12` donne `invalid`.
- [ ] **Step 3: Lancer** `npm run test:vote` : les nouveaux tests échouent (action inconnue).
- [ ] **Step 4: Implémenter dans `google-apps-script.js`.**
  - `var CHILDREN_PROJECT_IDS = [1,2,3,4,5,6,7,8,9]` et `var CHILDREN_SHEETS = { children: { name: 'Enfants', headers: [...] }, attendance: { name: 'PresencesEnfants', headers: [...] } }`.
  - `readChildrenUsers()` : lit la première feuille comme `readVoteUsers`, plus `projectIds` (colonne F, découpée sur les virgules, entiers valides seulement, cellule numérique acceptée).
  - `childrenAccess(users, requesterId, projectId)` : applique les contrôles du Global Constraints dans l'ordre jeton (déjà fait en amont), rôle, projet.
  - `handleChildrenAction(action, postData)` : même structure que `handleVoteAction` (jeton avec `requesterId`, verrou sur les écritures, `try/catch` vers `voteFail('error', ...)`).
  - Nettoyage d'un nom : `cleanChildName(value)` renvoie la chaîne nettoyée et coupée, vide si rien. Identifiants d'enfants : `Utilities.getUuid().substring(0, 8)`. `createdAt` = `todayKeyParis()`.
  - Les quatre noms d'action sont reconnus dès cette tâche et les contrôles d'accès passent avant l'aiguillage. `saveChildAttendance` répond `voteFail('invalid', 'Pas encore disponible')` une fois les contrôles passés, jusqu'à la Tâche 2.
  - Dans `doPost`, juste après le bloc du vote, appeler `handleChildrenAction` de la même façon.
- [ ] **Step 5: Lancer** `npm run test:vote` : tout est vert (les tests précédents inclus).
- [ ] **Step 6: Corriger la spec** : la ligne « doublons exacts » devient « même nom, sans tenir compte de la casse ».
- [ ] **Step 7: Ajouter `scripts/test-children-logic.mjs` au script `test:vote` de `package.json`, puis commit** : `git add google-apps-script.js scripts package.json docs && git commit -m "feat(enfants): droits et liste des enfants par projet"`.

---

### Task 2: Appel, correction et bilans

**Files:**
- Modify: `google-apps-script.js`, `scripts/lib/apps-script-harness.mjs`, `scripts/test-children-logic.mjs`

**Interfaces:**
- Consumes : Task 1 (`handleChildrenAction`, `childrenAccess`, fixture, `CHILDREN_SHEETS`).
- Produces : `normalizeDateKey(value)` (objet `Date` Sheets ou chaîne vers `yyyy-MM-dd` Paris), `schoolYearFor(todayKey)` renvoie `{ label: string, start: string, end: string }`, `summarizeChildren(children, rows, year)`. `saveChildAttendance` renvoie `{ success: true, saved: number }`. `getChildrenData` remplit `attendance`, `summary`, et `overview` (Bureau seulement : une entrée par projet 1 à 9, dans l'ordre).
- Harness : l'option `dateifyMonthKeys` convertit aussi la colonne `date` (colonne B, index 1) de `PresencesEnfants` en `Date` à minuit heure de Paris, quand elle ressemble à `YYYY-MM-DD`. `parisMidnight` accepte une clé `YYYY-MM-DD` en plus de `YYYY-MM`.

- [ ] **Step 1: Écrire les tests (rouges)**, avec `h.setNow('2026-10-29')`, projet 4 avec `Inès B.`, `Karim D.`, `Lina M.` ajoutés par `c4` :
  - `appel enregistré` : `saveChildAttendance` `{ projectId: 4, date: '2026-10-29', presentIds: [ines, karim] }` → `saved: 3`. La feuille `PresencesEnfants` a 3 lignes : Inès et Karim `true`, Lina `false`, `markedBy: 'c4'`. `getChildrenData` pour cette date renvoie `attendance.presentIds` égal à `[ines, karim]` ; pour une autre date, `attendance === null`.
  - `correction` : réenregistrer le même jour avec `[lina]` laisse 3 lignes en tout (pas 6) et `presentIds === [lina]`.
  - `date future ou invalide` : `'2026-10-30'`, `'2026-02-30'`, `'29/10/2026'` donnent `invalid` et n'écrivent rien.
  - `identifiant étranger ignoré` : un `childId` du projet 7 dans `presentIds` n'ajoute aucune ligne et n'est pas marqué présent.
  - `projet sans enfant` : appel pour un projet sans enfant actif donne `invalid`.
  - `enfant ajouté après l'appel` : un enfant ajouté ensuite n'a aucune ligne sur la date passée, et son `sessions` vaut 0 dans le bilan.
  - `bilan` : deux appels (29/10 : Inès et Karim présents, Lina absente ; 28/10 : Inès présente seule, Karim et Lina absents) donnent `summary.sessionCount === 2`, Inès `{ sessions: 2, present: 2, rate: 100 }`, Karim `rate: 50`, Lina `rate: 0`, `summary.rate === 50` (3 présences sur 6), `summary.schoolYear === '2026-2027'`.
  - `année scolaire` : un appel au `2026-08-31` n'est pas dans le bilan quand on est le `2026-10-29` ; `schoolYearFor('2026-08-31').label === '2025-2026'` et `schoolYearFor('2026-09-01').label === '2026-2027'`.
  - `enfant retiré` : après `removeChild` d'Inès, `summary.rate` et `sessionCount` du projet ne changent pas, et Inès n'est plus dans `summary.children`.
  - `rate null` : un projet sans appel a `rate: null` et `sessionCount: 0`.
  - `Bureau` : `b1` voit `overview` avec 9 entrées dont le projet 4 à `sessionCount: 2` ; un CDP a `overview: null`. `b1` peut enregistrer un appel pour le projet 4 (`markedBy: 'b1'`).
  - `dates converties par Sheets` : avec `dateifyMonthKeys: true`, `attendance` et `summary` donnent les mêmes résultats que sans, et réenregistrer un appel ne laisse pas de doublon.
- [ ] **Step 2: Lancer** : les nouveaux tests échouent.
- [ ] **Step 3: Implémenter.** `saveChildAttendance` : valide la date (format, date réelle, pas dans le futur par comparaison de chaînes avec `todayKeyParis()`), supprime les lignes existantes du couple (projet, date) en partant du bas (`deleteRow`), écrit une ligne par enfant actif avec `markedAt` au format `dd/MM/yyyy à HH:mm`. Écrire la colonne `date` en texte (`setNumberFormat('@')` à la création de l'onglet, comme `getVoteSheet`). `summarizeChildren` ne compte que les lignes dont la date est dans l'année scolaire ; le taux d'un enfant vaut `round(présences / séances * 100)` ou `null` sans séance ; le taux du projet vaut `round(total présences / total lignes * 100)` ; `sessionCount` compte les dates distinctes.
- [ ] **Step 4: Lancer** `npm run test:vote` : tout est vert.
- [ ] **Step 5: Commit** : `git commit -m "feat(enfants): appel, correction et bilans"`.

---

### Task 3: Côté client : types, réseau, validation

**Files:**
- Modify: `src/data/planningData.ts`, `package.json`
- Create: `src/data/childrenResponse.ts`, `scripts/test-children-client.mjs`

**Interfaces:**
- Consumes : forme de réponse de la Tâche 1 et 2.
- Produces : `export interface ChildrenData` (champs de la réponse, `projectId: number | null`, `summary` et `overview` nullables). `parseChildrenData(raw: unknown): ChildrenData | null`, `todayKeyParis(): string` (date du jour à Paris, `YYYY-MM-DD`), dans `childrenResponse.ts`. Dans `planningData.ts` : `fetchChildrenData(requesterId: string, token: string, projectId: number | null, date: string): Promise<{ ok: true; data: ChildrenData } | { ok: false; message: string; code?: string }>`, `addChildrenApi(requesterId, token, projectId, names: string[])`, `removeChildApi(requesterId, token, projectId, childId)`, `saveChildAttendanceApi(requesterId, token, projectId, date, presentIds: string[])`, les trois derniers renvoyant `Promise<{ success: boolean; message: string; code?: string }>`.
- `postVoteAction` devient `postPlanningAction(body, unavailableMessage)`, et `postVoteAction` reste un appel de cette fonction avec le message du vote. Le message d'indisponibilité des enfants est « La présence des enfants n'est pas disponible pour le moment. »

- [ ] **Step 1: Écrire les tests (rouges)** dans `scripts/test-children-client.mjs` :
  - `parseChildrenData accepte une vraie réponse` (objet complet) et `accepte une réponse sans projet` (`projects: []`, `projectId: null`, `summary: null`).
  - `rejette la réponse de connexion d'un ancien script`, `Identifiants incorrects`, `null`, une chaîne, `children: 'x'`, `projects: 'x'`.
  - `todayKeyParis` renvoie une chaîne `^\d{4}-\d{2}-\d{2}$`.
- [ ] **Step 2: Lancer** : échec (module absent).
- [ ] **Step 3: Implémenter** `childrenResponse.ts` et les fonctions de `planningData.ts`. `todayKeyParis` utilise `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' })`.
- [ ] **Step 4: Lancer** `npm run test:vote` puis `npx tsc -p tsconfig.app.json --noEmit` : verts.
- [ ] **Step 5: Ajouter `scripts/test-children-client.mjs` à `test:vote`, puis commit** : `git commit -m "feat(enfants): client réseau et validation de réponse"`.

---

### Task 4: Page, cartes et accès

**Files:**
- Create: `src/hooks/useChildrenData.ts`, `src/components/planning/ChildrenAttendanceCard.tsx`, `ChildrenRosterCard.tsx`, `ChildrenSummaryCard.tsx`, `src/pages/planning/PlanningPresenceEnfants.tsx`
- Modify: `src/App.tsx` (route `/planning/presences-enfants` dans `PlanningGuard`), `src/pages/planning/PlanningDashboard.tsx` (carte), `docs/superpowers/specs/2026-10-29-presence-enfants-design.md`

**Interfaces:**
- Consumes : Task 3 (`ChildrenData`, `fetchChildrenData`, les trois fonctions d'écriture, `todayKeyParis`, `createLatestGate` de `voteResponse.ts`).
- Produces : `useChildrenData(projectId: number | null, date: string)` renvoie `{ data: ChildrenData | null, loading: boolean, error: string | null, errorCode: string | null, reload: () => Promise<void> }`, construit comme `useVoteData` (relance quand le projet ou la date change, seule la dernière réponse compte). `ChildrenAttendanceCard` reçoit `{ data, date, disabled, onDateChange(date), onSave(presentIds: string[]) }`. `ChildrenRosterCard` reçoit `{ data, disabled, onAdd(names: string[]), onRemove(childId: string) }`. `ChildrenSummaryCard` reçoit `{ data }`.

- [ ] **Step 1: Implémenter le hook** sur le modèle de `useVoteData` (même gestion du jeton `currentUser.token`).
- [ ] **Step 2: Implémenter les trois cartes.**
  - Appel : une case par enfant (aucune cochée par défaut, pré-cochées si `data.attendance` existe pour la date), champ date plafonné à aujourd'hui, bouton « Enregistrer » ou « Enregistrer les corrections » si l'appel existe, message si la liste est vide qui renvoie vers la carte Liste.
  - Liste : zone de texte multi-lignes avec le rappel « Prénom et initiale du nom seulement (par exemple Inès B.) », bouton « Ajouter », liste des enfants actifs avec « Retirer » (confirmation avant de retirer).
  - Bilan : taux du projet, tableau par enfant (séances, présences, taux), et pour le Bureau le tableau `overview` avec le nom de chaque projet (via `projectsData`).
- [ ] **Step 3: Implémenter la page** : titre « Présence enfants », refus pour les rôles autres que `chef_projet` et `bureau` (même mise en page que `PlanningValidation`), sélecteur de projet si `data.projects.length > 1` (noms via `projectsData`), état « session expirée » avec « Se reconnecter » comme `PlanningVote`, action puis `reload()`.
- [ ] **Step 4: Brancher** la route et ajouter dans `PlanningDashboard.tsx` une carte `chefOnly: true` : libellé « Présence enfants », description « Faites l'appel des enfants de votre projet », route `/planning/presences-enfants`. Pas de lien dans la barre du haut (elle n'est pas visible sur téléphone et les autres pages de CDP n'y sont pas non plus). Mettre la spec à jour : « entrée dans le menu » devient « carte sur le tableau de bord, réservée aux CDP et au Bureau ».
- [ ] **Step 5: Vérifier** `npx tsc -p tsconfig.app.json --noEmit` et `npx eslint` sur les fichiers touchés : aucune nouvelle erreur.
- [ ] **Step 6: Commit** : `git commit -m "feat(enfants): page de présence des enfants"`.

---

### Task 5: Vérification dans le navigateur et finition

**Files:**
- Modify (hors dépôt, dossier temporaire de la session) : le faux serveur de démonstration `demo-api.mjs`, qui exécute le vrai script via le harness. Aucune modification du dépôt.

**Interfaces:**
- Consumes : Tâches 1 à 4.

- [ ] **Step 1: Lancer** le faux serveur de démonstration avec des comptes fictifs (un Bureau, un CDP du projet 4, un tuteur) et le serveur Vite sur le port 5175.
- [ ] **Step 2: Parcours à vérifier avec Playwright**, captures à l'appui : le tuteur ne voit pas la carte et la page directe affiche « Accès restreint » ; le CDP ajoute 3 enfants, fait un appel, le corrige, voit les taux ; le Bureau change de projet, voit le tableau de tous les projets et fait un appel ; session expirée proposant « Se reconnecter » ; script indisponible affichant le message d'indisponibilité ; téléphone (largeur 375) lisible.
- [ ] **Step 3: Lancer** `npm run test:vote`, `npx tsc -p tsconfig.app.json --noEmit`, lint des fichiers touchés : tout est vert (hors les erreurs de lint déjà présentes avant ce travail).
- [ ] **Step 4: Copier le script dans le presse-papiers** (`LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pbcopy < google-apps-script.js`, vérifié avec `pbpaste | cmp`).
- [ ] **Step 5: Rapporter** à l'utilisateur : ce qui est fait, les captures, les étapes de mise en ligne (recoller le script, redéployer, puis chaque CDP saisit ses enfants), et demander l'accord avant le `push`.
