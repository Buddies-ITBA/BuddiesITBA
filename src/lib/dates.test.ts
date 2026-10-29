import { describe, expect, it } from 'vitest';
import { eventDateParts, formatEventDate, fromDateTimeInput, groupByMonth, toDateTimeInput } from './dates';

// 23:30 UTC on Mar 15 is 20:30 on Mar 15 in Buenos Aires (UTC-3)
const lateUtc = new Date('2026-03-15T23:30:00Z');

describe('formatEventDate', () => {
  it('formats times in Buenos Aires regardless of the host time zone', () => {
    expect(formatEventDate(lateUtc, 'es', 'time')).toBe('20:30');
  });

  it('does not roll the day over for late UTC times', () => {
    expect(formatEventDate(lateUtc, 'en', 'long')).toBe('March 15, 2026');
  });
});

describe('eventDateParts', () => {
  it('returns badge pieces without trailing dots', () => {
    expect(eventDateParts(lateUtc, 'es')).toEqual({ weekday: 'dom', day: '15', month: 'mar' });
  });
});

describe('groupByMonth', () => {
  it('groups consecutive items by month, keeping order', () => {
    const items = [
      new Date('2026-03-01T15:00:00Z'),
      new Date('2026-03-20T15:00:00Z'),
      new Date('2026-04-02T15:00:00Z'),
    ];
    const groups = groupByMonth(items, (d) => d, 'en');
    expect(groups.map((g) => [g.month, g.entries.length])).toEqual([
      ['March 2026', 2],
      ['April 2026', 1],
    ]);
  });
});

describe('datetime-local helpers', () => {
  it('round-trips Buenos Aires wall-clock time', () => {
    const date = fromDateTimeInput('2026-10-06T19:00');
    expect(date?.toISOString()).toBe('2026-10-06T22:00:00.000Z');
    expect(toDateTimeInput(date)).toBe('2026-10-06T19:00');
  });

  it('rejects malformed input', () => {
    expect(fromDateTimeInput('mañana')).toBeNull();
    expect(fromDateTimeInput('')).toBeNull();
  });
});
