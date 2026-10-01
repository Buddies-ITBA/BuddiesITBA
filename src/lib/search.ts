/** Lowercases and strips accents so "Subé" matches "sube". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/** True when every word of `query` appears somewhere in `haystack`. */
export function matchesQuery(haystack: string, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const target = normalize(haystack);
  return words.every((word) => target.includes(word));
}
