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
];
const TODAY = '2026-11-02';
const fresh = () => loadScript({ users: USERS, now: TODAY });
const plain = (x) => JSON.parse(JSON.stringify(x));

const FORD = { projectId: 7, date: '2026-11-25', startTime: '14:00', endTime: '16:00' };
const add = (h, requesterId, input = FORD) => plain(h.call('addSession', { requesterId, ...input }));
const cancel = (h, requesterId, slotId, weekKey) => plain(h.call('cancelSession', { requesterId, slotId, weekKey }));
const restore = (h, requesterId, slotId, weekKey) => plain(h.call('restoreSession', { requesterId, slotId, weekKey }));
const seances = (h) => (h.sheet('Seances') ?? []).slice(1);
const bookingRows = (h) => (h.sheet('Bookings') ?? []).slice(1);
const book = (h, userId, slotId, weekKey, status = 'prevu') =>
    h.raw('syncBooking', { booking: { id: `bk-${userId}-${slotId}-${weekKey}`, slotId, userId, userName: userId, weekKey, status } });
const statusOf = (h, userId, slotId, weekKey) => bookingRows(h).find((r) => r[2] === userId && r[1] === slotId && r[4] === weekKey)?.[5];

test('sans jeton ou avec le jeton d un autre compte : unauthenticated, rien d écrit', () => {
    const h = fresh();
    const other = h.ctx.createSessionToken('t2');
    for (const action of ['addSession', 'cancelSession', 'restoreSession']) {
        assert.equal(plain(h.raw(action, { requesterId: 'b1', ...FORD })).code, 'unauthenticated', action);
        assert.equal(plain(h.raw(action, { requesterId: 'b1', token: other, ...FORD })).code, 'unauthenticated', action);
    }
    assert.equal(seances(h).length, 0);
});

test('droits : tuteur, chef hors de son projet et chef sans projet refusés ; Bureau et chef du projet acceptés', () => {
    const h = fresh();
    assert.equal(add(h, 't1').code, 'forbidden');
    assert.equal(add(h, 'c4').code, 'forbidden');
    assert.equal(add(h, 'c9').code, 'forbidden');
    assert.equal(seances(h).length, 0);
    assert.equal(add(h, 'b1').success, true);
    assert.equal(add(h, 'c7', { ...FORD, date: '2026-12-02' }).success, true);
    assert.equal(seances(h).length, 2);
});

test('ajout valide : identifiant de séance, ligne dans Seances, lu par getPlanningData', () => {
    const h = fresh();
    const out = add(h, 'c7');
    assert.equal(out.success, true);
    assert.match(out.slotId, /^slot-7-mer-s[0-9a-f]{7}$/);
    const [row] = seances(h);
    assert.deepEqual([row[1], row[2], row[3], row[4], row[5], row[6], row[7]], ['ajout', 7, '2026-11-25', '14:00', '16:00', out.slotId, 'c7']);
    const changes = plain(h.ctx.getPlanningDataInternal()).sessionChanges;
    assert.equal(changes.length, 1);
    assert.deepEqual(changes[0], { id: out.id, kind: 'ajout', projectId: 7, date: '2026-11-25', startTime: '14:00', endTime: '16:00', slotId: out.slotId });
});

test('getPlanningData sans feuille Seances : tableau vide, sans créer la feuille', () => {
    const h = fresh();
    assert.deepEqual(plain(h.ctx.getPlanningDataInternal()).sessionChanges, []);
    assert.equal(h.sheet('Seances'), null);
});

test('ajouts refusés : dates et heures impossibles, projet inconnu, aucune ligne écrite', () => {
    const h = fresh();
    const bad = [
        { date: '2026-11-29' }, { date: '2026-02-30' }, { date: 'abc' }, { date: '2027-09-01' }, { date: '2026-08-31' },
        { startTime: '9:00' }, { startTime: '06:30' }, { endTime: '22:30' }, { endTime: '24:00' }, { startTime: '14:03' },
        { startTime: '16:00', endTime: '14:00' }, { startTime: '14:00', endTime: '14:00' }, { projectId: 99 }, { projectId: 'x' },
    ];
    for (const patch of bad) {
        const out = add(h, 'b1', { ...FORD, ...patch });
        assert.equal(out.success, false, JSON.stringify(patch));
        assert.equal(out.code, 'invalid', JSON.stringify(patch));
    }
    assert.equal(seances(h).length, 0);
});

test('une date passée de l année scolaire est permise', () => {
    const h = fresh();
    assert.equal(add(h, 'b1', { ...FORD, date: '2026-10-14' }).success, true);
});

test('même séance deux fois : conflict, une seule ligne', () => {
    const h = fresh();
    assert.equal(add(h, 'c7').success, true);
    assert.equal(add(h, 'c7').code, 'conflict');
    assert.equal(seances(h).length, 1);
});

test('l identifiant d une séance ajoutée est lu par le reste du serveur', () => {
    const h = fresh();
    const { slotId } = add(h, 'c7');
    assert.equal(h.ctx.sessionDateKey('2026-W48', slotId), '2026-11-25');
    const out = plain(h.call('addMemberBookings', { requesterId: 'c7', slotId, weekKey: '2026-W48', userIds: ['t1'] }));
    assert.equal(out.success, true);
    assert.equal(statusOf(h, 't1', slotId, '2026-W48'), 'prevu');
});

test('annuler une séance régulière : ligne annulation à la bonne date, deuxième fois en conflict', () => {
    const h = fresh();
    const out = cancel(h, 'c7', 'slot-7-mer', '2026-W49');
    assert.equal(out.success, true);
    const [row] = seances(h);
    assert.deepEqual([row[1], row[2], row[3], row[6]], ['annulation', 7, '2026-12-02', 'slot-7-mer']);
    assert.equal(cancel(h, 'c7', 'slot-7-mer', '2026-W49').code, 'conflict');
    assert.equal(seances(h).length, 1);
});

test('annuler : droits et entrées invalides', () => {
    const h = fresh();
    assert.equal(cancel(h, 'c4', 'slot-7-mer', '2026-W49').code, 'forbidden');
    assert.equal(cancel(h, 't1', 'slot-7-mer', '2026-W49').code, 'forbidden');
    assert.equal(cancel(h, 'b1', 'slot-7-mer', '2026-W99').code, 'invalid');
    assert.equal(cancel(h, 'b1', 'slot-99-mer', '2026-W49').code, 'invalid');
    assert.equal(cancel(h, 'b1', 'n-importe-quoi', '2026-W49').code, 'invalid');
    assert.equal(cancel(h, 'b1', 'slot-7-mer-sabcdef0', '2026-W49').code, 'invalid'); // séance ajoutée inexistante
    assert.equal(seances(h).length, 0);
});

test('annuler passe les réservations prevu à annule', () => {
    const h = fresh();
    book(h, 't1', 'slot-7-mer', '2026-W49');
    book(h, 't2', 'slot-7-mer', '2026-W50'); // autre semaine, intacte
    const out = cancel(h, 'c7', 'slot-7-mer', '2026-W49');
    assert.equal(out.cancelled, 1);
    assert.equal(statusOf(h, 't1', 'slot-7-mer', '2026-W49'), 'annule');
    assert.equal(statusOf(h, 't2', 'slot-7-mer', '2026-W50'), 'prevu');
});

test('annuler est refusé si une présence est déjà validée, rien ne change', () => {
    for (const status of ['confirme', 'absent']) {
        const h = fresh();
        book(h, 't1', 'slot-7-mer', '2026-W49', 'prevu');
        book(h, 't2', 'slot-7-mer', '2026-W49', status);
        const out = cancel(h, 'c7', 'slot-7-mer', '2026-W49');
        assert.equal(out.code, 'conflict', status);
        assert.equal(statusOf(h, 't1', 'slot-7-mer', '2026-W49'), 'prevu', status);
        assert.equal(seances(h).length, 0, status);
    }
});

test('annuler une séance ajoutée supprime sa ligne et annule ses réservations prevu', () => {
    const h = fresh();
    const { slotId } = add(h, 'c7');
    book(h, 't1', slotId, '2026-W48');
    const out = cancel(h, 'c7', slotId, '2026-W48');
    assert.equal(out.success, true);
    assert.equal(seances(h).length, 0);
    assert.equal(statusOf(h, 't1', slotId, '2026-W48'), 'annule');
});

test('annuler une séance ajoutée avec une semaine qui ne correspond pas à sa date : invalid', () => {
    const h = fresh();
    const { slotId } = add(h, 'c7');
    assert.equal(cancel(h, 'c7', slotId, '2026-W49').code, 'invalid');
    assert.equal(seances(h).length, 1);
});

test('rétablir supprime l annulation ; sur une séance non annulée : invalid', () => {
    const h = fresh();
    assert.equal(restore(h, 'c7', 'slot-7-mer', '2026-W49').code, 'invalid');
    cancel(h, 'c7', 'slot-7-mer', '2026-W49');
    assert.equal(restore(h, 'c4', 'slot-7-mer', '2026-W49').code, 'forbidden');
    assert.equal(seances(h).length, 1);
    assert.equal(restore(h, 'c7', 'slot-7-mer', '2026-W49').success, true);
    assert.equal(seances(h).length, 0);
});

test('un identifiant de séance ajoutée est accepté par parseSlotId, pas un suffixe invalide', () => {
    const h = fresh();
    assert.equal(h.ctx.parseSlotId('slot-7-mer-s1a2b3c4').projectId, 7);
    assert.equal(h.ctx.parseSlotId('slot-7-mer-s1a2b3c4').dayIndex, 2);
    assert.equal(h.ctx.parseSlotId('slot-7-mer-'), null);
    assert.equal(h.ctx.parseSlotId('slot-7-mer-S1A2B3C4'), null);
    assert.equal(h.ctx.parseSlotId('slot-7-dim-s1a2b3c4'), null);
});

test('semaine à cheval sur deux années : même semaine côté serveur', () => {
    const h = fresh();
    const out = add(h, 'b1', { ...FORD, date: '2027-01-01' }); // vendredi, 2026-W53
    assert.equal(out.success, true);
    assert.equal(h.ctx.sessionDateKey('2026-W53', out.slotId), '2027-01-01');
});

test('un créneau régulier du samedi (« sam ») n est pas pris pour une séance ajoutée', () => {
    const h = fresh();
    const out = cancel(h, 'b1', 'slot-2-sam', '2026-W49');
    assert.equal(out.success, true);
    const [row] = seances(h);
    assert.deepEqual([row[1], row[2], row[3], row[6]], ['annulation', 2, '2026-12-05', 'slot-2-sam']);
    assert.equal(restore(h, 'b1', 'slot-2-sam', '2026-W49').success, true);
    assert.equal(seances(h).length, 0);
});
