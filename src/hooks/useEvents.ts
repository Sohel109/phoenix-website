import { useState, useEffect, useCallback } from 'react';
import { type EventItem, events as defaultEvents } from '../data/events';

const STORAGE_KEY = 'phoenix_events_v1';

export function useEvents() {
    const [events, setEvents] = useState<EventItem[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Erreur lecture localStorage events:', e);
        }
        return defaultEvents;
    });
    const [loading, setLoading] = useState(false);

    // Charger les événements depuis l'API au montage
    const fetchRemoteEvents = useCallback(async () => {
        try {
            setLoading(true);
            const API_URL = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_URL}/api/events`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.events) && data.events.length > 0) {
                    setEvents(data.events);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.events));
                }
            }
        } catch (e) {
            console.warn('Erreur fetch events API:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRemoteEvents();

        const handleSync = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setEvents(JSON.parse(saved));
                }
            } catch (e) {}
        };

        window.addEventListener('phoenix_events_updated', handleSync);
        window.addEventListener('storage', handleSync);

        return () => {
            window.removeEventListener('phoenix_events_updated', handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, [fetchRemoteEvents]);

    // Sauvegarder la liste entière
    const saveEvents = async (newEvents: EventItem[]): Promise<boolean> => {
        setEvents(newEvents);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
            window.dispatchEvent(new CustomEvent('phoenix_events_updated'));
        } catch (e) {
            console.warn('Erreur écriture localStorage events:', e);
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: newEvents }),
            });
            return res.ok;
        } catch (e) {
            console.error('Erreur API save events:', e);
            return false;
        }
    };

    // Mettre à jour un événement existant
    const updateEvent = async (updated: EventItem): Promise<boolean> => {
        const next = events.map(e => (e.id === updated.id ? { ...e, ...updated } : e));
        return saveEvents(next);
    };

    // Raccourci pour mettre à jour la date d'un événement (supporte id planning 'entretiens' ou 'entretiens-excellence')
    const updateEventDate = async (eventId: string, newDate: string, newLocation?: string): Promise<boolean> => {
        const targetId = eventId === 'entretiens' ? 'entretiens-excellence' : eventId;
        const next = events.map(e => {
            if (e.id === targetId || (eventId === 'entretiens-excellence' && e.id === 'entretiens')) {
                return {
                    ...e,
                    date: newDate,
                    ...(newLocation !== undefined ? { location: newLocation } : {})
                };
            }
            return e;
        });
        return saveEvents(next);
    };

    return {
        events,
        loading,
        updateEvent,
        updateEventDate,
        saveEvents,
        refresh: fetchRemoteEvents
    };
}
