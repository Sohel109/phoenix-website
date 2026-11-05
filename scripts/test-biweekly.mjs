import assert from 'node:assert/strict';
import test from 'node:test';
import { isActiveBiweekly } from '../src/data/biweekly.ts';

const ANCHOR = '2026-W45'; // 2 au 8 novembre 2026, séance Jules Ferry

test('la semaine de référence est active, la suivante non', () => {
    assert.equal(isActiveBiweekly('2026-W45', ANCHOR), true);
    assert.equal(isActiveBiweekly('2026-W46', ANCHOR), false);
    assert.equal(isActiveBiweekly('2026-W47', ANCHOR), true);
});

test('avant la référence, l alternance continue', () => {
    assert.equal(isActiveBiweekly('2026-W44', ANCHOR), false);
    assert.equal(isActiveBiweekly('2026-W43', ANCHOR), true);
});

test('le changement d année ne casse pas l alternance (2026 a 53 semaines)', () => {
    // W45 + 8 semaines = W53, + 9 = 2027-W01 (non), + 10 = 2027-W02 (oui)
    assert.equal(isActiveBiweekly('2026-W53', ANCHOR), true);
    assert.equal(isActiveBiweekly('2027-W01', ANCHOR), false);
    assert.equal(isActiveBiweekly('2027-W02', ANCHOR), true);
});
