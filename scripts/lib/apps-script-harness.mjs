// Charge google-apps-script.js dans un contexte Node avec un faux Google Sheet en mémoire.
// Sert aux tests du vote (scripts/test-vote-logic.mjs) et aux démonstrations locales.
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'google-apps-script.js');
const MONTH_KEY_SHEETS = ['Votes', 'VoteExclusions', 'TuteurDuMois'];

function parisMidnight(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    const offset = m >= 4 && m <= 10 ? '+02:00' : '+01:00';
    return new Date(`${y}-${String(m).padStart(2, '0')}-01T00:00:00${offset}`);
}

function formatParis(date, fmt) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
            .formatToParts(date)
            .map((p) => [p.type, p.value])
    );
    if (fmt === 'yyyy-MM') return `${parts.year}-${parts.month}`;
    if (fmt === 'yyyy-MM-dd') return `${parts.year}-${parts.month}-${parts.day}`;
    throw new Error(`Format non géré par le harness : ${fmt}`);
}

class FakeSheet {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.rows = [];
    }
    appendRow(row) { this.rows.push([...row]); }
    getLastRow() { return this.rows.length; }
    deleteRow(r) { this.rows.splice(r - 1, 1); }
    getRange(r, c) {
        const sheet = this;
        if (typeof r === 'string') return { setNumberFormat() {} };
        return {
            setValue(v) { sheet.rows[r - 1][c - 1] = v; },
            setNumberFormat() {},
        };
    }
    getDataRange() {
        const { dateifyMonthKeys, numericIds } = this.owner.options;
        const values = this.rows.map((row, i) =>
            row.map((cell, col) => {
                if (i === 0 || typeof cell !== 'string') return cell;
                if (dateifyMonthKeys && col === 0 && MONTH_KEY_SHEETS.includes(this.name) && /^\d{4}-\d{2}$/.test(cell)) {
                    return parisMidnight(cell);
                }
                if (numericIds && /^\d+$/.test(cell)) return Number(cell);
                return cell;
            })
        );
        return { getValues: () => values };
    }
}

class FakeSpreadsheet {
    constructor(options) {
        this.options = options;
        this.users = new FakeSheet('Utilisateurs', this);
        this.users.appendRow(['id', 'name', 'login', 'password', 'role', 'projects']);
        for (const u of options.users) this.users.appendRow([u.id, u.name, '', '', u.role ?? '', '']);
        this.sheets = new Map();
    }
    getSheets() { return [this.users, ...this.sheets.values()]; }
    getSheetByName(name) { return this.sheets.get(name) ?? null; }
    insertSheet(name) {
        const sheet = new FakeSheet(name, this);
        this.sheets.set(name, sheet);
        return sheet;
    }
}

/**
 * @param {{ users: {id: string, name: string, role?: string}[], now?: string, dateifyMonthKeys?: boolean, numericIds?: boolean }} options
 */
export function loadScript(options) {
    const state = { now: options.now ?? '2026-10-27' };
    const ss = new FakeSpreadsheet(options);
    const sandbox = {
        console,
        JSON,
        SpreadsheetApp: { getActiveSpreadsheet: () => ss },
        ContentService: {
            MimeType: { JSON: 'json' },
            createTextOutput(text) { return { text, setMimeType() { return this; } }; },
        },
        LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
        Utilities: { formatDate: (date, _tz, fmt) => formatParis(date, fmt) },
    };
    const ctx = vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(SCRIPT_PATH, 'utf-8'), ctx, { filename: 'google-apps-script.js' });
    // Fixe "aujourd'hui" quand le script expose todayKeyParis().
    if (typeof ctx.todayKeyParis === 'function') ctx.todayKeyParis = () => state.now;

    return {
        ctx,
        setNow(key) { state.now = key; },
        call(action, body = {}) {
            const out = ctx.doPost({ postData: { contents: JSON.stringify({ action, ...body }) } });
            return JSON.parse(out.text);
        },
        sheet(name) {
            const sheet = ss.getSheetByName(name);
            return sheet ? sheet.rows.map((r) => [...r]) : null;
        },
    };
}
