import type { ManualHourEntry } from './planningData';

/** Numéro du projet d'un créneau (« slot-4-jeu » donne 4), ou null si l'identifiant n'a pas cette forme. */
export function projectIdOfSlot(slotId: string): number | null {
    const match = /^slot-(\d+)-/.exec(slotId);
    return match ? Number(match[1]) : null;
}

/**
 * Membres qui ont au moins une réservation (autre qu'annulée) sur un créneau du projet : les seuls à qui un chef de projet
 * peut attribuer des heures. Même règle que le script, qui la vérifie de son côté.
 */
export function eligibleMemberIds(bookings: { userId: string; slotId: string; status: string }[], projectId: number): Set<string> {
    const ids = new Set<string>();
    for (const booking of bookings) {
        if (booking.status !== 'annule' && projectIdOfSlot(booking.slotId) === projectId) ids.add(booking.userId);
    }
    return ids;
}

/** Le Bureau supprime tout ; un chef de projet seulement ses propres attributions, sur un de ses projets. */
export function canDeleteManualHour(entry: ManualHourEntry, user: { id: string; role: string }, manageableProjects: number[]): boolean {
    if (user.role === 'bureau') return true;
    return (
        user.role === 'chef_projet' &&
        entry.grantedById === user.id &&
        entry.projectId !== undefined &&
        manageableProjects.includes(entry.projectId)
    );
}
