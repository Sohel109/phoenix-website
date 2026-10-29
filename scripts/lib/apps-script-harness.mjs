// Charge google-apps-script.js dans un contexte Node avec un faux Google Sheet en mémoire.
// Sert aux tests du vote (scripts/test-vote-logic.mjs) et aux démonstrations locales.
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'google-apps-script.js');
const MONTH_KEY_SHEETS = ['Votes', 'VoteExclusions', 'TuteurDuMois'];

// Minuit à Paris d'une clé `YYYY-MM` (1er du mois) ou `YYYY-MM-DD`, comme la convertit Google Sheets.
function parisMidnight(key) {
    const [y, m, d = 1] = key.split('-').map(Number);
    const day = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    for (const offset of ['+01:00', '+02:00']) {
        const date = new Date(`${day}T00:00:00${offset}`);
        if (formatParis(date, 'yyyy-MM-dd') === day) return date;
    }
    throw new Error(`Date non convertible : ${key}`);
}

function formatParis(date, fmt) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
            .formatToParts(date)
            .map((p) => [p.type, p.value])
    );
    if (fmt === 'yyyy-MM') return `${parts.year}-${parts.month}`;
    if (fmt === 'yyyy-MM-dd') return `${parts.year}-${parts.month}-${parts.day}`;
    if (fmt === 'dd/MM/yyyy à HH:mm') return `${parts.day}/${parts.month}/${parts.year} à ${parts.hour}:${parts.minute}`;
    throw new Error(`Format non géré par le harness : ${fmt}`);
}

class FakeSheet {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.rows = [];
        this.formats = [];
    }
    getName() { return this.name; }
    appendRow(row) { this.rows.push([...row]); }
    getLastRow() { return this.rows.length; }
    deleteRow(r) { this.rows.splice(r - 1, 1); }
    getRange(r, c) {
        const sheet = this;
        if (typeof r === 'string') return { setNumberFormat(format) { sheet.formats.push([r, format]); } };
        return {
            getValue() { return sheet.rows[r - 1]?.[c - 1] ?? ''; },
            setValue(v) {
                while (sheet.rows.length < r) sheet.rows.push([]);
                sheet.rows[r - 1][c - 1] = v;
            },
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
        for (const u of options.users) this.users.appendRow([u.id, u.name, u.login ?? '', u.password ?? '', u.role ?? '', u.projects ?? '', u.email ?? '', '', '', u.childProjects ?? '']);
        this.sheets = new Map();
    }
    getSheets() { return [this.users, ...this.sheets.values()]; }
    getActiveSheet() { return this.users; }
    getSheetByName(name) { return this.sheets.get(name) ?? null; }
    insertSheet(name) {
        const sheet = new FakeSheet(name, this);
        this.sheets.set(name, sheet);
        return sheet;
    }
}

/**
 * @param {{ users: {id: string, name: string, role?: string, login?: string, password?: string}[], now?: string, dateifyMonthKeys?: boolean, numericIds?: boolean, propertiesBroken?: boolean }} options
 */
export function loadScript(options) {
    const state = { now: options.now ?? '2026-10-27', nowMs: Date.now() };
    const properties = new Map();
    const cache = new Map();
    const mailbox = [];
    const alerts = [];
    const ss = new FakeSpreadsheet(options);
    const sandbox = {
        console,
        JSON,
        Logger: { log() {} },
        SpreadsheetApp: { getActiveSpreadsheet: () => ss, getUi: () => ({ alert: (m) => alerts.push(m) }) },
        Session: { getScriptTimeZone: () => 'Europe/Paris' },
        GmailApp: { sendEmail: (to, subject) => { mailbox.push({ to, subject }); }, getAliases: () => [] },
        MailApp: { sendEmail: (m) => { mailbox.push({ to: m.to, subject: m.subject }); }, getRemainingDailyQuota: () => 100 },
        // Cache de script : les valeurs expirent selon l'horloge simulée (state.nowMs).
        CacheService: {
            getScriptCache: () => ({
                get: (k) => { const e = cache.get(k); return e && e.expiresAt > state.nowMs ? e.value : null; },
                put: (k, v, seconds = 600) => { cache.set(k, { value: v, expiresAt: state.nowMs + seconds * 1000 }); },
                remove: (k) => { cache.delete(k); },
            }),
        },
        ContentService: {
            MimeType: { JSON: 'json' },
            createTextOutput(text) { return { text, setMimeType() { return this; } }; },
        },
        LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
        Utilities: {
            formatDate: (date, _tz, fmt) => formatParis(date, fmt),
            getUuid: () => crypto.randomUUID(),
            // Comme Apps Script : tableau d'octets signés.
            computeHmacSha256Signature: (value, key) => Array.from(crypto.createHmac('sha256', key).update(value).digest()).map((b) => (b > 127 ? b - 256 : b)),
        },
        PropertiesService: {
            getScriptProperties: () => {
                if (options.propertiesBroken) throw new Error('PropertiesService indisponible');
                return { getProperty: (k) => properties.get(k) ?? null, setProperty: (k, v) => properties.set(k, v) };
            },
        },
    };
    const ctx = vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(SCRIPT_PATH, 'utf-8'), ctx, { filename: 'google-apps-script.js' });
    // Fixe "aujourd'hui" quand le script expose todayKeyParis().
    if (typeof ctx.todayKeyParis === 'function') ctx.todayKeyParis = () => state.now;
    if (typeof ctx.nowMs === 'function') ctx.nowMs = () => state.nowMs;

    return {
        ctx,
        setNow(key) { state.now = key; },
        advanceMs(ms) { state.nowMs += ms; },
        mailbox,
        alerts,
        /** Simule le déclencheur « lors d'une modification » après avoir coché la case d'envoi (colonne H) d'une ligne. */
        tickMailCheckbox(row) {
            ss.users.getRange(row, 8).setValue(true);
            const range = {
                getRow: () => row,
                getColumn: () => 8,
                getValue: () => ss.users.getRange(row, 8).getValue(),
                setValue: (v) => ss.users.getRange(row, 8).setValue(v),
            };
            ctx.envoyerMailConnexion({ source: ss, range });
        },
        /** Valeur du cache de script (ex. code de réinitialisation du mot de passe). */
        cacheValue(key) { return sandbox.CacheService.getScriptCache().get(key); },
        /** Formats numériques demandés sur des colonnes entières (ex. ['A:A', '@']) pour un onglet. */
        formats(name) { return ss.getSheetByName(name)?.formats ?? []; },
        usersCell(row, col) { return ss.users.getRange(row, col).getValue(); },
        setUsersCell(row, col, value) { ss.users.getRange(row, col).setValue(value); },
        /** Appel authentifié : ajoute un jeton valide pour l'identité annoncée, sauf si `body.token` est fourni. */
        call(action, body = {}) {
            const identity = body.voterId ?? body.requesterId;
            const withToken = 'token' in body || identity === undefined ? body : { ...body, token: ctx.createSessionToken(String(identity)) };
            return this.raw(action, withToken);
        },
        /** Appel tel quel, sans jeton ajouté. */
        raw(action, body = {}) {
            const out = ctx.doPost({ postData: { contents: JSON.stringify({ action, ...body }) } });
            return JSON.parse(out.text);
        },
        login(login, password) {
            return this.raw(undefined, { login, password });
        },
        /** Remplace une cellule d'un onglet créé par le script (simule une conversion faite par Google Sheets). */
        setSheetCell(name, row, col, value) { ss.getSheetByName(name).getRange(row, col).setValue(value); },
        sheet(name) {
            const sheet = ss.getSheetByName(name);
            return sheet ? sheet.rows.map((r) => [...r]) : null;
        },
    };
}
