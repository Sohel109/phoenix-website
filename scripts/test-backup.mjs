import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const fresh = (now = '2026-10-30') => loadScript({ users: [{ id: 'b1', name: 'Bureau', role: 'bureau' }], now });
const FOLDER = 'Sauvegardes Phoenix';
const names = (h) => h.drive.folders.get(FOLDER).files.filter((f) => !f.trashed).map((f) => f.name).sort();
const dayKey = (n) => `2026-11-${String(n).padStart(2, '0')}`;

test('première sauvegarde : crée le dossier et une copie datée', () => {
    const h = fresh();
    assert.equal(h.ctx.sauvegarderLeSheet(), 'Sauvegarde Phoenix 2026-10-30');
    assert.deepEqual(names(h), ['Sauvegarde Phoenix 2026-10-30']);
});

test('deux exécutions le même jour ne créent qu une copie', () => {
    const h = fresh();
    h.ctx.sauvegarderLeSheet();
    h.ctx.sauvegarderLeSheet();
    assert.equal(names(h).length, 1);
    assert.equal(h.drive.folders.size, 1);
});

test('seules les 8 copies les plus récentes sont conservées', () => {
    const h = fresh();
    for (let d = 1; d <= 10; d++) {
        h.setNow(dayKey(d));
        h.ctx.sauvegarderLeSheet();
    }
    assert.deepEqual(names(h), [3, 4, 5, 6, 7, 8, 9, 10].map((d) => `Sauvegarde Phoenix ${dayKey(d)}`));
});

test('un fichier du dossier qui ne suit pas le motif et un fichier hors du dossier ne sont jamais supprimés', () => {
    const h = fresh();
    h.ctx.sauvegarderLeSheet();
    const folder = h.drive.folders.get(FOLDER);
    folder.files.push({ name: 'Notes du Bureau', trashed: false }, { name: 'Sauvegarde Phoenix 2026-10-30 (copie)', trashed: false });
    for (let d = 1; d <= 12; d++) {
        h.setNow(dayKey(d));
        h.ctx.sauvegarderLeSheet();
    }
    const alive = (name) => folder.files.some((f) => f.name === name && !f.trashed);
    assert.ok(alive('Notes du Bureau'));
    assert.ok(alive('Sauvegarde Phoenix 2026-10-30 (copie)'));
    assert.equal(h.drive.outsideFiles.every((f) => !f.trashed), true);
});

test('une sauvegarde plus ancienne lancée après coup ne fait pas disparaître les récentes', () => {
    const h = fresh();
    for (let d = 1; d <= 8; d++) {
        h.setNow(dayKey(d));
        h.ctx.sauvegarderLeSheet();
    }
    h.setNow('2026-10-01');
    h.ctx.sauvegarderLeSheet();
    assert.equal(names(h).length, 8);
    assert.ok(names(h).includes(`Sauvegarde Phoenix ${dayKey(8)}`));
    assert.equal(names(h).includes('Sauvegarde Phoenix 2026-10-01'), false);
});

test('installerSauvegardeHebdo : un seul déclencheur le lundi à 3 h, même lancée trois fois', () => {
    const h = fresh();
    h.triggers.push({ handler: 'envoyerMailConnexion', weekDay: undefined, hour: undefined });
    h.ctx.installerSauvegardeHebdo();
    h.ctx.installerSauvegardeHebdo();
    h.ctx.installerSauvegardeHebdo();
    const mine = h.triggers.filter((t) => t.handler === 'sauvegarderLeSheet');
    assert.equal(mine.length, 1);
    assert.equal(mine[0].weekDay, 'MONDAY');
    assert.equal(mine[0].hour, 3);
    assert.equal(h.triggers.filter((t) => t.handler === 'envoyerMailConnexion').length, 1);
});

test('installerSauvegardeHebdo fait aussi une première copie, pour que l autorisation Drive soit demandée tout de suite', () => {
    const h = fresh();
    h.ctx.installerSauvegardeHebdo();
    assert.deepEqual(names(h), ['Sauvegarde Phoenix 2026-10-30']);
});
