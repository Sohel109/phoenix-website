import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'b1', name: 'Bureau', role: 'bureau', login: 'b1', password: 'x', projects: '2' },
    { id: 'c4', name: 'Chef Quatre', role: 'chef_projet', login: 'c4', password: 'x', projects: '4' },
    { id: 'c47', name: 'Chef Quatre Sept', role: 'chef_projet', login: 'c47', password: 'x', projects: '4,7' },
    { id: 'c0', name: 'Chef Sans Projet', role: 'chef_projet', login: 'c0', password: 'x', projects: '' },
    { id: 't4', name: 'Tuteur', role: 'tuteur', login: 't4', password: 'x', projects: '4' },
];
const TODAY = '2026-10-29';
const fresh = (opts = {}) => loadScript({ users: USERS, now: TODAY, ...opts });
const plain = (x) => JSON.parse(JSON.stringify(x));
const names = (out) => out.children.map((c) => c.name);

const get = (h, requesterId, extra = {}) => plain(h.call('getChildrenData', { requesterId, ...extra }));
const add = (h, requesterId, projectId, list) => plain(h.call('addChildren', { requesterId, projectId, names: list }));

// ─── Accès ────────────────────────────────────────────────────────────────────

test('un tuteur est refusé sur les quatre actions', () => {
    const h = fresh();
    for (const [action, body] of [
        ['getChildrenData', { projectId: 4 }],
        ['addChildren', { projectId: 4, names: ['Inès B.'] }],
        ['removeChild', { projectId: 4, childId: 'x' }],
        ['saveChildAttendance', { projectId: 4, date: TODAY, presentIds: [] }],
    ]) {
        const out = plain(h.call(action, { requesterId: 't4', ...body }));
        assert.equal(out.success, false, action);
        assert.equal(out.code, 'forbidden', action);
    }
});

test('sans jeton valide : unauthenticated', () => {
    const h = fresh();
    assert.equal(plain(h.raw('getChildrenData', { requesterId: 'c4' })).code, 'unauthenticated');
    const otherToken = h.ctx.createSessionToken('c47');
    assert.equal(plain(h.raw('getChildrenData', { requesterId: 'c4', token: otherToken })).code, 'unauthenticated');
});

test('un CDP voit ses projets, le Bureau les neuf, un CDP sans projet aucun', () => {
    const h = fresh();
    assert.deepEqual(get(h, 'c4').projects, [4]);
    assert.deepEqual(get(h, 'c47').projects, [4, 7]);
    const bureau = get(h, 'b1');
    assert.deepEqual(bureau.projects, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.equal(bureau.isBureau, true);
    const none = get(h, 'c0');
    assert.deepEqual(none.projects, []);
    assert.equal(none.projectId, null);
    assert.deepEqual(none.children, []);
});

test('un CDP est refusé sur le projet d\'un autre et ne reçoit aucun nom', () => {
    const h = fresh();
    add(h, 'c47', 7, ['Secret S.']);
    const out = get(h, 'c4', { projectId: 7 });
    assert.equal(out.success, false);
    assert.equal(out.code, 'forbidden');
    assert.ok(!JSON.stringify(out).includes('Secret'));
    assert.equal(add(h, 'c4', 7, ['Autre A.']).code, 'forbidden');
});

test('la colonne projets numérique (Sheets) est acceptée', () => {
    const h = fresh({ numericIds: true });
    assert.deepEqual(get(h, 'c4').projects, [4]);
});

test('sans projectId, le premier projet accessible est utilisé ; un projet inconnu est invalide', () => {
    const h = fresh();
    assert.equal(get(h, 'c47').projectId, 4);
    assert.equal(get(h, 'b1', { projectId: 12 }).code, 'invalid');
});

// ─── Liste des enfants ────────────────────────────────────────────────────────

test('ajout : noms nettoyés, vides et doublons ignorés, ordre conservé', () => {
    const h = fresh();
    const out = add(h, 'c4', 4, ['Inès B.', '  Karim   D. ', '', 'inès b.']);
    assert.equal(out.success, true);
    assert.equal(out.added, 2);
    assert.deepEqual(names(get(h, 'c4', { projectId: 4 })), ['Inès B.', 'Karim D.']);
    const rows = h.sheet('Enfants');
    assert.equal(rows.length, 3);
    assert.equal(rows[1][4 - 1], true); // colonne active
});

test('un nom est coupé à 40 caractères ; une liste vide est refusée', () => {
    const h = fresh();
    add(h, 'c4', 4, ['A'.repeat(60)]);
    assert.equal(get(h, 'c4').children[0].name.length, 40);
    assert.equal(add(h, 'c4', 4, []).code, 'invalid');
    assert.equal(add(h, 'c4', 4, ['  ', '']).code, 'invalid');
});

test('le doublon est cherché par projet : le même prénom est permis dans un autre projet', () => {
    const h = fresh();
    add(h, 'c47', 4, ['Inès B.']);
    assert.equal(add(h, 'c47', 7, ['Inès B.']).added, 1);
});

test('retrait : l\'enfant disparaît de la liste mais sa ligne reste, inactive', () => {
    const h = fresh();
    add(h, 'c4', 4, ['Inès B.', 'Karim D.']);
    const ines = get(h, 'c4').children[0].id;
    const out = plain(h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: ines }));
    assert.equal(out.success, true);
    assert.deepEqual(names(get(h, 'c4')), ['Karim D.']);
    const rows = h.sheet('Enfants');
    assert.equal(rows.length, 3);
    assert.equal(rows[1][3], false);
});

test('retirer un enfant inconnu ou d\'un autre projet est invalide', () => {
    const h = fresh();
    add(h, 'c47', 7, ['Secret S.']);
    const secret = get(h, 'c47', { projectId: 7 }).children[0].id;
    assert.equal(plain(h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: secret })).code, 'invalid');
    assert.equal(plain(h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: 'nope' })).code, 'invalid');
    assert.deepEqual(names(get(h, 'c47', { projectId: 7 })), ['Secret S.']);
});

test('le Bureau peut ajouter et retirer dans n\'importe quel projet', () => {
    const h = fresh();
    assert.equal(add(h, 'b1', 9, ['Léa P.']).added, 1);
    const id = get(h, 'b1', { projectId: 9 }).children[0].id;
    assert.equal(plain(h.call('removeChild', { requesterId: 'b1', projectId: 9, childId: id })).success, true);
});
