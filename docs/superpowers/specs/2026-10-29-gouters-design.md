# Goûters des projets : conception

Date : 2026-10-29

## Objectif

Ajouter dans l'espace membre (`/planning`) une page « Goûters ». Chaque projet organise plusieurs goûters dans l'année (vente à 1 € le produit, pour financer le projet). Les membres s'y inscrivent à des créneaux d'une heure et indiquent ce qu'ils apportent à manger. Les chefs de projet et le Bureau ajoutent les dates.

## Règles validées

- **Goûter :** une date (`YYYY-MM-DD`, heure de Paris) pour un projet (1 à 9), avec une note facultative (lieu, par exemple). Plusieurs goûters par projet et par an, au plus un par projet et par jour.
- **Qui voit et s'inscrit :** tous les membres connectés (tuteurs, chefs de projet, Bureau) voient les goûters de tous les projets et s'inscrivent. Il n'y a rien de sensible dans ces données.
- **Qui gère :** les chefs de projet pour les projets de la colonne J « Projets enfants » du Sheet (remplie par le Bureau), et le Bureau pour tous les projets. Ils ajoutent des dates, annulent un goûter, et retirent l'inscription ou l'apport de n'importe qui.
- **Créneaux :** 10 créneaux d'une heure, de 9h-10h à 18h-19h (heure de début de 9 à 18). Sans limite de personnes. Une personne peut prendre plusieurs créneaux du même goûter. Cliquer sur un créneau où l'on est inscrit retire l'inscription.
- **Qui apporte quoi :** par goûter, en texte libre, indépendant des créneaux. Une personne peut ajouter plusieurs éléments. Le texte est nettoyé (espaces en trop, caractères de formule `= + - @` en tête retirés), coupé à 80 caractères, refusé s'il est vide. Chacun retire ses propres éléments.
- **Dates :** on ne peut pas ajouter une date passée. On peut ajouter plusieurs dates d'un coup (une par ligne). Une date déjà prise par un goûter actif du même projet est ignorée. Modifier une date = annuler le goûter et en créer un autre.
- **Inscriptions :** possibles seulement pour un goûter actif dont la date est aujourd'hui ou à venir. Un goûter passé reste consultable, sans modification. Un goûter annulé n'apparaît plus.
- **Annuler un goûter** le désactive (`active` = `false`) : il disparaît de la page, ses inscriptions restent dans le Sheet.
- **Heures :** les heures passées à un goûter ne comptent pas pour les 50 heures de l'attestation. Aucun changement au calcul des heures.

## Hors périmètre (YAGNI)

- Pas de rappels ni de notifications, pas de limite de places par créneau.
- Pas de modification d'une date (annuler puis recréer), pas de quantités ni de budget.
- Pas d'export, pas de comptage des ventes.
- Aucun changement aux réservations, aux heures, à la présence des enfants ni au vote.

## Architecture

Même schéma que le vote et la présence des enfants. Le backend est le script Google Apps Script ([google-apps-script.js](../../../google-apps-script.js)), appelé en `POST` via le relais Vercel [api/planning.js](../../../api/planning.js), qui transmet déjà tout : aucun fichier Vercel n'est ajouté.

### Stockage (nouveaux onglets, créés automatiquement)

| Onglet | Colonnes | Rôle |
|---|---|---|
| `Gouters` | `id`, `projectId`, `date`, `note`, `active`, `createdBy`, `createdAt` | Un goûter par ligne. `id` commence par une lettre (par exemple `g3fa91c2`). |
| `GouterCreneaux` | `gouterId`, `hour`, `userId`, `createdAt` | Une ligne par personne et par créneau. `hour` vaut 9 à 18 (heure de début). |
| `GouterApports` | `id`, `gouterId`, `userId`, `item`, `createdAt` | Un apport par ligne. `id` commence par une lettre. |

Les colonnes d'identifiants, la date et la note sont créées au format texte (pas de conversion en nombre ou en date, pas de formule). Les identifiants sont comparés comme des chaînes, et la date est toujours relue en texte `YYYY-MM-DD`.

### Authentification et droits

Toutes les actions exigent le jeton de session (`verifySessionToken`, `code: unauthenticated` sinon), vérifié avant toute lecture ou écriture. Le rôle et les projets de l'appelant sont lus dans la première feuille du Sheet (colonne J pour les projets), jamais dans la requête. Le droit de gérer un projet vaut pour le Bureau, ou pour un chef de projet dont la colonne J contient ce projet. Sinon `code: forbidden`.

### Actions du script (nouveau `handleGoutersAction`, appelé dans `doPost` après la présence des enfants)

| Action | Paramètres | Effet |
|---|---|---|
| `getGouters` | `requesterId`, `token` | Renvoie les goûters actifs de l'année scolaire en cours, triés par date : projet, date, note, `isPast`, `canManage`, et pour chacun les 10 créneaux avec les inscrits (`userId` et nom), les apports (`id`, texte, auteur) et si le demandeur a le droit de retirer chaque élément. Plus la liste des projets que le demandeur peut gérer. |
| `addGouters` | `requesterId`, `token`, `projectId`, `dates` (liste), `note` (facultatif) | Gestionnaire du projet seulement. Ajoute les dates valides et futures, ignore les doublons, renvoie le nombre ajouté. Refuse si aucune date n'est valide (`invalid`). |
| `cancelGouter` | `requesterId`, `token`, `gouterId` | Gestionnaire du projet du goûter seulement. Désactive le goûter. |
| `setGouterSlot` | `requesterId`, `token`, `gouterId`, `hour`, `joined` (booléen), `userId` (facultatif) | Inscrit ou désinscrit le demandeur du créneau. Un gestionnaire peut désinscrire un autre membre en passant son `userId`. Refuse un goûter passé ou annulé, une heure hors 9 à 18. |
| `addGouterItem` | `requesterId`, `token`, `gouterId`, `item` | Ajoute un apport au nom du demandeur. Même règle sur le goûter passé ou annulé. |
| `removeGouterItem` | `requesterId`, `token`, `itemId` | L'auteur retire son apport. Un gestionnaire du projet peut retirer n'importe lequel. |

Les écritures prennent le verrou de script (`LockService`). Les erreurs ont la forme `{ success: false, code, message }` (`unauthenticated`, `forbidden`, `invalid`, `error`).

### Front

- Route `/planning/gouters` dans `App.tsx`, carte « Goûters » sur le tableau de bord pour tous les membres.
- `src/pages/planning/PlanningGouters.tsx` avec : la liste des goûters à venir (puis les passés, repliés), le détail d'un goûter (créneaux avec les noms des inscrits et un bouton s'inscrire ou se retirer ; un créneau vide est signalé ; « Qui apporte quoi » avec un champ d'ajout), et pour les gestionnaires un bloc « Ajouter des dates » (projet, dates une par ligne, note) et un bouton « Annuler ce goûter ».
- `src/hooks/useGouters.ts`, `src/data/gouterResponse.ts` (validation de la réponse du script), fonctions réseau ajoutées à `src/data/planningData.ts` à côté de celles du vote et de la présence des enfants.
- Session expirée : « Se reconnecter », comme les autres pages.

## Gestion des erreurs

- Après chaque action, le front relit `getGouters` : aucun état local incohérent.
- Date passée, goûter annulé ou passé, heure invalide, texte vide : message clair, rien n'est écrit.
- Réseau ou script indisponible : message et bouton Réessayer. Avant le redéploiement du script, la page affiche une erreur.

## Tests et vérification

- Logique du script avec le faux Google Sheet en Node : droits (jeton invalide, gestionnaire d'un autre projet refusé, Bureau partout, membre simple qui tente de gérer), ajout de dates (futures seulement, doublons, plusieurs d'un coup), inscription et désinscription, plusieurs personnes sur le même créneau, plusieurs créneaux pour une personne, heure hors plage, goûter passé ou annulé refusé, apports (ajout, retrait par l'auteur et par un gestionnaire, refus par un autre membre, formule neutralisée, texte coupé), annulation, aucun mélange entre les identités.
- Validation de la réponse côté client, sur le modèle des tests précédents. Ces tests rejoignent `npm run test:vote`.
- Vérification de l'interface dans le navigateur avec le faux serveur de démonstration, `tsc` et lint avant tout commit.

## Mise en ligne

1. Le front se déploie via Vercel après confirmation de l'utilisateur avant le `push`.
2. L'utilisateur recopie `google-apps-script.js` (qui inclut aussi l'appel des enfants par séance) dans l'éditeur Apps Script et le redéploie (Nouvelle version).
3. Un chef de projet ou le Bureau saisit ensuite les dates de goûters.
