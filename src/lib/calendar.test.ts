import { describe, it, expect } from 'vitest';
import { escapeIcsText, generateGoogleCalendarUrl, generateIcsCalendar, generateIcsContent } from './calendar';
import type { CalendarEvent } from './calendar';

const mockEvent: CalendarEvent = {
  id: 'evt-123',
  title: 'Asado de bienvenida',
  summary: 'Un asado para conocernos',
  startsAt: new Date('2026-03-15T18:00:00Z'),
  location: 'ITBA Campus',
};

describe('generateGoogleCalendarUrl', () => {
  it('generates a valid Google Calendar URL with all fields', () => {
    const url = generateGoogleCalendarUrl(mockEvent);

    expect(url).toContain('https://calendar.google.com/calendar/render?');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('text=Asado+de+bienvenida');
    expect(url).toContain('location=ITBA+Campus');
    expect(url).toContain('details=Un+asado+para+conocernos');
  });

  it('includes start and end dates (2 hour duration by default)', () => {
    const url = generateGoogleCalendarUrl(mockEvent);

    // Start: 2026-03-15T18:00:00Z → 20260315T180000Z
    expect(url).toContain('20260315T180000Z');
    // End: 2026-03-15T20:00:00Z → 20260315T200000Z
    expect(url).toContain('20260315T200000Z');
  });

  it('handles events without description or location', () => {
    const minimalEvent: CalendarEvent = {
      ...mockEvent,
      summary: '',
      location: '',
    };

    const url = generateGoogleCalendarUrl(minimalEvent);

    expect(url).toContain('details=');
    expect(url).toContain('location=');
    expect(url).not.toContain('undefined');
  });
});

describe('generateIcsContent', () => {
  it('generates valid ICS format', () => {
    const ics = generateIcsContent(mockEvent);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  it('includes event details', () => {
    const ics = generateIcsContent(mockEvent);

    expect(ics).toContain('SUMMARY:Asado de bienvenida');
    expect(ics).toContain('DESCRIPTION:Un asado para conocernos');
    expect(ics).toContain('LOCATION:ITBA Campus');
    expect(ics).toContain('UID:evt-123@buddies.itba');
  });

  it('includes correct date format', () => {
    const ics = generateIcsContent(mockEvent);

    expect(ics).toContain('DTSTART:20260315T180000Z');
    expect(ics).toContain('DTEND:20260315T200000Z');
  });

  it('uses CRLF line endings as per ICS spec', () => {
    const ics = generateIcsContent(mockEvent);

    expect(ics).toContain('\r\n');
    expect(ics).not.toMatch(/[^\r]\n/); // No LF without preceding CR
  });

  it('handles events without optional fields', () => {
    const minimalEvent: CalendarEvent = {
      ...mockEvent,
      summary: '',
      location: '',
    };

    const ics = generateIcsContent(minimalEvent);

    expect(ics).toContain('DESCRIPTION:');
    expect(ics).toContain('LOCATION:');
    expect(ics).not.toContain('undefined');
  });
});


describe('ICS escaping and feeds', () => {
  it('escapes commas, semicolons and newlines', () => {
    expect(escapeIcsText('Asado, mate; y\nmás')).toBe('Asado\\, mate\\; y\\nmás');
  });

  it('builds a feed with one VEVENT per event', () => {
    const feed = generateIcsCalendar(
      [
        { id: 'a', title: 'Uno', summary: '', startsAt: new Date('2026-03-15T18:00:00Z'), location: '', url: 'https://x.test/events/uno' },
        { id: 'b', title: 'Dos', summary: '', startsAt: new Date('2026-03-16T18:00:00Z'), location: '' },
      ],
      'Buddies ITBA'
    );
    expect(feed.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(feed).toContain('X-WR-CALNAME:Buddies ITBA');
    expect(feed).toContain('URL:https://x.test/events/uno');
  });
});
