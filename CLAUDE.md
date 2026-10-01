# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Buddies ITBA - Website and admin console for a student organization that connects local ITBA students with incoming exchange students.

**Stack:** Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4, shadcn/ui, TypeScript, next-intl v4, Postgres + Drizzle ORM

## Commands

```bash
npm run dev          # Dev server. No setup: embedded PGlite DB in .data/ with sample data
npm run check        # lint + typecheck + test — run before committing
npm run build        # Production build
npm run db:generate  # After editing src/db/schema.ts — commit the drizzle/ output
npm run db:migrate   # Apply migrations to DATABASE_URL
npm test             # Vitest (DB tests use in-memory PGlite)
npm run test:e2e     # Playwright (own dev server on :3123 + fresh DB in .data/e2e)
```

Local admin: `/admin`, `admin@buddies.local` / `buddies-admin`.

## Architecture

See `docs/architecture.md` for the full picture, data model, matching algorithm and hosting.

```
src/
├── app/(site)/          # Public pages
├── app/admin/           # Admin console (login + (panel)/…), Spanish only
├── app/media/[id]/      # Uploaded images served from Postgres
├── components/          # sections/, forms/, events/, feedback/, brand/, ui/, admin/
├── config/site.ts       # Email, socials, nav items (non-translatable)
├── db/                  # schema.ts, index.ts (getDb), seed.ts
├── i18n/                # config (locales, cookie, negotiation), request.ts, actions.ts
├── lib/
│   ├── data/public.ts   # Read queries for public pages → localized view models
│   ├── forms/           # FormField schema (form builder), validation, localization
│   ├── matching/        # Buddy matching (compatibility + Hungarian assignment)
│   ├── buddies/         # Applications, default questionnaire
│   ├── admin/           # Admin action helpers, CSV/registration helpers
│   ├── auth/            # scrypt passwords, DB-backed sessions, requireAdmin()
│   ├── email/           # sendEmail (Resend or console), safe layout, localized templates
│   └── registrations.ts # Capacity, waitlist promotion, cancel tokens (row-locked transactions)
└── messages/            # es.json (source of truth, typed), en.json
```

### Key Patterns

**Data:** No CMS. All content lives in Postgres and is edited from `/admin`. `getDb()` returns Drizzle on `DATABASE_URL`, or an auto-migrated, seeded PGlite when unset (never in production). Public pages read through `lib/data/public.ts`; admin pages query `getDb()` directly.

**Server Components by default.** Forms use Server Actions + `useActionState`, never API routes. Route handlers only for CSV exports and `/media`.

**Admin security:** Every admin page *and* server action calls `requireAdmin()`. Route handlers check `getCurrentAdmin()`.

**Emails:** build with `renderEmail()` blocks (values are escaped there, never pass raw HTML) and send with `sendEmail()`. Never throws, logs to `email_log`. Use the recipient's stored `locale`, not the request's. In unit tests, mock `@/lib/email/templates` and `@/lib/email/send`.

**Forms built in the admin** are `FormField[]` JSON (`lib/forms/schema.ts`), used for event registration and buddy questionnaires. Public inputs are named `q_<fieldId>` and validated with `parseAnswers()`. Never change a field's `id` casually: answers are keyed by it.

### Localization Patterns

**No locale in URLs.** The locale comes from the `NEXT_LOCALE` cookie (set by the language switcher's server action), else `Accept-Language`, else Spanish. Old `/es/*` and `/en/*` links are redirected by `src/proxy.ts`. Use `next/link` and `getLocale()`.

**NEVER use locale ternaries in components.** No `locale === 'es' ? 'Texto' : 'Text'`.

**Static UI strings:** add to both `messages/es.json` and `messages/en.json` (a test enforces parity; keys are type-checked). Fetch with `getTranslations()`.

**DB content:** `Localized` JSON `{ es, en? }` (`lib/localized.ts`). Resolve with `pick(value, locale)` in the data layer so components get plain strings.

**Component props pattern:** components receive translated strings as props, not locale:
```tsx
<EventCard translations={{ capacity: t('capacity'), register: t('register') }} />
```

**Dates:** use `formatEventDate()` from `@/lib/dates` (Buenos Aires time zone). Admin `datetime-local` inputs go through `toDateTimeInput()` / `fromDateTimeInput()`.

### Design System

Tokens live in `src/app/globals.css` (`:root` + `@theme inline`). Use Tailwind classes, never raw hex:
- `primary` `#0c5781`, `primary-dark`; `sky` `#e1ecf6`; `plane` (logo blue, decorative); `sun` (warm accent / CTAs)
- `heading` `#37423b`, `text` `#444444`, `text-muted`
- Layout: `container-page`, `section`; headings via `<SectionHeading eyebrow title subtitle />`
- Admin UI primitives: `components/admin/ui.tsx`

## Important Context

- **Target audience:** ITBA students and incoming exchange students
- **Hosting:** recommended Vercel + Neon (free); Docker/compose for ITBA infrastructure
- **i18n:** Spanish primary, English secondary, extensible
- **Personal data:** applicants/registrations hold emails and phones. Keep exports behind auth, and keep backups encrypted

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
