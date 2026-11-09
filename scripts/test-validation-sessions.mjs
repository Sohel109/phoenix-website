import test from 'node:test';
import assert from 'node:assert/strict';
import { groupValidationSessions } from '../src/data/validationSessions.ts';

const SLOTS = [
    { id: 'slot-4-mar', projectId: 4, day: 'Mardi', startTime: '18:00', endTime: '19:30' },
    { id: 'slot-4-jeu', projectId: 4, day: 'Jeudi', startTime: '18:00', endTime: '19:30' },
    { id: 'slot-2-sam', projectId: 2, day: 'Samedi', startTime: '14:00', endTime: '17:30' },
    { id: 'slot-9-jeu', projectId: 9, day: 'Jeudi', startTime: '16:00', endTime: '18:30' },
];
const NAMES = { 2: 'ACSE', 4: 'St Gabriel', 9: "Roy d'Espagne" };
const W = '2026-W46';
const b = (id, slotId, userName, status = 'prevu', weekKey = W) => ({ id, slotId, userId: id, userName, weekKey, status });
const run = (bookings, over = {}) => groupValidationSessions({ bookings, slots: SLOTS, weekKey: W, projectNames: NAMES, ...over });

test('une séance par créneau avec réservations, membres triés par nom, compteurs justes', () => {
    const s = run([
        b('1', 'slot-4-mar', 'Zoé'), b('2', 'slot-4-mar', 'Alice', 'confirme'), b('3', 'slot-4-mar', 'Max', 'absent'),
    ]);
    assert.equal(s.length, 1);
    assert.deepEqual(s[0].members.map((m) => m.userName), ['Alice', 'Max', 'Zoé']);
    assert.deepEqual(s[0].counts, { prevu: 1, confirme: 1, absent: 1 });
    assert.equal(s[0].projectName, 'St Gabriel');
    assert.equal(s[0].pendingIds.length, 1);
});

test('ignore les réservations annulées, les autres semaines et les créneaux hors liste', () => {
    const s = run([
        b('1', 'slot-4-mar', 'A', 'annule'), b('2', 'slot-4-jeu', 'B', 'prevu', '2026-W45'), b('3', 'slot-99-lun', 'C'),
    ]);
    assert.deepEqual(s, []);
});

test('les séances avec des présences à valider passent avant les séances terminées', () => {
    const s = run([
        b('1', 'slot-2-sam', 'A', 'confirme'),
        b('2', 'slot-9-jeu', 'B', 'prevu'),
        b('3', 'slot-4-mar', 'C', 'prevu'),
    ]);
    assert.deepEqual(s.map((x) => x.slotId), ['slot-9-jeu', 'slot-4-mar', 'slot-2-sam']);
    assert.equal(s[2].done, true);
    assert.equal(s[0].done, false);
    assert.equal(s[1].done, false);
});

test('à égalité, tri par projet, puis jour, puis heure', () => {
    const s = run([
        b('1', 'slot-4-jeu', 'A'), b('2', 'slot-4-mar', 'B'), b('3', 'slot-2-sam', 'C'),
    ]);
    assert.deepEqual(s.map((x) => x.slotId), ['slot-2-sam', 'slot-4-mar', 'slot-4-jeu']);
});

test('nom absent : on retombe sur l identifiant', () => {
    const s = run([{ id: '1', slotId: 'slot-4-mar', userId: 'u1', weekKey: W, status: 'prevu' }]);
    assert.equal(s[0].members[0].userName, 'u1');
});
