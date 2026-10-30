# Heures manuelles serveur, date de goûter, export, sauvegarde : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enregistrer pour de bon les heures manuelles et les membres renouvelants (aujourd'hui perdus dans le navigateur), ouvrir l'attribution d'heures aux chefs de projet pour leur projet, permettre de changer la date d'un goûter et de l'exporter en Excel, et sauvegarder le Sheet chaque semaine.

**Architecture:** Un gestionnaire `handleHoursAction` (sept actions) et une action `moveGouter` dans le Google Apps Script existant, appelés en `POST` par le relais `/api/planning`, avec jeton de session vérifié d'abord. Deux fonctions de sauvegarde Drive. Côté site : fonctions réseau et validation dans `src/data/`, contexte et page Récap adaptés, page Goûters complétée, export `.xlsx` construit dans le navigateur par une bibliothèque chargée au clic.

**Tech Stack:** Google Apps Script (ES5, exécuté sous Node avec `scripts/lib/apps-script-harness.mjs`), `node:test`, React 19 + TypeScript + Tailwind, `write-excel-file` 4.1.1 (version épinglée, entrée `write-excel-file/universal`).

**Spec:** [docs/superpowers/specs/2026-10-30-heures-gouters-sauvegarde-design.md](../specs/2026-10-30-heures-gouters-sauvegarde-design.md)

## Global Constraints

- Jeton de session vérifié avant toute lecture ou écriture (`code: unauthenticated`). Rôle et projets de l'appelant lus dans la première feuille du Sheet (colonne J « Projets enfants » pour les projets), jamais dans la requête. La colonne F ne donne aucun droit.
- Gestionnaire d'un projet = Bureau, ou chef de projet dont la colonne J contient ce projet (`canManageProject`). Projets 1 à 9 (`CHILDREN_PROJECT_IDS`).
- Heures : de 0,5 à 50, par pas de 0,5. Justification de 8 à 300 caractères après `cleanFreeText`. Nom hors liste (Bureau seulement, `userId` de la forme `custom-...`) nettoyé, 60 caractères. Id d'attribution : `h` + 7 caractères hexadécimaux.
- Chef de projet : attribue seulement pour un de ses projets, à un membre de la liste ayant une réservation de statut différent de `annule` sur un créneau de ce projet (onglet `Bookings`, colonne `slotId` de la forme `slot-<projet>-<jour>`) ; jamais mission générale ni hors liste ; supprime seulement ses propres attributions (`grantedById`) sur un de ses projets. Tuteur : aucune écriture.
- Lecture des heures : chacun reçoit les siennes, le chef de projet aussi celles de ses projets, le Bureau tout. Lecture des exemptions : Bureau et chef de projet tout, tuteur la sienne. Écriture des exemptions et import : Bureau seulement.
- Onglets créés automatiquement, colonnes de texte au format texte : `HeuresManuelles` (`id`, `userId`, `userName`, `hours`, `reason`, `grantedBy`, `grantedById`, `projectId`, `createdAt`), `ExemptionsQuota` (`userId`, `userName`, `grantedBy`, `grantedAt`, `year`, `note`).
- Réponses d'erreur : `{ success: false, code, message }`, codes `unauthenticated`, `forbidden`, `invalid`, `error`. Écritures sous `LockService`.
- Sauvegarde : dossier Drive « Sauvegardes Phoenix », copies `Sauvegarde Phoenix AAAA-MM-JJ`, 8 conservées, jamais de fichier hors de ce dossier supprimé.
- Les anciennes actions sans authentification, `/api/documents`, `/api/team/members` et le formulaire d'abonnement ne sont pas touchés. Aucun nouveau fichier dans `api/`.
- Textes en français, sans émojis ni tirets cadratins. Style des pages du planning existantes. Aucun `push` sans l'accord de l'utilisateur : le script doit être collé et redéployé avant que le site soit en ligne.

## Review Focus

- Un chef de projet qui forge une requête : projet qu'il ne gère pas, `projectId` en texte (`"4"`), mission générale, nom hors liste, membre dont la seule réservation est annulée ou sur un autre projet (Tâche 1).
- Sheets convertit les nombres : heures (`2.5` relu `2,5` ou en texte), `projectId` vide ou `0`, identifiants numériques (Tâche 1).
- Double clic sur « Ajouter » : deux lignes identiques ; import lancé deux fois : doublons (Tâches 1 et 2).
- Script pas encore redéployé : le site doit rester utilisable, avec zéro heure manuelle et un message, sans fausse donnée ni écran cassé (Tâche 6).
- Sauvegarde lancée deux fois le même jour, dossier contenant d'autres fichiers, installation du déclencheur lancée plusieurs fois (Tâche 4).
- Export : goûter sans apport, créneau avec plus de deux inscrits, nom commençant par `=`, caractères interdits dans le nom du fichier (Tâche 7).

## Structure des fichiers

- `google-apps-script.js` : bloc « HEURES MANUELLES ET EXEMPTIONS » (appel dans `doPost` après les goûters), `moveGouter` dans le bloc des goûters, bloc « SAUVEGARDE ».
- `scripts/lib/apps-script-harness.mjs` : faux `DriveApp`, `ScriptApp`, `getId()` du Sheet.
- `scripts/test-hours-logic.mjs`, `scripts/test-backup.mjs`, `scripts/test-hours-client.mjs` : créés ; `scripts/test-gouters-logic.mjs`, `scripts/test-gouters-client.mjs` : complétés ; tous dans `npm run test:vote`.
- `src/data/planningData.ts` : fonctions réseau. `src/data/hoursResponse.ts`, `src/data/manualHoursRules.ts` : créés.
- `src/context/PlanningContext.tsx`, `src/pages/planning/PlanningRecap.tsx` : modifiés. `src/pages/planning/PlanningGouters.tsx` : modifié. `src/utils/exportGouter.ts` : créé. `package.json` : dépendance et script de test.

---

### Task 1: Heures manuelles côté script (lecture, ajout, suppression)

**Files:**
- Modify: `google-apps-script.js` (nouveau bloc après les goûters, appel dans `doPost` après `handleGoutersAction`), `package.json`
- Create: `scripts/test-hours-logic.mjs`

**Interfaces:**
- Produces : `handleHoursAction(action, postData)` renvoie `null` si l'action n'est pas l'une des sept (`getManualHours`, `addManualHours`, `deleteManualHours`, `importManualHours`, `getExemptions`, `setExemption`, `importExemptions`). Après cette tâche, les quatre dernières renvoient `voteFail('invalid', 'Pas encore disponible')` une fois jeton et rôle contrôlés.
- `getManualHours` : `{ success: true, isBureau: boolean, manageableProjects: number[], manualHours: { id: string, userId: string, userName: string, hours: number, reason: string, grantedBy: string, grantedById: string, createdAt: string, projectId?: number }[] }`, `projectId` absent pour la mission générale, plus récent d'abord.
- `addManualHours` (`requesterId`, `token`, `userId`, `userName?`, `hours`, `reason`, `projectId?`) : `{ success: true, id: string }`. `deleteManualHours` (`requesterId`, `token`, `id`) : `{ success: true }`.
- Consumes : `verifySessionToken`, `voteFail`, `readVoteRows`, `readChildrenUsers`, `findVoteUser`, `canManageProject`, `manageableProjectsOf`, `cleanFreeText`, `newRowId`, `getOrCreateSheet`, `todayKeyParis`, `CHILDREN_PROJECT_IDS`.

- [ ] **Step 1: Écrire les tests (rouges)** dans `scripts/test-hours-logic.mjs`, sur le modèle de `scripts/test-gouters-logic.mjs`. Fixture : `b1` bureau, `c4` chef_projet (`childProjects: '4'`), `c7` chef_projet (`'7'`), `t1`, `t2`, `t3` tuteurs. Les réservations se créent avec `h.raw('syncBooking', { booking: { id, slotId, userId, userName, weekKey: '2026-W44', status } })`. Tests :
  - `sans jeton valide : unauthenticated` sur les sept actions.
  - `un tuteur lit ses propres heures et ne peut rien écrire` : `forbidden` sur `addManualHours` et `deleteManualHours`, `getManualHours` ne renvoie que ses entrées.
  - `le Bureau attribue à un membre, à un nom hors liste et en mission générale` : `userId: 'custom-clara-martin'` avec `userName: 'Clara Martin'` accepté ; l'entrée porte `grantedById: 'b1'` et `grantedBy: 'Bureau'`.
  - `un chef de projet attribue à un membre de son projet` : `t1` a une réservation `slot-4-jeu` (statut `confirme`), `c4` attribue pour `projectId: 4` : `success`.
  - `un chef de projet est refusé` (forbidden, rien n'est écrit) pour : projet 7 qu'il ne gère pas ; `projectId` absent (mission générale) ; `userId` commençant par `custom-` ; `projectId: '4'` en texte envoyé avec un membre sans réservation ; membre dont la seule réservation est sur `slot-7-lun` ; membre dont la seule réservation sur le projet 4 est `annule`.
  - `valeurs` : `invalid` pour heures `0`, `0.4`, `51`, `1.3`, `'abc'`, `NaN` ; `invalid` pour justification de 7 caractères ou de plus de 300 ; `invalid` pour membre inexistant ; une justification `=cmd|' /C calc'!A0` est enregistrée sans le `=` initial ; `hours: 2.5` reste `2.5` à la relecture même si `setSheetCell` y met le texte `'2,5'` ; `projectId` vide relu comme mission générale.
  - `double clic` : le même requérant, même membre, mêmes heures, même justification et même projet dans les 120 secondes (`h.advanceMs`) : `success: true` mais une seule ligne ; après 121 secondes, une seconde ligne est ajoutée.
  - `lecture filtrée` : `t1` voit les siennes ; `c4` voit celles du projet 4 et les siennes, pas celles du projet 7 ni la mission générale d'un autre ; `b1` voit tout ; `manageableProjects` vaut `[4]` pour `c4`, `[1..9]` pour `b1`, `[]` pour `t1`.
  - `suppression` : le Bureau supprime tout ; `c4` supprime son attribution du projet 4 ; `c4` est `forbidden` sur celle d'un autre auteur, sur une attribution du Bureau, et sur une attribution dont le projet n'est plus le sien ; id inconnu : `invalid`.
  - `les colonnes de texte sont créées au format texte` via `h.formats('HeuresManuelles')`.
  Ajouter le fichier à `npm run test:vote`.
- [ ] **Step 2: Lancer** `node --experimental-strip-types --no-warnings --test scripts/test-hours-logic.mjs`. Expected: échec (actions inconnues).
- [ ] **Step 3: Implémenter** `handleHoursAction` et les trois actions dans `google-apps-script.js`, sur le modèle de `handleGoutersAction` (jeton d'abord, verrou pour les écritures, `readChildrenUsers`, onglet par `getOrCreateSheet` avec colonnes de texte). `hours` est relu avec `Number(String(x).replace(',', '.'))`. La réservation d'un membre sur un projet se lit dans l'onglet `Bookings` (colonne 2 `slotId`, colonne 3 `userId`, colonne 6 `status`), le projet est extrait par l'expression `^slot-(\d+)-`. Le garde anti double clic compare les dernières lignes de l'onglet (même `grantedById`, `userId`, `hours`, `reason`, `projectId`, `createdAt` il y a moins de 120 s, horloge `nowMs()` si elle existe sinon `new Date()`). Appeler `handleHoursAction` dans `doPost` après `handleGoutersAction`.
- [ ] **Step 4: Lancer** le fichier de test puis `npm run test:vote`. Expected: tout vert.
- [ ] **Step 5: Commit** `feat(heures): heures manuelles enregistrées côté serveur, avec droits par projet`.

### Task 2: Import de l'existant et membres renouvelants

**Files:**
- Modify: `google-apps-script.js`, `scripts/test-hours-logic.mjs`

**Interfaces:**
- Produces : `importManualHours` (`requesterId`, `token`, `entries: { id, userId, userName, hours, reason, grantedBy, createdAt, projectId? }[]`) : `{ success: true, imported: number, ignored: number }`. `getExemptions` : `{ success: true, exemptions: { userId: string, userName: string, grantedBy: string, grantedAt: string, year: string, note: string }[] }`. `setExemption` (`requesterId`, `token`, `userId`, `userName?`, `exempt: boolean`, `note?`, `year?`) : `{ success: true }`. `importExemptions` (`entries`) : `{ success: true, imported, ignored }`.
- Consumes : tout ce que produit la Tâche 1.

- [ ] **Step 1: Écrire les tests (rouges)** : `importManualHours` réservé au Bureau (`forbidden` pour `c4` et `t1`, rien écrit) ; importe les entrées valides avec leurs `id`, `createdAt` et `grantedBy` d'origine et `grantedById` vide ; ignore les entrées invalides (heures hors règle, justification courte, `projectId` 12) et les `id` déjà présents (relancer l'import donne `imported: 0`) ; plus de 500 entrées : `invalid` ; une entrée importée n'est pas supprimable par un chef de projet mais l'est par le Bureau. `setExemption` : Bureau seulement, `exempt: true` ajoute, deuxième appel identique ne double pas, `exempt: false` retire ; `getExemptions` : Bureau et `c4` voient tout, `t1` voit seulement la sienne ; `importExemptions` : Bureau seulement, sans doublon, entrées invalides ignorées ; note nettoyée (`=` en tête retiré) et limitée à 200 caractères.
- [ ] **Step 2: Lancer** le fichier de test. Expected: échec.
- [ ] **Step 3: Implémenter** les quatre actions (même gestionnaire, mêmes contrôles de rôle et de valeur que la Tâche 1, validation partagée par une fonction `validateManualHourFields(fields)` utilisée par l'ajout et l'import).
- [ ] **Step 4: Lancer** `npm run test:vote`. Expected: tout vert.
- [ ] **Step 5: Commit** `feat(heures): import de l'existant et membres renouvelants côté serveur`.

### Task 3: Changer la date d'un goûter

**Files:**
- Modify: `google-apps-script.js` (bloc des goûters), `scripts/test-gouters-logic.mjs`

**Interfaces:**
- Produces : `moveGouter` (`requesterId`, `token`, `gouterId`, `date`) : `{ success: true }`, ajouté à la liste d'actions de `handleGoutersAction`. Consumes : `canManageProject`, `readGouters`, `gouterDateKey`, `schoolYearFor`, la validation de date de `goutersAdd`.

- [ ] **Step 1: Écrire les tests (rouges)** dans `scripts/test-gouters-logic.mjs` : `unauthenticated` sans jeton valide ; un tuteur et un chef d'un autre projet sont `forbidden` ; un gestionnaire déplace un goûter à venir, la liste le renvoie à la nouvelle date, **les inscriptions et les apports sont conservés** ; refusé (`invalid`, rien changé) pour : date passée, date invalide (`2026-02-30`), date après la fin de l'année scolaire, date déjà prise par un autre goûter actif du même projet, goûter passé (après `h.setNow`), goûter annulé, identifiant inconnu ; la même date que l'actuelle réussit sans rien changer ; la date prise par un goûter **annulé** du même projet est acceptée ; la date prise par un autre projet est acceptée.
- [ ] **Step 2: Lancer** `node --experimental-strip-types --no-warnings --test scripts/test-gouters-logic.mjs`. Expected: échec.
- [ ] **Step 3: Implémenter** `goutersMove(ctx, postData)` et brancher l'action. Écrire la nouvelle date au même format texte que `goutersAdd`.
- [ ] **Step 4: Lancer** `npm run test:vote`. Expected: tout vert.
- [ ] **Step 5: Commit** `feat(gouters): changer la date d'un goûter`.

### Task 4: Sauvegarde hebdomadaire

**Files:**
- Modify: `google-apps-script.js` (bloc « SAUVEGARDE »), `scripts/lib/apps-script-harness.mjs`, `package.json`
- Create: `scripts/test-backup.mjs`

**Interfaces:**
- Produces : `sauvegarderLeSheet(): string` (nom de la copie créée ou déjà présente), `installerSauvegardeHebdo(): void`. Le harnais expose `h.drive` (`folders: Map<string, { files: { name: string, trashed: boolean }[] }>`, `outsideFiles`) et `h.triggers` (liste `{ handler: string, weekDay: string, hour: number }`), avec de faux `DriveApp` (`getFoldersByName`, `createFolder`, `getFileById(id).makeCopy(name, folder)`, dossier `getFiles()` itérateur de fichiers `getName()`, `setTrashed(true)`), `ScriptApp` (`getProjectTriggers`, `deleteTrigger`, `newTrigger(fn).timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create()`, `WeekDay`) et `getId()` sur le faux Sheet.
- Consumes : `todayKeyParis()`.

- [ ] **Step 1: Étendre le harnais** avec ces fakes (aucun test existant ne doit changer de résultat : `npm run test:vote` reste vert).
- [ ] **Step 2: Écrire les tests (rouges)** dans `scripts/test-backup.mjs` : première exécution crée le dossier « Sauvegardes Phoenix » et la copie `Sauvegarde Phoenix 2026-10-30` ; deuxième exécution le même jour ne crée pas de seconde copie ; après dix dates successives (`h.setNow`) il reste exactement les 8 copies les plus récentes non supprimées ; un fichier du dossier dont le nom ne suit pas le motif, et un fichier hors du dossier, ne sont jamais supprimés ; `installerSauvegardeHebdo` crée un seul déclencheur `sauvegarderLeSheet` le lundi à 3 h et, lancée trois fois, il n'en reste qu'un ; un déclencheur d'une autre fonction n'est pas supprimé. Ajouter le fichier à `npm run test:vote`.
- [ ] **Step 3: Lancer** le fichier. Expected: échec.
- [ ] **Step 4: Implémenter** les deux fonctions : le tri des copies se fait sur le nom (date dans le nom, motif `^Sauvegarde Phoenix \d{4}-\d{2}-\d{2}$`), pas sur la date de création.
- [ ] **Step 5: Lancer** `npm run test:vote`. Expected: tout vert.
- [ ] **Step 6: Commit** `feat(sauvegarde): copie hebdomadaire du Sheet dans Drive`.

### Task 5: Côté site : réseau et validation des réponses

**Files:**
- Modify: `src/data/planningData.ts`, `package.json`
- Create: `src/data/hoursResponse.ts`, `src/data/manualHoursRules.ts`, `scripts/test-hours-client.mjs`

**Interfaces:**
- Produces (`hoursResponse.ts`) : `parseManualHoursData(raw: unknown): ManualHoursData | null`, `parseExemptionsData(raw: unknown): ExemptionsData | null`, `parseImportResult(raw: unknown): { imported: number, ignored: number } | null`. Types dans `planningData.ts` : `ManualHoursData = { isBureau: boolean, manageableProjects: number[], manualHours: ManualHourEntry[] }` (avec `grantedById?: string` ajouté à `ManualHourEntry`), `ExemptionsData = { exemptions: QuotaExemption[] }`.
- Produces (`planningData.ts`), toutes `(requesterId: string, token: string, ...)` et basées sur `postPlanningAction` comme les fonctions des goûters : `fetchManualHours`, `addManualHoursApi(requesterId, token, userId, userName, hours, reason, projectId?)`, `deleteManualHoursApi(requesterId, token, id)`, `importManualHoursApi(requesterId, token, entries)`, `fetchExemptions`, `setExemptionApi(requesterId, token, userId, userName, exempt, note?, year?)`, `importExemptionsApi(requesterId, token, entries)`, `moveGouterApi(requesterId, token, gouterId, date)`. Résultat commun `{ ok: true, ... } | { ok: false, message: string, code?: string }`.
- Produces (`manualHoursRules.ts`) : `projectIdOfSlot(slotId: string): number | null` (`slot-4-jeu` donne 4, sinon `null`) ; `eligibleMemberIds(bookings: { userId: string, slotId: string, status: string }[], projectId: number): Set<string>` (statut différent de `annule`) ; `canDeleteManualHour(entry: ManualHourEntry, user: { id: string, role: string }, manageableProjects: number[]): boolean` (Bureau toujours ; chef de projet seulement si `entry.grantedById === user.id` et `entry.projectId` est dans `manageableProjects` ; sinon faux).
- Consumes : `postPlanningAction`, `createLatestGate` (inchangé).

- [ ] **Step 1: Écrire les tests (rouges)** dans `scripts/test-hours-client.mjs` (modèle de `scripts/test-gouters-client.mjs`) : les trois `parse...` refusent `null`, une réponse de connexion, `success: false`, un champ de mauvais type, une heure en texte ; acceptent la réponse complète ; `projectIdOfSlot('slot-4-jeu') === 4`, `slot-12-lun` donne 12, `'x'` et `''` donnent `null` ; `eligibleMemberIds` ignore les réservations annulées et celles des autres projets ; `canDeleteManualHour` pour les quatre cas (Bureau, auteur du projet, auteur hors de ses projets, autre auteur, entrée importée sans `grantedById`). Ajouter le fichier à `npm run test:vote`.
- [ ] **Step 2: Lancer** `node --experimental-strip-types --no-warnings --test scripts/test-hours-client.mjs`. Expected: échec.
- [ ] **Step 3: Implémenter** les types, les fonctions réseau (`unavailableMessage` clair pour un script pas encore redéployé), les validateurs et les règles.
- [ ] **Step 4: Lancer** `npm run test:vote`, `npx tsc --noEmit -p tsconfig.app.json` et `npx eslint src/data`. Expected: tout vert, aucune erreur.
- [ ] **Step 5: Commit** `feat(heures): réseau et validation côté site`.

### Task 6: Contexte et page Récap

**Files:**
- Modify: `src/context/PlanningContext.tsx`, `src/pages/planning/PlanningRecap.tsx`

**Interfaces:**
- Consumes : tout ce que produit la Tâche 5 ; `currentUser.token`, `bookings`, `allUsers`, `projectsData` déjà présents.
- Produces (contexte) : `manualHours` et `exemptions` lus depuis le serveur à la connexion (et relus après chaque écriture) ; plus aucune lecture ni écriture de `localStorage` comme source de vérité ; `hoursAccess: { isBureau: boolean, manageableProjects: number[] }` ; `hoursError: string | null` (dernier refus du serveur, ou erreur de lecture) ; `addManualHours`, `deleteManualHours`, `toggleQuotaExemption` gardent leurs signatures et renvoient `Promise<boolean>` (`false` si le serveur refuse, le message est dans `hoursError`) ; `pendingLocalHours: { hours: number, exemptions: number }` (entrées encore enregistrées dans le navigateur, 0 si l'envoi a déjà été fait) ; `importLocalHours(): Promise<{ ok: boolean, message: string }>`.

- [ ] **Step 1: Contexte.** Remplacer les états initialisés depuis `localStorage` par des états vides remplis par `fetchManualHours` et `fetchExemptions` (un effet sur l'identifiant et le jeton de `currentUser`, réponses périmées ignorées par `createLatestGate`). Si la lecture échoue (script pas redéployé, réseau), laisser les listes vides et renseigner `hoursError` ; ne rien afficher d'erroné. Réécrire `addManualHours`, `deleteManualHours`, `toggleQuotaExemption` pour appeler le serveur puis relire la liste ; garder les contrôles de rôle côté écran comme garde-fou (Bureau, ou chef de projet pour `addManualHours` si le projet fait partie de `hoursAccess.manageableProjects`). `importLocalHours` lit `phoenix_manual_hours_v1` et `phoenix_quota_exemptions_v1`, appelle les deux imports, relit les listes, puis pose le drapeau `phoenix_hours_imported_v1` sans supprimer les données locales ; `pendingLocalHours` vaut 0 si le drapeau est posé.
- [ ] **Step 2: Récap, droits d'attribution.** `canGrantHours` = Bureau ou chef de projet avec au moins un projet gérable. Le bouton « Ajouter des heures » et le registre des justifications sont visibles pour `canGrantHours` (libellé sans « (Bureau) »). Pour un chef de projet : le choix du projet ne propose que ses projets gérables (pas « mission générale »), la liste des membres est limitée à `eligibleMemberIds(bookings, projet choisi)` et se recalcule au changement de projet, l'option « Autre membre » est masquée. Les boutons de révocation suivent `canDeleteManualHour`. Les boutons de quota renouvelant, d'export CSV et de sauvegarde restent réservés au Bureau.
- [ ] **Step 3: Récap, messages.** Un refus du serveur affiche son message (`hoursError`) à la place du message générique. Si `hoursError` signale une lecture impossible, un bandeau discret « Les heures manuelles n'ont pas pu être chargées pour le moment. » s'affiche, sans bloquer le reste de la page. Pour le Bureau, si `pendingLocalHours` n'est pas nul, un bandeau « N attributions d'heures et M membres renouvelants ne sont enregistrés que sur cet ordinateur. » avec le bouton « Les envoyer au serveur » appelle `importLocalHours` et affiche le résultat.
- [ ] **Step 4: Vérifier** `npx tsc --noEmit -p tsconfig.app.json`, `npx eslint src/context src/pages/planning/PlanningRecap.tsx`, `npm run test:vote`. Expected: aucune erreur, tout vert.
- [ ] **Step 5: Vérifier dans le navigateur** avec le faux serveur de démonstration du scratchpad (`demo-api.mjs`, à étendre pour exécuter les nouvelles actions du vrai script) : Bureau (ajout, suppression, import depuis un `localStorage` préparé), chef de projet (liste restreinte, projet imposé, refus d'un autre projet affiché), tuteur (pas de bouton), script indisponible (bandeau, page utilisable). Reproduire une capture pour le Bureau et pour le chef de projet.
- [ ] **Step 6: Commit** `feat(heures): le site lit et écrit les heures manuelles sur le serveur, ouvertes aux chefs de projet`.

### Task 7: Changer la date et exporter un goûter

**Files:**
- Modify: `src/pages/planning/PlanningGouters.tsx`, `package.json`, `scripts/test-gouters-client.mjs`
- Create: `src/utils/exportGouter.ts`

**Interfaces:**
- Produces (`exportGouter.ts`) : `buildGouterSheetModel(gouter: Gouter, projectName: string): GouterSheetModel` avec `GouterSheetModel = { fileName: string, personColumns: number, rows: string[][], titleSpan: number }`. Disposition : colonne 0 `Créneaux`, colonnes 1 à `personColumns` `Personne 1`…, une colonne vide, puis `Prénom` et `Ce que j'apporte`. Ligne 0 : titre `Goûter <projet> du JJ/MM` dans la colonne 0 et « Collations et autres » dans la première colonne de droite. Ligne 1 : entêtes. Ensuite `max(10, nombre d'apports)` lignes : créneau `9h - 10h` à `18h - 19h` avec les noms, apports dans l'ordre. `personColumns = max(2, plus grand nombre d'inscrits sur un créneau)`. `fileName = 'Gouter <projet> JJ-MM.xlsx'` sans caractère interdit (`\ / : * ? " < > |`). `downloadGouterXlsx(gouter: Gouter, projectName: string): Promise<void>` : importe `write-excel-file/universal` au clic, écrit les cellules en type texte (jamais de formule), entêtes en gras, fusions (titre de gauche sur `personColumns + 1` colonnes, titre de droite sur 2), bordures, largeurs, puis déclenche le téléchargement du fichier.
- Produces (page) : bouton « Changer la date » (champ date minimum aujourd'hui et bouton Enregistrer, message du serveur en cas de refus) et bouton « Exporter en Excel », visibles pour `selected.canManage` ; « Changer la date » seulement si le goûter n'est pas passé. Consumes : `moveGouterApi`.

- [ ] **Step 1: Écrire les tests (rouges)** de `buildGouterSheetModel` dans `scripts/test-gouters-client.mjs`, avec un goûter reprenant l'exemple fourni (10h-11h Elyas et Mouna, 11h-12h Saadou et « Mouna+Yacine », sept apports) : titre exact, `personColumns === 2`, dix lignes de créneaux dans l'ordre, noms et apports aux bonnes cellules, un goûter sans apport donne dix lignes dont la partie droite est vide, un créneau à trois inscrits donne `personColumns === 3` et l'entête `Personne 3`, un nom `=1+1` reste le texte `=1+1`, un projet nommé `A/B:C` donne un nom de fichier sans `/` ni `:`. Les libellés de créneau sont `9h - 10h`.
- [ ] **Step 2: Lancer** `node --experimental-strip-types --no-warnings --test scripts/test-gouters-client.mjs`. Expected: échec.
- [ ] **Step 3: Implémenter** `exportGouter.ts` ; `npm install write-excel-file@4.1.1 --save-exact` ; lire les types installés pour la syntaxe des cellules fusionnées, du gras et des bordures avant d'écrire `downloadGouterXlsx`.
- [ ] **Step 4: Page.** Ajouter les deux boutons, le champ de date, les messages et le rechargement des données après le changement de date (l'identifiant du goûter ne change pas : la sélection reste).
- [ ] **Step 5: Vérifier** `npx tsc --noEmit -p tsconfig.app.json`, `npx eslint src`, `npm run test:vote`, `npm run build` (la bibliothèque doit former un morceau chargé à la demande, absent du fichier principal). Expected: aucune erreur.
- [ ] **Step 6: Vérifier dans le navigateur** avec le faux serveur : changer la date (réussite, refus pour une date prise), exporter un goûter, ouvrir le fichier téléchargé en le décompressant et en lisant `sheet1.xml` et `sharedStrings.xml` : fusions `A1:C1` et `E1:F1`, contenu conforme au modèle fourni. Contrôle visuel de la page en mobile 375 px.
- [ ] **Step 7: Commit** `feat(gouters): changer la date et exporter un goûter en Excel`.

### Task 8: Vérification d'ensemble, relecture, mise en ligne

**Files:**
- Modify: selon la relecture

- [ ] **Step 1: Suite complète** : `npm run test:vote`, `npx tsc --noEmit -p tsconfig.app.json`, `npx eslint src scripts`, `npm run build`. Expected: tout vert.
- [ ] **Step 2: Relecture finale** sur le modèle précédent : un relecteur neuf sur le modèle le plus capable, avec le paquet de relecture, le plan, la spec, la section Review Focus et les lignes `Ruling:` du registre.
- [ ] **Step 3: Passe de corrections** (Critique et Important seulement, chaque correction vérifiée rouge puis vert avec un test, suite entière verte) ; mineurs notés au registre.
- [ ] **Step 4: Mise en ligne.** Copier `google-apps-script.js` dans le presse-papiers (`LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pbcopy < google-apps-script.js` puis `pbpaste | cmp - google-apps-script.js`). Donner les instructions : coller et redéployer le script, lancer `installerSauvegardeHebdo` une fois (autorisation Drive), et **ne pousser le site qu'avec l'accord de l'utilisateur, après le redéploiement** ; ensuite le Bureau clique « Les envoyer au serveur » dans le Récap sur l'ordinateur où il avait saisi des heures, sans vider le stockage du navigateur avant.
- [ ] **Step 5: Nettoyage** du dossier de travail `.superpowers/sdd/2026-10-30-heures-gouters-sauvegarde` une fois la relecture propre, puis `superpowers:finishing-a-development-branch` (aucun `push` sans accord).
