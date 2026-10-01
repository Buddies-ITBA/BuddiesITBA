/** Escapes text for HTML email bodies (names and titles come from users/admins). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type EmailBlock =
  | { type: 'p'; text: string }
  | { type: 'details'; rows: [label: string, value: string][] }
  | { type: 'button'; label: string; href: string }
  | { type: 'small'; text: string };

/**
 * Minimal, table-free email layout that renders well in Gmail/Outlook/phones.
 * Takes structured blocks (never raw HTML) so every value is escaped once, here.
 */
export function renderEmail(heading: string, blocks: EmailBlock[], footer: string): { html: string; text: string } {
  const html = blocks
    .map((b) => {
      switch (b.type) {
        case 'p':
          return `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#444444">${escapeHtml(b.text)}</p>`;
        case 'small':
          return `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#5f6b76">${escapeHtml(b.text)}</p>`;
        case 'details':
          return `<div style="margin:0 0 20px;padding:16px 18px;border-radius:12px;background:#e1ecf6">${b.rows
            .map(
              ([label, value]) =>
                `<p style="margin:0 0 6px;font-size:15px;color:#37423b"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
            )
            .join('')}</div>`;
        case 'button':
          return `<p style="margin:8px 0 20px"><a href="${escapeHtml(b.href)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#0c5781;color:#ffffff;font-weight:600;text-decoration:none">${escapeHtml(b.label)}</a></p>`;
      }
    })
    .join('\n');

  const text = [
    heading,
    '',
    ...blocks.map((b) => {
      switch (b.type) {
        case 'p':
        case 'small':
          return b.text;
        case 'details':
          return b.rows.map(([l, v]) => `${l}: ${v}`).join('\n');
        case 'button':
          return `${b.label}: ${b.href}`;
      }
    }),
    '',
    '—',
    footer,
  ].join('\n');

  return {
    text,
    html: `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#f7fafd;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #dbe6f0">
<p style="margin:0 0 20px;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0c5781">Buddies ITBA</p>
<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#37423b">${escapeHtml(heading)}</h1>
${html}
</div>
<p style="max-width:560px;margin:16px auto 0;text-align:center;font-size:12px;color:#5f6b76">${escapeHtml(footer)}</p>
</body></html>`,
  };
}
