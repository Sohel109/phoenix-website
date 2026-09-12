import type { Booking, TimeSlot } from '../data/planningData';
import type { Project } from '../data/projectsData';

const DAY_INDEX_MAP: Record<string, number> = {
    'Lundi': 1,
    'Mardi': 2,
    'Mercredi': 3,
    'Jeudi': 4,
    'Vendredi': 5,
    'Samedi': 6,
    'Dimanche': 0,
};

function formatICSDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

function parseWeekKey(weekKey: string): { year: number; week: number } {
    const parts = weekKey.split('-W');
    if (parts.length === 2) {
        return { year: parseInt(parts[0], 10), week: parseInt(parts[1], 10) };
    }
    const d = new Date();
    return { year: d.getFullYear(), week: 1 };
}

function getDateForSlot(weekKey: string, dayName: string, timeStr: string): Date {
    const { year, week } = parseWeekKey(weekKey);
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
        ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    } else {
        ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
    }

    const targetDayIdx = DAY_INDEX_MAP[dayName] ?? 1;
    const offsetDays = (targetDayIdx === 0 ? 7 : targetDayIdx) - 1;
    const targetDate = new Date(ISOweekStart);
    targetDate.setUTCDate(ISOweekStart.getUTCDate() + offsetDays);

    const [hours, minutes] = timeStr.split(':').map(n => parseInt(n, 10));
    targetDate.setHours(hours || 0, minutes || 0, 0, 0);

    return targetDate;
}

export function generateICS(
    bookings: Booking[],
    slots: TimeSlot[],
    projects: Project[],
    userName: string
): string {
    let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Phoenix EDC//Planning Tutorat//FR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Planning Tutorat Phoenix EDC',
        'X-WR-TIMEZONE:Europe/Paris'
    ];

    bookings.forEach(b => {
        const slot = slots.find(s => s.id === b.slotId);
        if (!slot) return;
        const project = projects.find(p => p.id === slot.projectId);
        const projectName = project ? project.name : 'Séance Tutorat';
        const location = project ? project.address : 'Marseille';

        const startDate = getDateForSlot(b.weekKey, slot.day, slot.startTime);
        const endDate = getDateForSlot(b.weekKey, slot.day, slot.endTime);

        const uid = `phoenix-booking-${b.id}-${b.weekKey}@phoenix-egalite-des-chances.com`;

        icsContent.push(
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:Tutorat Phoenix - ${projectName}`,
            `DESCRIPTION:Séance de tutorat Phoenix EDC (${projectName}). Statut: ${b.status.toUpperCase()}. Membre: ${userName}`,
            `LOCATION:${location}`,
            'STATUS:CONFIRMED',
            'END:VEVENT'
        );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
}

export function downloadICSFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
