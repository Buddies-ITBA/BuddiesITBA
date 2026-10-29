/** The fields a calendar entry needs (PublicEvent satisfies this). */
export type CalendarEvent = { id: string; title: string; summary: string; startsAt: Date; location: string };

function formatDate(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
    const startDate = formatDate(event.startsAt);
    // Assuming 2 hours duration by default if no end date provided
    const endDate = formatDate(new Date(event.startsAt.getTime() + 2 * 60 * 60 * 1000));

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${startDate}/${endDate}`,
        details: event.summary || '',
        location: event.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. */
export function escapeIcsText(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function vevent(event: CalendarEvent & { url?: string }, stamp: string): string[] {
    const start = formatDate(event.startsAt);
    const end = formatDate(new Date(event.startsAt.getTime() + 2 * 60 * 60 * 1000));
    return [
        'BEGIN:VEVENT',
        `UID:${event.id}@buddies.itba`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeIcsText(event.title)}`,
        `DESCRIPTION:${escapeIcsText(event.summary || '')}`,
        `LOCATION:${escapeIcsText(event.location || '')}`,
        ...(event.url ? [`URL:${event.url}`] : []),
        'END:VEVENT',
    ];
}

export function generateIcsContent(event: CalendarEvent): string {
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Buddies ITBA//Events//EN', ...vevent(event, formatDate(event.startsAt)), 'END:VCALENDAR'].join('\r\n');
}

/** Subscribable feed with many events (calendar apps re-fetch it periodically). */
export function generateIcsCalendar(events: (CalendarEvent & { url?: string })[], name: string, now = new Date()): string {
    const stamp = formatDate(now);
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Buddies ITBA//Events//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeIcsText(name)}`,
        'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
        'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
        ...events.flatMap((e) => vevent(e, stamp)),
        'END:VCALENDAR',
    ].join('\r\n');
}

export function downloadIcs(event: CalendarEvent) {
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
