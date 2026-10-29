import { describe, expect, it } from 'vitest';
import { negotiateLocale } from './config';

describe('negotiateLocale', () => {
  it('prefers the highest-ranked supported language', () => {
    expect(negotiateLocale('en-US,en;q=0.9,es;q=0.8')).toBe('en');
    expect(negotiateLocale('de-DE,de;q=0.9,es;q=0.7,en;q=0.5')).toBe('es');
  });

  it('falls back to Spanish', () => {
    expect(negotiateLocale(undefined)).toBe('es');
    expect(negotiateLocale('ja,zh;q=0.8')).toBe('es');
  });
});
