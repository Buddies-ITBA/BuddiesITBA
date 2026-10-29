import { describe, expect, it } from 'vitest';
import { matchesQuery, normalize } from './search';

describe('normalize', () => {
  it('strips accents and lowercases', () => {
    expect(normalize('¿Cómo uso la SUBE?')).toBe('¿como uso la sube?');
  });
});

describe('matchesQuery', () => {
  it('matches regardless of accents and case', () => {
    expect(matchesQuery('¿Qué es el mate?', 'que MATE')).toBe(true);
  });

  it('requires every word to match', () => {
    expect(matchesQuery('¿Qué es el mate?', 'mate visa')).toBe(false);
  });

  it('matches everything for an empty query', () => {
    expect(matchesQuery('anything', '   ')).toBe(true);
  });
});
