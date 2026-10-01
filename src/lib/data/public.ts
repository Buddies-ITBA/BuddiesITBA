import 'server-only';
import { cache } from 'react';
import { and, asc, count, desc, eq, gte } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import type { Locale } from '@/i18n/config';
import { pick } from '@/lib/localized';
import type { FormField } from '@/lib/forms/schema';

/*
 * Read-only queries for the public site. Each returns view models with text
 * already resolved for the visitor's locale — components never see Localized.
 */

const { events, eventRegistrations, faqs, teamMembers, posts, buddyPrograms } = schema;

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  startsAt: Date;
  location: string;
  imageUrl: string | null;
  exchangeOnly: boolean;
  registrationType: (typeof schema.registrationTypes)[number];
  registrationUrl: string | null;
  registrationDeadline: Date | null;
  capacity: number | null;
};

function toPublicEvent(row: schema.EventRow, locale: Locale): PublicEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: pick(row.title, locale),
    summary: pick(row.summary, locale),
    body: pick(row.body, locale),
    startsAt: row.startsAt,
    location: row.location,
    imageUrl: row.imageUrl,
    exchangeOnly: row.exchangeOnly,
    registrationType: row.registrationType,
    registrationUrl: row.registrationUrl,
    registrationDeadline: row.registrationDeadline,
    capacity: row.capacity,
  };
}

/** Events stay listed until the end of the day they happen. */
const listedSince = () => new Date(Date.now() - 12 * 60 * 60 * 1000);

export async function listUpcomingEvents(locale: Locale): Promise<PublicEvent[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.published, true), gte(events.startsAt, listedSince())))
    .orderBy(asc(events.startsAt));
  return rows.map((row) => toPublicEvent(row, locale));
}

export async function listHomeEvents(locale: Locale): Promise<PublicEvent[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.published, true), eq(events.showInHome, true)))
    .orderBy(asc(events.homeOrder), asc(events.startsAt))
    .limit(6);
  return rows.map((row) => toPublicEvent(row, locale));
}

export type EventDetail = PublicEvent & {
  formFields: FormField[];
  confirmedCount: number;
};

export const getEventBySlug = cache(async (slug: string, locale: Locale): Promise<EventDetail | null> => {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.published, true)))
    .limit(1);
  if (!row) return null;
  const [{ value: confirmedCount }] = await db
    .select({ value: count() })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, row.id), eq(eventRegistrations.status, 'confirmed')));
  return { ...toPublicEvent(row, locale), formFields: row.formFields, confirmedCount };
});

export type PublicFaq = { id: string; question: string; answer: string; category: string };

export async function listFaqs(locale: Locale): Promise<PublicFaq[]> {
  const db = await getDb();
  const rows = await db.select().from(faqs).where(eq(faqs.published, true)).orderBy(asc(faqs.sortOrder));
  return rows.map((row) => ({
    id: row.id,
    question: pick(row.question, locale),
    answer: pick(row.answer, locale),
    category: pick(row.category, locale) || 'General',
  }));
}

export type PublicTeamMember = {
  id: string;
  name: string;
  role: string;
  career: string;
  bio: string;
  imageUrl: string | null;
  linkedinUrl: string | null;
};

export async function listTeam(locale: Locale): Promise<PublicTeamMember[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.active, true))
    .orderBy(asc(teamMembers.sortOrder));
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    role: pick(row.role, locale),
    career: pick(row.career, locale),
    bio: pick(row.bio, locale),
    imageUrl: row.imageUrl,
    linkedinUrl: row.linkedinUrl,
  }));
}

export type PublicPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  coverUrl: string | null;
  authorName: string;
  publishedAt: Date;
};

function toPublicPost(row: schema.PostRow, locale: Locale): PublicPost {
  return {
    id: row.id,
    slug: row.slug,
    title: pick(row.title, locale),
    excerpt: pick(row.excerpt, locale),
    body: pick(row.body, locale),
    category: pick(row.category, locale),
    coverUrl: row.coverUrl,
    authorName: row.authorName,
    publishedAt: row.publishedAt,
  };
}

export async function listPosts(locale: Locale): Promise<PublicPost[]> {
  const db = await getDb();
  const rows = await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.publishedAt));
  return rows.map((row) => toPublicPost(row, locale));
}

export const getPostBySlug = cache(async (slug: string, locale: Locale): Promise<PublicPost | null> => {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)))
    .limit(1);
  return row ? toPublicPost(row, locale) : null;
});

/** The program shown on /buddies (at most one is active). */
export const getActiveProgram = cache(async () => {
  const db = await getDb();
  const [row] = await db.select().from(buddyPrograms).where(eq(buddyPrograms.active, true)).limit(1);
  return row ?? null;
});
