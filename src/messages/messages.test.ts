import { describe, expect, it } from 'vitest';
import es from './es.json';
import en from './en.json';

/** Flattens nested messages into `a.b.c` key paths; arrays are compared by shape. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[]`, ...value.flatMap((item) => keyPaths(item, `${prefix}[]`))];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [prefix];
}

const unique = (paths: string[]) => [...new Set(paths)].sort();

describe('translations', () => {
  it('en.json has exactly the same keys as es.json', () => {
    expect(unique(keyPaths(en))).toEqual(unique(keyPaths(es)));
  });

  it('has no empty strings', () => {
    const empty = (obj: unknown, path = ''): string[] =>
      typeof obj === 'string'
        ? obj.trim() === '' ? [path] : []
        : obj && typeof obj === 'object'
          ? Object.entries(obj).flatMap(([k, v]) => empty(v, `${path}.${k}`))
          : [];
    expect([...empty(es), ...empty(en)]).toEqual([]);
  });
});
