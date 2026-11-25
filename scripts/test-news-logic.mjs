import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'a1', name: 'Alice Martin', role: 'tuteur', login: 'alice', password: 'pw-a' },
    { id: 'b2', name: 'Bob Durand', role: 'tuteur', login: 'bob', password: 'pw-b' },
    { id: 'd4', name: 'Dan', role: 'bureau', login: 'dan', password: 'pw-d' },
];
const NOW = '2026-11-25';
const article = (extra = {}) => ({ title: 'Sortie au Mucem', body: 'Une belle journée.\n\nMerci à tous.', projectId: 'izzo', ...extra });
const fresh = (opts = {}) => loadScript({ users: USERS, now: NOW, ...opts });
const withPublisher = (id = 'a1') => {
    const h = fresh();
    assert.equal(h.call('newsSetPublisher', { requesterId: 'd4', userId: id, allowed: true }).success, true);
    return h;
};

// ─── Accès ─────────────────────────────────────────────────────────────────────

test('tuteur non publieur : newsAccess canPublish false, newsSave forbidden', () => {
    const h = fresh();
    const access = h.call('newsAccess', { requesterId: 'a1' });
    assert.equal(access.success, true);
    assert.equal(access.canPublish, false);
    assert.equal(access.isBureau, false);
    assert.equal(h.call('newsSave', { requesterId: 'a1', ...article() }).code, 'forbidden');
    assert.equal(h.call('newsGetAdmin', { requesterId: 'a1' }).code, 'forbidden');
});

test('le Bureau publie sans case', () => {
    const h = fresh();
    const access = h.call('newsAccess', { requesterId: 'd4' });
    assert.equal(access.canPublish, true);
    assert.equal(access.isBureau, true);
});

test('Bureau coche a1 : a1 crée, modifie et voit l\'article ; members seulement pour le Bureau', () => {
    const h = withPublisher('a1');
    assert.equal(h.call('newsAccess', { requesterId: 'a1' }).canPublish, true);
    const created = h.call('newsSave', { requesterId: 'a1', ...article() });
    assert.equal(created.success, true);
    assert.ok(created.id);
    assert.equal(h.call('newsSave', { requesterId: 'a1', id: created.id, ...article({ title: 'Sortie au Mucem, bis' }) }).success, true);

    const adminA = h.call('newsGetAdmin', { requesterId: 'a1' });
    assert.equal(adminA.success, true);
    assert.equal(adminA.isBureau, false);
    assert.equal(adminA.members, undefined);
    assert.equal(adminA.articles.length, 1);
    const a = adminA.articles[0];
    assert.equal(a.title, 'Sortie au Mucem, bis');
    assert.equal(a.published, false);
    assert.equal(a.slug, '');
    assert.equal(a.projectId, 'izzo');
    assert.deepEqual(a.photoIds, []);
    assert.equal(a.coverId, null);
    assert.equal(a.updatedByName, 'Alice Martin');

    const adminD = h.call('newsGetAdmin', { requesterId: 'd4' });
    assert.equal(adminD.isBureau, true);
    const members = Object.fromEntries(adminD.members.map((m) => [m.id, m.canPublish]));
    assert.deepEqual(members, { a1: true, b2: false, d4: true });
});

test('décocher a1 : son newsSave suivant est forbidden', () => {
    const h = withPublisher('a1');
    const created = h.call('newsSave', { requesterId: 'a1', ...article() });
    h.call('newsSetPublisher', { requesterId: 'd4', userId: 'a1', allowed: false });
    assert.equal(h.call('newsSave', { requesterId: 'a1', id: created.id, ...article() }).code, 'forbidden');
    assert.equal(h.sheet('Publieurs').length, 1);
});

test('cocher deux fois ne crée qu\'une ligne', () => {
    const h = withPublisher('a1');
    h.call('newsSetPublisher', { requesterId: 'd4', userId: 'a1', allowed: true });
    assert.equal(h.sheet('Publieurs').length, 2);
});

test('newsSetPublisher : refusé à un tuteur, inutile pour le Bureau, compte inconnu', () => {
    const h = withPublisher('a1');
    assert.equal(h.call('newsSetPublisher', { requesterId: 'a1', userId: 'b2', allowed: true }).code, 'forbidden');
    assert.equal(h.call('newsSetPublisher', { requesterId: 'd4', userId: 'd4', allowed: true }).code, 'bad_request');
    assert.equal(h.call('newsSetPublisher', { requesterId: 'd4', userId: 'zz', allowed: true }).code, 'not_found');
});

test('jeton invalide : unauthenticated', () => {
    const h = fresh();
    assert.equal(h.call('newsSave', { requesterId: 'd4', token: 'faux', ...article() }).code, 'unauthenticated');
    assert.equal(h.call('newsAccess', { requesterId: 'd4', token: '' }).code, 'unauthenticated');
});

// ─── Validation ──────────────────────────────────────────────────────────────

test('limites : titre vide, 121 caractères, texte de 5001 refusés ; 120 et 5000 acceptés', () => {
    const h = fresh();
    const save = (extra) => h.call('newsSave', { requesterId: 'd4', ...article(extra) });
    assert.equal(save({ title: '   ' }).code, 'bad_request');
    assert.equal(save({ title: 'x'.repeat(121) }).code, 'bad_request');
    assert.equal(save({ body: 'x'.repeat(5001) }).code, 'bad_request');
    assert.equal(save({ title: 'x'.repeat(120), body: 'y'.repeat(5000) }).success, true);
    assert.equal(save({ projectId: 42 }).code, 'bad_request');
    assert.equal(save({ projectId: '' }).success, true);
});

test('modifier un article inconnu : not_found', () => {
    const h = fresh();
    assert.equal(h.call('newsSave', { requesterId: 'd4', id: 'inconnu', ...article() }).code, 'not_found');
    assert.equal(h.call('newsDelete', { requesterId: 'd4', id: 'inconnu' }).code, 'not_found');
});

test('publier sans couverture : incomplete', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    const res = h.call('newsSetPublished', { requesterId: 'd4', id, published: true });
    assert.equal(res.success, false);
    assert.equal(res.code, 'incomplete');
});

// ─── Sheet ────────────────────────────────────────────────────────────────────

test('onglets créés avec le format texte', () => {
    const h = withPublisher('a1');
    h.call('newsSave', { requesterId: 'a1', ...article({ title: '=1+1' }) });
    assert.ok(h.formats('Actualites').some(([range, f]) => range === 'A:L' && f === '@'));
    assert.ok(h.formats('Publieurs').some(([range, f]) => range === 'A:C' && f === '@'));
    assert.equal(h.call('newsGetAdmin', { requesterId: 'd4' }).articles[0].title, '=1+1');
});

test('newsGetAdmin : le plus récemment modifié en premier', () => {
    const h = fresh();
    const first = h.call('newsSave', { requesterId: 'd4', ...article({ title: 'Premier' }) });
    h.advanceMs(1000);
    h.call('newsSave', { requesterId: 'd4', ...article({ title: 'Second' }) });
    h.advanceMs(1000);
    h.call('newsSave', { requesterId: 'd4', id: first.id, ...article({ title: 'Premier modifié' }) });
    assert.deepEqual(h.call('newsGetAdmin', { requesterId: 'd4' }).articles.map((a) => a.title), ['Premier modifié', 'Second']);
});

test('newsDelete retire la ligne', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    assert.equal(h.call('newsDelete', { requesterId: 'd4', id }).success, true);
    assert.equal(h.call('newsGetAdmin', { requesterId: 'd4' }).articles.length, 0);
});
