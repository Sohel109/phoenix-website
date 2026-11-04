import test from 'node:test';
import assert from 'node:assert/strict';
import { computeRecap, describeRecapFilter } from '../src/data/recapHours.ts';

// Deux créneaux de 2 h : un du projet 2, un du projet 4. Les semaines sont des dates (weekStart les lit telles quelles).
const SLOTS = [
    { id: 'slot-2-lundi', projectId: 2 },
    { id: 'slot-4-mardi', projectId: 4 },
];
const USERS = [
    { id: 'a', name: 'Alice\t' },
    { id: 'b', name: 'Bruno' },
    { id: 'c', name: 'Chloé' },
];
const booking = (userId, slotId, weekKey, status = 'confirme') => ({ userId, userName: userId.toUpperCase(), slotId, weekKey, status });
const BOOKINGS = [
    booking('a', 'slot-2-lundi', '2026-09-14'),
    booking('b', 'slot-4-mardi', '2026-10-12'),
    booking('b', 'slot-2-lundi', '2026-10-12', 'prevu'),
];
const HOURS = [
    { id: 'h1', userId: 'c', userName: 'Chloé', hours: 3, projectId: 2, createdAt: '2026-09-20T10:00:00.000Z' },
    { id: 'h2', userId: 'c', userName: 'Chloé', hours: 5, createdAt: '2026-10-15T10:00:00.000Z' },
];
const ALL = { type: 'all', week: '', month: 0, year: 2026, projectId: 'all' };
const base = {
    bookings: BOOKINGS,
    manualHours: HOURS,
    slots: SLOTS,
    allUsers: USERS,
    includeZero: false,
    weekStart: (key) => new Date(key),
    duration: () => 2,
};
const run = (filter, extra = {}) => computeRecap({ ...base, filter: { ...ALL, ...filter }, ...extra });
const ids = (list) => list.map((m) => m.id);

test('sans filtre : les heures confirmées et les heures manuelles sont additionnées, triées par heures puis par nom', () => {
    const list = run({});
    assert.deepEqual(ids(list), ['c', 'a', 'b']);
    assert.equal(list.find((m) => m.id === 'c').totalHours, 8);
    assert.equal(list.find((m) => m.id === 'c').manualHoursCount, 8);
    assert.equal(list.find((m) => m.id === 'b').totalHours, 2, 'une réservation seulement prévue ne compte pas');
});

test('les membres sans heure dans la sélection sont absents par défaut, présents si on le demande', () => {
    assert.deepEqual(ids(run({ projectId: 4 })), ['b']);
    const withZero = run({ projectId: 4 }, { includeZero: true });
    assert.deepEqual(new Set(ids(withZero)), new Set(['a', 'b', 'c']));
    assert.equal(withZero.find((m) => m.id === 'a').totalHours, 0);
    assert.equal(withZero.find((m) => m.id === 'a').name, 'Alice', 'tabulation retirée du nom');
});

test('le filtre de projet s\'applique aussi aux heures manuelles : autre projet et mission générale exclus', () => {
    const p2 = run({ projectId: 2 });
    assert.deepEqual(ids(p2), ['c', 'a']);
    assert.equal(p2.find((m) => m.id === 'c').totalHours, 3);
    assert.deepEqual(p2.find((m) => m.id === 'c').byProject, { 2: 3 });
    assert.deepEqual(ids(run({ projectId: 4 })), ['b'], 'les heures de Chloé ne sont pas du projet 4');
});

test('le filtre de période s\'applique aux heures manuelles d\'après leur date d\'attribution', () => {
    const sept = run({ type: 'month', month: 8, year: 2026 });
    assert.deepEqual(ids(sept), ['c', 'a']);
    assert.equal(sept.find((m) => m.id === 'c').totalHours, 3);
    const oct = run({ type: 'month', month: 9, year: 2026 });
    assert.equal(oct.find((m) => m.id === 'c').totalHours, 5);
    assert.deepEqual(ids(run({ type: 'year', year: 2025 })), []);
    const week = run({ type: 'week', week: '2026-10-12' });
    assert.deepEqual(ids(week), ['c', 'b'], 'la semaine du 12 octobre : la réservation de Bruno et les 5 h du 15 octobre');
});

test('describeRecapFilter résume la sélection en une phrase', () => {
    const labels = { projectName: 'Massa 13', weekLabel: 'Semaine du 12 oct.' };
    assert.equal(describeRecapFilter(ALL, labels), 'Toutes les dates, tous les projets');
    assert.equal(describeRecapFilter({ ...ALL, type: 'month', month: 8, year: 2026 }, labels), 'Septembre 2026, tous les projets');
    assert.equal(describeRecapFilter({ ...ALL, type: 'year', year: 2026, projectId: 4 }, labels), 'Année 2026, Massa 13');
    assert.equal(describeRecapFilter({ ...ALL, type: 'week', week: 'x' }, labels), 'Semaine du 12 oct., tous les projets');
});
