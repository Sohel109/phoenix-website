# Vote du tuteur du mois : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter dans l'espace membre un vote mensuel du « tuteur du mois », avec décompte et publication réservés au Bureau.

**Architecture:** Quatre nouvelles actions dans le Google Apps Script existant (`getVoteData`, `castVote`, `setVoteExclusion`, `publishWinner`), appelées en `POST` via le relais `/api/planning` déjà en place. Trois nouveaux onglets du Sheet. Côté React : un client API dans `planningData.ts`, un hook `useVoteData`, une page `PlanningVote`, un panneau Bureau et un bandeau sur le tableau de bord. La logique du script est écrite en fonctions pures testées sous Node avec un faux `SpreadsheetApp`.

**Tech Stack:** Google Apps Script (ES5), Node `node:test` + `node:vm` (aucune dépendance ajoutée), React 19 + TypeScript + Tailwind, react-router 7.

**Spec:** [docs/superpowers/specs/2026-10-27-tuteur-du-mois-design.md](../specs/2026-10-27-tuteur-du-mois-design.md)

## Global Constraints

- Fenêtre de vote : les 7 derniers jours du mois civil, fuseau `Europe/Paris` (31 jours : du 25 au 31 ; 30 jours : du 24 au 30 ; février 28 jours : du 22 au 28 ; 29 jours : du 23 au 29).
- Mois de référence : le mois en cours à partir du premier jour de la fenêtre, sinon le mois précédent. Votes, exclusions, décompte, publication et bandeau portent sur ce mois.
- Un vote par (mois, électeur), modifiable tant que la fenêtre est ouverte, jamais pour soi-même.
- Tous les comptes (`tuteur`, `chef_projet`, `bureau`) votent et sont candidats, sauf exclusion du Bureau pour le mois.
- Seul un compte dont le rôle lu dans la première feuille du Sheet est `bureau` obtient les décomptes ou peut appeler `setVoteExclusion` et `publishWinner`. Le rôle envoyé par le navigateur n'est jamais utilisé.
- Onglets : `Votes` (`monthKey`, `voterId`, `candidateId`, `updatedAt`), `VoteExclusions` (`monthKey`, `userId`), `TuteurDuMois` (`monthKey`, `userId`, `publishedAt`). `monthKey` au format `YYYY-MM`.
- Aucune modification de `api/login.js`, de `PlanningLogin.tsx`, ni des actions de mot de passe du script. Aucun nouveau fichier dans `api/`.
- Textes de l'interface en français, sans émojis, sans tirets cadratins. Style visuel identique aux pages du planning existantes (`PlanningMesEvenements.tsx` sert de modèle).
- Pas de `push` sans confirmation de l'utilisateur. `seintinelles/` ne doit jamais être ajouté à un commit.

## Review Focus

1. **Google Sheets convertit `2026-10` en date.** Une cellule `monthKey` relue comme `Date` doit quand même être reconnue (décompte, vote existant, gagnant). Test en Task 1.
2. **Identifiants numériques.** Un `userId` écrit `12` revient du Sheet en nombre `12` : les comparaisons doivent se faire en chaînes. Test en Task 1.
3. **Candidat exclu après avoir reçu des voix.** Ses voix ne comptent plus, et `myVote` des électeurs concernés vaut `null` pour qu'ils puissent revoter. Test en Task 1.
4. **Non-Bureau qui force l'API.** `setVoteExclusion` et `publishWinner` sont refusés, et `getVoteData` ne contient ni `counts` ni liste d'exclusions. Test en Task 1.
5. **Publication d'un nom invalide.** Publier un compte inconnu ou exclu est refusé, publier deux fois remplace (une seule ligne par mois), `userId: null` dépublie. Test en Task 1.
6. **Script pas encore redéployé ou réponse en erreur.** La page et le bandeau affichent un message sobre et le tableau de bord reste utilisable. Vérifié en Task 3 et Task 5.

---

## File Structure

| Fichier | Responsabilité |
|---|---|
| `google-apps-script.js` (modifié) | Fonctions pures de vote + gestionnaires `handleVoteAction` + répartition dans `doPost` |
| `scripts/lib/apps-script-harness.mjs` (créé) | Charge `google-apps-script.js` dans `node:vm` avec un faux `SpreadsheetApp`, `Utilities`, `ContentService`, `LockService` |
| `scripts/test-vote-logic.mjs` (créé) | Tests `node:test` de la logique du vote |
| `package.json` (modifié) | Script `test:vote` |
| `src/data/planningData.ts` (modifié) | Types `VoteData` et 4 fonctions API |
| `src/hooks/useVoteData.ts` (créé) | Chargement et rechargement des données de vote |
| `src/pages/planning/PlanningVote.tsx` (créé) | Page membre |
| `src/components/planning/VoteBureauPanel.tsx` (créé) | Section Bureau (décompte, exclusions, publication) |
| `src/App.tsx`, `src/pages/planning/PlanningLayout.tsx`, `src/pages/planning/PlanningDashboard.tsx` (modifiés) | Route, entrée de menu, carte et bandeau |

---

### Task 1: Logique du vote dans le script Google, avec tests Node

**Files:**
- Modify: `google-apps-script.js` (ajout d'une section « VOTE DU TUTEUR DU MOIS » avant la section 4 « ENVOI DE MAIL », et un dispatch au début de `doPost`, juste après `var action = postData.action;`)
- Create: `scripts/lib/apps-script-harness.mjs`
- Create: `scripts/test-vote-logic.mjs`
- Modify: `package.json` (`"test:vote": "node --test scripts/test-vote-logic.mjs"`)

**Interfaces:**
- Consumes: `getOrCreateSheet(name, headers)` existant. La première feuille du Sheet : colonne A = id, B = nom, E = rôle (vide = `tuteur`), comme dans `listUsers`.
- Produces (fonctions globales du script, utilisées par les tests) :
  - `voteWindowFor(todayKey: string): { monthKey: string, isOpen: boolean, opensOn: string, closesOn: string, nextOpensOn: string }` avec `todayKey` au format `YYYY-MM-DD`.
  - `normalizeMonthKey(value: Date | string): string` (une `Date` est formatée `yyyy-MM` en `Europe/Paris`).
  - `handleVoteAction(action: string, postData: object): object | null` renvoie `null` si l'action n'est pas une action de vote. Les réponses ont la forme `{ success: boolean, message?: string, code?: string, ...data }`.
  - Réponse de `getVoteData` : `{ success, monthKey, isOpen, opensOn, closesOn, nextOpensOn, candidates: {id,name}[], myVote: string|null, winner: {userId,name}|null, bureau?: { counts: {userId,name,count}[], members: {id,name,excluded}[] } }`.
  - Entrées : `getVoteData {requesterId}`, `castVote {voterId, candidateId}`, `setVoteExclusion {requesterId, userId, excluded: boolean}`, `publishWinner {requesterId, userId: string|null}`.
  - Codes d'erreur de `castVote` : `closed`, `self`, `unknown_voter`, `not_eligible`. Pour les actions Bureau : `forbidden`.
  - Harness : `loadScript({ users, now }): { call(action, body): object, sheet(name): string[][] }` où `users` = `{id,name,role}[]` et `now` = `'YYYY-MM-DD'` (modifiable via `setNow(key)`).

- [ ] **Step 1: Écrire le harness et les tests qui échouent.** Dans `scripts/test-vote-logic.mjs`, tests nommés ci-dessous, avec les valeurs exactes de la spec :
  - `voteWindowFor` : `2026-10-24` → `{monthKey:'2026-09', isOpen:false, nextOpensOn:'2026-10-25'}` ; `2026-10-25` → `{monthKey:'2026-10', isOpen:true, opensOn:'2026-10-25', closesOn:'2026-10-31'}` ; `2026-11-03` → `{monthKey:'2026-10', isOpen:false, nextOpensOn:'2026-11-24'}` ; `2026-11-24` ouvert pour `2026-11` ; `2027-02-22` ouvert (`closesOn:'2027-02-28'`) ; `2027-02-21` fermé ; `2028-02-23` ouvert (`closesOn:'2028-02-29'`) ; `2027-01-01` → `monthKey:'2026-12'`, fermé, `nextOpensOn:'2027-01-25'`.
  - `castVote` : enregistre un vote ; un second vote du même électeur remplace le premier (une seule ligne dans `Votes`) ; refus `closed` hors fenêtre ; refus `self` ; refus `unknown_voter` ; refus `not_eligible` pour un candidat exclu.
  - Review Focus 1 : le harness écrit `monthKey` comme objet `Date` dans les cellules lues (option `dateifyMonthKeys: true`) ; un vote existant est toujours trouvé, remplacé (pas dupliqué), et compté par `getVoteData`.
  - Review Focus 2 : ids stockés en nombres dans le faux Sheet ; `myVote` et le décompte restent corrects.
  - Review Focus 3 : A vote pour B, le Bureau exclut B : `counts` ne contient plus B, `myVote` de A vaut `null`, A peut revoter pour C.
  - Review Focus 4 : un `tuteur` appelant `setVoteExclusion` ou `publishWinner` reçoit `{success:false, code:'forbidden'}` ; sa réponse `getVoteData` n'a pas de clé `bureau`.
  - Review Focus 5 : `publishWinner` avec un id inconnu ou exclu est refusé ; deux publications laissent une ligne dans `TuteurDuMois` avec le dernier nom ; `userId:null` supprime la ligne ; `getVoteData.winner` reflète l'état.

- [ ] **Step 2: Lancer pour vérifier l'échec.**
  Run: `node --test scripts/test-vote-logic.mjs`
  Expected: les tests échouent (`voteWindowFor is not defined` ou équivalent).

- [ ] **Step 3: Implémenter les fonctions pures `voteWindowFor`, `normalizeMonthKey`, `computeEligibleIds`, `tallyVotes`, `validateVote` dans `google-apps-script.js`** (signatures libres tant que `voteWindowFor` et `normalizeMonthKey` respectent l'interface ci-dessus), en ES5 (`var`, pas de `let`/flèches : le script existant est en ES5).

- [ ] **Step 4: Implémenter `handleVoteAction` et brancher `doPost`.** Lire les utilisateurs depuis la première feuille (colonnes A, B, E). Obtenir la date du jour avec `Utilities.formatDate(new Date(), 'Europe/Paris', 'yyyy-MM-dd')`. Créer les onglets avec `getOrCreateSheet`, et mettre la colonne `monthKey` en texte brut (`setNumberFormat('@')`) à la création. Toujours lire les ids avec `.toString()` et les `monthKey` avec `normalizeMonthKey`. Enrouler les écritures dans `LockService.getScriptLock()` comme les autres actions. Dans `doPost`, juste après `var action = postData.action;` : `var voteResult = handleVoteAction(action, postData); if (voteResult) { return ContentService.createTextOutput(JSON.stringify(voteResult)).setMimeType(ContentService.MimeType.JSON); }`.

- [ ] **Step 5: Lancer les tests.**
  Run: `npm run test:vote`
  Expected: tous les tests passent.

- [ ] **Step 6: Commit.**
```bash
git add google-apps-script.js scripts/lib/apps-script-harness.mjs scripts/test-vote-logic.mjs package.json
git commit -m "feat(vote): logique serveur du tuteur du mois (Apps Script) et tests"
```

---

### Task 2: Client API et hook côté React

**Files:**
- Modify: `src/data/planningData.ts` (à la suite de `syncEventAttendanceApi`, même style : `API_URL = import.meta.env.VITE_API_URL || ''`, `POST ${API_URL}/api/planning`)
- Create: `src/hooks/useVoteData.ts`

**Interfaces:**
- Consumes: les actions et réponses du Task 1.
- Produces :
  - `export interface VoteData` (mêmes champs que la réponse de `getVoteData` sans `success`) et `export interface VoteCandidate { id: string; name: string }`.
  - `fetchVoteData(requesterId: string): Promise<{ ok: true; data: VoteData } | { ok: false; message: string }>`
  - `castVoteApi(voterId: string, candidateId: string): Promise<{ success: boolean; message: string }>`
  - `setVoteExclusionApi(requesterId: string, userId: string, excluded: boolean): Promise<{ success: boolean; message: string }>`
  - `publishWinnerApi(requesterId: string, userId: string | null): Promise<{ success: boolean; message: string }>`
  - `useVoteData(): { data: VoteData | null; loading: boolean; error: string | null; reload: () => Promise<void> }` (utilise `usePlanning().currentUser`, ne charge rien si non connecté).

- [ ] **Step 1: Ajouter les types et les 4 fonctions dans `planningData.ts`.** Messages d'erreur réseau en français (`Erreur réseau avec le serveur`). Si la réponse n'a pas `success: true`, renvoyer `{ ok: false, message }` avec le `message` du serveur ou `Le vote n'est pas disponible pour le moment.`.

- [ ] **Step 2: Créer `useVoteData`.** Charge au montage et expose `reload` (sans clignotement : conserver `data` pendant le rechargement).

- [ ] **Step 3: Vérifier les types et le lint.**
  Run: `npx tsc -b && npx eslint src/data/planningData.ts src/hooks/useVoteData.ts`
  Expected: aucune erreur.

- [ ] **Step 4: Commit.**
```bash
git add src/data/planningData.ts src/hooks/useVoteData.ts
git commit -m "feat(vote): client API et hook useVoteData"
```

---

### Task 3: Page de vote pour les membres

**Files:**
- Create: `src/pages/planning/PlanningVote.tsx` (export `PlanningVote`, enveloppée dans `PlanningLayout title="Vote du mois"`)
- Modify: `src/App.tsx` (import lazy sur le modèle des lignes 36-45, route `/planning/vote` dans `PlanningGuard`, à la suite de `/planning/notifications`)
- Modify: `src/pages/planning/PlanningLayout.tsx` (ajout de `{ label: 'Vote du mois', path: '/planning/vote', icon: Award }` dans `quickLinks`, `Award` importé depuis `lucide-react`)

**Interfaces:**
- Consumes: `useVoteData`, `castVoteApi` (Task 2), `usePlanning().currentUser`.
- Produces: la route `/planning/vote` et le composant `PlanningVote` ; il rend `VoteBureauPanel` (Task 4) quand `data.bureau` existe.

- [ ] **Step 1: Construire la page.** Quatre états à afficher :
  1. chargement (texte sobre) ;
  2. erreur : message + bouton « Réessayer » qui appelle `reload` (couvre le script non redéployé) ;
  3. fenêtre fermée : « Le vote est fermé. Prochaine ouverture le {nextOpensOn au format 25 octobre} », et le gagnant publié s'il existe ;
  4. fenêtre ouverte : liste des `candidates` (sans soi-même) en boutons ; le choix actuel (`myVote`) est mis en évidence avec la mention « Votre vote », un clic sur un autre nom change le vote. Pendant l'appel, les boutons sont désactivés. Après chaque action, `reload()`. Les erreurs de `castVoteApi` s'affichent sous la liste.
  Titre de page : « Vote du tuteur du mois », sous-titre : « Du {opensOn} au {closesOn}, choisissez le tuteur qui vous a le plus marqué ce mois-ci. Votre vote reste secret. »

- [ ] **Step 2: Ajouter la route et l'entrée de menu.** Vérifier la barre du haut à 1440 px et à 375 px : si l'entrée fait déborder la barre, ne l'ajouter qu'au menu déroulant mobile et à la carte du tableau de bord (Task 5), et le noter dans le message de commit.

- [ ] **Step 3: Vérifier les types et le lint.**
  Run: `npx tsc -b && npx eslint src/pages/planning/PlanningVote.tsx src/App.tsx src/pages/planning/PlanningLayout.tsx`
  Expected: aucune erreur.

- [ ] **Step 4: Vérifier dans le navigateur avec l'API de démonstration (Task 6 prépare le serveur).** Fenêtre ouverte : voter, changer de vote, vérifier qu'on ne se voit pas dans la liste. Fenêtre fermée (date forcée) : message de prochaine ouverture. Script indisponible : message d'erreur et bouton « Réessayer ».

- [ ] **Step 5: Commit.**
```bash
git add src/pages/planning/PlanningVote.tsx src/App.tsx src/pages/planning/PlanningLayout.tsx
git commit -m "feat(vote): page Vote du mois pour les membres"
```

---

### Task 4: Panneau Bureau (décompte, exclusions, publication)

**Files:**
- Create: `src/components/planning/VoteBureauPanel.tsx` (props : `{ data: VoteData; requesterId: string; onChanged: () => void }`)
- Modify: `src/pages/planning/PlanningVote.tsx` (rend le panneau sous la liste quand `data.bureau` est défini)

**Interfaces:**
- Consumes: `VoteData.bureau` (`counts`, `members`), `setVoteExclusionApi`, `publishWinnerApi` (Task 2).
- Produces: un composant sans état partagé ; il appelle `onChanged` après chaque action réussie.

- [ ] **Step 1: Construire le panneau en trois blocs.** (a) « Décompte » : tableau trié par nombre de voix décroissant, avec le total de votes ; (b) « Candidats du mois » : une case par membre (`members`) pour l'exclure ou le réintégrer ; (c) « Publication » : un sélecteur de nom (par défaut le premier du décompte), un bouton « Publier le gagnant » et, si un gagnant est publié, son nom avec un bouton « Dépublier ». Le texte d'aide précise que le décompte n'est visible que du Bureau. Boutons désactivés pendant les appels, erreurs affichées dans le panneau.

- [ ] **Step 2: Vérifier les types et le lint.**
  Run: `npx tsc -b && npx eslint src/components/planning/VoteBureauPanel.tsx src/pages/planning/PlanningVote.tsx`
  Expected: aucune erreur.

- [ ] **Step 3: Vérifier dans le navigateur (compte Bureau de démonstration).** Le décompte correspond aux votes faits avec les comptes tuteur ; exclure un candidat le retire de la liste côté tuteur ; publier puis dépublier met à jour le bandeau (Task 5). Un compte tuteur ne voit jamais ce panneau.

- [ ] **Step 4: Commit.**
```bash
git add src/components/planning/VoteBureauPanel.tsx src/pages/planning/PlanningVote.tsx
git commit -m "feat(vote): panneau Bureau pour le décompte, les exclusions et la publication"
```

---

### Task 5: Carte et bandeau « Tuteur du mois » sur le tableau de bord

**Files:**
- Modify: `src/pages/planning/PlanningDashboard.tsx` (nouvelle entrée dans `cards` : icône `Award`, libellé « Vote du mois », description « Votez pour le tuteur du mois », `to: '/planning/vote'`, `gradient: 'from-[#83338A] to-[#EC602B]'` ; bandeau au-dessus de la grille de cartes)

**Interfaces:**
- Consumes: `useVoteData` (Task 2).
- Produces: aucun.

- [ ] **Step 1: Ajouter la carte.** Visible pour tous les rôles.

- [ ] **Step 2: Ajouter le bandeau.** Affiché seulement si `data?.winner` existe : « Tuteur du mois : {name} ». Aucun bandeau en cas d'erreur ou de chargement : le tableau de bord ne doit jamais être bloqué ni afficher d'erreur à cause du vote (Review Focus 6).

- [ ] **Step 3: Vérifier les types, le lint et le rendu.**
  Run: `npx tsc -b && npx eslint src/pages/planning/PlanningDashboard.tsx`
  Expected: aucune erreur. Dans le navigateur : bandeau visible après publication par le Bureau, absent après dépublication, absent si le script est indisponible.

- [ ] **Step 4: Commit.**
```bash
git add src/pages/planning/PlanningDashboard.tsx
git commit -m "feat(vote): carte Vote du mois et bandeau Tuteur du mois"
```

---

### Task 6: Vérification de bout en bout et consignes de déploiement

**Files:**
- Modify (hors dépôt, dans le dossier temporaire de la session) : le faux serveur de démonstration pour qu'il délègue les actions de vote au harness du Task 1 (le vrai code du script tourne donc dans la démonstration).

**Interfaces:**
- Consumes: `loadScript` du harness (Task 1).
- Produces: rien dans le dépôt.

- [ ] **Step 1: Étendre le faux serveur.** Les `POST /api/planning` dont l'action est de vote sont transmis à `loadScript(...).call(action, body)` avec les membres fictifs « DÉMO ». Date du jour réglable par variable d'environnement pour tester fenêtre ouverte et fermée.

- [ ] **Step 2: Parcours complet, captures à l'appui.** Trois comptes (tuteur, chef de projet, Bureau) : voter, changer, voir le refus pour soi-même, exclure, publier, dépublier, bandeau, fenêtre fermée, script indisponible (serveur arrêté). Lire la console du navigateur : aucune erreur.

- [ ] **Step 3: Passes finales.**
  Run: `npm run test:vote && npm run lint && npm run build`
  Expected: tests verts, lint propre (hors avertissements déjà présents avant ce travail), build réussi.

- [ ] **Step 4: Remettre les consignes de déploiement à l'utilisateur, sans rien pousser.** Texte à donner : ouvrir l'éditeur Apps Script du Sheet, remplacer le contenu par `google-apps-script.js`, puis « Déployer » > « Gérer les déploiements » > modifier le déploiement existant > « Nouvelle version » (pour garder la même URL). Puis, sur confirmation de l'utilisateur, `git push origin main`.
