import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker / ITBA infrastructure (ignored by Vercel)
  output: 'standalone',
  // Embedded Postgres (WASM) must not be bundled
  serverExternalPackages: ['@electric-sql/pglite'],
  // Bundle SQL migrations so the standalone server can migrate the embedded database
  outputFileTracingIncludes: { '/**': ['./drizzle/**/*'] },
  images: {
    // Uploaded images are served from the database at /media/<id>
    localPatterns: [{ pathname: '/media/**' }, { pathname: '/assets/**' }],
  },
};

export default withNextIntl(nextConfig);
