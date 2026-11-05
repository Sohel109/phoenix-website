/**
 * Alternance une semaine sur deux, calée sur une semaine de référence (active).
 * Compte les semaines réelles depuis cette référence plutôt que la parité du
 * numéro ISO, qui se casse au changement d'année (2026 a 53 semaines).
 */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function weekStartUtc(weekKey: string): number {
    const [year, week] = weekKey.split('-W').map(Number);
    const jan4 = Date.UTC(year, 0, 4);
    const jan4Day = new Date(jan4).getUTCDay() || 7;
    return jan4 - (jan4Day - 1) * 86400000 + (week - 1) * WEEK_MS;
}

export function isActiveBiweekly(weekKey: string, anchorWeekKey: string): boolean {
    const diff = Math.round((weekStartUtc(weekKey) - weekStartUtc(anchorWeekKey)) / WEEK_MS);
    return Math.abs(diff) % 2 === 0;
}
