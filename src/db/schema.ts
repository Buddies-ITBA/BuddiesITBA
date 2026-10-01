import { sql } from 'drizzle-orm';
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { Localized } from '@/lib/localized';
import type { Answers, FormField } from '@/lib/forms/schema';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});

const id = () => uuid('id').primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const localized = (name: string) => jsonb(name).$type<Localized>().notNull().default({ es: '' });

/* ───────────────────────── Admin auth ───────────────────────── */

export const admins = pgTable('admins', {
  id: id(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  'sessions',
  {
    /** SHA-256 of the cookie token — the raw token is never stored. */
    id: text('id').primaryKey(),
    adminId: uuid('admin_id')
      .notNull()
      .references(() => admins.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (t) => [index('sessions_admin_idx').on(t.adminId)]
);

/* ───────────────────────── Content ───────────────────────── */

export const media = pgTable('media', {
  id: id(),
  contentType: text('content_type').notNull(),
  data: bytea('data').notNull(),
  width: integer('width'),
  height: integer('height'),
  createdAt: createdAt(),
});

export const registrationTypes = ['none', 'whatsapp', 'link', 'form'] as const;
export const registrationTypeEnum = pgEnum('registration_type', registrationTypes);

export const events = pgTable(
  'events',
  {
    id: id(),
    slug: text('slug').notNull().unique(),
    title: localized('title'),
    summary: localized('summary'),
    /** Markdown */
    body: localized('body'),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    location: text('location').notNull().default(''),
    imageUrl: text('image_url'),
    exchangeOnly: boolean('exchange_only').notNull().default(false),
    published: boolean('published').notNull().default(false),
    showInHome: boolean('show_in_home').notNull().default(false),
    homeOrder: integer('home_order').notNull().default(0),
    registrationType: registrationTypeEnum('registration_type').notNull().default('none'),
    registrationUrl: text('registration_url'),
    registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
    capacity: integer('capacity'),
    formFields: jsonb('form_fields').$type<FormField[]>().notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('events_starts_at_idx').on(t.startsAt)]
);

export const registrationStatuses = ['confirmed', 'waitlist', 'cancelled'] as const;
export const registrationStatusEnum = pgEnum('registration_status', registrationStatuses);

export const eventRegistrations = pgTable(
  'event_registrations',
  {
    id: id(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    answers: jsonb('answers').$type<Answers>().notNull().default({}),
    status: registrationStatusEnum('status').notNull().default('confirmed'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('event_registrations_event_email_idx').on(t.eventId, t.email)]
);

export const faqs = pgTable('faqs', {
  id: id(),
  question: localized('question'),
  /** Markdown */
  answer: localized('answer'),
  category: localized('category'),
  sortOrder: integer('sort_order').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: createdAt(),
});

export const teamMembers = pgTable('team_members', {
  id: id(),
  name: text('name').notNull(),
  role: localized('role'),
  career: localized('career'),
  bio: localized('bio'),
  imageUrl: text('image_url'),
  linkedinUrl: text('linkedin_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: createdAt(),
});

export const posts = pgTable('posts', {
  id: id(),
  slug: text('slug').notNull().unique(),
  title: localized('title'),
  excerpt: localized('excerpt'),
  /** Markdown */
  body: localized('body'),
  category: localized('category'),
  coverUrl: text('cover_url'),
  authorName: text('author_name').notNull().default('Buddies ITBA'),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  published: boolean('published').notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ───────────────────────── Buddy program ───────────────────────── */

/** One cohort, e.g. "2027 · 1er cuatrimestre". */
export const buddyPrograms = pgTable('buddy_programs', {
  id: id(),
  name: text('name').notNull(),
  /** Only one program should be active (shown on the public page). */
  active: boolean('active').notNull().default(false),
  registrationOpen: boolean('registration_open').notNull().default(false),
  /** Personality / interests questionnaire, with matching weights. */
  questions: jsonb('questions').$type<FormField[]>().notNull().default([]),
  createdAt: createdAt(),
});

export const buddyRoles = ['local', 'exchange'] as const;
export type BuddyRole = (typeof buddyRoles)[number];
export const buddyRoleEnum = pgEnum('buddy_role', buddyRoles);

export const genders = ['female', 'male', 'nonbinary', 'na'] as const;
export type Gender = (typeof genders)[number];
export const genderPreferences = ['any', 'same'] as const;
export type GenderPreference = (typeof genderPreferences)[number];

export const buddyApplicants = pgTable(
  'buddy_applicants',
  {
    id: id(),
    programId: uuid('program_id')
      .notNull()
      .references(() => buddyPrograms.id, { onDelete: 'cascade' }),
    role: buddyRoleEnum('role').notNull(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    /** Career at ITBA (locals) or home university (exchange). */
    institution: text('institution').notNull().default(''),
    country: text('country').notNull().default(''),
    gender: text('gender').$type<Gender>().notNull().default('na'),
    genderPreference: text('gender_preference').$type<GenderPreference>().notNull().default('any'),
    languages: jsonb('languages').$type<string[]>().notNull().default([]),
    /** Locals only: how many exchange students they can take. */
    capacity: integer('capacity').notNull().default(1),
    answers: jsonb('answers').$type<Answers>().notNull().default({}),
    notes: text('notes').notNull().default(''),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('buddy_applicants_program_email_idx').on(t.programId, t.email),
    index('buddy_applicants_program_role_idx').on(t.programId, t.role),
  ]
);

export const buddyMatches = pgTable(
  'buddy_matches',
  {
    id: id(),
    programId: uuid('program_id')
      .notNull()
      .references(() => buddyPrograms.id, { onDelete: 'cascade' }),
    localId: uuid('local_id')
      .notNull()
      .references(() => buddyApplicants.id, { onDelete: 'cascade' }),
    exchangeId: uuid('exchange_id')
      .notNull()
      .references(() => buddyApplicants.id, { onDelete: 'cascade' }),
    score: real('score').notNull().default(0),
    /** Locked matches are kept as-is when the algorithm re-runs. */
    locked: boolean('locked').notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('buddy_matches_exchange_idx').on(t.exchangeId)]
);

export type EventRow = typeof events.$inferSelect;
export type RegistrationRow = typeof eventRegistrations.$inferSelect;
export type FaqRow = typeof faqs.$inferSelect;
export type TeamMemberRow = typeof teamMembers.$inferSelect;
export type PostRow = typeof posts.$inferSelect;
export type BuddyProgramRow = typeof buddyPrograms.$inferSelect;
export type BuddyApplicantRow = typeof buddyApplicants.$inferSelect;
export type BuddyMatchRow = typeof buddyMatches.$inferSelect;
export type AdminRow = typeof admins.$inferSelect;
