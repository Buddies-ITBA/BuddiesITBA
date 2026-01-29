import { describe, it, expect } from 'vitest';
import { generateGoogleCalendarUrl, generateIcsContent } from './calendar';
import { Event } from './cms/types';

const mockEvent: Event = {
  id: 'evt-123',
  title: 'Asado de bienvenida',
  description: 'Un asado para conocernos',
  date: new Date('2026-03-15T18:00:00Z'),
  location: 'ITBA Campus',
  capacity: 50,
  registeredCount: 20,
  registrationType: 'form',
  registrationUrl: 'https://example.com/register',
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
    const minimalEvent: Event = {
      ...mockEvent,
      description: undefined,
      location: undefined,
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
    const minimalEvent: Event = {
      ...mockEvent,
      description: undefined,
      location: undefined,
    };

    const ics = generateIcsContent(minimalEvent);

    expect(ics).toContain('DESCRIPTION:');
    expect(ics).toContain('LOCATION:');
    expect(ics).not.toContain('undefined');
  });
});
