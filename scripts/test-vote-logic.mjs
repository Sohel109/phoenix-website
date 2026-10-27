import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'a1', name: 'Alice', role: 'tuteur' },
    { id: 'b2', name: 'Bob', role: 'tuteur' },
    { id: 'c3', name: 'Chloé', role: 'chef_projet' },
    { id: 'd4', name: 'Dan', role: 'bureau' },
];
const OPEN = '2026-10-27';
const plain = (x) => JSON.parse(JSON.stringify(x));
const fresh = (opts = {}) => loadScript({ users: USERS, now: OPEN, ...opts });

// ─── Fenêtre de vote ──────────────────────────────────────────────────────────

test('voteWindowFor : la veille de l\'ouverture, le mois de référence est le précédent et le vote est fermé', () => {
    const w = plain(fresh().ctx.voteWindowFor('2026-10-24'));
    assert.equal(w.monthKey, '2026-09');
    assert.equal(w.isOpen, false);
    assert.equal(w.nextOpensOn, '2026-10-25');
});

test('voteWindowFor : le 25 octobre le vote s\'ouvre pour octobre jusqu\'au 31', () => {
    const w = plain(fresh().ctx.voteWindowFor('2026-10-25'));
    assert.deepEqual(w, { monthKey: '2026-10', isOpen: true, opensOn: '2026-10-25', closesOn: '2026-10-31', nextOpensOn: '2026-11-24' });
});

test('voteWindowFor : le 3 novembre le vote d\'octobre est fermé et la prochaine ouverture est le 24 novembre', () => {
    const w = plain(fresh().ctx.voteWindowFor('2026-11-03'));
    assert.equal(w.monthKey, '2026-10');
    assert.equal(w.isOpen, false);
    assert.equal(w.opensOn, '2026-10-25');
    assert.equal(w.closesOn, '2026-10-31');
    assert.equal(w.nextOpensOn, '2026-11-24');
});

test('voteWindowFor : novembre (30 jours) ouvre le 24', () => {
    const w = plain(fresh().ctx.voteWindowFor('2026-11-24'));
    assert.deepEqual([w.monthKey, w.isOpen, w.closesOn], ['2026-11', true, '2026-11-30']);
});

test('voteWindowFor : février non bissextile ouvre le 22 et se ferme le 28', () => {
    const open = plain(fresh().ctx.voteWindowFor('2027-02-22'));
    assert.deepEqual([open.isOpen, open.opensOn, open.closesOn], [true, '2027-02-22', '2027-02-28']);
    assert.equal(plain(fresh().ctx.voteWindowFor('2027-02-21')).isOpen, false);
});

test('voteWindowFor : février bissextile ouvre le 23 et se ferme le 29', () => {
    const w = plain(fresh().ctx.voteWindowFor('2028-02-23'));
    assert.deepEqual([w.isOpen, w.opensOn, w.closesOn], [true, '2028-02-23', '2028-02-29']);
});

test('voteWindowFor : le 1er janvier le mois de référence est décembre de l\'année précédente', () => {
    const w = plain(fresh().ctx.voteWindowFor('2027-01-01'));
    assert.deepEqual([w.monthKey, w.isOpen, w.nextOpensOn], ['2026-12', false, '2027-01-25']);
});

// ─── castVote ─────────────────────────────────────────────────────────────────

test('castVote enregistre un vote et getVoteData le renvoie comme myVote', () => {
    const h = fresh();
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'b2' }).success, true);
    const data = h.call('getVoteData', { requesterId: 'a1' });
    assert.equal(data.myVote, 'b2');
    assert.equal(data.monthKey, '2026-10');
    assert.equal(data.isOpen, true);
    assert.equal(data.candidates.length, 4);
});

test('castVote : un second vote du même électeur remplace le premier (une seule ligne)', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    h.call('castVote', { voterId: 'a1', candidateId: 'c3' });
    const rows = h.sheet('Votes');
    assert.equal(rows.length, 2); // en-tête + 1 vote
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, 'c3');
});

test('castVote refuse hors fenêtre avec le code closed', () => {
    const h = fresh({ now: '2026-11-03' });
    const r = h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    assert.deepEqual([r.success, r.code], [false, 'closed']);
});

test('castVote refuse de voter pour soi-même avec le code self', () => {
    const r = fresh().call('castVote', { voterId: 'a1', candidateId: 'a1' });
    assert.deepEqual([r.success, r.code], [false, 'self']);
});

test('castVote refuse un électeur inconnu avec le code unknown_voter', () => {
    const r = fresh().call('castVote', { voterId: 'zz', candidateId: 'b2' });
    assert.deepEqual([r.success, r.code], [false, 'unknown_voter']);
});

test('castVote refuse un candidat exclu avec le code not_eligible', () => {
    const h = fresh();
    h.call('setVoteExclusion', { requesterId: 'd4', userId: 'b2', excluded: true });
    const r = h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    assert.deepEqual([r.success, r.code], [false, 'not_eligible']);
});

// ─── Review Focus ─────────────────────────────────────────────────────────────

test('Google Sheets convertit "2026-10" en Date : le vote existant est retrouvé, remplacé et compté', () => {
    const h = fresh({ dateifyMonthKeys: true });
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    h.call('castVote', { voterId: 'a1', candidateId: 'c3' });
    assert.equal(h.sheet('Votes').length, 2);
    const data = h.call('getVoteData', { requesterId: 'd4' });
    assert.equal(data.myVote, null); // Dan n'a pas voté
    assert.deepEqual(plain(data.bureau.counts.filter((c) => c.count > 0)), [{ userId: 'c3', name: 'Chloé', count: 1 }]);
});

test('Google Sheets convertit aussi les exclusions et le gagnant publié (clés mois en Date)', () => {
    const h = fresh({ dateifyMonthKeys: true });
    h.call('setVoteExclusion', { requesterId: 'd4', userId: 'b2', excluded: true });
    h.call('publishWinner', { requesterId: 'd4', userId: 'c3' });
    const data = h.call('getVoteData', { requesterId: 'a1' });
    assert.equal(data.candidates.some((c) => c.id === 'b2'), false);
    assert.equal(data.winner.userId, 'c3');
});

test('ids numériques relus comme nombres : myVote et décompte restent corrects', () => {
    const users = [
        { id: '12', name: 'Alice', role: 'tuteur' },
        { id: '13', name: 'Bob', role: 'tuteur' },
        { id: '14', name: 'Dan', role: 'bureau' },
    ];
    const h = loadScript({ users, now: OPEN, numericIds: true });
    h.call('castVote', { voterId: '12', candidateId: '13' });
    h.call('castVote', { voterId: '12', candidateId: '14' });
    assert.equal(h.sheet('Votes').length, 2);
    assert.equal(h.call('getVoteData', { requesterId: '12' }).myVote, '14');
    const counts = h.call('getVoteData', { requesterId: '14' }).bureau.counts;
    assert.equal(counts.find((c) => c.userId === '14').count, 1);
});

test('candidat exclu après avoir reçu des voix : il sort du décompte et l\'électeur peut revoter', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    h.call('setVoteExclusion', { requesterId: 'd4', userId: 'b2', excluded: true });
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, null);
    const counts = h.call('getVoteData', { requesterId: 'd4' }).bureau.counts;
    assert.equal(counts.some((c) => c.userId === 'b2'), false);
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'c3' }).success, true);
});

test('un non-Bureau ne peut ni exclure, ni publier, et ne reçoit ni décompte ni exclusions', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'c3', candidateId: 'b2' });
    for (const [action, body] of [
        ['setVoteExclusion', { requesterId: 'a1', userId: 'b2', excluded: true }],
        ['publishWinner', { requesterId: 'a1', userId: 'b2' }],
        ['setVoteExclusion', { requesterId: 'c3', userId: 'b2', excluded: true }],
        ['publishWinner', { requesterId: 'c3', userId: 'b2' }],
    ]) {
        const r = h.call(action, body);
        assert.deepEqual([r.success, r.code], [false, 'forbidden'], action);
    }
    assert.equal(h.sheet('VoteExclusions').length, 1); // en-tête seul
    assert.equal(h.sheet('TuteurDuMois').length, 1);
    const data = h.call('getVoteData', { requesterId: 'a1' });
    assert.equal('bureau' in data, false);
});

test('publishWinner refuse un compte inconnu ou exclu, remplace une publication existante et null dépublie', () => {
    const h = fresh();
    assert.equal(h.call('publishWinner', { requesterId: 'd4', userId: 'zz' }).success, false);
    h.call('setVoteExclusion', { requesterId: 'd4', userId: 'b2', excluded: true });
    assert.equal(h.call('publishWinner', { requesterId: 'd4', userId: 'b2' }).success, false);

    assert.equal(h.call('publishWinner', { requesterId: 'd4', userId: 'a1' }).success, true);
    assert.equal(h.call('publishWinner', { requesterId: 'd4', userId: 'c3' }).success, true);
    assert.equal(h.sheet('TuteurDuMois').length, 2); // en-tête + 1 ligne
    assert.deepEqual(plain(h.call('getVoteData', { requesterId: 'a1' }).winner), { userId: 'c3', name: 'Chloé' });

    assert.equal(h.call('publishWinner', { requesterId: 'd4', userId: null }).success, true);
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).winner, null);
    assert.equal(h.sheet('TuteurDuMois').length, 1);
});

test('le Bureau lit le décompte du mois clos début novembre et peut publier le gagnant', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    h.call('castVote', { voterId: 'c3', candidateId: 'b2' });
    h.call('castVote', { voterId: 'b2', candidateId: 'a1' });
    h.setNow('2026-11-03');
    const data = h.call('getVoteData', { requesterId: 'd4' });
    assert.deepEqual([data.monthKey, data.isOpen], ['2026-10', false]);
    assert.deepEqual(plain(data.bureau.counts[0]), { userId: 'b2', name: 'Bob', count: 2 });
    assert.equal(h.call('publishWinner', { requesterId: 'd4', userId: 'b2' }).success, true);
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).winner.name, 'Bob');
});

test('setVoteExclusion réintègre un membre quand excluded vaut false', () => {
    const h = fresh();
    h.call('setVoteExclusion', { requesterId: 'd4', userId: 'b2', excluded: true });
    h.call('setVoteExclusion', { requesterId: 'd4', userId: 'b2', excluded: false });
    assert.equal(h.sheet('VoteExclusions').length, 1);
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'b2' }).success, true);
});

test('getVoteData refuse un demandeur inconnu et handleVoteAction ignore les autres actions', () => {
    const h = fresh();
    assert.equal(h.call('getVoteData', { requesterId: 'zz' }).success, false);
    assert.equal(h.ctx.handleVoteAction('syncBooking', {}), null);
});
