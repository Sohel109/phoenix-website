import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'a1', name: 'Alice', role: 'tuteur', login: 'alice', password: 'pw-a' },
    { id: 'b2', name: 'Bob', role: 'tuteur', login: 'bob', password: 'pw-b' },
    { id: 'c3', name: 'Chloé', role: 'chef_projet', login: 'chloe', password: 'pw-c' },
    { id: 'd4', name: 'Dan', role: 'bureau', login: 'dan', password: 'pw-d' },
];
const OPEN = '2026-10-27';
const plain = (x) => JSON.parse(JSON.stringify(x));

// Par défaut personne n'est candidat : le Bureau (d4) choisit. `select` = les candidats choisis au départ.
const fresh = ({ select = USERS.map((u) => u.id), users = USERS, ...opts } = {}) => {
    const h = loadScript({ users, now: OPEN, ...opts });
    for (const id of select) h.call('setVoteCandidate', { requesterId: 'd4', userId: id, selected: true });
    return h;
};
const windowFor = (key) => plain(loadScript({ users: USERS }).ctx.voteWindowFor(key));

// ─── Fenêtre de vote ──────────────────────────────────────────────────────────

test('voteWindowFor : la veille de l\'ouverture, le mois de référence est le précédent, et la sélection porte sur le vote à venir', () => {
    const w = windowFor('2026-10-24');
    assert.equal(w.monthKey, '2026-09');
    assert.equal(w.isOpen, false);
    assert.equal(w.nextOpensOn, '2026-10-25');
    assert.equal(w.selectionMonthKey, '2026-10');
});

test('voteWindowFor : le 25 octobre le vote s\'ouvre pour octobre jusqu\'au 31', () => {
    assert.deepEqual(windowFor('2026-10-25'), {
        monthKey: '2026-10', selectionMonthKey: '2026-10', isOpen: true,
        opensOn: '2026-10-25', closesOn: '2026-10-31', nextOpensOn: '2026-11-24',
    });
});

test('voteWindowFor : le 3 novembre le vote d\'octobre est fermé, la prochaine ouverture est le 24 novembre et la sélection porte sur novembre', () => {
    const w = windowFor('2026-11-03');
    assert.equal(w.monthKey, '2026-10');
    assert.equal(w.isOpen, false);
    assert.equal(w.opensOn, '2026-10-25');
    assert.equal(w.closesOn, '2026-10-31');
    assert.equal(w.nextOpensOn, '2026-11-24');
    assert.equal(w.selectionMonthKey, '2026-11');
});

test('voteWindowFor : novembre (30 jours) ouvre le 24', () => {
    const w = windowFor('2026-11-24');
    assert.deepEqual([w.monthKey, w.isOpen, w.closesOn], ['2026-11', true, '2026-11-30']);
});

test('voteWindowFor : février non bissextile ouvre le 22 et se ferme le 28', () => {
    const open = windowFor('2027-02-22');
    assert.deepEqual([open.isOpen, open.opensOn, open.closesOn], [true, '2027-02-22', '2027-02-28']);
    assert.equal(windowFor('2027-02-21').isOpen, false);
});

test('voteWindowFor : février bissextile ouvre le 23 et se ferme le 29', () => {
    const w = windowFor('2028-02-23');
    assert.deepEqual([w.isOpen, w.opensOn, w.closesOn], [true, '2028-02-23', '2028-02-29']);
});

test('voteWindowFor : le 1er janvier le mois de référence est décembre, la sélection porte sur janvier', () => {
    const w = windowFor('2027-01-01');
    assert.deepEqual([w.monthKey, w.isOpen, w.nextOpensOn, w.selectionMonthKey], ['2026-12', false, '2027-01-25', '2027-01']);
});

// ─── Candidats choisis par le Bureau ──────────────────────────────────────────

test('par défaut personne n\'est candidat : aucune liste et le vote est refusé', () => {
    const h = fresh({ select: [] });
    const data = h.call('getVoteData', { requesterId: 'a1' });
    assert.deepEqual(plain(data.candidates), []);
    const r = h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    assert.deepEqual([r.success, r.code], [false, 'not_eligible']);
});

test('le Bureau choisit ses candidats : seuls ceux-là apparaissent et peuvent recevoir un vote', () => {
    const h = fresh({ select: ['b2', 'c3'] });
    const data = h.call('getVoteData', { requesterId: 'a1' });
    assert.deepEqual(plain(data.candidates.map((c) => c.id)), ['b2', 'c3']);
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'b2' }).success, true);
    assert.equal(h.call('castVote', { voterId: 'b2', candidateId: 'd4' }).code, 'not_eligible');
});

test('aucun plafond : le Bureau peut choisir moins ou plus de 5 candidats (5 est seulement l\'usage)', () => {
    const many = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'].map((id) => ({ id, name: id.toUpperCase(), role: 'tuteur' }));
    const users = [...many, { id: 'd4', name: 'Dan', role: 'bureau' }];
    const h = fresh({ users, select: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'] });
    const data = h.call('getVoteData', { requesterId: 'd4' });
    assert.equal(data.bureau.members.filter((m) => m.selected).length, 7);
    assert.equal('maxCandidates' in data.bureau, false);
    const two = fresh({ select: ['a1', 'b2'] });
    assert.equal(two.call('getVoteData', { requesterId: 'c3' }).candidates.length, 2);
});

test('choisir deux fois le même candidat ne crée pas de doublon et ne compte pas deux places', () => {
    const h = fresh({ select: ['a1'] });
    assert.equal(h.call('setVoteCandidate', { requesterId: 'd4', userId: 'a1', selected: true }).success, true);
    assert.equal(h.sheet('VoteCandidats').length, 2); // en-tête + 1 ligne
});

test('setVoteCandidate exige un booléen pour selected', () => {
    const h = fresh({ select: [] });
    for (const selected of ['true', 1, undefined, null]) {
        const r = h.call('setVoteCandidate', { requesterId: 'd4', userId: 'a1', selected });
        assert.deepEqual([r.success, r.code], [false, 'bad_request'], String(selected));
    }
    assert.equal(h.sheet('VoteCandidats').length, 1);
});

test('avant l\'ouverture, le Bureau prépare le vote suivant sans toucher au décompte du vote précédent', () => {
    const h = fresh({ select: ['a1', 'b2'] });
    h.call('castVote', { voterId: 'c3', candidateId: 'a1' });
    h.setNow('2026-11-03'); // vote d'octobre clos, novembre pas encore ouvert
    assert.equal(h.call('setVoteCandidate', { requesterId: 'd4', userId: 'c3', selected: true }).success, true);
    const bureau = h.call('getVoteData', { requesterId: 'd4' });
    assert.equal(bureau.monthKey, '2026-10');
    assert.equal(bureau.bureau.selectionMonthKey, '2026-11');
    assert.deepEqual(plain(bureau.bureau.counts.map((c) => [c.userId, c.count])), [['a1', 1], ['b2', 0]]); // octobre intact
    assert.deepEqual(plain(bureau.bureau.members.filter((m) => m.selected).map((m) => m.id)), ['c3']); // novembre = seulement c3
    h.setNow('2026-11-24'); // ouverture de novembre
    assert.deepEqual(plain(h.call('getVoteData', { requesterId: 'a1' }).candidates.map((c) => c.id)), ['c3']);
});

test('un non-Bureau ne peut pas choisir les candidats', () => {
    const h = fresh({ select: [] });
    for (const requesterId of ['a1', 'c3']) {
        const r = h.call('setVoteCandidate', { requesterId, userId: 'a1', selected: true });
        assert.deepEqual([r.success, r.code], [false, 'forbidden'], requesterId);
    }
    assert.equal(h.sheet('VoteCandidats').length, 1);
});

test('setVoteCandidate refuse un compte inconnu', () => {
    const r = fresh({ select: [] }).call('setVoteCandidate', { requesterId: 'd4', userId: 'zz', selected: true });
    assert.deepEqual([r.success, r.code], [false, 'unknown_user']);
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
    assert.equal(h.sheet('Votes').length, 2); // en-tête + 1 vote
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, 'c3');
});

test('castVote refuse hors fenêtre avec le code closed', () => {
    const h = fresh();
    h.setNow('2026-11-03');
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

test('castVote refuse un membre qui n\'est pas candidat avec le code not_eligible', () => {
    const h = fresh({ select: ['c3'] });
    const r = h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    assert.deepEqual([r.success, r.code], [false, 'not_eligible']);
});

test('un membre qui n\'est pas candidat peut quand même voter', () => {
    const h = fresh({ select: ['c3'] });
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'c3' }).success, true);
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

test('Google Sheets convertit aussi les candidats et le gagnant publié (clés mois en Date)', () => {
    const h = fresh({ dateifyMonthKeys: true });
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: false });
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
    for (const id of ['13', '14']) h.call('setVoteCandidate', { requesterId: '14', userId: id, selected: true });
    h.call('castVote', { voterId: '12', candidateId: '13' });
    h.call('castVote', { voterId: '12', candidateId: '14' });
    assert.equal(h.sheet('Votes').length, 2);
    assert.equal(h.call('getVoteData', { requesterId: '12' }).myVote, '14');
    const counts = h.call('getVoteData', { requesterId: '14' }).bureau.counts;
    assert.equal(counts.find((c) => c.userId === '14').count, 1);
});

test('candidat retiré après avoir reçu des voix : il sort du décompte et l\'électeur peut revoter', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: false });
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, null);
    const counts = h.call('getVoteData', { requesterId: 'd4' }).bureau.counts;
    assert.equal(counts.some((c) => c.userId === 'b2'), false);
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'c3' }).success, true);
});

test('un non-Bureau ne peut ni modifier les candidats, ni publier, et ne reçoit ni décompte ni liste des membres', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'c3', candidateId: 'b2' });
    const candidateRows = h.sheet('VoteCandidats').length;
    for (const [action, body] of [
        ['setVoteCandidate', { requesterId: 'a1', userId: 'b2', selected: false }],
        ['publishWinner', { requesterId: 'a1', userId: 'b2' }],
        ['setVoteCandidate', { requesterId: 'c3', userId: 'b2', selected: false }],
        ['publishWinner', { requesterId: 'c3', userId: 'b2' }],
    ]) {
        const r = h.call(action, body);
        assert.deepEqual([r.success, r.code], [false, 'forbidden'], action);
    }
    assert.equal(h.sheet('VoteCandidats').length, candidateRows);
    assert.equal(h.sheet('TuteurDuMois').length, 1);
    const data = h.call('getVoteData', { requesterId: 'a1' });
    assert.equal('bureau' in data, false);
});

test('publishWinner refuse un compte inconnu ou non candidat, remplace une publication existante et null dépublie', () => {
    const h = fresh();
    assert.equal(h.call('publishWinner', { requesterId: 'd4', userId: 'zz' }).success, false);
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: false });
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

test('setVoteCandidate selected:false retire un candidat puis selected:true le remet', () => {
    const h = fresh();
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: false });
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'b2' }).code, 'not_eligible');
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: true });
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'b2' }).success, true);
});

test('getVoteData refuse un demandeur inconnu et handleVoteAction ignore les autres actions', () => {
    const h = fresh();
    assert.equal(h.call('getVoteData', { requesterId: 'zz' }).success, false);
    assert.equal(h.ctx.handleVoteAction('syncBooking', {}), null);
});

test('un gagnant publié puis retiré des candidats n\'est plus affiché comme tuteur du mois', () => {
    const h = fresh();
    h.call('publishWinner', { requesterId: 'd4', userId: 'b2' });
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: false });
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).winner, null);
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: true });
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).winner.userId, 'b2');
});

// ─── Authentification des actions de vote (jeton de session signé) ───────────

test('la connexion renvoie un jeton, et ce jeton permet de voter', () => {
    const h = fresh();
    const login = h.login('alice', 'pw-a');
    assert.equal(login.success, true);
    assert.equal(login.user.id, 'a1');
    assert.equal(typeof login.user.token, 'string');
    assert.equal(h.raw('castVote', { voterId: 'a1', candidateId: 'b2', token: login.user.token }).success, true);
});

test('sans jeton, avec un jeton vide ou altéré : refus unauthenticated et aucune écriture', () => {
    const h = fresh();
    const token = h.login('alice', 'pw-a').user.token;
    const tampered = token.slice(0, -1) + (token.slice(-1) === '0' ? '1' : '0');
    for (const body of [
        { voterId: 'a1', candidateId: 'b2' },
        { voterId: 'a1', candidateId: 'b2', token: '' },
        { voterId: 'a1', candidateId: 'b2', token: 'n-importe-quoi' },
        { voterId: 'a1', candidateId: 'b2', token: tampered },
    ]) {
        const r = h.raw('castVote', body);
        assert.deepEqual([r.success, r.code], [false, 'unauthenticated']);
    }
    assert.equal(h.sheet('Votes').length, 1); // en-tête seul
});

test('le jeton d\'Alice ne permet pas de voter ou de lire au nom de Bob', () => {
    const h = fresh();
    const aliceToken = h.login('alice', 'pw-a').user.token;
    assert.equal(h.raw('castVote', { voterId: 'b2', candidateId: 'c3', token: aliceToken }).code, 'unauthenticated');
    assert.equal(h.raw('getVoteData', { requesterId: 'b2', token: aliceToken }).code, 'unauthenticated');
});

test('un tuteur qui se fait passer pour le Bureau avec son propre jeton est refusé et ne reçoit pas le décompte', () => {
    const h = fresh();
    const aliceToken = h.login('alice', 'pw-a').user.token;
    for (const [action, body] of [
        ['getVoteData', { requesterId: 'd4' }],
        ['setVoteCandidate', { requesterId: 'd4', userId: 'b2', selected: false }],
        ['publishWinner', { requesterId: 'd4', userId: 'b2' }],
    ]) {
        const r = h.raw(action, { ...body, token: aliceToken });
        assert.deepEqual([r.success, r.code], [false, 'unauthenticated'], action);
        assert.equal('bureau' in r, false);
    }
});

test('un jeton expire après 12 heures', () => {
    const h = fresh();
    const token = h.login('alice', 'pw-a').user.token;
    h.advanceMs(11 * 3600 * 1000);
    assert.equal(h.raw('getVoteData', { requesterId: 'a1', token }).success, true);
    h.advanceMs(2 * 3600 * 1000);
    assert.equal(h.raw('getVoteData', { requesterId: 'a1', token }).code, 'unauthenticated');
});

test('si les propriétés du script sont indisponibles, la connexion réussit quand même (sans jeton)', () => {
    const h = loadScript({ users: USERS, propertiesBroken: true });
    const login = h.login('alice', 'pw-a');
    assert.equal(login.success, true);
    assert.equal('token' in login.user, false);
});

test('la connexion avec un mauvais mot de passe échoue toujours', () => {
    assert.equal(fresh().login('alice', 'mauvais').success, false);
});

// ─── Retrait du vote ──────────────────────────────────────────────────────────

test('withdrawVote supprime le vote : myVote revient à null, le décompte baisse, plus aucune ligne', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    assert.equal(h.call('withdrawVote', { voterId: 'a1' }).success, true);
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, null);
    const counts = h.call('getVoteData', { requesterId: 'd4' }).bureau.counts;
    assert.equal(counts.find((c) => c.userId === 'b2').count, 0);
    assert.equal(h.sheet('Votes').length, 1); // en-tête seul
});

test('après un retrait on peut revoter, et les votes des autres ne sont pas touchés', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    h.call('castVote', { voterId: 'c3', candidateId: 'b2' });
    h.call('withdrawVote', { voterId: 'a1' });
    assert.equal(h.call('getVoteData', { requesterId: 'c3' }).myVote, 'b2');
    assert.equal(h.call('castVote', { voterId: 'a1', candidateId: 'c3' }).success, true);
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, 'c3');
});

test('retirer un vote qu\'on n\'a pas fait réussit sans rien changer', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'c3', candidateId: 'b2' });
    const r = h.call('withdrawVote', { voterId: 'a1' });
    assert.equal(r.success, true);
    assert.equal(h.sheet('Votes').length, 2); // en-tête + le vote de Chloé
});

test('withdrawVote refuse hors fenêtre (closed) et le vote reste en place', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    h.setNow('2026-11-03');
    const r = h.call('withdrawVote', { voterId: 'a1' });
    assert.deepEqual([r.success, r.code], [false, 'closed']);
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, 'b2');
});

test('withdrawVote exige le jeton de l\'électeur : sans jeton ou avec celui d\'un autre, le vote reste', () => {
    const h = fresh();
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    const bobToken = h.login('bob', 'pw-b').user.token;
    assert.equal(h.raw('withdrawVote', { voterId: 'a1' }).code, 'unauthenticated');
    assert.equal(h.raw('withdrawVote', { voterId: 'a1', token: bobToken }).code, 'unauthenticated');
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, 'b2');
});

test('withdrawVote refuse un électeur inconnu', () => {
    const r = fresh().call('withdrawVote', { voterId: 'zz' });
    assert.deepEqual([r.success, r.code], [false, 'unknown_voter']);
});

test('withdrawVote fonctionne aussi quand Sheets a converti la clé du mois en date', () => {
    const h = fresh({ dateifyMonthKeys: true });
    h.call('castVote', { voterId: 'a1', candidateId: 'b2' });
    assert.equal(h.call('withdrawVote', { voterId: 'a1' }).success, true);
    assert.equal(h.call('getVoteData', { requesterId: 'a1' }).myVote, null);
    assert.equal(h.sheet('Votes').length, 1);
});
