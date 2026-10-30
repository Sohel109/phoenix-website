import test from 'node:test';
import assert from 'node:assert/strict';
import { parseManualHoursData, parseExemptionsData, parseImportResult } from '../src/data/hoursResponse.ts';
import { projectIdOfSlot, eligibleMemberIds, canDeleteManualHour } from '../src/data/manualHoursRules.ts';

const ENTRY = {
    id: 'h3fa91c2',
    userId: 't1',
    userName: 'Tuteur Un',
    hours: 2.5,
    reason: 'Préparation des supports',
    grantedBy: 'Chef Quatre',
    grantedById: 'c4',
    createdAt: '2026-10-30T09:00:00.000Z',
    projectId: 4,
};
const HOURS = { success: true, isBureau: false, manageableProjects: [4], manualHours: [ENTRY] };
const EXEMPTIONS = {
    success: true,
    exemptions: [{ userId: 't1', userName: 'Tuteur Un', grantedBy: 'Bureau', grantedAt: '2026-09-15T10:00:00.000Z', year: '2024-2025', note: '' }],
};

test('parseManualHoursData accepte une vraie réponse, avec ou sans projet', () => {
    assert.equal(parseManualHoursData(HOURS)?.manualHours[0].id, 'h3fa91c2');
    const general = { ...ENTRY };
    delete general.projectId;
    assert.equal(parseManualHoursData({ ...HOURS, manualHours: [general] })?.manualHours[0].projectId, undefined);
    assert.deepEqual(parseManualHoursData({ ...HOURS, manageableProjects: [], manualHours: [] })?.manualHours, []);
});

test('parseManualHoursData rejette une réponse de connexion, une erreur, null et les types inattendus', () => {
    assert.equal(parseManualHoursData({ success: true, user: { id: '1', name: 'X', role: 'tuteur' } }), null);
    assert.equal(parseManualHoursData({ success: false, message: 'Identifiants incorrects' }), null);
    assert.equal(parseManualHoursData(null), null);
    assert.equal(parseManualHoursData('ok'), null);
    assert.equal(parseManualHoursData({ ...HOURS, isBureau: 'non' }), null);
    assert.equal(parseManualHoursData({ ...HOURS, manageableProjects: 'x' }), null);
    assert.equal(parseManualHoursData({ ...HOURS, manualHours: [{ ...ENTRY, hours: '2' }] }), null);
    assert.equal(parseManualHoursData({ ...HOURS, manualHours: [{ ...ENTRY, hours: NaN }] }), null);
    assert.equal(parseManualHoursData({ ...HOURS, manualHours: [{ ...ENTRY, projectId: '4' }] }), null);
});

test('parseExemptionsData accepte une vraie réponse et rejette le reste', () => {
    assert.equal(parseExemptionsData(EXEMPTIONS)?.exemptions[0].userId, 't1');
    assert.deepEqual(parseExemptionsData({ success: true, exemptions: [] })?.exemptions, []);
    assert.equal(parseExemptionsData({ success: false }), null);
    assert.equal(parseExemptionsData({ success: true, exemptions: [{ userId: 1 }] }), null);
    assert.equal(parseExemptionsData(null), null);
});

test('parseImportResult lit imported et ignored, rejette le reste', () => {
    assert.deepEqual(parseImportResult({ success: true, imported: 3, ignored: 1 }), { imported: 3, ignored: 1 });
    assert.equal(parseImportResult({ success: true, imported: '3', ignored: 1 }), null);
    assert.equal(parseImportResult({ success: false, imported: 3, ignored: 1 }), null);
    assert.equal(parseImportResult(undefined), null);
});

test('projectIdOfSlot lit le numéro du projet dans l identifiant du créneau', () => {
    assert.equal(projectIdOfSlot('slot-4-jeu'), 4);
    assert.equal(projectIdOfSlot('slot-12-lun'), 12);
    assert.equal(projectIdOfSlot('x'), null);
    assert.equal(projectIdOfSlot(''), null);
    assert.equal(projectIdOfSlot('slot--lun'), null);
});

test('eligibleMemberIds ignore les réservations annulées et celles des autres projets', () => {
    const bookings = [
        { userId: 't1', slotId: 'slot-4-jeu', status: 'confirme' },
        { userId: 't2', slotId: 'slot-4-mar', status: 'prevu' },
        { userId: 't3', slotId: 'slot-4-jeu', status: 'annule' },
        { userId: 't4', slotId: 'slot-7-lun', status: 'confirme' },
        { userId: 't5', slotId: 'bizarre', status: 'confirme' },
    ];
    assert.deepEqual([...eligibleMemberIds(bookings, 4)].sort(), ['t1', 't2']);
    assert.deepEqual([...eligibleMemberIds(bookings, 7)], ['t4']);
    assert.deepEqual([...eligibleMemberIds(bookings, 9)], []);
});

test('canDeleteManualHour : Bureau toujours, chef de projet seulement ses propres attributions sur ses projets', () => {
    const bureau = { id: 'b1', role: 'bureau' };
    const chef = { id: 'c4', role: 'chef_projet' };
    assert.equal(canDeleteManualHour(ENTRY, bureau, []), true);
    assert.equal(canDeleteManualHour(ENTRY, chef, [4]), true);
    assert.equal(canDeleteManualHour(ENTRY, chef, [7]), false);
    assert.equal(canDeleteManualHour({ ...ENTRY, grantedById: 'c7' }, chef, [4]), false);
    assert.equal(canDeleteManualHour({ ...ENTRY, grantedById: undefined }, chef, [4]), false);
    assert.equal(canDeleteManualHour({ ...ENTRY, projectId: undefined }, chef, [4]), false);
    assert.equal(canDeleteManualHour(ENTRY, { id: 't1', role: 'tuteur' }, [4]), false);
});
