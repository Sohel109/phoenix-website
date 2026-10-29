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
