import { Locale } from '@/i18n/config';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  image?: string;
  capacity?: number;
  registeredCount?: number;
  registrationType?: 'whatsapp' | 'forms' | null;
  registrationLink?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: Date;
  author: Pick<TeamMember, 'id' | 'name' | 'image'>;
  category?: string;
}

// Notion block types for rendering
export type NotionBlock = {
  id: string;
  type: string;
  [key: string]: unknown;
};

export interface CMSClient {
  getFAQs(locale: Locale): Promise<FAQ[]>;
  getTeamMembers(locale: Locale): Promise<TeamMember[]>;
  getUpcomingEvents(locale: Locale): Promise<Event[]>;
  getPosts(locale: Locale, limit?: number): Promise<BlogPost[]>;
  getPostBySlug(slug: string, locale: Locale): Promise<BlogPost | null>;
  getPageBlocks(pageId: string): Promise<NotionBlock[]>;
}
