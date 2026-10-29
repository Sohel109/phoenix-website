import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'b1', name: 'Bureau', role: 'bureau', login: 'b1', password: 'x' },
    { id: 'c4', name: 'Chef Quatre', role: 'chef_projet', login: 'c4', password: 'x', childProjects: '4' },
    { id: 'c7', name: 'Chef Sept', role: 'chef_projet', login: 'c7', password: 'x', childProjects: '7' },
    { id: 't1', name: 'Tuteur Un', role: 'tuteur', login: 't1', password: 'x' },
    { id: 't2', name: 'Tuteur Deux', role: 'tuteur', login: 't2', password: 'x' },
];
const TODAY = '2026-10-29';
const fresh = (opts = {}) => loadScript({ users: USERS, now: TODAY, ...opts });
const plain = (x) => JSON.parse(JSON.stringify(x));

const list = (h, requesterId) => plain(h.call('getGouters', { requesterId }));
const addG = (h, requesterId, projectId, dates, note) => plain(h.call('addGouters', { requesterId, projectId, dates, note }));
const cancel = (h, requesterId, gouterId) => plain(h.call('cancelGouter', { requesterId, gouterId }));
/** Crée un goûter du projet 4 le 2026-11-14 et renvoie son identifiant. */
const withGouter = (h, projectId = 4, date = '2026-11-14') => {
    addG(h, projectId === 7 ? 'c7' : 'c4', projectId, [date]);
    return list(h, 'b1').gouters.find((g) => g.projectId === projectId && g.date === date).id;
};

// ─── Accès ────────────────────────────────────────────────────────────────────

test('sans jeton valide : unauthenticated sur les six actions', () => {
    const h = fresh();
    const other = h.ctx.createSessionToken('t2');
    for (const action of ['getGouters', 'addGouters', 'cancelGouter', 'setGouterSlot', 'addGouterItem', 'removeGouterItem']) {
        assert.equal(plain(h.raw(action, { requesterId: 't1' })).code, 'unauthenticated', action);
        assert.equal(plain(h.raw(action, { requesterId: 't1', token: other })).code, 'unauthenticated', action);
    }
});

test('un membre simple lit la liste mais ne peut ni ajouter ni annuler', () => {
    const h = fresh();
    const id = withGouter(h);
    const out = list(h, 't1');
    assert.equal(out.success, true);
    assert.deepEqual(out.manageableProjects, []);
    assert.equal(out.gouters.length, 1);
    assert.equal(out.gouters[0].canManage, false);
    assert.equal(addG(h, 't1', 4, ['2026-12-05']).code, 'forbidden');
    assert.equal(cancel(h, 't1', id).code, 'forbidden');
    assert.equal(h.sheet('Gouters').length, 2);
    assert.equal(list(h, 't1').gouters.length, 1);
});

test('un compte inconnu est refusé', () => {
    const h = fresh();
    const out = plain(h.call('getGouters', { requesterId: 'ghost' }));
    assert.equal(out.code, 'forbidden');
});

test('gestionnaires : le CDP gère ses projets, le Bureau tous', () => {
    const h = fresh();
    assert.equal(addG(h, 'c4', 4, ['2026-11-14']).added, 1);
    assert.equal(addG(h, 'c4', 7, ['2026-11-14']).code, 'forbidden');
    assert.equal(addG(h, 'b1', 9, ['2026-11-14']).added, 1);
    assert.deepEqual(list(h, 'c4').manageableProjects, [4]);
    assert.deepEqual(list(h, 'b1').manageableProjects, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.equal(list(h, 'b1').isBureau, true);
    const four = list(h, 'c4').gouters.find((g) => g.projectId === 4);
    assert.equal(four.canManage, true);
    assert.equal(list(h, 'c7').gouters.find((g) => g.projectId === 4).canManage, false);
    assert.equal(list(h, 'c4').gouters.find((g) => g.projectId === 9).canManage, false);
});

// ─── Dates ────────────────────────────────────────────────────────────────────

test('ajout de dates : futures et du jour seulement, doublons et dates invalides ignorés', () => {
    const h = fresh();
    const out = addG(h, 'c4', 4, ['2026-11-14', '2026-11-21', '2026-11-14', '2026-02-30', 'nope', '2026-10-01', '2026-10-29']);
    assert.equal(out.success, true);
    assert.equal(out.added, 3);
    assert.deepEqual(list(h, 'c4').gouters.map((g) => g.date), ['2026-10-29', '2026-11-14', '2026-11-21']);
});

test('aucune date valide ou projet inconnu : invalid', () => {
    const h = fresh();
    assert.equal(addG(h, 'c4', 4, ['2026-10-01', 'nope']).code, 'invalid');
    assert.equal(addG(h, 'c4', 4, []).code, 'invalid');
    assert.equal(addG(h, 'b1', 12, ['2026-11-14']).code, 'invalid');
    assert.equal(h.sheet('Gouters').length, 1);
});

test('un goûter par projet et par jour', () => {
    const h = fresh();
    addG(h, 'c4', 4, ['2026-11-14']);
    assert.equal(addG(h, 'c4', 4, ['2026-11-14']).added, 0);
    assert.equal(addG(h, 'b1', 7, ['2026-11-14']).added, 1);
});

test('la liste est triée par date puis projet, avec 10 créneaux vides de 9h à 18h', () => {
    const h = fresh();
    addG(h, 'c4', 4, ['2026-11-21', '2026-11-14']);
    addG(h, 'c7', 7, ['2026-11-14']);
    const out = list(h, 't1');
    assert.deepEqual(out.gouters.map((g) => `${g.date}#${g.projectId}`), ['2026-11-14#4', '2026-11-14#7', '2026-11-21#4']);
    for (const g of out.gouters) {
        assert.deepEqual(g.slots.map((s) => s.hour), [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
        assert.ok(g.slots.every((s) => s.users.length === 0));
        assert.deepEqual(g.items, []);
    }
});

test('isPast : faux aujourd\'hui, vrai après ; l\'année scolaire suivante n\'apparaît pas', () => {
    const h = fresh();
    addG(h, 'c4', 4, ['2026-10-29', '2026-11-14', '2027-09-05']);
    const before = list(h, 't1').gouters;
    assert.deepEqual(before.map((g) => [g.date, g.isPast]), [['2026-10-29', false], ['2026-11-14', false]]);
    h.setNow('2026-11-20');
    assert.deepEqual(list(h, 't1').gouters.map((g) => [g.date, g.isPast]), [['2026-10-29', true], ['2026-11-14', true]]);
});

test('note : caractères de formule retirés et coupée à 80 caractères', () => {
    const h = fresh();
    addG(h, 'c4', 4, ['2026-11-14'], '=SUM(1) Cour A');
    addG(h, 'c4', 4, ['2026-11-21'], 'x'.repeat(120));
    const [a, b] = list(h, 't1').gouters;
    assert.equal(a.note, 'SUM(1) Cour A');
    assert.equal(b.note.length, 80);
    assert.equal(addG(h, 'c4', 4, ['2026-11-28']).success, true);
    assert.equal(list(h, 't1').gouters.at(-1).note, '');
});

// ─── Annulation ───────────────────────────────────────────────────────────────

test('annulation : le goûter disparaît de la liste, sa ligne reste inactive', () => {
    const h = fresh();
    const id = withGouter(h);
    assert.equal(cancel(h, 'c7', id).code, 'forbidden');
    assert.equal(cancel(h, 't1', id).code, 'forbidden');
    assert.equal(cancel(h, 'c4', id).success, true);
    assert.equal(list(h, 't1').gouters.length, 0);
    const rows = h.sheet('Gouters');
    assert.equal(rows.length, 2);
    assert.equal(rows[1][4], false);
    assert.equal(cancel(h, 'c4', id).code, 'invalid');
    assert.equal(cancel(h, 'c4', 'nope').code, 'invalid');
    // la date annulée peut être reprise
    assert.equal(addG(h, 'c4', 4, ['2026-11-14']).added, 1);
});

// ─── Format des données dans le Sheet ─────────────────────────────────────────

test('les colonnes sensibles sont créées au format texte et les identifiants commencent par une lettre', () => {
    const h = fresh();
    const id = withGouter(h);
    assert.match(id, /^g[0-9a-f]{7}$/);
    const text = h.formats('Gouters').filter(([, f]) => f === '@').map(([range]) => range);
    for (const column of ['A:A', 'C:C', 'D:D']) assert.ok(text.includes(column), JSON.stringify(text));
});

test('une date relue par Sheets comme un objet Date reste correcte', () => {
    const h = fresh();
    withGouter(h);
    const rows = h.sheet('Gouters');
    // Simule la conversion : la cellule de date devient un objet Date à minuit heure de Paris.
    h.setSheetCell('Gouters', 2, 3, new Date('2026-11-13T23:00:00Z'));
    assert.equal(list(h, 't1').gouters[0].date, '2026-11-14');
    assert.equal(rows.length, 2);
});

// ─── Inscriptions aux créneaux ────────────────────────────────────────────────

const slot = (h, requesterId, gouterId, hour, joined, userId) =>
    plain(h.call('setGouterSlot', { requesterId, gouterId, hour, joined, userId }));
const usersAt = (h, gouterId, hour, viewer = 'b1') =>
    list(h, viewer).gouters.find((g) => g.id === gouterId).slots.find((s) => s.hour === hour).users.map((u) => u.userId);
const slotRows = (h) => (h.sheet('GouterCreneaux') ?? []).slice(1);

test('inscription et désinscription à un créneau', () => {
    const h = fresh();
    const id = withGouter(h);
    assert.equal(slot(h, 't1', id, 10, true).success, true);
    assert.deepEqual(usersAt(h, id, 10), ['t1']);
    const names = list(h, 't2').gouters[0].slots.find((s) => s.hour === 10).users;
    assert.deepEqual(names, [{ userId: 't1', name: 'Tuteur Un' }]);
    assert.equal(slot(h, 't1', id, 10, false).success, true);
    assert.deepEqual(usersAt(h, id, 10), []);
});

test('plusieurs personnes sur le même créneau, plusieurs créneaux pour une personne', () => {
    const h = fresh();
    const id = withGouter(h);
    slot(h, 't1', id, 10, true);
    slot(h, 't2', id, 10, true);
    slot(h, 't1', id, 11, true);
    assert.deepEqual(usersAt(h, id, 10), ['t1', 't2']);
    assert.deepEqual(usersAt(h, id, 11), ['t1']);
    assert.deepEqual(usersAt(h, id, 12), []);
});

test('jamais deux lignes pour la même personne, créneau et goûter', () => {
    const h = fresh();
    const id = withGouter(h);
    slot(h, 't1', id, 10, true);
    slot(h, 't1', id, 10, true);
    assert.equal(slotRows(h).length, 1);
    assert.equal(slot(h, 't2', id, 10, false).success, true);
    assert.equal(slotRows(h).length, 1);
});

test('une heure hors de 9 à 18 est refusée, une heure donnée en texte est acceptée', () => {
    const h = fresh();
    const id = withGouter(h);
    for (const hour of [8, 19, 'x', undefined, null, 10.5]) {
        assert.equal(slot(h, 't1', id, hour, true).code, 'invalid', String(hour));
    }
    assert.equal(slotRows(h).length, 0);
    assert.equal(slot(h, 't1', id, '10', true).success, true);
    assert.deepEqual(usersAt(h, id, 10), ['t1']);
    assert.equal(slot(h, 't1', id, 10, 'oui').code, 'invalid');
});

test('un goûter passé, annulé ou inconnu refuse inscriptions et apports', () => {
    const h = fresh();
    const id = withGouter(h);
    const other = withGouter(h, 4, '2026-11-28');
    cancel(h, 'c4', other);
    assert.equal(slot(h, 't1', other, 10, true).code, 'invalid');
    assert.equal(slot(h, 't1', 'nope', 10, true).code, 'invalid');
    assert.equal(plain(h.call('addGouterItem', { requesterId: 't1', gouterId: other, item: 'Cake' })).code, 'invalid');
    slot(h, 't1', id, 10, true);
    h.call('addGouterItem', { requesterId: 't1', gouterId: id, item: 'Cake' });
    h.setNow('2026-11-15');
    assert.equal(slot(h, 't1', id, 11, true).code, 'invalid');
    assert.equal(slot(h, 't1', id, 10, false).code, 'invalid');
    assert.equal(plain(h.call('addGouterItem', { requesterId: 't1', gouterId: id, item: 'Jus' })).code, 'invalid');
    const itemId = list(h, 't1').gouters[0].items[0].id;
    assert.equal(plain(h.call('removeGouterItem', { requesterId: 't1', itemId })).code, 'invalid');
    assert.deepEqual(usersAt(h, id, 10), ['t1']);
});

test('un membre ne désinscrit pas un autre ; un gestionnaire du projet le peut ; personne n\'inscrit un autre', () => {
    const h = fresh();
    const id = withGouter(h);
    slot(h, 't1', id, 10, true);
    assert.equal(slot(h, 't2', id, 10, false, 't1').code, 'forbidden');
    assert.equal(slot(h, 'c7', id, 10, false, 't1').code, 'forbidden');
    assert.deepEqual(usersAt(h, id, 10), ['t1']);
    assert.equal(slot(h, 'c4', id, 10, true, 't2').code, 'forbidden');
    assert.equal(slot(h, 'c4', id, 10, false, 't1').success, true);
    assert.deepEqual(usersAt(h, id, 10), []);
    slot(h, 't1', id, 11, true);
    assert.equal(slot(h, 'b1', id, 11, false, 't1').success, true);
});

test('un compte supprimé s\'affiche « Ancien membre »', () => {
    const h = fresh();
    const id = withGouter(h);
    slot(h, 't1', id, 10, true);
    h.setSheetCell('GouterCreneaux', 2, 3, 'disparu');
    assert.deepEqual(list(h, 't2').gouters[0].slots.find((s) => s.hour === 10).users, [{ userId: 'disparu', name: 'Ancien membre' }]);
});

// ─── Apports ──────────────────────────────────────────────────────────────────

const addItem = (h, requesterId, gouterId, item) => plain(h.call('addGouterItem', { requesterId, gouterId, item }));
const removeItem = (h, requesterId, itemId) => plain(h.call('removeGouterItem', { requesterId, itemId }));
const itemsOf = (h, gouterId, viewer = 'b1') => list(h, viewer).gouters.find((g) => g.id === gouterId).items;

test('ajout d\'apports : plusieurs par personne, visibles avec le nom de l\'auteur', () => {
    const h = fresh();
    const id = withGouter(h);
    assert.match(addItem(h, 't1', id, 'Gâteau au chocolat').id, /^a[0-9a-f]{7}$/);
    addItem(h, 't1', id, 'Jus d\'orange');
    addItem(h, 't2', id, 'Cookies');
    assert.deepEqual(itemsOf(h, id).map((i) => [i.item, i.name]), [['Gâteau au chocolat', 'Tuteur Un'], ['Jus d\'orange', 'Tuteur Un'], ['Cookies', 'Tuteur Deux']]);
});

test('apports : vide refusé, formule neutralisée, texte coupé à 80 caractères', () => {
    const h = fresh();
    const id = withGouter(h);
    assert.equal(addItem(h, 't1', id, '   ').code, 'invalid');
    assert.equal(addItem(h, 't1', id, '').code, 'invalid');
    assert.equal(addItem(h, 't1', id, undefined).code, 'invalid');
    assert.equal(addItem(h, 't1', id, '=== ').code, 'invalid');
    addItem(h, 't1', id, '=IMPORTRANGE("x","y")');
    addItem(h, 't1', id, 'g'.repeat(200));
    const items = itemsOf(h, id);
    assert.equal(items[0].item, 'IMPORTRANGE("x","y")');
    assert.equal(items[1].item.length, 80);
    assert.equal(items.length, 2);
});

test('retrait d\'un apport : l\'auteur et les gestionnaires du projet seulement', () => {
    const h = fresh();
    const id = withGouter(h);
    addItem(h, 't1', id, 'Cake');
    addItem(h, 't1', id, 'Jus');
    addItem(h, 't1', id, 'Fruits');
    const [cake, jus, fruits] = itemsOf(h, id).map((i) => i.id);
    assert.equal(removeItem(h, 't2', cake).code, 'forbidden');
    assert.equal(removeItem(h, 'c7', cake).code, 'forbidden');
    assert.equal(removeItem(h, 't1', cake).success, true);
    assert.equal(removeItem(h, 'c4', jus).success, true);
    assert.equal(removeItem(h, 'b1', fruits).success, true);
    assert.equal(removeItem(h, 't1', 'nope').code, 'invalid');
    assert.deepEqual(itemsOf(h, id), []);
});

test('canRemove : vrai pour l\'auteur et pour un gestionnaire, faux pour un autre membre', () => {
    const h = fresh();
    const id = withGouter(h);
    addItem(h, 't1', id, 'Cake');
    assert.equal(itemsOf(h, id, 't1')[0].canRemove, true);
    assert.equal(itemsOf(h, id, 'c4')[0].canRemove, true);
    assert.equal(itemsOf(h, id, 'b1')[0].canRemove, true);
    assert.equal(itemsOf(h, id, 't2')[0].canRemove, false);
    assert.equal(itemsOf(h, id, 'c7')[0].canRemove, false);
});

test('les colonnes des inscriptions et des apports sont au format texte', () => {
    const h = fresh();
    const id = withGouter(h);
    slot(h, 't1', id, 10, true);
    addItem(h, 't1', id, 'Cake');
    const text = (name) => h.formats(name).filter(([, f]) => f === '@').map(([range]) => range);
    for (const column of ['A:A', 'C:C']) assert.ok(text('GouterCreneaux').includes(column), JSON.stringify(text('GouterCreneaux')));
    for (const column of ['A:A', 'B:B', 'C:C', 'D:D']) assert.ok(text('GouterApports').includes(column), JSON.stringify(text('GouterApports')));
});

test('un goûter annulé garde ses inscriptions dans le Sheet mais ne les expose plus', () => {
    const h = fresh();
    const id = withGouter(h);
    slot(h, 't1', id, 10, true);
    addItem(h, 't1', id, 'Cake');
    cancel(h, 'c4', id);
    assert.equal(list(h, 't1').gouters.length, 0);
    assert.equal(slotRows(h).length, 1);
    assert.equal(h.sheet('GouterApports').length, 2);
});
