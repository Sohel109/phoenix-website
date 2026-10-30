import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'b1', name: 'Bureau', role: 'bureau', login: 'b1', password: 'x' },
    { id: 'c4', name: 'Chef Quatre', role: 'chef_projet', login: 'c4', password: 'x', childProjects: '4' },
    { id: 'c7', name: 'Chef Sept', role: 'chef_projet', login: 'c7', password: 'x', childProjects: '7' },
    { id: 't1', name: 'Tuteur Un', role: 'tuteur', login: 't1', password: 'x' },
    { id: 't2', name: 'Tuteur Deux', role: 'tuteur', login: 't2', password: 'x' },
    { id: 't3', name: 'Tuteur Trois', role: 'tuteur', login: 't3', password: 'x' },
];
const TODAY = '2026-10-30';
const fresh = (opts = {}) => loadScript({ users: USERS, now: TODAY, ...opts });
const plain = (x) => JSON.parse(JSON.stringify(x));

const REASON = 'Préparation des supports pédagogiques';
const get = (h, requesterId) => plain(h.call('getManualHours', { requesterId }));
const add = (h, requesterId, extra) => plain(h.call('addManualHours', { requesterId, hours: 2, reason: REASON, ...extra }));
const del = (h, requesterId, id) => plain(h.call('deleteManualHours', { requesterId, id }));
/** Réservation d'un membre sur un créneau, passée par l'action existante `syncBooking`. */
const book = (h, userId, slotId, status = 'confirme') =>
    h.raw('syncBooking', { booking: { id: `bk-${userId}-${slotId}-${status}`, slotId, userId, userName: userId, weekKey: '2026-W44', status } });
const dataRows = (h) => (h.sheet('HeuresManuelles') ?? []).slice(1);

const ALL_ACTIONS = ['getManualHours', 'addManualHours', 'deleteManualHours', 'importManualHours', 'getExemptions', 'setExemption', 'importExemptions'];

// ─── Accès ────────────────────────────────────────────────────────────────────

test('sans jeton valide : unauthenticated sur les sept actions', () => {
    const h = fresh();
    const other = h.ctx.createSessionToken('t2');
    for (const action of ALL_ACTIONS) {
        assert.equal(plain(h.raw(action, { requesterId: 't1' })).code, 'unauthenticated', action);
        assert.equal(plain(h.raw(action, { requesterId: 't1', token: other })).code, 'unauthenticated', action);
    }
    assert.equal(dataRows(h).length, 0);
});

test('un tuteur lit ses propres heures et ne peut rien écrire', () => {
    const h = fresh();
    assert.equal(add(h, 'b1', { userId: 't1', hours: 3 }).success, true);
    assert.equal(add(h, 'b1', { userId: 't2', hours: 4 }).success, true);

    const mine = get(h, 't1');
    assert.equal(mine.success, true);
    assert.deepEqual(mine.manualHours.map((m) => m.userId), ['t1']);
    assert.deepEqual(mine.manageableProjects, []);
    assert.equal(mine.isBureau, false);

    const before = dataRows(h).length;
    const id = dataRows(h)[0][0];
    assert.equal(add(h, 't1', { userId: 't1' }).code, 'forbidden');
    assert.equal(del(h, 't1', id).code, 'forbidden');
    assert.equal(dataRows(h).length, before);
});

// ─── Attribution ──────────────────────────────────────────────────────────────

test('le Bureau attribue à un membre, à un nom hors liste et en mission générale', () => {
    const h = fresh();
    assert.equal(add(h, 'b1', { userId: 't1', projectId: 4 }).success, true);
    const out = add(h, 'b1', { userId: 'custom-clara-martin', userName: 'Clara Martin', hours: 5 });
    assert.equal(out.success, true);
    assert.match(out.id, /^h[0-9a-f]{7}$/);

    const entries = get(h, 'b1').manualHours;
    const custom = entries.find((m) => m.userId === 'custom-clara-martin');
    assert.equal(custom.userName, 'Clara Martin');
    assert.equal(custom.hours, 5);
    assert.equal(custom.grantedById, 'b1');
    assert.equal(custom.grantedBy, 'Bureau');
    assert.equal('projectId' in custom, false);
    const listed = entries.find((m) => m.userId === 't1');
    assert.equal(listed.userName, 'Tuteur Un');
    assert.equal(listed.projectId, 4);
});

test('un chef de projet attribue à un membre de son projet', () => {
    const h = fresh();
    book(h, 't1', 'slot-4-jeu');
    const out = add(h, 'c4', { userId: 't1', projectId: 4, hours: 2 });
    assert.equal(out.success, true);
    const entry = get(h, 'b1').manualHours[0];
    assert.equal(entry.grantedById, 'c4');
    assert.equal(entry.grantedBy, 'Chef Quatre');
    assert.equal(entry.projectId, 4);
});

test('un chef de projet est refusé hors de son périmètre et rien n est écrit', () => {
    const h = fresh();
    book(h, 't1', 'slot-4-jeu');
    book(h, 't3', 'slot-7-lun');
    book(h, 't2', 'slot-4-jeu', 'annule');
    const attempts = {
        'projet qu il ne gère pas': { userId: 't3', projectId: 7 },
        'mission générale (projet absent)': { userId: 't1' },
        'nom hors liste': { userId: 'custom-clara', userName: 'Clara', projectId: 4 },
        'membre sans réservation, projet en texte': { userId: 'b1', projectId: '4' },
        'membre réservé seulement sur un autre projet': { userId: 't3', projectId: 4 },
        'membre dont la réservation est annulée': { userId: 't2', projectId: 4 },
    };
    for (const [label, extra] of Object.entries(attempts)) {
        assert.equal(add(h, 'c4', extra).code, 'forbidden', label);
    }
    assert.equal(dataRows(h).length, 0);
});

test('valeurs refusées : heures, justification, membre ou projet inconnus', () => {
    const h = fresh();
    for (const hours of [0, 0.4, 51, 1.3, 'abc', null, -2]) {
        assert.equal(add(h, 'b1', { userId: 't1', hours }).code, 'invalid', `heures ${hours}`);
    }
    assert.equal(add(h, 'b1', { userId: 't1', reason: 'abcdefg' }).code, 'invalid');
    assert.equal(add(h, 'b1', { userId: 't1', reason: 'x'.repeat(301) }).code, 'invalid');
    assert.equal(add(h, 'b1', { userId: 'inconnu' }).code, 'invalid');
    assert.equal(add(h, 'b1', { userId: 't1', projectId: 12 }).code, 'invalid');
    assert.equal(add(h, 'b1', { userId: 'custom-', userName: '   ' }).code, 'invalid');
    assert.equal(dataRows(h).length, 0);
    assert.equal(add(h, 'b1', { userId: 't1', hours: 0.5 }).success, true);
    assert.equal(add(h, 'b1', { userId: 't1', hours: 50, reason: `${REASON} bis` }).success, true);
});

test('une justification qui commence par = est enregistrée sans le =', () => {
    const h = fresh();
    assert.equal(add(h, 'b1', { userId: 't1', reason: "=cmd|' /C calc'!A0" }).success, true);
    const reason = get(h, 'b1').manualHours[0].reason;
    assert.equal(reason.startsWith('='), false);
    assert.match(reason, /^cmd/);
});

test('les heures restent des nombres même si Sheets les relit en texte', () => {
    const h = fresh();
    add(h, 'b1', { userId: 't1', hours: 2.5 });
    assert.equal(get(h, 'b1').manualHours[0].hours, 2.5);
    h.setSheetCell('HeuresManuelles', 2, 4, '2,5');
    assert.equal(get(h, 'b1').manualHours[0].hours, 2.5);
    h.setSheetCell('HeuresManuelles', 2, 8, '');
    assert.equal('projectId' in get(h, 'b1').manualHours[0], false);
});

test('double clic : la même attribution deux fois en 120 secondes ne crée qu une ligne', () => {
    const h = fresh();
    book(h, 't1', 'slot-4-jeu');
    assert.equal(add(h, 'c4', { userId: 't1', projectId: 4 }).success, true);
    assert.equal(add(h, 'c4', { userId: 't1', projectId: 4 }).success, true);
    assert.equal(dataRows(h).length, 1);
    h.advanceMs(121 * 1000);
    assert.equal(add(h, 'c4', { userId: 't1', projectId: 4 }).success, true);
    assert.equal(dataRows(h).length, 2);
});

test('une attribution différente juste après la première est bien enregistrée', () => {
    const h = fresh();
    assert.equal(add(h, 'b1', { userId: 't1', hours: 2 }).success, true);
    assert.equal(add(h, 'b1', { userId: 't1', hours: 3 }).success, true);
    assert.equal(add(h, 'b1', { userId: 't2', hours: 2 }).success, true);
    assert.equal(dataRows(h).length, 3);
});

// ─── Lecture et suppression ───────────────────────────────────────────────────

function seeded() {
    const h = fresh();
    book(h, 't1', 'slot-4-jeu');
    book(h, 't3', 'slot-7-lun');
    add(h, 'b1', { userId: 't1', hours: 1 });
    add(h, 'b1', { userId: 't3', hours: 2, projectId: 7 });
    add(h, 'c4', { userId: 't1', hours: 3, projectId: 4 });
    add(h, 'c7', { userId: 't3', hours: 4, projectId: 7, reason: 'Animation de la séance spéciale' });
    return h;
}

test('lecture filtrée : chacun voit ce que son rôle permet', () => {
    const h = seeded();
    const hoursOf = (id) => get(h, id).manualHours.map((m) => m.hours).sort((a, b) => a - b);
    assert.deepEqual(hoursOf('b1'), [1, 2, 3, 4]);
    assert.deepEqual(hoursOf('c4'), [3]);
    assert.deepEqual(hoursOf('c7'), [2, 4]);
    assert.deepEqual(hoursOf('t1'), [1, 3]);
    assert.deepEqual(hoursOf('t2'), []);
    assert.deepEqual(get(h, 'c4').manageableProjects, [4]);
    assert.deepEqual(get(h, 'b1').manageableProjects, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.equal(get(h, 'b1').isBureau, true);
});

test('le plus récent est renvoyé en premier', () => {
    const h = fresh();
    add(h, 'b1', { userId: 't1', hours: 1 });
    h.advanceMs(1000);
    add(h, 'b1', { userId: 't1', hours: 2 });
    assert.deepEqual(get(h, 'b1').manualHours.map((m) => m.hours), [2, 1]);
});

test('suppression : le Bureau supprime tout, le chef de projet ses propres attributions seulement', () => {
    const h = seeded();
    const byHours = (hours) => get(h, 'b1').manualHours.find((m) => m.hours === hours).id;
    // Chef du projet 4 : refusé sur l'attribution du Bureau, sur celle d'un autre chef, et sur un identifiant inconnu.
    assert.equal(del(h, 'c4', byHours(1)).code, 'forbidden');
    assert.equal(del(h, 'c4', byHours(4)).code, 'forbidden');
    assert.equal(del(h, 'c4', 'hzzzzzzz').code, 'invalid');
    assert.equal(del(h, 'c4', byHours(3)).success, true);
    assert.equal(del(h, 'b1', byHours(4)).success, true);
    assert.deepEqual(get(h, 'b1').manualHours.map((m) => m.hours).sort(), [1, 2]);
});

test('un chef de projet à qui on retire le projet ne peut plus supprimer son attribution', () => {
    const h = seeded();
    const id = get(h, 'b1').manualHours.find((m) => m.hours === 3).id;
    h.setUsersCell(3, 10, '');
    assert.equal(del(h, 'c4', id).code, 'forbidden');
    assert.equal(get(h, 'b1').manualHours.length, 4);
});

test('les colonnes de texte sont créées au format texte', () => {
    const h = fresh();
    add(h, 'b1', { userId: 't1' });
    const text = h.formats('HeuresManuelles').filter(([, f]) => f === '@').map(([range]) => range);
    for (const col of ['A:A', 'B:B', 'C:C', 'E:E', 'F:F', 'G:G', 'I:I']) assert.ok(text.includes(col), col);
});

// ─── Import de l'existant (heures enregistrées dans le navigateur du Bureau) ───

const legacy = (n, extra = {}) => ({
    id: `mh-17000000000${n}-abcde`,
    userId: 't1',
    userName: 'Tuteur Un',
    hours: 5,
    reason: 'Olympiades, week-end complet',
    grantedBy: 'Sohel HAGGUI',
    createdAt: '2026-10-10T08:00:00.000Z',
    projectId: 4,
    ...extra,
});
const importHours = (h, requesterId, entries) => plain(h.call('importManualHours', { requesterId, entries }));

test('import des heures : réservé au Bureau, rien n est écrit sinon', () => {
    const h = fresh();
    for (const id of ['c4', 't1']) assert.equal(importHours(h, id, [legacy(1)]).code, 'forbidden', id);
    assert.equal(dataRows(h).length, 0);
});

test('import des heures : garde les valeurs d origine, ignore les invalides et les identifiants déjà présents', () => {
    const h = fresh();
    const entries = [
        legacy(1),
        legacy(2, { projectId: undefined, userId: 'custom-clara-martin', userName: 'Clara Martin', hours: 2.5 }),
        legacy(3, { hours: 0.3 }),
        legacy(4, { reason: 'court' }),
        legacy(5, { projectId: 12 }),
        legacy(1),
        legacy(6, { id: '=cmd' }),
    ];
    assert.deepEqual(importHours(h, 'b1', entries), { success: true, imported: 2, ignored: 5 });
    const stored = get(h, 'b1').manualHours;
    const first = stored.find((m) => m.id === legacy(1).id);
    assert.equal(first.createdAt, '2026-10-10T08:00:00.000Z');
    assert.equal(first.grantedBy, 'Sohel HAGGUI');
    assert.equal(first.grantedById, '');
    assert.equal(first.projectId, 4);
    assert.equal('projectId' in stored.find((m) => m.userId === 'custom-clara-martin'), false);
    // Relancer l'import ne double rien.
    assert.deepEqual(importHours(h, 'b1', entries), { success: true, imported: 0, ignored: 7 });
    assert.equal(dataRows(h).length, 2);
});

test('import des heures : plus de 500 entrées est refusé, une liste absente aussi', () => {
    const h = fresh();
    const many = Array.from({ length: 501 }, (_, i) => legacy(i, { id: `mh-bulk-${i}` }));
    assert.equal(importHours(h, 'b1', many).code, 'invalid');
    assert.equal(importHours(h, 'b1', undefined).code, 'invalid');
    assert.equal(dataRows(h).length, 0);
});

test('une attribution importée est supprimable par le Bureau mais pas par un chef de projet', () => {
    const h = fresh();
    importHours(h, 'b1', [legacy(1)]);
    assert.equal(del(h, 'c4', legacy(1).id).code, 'forbidden');
    assert.equal(del(h, 'b1', legacy(1).id).success, true);
    assert.equal(dataRows(h).length, 0);
});

// ─── Membres renouvelants ─────────────────────────────────────────────────────

const exempt = (h, requesterId, extra) => plain(h.call('setExemption', { requesterId, ...extra }));
const exemptions = (h, requesterId) => plain(h.call('getExemptions', { requesterId }));

test('renouvelants : seul le Bureau ajoute et retire, sans doublon', () => {
    const h = fresh();
    for (const id of ['c4', 't1']) assert.equal(exempt(h, id, { userId: 't1', exempt: true }).code, 'forbidden', id);
    assert.equal(exempt(h, 'b1', { userId: 't1', exempt: true, note: '=Quota 50h validé en 2025', year: '2025-2026' }).success, true);
    assert.equal(exempt(h, 'b1', { userId: 't1', exempt: true }).success, true);
    const list = exemptions(h, 'b1').exemptions;
    assert.equal(list.length, 1);
    assert.equal(list[0].userName, 'Tuteur Un');
    assert.equal(list[0].grantedBy, 'Bureau');
    assert.equal(list[0].year, '2025-2026');
    assert.equal(list[0].note.startsWith('='), false);
    assert.equal(exempt(h, 'b1', { userId: 't1', exempt: false }).success, true);
    assert.equal(exemptions(h, 'b1').exemptions.length, 0);
});

test('renouvelants : valeurs refusées', () => {
    const h = fresh();
    assert.equal(exempt(h, 'b1', { userId: 'inconnu', exempt: true }).code, 'invalid');
    assert.equal(exempt(h, 'b1', { userId: 't1' }).code, 'invalid');
    assert.equal(exempt(h, 'b1', { userId: 't1', exempt: 'oui' }).code, 'invalid');
    assert.equal(exemptions(h, 'b1').exemptions.length, 0);
});

test('renouvelants : le Bureau et les chefs de projet lisent tout, un tuteur seulement sa propre entrée', () => {
    const h = fresh();
    exempt(h, 'b1', { userId: 't1', exempt: true });
    exempt(h, 'b1', { userId: 't2', exempt: true });
    assert.equal(exemptions(h, 'b1').exemptions.length, 2);
    assert.equal(exemptions(h, 'c4').exemptions.length, 2);
    assert.deepEqual(exemptions(h, 't1').exemptions.map((e) => e.userId), ['t1']);
    assert.deepEqual(exemptions(h, 't3').exemptions, []);
});

test('import des renouvelants : Bureau seulement, sans doublon, entrées invalides ignorées', () => {
    const h = fresh();
    const entries = [
        { userId: 't1', userName: 'Tuteur Un', grantedBy: 'Sohel', grantedAt: '2026-09-15T10:00:00.000Z', year: '2024-2025', note: '+Quota validé' },
        { userId: 't2', userName: 'Tuteur Deux', grantedBy: 'Sohel', grantedAt: 'pas une date', year: '2024-2025', note: '' },
        { userId: 't1', userName: 'Tuteur Un' },
        { userId: '', userName: 'Sans identifiant' },
        { userId: 't3', userName: '   ' },
    ];
    assert.equal(plain(h.call('importExemptions', { requesterId: 'c4', entries })).code, 'forbidden');
    assert.deepEqual(plain(h.call('importExemptions', { requesterId: 'b1', entries })), { success: true, imported: 2, ignored: 3 });
    const list = exemptions(h, 'b1').exemptions;
    assert.equal(list.length, 2);
    assert.equal(list.find((e) => e.userId === 't1').grantedAt, '2026-09-15T10:00:00.000Z');
    assert.equal(list.find((e) => e.userId === 't1').note.startsWith('+'), false);
    assert.deepEqual(plain(h.call('importExemptions', { requesterId: 'b1', entries })), { success: true, imported: 0, ignored: 5 });
    assert.equal(plain(h.call('importExemptions', { requesterId: 'b1', entries: undefined })).code, 'invalid');
});

test('renouvelants : colonnes de texte et onglet créé à la première utilisation', () => {
    const h = fresh();
    exempt(h, 'b1', { userId: 't1', exempt: true });
    const text = h.formats('ExemptionsQuota').filter(([, f]) => f === '@').map(([range]) => range);
    for (const col of ['A:A', 'B:B', 'C:C', 'D:D', 'E:E', 'F:F']) assert.ok(text.includes(col), col);
});
