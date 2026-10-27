# Vote mensuel du tuteur du mois : conception

Date : 2026-10-27

## Objectif

Ajouter dans l'espace membre (`/planning`) un vote mensuel pour élire le « tuteur du mois ». Le vote se fait sur le site, sans formulaire externe.

## Règles validées

- **Électeurs :** tous les comptes de l'espace membre (rôles `tuteur`, `chef_projet`, `bureau`).
- **Candidats par défaut :** tous les comptes, Bureau compris. Le Bureau peut, pour un mois donné, exclure un membre, puis le réintégrer.
- **Un vote par mois et par électeur.** Il est modifiable tant que le vote est ouvert. On ne peut pas voter pour soi-même.
- **Fenêtre de vote :** les 7 derniers jours du mois civil, heure de Paris. Pour un mois de 31 jours, du 25 au 31 inclus. Pour un mois de 30 jours, du 24 au 30. Pour février, du 22 au 28 (29 en année bissextile : du 23 au 29).
- **Résultats :** le décompte n'est visible que du Bureau. Les électeurs ne voient que leur propre vote.
- **Publication :** le Bureau peut publier le gagnant sur le site. Il choisit lui-même le nom, ce qui règle les égalités. Il peut aussi dépublier. Sans publication, l'annonce se fait hors site (réunion, réseaux sociaux).

## Hors périmètre (YAGNI)

- Pas d'historique consultable par les membres, ni de page dédiée aux anciens gagnants.
- Pas de notifications ni d'e-mails de rappel.
- Pas de vote anonyme cryptographique : le Sheet reste lisible par l'administrateur du Google Sheet.
- Aucune modification de la connexion ni de la gestion des mots de passe.

## Architecture

Le backend du planning est un Google Apps Script ([google-apps-script.js](../../../google-apps-script.js)), appelé via le relais Vercel [api/planning.js](../../../api/planning.js). Le relais transmet déjà tout `POST` tel quel : aucun fichier serveur Vercel n'est ajouté. Les lectures du vote passent aussi par `POST`, parce que le `GET` du relais est limité à `getPlanningData`.

### Stockage (nouveaux onglets du Google Sheet, créés par `getOrCreateSheet`)

| Onglet | Colonnes | Rôle |
|---|---|---|
| `Votes` | `monthKey`, `voterId`, `candidateId`, `updatedAt` | Un vote par (mois, électeur). Un nouveau vote remplace l'ancien. |
| `VoteExclusions` | `monthKey`, `userId` | Membres exclus par le Bureau pour ce mois. Une ligne = exclu, pas de ligne = candidat. |
| `TuteurDuMois` | `monthKey`, `userId`, `publishedAt` | Gagnant publié pour un mois. Absent = pas de publication. |

`monthKey` est au format `YYYY-MM`.

### Actions du script (`doPost`)

Toutes ces actions reçoivent `requesterId`. Le script retrouve le rôle de la personne dans la feuille des utilisateurs, il ne fait pas confiance au rôle envoyé par le navigateur.

- `getVoteData` : renvoie le mois courant, l'état de la fenêtre (ouverte ou non, dates d'ouverture et de fermeture), la liste des candidats éligibles (id et nom), le vote de `requesterId` et le gagnant publié. Si le demandeur est Bureau, renvoie en plus le décompte par candidat et la liste des exclusions.
- `castVote` : `{ voterId, candidateId }`. Refus si la fenêtre est fermée, si `voterId == candidateId`, si le candidat n'est pas éligible, ou si le votant est inconnu.
- `setVoteExclusion` (Bureau seulement) : `{ userId, excluded }` ajoute ou supprime la ligne d'exclusion du mois courant.
- `publishWinner` (Bureau seulement) : `{ userId }` publie, `{ userId: null }` dépublie.

Un candidat exclu qui avait déjà reçu des voix ne compte plus dans le décompte (le décompte ne retient que les candidats éligibles).

### Éligibilité

Éligibles du mois = tous les comptes, moins ceux présents dans `VoteExclusions` pour ce mois. Calculé côté script.

### Front (React)

- `src/data/planningData.ts` : fonctions `fetchVoteData`, `castVoteApi`, `setVoteExclusionApi`, `publishWinnerApi`, sur le modèle de `syncEventAttendanceApi`.
- `src/pages/planning/PlanningVote.tsx` : la page. Trois états pour un membre (fenêtre fermée avec date d'ouverture, vote ouvert avec liste de candidats, vote enregistré avec possibilité de changer). Une section supplémentaire pour le Bureau (décompte, éligibilité, publication).
- Route `/planning/vote` dans `App.tsx`, entrée dans le menu de `PlanningLayout.tsx`, nouvelle case dans `PlanningDashboard.tsx`.
- Bandeau « Tuteur du mois » sur le tableau de bord quand un gagnant est publié pour le mois courant (ou pour le dernier mois fermé, tant qu'il n'est pas remplacé).

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
