import test from 'node:test';
import assert from 'node:assert/strict';
import { parseChildrenData, todayKeyParis } from '../src/data/childrenResponse.ts';

const VALID = {
    success: true,
    isBureau: false,
    projects: [4],
    projectId: 4,
    date: '2026-10-29',
    children: [{ id: 'a1b2c3d4', name: 'Inès B.' }],
    attendance: { date: '2026-10-29', presentIds: ['a1b2c3d4'] },
    summary: { schoolYear: '2026-2027', childCount: 1, sessionCount: 1, rate: 100, children: [{ id: 'a1b2c3d4', name: 'Inès B.', sessions: 1, present: 1, rate: 100 }] },
    overview: null,
};

test('parseChildrenData accepte une vraie réponse getChildrenData', () => {
    assert.equal(parseChildrenData(VALID)?.projectId, 4);
});

test('parseChildrenData accepte un compte sans projet', () => {
    const empty = { ...VALID, projects: [], projectId: null, children: [], attendance: null, summary: null };
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
});

test('todayKeyParis renvoie une date AAAA-MM-JJ', () => {
    assert.match(todayKeyParis(), /^\d{4}-\d{2}-\d{2}$/);
});

test('I2 : les données sont périmées quand le projet ou la date affichés ne sont plus ceux demandés', async () => {
    const { isStaleChildrenData } = await import('../src/data/childrenResponse.ts');
    assert.equal(isStaleChildrenData(null, null, '2026-10-29'), false);
    assert.equal(isStaleChildrenData(VALID, null, '2026-10-29'), false);
    assert.equal(isStaleChildrenData(VALID, 4, '2026-10-29'), false);
    assert.equal(isStaleChildrenData(VALID, null, '2026-10-28'), true);
    assert.equal(isStaleChildrenData(VALID, 7, '2026-10-29'), true);
});
