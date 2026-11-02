import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'b1', name: 'Bureau', role: 'bureau', login: 'b1', password: 'x' },
    { id: 'c4', name: 'Chef Quatre', role: 'chef_projet', login: 'c4', password: 'x', childProjects: '4' },
    { id: 'c7', name: 'Chef Sept', role: 'chef_projet', login: 'c7', password: 'x', childProjects: '7' },
    { id: 'c9', name: 'Chef sans projet', role: 'chef_projet', login: 'c9', password: 'x' },
    { id: 't1', name: 'Tuteur Un', role: 'tuteur', login: 't1', password: 'x' },
    { id: 't2', name: 'Tuteur Deux', role: 'tuteur', login: 't2', password: 'x' },
    { id: 't3', name: 'Tuteur Trois', role: 'tuteur', login: 't3', password: 'x' },
];
// 2026-11-02 est un lundi : la semaine 2026-W45 commence ce jour-là.
const TODAY = '2026-11-02';
const fresh = (opts = {}) => loadScript({ users: USERS, now: TODAY, ...opts });
const plain = (x) => JSON.parse(JSON.stringify(x));

const addTo = (h, requesterId, slotId, weekKey, userIds) => plain(h.call('addMemberBookings', { requesterId, slotId, weekKey, userIds }));
const remove = (h, requesterId, bookingId) => plain(h.call('removeMemberBooking', { requesterId, bookingId }));
const rows = (h) => (h.sheet('Bookings') ?? []).slice(1);
const rowOf = (h, userId, slotId, weekKey) => rows(h).find((r) => r[2] === userId && r[1] === slotId && r[4] === weekKey);
const book = (h, userId, slotId, weekKey, status = 'prevu') =>
    h.raw('syncBooking', { booking: { id: `bk-${userId}-${slotId}-${weekKey}`, slotId, userId, userName: userId, weekKey, status } });

test('sans jeton valide : unauthenticated sur les deux actions', () => {
    const h = fresh();
    const other = h.ctx.createSessionToken('t2');
    for (const action of ['addMemberBookings', 'removeMemberBooking']) {
        assert.equal(plain(h.raw(action, { requesterId: 'c4' })).code, 'unauthenticated', action);
        assert.equal(plain(h.raw(action, { requesterId: 'c4', token: other })).code, 'unauthenticated', action);
    }
    assert.equal(rows(h).length, 0);
});

test('un tuteur ne peut ni ajouter ni retirer', () => {
    const h = fresh();
    assert.equal(addTo(h, 't1', 'slot-4-lun', '2026-W46', ['t2']).code, 'forbidden');
    book(h, 't2', 'slot-4-lun', '2026-W46');
    assert.equal(remove(h, 't1', 'bk-t2-slot-4-lun-2026-W46').code, 'forbidden');
    assert.equal(rows(h).length, 1);
});

test('un chef de projet place plusieurs membres sur un créneau à venir : ils sont prévus, avec leur nom du Sheet', () => {
    const h = fresh();
    const out = addTo(h, 'c4', 'slot-4-lun', '2026-W46', ['t1', 't2']);
    assert.equal(out.success, true);
    assert.equal(out.added, 2);
    assert.equal(out.already, 0);
    const r = rowOf(h, 't1', 'slot-4-lun', '2026-W46');
    assert.equal(r[3], 'Tuteur Un');
    assert.equal(r[5], 'prevu');
    assert.equal(r[6], '');
    assert.match(r[0], /^bk-/);
});

test('créneau passé : présent directement, validé par le responsable ; aujourd hui ou futur : prévu', () => {
    const h = fresh();
    assert.equal(addTo(h, 'c4', 'slot-4-lun', '2026-W44', ['t1']).success, true); // 26 octobre
    const past = rowOf(h, 't1', 'slot-4-lun', '2026-W44');
    assert.equal(past[5], 'confirme');
    assert.equal(past[6], 'c4');
    assert.match(String(past[7]), /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(addTo(h, 'c4', 'slot-4-lun', '2026-W45', ['t1']).success, true); // aujourd'hui 2 novembre
    assert.equal(rowOf(h, 't1', 'slot-4-lun', '2026-W45')[5], 'prevu');
    assert.equal(addTo(h, 'c4', 'slot-4-mar', '2026-W45', ['t1']).success, true); // demain
    assert.equal(rowOf(h, 't1', 'slot-4-mar', '2026-W45')[5], 'prevu');
});

test('un chef de projet est refusé hors de ses projets, le Bureau peut partout', () => {
    const h = fresh();
    assert.equal(addTo(h, 'c4', 'slot-7-lun', '2026-W46', ['t1']).code, 'forbidden');
    assert.equal(addTo(h, 'c9', 'slot-4-lun', '2026-W46', ['t1']).code, 'forbidden');
    assert.equal(rows(h).length, 0);
    assert.equal(addTo(h, 'b1', 'slot-7-lun', '2026-W46', ['t1']).success, true);
    assert.equal(addTo(h, 'c7', 'slot-7-mar', '2026-W46', ['t2']).success, true);
});

test('requêtes invalides : rien n est écrit, même pour une partie de la liste', () => {
    const h = fresh();
    const bad = {
        'créneau mal formé': ['slot-12-lun', '2026-W46', ['t1']],
        'jour inconnu': ['slot-4-dim', '2026-W46', ['t1']],
        'semaine mal formée': ['slot-4-lun', 'demain', ['t1']],
        'semaine inexistante': ['slot-4-lun', '2026-W99', ['t1']],
        'avant la rentrée': ['slot-4-lun', '2026-W36', ['t1']],
        'après l année scolaire': ['slot-4-lun', '2027-W36', ['t1']],
        'liste vide': ['slot-4-lun', '2026-W46', []],
        'liste absente': ['slot-4-lun', '2026-W46', undefined],
        'membre inconnu avec un membre valide': ['slot-4-lun', '2026-W46', ['t1', 'inconnu']],
        'plus de 50 membres': ['slot-4-lun', '2026-W46', Array.from({ length: 51 }, () => 't1')],
    };
    for (const [label, [slotId, weekKey, userIds]] of Object.entries(bad)) {
        assert.equal(addTo(h, 'b1', slotId, weekKey, userIds).code, 'invalid', label);
    }
    assert.equal(rows(h).length, 0);
    // Les limites de l'année scolaire elles-mêmes sont acceptées : mardi 1er septembre et lundi 30 août 2027.
    assert.equal(addTo(h, 'b1', 'slot-4-mar', '2026-W36', ['t1']).success, true);
    assert.equal(addTo(h, 'b1', 'slot-4-lun', '2027-W35', ['t1']).success, true);
});

test('un membre déjà sur le créneau n est pas dupliqué (double clic compris)', () => {
    const h = fresh();
    addTo(h, 'c4', 'slot-4-lun', '2026-W46', ['t1']);
    const again = addTo(h, 'c4', 'slot-4-lun', '2026-W46', ['t1', 't2', 't2']);
    assert.equal(again.added, 1);
    assert.equal(again.already, 1);
    assert.equal(rows(h).length, 2);
});

test('un membre déjà présent ou absent garde son statut ; une réservation annulée est réactivée', () => {
    const h = fresh();
    book(h, 't1', 'slot-4-lun', '2026-W44', 'absent');
    book(h, 't2', 'slot-4-lun', '2026-W44', 'annule');
    book(h, 't3', 'slot-4-lun', '2026-W44', 'prevu');
    const out = addTo(h, 'c4', 'slot-4-lun', '2026-W44', ['t1', 't2', 't3']);
    assert.equal(out.success, true);
    assert.equal(rowOf(h, 't1', 'slot-4-lun', '2026-W44')[5], 'absent');
    assert.equal(rowOf(h, 't2', 'slot-4-lun', '2026-W44')[5], 'confirme');
    assert.equal(rowOf(h, 't3', 'slot-4-lun', '2026-W44')[5], 'confirme');
    assert.equal(rowOf(h, 't3', 'slot-4-lun', '2026-W44')[6], 'c4');
    assert.equal(rows(h).length, 3);
    assert.equal(out.already, 1);
    assert.equal(out.added + out.updated, 2);
});

test('retirer : un chef de projet sur ses créneaux, le Bureau partout, id inconnu refusé', () => {
    const h = fresh();
    addTo(h, 'c4', 'slot-4-lun', '2026-W46', ['t1']);
    addTo(h, 'b1', 'slot-7-lun', '2026-W46', ['t2']);
    const own = rowOf(h, 't1', 'slot-4-lun', '2026-W46')[0];
    const other = rowOf(h, 't2', 'slot-7-lun', '2026-W46')[0];
    assert.equal(remove(h, 'c4', other).code, 'forbidden');
    assert.equal(remove(h, 'c4', 'bk-inconnu').code, 'invalid');
    assert.equal(rows(h).length, 2);
    assert.equal(remove(h, 'c4', own).success, true);
    assert.equal(rows(h).length, 1);
    assert.equal(remove(h, 'b1', other).success, true);
    assert.equal(rows(h).length, 0);
});

test('retirer une présence déjà validée est possible : les heures disparaissent avec la ligne', () => {
    const h = fresh();
    addTo(h, 'c4', 'slot-4-lun', '2026-W44', ['t1']);
    assert.equal(rowOf(h, 't1', 'slot-4-lun', '2026-W44')[5], 'confirme');
    assert.equal(remove(h, 'c4', rowOf(h, 't1', 'slot-4-lun', '2026-W44')[0]).success, true);
    assert.equal(rows(h).length, 0);
});

test('le Bureau peut retirer une réservation ancienne dont l identifiant de créneau n a pas la forme attendue', () => {
    const h = fresh();
    h.raw('syncBooking', { booking: { id: 'bk-old', slotId: 'ancien-creneau', userId: 't1', userName: 'T', weekKey: '2026-W44', status: 'prevu' } });
    assert.equal(remove(h, 'c4', 'bk-old').code, 'forbidden');
    assert.equal(remove(h, 'b1', 'bk-old').success, true);
    assert.equal(rows(h).length, 0);
});
