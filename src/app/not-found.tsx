'use client';

import NextError from 'next/error';

// Only reached for requests outside the [locale] segment (the proxy normally
// redirects those). Must render its own <html> since the root layout doesn't.
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body>
        <NextError statusCode={404} />
      </body>
    </html>
  );
}
