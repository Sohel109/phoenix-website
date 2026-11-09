# Séances exceptionnelles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un chef de projet (ses projets) ou le Bureau (tous) peut annuler la séance d'une date et en ajouter une à la date et aux horaires de son choix.

**Architecture:** Une feuille « Seances » stocke les exceptions (ajout, annulation). Le serveur les expose dans `getPlanningData` et les écrit via 3 actions authentifiées. Le front fusionne règles fixes et exceptions dans un module pur `sessionCalendar.ts`, que tous les écrans utilisent pour lister les créneaux d'une semaine.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind, Google Apps Script (`google-apps-script.js`), tests `node --experimental-strip-types` (`npm run test:vote`).

**Spec:** `docs/superpowers/specs/2026-11-09-seances-exceptionnelles-design.md`

## Global Constraints

- Français sans émojis ni tirets cadratins dans tout texte visible.
- Tailwind : classes écrites en entier (pas de composition `${x}:flex`).
- Modules testés par node : `import type` uniquement pour les imports sans exécution ; ne jamais importer `planningData.ts` (il lit `import.meta.env`).
- Format des données : date `yyyy-MM-dd`, heure `HH:MM`, semaine `2026-W48` (même calcul ISO que `getWeekKey`).
- Identifiant d'une séance ajoutée : `slot-<projet>-<jour>-<id>`, jour parmi `lun mar mer jeu ven sam`, `<id>` = `newRowId('s')` (« s » + 7 hex).
- Ne pas modifier `/planning` auth ni les actions historiques sans authentification (`syncBooking`...).
- Droits lus dans le Sheet (colonne J pour les projets), jamais dans la requête ; erreurs par `voteFail(code, message)`.
- Commits avec le trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Pas de push sans demande de l'utilisateur.

## Review Focus

- Annuler une séance avec une présence déjà validée (`confirme` ou `absent`) : refusé, aucune ligne modifiée (serveur et message à l'écran).
- Dates impossibles (`2026-02-30`, `2026-11-29` dimanche, `abc`) et heures mal formées (`9:00`, `24:00`, fin <= début) : refusées, rien d'écrit.
- Ajouter deux fois la même séance (projet, date, horaires) : conflit clair, pas de doublon.
- Chef de projet sans projet en colonne J, ou agissant sur un autre projet : refusé ; tuteur : refusé ; jeton absent ou d'un autre compte : `unauthenticated`.
- Semaine à cheval sur deux années (2026-W53, 2027-W01) : la semaine de la date ajoutée est la même côté serveur et côté front.
- Ancien front avec nouveau serveur, et nouveau front avec ancien serveur (`sessionChanges` absent) : rien ne casse.

---

### Task 1: Module `sessionCalendar.ts`

**Files:**
- Create: `src/data/sessionCalendar.ts`
- Create: `scripts/test-session-calendar.mjs`
- Modify: `package.json` (ajouter le test à `test:vote`)

**Interfaces:**
- Produces:
  - `interface SessionChange { id: string; kind: 'ajout' | 'annulation'; projectId: number; date: string; startTime: string; endTime: string; slotId: string }`
  - `type SessionSlot = { id: string; projectId: number; day: DayOfWeek; startTime: string; endTime: string; date?: string }` (compatible `TimeSlot` ; `date` n'est présent que pour une séance ajoutée)
  - `weekKeyOfDate(date: string): string | null` (null si date invalide)
  - `dayOfDate(date: string): DayOfWeek | null` (null si dimanche ou invalide)
  - `parseSessionChanges(raw: unknown): SessionChange[]` (ignore les entrées mal formées ; `[]` si pas un tableau)
  - `extraSlots(changes: SessionChange[]): SessionSlot[]`
  - `slotsForWeek<S extends SessionSlot>(regular: S[], changes: SessionChange[], weekKey: string, isActive: (slotId: string, weekKey: string) => boolean): SessionSlot[]`
  - `cancelledForWeek<S extends SessionSlot>(regular: S[], changes: SessionChange[], weekKey: string, isActive: (slotId: string, weekKey: string) => boolean): { slot: S; change: SessionChange }[]`
  - `findSlot<S extends SessionSlot>(regular: S[], changes: SessionChange[], slotId: string): SessionSlot | undefined`
  - `DayOfWeek` importé avec `import type` depuis `./planningData`.

- [ ] **Step 1: Écrire `scripts/test-session-calendar.mjs`** (RED). Données : `REGULAR = [{ id: 'slot-7-mer', projectId: 7, day: 'Mercredi', startTime: '14:00', endTime: '16:30' }, { id: 'slot-4-mar', projectId: 4, day: 'Mardi', startTime: '18:00', endTime: '19:30' }]`, `isActive = (id, wk) => !(id === 'slot-7-mer' && wk === '2026-W48')`. Tests avec leurs assertions :
  - `weekKeyOfDate('2026-11-25') === '2026-W48'`, `weekKeyOfDate('2026-12-28') === '2026-W53'`, `weekKeyOfDate('2027-01-01') === '2026-W53'`, `weekKeyOfDate('2026-02-30') === null`, `weekKeyOfDate('abc') === null`.
  - `dayOfDate('2026-11-25') === 'Mercredi'`, `dayOfDate('2026-11-29') === null` (dimanche).
  - `slotsForWeek` sans exception en `2026-W48` ne contient pas `slot-7-mer` (alternance) et contient `slot-4-mar`.
  - Un ajout `{ kind: 'ajout', projectId: 7, date: '2026-11-25', startTime: '14:00', endTime: '16:00', slotId: 'slot-7-mer-sab12cd' }` apparaît en `2026-W48` avec `day: 'Mercredi'`, `startTime '14:00'`, `endTime '16:00'`, et pas en `2026-W49`.
  - Une annulation `{ kind: 'annulation', slotId: 'slot-4-mar', date: '2026-12-01', ... }` retire `slot-4-mar` de `2026-W49` seulement ; `cancelledForWeek(..., '2026-W49')` renvoie ce créneau avec son `change`, et `cancelledForWeek(..., '2026-W48')` renvoie `[]`.
  - `findSlot(REGULAR, changes, 'slot-7-mer-sab12cd')` renvoie la séance ajoutée ; `findSlot(..., 'slot-4-mar')` le créneau régulier ; `findSlot(..., 'slot-99-lun')` renvoie `undefined`.
  - `parseSessionChanges(undefined)` et `parseSessionChanges('x')` renvoient `[]` ; une entrée avec `kind` inconnu ou `date` invalide est ignorée ; une entrée valide est conservée telle quelle.
- [ ] **Step 2: Lancer** `node --experimental-strip-types --no-warnings --test scripts/test-session-calendar.mjs`. Expected: FAIL (module introuvable).
- [ ] **Step 3: Implémenter `src/data/sessionCalendar.ts`.** `weekKeyOfDate` valide la date par aller-retour sur `Date.UTC` puis calcule la semaine ISO comme `getWeekKey` (jeudi de la semaine) ; une séance ajoutée devient `{ id: slotId, projectId, day: dayOfDate(date), startTime, endTime, date }`, ignorée si `dayOfDate` vaut `null`.
- [ ] **Step 4: Relancer** le fichier de test. Expected: tous PASS.
- [ ] **Step 5: Ajouter `scripts/test-session-calendar.mjs` à `test:vote`**, lancer `npm run test:vote`. Expected: 0 fail. Commit : `feat(seances): fusion séances régulières et exceptions`.

---

### Task 2: Serveur (feuille « Seances », 3 actions, lecture)

**Files:**
- Modify: `google-apps-script.js` (`parseSlotId` ~l.1252, `getPlanningDataInternal` ~l.634, routage `doPost` ~l.93, nouvelle section après `memberBookingRemove`)
- Create: `scripts/test-sessions-server.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `verifySessionToken`, `findVoteUser`, `readChildrenUsers`, `canManageProject`, `voteFail`, `schoolYearFor`, `todayKeyParis`, `isoWeekKeyOfUtcDate`, `weekMondayUtc`, `sessionDateKey`, `newRowId`, `getOrCreateSheet`, `BOOKING_HEADERS`, `CHILDREN_PROJECT_IDS`.
- Produces (POST, via `h.call(action, data)` du harnais, qui ajoute le jeton) :
  - `addSession { requesterId, projectId, date, startTime, endTime }` → `{ success: true, slotId, id }` ou `voteFail`.
  - `cancelSession { requesterId, slotId, weekKey }` → `{ success: true, cancelled: number }` (nombre de réservations `prevu` passées à `annule`).
  - `restoreSession { requesterId, slotId, weekKey }` → `{ success: true }`.
  - Codes : `unauthenticated`, `forbidden`, `invalid`, `conflict`.
  - `getPlanningDataInternal()` renvoie en plus `sessionChanges` : `[{ id, kind, projectId, date, startTime, endTime, slotId }]` (projectId nombre).

- [ ] **Step 1: Lire `scripts/test-member-bookings.mjs` et `scripts/lib/apps-script-harness.mjs`** pour reprendre `USERS`, `fresh`, `plain`, `h.call`, `h.raw`, `h.sheet`. Écrire `scripts/test-sessions-server.mjs` avec les mêmes utilisateurs (Bureau `b1`, chefs `c4` projet 4 et `c7` projet 7, chef sans projet `c9`, tuteur `t1`), `TODAY = '2026-11-02'`. Tests (RED), chacun avec ses assertions :
  - sans jeton ou avec le jeton d'un autre compte : `unauthenticated` sur les trois actions, feuille `Seances` vide ou absente.
  - tuteur : `forbidden` ; chef `c4` sur le projet 7 : `forbidden` ; chef `c9` : `forbidden` ; Bureau sur le projet 7 : `success`.
  - ajout valide `c7`, `projectId: 7, date: '2026-11-25', startTime: '14:00', endTime: '16:00'` : `slotId` correspond à `/^slot-7-mer-s[0-9a-f]{7}$/`, une ligne `ajout` dans `Seances`, `getPlanningDataInternal().sessionChanges` la contient avec `projectId === 7`.
  - ajouts refusés (`invalid`, aucune ligne écrite) : `date: '2026-11-29'` (dimanche), `'2026-02-30'`, `'abc'`, hors année scolaire (`'2027-09-01'`), `startTime: '9:00'`, `'06:30'`, `endTime: '22:30'`, `startTime '16:00'` / `endTime '14:00'`, `projectId: 99`.
  - même ajout deux fois : second appel `conflict`, une seule ligne.
  - `parseSlotId('slot-7-mer-s1a2b3c4')` accepté : `addMemberBookings` d'un membre sur cet identifiant et cette semaine `success`, et `sessionDateKey('2026-W48', 'slot-7-mer-s1a2b3c4') === '2026-11-25'`.
  - annulation d'une séance régulière : `cancelSession { slotId: 'slot-7-mer', weekKey: '2026-W49' }` écrit une ligne `annulation` avec `date '2026-12-02'` ; une seconde fois : `conflict`.
  - annulation avec réservations : une réservation `prevu` passe à `annule` (`cancelled === 1`) ; avec une réservation `confirme` ou `absent` sur le même `(slotId, weekKey)` : `conflict`, aucune ligne modifiée ni créée.
  - annulation d'une séance ajoutée : la ligne `ajout` disparaît, ses réservations `prevu` passent à `annule`.
  - `restoreSession` supprime la ligne `annulation` ; sur une séance non annulée : `invalid`.
- [ ] **Step 2: Lancer** `node --experimental-strip-types --no-warnings --test scripts/test-sessions-server.mjs`. Expected: FAIL.
- [ ] **Step 3: Implémenter côté serveur.**
  - `parseSlotId` : regex `^slot-(\d{1,2})-(lun|mar|mer|jeu|ven|sam)(?:-s[a-z0-9]{3,12})?$`.
  - `var SESSIONS_SHEET = { name: 'Seances', headers: ['id','kind','projectId','date','startTime','endTime','slotId','createdBy','createdAt'] }` ; `getSessionsSheet()` crée la feuille et met les colonnes D:F en format texte `@` à la création.
  - `readSessionChanges()` lit la feuille et renvoie les objets (champs en chaînes, `projectId` en nombre, ignore les lignes vides) ; appelée par `getPlanningDataInternal` (champ `sessionChanges`, `[]` si la feuille n'existe pas encore sans la créer).
  - `SESSION_ACTIONS = ['addSession','cancelSession','restoreSession']` et `handleSessionAction(action, postData)` calquée sur `handleMemberBookingAction` (jeton, `LockService`, rôle `bureau` ou `chef_projet`, `canManageProject` sur le projet), routée dans `doPost` à côté de `handleMemberBookingAction`.
  - `addSession` : validations du spec (date réelle via aller-retour UTC, pas dimanche, `schoolYearFor(today)`, `HH:MM` strict à 2 chiffres entre `07:00` et `22:00`, pas de 5 minutes, fin > début, projet dans `CHILDREN_PROJECT_IDS`, doublon exact = `conflict`), id `newRowId('s')`, `slotId = 'slot-' + projectId + '-' + jourAbrégé + '-' + id`.
  - `cancelSession` : séance ajoutée (slotId avec suffixe) = ligne `ajout` existante dont `weekKeyOfDate(date) === weekKey`, sinon `invalid` ; séance régulière = ligne `annulation` à créer pour `sessionDateKey(weekKey, slotId)`, `conflict` si déjà annulée. Dans les deux cas : refus `conflict` si une réservation `confirme` ou `absent` existe pour `(slotId, weekKey)`, sinon passer les `prevu` à `annule` (colonne statut) puis écrire/supprimer la ligne.
  - `restoreSession` : supprime la ligne `annulation` de `(slotId, date)` ; `invalid` si absente.
- [ ] **Step 4: Relancer** le fichier de test. Expected: tous PASS. Lancer aussi `npm run test:vote` pour vérifier que `test-member-bookings`, `test-children-logic` et les autres tests serveur restent verts.
- [ ] **Step 5: Ajouter le test à `test:vote`.** Commit : `feat(seances): feuille Seances et actions ajout, annulation, rétablissement`.

---

### Task 3: API client et contexte

**Files:**
- Modify: `src/data/planningData.ts` (`TimeSlot` : champ optionnel `date?: string` ; `fetchPlanningData` ; 3 fonctions d'API)
- Modify: `src/context/PlanningContext.tsx` (état, chargement, actions, valeurs exposées)

**Interfaces:**
- Consumes: `SessionChange`, `parseSessionChanges`, `slotsForWeek`, `cancelledForWeek`, `findSlot` de Task 1 ; `postPlanningAction` existant (même mécanisme que `postMemberBookingAction`).
- Produces :
  - `fetchPlanningData()` renvoie aussi `sessionChanges: SessionChange[]` (`[]` si absent).
  - `addSessionApi(requesterId: string, token: string, input: { projectId: number; date: string; startTime: string; endTime: string }): Promise<{ success: boolean; message: string; code?: string }>`
  - `cancelSessionApi(requesterId, token, slotId, weekKey)` et `restoreSessionApi(requesterId, token, slotId, weekKey)` : même retour.
  - Contexte : `sessionChanges: SessionChange[]`, `slotsForWeek(weekKey: string): TimeSlot[]`, `cancelledSlotsForWeek(weekKey: string): { slot: TimeSlot; change: SessionChange }[]`, `slotById(slotId: string): TimeSlot | undefined`, `addSession(input): Promise<{ ok: boolean; message: string }>`, `cancelSession(slotId, weekKey): Promise<{ ok: boolean; message: string }>`, `restoreSession(slotId, weekKey): Promise<{ ok: boolean; message: string }>`. Chaque action réussie appelle `refreshPlanningData()`.

- [ ] **Step 1: Implémenter** les trois fonctions d'API sur le modèle de `addMemberBookingsApi`, et ajouter `sessionChanges` au retour de `fetchPlanningData` (via `parseSessionChanges(data.sessionChanges)`).
- [ ] **Step 2: Dans le contexte**, ajouter l'état `sessionChanges` alimenté partout où `setEventAttendance(data.eventAttendance)` est appelé (lignes ~305 et ~318), puis les valeurs `slotsForWeek`, `cancelledSlotsForWeek`, `slotById` (basées sur `timeSlots` et `isSlotActiveThisWeek`) et les trois actions (réservées à `chef_projet` et `bureau`, comme `placeMembers`).
- [ ] **Step 3: Vérifier** `npx tsc --noEmit -p tsconfig.app.json` (0 erreur) et `npm run test:vote` (0 fail). Commit : `feat(seances): API et contexte des séances exceptionnelles`.

---

### Task 4: Les écrans lisent la liste fusionnée

**Files (modifier) :** `src/pages/planning/PlanningDisponibilites.tsx`, `PlanningHoraire.tsx`, `PlanningPresenceEnfants.tsx`, `PlanningValidation.tsx`, `PlanningCompte.tsx`, `PlanningRecap.tsx`, `src/components/planning/AttestationModal.tsx`, `src/hooks/usePlanningNotifications.ts`, et `SlotPlacementPanel.tsx` si elle filtre elle-même par alternance.

**Interfaces:**
- Consumes: `slotsForWeek(weekKey)` et `slotById(slotId)` du contexte (Task 3), `getSlotDuration(slot)` existant.
- Produces: aucun nouveau symbole ; remplace `timeSlots.filter(... isSlotActiveThisWeek ...)` par `slotsForWeek(weekKey)` pour les listes d'une semaine, et `timeSlots.find(s => s.id === id)` par `slotById(id)` pour les durées et libellés.

- [ ] **Step 1: Chercher** chaque usage : `grep -rn "timeSlots\|isSlotActiveThisWeek" src` hors `planningData.ts`.
- [ ] **Step 2: Remplacer** usage par usage (listes d'une semaine : `slotsForWeek` ; recherche par identifiant, durées, heures du Compte, du Récap et de l'attestation : `slotById`). Pour `PlanningValidation`, `mySlots` devient les créneaux de la semaine filtrés par projets de l'utilisateur.
- [ ] **Step 3: Vérifier** `tsc`, `eslint` sur les fichiers touchés, `npm run test:vote`. Aucun écran ne doit plus lire `timeSlots` directement hors définition de la liste régulière.
- [ ] **Step 4: Vérifier à l'écran** avec le serveur de démo (port 3002 ; données de séances ajoutées/annulées dans le fichier de démo) : une séance ajoutée apparaît dans Disponibilités et Horaire de sa semaine, une séance annulée disparaît, l'alternance Jules Ferry reste correcte. Commit : `refactor(seances): les écrans utilisent la liste fusionnée des séances`.

---

### Task 5: Onglet « Séances » et formulaire d'ajout

**Files:**
- Modify: `src/pages/planning/PlanningValidation.tsx` (3e onglet `'sessions'`)
- Create: `src/components/planning/SessionsManager.tsx` (liste, annulation, rétablissement)
- Create: `src/components/planning/AddSessionDialog.tsx` (formulaire)

**Interfaces:**
- Consumes: contexte (`slotsForWeek`, `cancelledSlotsForWeek`, `addSession`, `cancelSession`, `restoreSession`, `bookings`, `currentUser`), `projectsData`, `formatWeekLabel`.
- Produces: `SessionsManager` props `{ weekKey: string; projectIds: number[]; onNotify: (message: string) => void }` ; `AddSessionDialog` props `{ projects: { id: number; name: string }[]; weekKey: string; existingSessions: { projectId: number; date?: string; day: string; startTime: string; endTime: string }[]; onClose: () => void; onSubmit: (input: { projectId: number; date: string; startTime: string; endTime: string }) => Promise<{ ok: boolean; message: string }> }`.

- [ ] **Step 1: `SessionsManager`** : une carte par séance de la semaine pour les projets de l'utilisateur (Bureau : tous ; chef : les siens), avec projet, jour et date, horaires, étiquette « Régulière » ou « Ajoutée », nombre d'inscrits (réservations non annulées), bouton « Annuler la séance » ; bloc « Séances annulées » avec « Rétablir » ; bouton « Ajouter une séance » ouvrant le dialogue. L'annulation demande une confirmation qui indique le nombre d'inscrits retirés ; le message d'erreur du serveur (présences validées) s'affiche tel quel.
- [ ] **Step 2: `AddSessionDialog`** : sélection du projet (un seul = présélectionné), `<input type="date">` avec `min`/`max` de l'année scolaire en cours, deux `<input type="time" step="900">`, prévention visible si une séance du même projet existe déjà à cette date (« Ce projet a déjà une séance le <jour date>, de HH:MM à HH:MM. Annulez-la si elle est remplacée. »), boutons Annuler et Ajouter, états de chargement et d'erreur, cibles tactiles d'au moins 44 px, focus géré et `role="dialog"`.
- [ ] **Step 3: Brancher** l'onglet « Séances » dans `PlanningValidation` (le sélecteur d'onglets passe à trois entrées), en conservant les deux onglets existants.
- [ ] **Step 4: Vérifier à l'écran** (serveur de démo étendu avec les trois actions) : en Bureau puis en chef de projet, sur ordinateur et sur mobile (375 px, pas de défilement horizontal) : ajouter le 25 novembre 14h-16h pour Jules Ferry, annuler et rétablir, refus d'annulation avec présence validée, message d'erreur d'une date invalide. `tsc`, `eslint`, `npm run test:vote`. Commit : `feat(seances): onglet Séances pour ajouter et annuler une séance`.

---

### Task 6: Contrôle final

- [ ] **Step 1: `npm run test:vote`, `npx tsc --noEmit -p tsconfig.app.json`, `npx eslint src`** : 0 échec, 0 erreur nouvelle (l'avertissement `react-hooks/exhaustive-deps` de `PlanningEventValidation` existait déjà).
- [ ] **Step 2: Relire** chaque ligne de « Review Focus » et indiquer le test ou la vérification qui la couvre.
- [ ] **Step 3: Rapporter à l'utilisateur** : rien n'est poussé, il faut coller `google-apps-script.js` dans Apps Script puis « Nouvelle version ».
