import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChildrenData, todayKeyParis, sessionDateKey, isStaleChildrenData } from '../src/data/childrenResponse.ts';

const VALID = {
    success: true,
    isBureau: false,
    projects: [4],
    projectId: 4,
    weekKey: '2026-W44',
    slotId: 'slot-4-jeu',
    children: [{ id: 'ka1b2c3d', name: 'Inès B.' }],
    attendance: { slotId: 'slot-4-jeu', weekKey: '2026-W44', presentIds: ['ka1b2c3d'] },
    doneSlots: ['slot-4-jeu'],
    summary: { schoolYear: '2026-2027', childCount: 1, sessionCount: 1, rate: 100, children: [{ id: 'ka1b2c3d', name: 'Inès B.', sessions: 1, present: 1, rate: 100 }] },
    overview: null,
};

test('parseChildrenData accepte une vraie réponse getChildrenData', () => {
    assert.equal(parseChildrenData(VALID)?.projectId, 4);
});

test('parseChildrenData accepte un compte sans projet', () => {
    const empty = { ...VALID, projects: [], projectId: null, slotId: null, children: [], attendance: null, doneSlots: [], summary: null };
    assert.equal(parseChildrenData(empty)?.projectId, null);
});

test('parseChildrenData accepte la vue d\'ensemble du Bureau', () => {
    const bureau = { ...VALID, isBureau: true, overview: [{ projectId: 4, childCount: 1, sessionCount: 1, rate: 100 }] };
    assert.equal(parseChildrenData(bureau)?.overview?.length, 1);
});

test('parseChildrenData rejette la réponse de connexion d\'un ancien script (pas encore redéployé)', () => {
    assert.equal(parseChildrenData({ success: true, user: { id: '1', name: 'X', role: 'tuteur' } }), null);
});

test('parseChildrenData rejette "Identifiants incorrects", null et les types inattendus', () => {
    assert.equal(parseChildrenData({ success: false, message: 'Identifiants incorrects' }), null);
    assert.equal(parseChildrenData(null), null);
    assert.equal(parseChildrenData('ok'), null);
    assert.equal(parseChildrenData({ ...VALID, children: 'x' }), null);
    assert.equal(parseChildrenData({ ...VALID, projects: 'x' }), null);
    assert.equal(parseChildrenData({ ...VALID, projectId: '4' }), null);
    assert.equal(parseChildrenData({ ...VALID, isBureau: 'true' }), null);
    assert.equal(parseChildrenData({ ...VALID, summary: { children: 'x' } }), null);
    assert.equal(parseChildrenData({ ...VALID, weekKey: 44 }), null);
    assert.equal(parseChildrenData({ ...VALID, slotId: 4 }), null);
    assert.equal(parseChildrenData({ ...VALID, doneSlots: 'slot-4-jeu' }), null);
    assert.equal(parseChildrenData({ ...VALID, attendance: { slotId: 'slot-4-jeu', presentIds: [] } }), null);
});

test('todayKeyParis renvoie une date AAAA-MM-JJ', () => {
    assert.match(todayKeyParis(), /^\d{4}-\d{2}-\d{2}$/);
});

test('I2 : les données sont périmées quand le projet, la semaine ou la séance affichés ne sont plus ceux demandés', () => {
    assert.equal(isStaleChildrenData(null, null, '2026-W44', null), false);
    assert.equal(isStaleChildrenData(VALID, null, '2026-W44', 'slot-4-jeu'), false);
    assert.equal(isStaleChildrenData(VALID, 4, '2026-W44', 'slot-4-jeu'), false);
    assert.equal(isStaleChildrenData(VALID, null, '2026-W43', 'slot-4-jeu'), true);
    assert.equal(isStaleChildrenData(VALID, null, '2026-W44', 'slot-4-mar'), true);
    assert.equal(isStaleChildrenData(VALID, null, '2026-W44', null), true);
    assert.equal(isStaleChildrenData(VALID, 7, '2026-W44', 'slot-4-jeu'), true);
});

test('sessionDateKey donne le jour d\'une séance (0 = lundi) et rejette une semaine invalide', () => {
    assert.equal(sessionDateKey('2026-W44', 3), '2026-10-29');
    assert.equal(sessionDateKey('2026-W44', 5), '2026-10-31');
    assert.equal(sessionDateKey('2026-W01', 0), '2025-12-29');
    assert.equal(sessionDateKey('2026-W53', 4), '2027-01-01');
    assert.equal(sessionDateKey('2025-W53', 0), null);
    assert.equal(sessionDateKey('nope', 0), null);
});
