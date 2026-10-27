import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

// Ligne 2 de la feuille Utilisateurs = Alice.
const USERS = [
    { id: 'a1', name: 'Alice', role: 'tuteur', login: 'alice', password: 'pw-a', email: 'alice@example.com' },
    { id: 'b2', name: 'Bob', role: 'tuteur', login: 'bob', password: 'pw-b', email: 'bob@example.com' },
    { id: 'c3', name: 'Chloé', role: 'tuteur', login: 'chloe', password: 'pw-c', email: '' },
];
const fresh = () => loadScript({ users: USERS });

test('cocher la case envoie un mail et note « Envoyé le … » dans la colonne I', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    assert.equal(h.mailbox.length, 1);
    assert.equal(h.mailbox[0].to, 'alice@example.com');
    assert.match(h.usersCell(2, 9), /^Envoyé le \d{2}\/\d{2}\/\d{4} à \d{2}:\d{2}$/);
});

test('deux déclencheurs pour la même case (même seconde) : un seul mail part', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    h.tickMailCheckbox(2);
    assert.equal(h.mailbox.length, 1);
});

test('deux déclencheurs à une seconde d\'écart : un seul mail part', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    h.advanceMs(1000);
    h.tickMailCheckbox(2);
    assert.equal(h.mailbox.length, 1);
});

test('on peut renvoyer volontairement l\'accès au bout d\'une minute', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    h.advanceMs(61 * 1000);
    h.tickMailCheckbox(2);
    assert.equal(h.mailbox.length, 2);
});

test('deux membres différents cochés à la suite reçoivent chacun leur mail', () => {
    const h = fresh();
    h.tickMailCheckbox(2);
    h.tickMailCheckbox(3);
    assert.deepEqual(h.mailbox.map((m) => m.to), ['alice@example.com', 'bob@example.com']);
});

test('une adresse invalide ne consomme pas la fenêtre anti-doublon : le mail part une fois l\'adresse corrigée', () => {
    const h = fresh();
    h.tickMailCheckbox(4); // Chloé n'a pas d'adresse
    assert.equal(h.mailbox.length, 0);
    assert.equal(h.alerts.length, 1);
    h.setUsersCell(4, 7, 'chloe@example.com');
    h.tickMailCheckbox(4);
    assert.deepEqual(h.mailbox.map((m) => m.to), ['chloe@example.com']);
});
