# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Buddies ITBA - Website for a student organization that connects local ITBA students with incoming exchange students.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TypeScript, next-intl v4, Notion CMS

## Commands

```bash
npm run dev          # Dev server (works without secrets: sample CMS content)
npm run build        # Production build
npm run check        # lint + typecheck + test — run before committing
npm run lint         # ESLint
npm run typecheck    # next typegen + tsc
npm test             # Vitest
```

Without `NOTION_TOKEN`, `src/lib/cms/index.ts` falls back to `SampleCMS` (`src/lib/cms/sample.ts`).

## Architecture

### Directory Structure

```
src/
├── app/[locale]/        # Internationalized routes (ES/EN)
├── components/
│   ├── ui/              # shadcn/ui components + SectionHeading
│   ├── sections/        # Page sections (Hero, Team, etc.)
│   ├── events/ feedback/ brand/
├── config/site.ts       # Email, socials, nav items (non-translatable)
├── i18n/                # config, routing, navigation (locale-aware Link)
├── lib/
│   ├── cms/             # CMS abstraction layer (Strategy Pattern)
│   │   ├── index.ts     # Picks Notion or Sample implementation
│   │   ├── notion.ts    # Notion implementation
│   │   ├── sample.ts    # Offline sample content
│   │   └── types.ts     # Shared types + CMSClient interface
│   ├── dates.ts         # Date formatting (always Buenos Aires time zone)
│   └── metadata.ts      # pageMetadata() for generateMetadata
└── messages/            # es.json (source of truth, typed), en.json
```

### Key Patterns

**CMS Abstraction (Strategy Pattern):** All content fetching goes through `lib/cms/index.ts`. Components import `cms` and call methods like `cms.getFAQs(locale)`. Current implementation uses Notion, but interface allows swapping to Sanity.

**Internationalization:** Uses next-intl v4. See detailed patterns below.

**Server Components by Default:** Fetch data directly in async components. Use `'use client'` only when needed (interactivity, hooks).

### Localization Patterns

**NEVER use locale ternaries in components.** No `locale === 'es' ? 'Texto' : 'Text'`. This breaks when adding new languages.

**Static UI strings:** Add to `messages/es.json` and `messages/en.json`, fetch with `getTranslations()`:
```tsx
// In Server Components
const t = await getTranslations('events.timeline');
<EventsTimeline translations={{ empty: t('empty'), capacity: t('capacity') }} />
```

**Dynamic content from Notion:** Use `_ES`/`_EN` column suffixes. The CMS layer auto-selects based on locale:
- `Title_ES`, `Title_EN` → `cms.getLocalizedText(props, 'Title', locale)`
- Works for: rich_text, title, and select field types

**Date formatting:** Use `formatEventDate(date, locale, style)` from `@/lib/dates` (formats in the Buenos Aires time zone so SSR and client match). Don't hardcode `'es-AR'` or `'en-US'`.

**Links:** Import `Link`/`redirect`/`usePathname` from `@/i18n/navigation` and use locale-free hrefs (`/events`).

**Translations are typed** (`src/global.d.ts`) and `src/messages/messages.test.ts` enforces ES/EN key parity — add keys to both files.

**Component props pattern:** Components receive translated strings as props, not locale:
```tsx
// ❌ Bad - component does translation internally
<EventCard locale={locale} />

// ✅ Good - parent passes translated strings
<EventCard translations={{ capacity: t('capacity'), register: t('register') }} />
```

**Server Actions for Forms:** No API routes for form submissions. Use `'use server'` functions.

### Design System

Tokens are defined once in `src/app/globals.css` (`:root` + `@theme inline`). Use Tailwind classes, never raw hex:
- `primary` `#0c5781` (brand blue), `primary-dark`
- `sky` `#e1ecf6` (light blue surfaces), `plane` (logo paper-plane blue, decorative), `sun` (warm accent / CTAs)
- `heading` `#37423b`, `text` `#444444`, `text-muted`
- Layout helpers: `container-page`, `section`; headings via `<SectionHeading eyebrow title subtitle />`

Fonts: Open Sans (body), Raleway (headings), Poppins (nav)

## Important Context

- **Target audience:** ITBA students and incoming exchange students
- **Auth restriction:** Only `@itba.edu.ar` emails (Microsoft OAuth)
- **Hosting:** Vercel initially, may migrate to ITBA infrastructure
- **i18n:** Spanish primary, English secondary, extensible for more languages
- **No SEO focus:** Users arrive through direct channels, not search

## Design Document

Full migration plan and architecture decisions: `docs/plans/2026-01-23-nextjs-migration-design.md`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
