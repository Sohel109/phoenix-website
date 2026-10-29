import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGouterData } from '../src/data/gouterResponse.ts';

const slots = Array.from({ length: 10 }, (_, i) => ({ hour: 9 + i, users: i === 1 ? [{ userId: 't1', name: 'Tuteur Un' }] : [] }));
const GOUTER = {
    id: 'g3fa91c2',
    projectId: 4,
    date: '2026-11-14',
    note: 'Cour A',
    isPast: false,
    canManage: true,
    slots,
    items: [{ id: 'a1b2c3d4', item: 'Gâteau au chocolat', userId: 't1', name: 'Tuteur Un', canRemove: true }],
};
const VALID = { success: true, isBureau: false, schoolYear: '2026-2027', manageableProjects: [4], gouters: [GOUTER] };

test('parseGouterData accepte une vraie réponse getGouters', () => {
    assert.equal(parseGouterData(VALID)?.gouters[0].id, 'g3fa91c2');
});

test('parseGouterData accepte une liste vide et aucun projet gérable', () => {
    assert.deepEqual(parseGouterData({ ...VALID, manageableProjects: [], gouters: [] })?.gouters, []);
});

test('parseGouterData rejette la réponse de connexion d\'un ancien script (pas encore redéployé)', () => {
    assert.equal(parseGouterData({ success: true, user: { id: '1', name: 'X', role: 'tuteur' } }), null);
});

test('parseGouterData rejette "Identifiants incorrects", null et les types inattendus', () => {
    assert.equal(parseGouterData({ success: false, message: 'Identifiants incorrects' }), null);
    assert.equal(parseGouterData(null), null);
    assert.equal(parseGouterData('ok'), null);
    assert.equal(parseGouterData({ ...VALID, gouters: 'x' }), null);
    assert.equal(parseGouterData({ ...VALID, manageableProjects: 'x' }), null);
    assert.equal(parseGouterData({ ...VALID, isBureau: 'true' }), null);
    assert.equal(parseGouterData({ ...VALID, schoolYear: 2026 }), null);
});

test('parseGouterData rejette un goûter mal formé', () => {
    const bad = (patch) => parseGouterData({ ...VALID, gouters: [{ ...GOUTER, ...patch }] });
    assert.equal(bad({ slots: undefined }), null);
    assert.equal(bad({ slots: [{ hour: '9', users: [] }] }), null);
    assert.equal(bad({ slots: [{ hour: 9 }] }), null);
    assert.equal(bad({ items: [{ id: 'a1', item: 'x' }] }), null);
    assert.equal(bad({ projectId: '4' }), null);
    assert.equal(bad({ date: 20261114 }), null);
    assert.equal(bad({ isPast: 'non' }), null);
    assert.equal(bad({ canManage: undefined }), null);
});
