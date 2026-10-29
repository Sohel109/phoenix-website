import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

// Feuille Utilisateurs : ligne 2 = Alice, ligne 3 = Bob, ligne 4 = Chloé. Colonne D = mot de passe, H = case « Envoyé ».
const USERS = [
    { id: 'a1', name: 'Alice', role: 'tuteur', login: 'alice', password: 'pw-alice', email: 'alice@example.com' },
    { id: 'b2', name: 'Bob', role: 'tuteur', login: 'bob', password: 'pw-bob', email: 'bob@example.com' },
    { id: 'c3', name: 'Chloé', role: 'tuteur', login: 'chloe', password: 'pw-chloe', email: 'chloe@example.com' },
];
const HASH = /^h1\$[0-9a-f]{64}$/;
const fresh = (opts = {}) => loadScript({ users: USERS, ...opts });

// ─── Connexion ────────────────────────────────────────────────────────────────

test('un mot de passe encore en clair permet de se connecter, puis il est remplacé par une empreinte', () => {
    const h = fresh();
    assert.equal(h.login('alice', 'pw-alice').success, true);
    assert.match(h.usersCell(2, 4), HASH);
    assert.ok(!h.usersCell(2, 4).includes('pw-alice'));
});

test('après le remplacement, le même mot de passe fonctionne toujours et un mauvais est refusé', () => {
    const h = fresh();
    h.login('alice', 'pw-alice');
    assert.equal(h.login('alice', 'pw-alice').success, true);
    assert.equal(h.login('alice', 'pw-bob').success, false);
    assert.equal(h.login('alice', '').success, false);
});

test('une empreinte copiée dans le champ mot de passe ne permet pas de se connecter', () => {
    const h = fresh();
    h.login('alice', 'pw-alice');
    const stolen = h.usersCell(2, 4);
    assert.equal(h.login('alice', stolen).success, false);
});

test('deux membres avec le même mot de passe n\'ont pas la même empreinte', () => {
    const h = fresh({ users: [
        { id: 'a1', name: 'Alice', login: 'alice', password: 'meme' },
        { id: 'b2', name: 'Bob', login: 'bob', password: 'meme' },
    ] });
    h.login('alice', 'meme');
    h.login('bob', 'meme');
    assert.notEqual(h.usersCell(2, 4), h.usersCell(3, 4));
});

test('un mot de passe numérique (converti en nombre par Google Sheets) reste utilisable', () => {
    const h = fresh({ users: [{ id: 'a1', name: 'Alice', login: 'alice', password: '123456' }], numericIds: true });
    assert.equal(h.login('alice', '123456').success, true);
    assert.equal(h.login('alice', '123456').success, true);
});

test('si le secret est indisponible, la connexion avec un mot de passe en clair marche encore', () => {
    const h = fresh({ propertiesBroken: true });
    assert.equal(h.login('alice', 'pw-alice').success, true);
    assert.equal(h.usersCell(2, 4), 'pw-alice');
});

// ─── Changement et réinitialisation ───────────────────────────────────────────

test('changer son mot de passe enregistre une empreinte, jamais le mot de passe', () => {
    const h = fresh();
    const out = h.raw('changePassword', { userId: 'a1', oldPassword: 'pw-alice', newPassword: 'nouveau-mdp' });
    assert.equal(out.success, true);
    assert.match(h.usersCell(2, 4), HASH);
    assert.equal(h.login('alice', 'nouveau-mdp').success, true);
    assert.equal(h.login('alice', 'pw-alice').success, false);
});

test('changer son mot de passe vérifie l\'ancien, qu\'il soit en clair ou déjà protégé', () => {
    const h = fresh();
    assert.equal(h.raw('changePassword', { userId: 'a1', oldPassword: 'faux', newPassword: 'nouveau-mdp' }).success, false);
    h.login('alice', 'pw-alice');
    assert.equal(h.raw('changePassword', { userId: 'a1', oldPassword: 'faux', newPassword: 'nouveau-mdp' }).success, false);
    assert.equal(h.raw('changePassword', { userId: 'a1', oldPassword: 'pw-alice', newPassword: 'nouveau-mdp' }).success, true);
});

test('changer son mot de passe sans secret disponible échoue sans écrire de mot de passe en clair', () => {
    const h = fresh({ propertiesBroken: true });
    const out = h.raw('changePassword', { userId: 'a1', oldPassword: 'pw-alice', newPassword: 'nouveau-mdp' });
    assert.equal(out.success, false);
    assert.equal(h.usersCell(2, 4), 'pw-alice');
});

test('« mot de passe oublié » : le nouveau mot de passe est enregistré sous forme d\'empreinte', () => {
    const h = fresh();
    assert.equal(h.raw('requestResetCode', { login: 'alice' }).success, true);
    const code = h.cacheValue('reset_code_alice');
    const out = h.raw('confirmResetPassword', { login: 'alice', code, newPassword: 'reinitialise' });
    assert.equal(out.success, true);
    assert.match(h.usersCell(2, 4), HASH);
    assert.equal(h.login('alice', 'reinitialise').success, true);
});

// ─── Mail d'accès ─────────────────────────────────────────────────────────────

test('cocher la case envoie le mail puis remplace le mot de passe par une empreinte', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    assert.equal(h.mailbox.length, 1);
    assert.match(h.usersCell(2, 4), HASH);
    assert.equal(h.login('alice', 'pw-alice').success, true);
});

test('recocher la case quand le mot de passe est déjà protégé n\'envoie aucun mail et prévient', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    h.advanceMs(61 * 1000);
    h.tickMailCheckbox(2);
    assert.equal(h.mailbox.length, 1);
    assert.equal(h.alerts.length, 1);
    assert.match(h.alerts[0], /colonne D/);
    assert.equal(h.usersCell(2, 8), false);
});

test('réinitialiser à la main : un nouveau mot de passe temporaire en colonne D, case recochée, mail envoyé puis protégé', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    h.advanceMs(61 * 1000);
    h.setUsersCell(2, 4, 'temporaire-9');
    h.tickMailCheckbox(2);
    assert.equal(h.mailbox.length, 2);
    assert.match(h.usersCell(2, 4), HASH);
    assert.equal(h.login('alice', 'temporaire-9').success, true);
});

// ─── Migration des mots de passe existants ────────────────────────────────────

test('la migration protège les comptes déjà envoyés et laisse en clair ceux dont le mail n\'est pas parti', () => {
    const h = fresh();
    h.setUsersCell(2, 8, true);
    h.setUsersCell(3, 8, true);
    h.setUsersCell(4, 8, false); // Chloé : mail pas encore envoyé
    h.ctx.protegerTousLesMotsDePasse();
    assert.match(h.usersCell(2, 4), HASH);
    assert.match(h.usersCell(3, 4), HASH);
    assert.equal(h.usersCell(4, 4), 'pw-chloe');
    assert.equal(h.login('alice', 'pw-alice').success, true);
    assert.equal(h.login('bob', 'pw-bob').success, true);
    assert.equal(h.login('chloe', 'pw-chloe').success, true);
});

test('la migration relancée ne touche pas aux empreintes existantes', () => {
    const h = fresh();
    h.setUsersCell(2, 8, true);
    h.ctx.protegerTousLesMotsDePasse();
    const first = h.usersCell(2, 4);
    h.ctx.protegerTousLesMotsDePasse();
    assert.equal(h.usersCell(2, 4), first);
    assert.equal(h.login('alice', 'pw-alice').success, true);
});

test('aucune action ne renvoie le mot de passe ou son empreinte au navigateur', () => {
    const h = fresh();
    h.login('alice', 'pw-alice');
    const out = JSON.stringify([h.login('alice', 'pw-alice'), h.raw('getPlanningData', {})]);
    assert.ok(!out.includes('pw-alice'));
    assert.ok(!out.includes('h1$'));
});
