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

// ─── Photos et lecture publique (Task 2) ───────────────────────────────────────

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]).toString('base64');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]).toString('base64');
const upload = (h, id, slot = 'cover', data = JPEG) => h.call('newsUploadPhoto', { requesterId: 'd4', id, slot, data });
const publishedArticle = (h, extra = {}) => {
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article(extra) });
    const cover = upload(h, id).photoId;
    const res = h.call('newsSetPublished', { requesterId: 'd4', id, published: true });
    assert.equal(res.success, true, JSON.stringify(res));
    return { id, cover, slug: res.slug };
};

test('couverture PNG refusée, trop lourde refusée, JPEG accepté', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    assert.equal(upload(h, id, 'cover', PNG).code, 'bad_request');
    assert.equal(upload(h, id, 'cover', 'A'.repeat(1500004)).code, 'too_large');
    assert.equal(upload(h, id, 'autre').code, 'bad_request');
    const ok = upload(h, id);
    assert.equal(ok.success, true);
    assert.equal(h.drive.files.get(ok.photoId).folder, 'Phoenix - Photos actualités');
    assert.equal(h.call('newsGetAdmin', { requesterId: 'd4' }).articles[0].coverId, ok.photoId);
});

test('7e photo de galerie : too_many', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    for (let i = 0; i < 6; i++) assert.equal(upload(h, id, 'gallery').success, true);
    assert.equal(upload(h, id, 'gallery').code, 'too_many');
    assert.equal(h.call('newsGetAdmin', { requesterId: 'd4' }).articles[0].photoIds.length, 6);
});

test('nouvelle couverture : l\'ancienne à la corbeille', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    const first = upload(h, id).photoId;
    const second = upload(h, id).photoId;
    assert.equal(h.drive.files.get(first).trashed, true);
    assert.equal(h.drive.files.get(second).trashed, false);
});

test('newsRemovePhoto : couverture ou galerie, à la corbeille ; photo étrangère refusée', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    const cover = upload(h, id).photoId;
    const g = upload(h, id, 'gallery').photoId;
    assert.equal(h.call('newsRemovePhoto', { requesterId: 'd4', id, photoId: 'autre' }).code, 'not_found');
    assert.equal(h.call('newsRemovePhoto', { requesterId: 'd4', id, photoId: g }).success, true);
    assert.equal(h.call('newsRemovePhoto', { requesterId: 'd4', id, photoId: cover }).success, true);
    const a = h.call('newsGetAdmin', { requesterId: 'd4' }).articles[0];
    assert.equal(a.coverId, null);
    assert.deepEqual(a.photoIds, []);
    assert.equal(h.drive.files.get(g).trashed, true);
    assert.equal(h.drive.files.get(cover).trashed, true);
});

test('newsDelete met les photos à la corbeille', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    const cover = upload(h, id).photoId;
    const g = upload(h, id, 'gallery').photoId;
    h.call('newsDelete', { requesterId: 'd4', id });
    assert.equal(h.drive.files.get(cover).trashed, true);
    assert.equal(h.drive.files.get(g).trashed, true);
});

test('slug fixé à la première publication ; titres identiques : x et x-2', () => {
    const h = fresh();
    const a = publishedArticle(h, { title: 'Sortie au Mucem !' });
    assert.equal(a.slug, 'sortie-au-mucem');
    h.call('newsSave', { requesterId: 'd4', id: a.id, ...article({ title: 'Autre titre' }) });
    h.call('newsSetPublished', { requesterId: 'd4', id: a.id, published: false });
    assert.equal(h.call('newsSetPublished', { requesterId: 'd4', id: a.id, published: true }).slug, 'sortie-au-mucem');
    assert.equal(publishedArticle(h, { title: 'Sortie au Mucem' }).slug, 'sortie-au-mucem-2');
    assert.equal(publishedArticle(h, { title: '!!!' }).slug, 'actu');
});

test('publier sans texte : incomplete', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article({ body: '' }) });
    upload(h, id);
    assert.equal(h.call('newsSetPublished', { requesterId: 'd4', id, published: true }).code, 'incomplete');
});

test('getNews : ni non publié, ni sans couverture utilisable, ni identifiant de compte', () => {
    const h = withPublisher('a1');
    publishedArticle(h, { title: 'Visible' });
    const hidden = publishedArticle(h, { title: 'Dépublié' });
    h.call('newsSetPublished', { requesterId: 'd4', id: hidden.id, published: false });
    const lost = publishedArticle(h, { title: 'Couverture perdue' });
    h.drive.files.get(lost.cover).trashed = true;
    h.call('newsSave', { requesterId: 'a1', ...article({ title: 'Brouillon' }) });
    const res = h.get('getNews');
    assert.equal(res.success, true);
    assert.deepEqual(res.articles.map((a) => a.title), ['Visible']);
    assert.deepEqual(res.reels, []);
    const text = JSON.stringify(res);
    for (const forbidden of ['"a1"', '"d4"', 'createdBy', 'updatedBy', hidden.id]) assert.ok(!text.includes(forbidden), forbidden);
    assert.deepEqual(Object.keys(res.articles[0]).sort(), ['body', 'coverId', 'photoIds', 'projectId', 'publishedAt', 'slug', 'title']);
});

test('getNews : galerie filtrée sur les photos utilisables', () => {
    const h = fresh();
    const a = publishedArticle(h);
    const g1 = upload(h, a.id, 'gallery').photoId;
    const g2 = upload(h, a.id, 'gallery').photoId;
    h.drive.files.get(g1).trashed = true;
    assert.deepEqual(h.get('getNews').articles[0].photoIds, [g2]);
});

test('getNews : publishedAt en YYYY-MM-DD même converti en Date, plus récent d\'abord, 60 au plus', () => {
    const h = fresh();
    publishedArticle(h, { title: 'Ancien' });
    h.setNow('2026-11-26');
    publishedArticle(h, { title: 'Récent' });
    // Google Sheets convertit la date de publication du premier article.
    h.setSheetCell('Actualites', 2, 9, new Date('2026-11-24T23:00:00Z'));
    const res = h.get('getNews');
    assert.deepEqual(res.articles.map((a) => [a.title, a.publishedAt]), [['Récent', '2026-11-26'], ['Ancien', '2026-11-25']]);
    for (let i = 0; i < 60; i++) publishedArticle(h, { title: `Article ${i}` });
    assert.equal(h.get('getNews').articles.length, 60);
});

test('getNews avant toute publication : listes vides, aucun onglet créé', () => {
    const h = fresh();
    assert.deepEqual(h.get('getNews'), { success: true, articles: [], reels: [] });
    assert.equal(h.sheet('Actualites'), null);
});

test('getPublicImage : article publié servi, dépublié refusé, fichier quelconque refusé ; alias getNomineePhoto', () => {
    const h = fresh();
    const a = publishedArticle(h);
    const g = upload(h, a.id, 'gallery').photoId;
    assert.equal(h.get('getPublicImage', { id: a.cover }).success, true);
    assert.equal(h.get('getPublicImage', { id: g }).success, true);
    assert.equal(h.get('getNomineePhoto', { id: a.cover }).success, true);
    assert.equal(h.get('getPublicImage', { id: 'sheet-id-1' }).success, false);
    assert.equal(h.get('getPublicImage', { id: '' }).success, false);
    h.call('newsSetPublished', { requesterId: 'd4', id: a.id, published: false });
    assert.equal(h.get('getPublicImage', { id: a.cover }).success, false);
});

test('getPublicImage : la photo d\'un nommé reste servie', () => {
    const h = fresh();
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'a1', selected: true });
    const photo = h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG }).photoId;
    assert.ok(photo);
    assert.equal(h.get('getPublicImage', { id: photo }).success, true);
});

test('newsSave : ordre des photos enregistré ; identifiant étranger refusé', () => {
    const h = fresh();
    const { id } = h.call('newsSave', { requesterId: 'd4', ...article() });
    const g1 = upload(h, id, 'gallery').photoId;
    const g2 = upload(h, id, 'gallery').photoId;
    assert.equal(h.call('newsSave', { requesterId: 'd4', id, ...article(), photoIds: [g2, g1] }).success, true);
    assert.deepEqual(h.call('newsGetAdmin', { requesterId: 'd4' }).articles[0].photoIds, [g2, g1]);
    assert.equal(h.call('newsSave', { requesterId: 'd4', id, ...article(), photoIds: [g2, 'x'] }).code, 'bad_request');
    assert.equal(h.call('newsSave', { requesterId: 'd4', id, ...article(), photoIds: [g2] }).code, 'bad_request');
});

test('newsGetPhoto : photo d\'un brouillon lue par un publieur, refusée à un tuteur et hors article', () => {
    const h = withPublisher('a1');
    const { id } = h.call('newsSave', { requesterId: 'a1', ...article() });
    const cover = upload(h, id).photoId;
    const res = h.call('newsGetPhoto', { requesterId: 'a1', id, photoId: cover });
    assert.equal(res.success, true);
    assert.equal(res.data, JPEG);
    assert.equal(h.call('newsGetPhoto', { requesterId: 'b2', id, photoId: cover }).code, 'forbidden');
    assert.equal(h.call('newsGetPhoto', { requesterId: 'a1', id, photoId: 'sheet-id-1' }).code, 'not_found');
});
