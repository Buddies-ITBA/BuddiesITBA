/** Lowercases and strips accents so "Subé" matches "sube". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** Splits a query into normalized words; match them with `matchesWords`. */
export function queryWords(query: string): string[] {
  return normalize(query).split(/\s+/).filter(Boolean);
}

/** True when every word appears in an already-`normalize`d haystack. */
export function matchesWords(normalizedHaystack: string, words: string[]): boolean {
  return words.every((word) => normalizedHaystack.includes(word));
}

/** True when every word of `query` appears somewhere in `haystack`. */
export function matchesQuery(haystack: string, query: string): boolean {
  return matchesWords(normalize(haystack), queryWords(query));
}
