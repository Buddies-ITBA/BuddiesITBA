import { describe, expect, it } from 'vitest';
import { slugify, toKey } from './text';
import { toCsv } from './csv';

describe('slugify', () => {
  it('strips accents and punctuation', () => {
    expect(slugify('¡Asado de Bienvenida 2027!')).toBe('asado-de-bienvenida-2027');
    expect(toKey('¿Qué te gusta?')).toBe('que_te_gusta');
  });
});

describe('toCsv', () => {
  it('quotes and escapes, and neutralizes formulas', () => {
    const csv = toCsv([
      ['name', 'note'],
      ['Ana, "la buddy"', '=HYPERLINK("x")'],
      ['Leo', ['a', 'b']],
    ]);
    expect(csv).toBe('﻿name,note\r\n"Ana, ""la buddy""","\'=HYPERLINK(""x"")"\r\nLeo,"a, b"');
  });
});

import { httpUrl } from './admin/state';

describe('httpUrl', () => {
  it('accepts http(s) and rejects other schemes', () => {
    const schema = httpUrl('bad');
    expect(schema.safeParse('https://forms.gle/x').success).toBe(true);
    expect(schema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(schema.safeParse('data:text/html,hi').success).toBe(false);
  });
});
