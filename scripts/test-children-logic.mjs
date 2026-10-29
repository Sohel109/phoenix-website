import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'b1', name: 'Bureau', role: 'bureau', login: 'b1', password: 'x', projects: '2' },
    { id: 'c4', name: 'Chef Quatre', role: 'chef_projet', login: 'c4', password: 'x', projects: '4' },
    { id: 'c47', name: 'Chef Quatre Sept', role: 'chef_projet', login: 'c47', password: 'x', projects: '4,7' },
    { id: 'c0', name: 'Chef Sans Projet', role: 'chef_projet', login: 'c0', password: 'x', projects: '' },
    { id: 't4', name: 'Tuteur', role: 'tuteur', login: 't4', password: 'x', projects: '4' },
];
const TODAY = '2026-10-29';
const fresh = (opts = {}) => loadScript({ users: USERS, now: TODAY, ...opts });
const plain = (x) => JSON.parse(JSON.stringify(x));
const names = (out) => out.children.map((c) => c.name);

const get = (h, requesterId, extra = {}) => plain(h.call('getChildrenData', { requesterId, ...extra }));
const add = (h, requesterId, projectId, list) => plain(h.call('addChildren', { requesterId, projectId, names: list }));

// ─── Accès ────────────────────────────────────────────────────────────────────

test('un tuteur est refusé sur les quatre actions', () => {
    const h = fresh();
    for (const [action, body] of [
        ['getChildrenData', { projectId: 4 }],
        ['addChildren', { projectId: 4, names: ['Inès B.'] }],
        ['removeChild', { projectId: 4, childId: 'x' }],
        ['saveChildAttendance', { projectId: 4, date: TODAY, presentIds: [] }],
    ]) {
        const out = plain(h.call(action, { requesterId: 't4', ...body }));
        assert.equal(out.success, false, action);
        assert.equal(out.code, 'forbidden', action);
    }
});

test('sans jeton valide : unauthenticated', () => {
    const h = fresh();
    assert.equal(plain(h.raw('getChildrenData', { requesterId: 'c4' })).code, 'unauthenticated');
    const otherToken = h.ctx.createSessionToken('c47');
    assert.equal(plain(h.raw('getChildrenData', { requesterId: 'c4', token: otherToken })).code, 'unauthenticated');
});

test('un CDP voit ses projets, le Bureau les neuf, un CDP sans projet aucun', () => {
    const h = fresh();
    assert.deepEqual(get(h, 'c4').projects, [4]);
    assert.deepEqual(get(h, 'c47').projects, [4, 7]);
    const bureau = get(h, 'b1');
    assert.deepEqual(bureau.projects, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    assert.equal(bureau.isBureau, true);
    const none = get(h, 'c0');
    assert.deepEqual(none.projects, []);
    assert.equal(none.projectId, null);
    assert.deepEqual(none.children, []);
});

test('un CDP est refusé sur le projet d\'un autre et ne reçoit aucun nom', () => {
    const h = fresh();
    add(h, 'c47', 7, ['Secret S.']);
    const out = get(h, 'c4', { projectId: 7 });
    assert.equal(out.success, false);
    assert.equal(out.code, 'forbidden');
    assert.ok(!JSON.stringify(out).includes('Secret'));
    assert.equal(add(h, 'c4', 7, ['Autre A.']).code, 'forbidden');
});

test('la colonne projets numérique (Sheets) est acceptée', () => {
    const h = fresh({ numericIds: true });
    assert.deepEqual(get(h, 'c4').projects, [4]);
});

test('sans projectId, le premier projet accessible est utilisé ; un projet inconnu est invalide', () => {
    const h = fresh();
    assert.equal(get(h, 'c47').projectId, 4);
    assert.equal(get(h, 'b1', { projectId: 12 }).code, 'invalid');
});

// ─── Liste des enfants ────────────────────────────────────────────────────────

test('ajout : noms nettoyés, vides et doublons ignorés, ordre conservé', () => {
    const h = fresh();
    const out = add(h, 'c4', 4, ['Inès B.', '  Karim   D. ', '', 'inès b.']);
    assert.equal(out.success, true);
    assert.equal(out.added, 2);
    assert.deepEqual(names(get(h, 'c4', { projectId: 4 })), ['Inès B.', 'Karim D.']);
    const rows = h.sheet('Enfants');
    assert.equal(rows.length, 3);
    assert.equal(rows[1][4 - 1], true); // colonne active
});

test('un nom est coupé à 40 caractères ; une liste vide est refusée', () => {
    const h = fresh();
    add(h, 'c4', 4, ['A'.repeat(60)]);
    assert.equal(get(h, 'c4').children[0].name.length, 40);
    assert.equal(add(h, 'c4', 4, []).code, 'invalid');
    assert.equal(add(h, 'c4', 4, ['  ', '']).code, 'invalid');
});

test('le doublon est cherché par projet : le même prénom est permis dans un autre projet', () => {
    const h = fresh();
    add(h, 'c47', 4, ['Inès B.']);
    assert.equal(add(h, 'c47', 7, ['Inès B.']).added, 1);
});

test('retrait : l\'enfant disparaît de la liste mais sa ligne reste, inactive', () => {
    const h = fresh();
    add(h, 'c4', 4, ['Inès B.', 'Karim D.']);
    const ines = get(h, 'c4').children[0].id;
    const out = plain(h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: ines }));
    assert.equal(out.success, true);
    assert.deepEqual(names(get(h, 'c4')), ['Karim D.']);
    const rows = h.sheet('Enfants');
    assert.equal(rows.length, 3);
    assert.equal(rows[1][3], false);
});

test('retirer un enfant inconnu ou d\'un autre projet est invalide', () => {
    const h = fresh();
    add(h, 'c47', 7, ['Secret S.']);
    const secret = get(h, 'c47', { projectId: 7 }).children[0].id;
    assert.equal(plain(h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: secret })).code, 'invalid');
    assert.equal(plain(h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: 'nope' })).code, 'invalid');
    assert.deepEqual(names(get(h, 'c47', { projectId: 7 })), ['Secret S.']);
});

test('le Bureau peut ajouter et retirer dans n\'importe quel projet', () => {
    const h = fresh();
    assert.equal(add(h, 'b1', 9, ['Léa P.']).added, 1);
    const id = get(h, 'b1', { projectId: 9 }).children[0].id;
    assert.equal(plain(h.call('removeChild', { requesterId: 'b1', projectId: 9, childId: id })).success, true);
});

// ─── Appel, correction et bilans ──────────────────────────────────────────────

const save = (h, requesterId, projectId, date, presentIds) =>
    plain(h.call('saveChildAttendance', { requesterId, projectId, date, presentIds }));
const attendanceRows = (h) => (h.sheet('PresencesEnfants') ?? []).slice(1);

/** Projet 4 avec trois enfants ; renvoie leurs identifiants. */
function withKids(h) {
    add(h, 'c4', 4, ['Inès B.', 'Karim D.', 'Lina M.']);
    const [ines, karim, lina] = get(h, 'c4').children.map((c) => c.id);
    return { ines, karim, lina };
}

test('appel enregistré : une ligne par enfant, présents et absents, avec qui a validé', () => {
    const h = fresh();
    const { ines, karim, lina } = withKids(h);
    const out = save(h, 'c4', 4, TODAY, [ines, karim]);
    assert.equal(out.success, true);
    assert.equal(out.saved, 3);
    const rows = attendanceRows(h).map((r) => [String(r[0]), r[1], r[2], r[3], r[4]]);
    assert.deepEqual(rows, [['4', TODAY, ines, true, 'c4'], ['4', TODAY, karim, true, 'c4'], ['4', TODAY, lina, false, 'c4']]);
    assert.deepEqual(get(h, 'c4', { date: TODAY }).attendance, { date: TODAY, presentIds: [ines, karim] });
    assert.equal(get(h, 'c4', { date: '2026-10-28' }).attendance, null);
});

test('correction : réenregistrer le même jour remplace l\'appel', () => {
    const h = fresh();
    const { ines, karim, lina } = withKids(h);
    save(h, 'c4', 4, TODAY, [ines, karim]);
    save(h, 'c4', 4, TODAY, [lina]);
    assert.equal(attendanceRows(h).length, 3);
    assert.deepEqual(get(h, 'c4', { date: TODAY }).attendance.presentIds, [lina]);
});

test('une date future ou invalide est refusée et n\'écrit rien', () => {
    const h = fresh();
    const { ines } = withKids(h);
    for (const date of ['2026-10-30', '2026-02-30', '29/10/2026', '', undefined]) {
        assert.equal(save(h, 'c4', 4, date, [ines]).code, 'invalid', String(date));
    }
    assert.equal(attendanceRows(h).length, 0);
});

test('un identifiant d\'enfant d\'un autre projet dans presentIds est ignoré', () => {
    const h = fresh();
    const { ines } = withKids(h);
    add(h, 'c47', 7, ['Secret S.']);
    const secret = get(h, 'c47', { projectId: 7 }).children[0].id;
    save(h, 'c4', 4, TODAY, [ines, secret, 'nope']);
    const rows = attendanceRows(h);
    assert.equal(rows.length, 3);
    assert.ok(rows.every((r) => r[2] !== secret));
    assert.deepEqual(get(h, 'c4', { date: TODAY }).attendance.presentIds, [ines]);
});

test('un appel pour un projet sans enfant actif est invalide', () => {
    const h = fresh();
    assert.equal(save(h, 'c47', 7, TODAY, []).code, 'invalid');
});

test('un CDP ne peut pas faire l\'appel d\'un autre projet', () => {
    const h = fresh();
    withKids(h);
    assert.equal(save(h, 'c47', 4, TODAY, []).success, true); // c47 a le projet 4
    assert.equal(save(h, 'c4', 7, TODAY, []).code, 'forbidden');
});

test('bilan : taux par enfant et pour le projet, séances comptées', () => {
    const h = fresh();
    const { ines, karim } = withKids(h);
    save(h, 'c4', 4, '2026-10-28', [ines]);
    save(h, 'c4', 4, TODAY, [ines, karim]);
    const { summary } = get(h, 'c4');
    assert.equal(summary.schoolYear, '2026-2027');
    assert.equal(summary.sessionCount, 2);
    assert.equal(summary.childCount, 3);
    assert.equal(summary.rate, 50);
    const byName = Object.fromEntries(summary.children.map((c) => [c.name, c]));
    assert.deepEqual([byName['Inès B.'].sessions, byName['Inès B.'].present, byName['Inès B.'].rate], [2, 2, 100]);
    assert.equal(byName['Karim D.'].rate, 50);
    assert.equal(byName['Lina M.'].rate, 0);
});

test('un enfant ajouté après un appel n\'est pas compté sur cet appel', () => {
    const h = fresh();
    const { ines } = withKids(h);
    save(h, 'c4', 4, '2026-10-28', [ines]);
    add(h, 'c4', 4, ['Zoé T.']);
    const zoe = get(h, 'c4').summary.children.find((c) => c.name === 'Zoé T.');
    assert.deepEqual([zoe.sessions, zoe.present, zoe.rate], [0, 0, null]);
    assert.equal(attendanceRows(h).length, 3);
});

test('année scolaire : le 31 août appartient à l\'année précédente', () => {
    const h = fresh();
    assert.equal(plain(h.ctx.schoolYearFor('2026-08-31')).label, '2025-2026');
    assert.equal(plain(h.ctx.schoolYearFor('2026-09-01')).label, '2026-2027');
    assert.equal(plain(h.ctx.schoolYearFor('2027-08-31')).end, '2027-08-31');
    const { ines } = withKids(h);
    save(h, 'c4', 4, '2026-08-31', [ines]);
    const { summary } = get(h, 'c4');
    assert.equal(summary.sessionCount, 0);
    assert.equal(summary.rate, null);
});

test('un enfant retiré garde son poids dans le taux du projet mais quitte les listes', () => {
    const h = fresh();
    const { ines, karim } = withKids(h);
    save(h, 'c4', 4, TODAY, [ines, karim]);
    const before = get(h, 'c4').summary;
    h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: ines });
    const after = get(h, 'c4');
    assert.equal(after.summary.rate, before.rate);
    assert.equal(after.summary.sessionCount, before.sessionCount);
    assert.equal(after.summary.childCount, 2);
    assert.ok(!after.summary.children.some((c) => c.name === 'Inès B.'));
    assert.deepEqual(after.attendance.presentIds, [karim]);
});

test('un projet sans appel a un taux null et zéro séance', () => {
    const h = fresh();
    withKids(h);
    const { summary } = get(h, 'c4');
    assert.equal(summary.sessionCount, 0);
    assert.equal(summary.rate, null);
});

test('Bureau : vue d\'ensemble de tous les projets, appel possible ; un CDP n\'a pas la vue d\'ensemble', () => {
    const h = fresh();
    const { ines } = withKids(h);
    save(h, 'c4', 4, '2026-10-28', [ines]);
    assert.equal(get(h, 'c4').overview, null);
    const overview = get(h, 'b1').overview;
    assert.equal(overview.length, 9);
    assert.deepEqual(overview.map((o) => o.projectId), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const four = overview.find((o) => o.projectId === 4);
    assert.deepEqual([four.childCount, four.sessionCount, four.rate], [3, 1, 33]);
    assert.equal(save(h, 'b1', 4, TODAY, [ines]).success, true);
    assert.equal(attendanceRows(h).at(-1)[4], 'b1');
});

test('dates converties en Date par Sheets : appels et bilans restent corrects, sans doublon', () => {
    const h = fresh({ dateifyMonthKeys: true });
    const { ines, karim } = withKids(h);
    save(h, 'c4', 4, TODAY, [ines]);
    assert.deepEqual(get(h, 'c4', { date: TODAY }).attendance.presentIds, [ines]);
    save(h, 'c4', 4, TODAY, [ines, karim]);
    assert.equal(attendanceRows(h).length, 3);
    const { summary } = get(h, 'c4');
    assert.equal(summary.sessionCount, 1);
    assert.equal(summary.rate, 67);
});
