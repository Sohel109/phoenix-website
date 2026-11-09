import test from 'node:test';
import assert from 'node:assert/strict';
import {
    weekKeyOfDate, dayOfDate, parseSessionChanges, extraSlots, slotsForWeek, cancelledForWeek, findSlot,
} from '../src/data/sessionCalendar.ts';

const REGULAR = [
    { id: 'slot-7-mer', projectId: 7, day: 'Mercredi', startTime: '14:00', endTime: '16:30' },
    { id: 'slot-4-mar', projectId: 4, day: 'Mardi', startTime: '18:00', endTime: '19:30' },
];
// Jules Ferry : pas de séance régulière en 2026-W48
const isActive = (id, wk) => !(id === 'slot-7-mer' && wk === '2026-W48');
const ADD = { id: 'sab12cd', kind: 'ajout', projectId: 7, date: '2026-11-25', startTime: '14:00', endTime: '16:00', slotId: 'slot-7-mer-sab12cd' };
const CANCEL = { id: 'sc1', kind: 'annulation', projectId: 4, date: '2026-12-01', startTime: '', endTime: '', slotId: 'slot-4-mar' };
const ids = (slots) => slots.map((s) => s.id);

test('weekKeyOfDate suit la semaine ISO, y compris au changement d année', () => {
    assert.equal(weekKeyOfDate('2026-11-25'), '2026-W48');
    assert.equal(weekKeyOfDate('2026-12-28'), '2026-W53');
    assert.equal(weekKeyOfDate('2027-01-01'), '2026-W53');
    assert.equal(weekKeyOfDate('2027-01-04'), '2027-W01');
});

test('weekKeyOfDate et dayOfDate refusent les dates impossibles', () => {
    for (const bad of ['2026-02-30', 'abc', '', '2026-13-01', '2026-1-5']) {
        assert.equal(weekKeyOfDate(bad), null, bad);
        assert.equal(dayOfDate(bad), null, bad);
    }
});

test('dayOfDate : jour de la semaine, null le dimanche', () => {
    assert.equal(dayOfDate('2026-11-25'), 'Mercredi');
    assert.equal(dayOfDate('2026-11-28'), 'Samedi');
    assert.equal(dayOfDate('2026-11-29'), null);
});

test('sans exception : l alternance décide', () => {
    assert.deepEqual(ids(slotsForWeek(REGULAR, [], '2026-W48', isActive)), ['slot-4-mar']);
    assert.deepEqual(ids(slotsForWeek(REGULAR, [], '2026-W49', isActive)), ['slot-7-mer', 'slot-4-mar']);
});

test('une séance ajoutée apparaît dans la semaine de sa date seulement', () => {
    const w48 = slotsForWeek(REGULAR, [ADD], '2026-W48', isActive);
    const added = w48.find((s) => s.id === 'slot-7-mer-sab12cd');
    assert.ok(added);
    assert.equal(added.day, 'Mercredi');
    assert.equal(added.startTime, '14:00');
    assert.equal(added.endTime, '16:00');
    assert.equal(added.projectId, 7);
    assert.equal(added.date, '2026-11-25');
    assert.equal(slotsForWeek(REGULAR, [ADD], '2026-W49', isActive).some((s) => s.id === 'slot-7-mer-sab12cd'), false);
});

test('une annulation retire la séance régulière de cette semaine seulement', () => {
    assert.deepEqual(ids(slotsForWeek(REGULAR, [CANCEL], '2026-W49', isActive)), ['slot-7-mer']);
    assert.deepEqual(ids(slotsForWeek(REGULAR, [CANCEL], '2026-W50', isActive)), ['slot-7-mer', 'slot-4-mar']);
    assert.equal(cancelledForWeek(REGULAR, [CANCEL], '2026-W49', isActive).length, 1);
    assert.equal(cancelledForWeek(REGULAR, [CANCEL], '2026-W49', isActive)[0].slot.id, 'slot-4-mar');
    assert.equal(cancelledForWeek(REGULAR, [CANCEL], '2026-W49', isActive)[0].change.id, 'sc1');
    assert.deepEqual(cancelledForWeek(REGULAR, [CANCEL], '2026-W48', isActive), []);
});

test('une annulation visant une semaine sans séance régulière est ignorée dans la liste des annulées', () => {
    const offWeek = { ...CANCEL, id: 'sc2', projectId: 7, date: '2026-11-25', slotId: 'slot-7-mer' };
    assert.deepEqual(cancelledForWeek(REGULAR, [offWeek], '2026-W48', isActive), []);
});

test('findSlot retrouve une séance régulière ou ajoutée', () => {
    assert.equal(findSlot(REGULAR, [ADD], 'slot-7-mer-sab12cd').endTime, '16:00');
    assert.equal(findSlot(REGULAR, [ADD], 'slot-4-mar').startTime, '18:00');
    assert.equal(findSlot(REGULAR, [ADD], 'slot-99-lun'), undefined);
});

test('extraSlots ignore les ajouts tombant un dimanche ou sur une date invalide', () => {
    const sunday = { ...ADD, id: 'x1', date: '2026-11-29', slotId: 'slot-7-lun-x1abcde' };
    const broken = { ...ADD, id: 'x2', date: 'abc', slotId: 'slot-7-lun-x2abcde' };
    assert.deepEqual(ids(extraSlots([sunday, broken, ADD])), ['slot-7-mer-sab12cd']);
});

test('parseSessionChanges est défensif', () => {
    assert.deepEqual(parseSessionChanges(undefined), []);
    assert.deepEqual(parseSessionChanges('x'), []);
    assert.deepEqual(parseSessionChanges([null, 3, { kind: 'autre' }, { ...ADD, date: '2026-02-30' }]), []);
    assert.deepEqual(parseSessionChanges([ADD, CANCEL]), [ADD, CANCEL]);
    assert.equal(parseSessionChanges([{ ...ADD, projectId: '7' }])[0].projectId, 7);
});
