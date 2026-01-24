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
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: Date;
  author: TeamMember;
}

export interface CMSClient {
  getFAQs(locale: Locale): Promise<FAQ[]>;
  getTeamMembers(locale: Locale): Promise<TeamMember[]>;
  getUpcomingEvents(locale: Locale): Promise<Event[]>;
  getPosts(locale: Locale, limit?: number): Promise<BlogPost[]>;
}
