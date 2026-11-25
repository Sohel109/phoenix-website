# Actualités et réels Instagram : conception

Date : 2026-11-25. Même architecture que les fiches des nommés ([2026-11-23-fiches-nommes-design.md](2026-11-23-fiches-nommes-design.md)) : données dans le Sheet, photos dans Drive, lecture publique par le relais `api/planning.js`.

## Pourquoi

L'association veut « partager ses actualités » sur le site : sorties, voyages, résultats, partenariats. Le Bureau ou le pôle com publient sans rythme fixe (chaque semaine, chaque mois ou au hasard), sans passer par un développeur. Le site affiche aussi les derniers réels du compte Instagram @phoenixedc, sans rien ressaisir.

Aujourd'hui, le pied de page contient un formulaire « Je m'abonne » qui n'enregistre rien : il affiche un message de remerciement et l'adresse est perdue. Il disparaît.

## Décisions prises avec l'utilisateur

- Pas d'envoi par mail : une rubrique Actualités sur le site.
- Publication depuis l'espace membre (pas de CMS branché sur le code, pas de compte GitHub).
- Réels Instagram récupérés automatiquement chaque jour. Le compte @phoenixedc est professionnel et l'utilisateur y a accès.
- Le bloc « Je m'abonne » du pied de page est remplacé par un renvoi vers les actualités.
- Droit à l'image : tous les tuteurs et les familles des élèves ont signé un accord. Aucune case de consentement dans le formulaire.
- Validé tel que proposé : article en ligne dès « Publier », modifiable, dépubliable, supprimable ; le Bureau et les membres cochés par le Bureau publient ; toute personne autorisée modifie tous les articles ; bande sur l'accueil ; lien dans le menu.

## Objectifs, non-objectifs, anti-objectifs

Objectifs :
- Une personne du pôle com publie un article avec photos depuis son téléphone en quelques minutes, et le voit en ligne en une minute environ.
- Les réels postés sur Instagram apparaissent sur le site le lendemain au plus tard, sans action.
- Pages publiques rapides : aucun lecteur Instagram chargé tant qu'on ne clique pas.

Non-objectifs :
- Newsletter par mail, liste d'abonnés.
- Commentaires, réactions, partage social intégré.
- Mise en forme riche (gras, titres, intégrations) dans le texte.
- Publications Instagram autres que les vidéos (photos, carrousels).
- Affichage des actualités sur la page de chaque projet.

Anti-objectifs (échec même si « ça marche ») :
- Un visiteur croit s'être abonné à quelque chose qui n'existe pas.
- Le site casse ou affiche une erreur quand le script n'est pas redéployé, quand Instagram est indisponible ou quand la clé Instagram a expiré : la partie concernée disparaît simplement.
- Un texte d'article interprété comme du HTML.
- La clé Instagram exposée au navigateur ou dans le dépôt.

## Approches envisagées

1. **Publication depuis l'espace membre (retenue).** Même chemin que les fiches : Sheet, Drive, relais existant. Rien à installer pour les personnes qui publient. Limite acceptée : les articles publiés après la dernière mise en ligne du site sont chargés par le navigateur, donc moins bien lus par les robots.
2. **Decap CMS branché sur le dépôt** (comme le site Diambars). Meilleur référencement, mais un compte GitHub par personne et une mise en ligne par article, avec le risque de déploiements bloqués déjà vécu sur Diambars. Écartée.
3. **Fil Instagram seul.** Pas de vrais articles. Retenu en complément, limité aux réels.

Pour les réels : récupération automatique par l'API Instagram (retenue) plutôt que liens collés à la main dans l'espace membre.

## Ce qu'on voit

### Site public : `/actualites`

```
NOS DERNIERS RÉELS                     (bande horizontale qui défile, 8 réels max)
[couv] [couv] [couv] [couv] [couv] →   clic : fenêtre avec le lecteur Instagram du réel
───────────────────────────────────
ACTUALITÉS
[grande carte : dernier article, photo de couverture, titre, date, début du texte]
[carte] [carte] [carte]                (1 colonne téléphone, 2 tablette, 3 ordinateur)
```

- Style des pages publiques (fond crème, `font-display`, esprit fanzine comme `Events.tsx` et `TuteurDuMois.tsx`).
- Réels : image de couverture au format vertical 9:16 et icône lecture. Au clic, une fenêtre s'ouvre avec l'intégration officielle `https://www.instagram.com/reel/<code>/embed` dans une iframe (chargée seulement à ce moment), un lien « Voir sur Instagram » et un bouton fermer (Échap, clic à côté). Sans réel disponible, la bande n'apparaît pas.
- Aucun article : « Les premières actualités arrivent bientôt » et un lien vers Instagram.

### Site public : `/actualites/:slug`

- Titre en très gros, date de publication (« 12 novembre 2026 »), projet lié s'il y en a un (étiquette qui mène à `/projets/<id>`).
- Photo de couverture en grand, puis le texte (paragraphes séparés par une ligne vide, liens `http(s)` rendus cliquables, rien d'autre interprété), puis les autres photos en galerie ; clic sur une photo : affichage en grand.
- « Les autres actus » : les 3 articles publiés les plus récents hors celui-ci. Retour à la liste.
- Slug inconnu ou article dépublié : « Cette actualité n'existe pas » et lien vers la liste.

### Ailleurs sur le site public

- **Menu** (`Header.tsx`) : « Actualités » entre « Événements » et « Tuteur du mois ». Le menu ordinateur est déjà serré : vérifier qu'il ne déborde pas de 1280 à 1920 px, en resserrant comme pour « Tuteur du mois » si besoin. Ajouté aussi au menu téléphone.
- **Accueil** : une bande « Les dernières actus » avec les 3 derniers articles et un lien « Toutes les actus ». Absente s'il n'y a aucun article. Placée après la mise en avant du tuteur du mois.
- **Pied de page** : le formulaire « Je m'abonne » est supprimé. À sa place, « Dernières actus » : les 2 derniers titres (lien chacun) et « Toutes les actus ». Sans article : une phrase et le lien Instagram.
- `public/sitemap.xml` : ajouter `/actualites`.

### Espace membre : `/planning/actualites`

Visible dans le menu de l'espace membre seulement pour le Bureau et les membres autorisés ; la page refuse les autres (le serveur fait foi).

- Liste de tous les articles, publiés et dépubliés, du plus récent au plus ancien, avec leur état. Bouton « Nouvel article ».
- Formulaire d'article :
  - **Titre** (120 caractères max).
  - **Texte** (5 000 caractères max), paragraphes séparés par une ligne vide.
  - **Photo de couverture** (obligatoire pour publier) et **jusqu'à 6 autres photos**, ajout, retrait et ordre. Chaque photo est réduite sur l'appareil avant l'envoi : JPEG, 1600 px max sur le plus grand côté, sans recadrage, qualité 0,85.
  - **Projet lié** : liste des projets, facultatif.
  - Boutons « Publier » (ou « Enregistrer » si déjà publié), « Dépublier », « Supprimer » (après confirmation).
- Un article jamais publié peut être enregistré sans être en ligne : c'est l'état « dépublié ».
- **Bureau seulement** : un encadré « Qui peut publier » avec la liste des membres et une case par membre. Le Bureau peut toujours publier, sans case.

## Données et serveur

### Sheet et Drive

- Onglet `Actualites` : `id`, `slug`, `title`, `body`, `coverFileId`, `photoFileIds` (JSON, tableau), `projectId`, `published` (oui/non), `publishedAt` (date de la première publication, jamais modifiée ensuite), `createdBy`, `updatedBy`, `updatedAt`. Colonnes texte en format texte (même précaution que `FichesNommes`, pour que Sheets ne convertisse rien).
- Onglet `Publieurs` : `userId`, `grantedBy`, `grantedAt`.
- Onglet `ReelsInstagram` : `mediaId`, `shortcode`, `permalink`, `caption`, `timestamp`, `coverFileId`, `syncedAt`.
- Photos d'articles et couvertures de réels dans des dossiers Drive privés, retrouvés par identifiant enregistré dans les propriétés du script (comme `NOMINEE_PHOTO_FOLDER_ID`).
- Slug : même règle que les nommés (minuscules, sans accents, tirets). Fixé à la première publication et inchangé ensuite, pour ne pas casser les liens partagés. Doublon : suffixe « -2 », « -3 ».

### Actions du script

| Action | Qui | Effet |
|---|---|---|
| `newsGetAdmin` | Bureau ou publieur (jeton) | Tous les articles, et pour le Bureau la liste des membres avec leur case « peut publier ». |
| `newsSave` | Bureau ou publieur | Crée ou modifie un article (titre, texte, projet, ordre des photos). |
| `newsSetPublished` | Bureau ou publieur | Publie ou dépublie. Refus de publier sans titre, texte ou couverture. |
| `newsUploadPhoto` | Bureau ou publieur | Reçoit un JPEG en base64 (1,5 Mo max, même vérification que les nommés), en couverture ou en photo de la galerie. Une photo par requête. |
| `newsRemovePhoto` | Bureau ou publieur | Retire une photo et la met à la corbeille Drive. |
| `newsDelete` | Bureau ou publieur | Supprime l'article et met ses photos à la corbeille. |
| `newsSetPublisher` | Bureau | Coche ou décoche un membre comme publieur. |
| `getNews` (GET, public) | Tout le monde | Articles publiés (au plus les 60 plus récents) et réels (8 plus récents avec couverture). Seulement les champs affichés : jamais d'identifiant de compte (`createdBy`, `updatedBy`). |
| `getPublicImage` (GET, public) | Tout le monde | Une image, seulement si son identifiant est la photo d'une fiche de nommé, d'un article publié ou la couverture d'un réel enregistré. Remplace `getNomineePhoto`, qui reste comme alias pour l'ancien site en cache. |

Les actions d'écriture prennent le verrou du script comme les fiches. L'info « peut publier » doit être connue de l'espace membre pour afficher ou non l'entrée de menu : au choix du constructeur (champ ajouté à la réponse de connexion ou appel `newsGetAdmin` au chargement), sans toucher au contrôle d'accès existant de `/planning`.

### Relais `api/planning.js`

Pas de nouveau fichier dans `api/` (limite de fonctions Vercel). Deux branches GET :
- `?news=1` : appelle `getNews`, cache `s-maxage=60, stale-while-revalidate=60`.
- `?photo=<id>` existante : appelle désormais `getPublicImage`, même cache d'une heure.

Tout autre paramètre est refusé (400), comme aujourd'hui. Le client garde une seule lecture de `?news=1` par chargement de page, partagée entre la page, l'accueil et le pied de page (comme `usePublicNominees`).

### Réels Instagram

- API Instagram avec connexion Instagram (`graph.instagram.com`). La clé longue durée (60 jours) est enregistrée dans la propriété de script `INSTAGRAM_TOKEN`, jamais dans le code ni le dépôt.
- Une fonction `installerSynchroInstagram()`, lancée une fois à la main dans l'éditeur Apps Script, crée un déclencheur quotidien qui appelle `synchroInstagram()`.
- `synchroInstagram()` :
  - lit les 25 dernières publications (`me/media`, champs `id, media_type, thumbnail_url, permalink, caption, timestamp`) et garde celles de type `VIDEO` (avec cette connexion, `media_product_type` n'est pas fiable ; toute vidéo publiée aujourd'hui est un réel) ;
  - pour chaque nouvelle vidéo, copie l'image de couverture dans Drive (les adresses d'Instagram expirent) et ajoute la ligne ;
  - retire les lignes, et met leur couverture à la corbeille, des vidéos qui ne sont plus dans le fil (supprimées sur Instagram) ;
  - renouvelle la clé (`refresh_access_token`, `grant_type=ig_refresh_token`) si le dernier renouvellement date de plus de 30 jours, et enregistre la date ;
  - en cas d'échec (réseau, clé expirée), ne touche à rien et note l'erreur dans une propriété `INSTAGRAM_LAST_ERROR` ; le site continue d'afficher les réels déjà enregistrés.
- Le `shortcode` vient de `permalink` (`/reel/<code>/` ou `/p/<code>/`).

### Référencement

- `/actualites` ajouté à `scripts/prerender.mjs` (texte de présentation générique, sans contenu d'article) et au sitemap.
- Pas de page statique par article (choix du concepteur) : le site n'est reconstruit qu'à chaque mise en ligne du code, donc un article dépublié ou supprimé, parfois pour une raison sensible, resterait lisible dans le HTML statique jusqu'à la suivante. Les articles sont toujours chargés par le navigateur, et disparaissent du site en une minute environ quand on les dépublie.

## Erreurs et cas limites

- Script pas encore redéployé ou `getNews` en échec : page Actualités en état « arrivent bientôt », bande d'accueil et bloc pied de page absents ou réduits au lien Instagram ; aucune erreur visible.
- Photo trop lourde ou qui n'est pas un JPEG : message clair, l'article n'est pas modifié.
- Photo supprimée à la main dans Drive : ignorée à l'affichage ; un article publié dont la couverture a disparu n'apparaît plus sur le site public tant qu'on n'en remet pas une.
- Publieur décoché pendant qu'il a la page ouverte : ses actions suivantes sont refusées avec un message.
- Deux personnes modifient le même article : la dernière enregistrée l'emporte (pas de fusion).
- Texte et titres affichés tels quels, jamais interprétés comme HTML ; seuls les liens `http(s)` deviennent cliquables.

## Tests

- Script (harnais `scripts/lib/apps-script-harness.mjs`, en ajoutant un faux `UrlFetchApp`) : droits (tuteur refusé, publieur accepté, Bureau seul pour `newsSetPublisher`), limites de taille, refus de publier sans couverture, slug fixé à la première publication et doublons, `getNews` ne renvoie ni dépubliés ni identifiants de compte, `getPublicImage` refuse un fichier hors fiches, articles et réels, suppression qui met les photos à la corbeille, synchro Instagram (garde les vidéos, copie la couverture, retire les vidéos disparues, renouvelle la clé après 30 jours, ne touche à rien en cas d'erreur).
- Client : validation de la réponse `?news=1`, découpage du texte en paragraphes et liens, réduction des photos (calcul des dimensions), extraction du `shortcode`.
- Vérification visuelle sur une démo locale (comme `demo-vrais.mjs`) : liste, article, bande de réels et fenêtre du lecteur, accueil, pied de page, menu de 1280 à 1920 px, téléphone, formulaire de l'espace membre.

## Mise en ligne

1. Coller le script et le redéployer en « Nouvelle version » (Gérer les déploiements, crayon ; ne pas créer de nouveau déploiement).
2. Instagram, une fois : créer une application Meta avec le produit Instagram, y ajouter le compte @phoenixedc, générer la clé, la coller dans les propriétés du script sous `INSTAGRAM_TOKEN`, puis lancer `installerSynchroInstagram()` et `synchroInstagram()` une première fois depuis l'éditeur. Le guide pas à pas sera donné à l'utilisateur avec la livraison.
3. Pousser le site.
4. Le Bureau coche les membres du pôle com qui publient.

## Laissé au constructeur

- Comment l'espace membre apprend que l'utilisateur peut publier (voir plus haut).
- La présentation exacte des cartes, de la bande de réels et de la galerie, dans le style fanzine existant.
- La place exacte de « Actualités » dans le menu de l'espace membre.
