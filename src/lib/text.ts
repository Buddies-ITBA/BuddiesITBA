/** "Asado de Bienvenida 2027!" → "asado-de-bienvenida-2027" */
export function slugify(text: string, maxLength = 60): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');
}

/** Same as slugify but with underscores, for form field / option keys. */
export const toKey = (text: string) => slugify(text, 40).replace(/-/g, '_');
