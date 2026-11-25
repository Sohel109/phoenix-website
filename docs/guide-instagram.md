# Brancher les réels Instagram sur le site

À faire une seule fois, après avoir collé et redéployé le script. Il faut environ 15 minutes et l'accès au compte Instagram @phoenixedc (compte professionnel).

Les intitulés de Meta changent de temps en temps : si un bouton n'a pas exactement le même nom, cherchez le plus proche.

## 1. Créer l'application Meta

1. Aller sur [developers.facebook.com](https://developers.facebook.com/), se connecter, puis **Mes apps** et **Créer une app**.
2. Comme cas d'usage, choisir celui qui parle d'Instagram : **Gérer les messages et le contenu sur Instagram** (API Instagram avec connexion Instagram).
3. Donner un nom à l'app, par exemple « Site Phoenix ».

L'application peut rester en mode développement : elle ne sert qu'à lire le compte de l'association.

## 2. Générer la clé du compte @phoenixedc

1. Dans l'app, ouvrir **Instagram** puis **Configuration de l'API avec connexion Instagram**.
2. Dans la partie **Générer des tokens d'accès**, cliquer sur **Ajouter un compte** et se connecter avec @phoenixedc.
3. Si Meta indique que le compte doit être testeur :
   - ouvrir **Rôles de l'app**, puis **Rôles** ;
   - ajouter @phoenixedc comme **Testeur Instagram** ;
   - dans l'application Instagram, accepter l'invitation (Paramètres, **Apps et sites web**, **Invitations de testeur**) ;
   - revenir à l'étape 2.
4. Cliquer sur **Générer un token** à côté du compte et copier la longue clé affichée. Ne la partagez avec personne : elle donne accès au compte.

## 3. Donner la clé au script

1. Ouvrir le projet Apps Script du site.
2. Roue dentée à gauche (**Paramètres du projet**), tout en bas **Propriétés du script**, **Ajouter une propriété du script**.
3. Propriété : `INSTAGRAM_TOKEN`. Valeur : la clé copiée. **Enregistrer**.

## 4. Lancer la synchronisation

1. Revenir dans l'éditeur (icône `< >`).
2. Dans la liste déroulante en haut, choisir `installerSynchroInstagram`, puis **Exécuter**. Google demande une nouvelle autorisation (« se connecter à un service externe ») : l'accepter. Cela crée la récupération automatique tous les matins vers 6 h.
3. Choisir ensuite `synchroInstagram`, puis **Exécuter**, pour récupérer les réels tout de suite.
4. Vérifier dans le Sheet : un onglet **ReelsInstagram** est apparu avec une ligne par réel.
5. Les réels apparaissent sur la page Actualités du site environ une minute plus tard.

## En cas de souci

- **Aucun réel sur le site** : dans **Propriétés du script**, regarder `INSTAGRAM_LAST_ERROR`. Vide, tout va bien ; sinon le message dit ce qui bloque (clé absente, clé expirée, Instagram indisponible).
- **Clé expirée** (le message parle de « access token ») : refaire l'étape 2 et remplacer la valeur de `INSTAGRAM_TOKEN`. Le script renouvelle la clé tout seul tous les 30 jours ; elle n'expire que si la synchronisation s'arrête pendant deux mois.
- **Arrêter l'affichage des réels** : supprimer la propriété `INSTAGRAM_TOKEN`. Les réels déjà enregistrés restent affichés ; pour les retirer, vider l'onglet ReelsInstagram (sauf la première ligne).
