/** RFC 4180 CSV with a UTF-8 BOM so Excel opens accents correctly. */
export function toCsv(rows: unknown[][]): string {
  const cell = (value: unknown) => {
    const text = value == null ? '' : Array.isArray(value) ? value.join(', ') : String(value);
    // Neutralize spreadsheet formula injection (=, +, -, @ at the start)
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return '﻿' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
}

export function csvResponse(filename: string, rows: unknown[][]) {
  return new Response(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename.replace(/[^\w.-]/g, '_')}"`,
      'Cache-Control': 'no-store',
    },
  });
}
