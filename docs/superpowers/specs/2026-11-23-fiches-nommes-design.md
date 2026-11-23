# Fiches des nommés au tuteur du mois : conception

Date : 2026-11-23. S'appuie sur le vote existant ([2026-10-27-tuteur-du-mois-design.md](2026-10-27-tuteur-du-mois-design.md)).

## Ce que veut l'utilisateur

Une galerie des nommés au tuteur du mois inspirée de la page des nommés du Ballon d'Or :
- une grille de cartes avec la photo de chaque nommé ;
- une page dédiée par nommé quand on clique, avec la photo animée, dans l'esprit fanzine du site ;
- à côté de la photo, la liste de ses accomplissements et un bandeau de stats.

Décisions prises avec l'utilisateur :
- la galerie est visible sur le site public **et** dans l'espace membre ;
- tous les membres ont déjà signé l'accord pour leur image : aucune case d'accord ;
- seul le Bureau remplit les fiches, le nommé n'y touche jamais ;
- l'animation est un « collage qui tremble » (stop motion) ;
- les stats sont préremplies (projet, heures validées, séances depuis la rentrée) et le Bureau peut en modifier ou en ajouter.

## Ce qu'on voit

### Site public : `/tuteur-du-mois`

- En-tête : « Les nommés de novembre 2026 » (mois de la fiche affichée), style des pages publiques (`Events.tsx` : fond crème `#FFFBF4`, titre `font-display`, surlignage `marker-highlight`).
- Grille de cartes portrait : la photo en collage (bord blanc, léger angle, morceau de scotch `MaskingTape`), le nom en gros, le projet. 1 colonne sur téléphone, 2 sur tablette, 3 sur ordinateur.
- Le gagnant publié porte un badge « Tuteur du mois » et passe en premier.
- Mois affiché : le plus récent qui a au moins une fiche **avec photo**. Les nommés restent donc visibles jusqu'à ce que les fiches du mois suivant aient leur photo.
- Aucun nommé à afficher : un court message (« Les nommés du mois arrivent bientôt »).
- Lien « Tuteur du mois » ajouté au menu du site (`Header.tsx`), entre « Événements » et « Partenaires ».

### Site public : `/tuteur-du-mois/:slug`

- Le nom en très gros (`font-display`), sur deux lignes si besoin.
- La photo en collage qui tremble : 3 positions légèrement différentes (rotation et décalage de quelques pixels), qui alternent par à-coups (`steps`) toutes les 0,3 s environ. Avec `prefers-reduced-motion`, la photo reste immobile.
- Bandeau de stats : une case par ligne de stat (libellé en petit, valeur en gros).
- À côté de la photo (en dessous sur téléphone) : « Ses accomplissements », la liste du Bureau.
- Liens vers les autres nommés du mois et retour à la grille.
- Slug : nom affiché en minuscules sans accents, mots séparés par des tirets (« hugo-simon »). Si deux nommés du même mois ont le même slug, le second reçoit « -2 ».
- Slug inconnu : message « Ce nommé n'existe pas » et lien vers la grille.

### Espace membre : page Vote

- Les candidats deviennent des cartes avec photo (sans photo : initiales sur fond violet). Toutes les fiches sont visibles, même sans photo.
- Clic sur une carte : la même fiche, aux couleurs de l'espace membre, avec le bouton « Voter pour Prénom » quand le vote est ouvert (même règle qu'aujourd'hui : pas pour soi, second clic pour retirer).
- Le comportement actuel du vote ne change pas.

### Espace membre : Bureau

Dans « Candidats du vote », chaque nommé coché a un bouton « Fiche » qui ouvre un formulaire :
- **Photo** : choisir une image, elle est recadrée au format portrait 4:5 et réduite à 900 px de large en JPEG sur l'appareil avant l'envoi. Bouton pour la remplacer ou la retirer.
- **Nom affiché** : prérempli avec le nom du compte.
- **Accomplissements** : une zone de texte, un accomplissement par ligne (12 lignes maximum, 160 caractères chacune).
- **Stats** : lignes libellé + valeur. À la première ouverture, préremplies avec « Projet », « Heures validées » et « Séances » depuis le 1er septembre, calculées comme le Récap. Boutons « Ajouter une ligne », « Supprimer », « Recalculer » (remet à jour les trois lignes automatiques sans toucher aux autres). 8 lignes maximum.
- **Enregistrer**.

Décocher un nommé supprime sa fiche (et met sa photo à la corbeille Drive) après confirmation.

## Données et serveur

### Sheet et Drive

- Nouvel onglet `FichesNommes` : `monthKey`, `userId`, `displayName`, `accomplishments` (JSON, tableau de chaînes), `stats` (JSON, tableau `{label, value}`), `photoFileId`, `updatedAt`. Une ligne par (mois, nommé).
- Photos dans un dossier Drive privé « Phoenix - Photos nommés » (créé au premier envoi). Le fichier n'est jamais partagé.
- Le mois d'une fiche est le `selectionMonthKey` du vote (celui que le Bureau prépare).

### Nouvelles actions du script

| Action | Qui | Effet |
|---|---|---|
| `saveNomineeProfile` | Bureau (jeton) | Crée ou met à jour la fiche d'un candidat du mois en préparation. Refus si le membre n'est pas candidat. |
| `uploadNomineePhoto` | Bureau (jeton) | Reçoit un JPEG en base64 (1,5 Mo max), le range dans le dossier, met l'ancienne photo à la corbeille. |
| `removeNomineePhoto` | Bureau (jeton) | Retire la photo de la fiche et la met à la corbeille. |
| `getNominees` (GET, public) | Tout le monde | Fiches avec photo du mois affiché, gagnant publié éventuel. Renvoie seulement : nom affiché, slug, accomplissements, stats, identifiant de photo, badge gagnant. Jamais l'identifiant du compte ni d'autre donnée. |
| `getNomineePhoto` (GET, public) | Tout le monde | L'image d'une fiche, seulement si cette photo appartient à une fiche existante. |

- `getVoteData` renvoie en plus la fiche de chaque candidat (`profile` : nom affiché, accomplissements, stats, `photoId`) pour l'espace membre.
- `voteSetCandidate` avec `selected: false` supprime la fiche du mois et met la photo à la corbeille.

### Photos sur le site

Le relais existant `api/planning.js` gagne une branche `GET ?photo=<id>&v=<updatedAt>` qui appelle `getNomineePhoto`, renvoie l'image en `image/jpeg` avec `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`. Le paramètre `v` change à chaque nouvelle photo, ce qui évite d'afficher une ancienne image. Pas de nouveau fichier dans `api/` (limite de fonctions Vercel).

La page publique lit les fiches avec `GET /api/planning?nominees=1` (même relais, cache court : `s-maxage=300`).

## Erreurs et cas limites

- Envoi de photo trop lourd ou qui n'est pas une image : message clair, la fiche n'est pas modifiée.
- Le script pas encore redéployé : la page publique affiche « Les nommés du mois arrivent bientôt » au lieu d'une erreur.
- Une fiche dont la photo a été supprimée à la main dans Drive : traitée comme une fiche sans photo.
- Un nom affiché avec des caractères spéciaux : le slug garde seulement `a-z`, `0-9` et les tirets.
- Accomplissements et stats sont du texte affiché tel quel (jamais interprété comme HTML).

## Tests

- Script (harnais `scripts/lib/apps-script-harness.mjs`, avec un faux `DriveApp`) : droits Bureau sur les trois actions d'écriture, refus si non candidat, limites de taille, `getNominees` ne renvoie que les fiches avec photo du bon mois et aucun identifiant de compte, choix du mois affiché, slug et doublons, suppression de la fiche quand on décoche, `getNomineePhoto` refuse un fichier qui n'est pas une photo de fiche.
- Client : validation des réponses (`parseNominees`, fiche dans `parseVoteData`), calcul des stats préremplies, génération du slug, recadrage/compression (fonction pure de calcul des dimensions).
- Vérification visuelle sur la démo (`demo-api.mjs`) : grille et fiche publiques, téléphone et ordinateur, animation et mode « réduire les animations », formulaire Bureau.

## Mise en ligne

1. Coller le script et le redéployer en « Nouvelle version ». Google peut redemander l'autorisation Drive (déjà accordée pour la sauvegarde).
2. Pousser le site.
3. Le Bureau remplit les fiches des nommés de novembre.

## Hors champ

- Archive des mois précédents sur le site public.
- Détourage automatique des photos.
- Saisie de la fiche par le nommé lui-même.
