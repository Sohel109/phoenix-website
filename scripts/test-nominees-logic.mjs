import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'a1', name: 'Alice Martin', role: 'tuteur', login: 'alice', password: 'pw-a' },
    { id: 'b2', name: 'Bob Durand', role: 'tuteur', login: 'bob', password: 'pw-b' },
    { id: 'c3', name: 'Chloé Dû-Pont', role: 'chef_projet', login: 'chloe', password: 'pw-c' },
    { id: 'd4', name: 'Dan', role: 'bureau', login: 'dan', password: 'pw-d' },
];
const OPEN = '2026-11-24';
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4]).toString('base64');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]).toString('base64');

const fresh = ({ select = ['a1', 'b2', 'c3'], now = OPEN, ...opts } = {}) => {
    const h = loadScript({ users: USERS, now, ...opts });
    for (const id of select) h.call('setVoteCandidate', { requesterId: 'd4', userId: id, selected: true });
    return h;
};
const profileInput = (userId, extra = {}) => ({
    requesterId: 'd4',
    userId,
    displayName: 'Alice Martin',
    accomplishments: ['A encadré 3 sorties', '  ', 'Toujours là le jeudi'],
    stats: [{ label: 'Projet', value: 'Izzo' }, { label: '', value: '' }, { label: 'Heures validées', value: '42 h' }],
    ...extra,
});
const bureauMember = (h, id) => h.call('getVoteData', { requesterId: 'd4' }).bureau.members.find((m) => m.id === id);
const photoEntry = (h, id) => h.drive.files.get(id);

// ─── Écritures du Bureau ───────────────────────────────────────────────────────

test('saveNomineeProfile : le Bureau enregistre la fiche d\'un candidat du mois en préparation', () => {
    const h = fresh();
    assert.deepEqual(h.call('saveNomineeProfile', profileInput('a1')), { success: true });
    const profile = bureauMember(h, 'a1').profile;
    assert.equal(profile.displayName, 'Alice Martin');
    assert.equal(profile.slug, 'alice-martin');
    assert.deepEqual(profile.accomplishments, ['A encadré 3 sorties', 'Toujours là le jeudi']);
    assert.deepEqual(profile.stats, [{ label: 'Projet', value: 'Izzo' }, { label: 'Heures validées', value: '42 h' }]);
    assert.equal(profile.photoId, null);
    assert.equal(h.sheet('FichesNommes')[1][0], '2026-11');
});

test('saveNomineeProfile : une seconde sauvegarde met à jour la même ligne', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1'));
    h.call('saveNomineeProfile', profileInput('a1', { displayName: 'Alice M.' }));
    assert.equal(h.sheet('FichesNommes').length, 2);
    assert.equal(bureauMember(h, 'a1').profile.displayName, 'Alice M.');
});

test('saveNomineeProfile : refusé à un tuteur, rien n\'est écrit', () => {
    const h = fresh();
    const res = h.call('saveNomineeProfile', profileInput('a1', { requesterId: 'b2' }));
    assert.equal(res.success, false);
    assert.equal(res.code, 'forbidden');
    assert.equal(bureauMember(h, 'a1').profile, null);
});

test('saveNomineeProfile : refusé sans jeton valide', () => {
    const h = fresh();
    const res = h.raw('saveNomineeProfile', { ...profileInput('a1'), token: 'faux' });
    assert.equal(res.code, 'unauthenticated');
});

test('saveNomineeProfile : refusé pour un membre non candidat', () => {
    const h = fresh({ select: ['a1'] });
    assert.equal(h.call('saveNomineeProfile', profileInput('b2')).code, 'not_candidate');
});

test('saveNomineeProfile : limites de saisie', () => {
    const h = fresh();
    const bad = [
        { displayName: '   ' },
        { displayName: 'x'.repeat(61) },
        { accomplishments: Array.from({ length: 13 }, (_, i) => `Fait ${i}`) },
        { accomplishments: ['x'.repeat(161)] },
        { accomplishments: 'pas une liste' },
        { stats: Array.from({ length: 9 }, (_, i) => ({ label: `L${i}`, value: 'v' })) },
        { stats: [{ label: 'x'.repeat(31), value: 'v' }] },
        { stats: [{ label: 'Projet', value: '' }] },
    ];
    for (const extra of bad) {
        assert.equal(h.call('saveNomineeProfile', profileInput('a1', extra)).code, 'bad_request', JSON.stringify(extra).slice(0, 60));
    }
    assert.equal(bureauMember(h, 'a1').profile, null);
});

test('uploadNomineePhoto : range la photo dans le dossier privé et met l\'ancienne à la corbeille', () => {
    const h = fresh();
    const first = h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG });
    assert.equal(first.success, true);
    assert.equal(photoEntry(h, first.photoId).folder, 'Phoenix - Photos nommés');
    // Sans fiche enregistrée, la photo crée une fiche au nom du compte.
    assert.equal(bureauMember(h, 'a1').profile.displayName, 'Alice Martin');
    assert.equal(bureauMember(h, 'a1').profile.photoId, first.photoId);

    const second = h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: `data:image/jpeg;base64,${JPEG}` });
    assert.equal(second.success, true);
    assert.notEqual(second.photoId, first.photoId);
    assert.equal(photoEntry(h, first.photoId).trashed, true);
    assert.equal(bureauMember(h, 'a1').profile.photoId, second.photoId);
});

test('uploadNomineePhoto : la fiche enregistrée ensuite garde la photo', () => {
    const h = fresh();
    const up = h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG });
    h.call('saveNomineeProfile', profileInput('a1'));
    assert.equal(bureauMember(h, 'a1').profile.photoId, up.photoId);
});

test('uploadNomineePhoto : refuse un fichier trop lourd, un autre format et un non-Bureau', () => {
    const h = fresh();
    assert.equal(h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: 'A'.repeat(1500004) }).code, 'too_large');
    assert.equal(h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: PNG }).code, 'bad_request');
    assert.equal(h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: 'pas du base64 !' }).code, 'bad_request');
    assert.equal(h.call('uploadNomineePhoto', { requesterId: 'a1', userId: 'a1', data: JPEG }).code, 'forbidden');
    assert.equal(h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'd4', data: JPEG }).code, 'not_candidate');
    assert.equal(h.drive.files.size, 0);
});

test('removeNomineePhoto : retire la photo et la met à la corbeille', () => {
    const h = fresh();
    const up = h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG });
    assert.deepEqual(h.call('removeNomineePhoto', { requesterId: 'd4', userId: 'a1' }), { success: true });
    assert.equal(photoEntry(h, up.photoId).trashed, true);
    assert.equal(bureauMember(h, 'a1').profile.photoId, null);
    assert.equal(h.call('removeNomineePhoto', { requesterId: 'b2', userId: 'a1' }).code, 'forbidden');
});

test('setVoteCandidate décoché : supprime la fiche et met la photo à la corbeille ; recocher repart de zéro', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1'));
    const up = h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG });
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'a1', selected: false });
    assert.equal(photoEntry(h, up.photoId).trashed, true);
    assert.equal(h.sheet('FichesNommes').length, 1);
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'a1', selected: true });
    assert.equal(bureauMember(h, 'a1').profile, null);
});

test('getVoteData : un tuteur voit la fiche des candidats, sans la partie Bureau', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1'));
    const data = h.call('getVoteData', { requesterId: 'b2' });
    assert.equal(data.bureau, undefined);
    assert.equal(data.candidates.find((c) => c.id === 'a1').profile.displayName, 'Alice Martin');
    assert.equal(data.candidates.find((c) => c.id === 'c3').profile, null);
});

test('nomineeSlug : sans accents, en minuscules, avec des tirets', () => {
    const h = loadScript({ users: USERS });
    assert.equal(h.ctx.nomineeSlug('Chloé Dû-Pont'), 'chloe-du-pont');
    assert.equal(h.ctx.nomineeSlug('  Éric  L\'Œil  '), 'eric-l-oeil');
    assert.equal(h.ctx.nomineeSlug('***'), 'nomme');
});

test('getVoteData : deux nommés au même nom affiché ont des slugs distincts', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1', { displayName: 'Sam' }));
    h.call('saveNomineeProfile', profileInput('b2', { displayName: 'Sam' }));
    assert.equal(bureauMember(h, 'a1').profile.slug, 'sam');
    assert.equal(bureauMember(h, 'b2').profile.slug, 'sam-2');
});

// ─── Lectures publiques ───────────────────────────────────────────────────────

const withPhotos = (h, ids) => {
    for (const id of ids) {
        h.call('saveNomineeProfile', profileInput(id, { displayName: USERS.find((u) => u.id === id).name }));
        h.call('uploadNomineePhoto', { requesterId: 'd4', userId: id, data: JPEG });
    }
};

test('getNominees : seulement les fiches avec photo, sans identifiant de compte', () => {
    const h = fresh();
    withPhotos(h, ['a1', 'c3']);
    h.call('saveNomineeProfile', profileInput('b2', { displayName: 'Bob Durand' }));
    const res = h.get('getNominees');
    assert.equal(res.success, true);
    assert.equal(res.monthKey, '2026-11');
    assert.deepEqual(res.nominees.map((n) => n.slug), ['alice-martin', 'chloe-du-pont']);
    const n = res.nominees[0];
    assert.deepEqual(Object.keys(n).sort(), ['accomplishments', 'displayName', 'isWinner', 'photoId', 'quote', 'slug', 'stats', 'updatedAt']);
    const text = JSON.stringify(res);
    for (const id of ['"a1"', '"b2"', '"c3"', '"alice"', 'pw-']) assert.equal(text.includes(id), false, id);
});

test('getNominees : garde le mois précédent tant que le nouveau n\'a pas de photo', () => {
    const h = fresh({ now: '2026-10-27' });
    withPhotos(h, ['a1', 'b2']);
    h.call('publishWinner', { requesterId: 'd4', userId: 'b2' });
    h.setNow('2026-11-02');
    h.call('setVoteCandidate', { requesterId: 'd4', userId: 'c3', selected: true });
    h.call('saveNomineeProfile', profileInput('c3', { displayName: 'Chloé' }));
    const res = h.get('getNominees');
    assert.equal(res.monthKey, '2026-10');
    assert.deepEqual(res.nominees.map((n) => [n.slug, n.isWinner]), [['bob-durand', true], ['alice-martin', false]]);

    // Une photo du mois en préparation ne bascule pas la page avant l'ouverture du vote.
    h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'c3', data: JPEG });
    assert.equal(h.get('getNominees').monthKey, '2026-10');

    h.setNow('2026-11-24');
    const next = h.get('getNominees');
    assert.equal(next.monthKey, '2026-11');
    assert.deepEqual(next.nominees.map((n) => n.slug), ['chloe']);
});

test('getNominees : même slug que dans l\'espace membre quand un homonyme n\'a pas de photo', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1', { displayName: 'Sam' }));
    h.call('saveNomineeProfile', profileInput('b2', { displayName: 'Sam' }));
    h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'b2', data: JPEG });
    assert.deepEqual(h.get('getNominees').nominees.map((n) => n.slug), ['sam-2']);
    assert.equal(bureauMember(h, 'b2').profile.slug, 'sam-2');
});

test('FichesNommes : les colonnes de texte restent du texte brut dans le Sheet', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1'));
    assert.deepEqual(h.formats('FichesNommes').map((f) => f.join(' ')).sort(), ['A:A @', 'C:H @']);
});

test('uploadNomineePhoto : ignore un dossier du même nom qui existait déjà (par exemple partagé)', () => {
    const h = fresh();
    const shared = { name: 'Phoenix - Photos nommés', files: [], trashed: false };
    h.drive.folders.set(shared.name, shared);
    h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG });
    h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'b2', data: JPEG });
    assert.equal(shared.files.length, 0);
    const folders = new Set([...h.drive.files.values()].map((f) => f.folderEntry));
    assert.equal(folders.size, 1);
});

test('getNominees : ignore une fiche dont le membre n\'est plus candidat ou dont la photo est à la corbeille', () => {
    const h = fresh();
    withPhotos(h, ['a1', 'b2']);
    // Retrait à la main dans le Sheet, sans passer par le site : la fiche reste mais n'est plus affichée.
    const rows = h.sheet('VoteCandidats');
    const row = rows.findIndex((r) => r[1] === 'a1') + 1;
    h.setSheetCell('VoteCandidats', row, 2, 'zz');
    const photoB = bureauMember(h, 'b2').profile.photoId;
    h.drive.files.get(photoB).trashed = true;
    assert.deepEqual(h.get('getNominees'), { success: true, monthKey: null, nominees: [] });
});

test('getNominees : aucun nommé', () => {
    const h = loadScript({ users: USERS, now: OPEN });
    assert.deepEqual(h.get('getNominees'), { success: true, monthKey: null, nominees: [] });
});

test('getNomineePhoto : renvoie la photo d\'une fiche, refuse tout autre fichier', () => {
    const h = fresh();
    withPhotos(h, ['a1']);
    const photoId = bureauMember(h, 'a1').profile.photoId;
    assert.deepEqual(h.get('getNomineePhoto', { id: photoId }), { success: true, mimeType: 'image/jpeg', data: JPEG });
    assert.equal(h.get('getNomineePhoto', { id: 'sheet-id-1' }).code, 'not_found');
    assert.equal(h.get('getNomineePhoto', { id: '' }).code, 'not_found');
    h.drive.files.get(photoId).trashed = true;
    assert.equal(h.get('getNomineePhoto', { id: photoId }).code, 'not_found');
});

// ─── Citation du nommé ────────────────────────────────────────────────────────

test('saveNomineeProfile : enregistre la citation et la renvoie partout', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1', { quote: '  Votez pour moi, je ne lâche rien !  ' }));
    h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG });
    assert.equal(bureauMember(h, 'a1').profile.quote, 'Votez pour moi, je ne lâche rien !');
    assert.equal(h.call('getVoteData', { requesterId: 'b2' }).candidates.find((c) => c.id === 'a1').profile.quote, 'Votez pour moi, je ne lâche rien !');
    assert.equal(h.get('getNominees').nominees[0].quote, 'Votez pour moi, je ne lâche rien !');
    // L'envoi d'une photo garde la citation.
    h.call('uploadNomineePhoto', { requesterId: 'd4', userId: 'a1', data: JPEG });
    assert.equal(bureauMember(h, 'a1').profile.quote, 'Votez pour moi, je ne lâche rien !');
});

test('saveNomineeProfile : citation facultative, 350 caractères au plus', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1'));
    assert.equal(bureauMember(h, 'a1').profile.quote, '');
    assert.equal(h.call('saveNomineeProfile', profileInput('a1', { quote: 'x'.repeat(350) })).code, undefined);
    assert.equal(h.call('saveNomineeProfile', profileInput('a1', { quote: 'x'.repeat(351) })).code, 'bad_request');
    assert.equal(h.call('saveNomineeProfile', profileInput('a1', { quote: 42 })).code, 'bad_request');
});

test('FichesNommes : une fiche écrite avant la citation se lit avec une citation vide', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1'));
    // Ligne d'un ancien script : 7 colonnes seulement.
    h.setSheetCell('FichesNommes', 2, 8, '');
    assert.equal(bureauMember(h, 'a1').profile.quote, '');
});

test('FichesNommes : un onglet créé avant la citation reçoit l\'en-tête et le format texte de la colonne H', () => {
    const h = fresh();
    h.call('saveNomineeProfile', profileInput('a1'));
    h.setSheetCell('FichesNommes', 1, 8, '');
    h.call('saveNomineeProfile', profileInput('a1', { quote: '=Votez' }));
    assert.equal(h.sheet('FichesNommes')[0][7], 'quote');
    assert.ok(h.formats('FichesNommes').some((f) => f[0] === 'H:H' && f[1] === '@'));
    assert.equal(bureauMember(h, 'a1').profile.quote, '=Votez');
});
