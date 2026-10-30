import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGouterData, describeAddedDates } from '../src/data/gouterResponse.ts';
import { buildGouterSheetModel } from '../src/utils/exportGouter.ts';

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

test('describeAddedDates résume les dates ajoutées et signale celles qui ont été ignorées', () => {
    assert.equal(describeAddedDates(2, []), '2 dates ajoutées.');
    assert.equal(describeAddedDates(1, []), '1 date ajoutée.');
    assert.equal(describeAddedDates(0, []), 'Aucune date ajoutée.');
    assert.equal(
        describeAddedDates(1, ['21/11/2026', '2026-10-01']),
        '1 date ajoutée. Lignes ignorées (format invalide, date passée, déjà prise ou après le 31 août) : 21/11/2026, 2026-10-01.'
    );
});

// ─── Export Excel d'un goûter (modèle de feuille, d'après « Goûter Foyer 28-10.xlsx ») ──────────

const slotsWith = (byHour) => Array.from({ length: 10 }, (_, i) => ({ hour: 9 + i, users: (byHour[9 + i] ?? []).map((name, n) => ({ userId: `u${i}${n}`, name })) }));
const itemsOf = (pairs) => pairs.map(([name, item], i) => ({ id: `a${i}`, item, userId: `u${i}`, name, canRemove: true }));
const EXAMPLE = {
    id: 'g1',
    projectId: 4,
    date: '2026-10-28',
    note: '',
    isPast: false,
    canManage: true,
    slots: slotsWith({ 10: ['Elyas', 'Mouna'], 11: ['Saadou', 'Mouna+Yacine'], 12: ['Nehemiah', 'Kahili +Mouna'], 13: ['Elyas'], 16: ['Nolwenn', 'Louise / Maëva'] }),
    items: itemsOf([['Kenza', 'Cookies'], ['Nehemiah', 'Quatre-quarts'], ['Kahili', 'Cookies et pâte à tartiner'], ['HS', 'brownie'], ['Kahili', 'Gateau'], ['Maëva', 'Gateau'], ['Sami', 'Pate à tartiner/confiture']]),
};

test('buildGouterSheetModel reprend la disposition de l exemple : titres, entêtes, créneaux et collations', () => {
    const model = buildGouterSheetModel(EXAMPLE, 'foyer');
    assert.equal(model.personColumns, 2);
    assert.equal(model.titleSpan, 3);
    assert.equal(model.rows.length, 2 + 10);
    assert.deepEqual(model.rows[0], ['Goûter foyer du 28/10', '', '', '', 'Collations et autres', '']);
    assert.deepEqual(model.rows[1], ['Créneaux', 'Personne 1', 'Personne 2', '', 'Prénom', "Ce que j'apporte"]);
    assert.deepEqual(model.rows[2], ['9h - 10h', '', '', '', 'Kenza', 'Cookies']);
    assert.deepEqual(model.rows[3], ['10h - 11h', 'Elyas', 'Mouna', '', 'Nehemiah', 'Quatre-quarts']);
    assert.deepEqual(model.rows[5], ['12h - 13h', 'Nehemiah', 'Kahili +Mouna', '', 'HS', 'brownie']);
    assert.deepEqual(model.rows[11], ['18h - 19h', '', '', '', '', '']);
    assert.deepEqual(model.rows[8], ['15h - 16h', '', '', '', 'Sami', 'Pate à tartiner/confiture']);
    assert.deepEqual(model.rows[9], ['16h - 17h', 'Nolwenn', 'Louise / Maëva', '', '', '']);
});

test('buildGouterSheetModel : un goûter sans apport garde dix lignes de créneaux et une partie droite vide', () => {
    const model = buildGouterSheetModel({ ...EXAMPLE, items: [] }, 'foyer');
    assert.equal(model.rows.length, 12);
    assert.ok(model.rows.slice(2).every((row) => row[4] === '' && row[5] === ''));
});

test('buildGouterSheetModel : un créneau à trois inscrits ajoute une colonne Personne et toutes les lignes ont la même longueur', () => {
    const model = buildGouterSheetModel({ ...EXAMPLE, slots: slotsWith({ 10: ['A', 'B', 'C'] }) }, 'foyer');
    assert.equal(model.personColumns, 3);
    assert.equal(model.titleSpan, 4);
    assert.deepEqual(model.rows[1], ['Créneaux', 'Personne 1', 'Personne 2', 'Personne 3', '', 'Prénom', "Ce que j'apporte"]);
    assert.deepEqual(model.rows[3].slice(0, 4), ['10h - 11h', 'A', 'B', 'C']);
    assert.ok(model.rows.every((row) => row.length === model.rows[0].length));
});

test('buildGouterSheetModel : plus de dix apports allongent le tableau sans perdre de ligne', () => {
    const items = itemsOf(Array.from({ length: 13 }, (_, i) => [`M${i}`, `Gâteau ${i}`]));
    const model = buildGouterSheetModel({ ...EXAMPLE, items }, 'foyer');
    assert.equal(model.rows.length, 2 + 13);
    assert.deepEqual(model.rows[14].slice(4), ['M12', 'Gâteau 12']);
    assert.equal(model.rows[14][0], '');
});

test('buildGouterSheetModel : un nom ou un apport qui commence par = reste du texte', () => {
    const model = buildGouterSheetModel({ ...EXAMPLE, slots: slotsWith({ 10: ['=1+1'] }), items: itemsOf([['@x', '=SOMME(A1)']]) }, 'foyer');
    assert.equal(model.rows[3][1], '=1+1');
    assert.deepEqual(model.rows[2].slice(4), ['@x', '=SOMME(A1)']);
});

test('buildGouterSheetModel : le nom de fichier ne contient aucun caractère interdit', () => {
    assert.equal(buildGouterSheetModel(EXAMPLE, 'foyer').fileName, 'Gouter foyer 28-10.xlsx');
    const name = buildGouterSheetModel({ ...EXAMPLE, date: '2026-11-14' }, 'A/B:C*D?"E<F>G|H\\I').fileName;
    assert.match(name, /^Gouter [^\\/:*?"<>|]+ 14-11\.xlsx$/);
});
