# Buddies ITBA

Website for Buddies, the ITBA student organization that pairs local students with incoming exchange students.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · shadcn/ui · next-intl (ES/EN) · Notion as CMS

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /es
```

That's it — **no secrets needed**. Without `NOTION_TOKEN` the site uses bundled sample
content (`src/lib/cms/sample.ts`). To use real content, copy `.env.example` to
`.env.local` and fill in the Notion token and database IDs.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build (works with or without Notion) |
| `npm run check` | Lint + typecheck + tests — run before pushing |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run typecheck` | Generates Next route types, then `tsc` |
| `npm test` / `test:watch` | Vitest |

CI (`.github/workflows/ci.yml`) runs the same checks plus a full build on every PR.

## Project layout

```
src/
├── app/[locale]/          # Routes: /, /about, /events, /blog, /faq, /contact
├── components/
│   ├── sections/          # Page sections (Hero, EventsTimeline, FaqAccordion…)
│   ├── ui/                # shadcn/ui primitives + SectionHeading, AddToCalendar
│   ├── events/            # Event badges (date, exchange-only)
│   ├── feedback/          # Error / not-found views
│   └── brand/             # FlightPath (paper-plane motif from the logo)
├── config/site.ts         # Email, social links, nav items — non-translatable facts
├── i18n/                  # Locales, routing, locale-aware Link/redirect
├── lib/
│   ├── cms/               # CMSClient interface, Notion + sample implementations
│   ├── dates.ts           # Date formatting, always in Buenos Aires time
│   └── search.ts          # Accent-insensitive search (FAQ)
└── messages/              # es.json (source of truth), en.json
```

## Conventions

- **Links:** import `Link` from `@/i18n/navigation` and write locale-free paths (`<Link href="/events">`).
- **Copy:** every user-visible string lives in `src/messages/*.json`. Keys are type-checked
  (typos fail `tsc`), and a test fails if `en.json` and `es.json` drift apart. Never write
  `locale === 'es' ? … : …`.
- **Components get strings, not locales:** pages call `getTranslations()` and pass text as props.
- **Content from Notion:** use `_ES` / `_EN` column suffixes; the CMS layer picks the right one.
- **Dates:** use `formatEventDate()` from `@/lib/dates` so times show in Buenos Aires time on
  server and client alike.
- **Design tokens:** colors, radii and fonts are defined once in `src/app/globals.css`
  (`primary`, `sky`, `plane`, `sun`, `heading`, `text`, `text-muted`…). Use the Tailwind
  classes (`bg-sky`, `text-primary`), not hex values. Use `container-page` and `section` for
  page width and vertical rhythm.

## Caching

Pages are statically generated and revalidated every 10 minutes (`revalidate` in
`app/[locale]/layout.tsx`). Notion file URLs expire after about an hour, so keep it below that.

More background: [`docs/plans/2026-01-23-nextjs-migration-design.md`](docs/plans/2026-01-23-nextjs-migration-design.md).
