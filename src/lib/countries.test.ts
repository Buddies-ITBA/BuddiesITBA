import { describe, expect, it } from 'vitest';
import { COUNTRY_CODES, countryFlag, countryName, countryOptions } from './countries';

describe('countries', () => {
  it('covers real countries only', () => {
    expect(COUNTRY_CODES).toContain('AR');
    expect(COUNTRY_CODES).toContain('DE');
    expect(COUNTRY_CODES).not.toContain('EU');
    expect(COUNTRY_CODES.length).toBeGreaterThan(240);
  });

  it('localizes names and keeps legacy free text', () => {
    expect(countryName('DE', 'es')).toBe('Alemania');
    expect(countryName('DE', 'en')).toBe('Germany');
    expect(countryName('Francia', 'en')).toBe('Francia');
  });

  it('builds flag emojis', () => {
    expect(countryFlag('AR')).toBe('🇦🇷');
    expect(countryFlag('??')).toBe('');
  });

  it('sorts options by localized name', () => {
    const options = countryOptions('es');
    const i = options.findIndex((o) => o.value === 'DE');
    const j = options.findIndex((o) => o.value === 'AR');
    expect(i).toBeLessThan(j); // Alemania < Argentina
  });
});
