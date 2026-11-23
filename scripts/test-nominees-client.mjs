import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNominees, parseNomineeProfile, nomineeSlug, computeNomineeStats, mergeAutoStats, portraitCrop, schoolYearStart } from '../src/data/nominees.ts';
import { parseVoteData } from '../src/data/voteResponse.ts';

const PROFILE = { displayName: 'Alice Martin', slug: 'alice-martin', accomplishments: ['A fait ça'], stats: [{ label: 'Séances', value: '4' }], photoId: 'photo123', updatedAt: '2026-11-20T10:00:00.000Z' };

test('parseNominees accepte une vraie réponse et garde le badge gagnant', () => {
    const res = parseNominees({ success: true, monthKey: '2026-11', nominees: [{ ...PROFILE, isWinner: true }] });
    assert.equal(res.monthKey, '2026-11');
    assert.equal(res.nominees[0].isWinner, true);
});

test('parseNominees rejette une réponse de connexion ou d\'action inconnue', () => {
    assert.equal(parseNominees({ success: true, user: { id: '1' } }), null);
    assert.equal(parseNominees({ success: false, message: 'Action inconnue' }), null);
    assert.equal(parseNominees(null), null);
});

test('parseNominees écarte une fiche incomplète ou sans photo', () => {
    const res = parseNominees({ success: true, monthKey: '2026-11', nominees: [{ ...PROFILE, stats: 'x' }, { ...PROFILE, photoId: null }, PROFILE] });
    assert.equal(res.nominees.length, 1);
    assert.equal(res.nominees[0].isWinner, false);
});

test('parseNomineeProfile : null pour une fiche absente', () => {
    assert.equal(parseNomineeProfile(null), null);
    assert.equal(parseNomineeProfile(undefined), null);
});

test('parseVoteData : un ancien script sans fiches donne profile null partout', () => {
    const data = parseVoteData({
        success: true, monthKey: '2026-11', isOpen: true, opensOn: '2026-11-24', closesOn: '2026-11-30', nextOpensOn: '2026-12-25',
        candidates: [{ id: 'a1', name: 'Alice' }], myVote: null, winner: null,
        bureau: { counts: [], selectionMonthKey: '2026-11', members: [{ id: 'a1', name: 'Alice', selected: true }] },
    });
    assert.equal(data.candidates[0].profile, null);
    assert.equal(data.bureau.members[0].profile, null);
});

test('parseVoteData : garde une fiche valide', () => {
    const data = parseVoteData({
        success: true, monthKey: '2026-11', isOpen: true, opensOn: '2026-11-24', closesOn: '2026-11-30', nextOpensOn: '2026-12-25',
        candidates: [{ id: 'a1', name: 'Alice', profile: PROFILE }], myVote: null, winner: null,
    });
    assert.equal(data.candidates[0].profile.slug, 'alice-martin');
});

test('nomineeSlug suit la règle du script', () => {
    assert.equal(nomineeSlug('Chloé Dû-Pont'), 'chloe-du-pont');
    assert.equal(nomineeSlug("  Éric  L'Œil  "), 'eric-l-oeil');
    assert.equal(nomineeSlug('***'), 'nomme');
});

const SLOTS = [{ id: 's2', projectId: 2 }, { id: 's4', projectId: 4 }];
const weekStart = (key) => new Date(key);
const statsInput = (extra = {}) => ({
    userId: 'a',
    projectIds: [4],
    bookings: [
        { userId: 'a', slotId: 's4', weekKey: '2026-08-24', status: 'confirme' },
        { userId: 'a', slotId: 's4', weekKey: '2026-08-31', status: 'confirme' },
        { userId: 'a', slotId: 's2', weekKey: '2026-10-05', status: 'confirme' },
        { userId: 'a', slotId: 's2', weekKey: '2026-10-12', status: 'prevu' },
        { userId: 'b', slotId: 's2', weekKey: '2026-10-12', status: 'confirme' },
    ],
    manualHours: [
        { userId: 'a', hours: 1.5, createdAt: '2026-10-01T10:00:00.000Z' },
        { userId: 'a', hours: 9, createdAt: '2026-06-01T10:00:00.000Z' },
    ],
    slots: SLOTS,
    today: new Date(2026, 10, 23),
    weekStart,
    duration: (slot) => (slot.projectId === 4 ? 1.5 : 2.5),
    projectName: (id) => ({ 2: 'ACSE', 4: 'St Gabriel' })[id],
    ...extra,
});

test('computeNomineeStats : depuis le 1er septembre, semaine à cheval comprise, heures manuelles comptées', () => {
    assert.deepEqual(computeNomineeStats(statsInput()), [
        { label: 'Projet', value: 'St Gabriel' },
        { label: 'Heures validées', value: '5,5 h' },
        { label: 'Séances', value: '2' },
    ]);
});

test('computeNomineeStats : sans projet déclaré, prend les projets des séances', () => {
    assert.equal(computeNomineeStats(statsInput({ projectIds: [] }))[0].value, 'St Gabriel, ACSE');
});

test('schoolYearStart : avant septembre, l\'année scolaire a commencé l\'an dernier', () => {
    assert.equal(schoolYearStart(new Date(2027, 2, 10)).getFullYear(), 2026);
    assert.equal(schoolYearStart(new Date(2026, 8, 1)).getFullYear(), 2026);
});

test('mergeAutoStats : remplace les lignes automatiques et garde les autres', () => {
    const current = [{ label: 'Sorties encadrées', value: '3' }, { label: 'Heures validées', value: '10 h' }, { label: 'Séances', value: '2' }];
    const fresh = [{ label: 'Projet', value: 'ACSE' }, { label: 'Heures validées', value: '12 h' }, { label: 'Séances', value: '5' }];
    assert.deepEqual(mergeAutoStats(current, fresh), [
        { label: 'Projet', value: 'ACSE' },
        { label: 'Sorties encadrées', value: '3' },
        { label: 'Heures validées', value: '12 h' },
        { label: 'Séances', value: '5' },
    ]);
});

test('portraitCrop : recadrage 4:5 centré, sans agrandir', () => {
    assert.deepEqual(portraitCrop(4000, 3000), { sx: 800, sy: 0, sw: 2400, sh: 3000, outW: 900, outH: 1125 });
    assert.deepEqual(portraitCrop(900, 2000), { sx: 0, sy: 438, sw: 900, sh: 1125, outW: 900, outH: 1125 });
    assert.deepEqual(portraitCrop(600, 750), { sx: 0, sy: 0, sw: 600, sh: 750, outW: 600, outH: 750 });
});
