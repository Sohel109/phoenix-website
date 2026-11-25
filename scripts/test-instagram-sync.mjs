import test from 'node:test';
import assert from 'node:assert/strict';
import { loadScript } from './lib/apps-script-harness.mjs';

const USERS = [{ id: 'd4', name: 'Dan', role: 'bureau', login: 'dan', password: 'pw-d' }];
const DAY = 24 * 3600 * 1000;

const video = (n, extra = {}) => ({
    id: `m${n}`,
    media_type: 'VIDEO',
    thumbnail_url: `https://cdn.example/thumb${n}.jpg`,
    permalink: `https://www.instagram.com/reel/CODE${n}/`,
    caption: `Réel ${n}`,
    // Une heure d'écart par numéro, au format d'Instagram.
    timestamp: new Date(Date.UTC(2026, 10, 1) + n * 3600 * 1000).toISOString().replace('.000Z', '+0000'),
    ...extra,
});
const image = (n) => ({ id: `i${n}`, media_type: 'IMAGE', media_url: 'https://cdn.example/i.jpg', permalink: `https://www.instagram.com/p/IMG${n}/`, caption: '', timestamp: `2026-11-${10 + n}T09:00:00+0000` });

// Fil Instagram simulé : `feed` est relu à chaque appel, on peut donc le modifier entre deux synchros.
function setup({ feed = [video(1), image(2), video(3)], token = 'TOKEN-1' } = {}) {
    const h = loadScript({ users: USERS, now: '2026-11-25' });
    const state = { feed, mediaStatus: 200, refreshed: 0 };
    if (token) h.setProperty('INSTAGRAM_TOKEN', token);
    h.setFetch((url) => {
        if (url.startsWith('https://graph.instagram.com/me/media')) {
            if (state.mediaStatus !== 200) return { code: state.mediaStatus, json: { error: { message: 'Error validating access token', code: 190 } } };
            return { json: { data: state.feed } };
        }
        if (url.startsWith('https://graph.instagram.com/refresh_access_token')) {
            state.refreshed++;
            return { json: { access_token: `TOKEN-${state.refreshed + 1}`, token_type: 'bearer', expires_in: 5184000 } };
        }
        if (url.startsWith('https://cdn.example/')) return { bytes: [0xff, 0xd8, 0xff, 0xe0, 9] };
        return { code: 404, text: '' };
    });
    return { h, state };
}
const sync = (h) => h.ctx.synchroInstagram();
const reelRows = (h) => (h.sheet('ReelsInstagram') ?? []).slice(1);

test('garde les vidéos, ignore les images, copie la couverture dans Drive', () => {
    const { h } = setup();
    sync(h);
    const rows = reelRows(h);
    assert.deepEqual(rows.map((r) => [r[0], r[1]]), [['m1', 'CODE1'], ['m3', 'CODE3']]);
    for (const r of rows) {
        const file = h.drive.files.get(r[5]);
        assert.equal(file.folder, 'Phoenix - Couvertures réels');
        assert.equal(file.trashed, false);
    }
    assert.ok(h.fetches[0].includes('access_token=TOKEN-1'));
    assert.ok(h.fetches[0].includes('fields=id,media_type,thumbnail_url,permalink,caption,timestamp'));
    assert.equal(h.property('INSTAGRAM_LAST_ERROR'), '');
});

test('deuxième synchro sans nouveauté : aucun nouveau fichier, légende mise à jour', () => {
    const { h, state } = setup();
    sync(h);
    const files = h.drive.files.size;
    state.feed = [video(1, { caption: 'Nouvelle légende' }), image(2), video(3)];
    sync(h);
    assert.equal(h.drive.files.size, files);
    assert.equal(reelRows(h).length, 2);
    assert.equal(reelRows(h)[0][3], 'Nouvelle légende');
});

test('fil complet (25 publications) : vidéo supprimée dans la fenêtre retirée, plus ancienne que la fenêtre gardée', () => {
    const { h, state } = setup({ feed: [video(3), video(2), video(1)] });
    sync(h);
    const cover3 = reelRows(h).find((r) => r[0] === 'm3')[5];
    // m3 supprimée sur Instagram ; m1 sort des 25 dernières publications lues.
    state.feed = [...Array.from({ length: 24 }, (_, i) => video(27 - i)), video(2)];
    sync(h);
    const ids = reelRows(h).map((r) => r[0]);
    assert.ok(!ids.includes('m3'));
    assert.ok(ids.includes('m1'));
    assert.ok(ids.includes('m2'));
    assert.equal(h.drive.files.get(cover3).trashed, true);
});

test('fil incomplet (moins de 25) : toute vidéo absente a été supprimée', () => {
    const { h, state } = setup({ feed: [video(3), video(1)] });
    sync(h);
    state.feed = [video(3)];
    sync(h);
    assert.deepEqual(reelRows(h).map((r) => r[0]), ['m3']);
});

test('clé expirée : rien ne change, erreur notée, getNews garde les réels connus', () => {
    const { h, state } = setup();
    sync(h);
    const before = JSON.stringify(h.sheet('ReelsInstagram'));
    const files = h.drive.files.size;
    state.mediaStatus = 400;
    state.feed = [];
    sync(h);
    assert.equal(JSON.stringify(h.sheet('ReelsInstagram')), before);
    assert.equal(h.drive.files.size, files);
    assert.match(h.property('INSTAGRAM_LAST_ERROR'), /Error validating access token/);
    assert.equal(h.get('getNews').reels.length, 2);
});

test('réponse illisible : rien ne change, erreur notée', () => {
    const { h } = setup();
    h.setFetch(() => ({ text: '<html>' }));
    sync(h);
    assert.equal(h.sheet('ReelsInstagram'), null);
    assert.ok(h.property('INSTAGRAM_LAST_ERROR'));
});

test('sans INSTAGRAM_TOKEN : aucun appel réseau, erreur notée', () => {
    const { h } = setup({ token: null });
    sync(h);
    assert.equal(h.fetches.length, 0);
    assert.match(h.property('INSTAGRAM_LAST_ERROR'), /INSTAGRAM_TOKEN/);
});

test('renouvellement de la clé : pas avant 30 jours, oui après', () => {
    const { h, state } = setup();
    sync(h);
    assert.equal(state.refreshed, 0);
    assert.ok(h.property('INSTAGRAM_TOKEN_REFRESHED_AT'));
    h.advanceMs(29 * DAY);
    sync(h);
    assert.equal(state.refreshed, 0);
    h.advanceMs(2 * DAY);
    sync(h);
    assert.equal(state.refreshed, 1);
    assert.equal(h.property('INSTAGRAM_TOKEN'), 'TOKEN-2');
    assert.ok(h.fetches.at(-1).includes('access_token=TOKEN-2') || h.fetches.some((u) => u.includes('me/media') && u.includes('TOKEN-2')));
});

test('installerSynchroInstagram deux fois : un seul déclencheur quotidien', () => {
    const { h } = setup();
    h.ctx.installerSynchroInstagram();
    h.ctx.installerSynchroInstagram();
    const mine = h.triggers.filter((t) => t.handler === 'synchroInstagram');
    assert.equal(mine.length, 1);
    assert.equal(mine[0].everyDays, 1);
    assert.equal(mine[0].hour, 6);
});

test('reelShortcode : /reel/, /reels/, /p/, adresse étrangère', () => {
    const { h } = setup();
    assert.equal(h.ctx.reelShortcode('https://www.instagram.com/reel/AbC_d-1/'), 'AbC_d-1');
    assert.equal(h.ctx.reelShortcode('https://www.instagram.com/reels/XyZ/'), 'XyZ');
    assert.equal(h.ctx.reelShortcode('https://www.instagram.com/p/Qq9/?igsh=1'), 'Qq9');
    assert.equal(h.ctx.reelShortcode('https://evil.example/reel/abc/'), '');
    assert.equal(h.ctx.reelShortcode(''), '');
});

test('getNews : 8 réels au plus, les plus récents, couverture servie par getPublicImage', () => {
    const feed = Array.from({ length: 10 }, (_, i) => video(10 - i));
    const { h } = setup({ feed });
    sync(h);
    const reels = h.get('getNews').reels;
    assert.equal(reels.length, 8);
    assert.equal(reels[0].shortcode, 'CODE10');
    assert.deepEqual(Object.keys(reels[0]).sort(), ['caption', 'coverId', 'id', 'permalink', 'shortcode', 'timestamp']);
    assert.equal(h.get('getPublicImage', { id: reels[0].coverId }).success, true);
});
