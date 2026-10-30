# Heures manuelles serveur, date de goûter, export, sauvegarde : conception

Date : 2026-10-30

## Objectif

Quatre chantiers liés par le même script Apps Script :

1. **Heures manuelles et membres renouvelants enregistrés pour de bon.** Constat vérifié le 2026-10-30 : le site envoie ces données à `/api/planning/manual-hours` et `/api/planning/exemptions`, qui n'existent pas (ces adresses renvoient la page d'accueil du site). Les données n'existent que dans le `localStorage` du navigateur de la personne qui les saisit : les autres membres ne les voient pas, les attestations ne les comptent pas.
2. **Les chefs de projet peuvent attribuer des heures aux membres de leur projet.**
3. **Modifier la date d'un goûter** et **exporter un goûter** dans un classeur Excel qui ressemble à l'exemple fourni (« Goûter Foyer 28-10.xlsx »).
4. **Sauvegarde hebdomadaire automatique** du Google Sheet.

## Règles validées

### Heures manuelles

- **Stockage :** onglet `HeuresManuelles` (créé automatiquement), colonnes `id`, `userId`, `userName`, `hours`, `reason`, `grantedBy`, `grantedById`, `projectId`, `createdAt`. `projectId` vide = « Mission Générale / Bureau ». Les colonnes de texte sont créées au format texte. `id` commence par une lettre (`h` + 7 caractères hexadécimaux).
- **Bureau :** comme aujourd'hui. Il attribue à n'importe quel membre de la liste ou à un nom hors liste (`userId` de la forme `custom-...`), pour n'importe quel projet ou la mission générale, et supprime n'importe quelle attribution.
- **Chef de projet :** attribue uniquement pour un projet de la colonne J « Projets enfants » du Sheet (remplie par le Bureau ; la colonne F ne donne aucun droit car chaque membre peut la modifier), uniquement à un membre de la liste qui a au moins une réservation (statut différent de `annule`) sur un créneau de ce projet, relevée dans l'onglet `Bookings` (le numéro du projet est dans le `slotId`, `slot-<projet>-<jour>`). Pas de mission générale, pas de nom hors liste. Il supprime uniquement les attributions dont il est l'auteur (`grantedById`) sur un de ses projets.
- **Tuteur :** aucune écriture.
- **Lecture :** chaque membre reçoit ses propres attributions ; un chef de projet reçoit en plus celles dont le `projectId` est un de ses projets ; le Bureau reçoit tout.
- **Contrôles serveur :** jeton de session valide avant toute lecture ou écriture (`unauthenticated` sinon) ; rôle et projets lus dans la feuille des utilisateurs, jamais dans la requête ; `hours` nombre fini, de 0,5 à 50, par pas de 0,5 ; justification de 8 à 300 caractères après nettoyage (`cleanFreeText`) ; nom hors liste nettoyé et limité à 60 caractères ; `projectId` entre 1 et 9 ; membre inexistant refusé.
- **Reprise de l'existant :** action `importManualHours` réservée au Bureau, qui reçoit la liste enregistrée dans le navigateur, ignore les `id` déjà présents et les entrées invalides, et renvoie le nombre importé et le nombre ignoré. Bouton « Envoyer les heures enregistrées sur cet ordinateur » dans le Récap, visible seulement du Bureau et seulement s'il reste des entrées locales.

### Membres renouvelants (exemptions de quota)

- **Stockage :** onglet `ExemptionsQuota`, colonnes `userId`, `userName`, `grantedBy`, `grantedAt`, `year`, `note`.
- **Écriture :** Bureau seulement (ajout, retrait, import de l'existant sur le même modèle que les heures).
- **Lecture :** le Bureau et les chefs de projet reçoivent la liste complète (le Récap en a besoin) ; un tuteur reçoit seulement sa propre entrée.

### Date de goûter

- Action `moveGouter` (`gouterId`, `date`). Gestionnaire du projet du goûter seulement (Bureau, ou chef de projet dont la colonne J contient le projet).
- Refusée si le goûter est passé ou annulé, si la date n'est pas valide, passée ou après la fin de l'année scolaire, ou déjà prise par un autre goûter actif du même projet. Aucun changement si la date est la même.
- Les inscriptions aux créneaux et les apports restent attachés au goûter.
- Dans l'interface : un bouton « Changer la date » sur le goûter sélectionné, pour les gestionnaires, goûter à venir seulement.

### Export d'un goûter

- Un bouton « Exporter en Excel » sur le goûter sélectionné, pour les gestionnaires (y compris pour un goûter passé).
- Fichier `.xlsx` généré dans le navigateur, sans envoi de données à un tiers. La bibliothèque est chargée au clic, pas sur les autres pages.
- Mise en page, d'après l'exemple : une feuille. À gauche, titre « Goûter <projet> du JJ/MM » fusionné sur les colonnes du tableau, puis `Créneaux`, `Personne 1`, `Personne 2`, ... (au moins deux colonnes, davantage si un créneau a plus de deux inscrits), une ligne par créneau libellé `9h - 10h` à `18h - 19h` (dix lignes, créneaux vides compris), les noms tels qu'enregistrés dans le Sheet. Une colonne vide, puis à droite le titre fusionné « Collations et autres », les colonnes `Prénom` et `Ce que j'apporte`, une ligne par apport dans l'ordre d'ajout. Entêtes en gras, bordures, largeurs de colonne adaptées.
- Nom du fichier : `Gouter <projet> JJ-MM.xlsx`.
- Un nom ou un apport qui commence par `=`, `+`, `-` ou `@` est écrit comme du texte, jamais comme une formule (déjà nettoyé à la saisie, et l'export écrit les cellules en type texte).

### Sauvegarde

- `sauvegarderLeSheet()` copie le Sheet dans le dossier Drive « Sauvegardes Phoenix » (créé si besoin), copie nommée `Sauvegarde Phoenix AAAA-MM-JJ`, puis ne garde que les 8 copies les plus récentes de ce dossier (les plus anciennes sont mises à la corbeille). Elle ne touche à aucun fichier hors de ce dossier.
- `installerSauvegardeHebdo()` crée le déclencheur hebdomadaire (lundi, entre 3 h et 4 h), après avoir supprimé un éventuel déclencheur existant pour la même fonction (on peut la lancer plusieurs fois sans doublon). À lancer une fois à la main : Google demande alors l'autorisation d'accéder à Drive.

## Hors périmètre (YAGNI)

- Pas d'export des présences des enfants ni de tous les goûters à la fois (l'exemple fourni est un goûter).
- Pas de modification d'une attribution d'heures (supprimer puis recréer), pas d'historique des modifications.
- Pas de restauration automatique de la sauvegarde (on ouvre la copie dans Drive).
- Les anciennes actions sans authentification (`updateUserProject`, `syncBooking`, `saveSiteContent`, lecture publique de la liste des utilisateurs) et les adresses `/api/documents` et `/api/team/members` ne sont pas touchées.
- Le formulaire d'abonnement du pied de page n'est pas touché.

## Architecture

Même schéma que le vote, la présence des enfants et les goûters : script Google Apps Script ([google-apps-script.js](../../../google-apps-script.js)), appelé en `POST` par le relais Vercel [api/planning.js](../../../api/planning.js) qui transmet tout (aucun fichier Vercel ajouté).

Un nouveau gestionnaire `handleHoursAction` dans `doPost`, après les goûters, pour les actions `getManualHours`, `addManualHours`, `deleteManualHours`, `importManualHours`, `getExemptions`, `setExemption`, `importExemptions`. Il vérifie le jeton avant toute lecture ou écriture, prend le verrou de script pour les écritures, et répond en `{ success: false, code, message }` avec les codes `unauthenticated`, `forbidden`, `invalid`, `error`. `moveGouter` s'ajoute à `handleGoutersAction`.

### Front

- `src/data/planningData.ts` : fonctions réseau (`fetchManualHours`, `addManualHoursApi`, `deleteManualHoursApi`, `importManualHoursApi`, `fetchExemptions`, `setExemptionApi`, `importExemptionsApi`, `moveGouterApi`), sur le modèle des fonctions des goûters.
- `src/data/hoursResponse.ts` : validation des réponses du script.
- `PlanningContext.tsx` : `manualHours` et `exemptions` viennent du serveur (avec le jeton de la session) ; `addManualHours`, `deleteManualHours`, `toggleQuotaExemption` appellent le serveur et relisent la liste ; le `localStorage` ne sert plus de source de vérité (il n'est lu que pour proposer l'import). Les signatures restent compatibles avec les pages existantes (`AttestationModal`, `PlanningCompte`, `PlanningRecap`) ; l'ajout et la suppression renvoient `false` quand le serveur refuse.
- `PlanningRecap.tsx` : le formulaire d'attribution est ouvert aux chefs de projet ; pour eux la liste des membres est limitée aux membres de leur projet, le projet est fixé et le choix « mission générale » et « hors liste » est masqué. Les boutons de suppression suivent la règle de suppression ci-dessus.
- Goûters : « Changer la date » dans `PlanningGouters.tsx` ; « Exporter en Excel » avec `src/utils/exportGouter.ts`.

## Gestion des erreurs

- Après chaque action, le front relit les données (pas d'état local incohérent). Si le serveur refuse, un message clair s'affiche et rien n'est enregistré côté écran.
- Session expirée : « Se reconnecter », comme les autres pages.
- Avant le redéploiement du script, la lecture des heures échoue : les pages restent utilisables et affichent zéro heure manuelle avec un message discret, sans rien afficher d'erroné.

## Tests et vérification

- Logique du script avec le faux Google Sheet en Node : droits (jeton invalide, tuteur refusé, chef de projet limité à ses projets, hors liste et mission générale refusés au chef de projet, membre sans réservation sur le projet refusé, réservation annulée refusée, Bureau partout), contrôles de valeurs (heures, justification, formule neutralisée), lecture filtrée par rôle, suppression par l'auteur, import sans doublon, exemptions, `moveGouter` (gestionnaire, date passée, doublon, goûter passé ou annulé, inscriptions conservées), sauvegarde (copie datée, conservation de 8 copies, aucun autre fichier touché, déclencheur sans doublon).
- Validation des réponses côté client sur le modèle des tests précédents ; test de la mise en page de l'export (cellules, fusions, nombre de colonnes `Personne`). Ces tests rejoignent `npm run test:vote`.
- Vérification de l'interface dans le navigateur avec le faux serveur de démonstration (Bureau, chef de projet, tuteur), `tsc` et lint avant tout commit.

## Mise en ligne

1. L'utilisateur recopie `google-apps-script.js` dans l'éditeur Apps Script et redéploie (Nouvelle version).
2. Il lance `installerSauvegardeHebdo` une fois (autorisation Drive).
3. Seulement ensuite, après confirmation de l'utilisateur, le `push` du front : le site appelle les nouvelles actions, qui doivent exister.
4. Le Bureau ouvre le Récap sur l'ordinateur où il avait saisi des heures et des renouvelants, et clique sur les boutons d'envoi. Il ne vide pas le stockage de ce navigateur avant.
