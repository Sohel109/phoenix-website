import type { Gouter } from '../data/planningData';

/**
 * Disposition de la feuille Excel d'un goûter, d'après le classeur « Goûter Foyer 28-10 » :
 * à gauche les créneaux (une colonne par personne), une colonne vide, à droite « Collations et autres ».
 */
export interface GouterSheetModel {
    fileName: string;
    /** Nombre de colonnes « Personne n » : au moins deux, davantage si un créneau a plus de deux inscrits. */
    personColumns: number;
    /** Largeur, en colonnes, du titre de gauche (colonne des créneaux comprise). */
    titleSpan: number;
    /** Ligne 0 : titres, ligne 1 : entêtes, puis une ligne par créneau (au moins dix) avec les apports en face. */
    rows: string[][];
}

// Libellé « 9h - 10h » (même format que la page ; pas d'import ici, les tests de ce module tournent directement sous Node).
const slotLabel = (hour: number) => `${hour}h - ${hour + 1}h`;

/** « 28/10 » pour une date AAAA-MM-JJ. */
const dayMonth = (date: string, separator: string) => `${date.slice(8, 10)}${separator}${date.slice(5, 7)}`;

// Caractères interdits dans un nom de fichier (Windows, macOS, Linux).
const FORBIDDEN_IN_FILE_NAME = /[\\/:*?"<>|]/g;

export function buildGouterSheetModel(gouter: Gouter, projectName: string): GouterSheetModel {
    const personColumns = Math.max(2, ...gouter.slots.map((slot) => slot.users.length));
    const width = 1 + personColumns + 1 + 2;
    const rightStart = personColumns + 2;

    const row = (): string[] => new Array<string>(width).fill('');

    const titles = row();
    titles[0] = `Goûter ${projectName} du ${dayMonth(gouter.date, '/')}`;
    titles[rightStart] = 'Collations et autres';

    const headers = row();
    headers[0] = 'Créneaux';
    for (let n = 1; n <= personColumns; n++) headers[n] = `Personne ${n}`;
    headers[rightStart] = 'Prénom';
    headers[rightStart + 1] = "Ce que j'apporte";

    const rows: string[][] = [titles, headers];
    const bodyLength = Math.max(gouter.slots.length, gouter.items.length);
    for (let i = 0; i < bodyLength; i++) {
        const line = row();
        const slot = gouter.slots[i];
        if (slot) {
            line[0] = slotLabel(slot.hour);
            slot.users.forEach((user, n) => { line[1 + n] = user.name; });
        }
        const item = gouter.items[i];
        if (item) {
            line[rightStart] = item.name;
            line[rightStart + 1] = item.item;
        }
        rows.push(line);
    }

    const safeName = projectName.replace(FORBIDDEN_IN_FILE_NAME, '-').replace(/\s+/g, ' ').trim();
    return { fileName: `Gouter ${safeName} ${dayMonth(gouter.date, '-')}.xlsx`, personColumns, titleSpan: 1 + personColumns, rows };
}

/**
 * Construit le classeur dans le navigateur et le télécharge. La bibliothèque n'est chargée qu'au clic, et chaque cellule
 * est écrite comme du texte : un nom ou un apport qui commence par « = » ne devient jamais une formule.
 */
export async function downloadGouterXlsx(gouter: Gouter, projectName: string): Promise<void> {
    const { default: writeXlsxFile } = await import('write-excel-file/universal');
    const model = buildGouterSheetModel(gouter, projectName);
    const rightStart = model.personColumns + 2;
    const border = { borderColor: '#6F2B75', borderStyle: 'thin' as const };

    const cell = (value: string, extra: Record<string, unknown> = {}) =>
        value === '' && !('columnSpan' in extra) ? null : { value, type: String, alignVertical: 'center' as const, ...extra };

    const data = model.rows.map((line, index) =>
        line.map((value, col) => {
            const isGap = col === model.personColumns + 1;
            if (isGap) return null;
            const inRightTable = col >= rightStart;
            if (index === 0) {
                // Titres fusionnés : à gauche sur le tableau des créneaux, à droite sur les deux colonnes des collations.
                if (col === 0) return cell(value, { fontWeight: 'bold' as const, fontSize: 14, align: 'center' as const, columnSpan: model.titleSpan, ...border });
                if (col === rightStart) return cell(value, { fontWeight: 'bold' as const, fontSize: 14, align: 'center' as const, columnSpan: 2, ...border });
                return null;
            }
            if (index === 1) return cell(value, { fontWeight: 'bold' as const, backgroundColor: '#ECDDFD', ...border });
            // Lignes du corps : bordures seulement là où il y a un tableau, y compris pour les cases vides des créneaux.
            if (!inRightTable) return { value, type: String, alignVertical: 'center' as const, ...border };
            return value === '' && !line[rightStart] && !line[rightStart + 1] ? null : { value, type: String, alignVertical: 'center' as const, ...border };
        })
    );

    const columns = [{ width: 14 }, ...Array.from({ length: model.personColumns }, () => ({ width: 22 })), { width: 4 }, { width: 18 }, { width: 38 }];
    const blob = await writeXlsxFile(data, { columns }).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = model.fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
