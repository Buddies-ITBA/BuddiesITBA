# Buddies ITBA

Website and admin console for Buddies, the ITBA student organization that pairs local students with incoming exchange students.

**Stack:** Next.js 16 (App Router, Server Actions) · React 19 · Tailwind CSS 4 · Postgres + Drizzle ORM · next-intl (ES/EN)

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000   ·   admin: http://localhost:3000/admin
```

That's it: **no database to install, no secrets**. Without `DATABASE_URL`, the app uses an
embedded Postgres (PGlite) in `.data/`. It's created, migrated and filled with sample events,
FAQs, team and buddy applicants on first run.

Local admin login: `admin@buddies.local` / `buddies-admin`.
Start over with `npm run db:reset-local`.

## What's inside

- **Public site:** home, events (each with its own page and registration form), buddy program
  sign-up, blog, FAQ with search, about, contact. The language comes from a cookie or the
  browser, so URLs have no `/es` or `/en`.
- **Admin console (`/admin`):**
  - Events with a visual **form builder**. Registrations respect capacity, fill a waitlist when
    full, and export to CSV.
  - **Buddy program** per semester: configurable interests/personality questionnaire,
    applicants list, **automatic matching**, manual adjustments and CSV of pairs.
  - FAQ, blog, team, image uploads and admin users.
  - Email log. Emails go out in each person's language: registration confirmation with a
    personal cancel link, waitlist promotion, application received and buddy introductions.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run check` | Lint + typecheck + tests (run before pushing) |
| `npm run test:e2e` | Playwright end-to-end tests (starts its own server and database) |
| `npm run build` | Production build |
| `npm run db:generate` | Create a migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npm run db:studio` | Browse the database (Drizzle Studio) |
| `npm run admin:create -- email "Name" 'password'` | Create or reset an admin on `DATABASE_URL` |
| `npm run db:reset-local` | Delete the local embedded database |

## Project layout

```
src/
├── app/
│   ├── (site)/             # Public pages (/, /events/[slug], /buddies, /blog, /faq…)
│   ├── admin/              # Admin console: login + (panel)/…
│   └── media/[id]/         # Uploaded images served from the DB
├── components/
│   ├── sections/ events/ forms/ feedback/ brand/ ui/   # public site
│   └── admin/              # console UI, FormBuilder, ImageField
├── db/                     # schema.ts, client (Postgres or PGlite), seed
├── i18n/                   # locale cookie / Accept-Language negotiation
├── lib/
│   ├── data/public.ts      # read queries for the public site (localized view models)
│   ├── forms/              # form schema, validation, localization
│   ├── matching/           # buddy matching algorithm (+ tests)
│   ├── auth/               # passwords + sessions
│   └── registrations.ts    # capacity / waitlist logic
└── messages/               # es.json (source of truth), en.json
drizzle/                    # SQL migrations (generated)
```

## Deploying

See **[docs/architecture.md](docs/architecture.md)**: hosting options (free: Vercel + Neon),
step-by-step setup, Docker/`docker compose` for self-hosting, backups and GitHub Actions.

## Conventions

- Public UI strings live in `src/messages/*.json` (typed keys, and a test keeps ES/EN in sync).
  The admin console is Spanish-only.
- Content from the DB is `{ es, en }` JSON. Pages resolve it with `pick()` in `lib/data`, so
  components receive plain strings.
- Dates always display in Buenos Aires time (`lib/dates.ts`).
- Every admin page and server action calls `requireAdmin()`.
- Schema change → `npm run db:generate` → commit `drizzle/`. CI fails if you forget.
