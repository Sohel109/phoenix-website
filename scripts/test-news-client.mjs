import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNews, parseNewsAdmin, bodyBlocks, fitWithin, formatNewsDate, excerpt } from '../src/data/news.ts';

const ARTICLE = { slug: 'sortie-au-mucem', title: 'Sortie au Mucem', body: 'Texte.', coverId: 'photo123', photoIds: ['p2'], projectId: 'izzo', publishedAt: '2026-11-12' };
const REEL = { id: 'm1', shortcode: 'CODE1', permalink: 'https://www.instagram.com/reel/CODE1/', caption: 'Réel', timestamp: '2026-11-20T10:00:00.000Z', coverId: 'c1' };

test('parseNews accepte une vraie réponse', () => {
    const res = parseNews({ success: true, articles: [ARTICLE], reels: [REEL] });
    assert.equal(res.articles[0].slug, 'sortie-au-mucem');
    assert.equal(res.articles[0].projectId, 'izzo');
    assert.equal(res.reels[0].shortcode, 'CODE1');
});

test('parseNews rejette Action inconnue, une réponse de connexion, null', () => {
    assert.equal(parseNews({ success: false, message: 'Action inconnue' }), null);
    assert.equal(parseNews({ success: true, user: { id: '1' } }), null);
    assert.equal(parseNews(null), null);
    assert.equal(parseNews('x'), null);
});

test('parseNews écarte un article sans slug ou sans couverture et un réel sans code', () => {
    const res = parseNews({
        success: true,
        articles: [{ ...ARTICLE, slug: '' }, { ...ARTICLE, coverId: null }, { ...ARTICLE, photoIds: 'x' }, ARTICLE],
        reels: [{ ...REEL, shortcode: '' }, REEL],
    });
    assert.equal(res.articles.length, 1);
    assert.equal(res.reels.length, 1);
});

test('parseNews : projet absent devient null, photos non textuelles écartées', () => {
    const res = parseNews({ success: true, articles: [{ ...ARTICLE, projectId: null, photoIds: ['a', 3, 'b'] }], reels: [] });
    assert.equal(res.articles[0].projectId, null);
    assert.deepEqual(res.articles[0].photoIds, ['a', 'b']);
});

test('parseNewsAdmin : membres seulement pour le Bureau', () => {
    const admin = parseNewsAdmin({
        success: true,
        isBureau: true,
        articles: [{ id: 'x', slug: '', title: 'T', body: '', coverId: null, photoIds: [], projectId: null, published: false, publishedAt: '', updatedAt: '2026-11-25T10:00:00.000Z', updatedByName: 'Dan' }],
        members: [{ id: 'a1', name: 'Alice', role: 'tuteur', canPublish: true }],
    });
    assert.equal(admin.isBureau, true);
    assert.equal(admin.articles[0].published, false);
    assert.equal(admin.members[0].canPublish, true);
    assert.equal(parseNewsAdmin({ success: true, isBureau: false, articles: [] }).members, null);
    assert.equal(parseNewsAdmin({ success: false, code: 'forbidden' }), null);
});

test('bodyBlocks : paragraphes, lien https, ponctuation finale hors du lien', () => {
    const blocks = bodyBlocks('Bonjour à tous.\nDeuxième ligne.\n\n\nInscriptions sur https://helloasso.com/phoenix, merci !');
    assert.equal(blocks.length, 2);
    assert.deepEqual(blocks[0], [{ text: 'Bonjour à tous.\nDeuxième ligne.' }]);
    assert.deepEqual(blocks[1], [
        { text: 'Inscriptions sur ' },
        { text: 'https://helloasso.com/phoenix', href: 'https://helloasso.com/phoenix' },
        { text: ', merci !' },
    ]);
});

test('bodyBlocks : javascript: et <script> restent du texte', () => {
    const blocks = bodyBlocks('<script>alert(1)</script> javascript:alert(1)');
    assert.deepEqual(blocks, [[{ text: '<script>alert(1)</script> javascript:alert(1)' }]]);
    assert.deepEqual(bodyBlocks('   \n\n  '), []);
});

test('fitWithin : réduit sans agrandir', () => {
    assert.deepEqual(fitWithin(4000, 3000), { outW: 1600, outH: 1200 });
    assert.deepEqual(fitWithin(3000, 4000), { outW: 1200, outH: 1600 });
    assert.deepEqual(fitWithin(800, 600), { outW: 800, outH: 600 });
});

test('formatNewsDate et excerpt', () => {
    assert.equal(formatNewsDate('2026-11-12'), '12 novembre 2026');
    assert.equal(formatNewsDate('2026-01-01'), '1 janvier 2026');
    assert.equal(formatNewsDate(''), '');
    assert.equal(excerpt('Court.\n\nSuite.'), 'Court.');
    const long = 'mot '.repeat(60).trim();
    const cut = excerpt(long, 30);
    assert.ok(cut.endsWith('…'));
    assert.ok(cut.length <= 31);
    assert.ok(!cut.includes('mo…'));
});
