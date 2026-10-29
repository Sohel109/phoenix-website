import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [
    { id: 'b1', name: 'Bureau', role: 'bureau', login: 'b1', password: 'x', childProjects: '2' },
    { id: 'c4', name: 'Chef Quatre', role: 'chef_projet', login: 'c4', password: 'x', childProjects: '4' },
    { id: 'c47', name: 'Chef Quatre Sept', role: 'chef_projet', login: 'c47', password: 'x', childProjects: '4,7' },
    { id: 'c0', name: 'Chef Sans Projet', role: 'chef_projet', login: 'c0', password: 'x', childProjects: '' },
    { id: 't4', name: 'Tuteur', role: 'tuteur', login: 't4', password: 'x', childProjects: '4' },
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

// ─── Appel par séance (créneau + semaine), correction et bilans ───────────────
// Aujourd'hui = jeudi 29 octobre 2026 = semaine 2026-W44 (lundi 26 octobre au dimanche 1er novembre).

const WEEK = '2026-W44';
const save = (h, requesterId, projectId, slotId, weekKey, presentIds) =>
    plain(h.call('saveChildAttendance', { requesterId, projectId, slotId, weekKey, presentIds }));
const attendanceRows = (h) => (h.sheet('PresencesSeances') ?? []).slice(1);

/** Projet 4 avec trois enfants ; renvoie leurs identifiants. */
function withKids(h) {
    add(h, 'c4', 4, ['Inès B.', 'Karim D.', 'Lina M.']);
    const [ines, karim, lina] = get(h, 'c4').children.map((c) => c.id);
    return { ines, karim, lina };
}

test('appel enregistré pour une séance : une ligne par enfant, présents et absents, avec qui a validé', () => {
    const h = fresh();
    const { ines, karim, lina } = withKids(h);
    const out = save(h, 'c4', 4, 'slot-4-jeu', WEEK, [ines, karim]);
    assert.equal(out.success, true);
    assert.equal(out.saved, 3);
    const rows = attendanceRows(h).map((r) => [String(r[0]), r[1], r[2], r[3], r[4], r[5]]);
    assert.deepEqual(rows, [
        ['4', 'slot-4-jeu', WEEK, ines, true, 'c4'],
        ['4', 'slot-4-jeu', WEEK, karim, true, 'c4'],
        ['4', 'slot-4-jeu', WEEK, lina, false, 'c4'],
    ]);
    const data = get(h, 'c4', { weekKey: WEEK, slotId: 'slot-4-jeu' });
    assert.deepEqual(data.attendance, { slotId: 'slot-4-jeu', weekKey: WEEK, presentIds: [ines, karim] });
    assert.deepEqual(data.doneSlots, ['slot-4-jeu']);
    assert.equal(get(h, 'c4', { weekKey: WEEK, slotId: 'slot-4-mar' }).attendance, null);
    assert.deepEqual(get(h, 'c4', { weekKey: '2026-W43' }).doneSlots, []);
});

test('deux séances de la même semaine sont indépendantes', () => {
    const h = fresh();
    const { ines, karim } = withKids(h);
    save(h, 'c4', 4, 'slot-4-lun', WEEK, [ines]);
    save(h, 'c4', 4, 'slot-4-mar', WEEK, [karim]);
    save(h, 'c4', 4, 'slot-4-mar', WEEK, []);
    assert.equal(attendanceRows(h).length, 6);
    assert.deepEqual(get(h, 'c4', { weekKey: WEEK, slotId: 'slot-4-lun' }).attendance.presentIds, [ines]);
    assert.deepEqual(get(h, 'c4', { weekKey: WEEK }).doneSlots.sort(), ['slot-4-lun', 'slot-4-mar']);
});

test('correction : réenregistrer la même séance remplace l\'appel', () => {
    const h = fresh();
    const { ines, karim, lina } = withKids(h);
    save(h, 'c4', 4, 'slot-4-jeu', WEEK, [ines, karim]);
    save(h, 'c4', 4, 'slot-4-jeu', WEEK, [lina]);
    assert.equal(attendanceRows(h).length, 3);
    assert.deepEqual(get(h, 'c4', { weekKey: WEEK, slotId: 'slot-4-jeu' }).attendance.presentIds, [lina]);
});

test('une séance qui n\'existe pas ou qui est d\'un autre projet est refusée et n\'écrit rien', () => {
    const h = fresh();
    const { ines } = withKids(h);
    for (const slotId of ['slot-7-mer', 'slot-4-xyz', 'nope', '', undefined, 'slot-44-lun']) {
        assert.equal(save(h, 'c4', 4, slotId, WEEK, [ines]).code, 'invalid', String(slotId));
    }
    for (const weekKey of ['2026-44', '2026-W54', '2026-W00', '2025-W53', '29/10/2026', '', undefined]) {
        assert.equal(save(h, 'c4', 4, 'slot-4-jeu', weekKey, [ines]).code, 'invalid', String(weekKey));
    }
    assert.equal(attendanceRows(h).length, 0);
});

test('une séance à venir est refusée, celle d\'aujourd\'hui est acceptée', () => {
    const h = fresh();
    const { ines } = withKids(h);
    assert.equal(save(h, 'c4', 4, 'slot-4-ven', WEEK, [ines]).code, 'invalid'); // vendredi 30 octobre
    assert.equal(save(h, 'c4', 4, 'slot-4-lun', '2026-W45', [ines]).code, 'invalid');
    assert.equal(attendanceRows(h).length, 0);
    assert.equal(save(h, 'c4', 4, 'slot-4-jeu', WEEK, [ines]).success, true); // jeudi 29 octobre
});

test('la date d\'une séance se déduit de la semaine et du jour du créneau, y compris aux frontières d\'année', () => {
    const h = fresh();
    const date = (week, slot) => h.ctx.sessionDateKey(week, slot);
    assert.equal(date(WEEK, 'slot-4-jeu'), '2026-10-29');
    assert.equal(date(WEEK, 'slot-2-sam'), '2026-10-31');
    assert.equal(date('2026-W01', 'slot-4-lun'), '2025-12-29');
    assert.equal(date('2026-W53', 'slot-4-ven'), '2027-01-01');
    assert.equal(date('2025-W53', 'slot-4-lun'), null);
});

test('un identifiant d\'enfant d\'un autre projet dans presentIds est ignoré', () => {
    const h = fresh();
    const { ines } = withKids(h);
    add(h, 'c47', 7, ['Secret S.']);
    const secret = get(h, 'c47', { projectId: 7 }).children[0].id;
    save(h, 'c4', 4, 'slot-4-jeu', WEEK, [ines, secret, 'nope']);
    const rows = attendanceRows(h);
    assert.equal(rows.length, 3);
    assert.ok(rows.every((r) => r[3] !== secret));
    assert.deepEqual(get(h, 'c4', { weekKey: WEEK, slotId: 'slot-4-jeu' }).attendance.presentIds, [ines]);
});

test('un appel pour un projet sans enfant actif est invalide', () => {
    const h = fresh();
    assert.equal(save(h, 'c47', 7, 'slot-7-mer', '2026-W43', []).code, 'invalid');
});

test('un CDP ne peut pas faire l\'appel d\'un autre projet', () => {
    const h = fresh();
    withKids(h);
    assert.equal(save(h, 'c47', 4, 'slot-4-jeu', WEEK, []).success, true); // c47 a le projet 4
    assert.equal(save(h, 'c4', 7, 'slot-7-mer', WEEK, []).code, 'forbidden');
});

test('lecture : la semaine par défaut est la semaine en cours, une semaine ou une séance invalide est refusée', () => {
    const h = fresh();
    withKids(h);
    assert.equal(get(h, 'c4').weekKey, WEEK);
    assert.equal(get(h, 'c4', { weekKey: '2026-W99' }).code, 'invalid');
    assert.equal(get(h, 'c4', { weekKey: WEEK, slotId: 'slot-7-mer' }).code, 'invalid');
    assert.equal(get(h, 'c4').slotId, null);
});

test('bilan : taux par enfant et pour le projet, séances comptées', () => {
    const h = fresh();
    const { ines, karim } = withKids(h);
    save(h, 'c4', 4, 'slot-4-lun', WEEK, [ines]);
    save(h, 'c4', 4, 'slot-4-jeu', WEEK, [ines, karim]);
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
    save(h, 'c4', 4, 'slot-4-lun', WEEK, [ines]);
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
    save(h, 'c4', 4, 'slot-4-lun', '2026-W35', [ines]); // lundi 24 août 2026, année 2025-2026
    const { summary } = get(h, 'c4');
    assert.equal(summary.sessionCount, 0);
    assert.equal(summary.rate, null);
});

test('un enfant retiré garde son poids dans le taux du projet mais quitte les listes', () => {
    const h = fresh();
    const { ines, karim } = withKids(h);
    save(h, 'c4', 4, 'slot-4-jeu', WEEK, [ines, karim]);
    const before = get(h, 'c4').summary;
    h.call('removeChild', { requesterId: 'c4', projectId: 4, childId: ines });
    const after = get(h, 'c4', { weekKey: WEEK, slotId: 'slot-4-jeu' });
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
    save(h, 'c4', 4, 'slot-4-lun', WEEK, [ines]);
    assert.equal(get(h, 'c4').overview, null);
    const overview = get(h, 'b1').overview;
    assert.equal(overview.length, 9);
    assert.deepEqual(overview.map((o) => o.projectId), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const four = overview.find((o) => o.projectId === 4);
    assert.deepEqual([four.childCount, four.sessionCount, four.rate], [3, 1, 33]);
    assert.equal(save(h, 'b1', 4, 'slot-4-jeu', WEEK, [ines]).success, true);
    assert.equal(attendanceRows(h).at(-1)[5], 'b1');
});

// ─── Corrections de la relecture finale ───────────────────────────────────────

test('C1 : la colonne projets que chacun peut changer lui-même (F) ne donne aucun accès aux enfants', () => {
    const h = fresh({ users: [
        { id: 'c9', name: 'Chef Neuf', role: 'chef_projet', login: 'c9', password: 'x', projects: '1,2,3,4,5,6,7,8,9' },
    ] });
    const out = get(h, 'c9');
    assert.deepEqual(out.projects, []);
    assert.equal(get(h, 'c9', { projectId: 4 }).code, 'forbidden');
});

test('C1 : initialiserProjetsEnfants recopie les projets des CDP seulement, sans écraser ce que le Bureau a rempli', () => {
    const h = fresh({ users: [
        { id: 'c4', name: 'Chef Quatre', role: 'chef_projet', login: 'c4', password: 'x', projects: '4' },
        { id: 'c7', name: 'Chef Sept', role: 'chef_projet', login: 'c7', password: 'x', projects: '7', childProjects: '8' },
        { id: 't4', name: 'Tuteur', role: 'tuteur', login: 't4', password: 'x', projects: '4' },
        { id: 'b1', name: 'Bureau', role: 'bureau', login: 'b1', password: 'x', projects: '2' },
    ] });
    h.ctx.initialiserProjetsEnfants();
    assert.equal(String(h.usersCell(2, 10)), '4');
    assert.equal(String(h.usersCell(3, 10)), '8');
    assert.equal(String(h.usersCell(4, 10)), '');
    assert.equal(String(h.usersCell(5, 10)), '');
    assert.equal(h.usersCell(1, 10), 'Projets enfants');
    assert.deepEqual(get(h, 'c4').projects, [4]);
});

test('C2 : un nom qui commence par = + - @ ne devient jamais une formule', () => {
    const h = fresh();
    const out = add(h, 'c4', 4, ['=TEXTJOIN(",",1,Enfants!C:C)', '+33 1', '-x', '@SUM(1)', '=== ', 'Inès B.']);
    assert.equal(out.success, true);
    const stored = h.sheet('Enfants').slice(1).map((r) => r[2]);
    assert.ok(stored.every((n) => !/^[=+\-@]/.test(n)), JSON.stringify(stored));
    assert.ok(stored.includes('Inès B.'));
    assert.equal(stored.length, 5);
    assert.equal(add(h, 'c4', 4, ['===', '+', '@@']).code, 'invalid');
});

test('C2 et I1 : les colonnes de noms, d\'identifiants, de séances et de semaines sont créées au format texte', () => {
    const h = fresh();
    add(h, 'c4', 4, ['Inès B.']);
    const kids = h.formats('Enfants').filter(([, f]) => f === '@').map(([range]) => range);
    assert.ok(kids.includes('A:A') && kids.includes('C:C'), JSON.stringify(kids));
    save(h, 'c4', 4, 'slot-4-jeu', WEEK, []);
    const sessions = h.formats('PresencesSeances').filter(([, f]) => f === '@').map(([range]) => range);
    for (const column of ['B:B', 'C:C', 'D:D']) assert.ok(sessions.includes(column), JSON.stringify(sessions));
});

test('I1 : un identifiant d\'enfant ne peut jamais être lu comme un nombre par Sheets', () => {
    const h = fresh();
    add(h, 'c4', 4, Array.from({ length: 60 }, (_, i) => `Enfant ${i} X.`));
    const ids = get(h, 'c4').children.map((c) => c.id);
    assert.equal(new Set(ids).size, 60);
    for (const id of ids) {
        assert.match(id, /^k[0-9a-f]{7}$/);
        assert.ok(Number.isNaN(Number(id)), id);
    }
});
