import { describe, expect, it } from 'vitest';
import { escapeHtml, renderEmail } from './layout';

describe('renderEmail', () => {
  it('escapes every user-provided value in the HTML', () => {
    const { html, text } = renderEmail(
      'Hola <script>',
      [
        { type: 'p', text: 'Ana "<b>" & co' },
        { type: 'details', rows: [['Evento', '<img src=x onerror=alert(1)>']] },
        { type: 'button', label: 'Ver', href: 'https://x.test/?a=1&b="2"' },
      ],
      'footer'
    );
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('Ana &quot;&lt;b&gt;&quot; &amp; co');
    expect(html).toContain('href="https://x.test/?a=1&amp;b=&quot;2&quot;"');
    expect(text).toContain('Ver: https://x.test/?a=1&b="2"');
  });

  it('escapes quotes for attributes', () => {
    expect(escapeHtml(`"'`)).toBe('&quot;&#39;');
  });
});
