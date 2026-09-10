import { useMemo, useState, useEffect, useCallback } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { timeSlots, SPECIAL_EVENTS, formatWeekLabel } from '../data/planningData';
import { projectsData } from '../data/projectsData';

export type NotificationCategory = 'all' | 'seance' | 'event';

export interface PlanningNotification {
    id: string;
    category: 'seance' | 'event';
    type: 
        | 'seance_confirmee'
        | 'seance_absente'
        | 'seance_prevue'
        | 'event_confirme'
        | 'event_absent'
        | 'event_non_renseigne'
        | 'dispo_manquante'
        | 'validation_requise';
    title: string;
    description: string;
    status: 'success' | 'warning' | 'error' | 'info';
    dateLabel?: string;
    to: string;
    timestamp: number;
    read: boolean;
}

export function usePlanningNotifications() {
    const { currentUser, bookings, eventAttendance, currentWeekKey, isWeekUnavailable } = usePlanning();
    const [readIds, setReadIds] = useState<string[]>(() => {
        if (!currentUser) return [];
        try {
            const raw = localStorage.getItem(`phoenix_read_notifs_${currentUser.id}`);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        if (!currentUser) return;
        try {
            const raw = localStorage.getItem(`phoenix_read_notifs_${currentUser.id}`);
            setReadIds(raw ? JSON.parse(raw) : []);
        } catch {
            setReadIds([]);
        }
    }, [currentUser]);

    const markAsRead = useCallback((id: string) => {
        if (!currentUser) return;
        setReadIds(prev => {
            if (prev.includes(id)) return prev;
            const updated = [...prev, id];
            try {
                localStorage.setItem(`phoenix_read_notifs_${currentUser.id}`, JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
            return updated;
        });
    }, [currentUser]);

    const markAllAsRead = useCallback(() => {
        if (!currentUser) return;
        const allIds = notifications.map(n => n.id);
        setReadIds(allIds);
        try {
            localStorage.setItem(`phoenix_read_notifs_${currentUser.id}`, JSON.stringify(allIds));
        } catch (e) {
            console.error(e);
        }
    }, [currentUser]);

    const notifications = useMemo(() => {
        if (!currentUser) return [];
        const notifs: PlanningNotification[] = [];

        // 1. ÉVÉNEMENTS (Présence confirmée, déclarée absente ou non renseignée)
        SPECIAL_EVENTS.forEach((event, index) => {
            const att = eventAttendance.find(a => a.userId === currentUser.id && a.eventId === event.id);
            const isRead = (id: string) => readIds.includes(id);

            if (att && att.present === true) {
                const id = `notif-event-${event.id}-present`;
                notifs.push({
                    id,
                    category: 'event',
                    type: 'event_confirme',
                    status: 'success',
                    title: `Présence confirmée · ${event.label}`,
                    description: `Votre participation à l'événement ${event.label} est bien enregistrée et confirmée.`,
                    to: '/planning/mes-evenements',
                    timestamp: Date.now() - (index * 60000),
                    read: isRead(id)
                });
            } else if (att && att.present === false) {
                const id = `notif-event-${event.id}-absent`;
                notifs.push({
                    id,
                    category: 'event',
                    type: 'event_absent',
                    status: 'warning',
                    title: `Non-participation · ${event.label}`,
                    description: `Absence enregistrée pour ${event.label}. Cas exceptionnel à justifier auprès d'un membre du bureau.`,
                    to: '/planning/mes-evenements',
                    timestamp: Date.now() - (index * 60000),
                    read: isRead(id)
                });
            } else {
                const id = `notif-event-${event.id}-unset`;
                notifs.push({
                    id,
                    category: 'event',
                    type: 'event_non_renseigne',
                    status: 'warning',
                    title: `Participation à renseigner · ${event.label}`,
                    description: `Vous n'avez pas encore indiqué si vous participez ou non à l'événement ${event.label}.`,
                    to: '/planning/mes-evenements',
                    timestamp: Date.now() - (index * 60000),
                    read: isRead(id)
                });
            }
        });

        // 2. SÉANCES (Validées par chef/bureau, absences, séances prévues)
        const myBookings = bookings.filter(b => b.userId === currentUser.id);

        myBookings.forEach((b) => {
            const slot = timeSlots.find(s => s.id === b.slotId);
            const project = slot ? projectsData.find(p => p.id === slot.projectId) : null;
            const projName = project?.name || 'Séance tutorat';
            const isRead = (id: string) => readIds.includes(id);

            if (b.status === 'confirme') {
                const id = `notif-seance-${b.id}-confirme`;
                notifs.push({
                    id,
                    category: 'seance',
                    type: 'seance_confirmee',
                    status: 'success',
                    title: `Présence validée · ${projName}`,
                    description: `Votre présence à la séance du ${slot?.day || ''} (${slot?.startTime || ''}–${slot?.endTime || ''}, sem. ${b.weekKey}) a été validée.`,
                    dateLabel: b.weekKey,
                    to: '/planning/compte',
                    timestamp: b.validatedAt ? new Date(b.validatedAt).getTime() : Date.now(),
                    read: isRead(id)
                });
            } else if (b.status === 'absent') {
                const id = `notif-seance-${b.id}-absent`;
                notifs.push({
                    id,
                    category: 'seance',
                    type: 'seance_absente',
                    status: 'error',
                    title: `Absence séance · ${projName}`,
                    description: `Vous avez été marqué absent à la séance du ${slot?.day || ''} (${slot?.startTime || ''}–${slot?.endTime || ''}, sem. ${b.weekKey}).`,
                    dateLabel: b.weekKey,
                    to: '/planning/compte',
                    timestamp: b.validatedAt ? new Date(b.validatedAt).getTime() : Date.now(),
                    read: isRead(id)
                });
            } else if (b.status === 'prevu' && b.weekKey === currentWeekKey) {
                const id = `notif-seance-${b.id}-prevu`;
                notifs.push({
                    id,
                    category: 'seance',
                    type: 'seance_prevue',
                    status: 'info',
                    title: `Séance prévue cette semaine · ${projName}`,
                    description: `Séance programmée le ${slot?.day || ''} de ${slot?.startTime || ''} à ${slot?.endTime || ''}.`,
                    dateLabel: b.weekKey,
                    to: '/planning/horaire',
                    timestamp: Date.now() - 3600000,
                    read: isRead(id)
                });
            }
        });

        // 3. RAPPEL DISPONIBILITÉS SEMAINES
        const hasCurrentWeekBookings = myBookings.some(b => b.weekKey === currentWeekKey);
        const isUnavailable = isWeekUnavailable(currentUser.id, currentWeekKey);

        if (!hasCurrentWeekBookings && !isUnavailable && currentUser.projectIds.length > 0) {
            const id = `notif-dispo-${currentWeekKey}-missing`;
            notifs.push({
                id,
                category: 'seance',
                type: 'dispo_manquante',
                status: 'warning',
                title: `Disponibilités non renseignées`,
                description: `Vous n'avez sélectionné aucun créneau pour la semaine en cours (${formatWeekLabel(currentWeekKey)}).`,
                dateLabel: currentWeekKey,
                to: '/planning/disponibilites',
                timestamp: Date.now(),
                read: readIds.includes(id)
            });
        }

        // 4. RAPPEL POUR LES CHEFS & BUREAU
        if (currentUser.role === 'chef_projet' || currentUser.role === 'bureau') {
            const isBureau = currentUser.role === 'bureau';
            const relevantSlots = isBureau
                ? timeSlots
                : timeSlots.filter(s => currentUser.projectIds.includes(s.projectId));
            const relevantSlotIds = new Set(relevantSlots.map(s => s.id));
            const pendingValidations = bookings.filter(b => b.weekKey === currentWeekKey && b.status === 'prevu' && relevantSlotIds.has(b.slotId));

            if (pendingValidations.length > 0) {
                const id = `notif-validation-${currentWeekKey}-${pendingValidations.length}`;
                notifs.push({
                    id,
                    category: 'seance',
                    type: 'validation_requise',
                    status: 'info',
                    title: `Présences à valider (${pendingValidations.length})`,
                    description: `Il y a ${pendingValidations.length} présence(s) de tuteur(s) en attente de confirmation pour cette semaine.`,
                    to: '/planning/validation',
                    timestamp: Date.now(),
                    read: readIds.includes(id)
                });
            }
        }

        // Tri : les non lues d'abord, puis par timestamp décroissant
        return notifs.sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            return b.timestamp - a.timestamp;
        });
    }, [currentUser, bookings, eventAttendance, currentWeekKey, isWeekUnavailable, readIds]);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    };
}
