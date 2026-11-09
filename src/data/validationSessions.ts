/**
 * Regroupe les réservations d'une semaine par séance (créneau), pour la page « Valider les présences ».
 * Module pur : aucun accès au contexte ni au réseau.
 */
import type { Booking, TimeSlot } from './planningData';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export interface ValidationMember {
    bookingId: string;
    userName: string;
    status: Booking['status'];
}

export interface ValidationSession {
    slotId: string;
    projectId: number;
    projectName: string;
    day: string;
    startTime: string;
    endTime: string;
    members: ValidationMember[];
    counts: { prevu: number; confirme: number; absent: number };
    /** Réservations encore en attente : celles que « Tout confirmer » validerait. */
    pendingIds: string[];
    /** Plus rien à valider dans cette séance. */
    done: boolean;
}

export function groupValidationSessions(input: {
    bookings: Booking[];
    slots: TimeSlot[];
    weekKey: string;
    projectNames: Record<number, string>;
}): ValidationSession[] {
    const { bookings, slots, weekKey, projectNames } = input;
    const sessions: ValidationSession[] = [];

    for (const slot of slots) {
        const members: ValidationMember[] = bookings
            .filter((b) => b.weekKey === weekKey && b.slotId === slot.id && b.status !== 'annule')
            .map((b) => ({ bookingId: b.id, userName: b.userName || b.userId, status: b.status }))
            .sort((a, b) => a.userName.localeCompare(b.userName, 'fr'));
        if (members.length === 0) continue;

        const counts = { prevu: 0, confirme: 0, absent: 0 };
        for (const m of members) {
            if (m.status === 'prevu' || m.status === 'confirme' || m.status === 'absent') counts[m.status] += 1;
        }
        sessions.push({
            slotId: slot.id,
            projectId: slot.projectId,
            projectName: projectNames[slot.projectId] ?? `Projet ${slot.projectId}`,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            members,
            counts,
            pendingIds: members.filter((m) => m.status === 'prevu').map((m) => m.bookingId),
            done: counts.prevu === 0,
        });
    }

    return sessions.sort((a, b) =>
        Number(a.done) - Number(b.done)
        || a.projectName.localeCompare(b.projectName, 'fr')
        || DAYS.indexOf(a.day) - DAYS.indexOf(b.day)
        || a.startTime.localeCompare(b.startTime));
}
