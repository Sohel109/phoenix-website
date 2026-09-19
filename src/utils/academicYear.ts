/**
 * Utilitaire de gestion dynamique de l'année universitaire / académique.
 * 
 * En France, l'année académique démarre le 1er septembre de l'année N
 * et se termine le 31 août de l'année N+1.
 * 
 * Règle de bascule automatique :
 * - De Septembre (mois 8 en JS) à Décembre (mois 11) :
 *   startYear = currentYear, endYear = currentYear + 1 (ex: en sept. 2026 -> "2026–2027")
 * - De Janvier (mois 0 en JS) à Août (mois 7) :
 *   startYear = currentYear - 1, endYear = currentYear (ex: en fév. 2027 -> "2026–2027")
 * 
 * Ainsi, chaque 1er septembre, l'année bascule automatiquement sur la nouvelle saison !
 */

export interface AcademicYearInfo {
    startYear: number;
    endYear: number;
    academicYear: string;               // "2026–2027" (avec tiret cadratin officiel)
    academicYearHyphen: string;         // "2026-2027" (avec trait d'union standard)
    academicYearSlug: string;           // "2026_2027" (pour les noms de fichiers)
    previousAcademicYear: string;       // "2025–2026" (Année N-1)
    previousAcademicYearHyphen: string; // "2025-2026"
    nextAcademicYear: string;           // "2027–2028" (Année N+1)
}

export function getAcademicYear(date: Date = new Date()): AcademicYearInfo {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0 = Janvier, ..., 8 = Septembre, ..., 11 = Décembre

    // Si on est en septembre (>= 8) : la nouvelle année académique a commencé
    // Si on est entre janvier et août (< 8) : on est dans la 2ème moitié de l'année universitaire
    const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    const endYear = startYear + 1;

    return {
        startYear,
        endYear,
        academicYear: `${startYear}–${endYear}`,
        academicYearHyphen: `${startYear}-${endYear}`,
        academicYearSlug: `${startYear}_${endYear}`,
        previousAcademicYear: `${startYear - 1}–${startYear}`,
        previousAcademicYearHyphen: `${startYear - 1}-${startYear}`,
        nextAcademicYear: `${endYear}–${endYear + 1}`,
    };
}
