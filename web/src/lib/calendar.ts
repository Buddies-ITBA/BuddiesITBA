import { Event } from './cms/types';

function formatDate(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
}

export function generateGoogleCalendarUrl(event: Event): string {
    const startDate = formatDate(event.date);
    // Assuming 2 hours duration by default if no end date provided
    const endDate = formatDate(new Date(event.date.getTime() + 2 * 60 * 60 * 1000));

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${startDate}/${endDate}`,
        details: event.description || '',
        location: event.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsContent(event: Event): string {
    const startDate = formatDate(event.date);
    const endDate = formatDate(new Date(event.date.getTime() + 2 * 60 * 60 * 1000));

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Buddies ITBA//Events//EN
BEGIN:VEVENT
UID:${event.id}@buddies.itba
DTSTAMP:${startDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n');
}

export function downloadIcs(event: Event) {
    const content = generateIcsContent(event);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
