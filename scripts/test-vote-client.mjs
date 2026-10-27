import test from 'node:test';
import assert from 'node:assert/strict';
import { parseVoteData, createLatestGate } from '../src/data/voteResponse.ts';

const VALID = {
    success: true,
    monthKey: '2026-10',
    isOpen: true,
    opensOn: '2026-10-25',
    closesOn: '2026-10-31',
    nextOpensOn: '2026-11-24',
    candidates: [{ id: 'a1', name: 'Alice' }],
    myVote: null,
    winner: null,
};

test('parseVoteData accepte une vraie réponse getVoteData', () => {
    assert.equal(parseVoteData(VALID)?.monthKey, '2026-10');
});

test('parseVoteData rejette la réponse de connexion d\'un ancien script (pas encore redéployé)', () => {
    assert.equal(parseVoteData({ success: true, user: { id: '1', name: 'X', role: 'tuteur' } }), null);
});

test('parseVoteData rejette "Identifiants incorrects", null et les types inattendus', () => {
    assert.equal(parseVoteData({ success: false, message: 'Identifiants incorrects' }), null);
    assert.equal(parseVoteData(null), null);
    assert.equal(parseVoteData('ok'), null);
    assert.equal(parseVoteData({ ...VALID, candidates: 'a1' }), null);
    assert.equal(parseVoteData({ ...VALID, isOpen: 'true' }), null);
});

test('createLatestGate : seule la dernière requête lancée est considérée comme à jour', () => {
    const gate = createLatestGate();
    const first = gate.next();
    const second = gate.next();
    assert.equal(gate.isLatest(first), false);
    assert.equal(gate.isLatest(second), true);
});
