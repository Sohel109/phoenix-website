# Vote mensuel du tuteur du mois : conception

Date : 2026-10-27

## Objectif

Ajouter dans l'espace membre (`/planning`) un vote mensuel pour élire le « tuteur du mois ». Le vote se fait sur le site, sans formulaire externe.

## Règles validées

- **Électeurs :** tous les comptes de l'espace membre (rôles `tuteur`, `chef_projet`, `bureau`).
- **Candidats :** personne n'est candidat par défaut. Pour chaque vote, le Bureau choisit les candidats parmi tous les comptes (Bureau compris). Il en choisit en général 5, sans plafond ni minimum imposés. Tant qu'aucun candidat n'est choisi, les membres ne peuvent pas voter.
- **Mois de sélection :** le Bureau doit pouvoir choisir les candidats avant l'ouverture. Quand le vote est ouvert, la sélection porte sur le vote en cours. Quand il est fermé, elle porte sur le prochain vote (le mois en cours), alors que le décompte et la publication portent encore sur le vote précédent.
- **Un vote par mois et par électeur.** Il est modifiable tant que le vote est ouvert. On ne peut pas voter pour soi-même.
- **Fenêtre de vote :** les 7 derniers jours du mois civil, heure de Paris. Pour un mois de 31 jours, du 25 au 31 inclus. Pour un mois de 30 jours, du 24 au 30. Pour février, du 22 au 28 (29 en année bissextile : du 23 au 29).
- **Mois de référence :** le mois sur lequel portent les votes, les candidats, le décompte et la publication. Du premier jour de la fenêtre (ex. 25 octobre) jusqu'à la fin du mois, c'est le mois en cours. Ensuite, jusqu'à l'ouverture de la fenêtre suivante (ex. du 1er au 24 novembre), c'est encore le mois précédent. Le Bureau peut ainsi lire les résultats d'octobre et publier le gagnant début novembre, et le bandeau « Tuteur du mois » reste affiché jusqu'au vote suivant.
- **Résultats :** le décompte n'est visible que du Bureau. Les électeurs ne voient que leur propre vote.
- **Publication :** le Bureau peut publier le gagnant sur le site. Il choisit lui-même le nom, ce qui règle les égalités. Il peut aussi dépublier. Sans publication, l'annonce se fait hors site (réunion, réseaux sociaux).

## Hors périmètre (YAGNI)

- Pas d'historique consultable par les membres, ni de page dédiée aux anciens gagnants.
- Pas de notifications ni d'e-mails de rappel.
- Pas de vote anonyme cryptographique : le Sheet reste lisible par l'administrateur du Google Sheet.
- Aucune modification de la gestion des mots de passe. La connexion ne change que par un ajout : elle remet un jeton de session (voir « Authentification des actions de vote »).

## Architecture

Le backend du planning est un Google Apps Script ([google-apps-script.js](../../../google-apps-script.js)), appelé via le relais Vercel [api/planning.js](../../../api/planning.js). Le relais transmet déjà tout `POST` tel quel : aucun fichier serveur Vercel n'est ajouté. Les lectures du vote passent aussi par `POST`, parce que le `GET` du relais est limité à `getPlanningData`.

### Stockage (nouveaux onglets du Google Sheet, créés par `getOrCreateSheet`)

| Onglet | Colonnes | Rôle |
|---|---|---|
| `Votes` | `monthKey`, `voterId`, `candidateId`, `updatedAt` | Un vote par (mois, électeur). Un nouveau vote remplace l'ancien. |
| `VoteCandidats` | `monthKey`, `userId` | Candidats choisis par le Bureau pour ce mois. Une ligne = candidat, pas de ligne = pas candidat. |
| `TuteurDuMois` | `monthKey`, `userId`, `publishedAt` | Gagnant publié pour un mois. Absent = pas de publication. |

`monthKey` est au format `YYYY-MM`.

### Actions du script (`doPost`)

Toutes ces actions reçoivent `requesterId`. Le script retrouve le rôle de la personne dans la feuille des utilisateurs, il ne fait pas confiance au rôle envoyé par le navigateur.

- `getVoteData` : renvoie le mois de référence, l'état de la fenêtre (ouverte ou non, dates d'ouverture et de fermeture, prochaine ouverture), la liste des candidats éligibles (id et nom), le vote de `requesterId` et le gagnant publié. Si le demandeur est Bureau, renvoie en plus le décompte par candidat et la liste des exclusions.
- `castVote` : `{ voterId, candidateId }`. Refus si la fenêtre est fermée, si `voterId == candidateId`, si le candidat n'est pas éligible, ou si le votant est inconnu.
- `setVoteCandidate` (Bureau seulement) : `{ userId, selected }` (booléen obligatoire) ajoute ou supprime la ligne de candidat du mois de sélection. Sans plafond.
- `publishWinner` (Bureau seulement) : `{ userId }` publie, `{ userId: null }` dépublie.

Un candidat retiré qui avait déjà reçu des voix ne compte plus dans le décompte (le décompte ne retient que les candidats actuels).

### Éligibilité

Éligibles du vote = les comptes présents dans `VoteCandidats` pour le mois de référence. Calculé côté script.

### Front (React)

- `src/data/planningData.ts` : fonctions `fetchVoteData`, `castVoteApi`, `setVoteCandidateApi`, `publishWinnerApi`, sur le modèle de `syncEventAttendanceApi`.
- `src/pages/planning/PlanningVote.tsx` : la page. Trois états pour un membre (fenêtre fermée avec date d'ouverture, vote ouvert avec liste de candidats, vote enregistré avec possibilité de changer). Une section supplémentaire pour le Bureau (décompte, éligibilité, publication).
- Route `/planning/vote` dans `App.tsx`, entrée dans le menu de `PlanningLayout.tsx`, nouvelle case dans `PlanningDashboard.tsx`.
- Bandeau « Tuteur du mois » sur le tableau de bord quand un gagnant est publié pour le mois de référence.

Le calcul de la fenêtre existe à la fois dans le script (autorité) et dans le front (affichage). Le front affiche ce que renvoie `getVoteData`, il ne recalcule pas.

## Gestion des erreurs

- Fenêtre fermée ou vote refusé : message clair dans la page, aucun état local incohérent (le front relit `getVoteData` après chaque action).
- Réseau ou script indisponible : message d'erreur et possibilité de réessayer, comme pour les autres pages du planning.

## Tests et vérification

- La logique du script (fenêtre, éligibilité, refus, décompte) est vérifiée avec un faux `SpreadsheetApp` exécuté en Node.
- Le faux serveur de démonstration (membres fictifs « DÉMO ») est étendu avec ces actions, pour tester l'interface et faire des captures.
- Vérification de type (`tsc`) et lint avant tout commit.

## Mise en ligne

1. Le front se déploie via Vercel comme d'habitude, après confirmation de l'utilisateur avant le `push`.
2. L'utilisateur doit recopier `google-apps-script.js` dans l'éditeur Apps Script et créer un nouveau déploiement. Avant cette étape, la page Vote du mois affiche une erreur côté production.

## Authentification des actions de vote (ajout après la revue finale)

Problème : le script prenait l'identifiant annoncé dans la requête (`requesterId`, `voterId`) pour argent comptant. Ces identifiants sont lisibles sans connexion (`listUsers`), donc quelqu'un pouvait voter à la place d'un autre, lire son vote ou se faire passer pour le Bureau.

Solution :
- À la connexion, le script ajoute `token` à l'objet `user` renvoyé. Le jeton est `<expiration en ms>.<HMAC-SHA256 de "<id>.<expiration>">`, valable 12 heures. Le secret de signature (`SESSION_SECRET`) est créé automatiquement au premier usage dans les propriétés du script.
- Si la création du jeton échoue, la connexion réussit quand même, sans jeton.
- Les quatre actions de vote refusent (`code: unauthenticated`) toute requête dont le jeton n'est pas valide pour l'identifiant annoncé (`voterId` pour `castVote`, `requesterId` sinon). Le contrôle a lieu avant toute lecture ou écriture.
- Le front garde le jeton dans la session (il fait déjà partie de l'objet utilisateur) et l'envoie avec chaque action de vote. Une session ouverte avant la mise en place des jetons n'en a pas : la page propose « Se reconnecter ».
- Limite restante : les autres actions du planning (réservations, présences) ne sont pas protégées par ce jeton. Seul le vote l'est.
