# Séances exceptionnelles : ajouter ou annuler une séance à une date

Date : 2026-11-09. Statut : design validé en conversation, spec à relire avant le plan.

## Objectif

Aujourd'hui les séances sont des règles fixes par projet (`timeSlots` dans `src/data/planningData.ts`, par exemple
« Jules Ferry, mercredi 14h00-16h30, une semaine sur deux »). La réalité change : une séance a lieu à une date
imprévue, ou une séance prévue n'a pas lieu, ou ses horaires changent un jour donné.

Un chef de projet doit pouvoir, pour ses projets, **annuler la séance d'une date** et **en ajouter une à la date et aux
horaires de son choix**. Le Bureau le fait pour tous les projets. Les règles fixes restent le comportement par défaut.

Cas de départ : Jules Ferry doit avoir une séance le 25 novembre 2026 de 14h à 16h (hors alternance), et le 2
décembre 2026 de 14h à 16h au lieu de 14h à 16h30.

## Modèle de données

Nouvelle feuille **« Seances »**, créée automatiquement, une ligne par exception. Colonnes :
`id, kind, projectId, date, startTime, endTime, slotId, createdBy, createdAt`.

- `kind = 'ajout'` : séance supplémentaire. `id` généré (`s` + 7 caractères, comme `newRowId('s')`), `date` au format
  `yyyy-MM-dd`, `startTime` et `endTime` au format `HH:MM`, `slotId = slot-<projet>-<jour>-<id>` (par exemple
  `slot-7-mer-s1a2b3c`, jour parmi lun, mar, mer, jeu, ven, sam).
- `kind = 'annulation'` : séance régulière masquée pour une date. `slotId` = le créneau régulier visé (`slot-7-mer`),
  `date` = le jour concerné, horaires vides.
- Les colonnes `date`, `startTime`, `endTime` sont en format texte (`@`) pour que Sheets ne les convertisse pas.
- Rétablir une séance annulée = supprimer sa ligne `annulation`. Annuler une séance ajoutée = supprimer sa ligne `ajout`.

Une séance ajoutée est un créneau comme les autres pour la semaine ISO de sa date. Réservations (`Bookings`), présences,
heures et appel des enfants fonctionnent sans changement de structure, car ils se rattachent au couple
`(slotId, weekKey)`. La durée d'une séance ajoutée vient de ses propres horaires.

## Règles

1. **Ajouter.** Projet (chef de projet : ceux de la colonne J du Sheet ; Bureau : tous), date, début, fin.
   Refusé si : jour = dimanche, date hors de l'année scolaire en cours (1er septembre au 31 août), horaires hors
   07:00-22:00, pas de pas de 5 minutes, fin <= début, séance identique (même projet, date, horaires) déjà ajoutée.
   Les dates passées sont permises (régularisation des heures). L'ajout ne modifie jamais une séance existante : si le
   projet a déjà une séance ce jour-là, le formulaire prévient, et l'utilisateur annule l'ancienne lui-même.
2. **Annuler.** Séance régulière : ajoute une ligne `annulation`. Séance ajoutée : supprime la ligne `ajout`. Dans les
   deux cas, les réservations `prevu` de ce `(slotId, weekKey)` passent à `annule` (jamais supprimées). **Si une
   réservation est `confirme` ou `absent`, l'annulation est refusée** avec un message : il faut d'abord remettre ces
   présences en attente.
3. **Rétablir.** Supprime la ligne `annulation`. Les réservations passées à `annule` ne reviennent pas.
4. **Droits.** Jeton de session vérifié (`verifySessionToken`), rôle et projets lus dans le Sheet, jamais dans la
   requête, comme `addMemberBookings`. `bureau` : tous les projets. `chef_projet` : `canManageProject`. `tuteur` :
   refusé.

## Serveur (`google-apps-script.js`)

- `parseSlotId` accepte un suffixe optionnel `-s<alphanumérique>` ; `projectId` et `dayIndex` restent lus comme avant, donc
  `sessionDateKey`, les heures, l'appel des enfants et `memberBookingsAdd` marchent pour les séances ajoutées.
- `getPlanningDataInternal` renvoie en plus `sessionChanges: [{ id, kind, projectId, date, startTime, endTime, slotId }]`.
- Trois actions POST : `addSession`, `cancelSession`, `restoreSession`, routées comme `MEMBER_BOOKING_ACTIONS`, sous
  `LockService`. Réponses d'erreur par `voteFail(code, message)` (codes `unauthenticated`, `forbidden`, `invalid`,
  `conflict`).
- `addSession` : `{ requesterId, token, projectId, date, startTime, endTime }`.
  `cancelSession` et `restoreSession` : `{ requesterId, token, slotId, weekKey }`.
- Les actions historiques sans authentification (`syncBooking`, etc.) ne sont pas modifiées.

## Front

- `src/data/sessionCalendar.ts` (module pur, testable sans réseau) :
  - type `SessionChange` ;
  - `slotsForWeek(regularSlots, changes, weekKey): TimeSlot[]` : séances régulières actives cette semaine (alternance
    de `isSlotActiveThisWeek` incluse) moins les annulées, plus les ajoutées de cette semaine ;
  - `cancelledForWeek(regularSlots, changes, weekKey)` : séances régulières annulées cette semaine ;
  - `findSlot(regularSlots, changes, slotId)` : retrouve un créneau régulier ou ajouté (pour durées, libellés) ;
  - utilitaires `weekKeyOfDate(date)` et `dayOfDate(date)`.
- `PlanningContext` expose `sessionChanges`, `slotsForWeek(weekKey)`, `slotById(id)`, `addSession`, `cancelSession`,
  `restoreSession`, et rafraîchit les données après chaque écriture.
- Les écrans qui listent des créneaux (Disponibilités, Horaire, Valider, Présence enfants, Placement des membres,
  Notifications) utilisent `slotsForWeek`. Ceux qui calculent des heures (Compte, Récap, Attestation) utilisent
  `slotById`.
- Nouvel onglet **« Séances »** sur « Valider les présences », à côté de « Placer des membres » : liste des séances de
  la semaine affichée pour les projets de l'utilisateur (étiquette Régulière ou Ajoutée, nombre d'inscrits, bouton
  « Annuler »), bloc « Séances annulées » avec « Rétablir », et bouton « Ajouter une séance » (projet, date,
  début, fin, avertissement si une séance existe déjà ce jour). Navigation et adresses inchangées.

## Tests

- Unitaires sur `sessionCalendar.ts` : annulation, ajout, rétablissement, séance ajoutée dans une semaine sans règle,
  alternance Jules Ferry combinée aux exceptions, passage d'année (2026-W53, 2027-W01), dimanche.
- Serveur, avec le même harnais que `scripts/test-member-bookings.mjs` : droits (tuteur refusé, chef de projet hors de
  son projet refusé, Bureau accepté), validations de l'ajout, annulation refusée avec présence validée, annulation qui
  passe les `prevu` à `annule`, rétablissement, identifiant de séance ajoutée accepté par `parseSlotId`.
- Vérification à l'écran en Bureau et en chef de projet, sur ordinateur et sur mobile.

## Mise en ligne

Coller le nouveau `google-apps-script.js` dans Apps Script, puis « Nouvelle version » pour redéployer. La feuille se crée
toute seule. Le front lit `sessionChanges ?? []`, donc l'ordre de mise en ligne n'a pas d'importance.

## Hors périmètre

Modifier les horaires d'une séance en place (on annule puis on ajoute), prévenir les tuteurs par mail, changer la
règle d'alternance de Jules Ferry, notes ou commentaires sur une séance.
