# Présence des enfants par projet : conception

Date : 2026-10-29

## Objectif

Ajouter dans l'espace membre (`/planning`) un onglet « Présence enfants ». Le chef de projet (CDP) y tient la liste des enfants de son projet pour l'année, fait l'appel à chaque séance et consulte les taux de présence. Le Bureau voit tous les projets et peut aussi faire ou corriger l'appel.

Demande d'origine : un message de Brault, relayé par l'utilisateur. Le CDP écrit lui-même les noms des enfants de l'année (c'est lui qui les change d'une année à l'autre) et coche la présence à chaque séance.

## Règles validées

- **Accès :** rôles `chef_projet` et `bureau` seulement. Les tuteurs n'ont ni l'onglet ni l'accès côté serveur.
- **CDP :** voit et modifie la liste, fait l'appel et voit les bilans, uniquement pour les projets de la colonne J « Projets enfants » du Sheet. Cette colonne est remplie par le Bureau : la colonne F (projet de rattachement) ne donne aucun accès, car chaque membre peut la changer lui-même depuis « Mon compte ».
- **CDP sans projet** dans son compte : ne voit aucun projet (contrairement à la page de validation des tuteurs, qui lui montre tout). Les données d'enfants ne s'ouvrent jamais par défaut.
- **Bureau :** voit tous les projets, ajoute et retire des enfants, fait ou corrige l'appel de n'importe quel projet, et voit le bilan de tous les projets.
- **Séance :** un créneau du planning (`slotId`, par exemple `slot-4-jeu`) pour une semaine (`weekKey`, par exemple `2026-W44`), comme pour les réservations des tuteurs. L'appel est rattaché à la séance, pas au projet seul. Le créneau doit appartenir au projet (le numéro du projet est dans l'identifiant du créneau). Le jour de la séance se déduit de la semaine et du jour du créneau ; une séance à venir est refusée, celle d'aujourd'hui est acceptée. Au plus un appel par séance : réenregistrer la remplace. Les séances exceptionnelles qui ne sont pas dans le planning ne sont pas gérées.
- **Données sur les enfants :** prénom et initiale du nom seulement (par exemple « Inès B. »). L'interface l'indique. Le serveur coupe le nom à 40 caractères et refuse un nom vide.
- **Retirer un enfant** le désactive, il n'est pas effacé : ses présences passées restent dans les bilans. Un enfant désactivé n'apparaît plus dans les appels futurs ni dans la liste active.
- **Ajouter un enfant :** un seul champ où l'on colle une ou plusieurs lignes (un nom par ligne). Les doublons dans le même projet (même nom, sans tenir compte de la casse) sont ignorés.
- **Appel :** une case par enfant actif. Enregistrer écrit une ligne par enfant actif pour cette séance, présent ou absent. On distingue ainsi un appel fait où tout le monde est absent d'un appel pas fait. Enregistrer de nouveau la même séance remplace l'appel (correction). Un enfant ajouté après un appel n'est pas compté sur cet appel.
- **Bilan :** sur l'année scolaire en cours (du 1er septembre au 31 août, heure de Paris). Par enfant : séances comptées, présences, taux. Par projet : nombre d'enfants actifs, nombre de séances avec appel (créneaux distincts par semaine), taux moyen. Un enfant n'est compté que sur les appels où il figure.

## Hors périmètre (YAGNI)

- Pas d'export en tableau ni d'impression.
- Pas de statut « excusé » : présent ou absent.
- Pas d'historique par année consultable au-delà de l'année scolaire en cours, ni de rattachement des enfants à un créneau.
- Pas de notification ni de rappel quand un appel n'est pas fait.
- Pas de suppression définitive d'un enfant depuis le site (le Bureau peut supprimer une ligne dans le Sheet).
- Aucun changement aux réservations, validations ou heures des tuteurs.

## Architecture

Même schéma que le vote. Le backend est le script Google Apps Script ([google-apps-script.js](../../../google-apps-script.js)), appelé en `POST` via le relais Vercel [api/planning.js](../../../api/planning.js), qui transmet déjà tout : aucun fichier Vercel n'est ajouté.

### Stockage (nouveaux onglets, créés par `getOrCreateSheet`)

| Onglet | Colonnes | Rôle |
|---|---|---|
| `Enfants` | `id`, `projectId`, `name`, `active`, `createdAt` | Un enfant par ligne. `active` vaut `true` ou `false`. `id` est un identifiant généré commençant par une lettre (par exemple `k3fa91c2`), pour que Sheets ne le lise jamais comme un nombre. Un nom commençant par `=`, `+`, `-` ou `@` est nettoyé de ces caractères (sinon Sheets le lirait comme une formule). |
| `PresencesSeances` | `projectId`, `slotId`, `weekKey`, `childId`, `present`, `markedBy`, `markedAt` | Une ligne par enfant et par séance. Remplacée en bloc quand l'appel est réenregistré. |

Les colonnes `slotId`, `weekKey` et `childId` sont créées au format texte, et les identifiants sont comparés comme des chaînes.

### Authentification et droits

Toutes les actions exigent le jeton de session du vote (`verifySessionToken`, `code: unauthenticated` sinon), vérifié avant toute lecture ou écriture. Le rôle et les projets de l'appelant sont lus dans la feuille des utilisateurs, jamais dans la requête. La lecture des utilisateurs du vote ne donne pas les projets : on ajoute `projectIds` (colonne J « Projets enfants », liste séparée par des virgules) à ce qu'elle renvoie, sans changer ce que le vote en fait.

Contrôles côté serveur, dans cet ordre :
1. jeton valide pour `requesterId` ;
2. rôle `chef_projet` ou `bureau`, sinon `code: forbidden` ;
3. le projet demandé fait partie des projets de l'appelant, sauf pour le Bureau, sinon `code: forbidden`.

Un CDP ne reçoit jamais les enfants, les présences ni les taux d'un autre projet.

### Actions du script (nouveau `handleChildrenAction`, appelé au début de `doPost` après le vote)

| Action | Paramètres | Effet |
|---|---|---|
| `getChildrenData` | `requesterId`, `token`, `projectId` (facultatif), `weekKey` (facultatif, semaine en cours par défaut), `slotId` (facultatif) | Renvoie les projets accessibles, les enfants actifs du projet demandé, les créneaux dont l'appel est déjà fait cette semaine (`doneSlots`), l'appel de la séance demandée (présents, ou `null` si pas fait) et le bilan de l'année scolaire. Le Bureau reçoit en plus le résumé de tous les projets. Sans `projectId`, le premier projet accessible est utilisé. |
| `addChildren` | `requesterId`, `token`, `projectId`, `names` (liste) | Ajoute les enfants, ignore les noms vides et les doublons. |
| `removeChild` | `requesterId`, `token`, `projectId`, `childId` | Passe l'enfant à inactif. |
| `saveChildAttendance` | `requesterId`, `token`, `projectId`, `slotId`, `weekKey`, `presentIds` (liste) | Remplace l'appel de la séance : une ligne par enfant actif, présent s'il figure dans `presentIds`. Refuse un créneau qui n'est pas du projet, une semaine invalide ou une séance à venir, ignore les identifiants qui ne sont pas des enfants actifs du projet. |

Les écritures prennent le verrou de script (`LockService`), comme le vote. Les réponses d'erreur ont la forme `{ success: false, code, message }`, avec les codes `unauthenticated`, `forbidden`, `invalid` et `error`.

### Front

- Route `/planning/presences-enfants` dans `App.tsx`, carte « Présence enfants » sur le tableau de bord (`PlanningDashboard.tsx`), visible seulement pour `chef_projet` et `bureau`. Pas de lien dans la barre du haut : elle n'est pas visible sur téléphone, et les autres pages de CDP n'y figurent pas non plus. La page refuse aussi l'accès aux autres rôles, comme `PlanningValidation`.
- `src/pages/planning/PlanningPresenceEnfants.tsx` avec trois blocs :
  - **Appel :** navigation par semaine, séances du projet de cette semaine (créneaux du planning, avec la règle une semaine sur deux de Jules Ferry), badge « Appel fait », puis une case par enfant et un bouton Enregistrer. Si l'appel de la séance existe déjà, il est pré-rempli et le bouton devient « Enregistrer les corrections ». Les séances à venir ne sont pas sélectionnables.
  - **Liste :** champ de saisie multi-lignes avec le rappel « prénom et initiale du nom seulement », liste des enfants actifs, bouton Retirer.
  - **Bilan :** taux par enfant et pour le projet. Le Bureau voit en plus le tableau de tous les projets.
- `src/hooks/useChildrenData.ts` et `src/data/childrenResponse.ts` (validation de la réponse du script), sur le modèle de `useVoteData.ts` et `voteResponse.ts`. Les appels réseau sont ajoutés à `src/data/planningData.ts` à côté de ceux du vote.
- La session expirée (`unauthenticated`) propose « Se reconnecter », comme la page de vote.

## Gestion des erreurs

- Après chaque action, le front relit `getChildrenData` : aucun état local incohérent.
- Séance à venir, semaine ou créneau invalide, nom vide ou enfant inconnu : message clair, rien n'est écrit.
- Réseau ou script indisponible : message et bouton Réessayer. Avant le redéploiement du script, la page affiche une erreur côté production.

## Tests et vérification

- Logique du script avec le faux Google Sheet en Node (`scripts/lib/apps-script-harness.mjs`) : droits (tuteur refusé, CDP limité à ses projets, Bureau partout, jeton invalide), ajout et doublons, retrait, appel enregistré puis corrigé, date future refusée, enfant ajouté après un appel, taux et année scolaire (frontière du 1er septembre), absence de fuite des noms vers un autre projet.
- Validation de la réponse côté client (`parseChildrenData`), sur le modèle des tests du vote.
- Ces tests rejoignent `npm run test:vote`.
- Vérification de l'interface dans le navigateur avec le faux serveur de démonstration (enfants fictifs), `tsc` et lint avant tout commit.

## Mise en ligne

1. Le front se déploie via Vercel après confirmation de l'utilisateur avant le `push`.
2. L'utilisateur doit recopier `google-apps-script.js` dans l'éditeur Apps Script et le redéployer (Nouvelle version).
3. Lancer une fois `initialiserProjetsEnfants` dans l'éditeur Apps Script (crée la colonne J et y recopie les projets des CDP), puis vérifier la colonne J.
4. Chaque CDP saisit ensuite les enfants de son projet.
