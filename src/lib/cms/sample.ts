import { Locale } from '@/i18n/config';
import { BlogPost, CMSClient, Event, FAQ, NotionBlock, TeamMember } from './types';

/**
 * Offline CMS used when NOTION_TOKEN is not set (local dev, CI, previews).
 * Lets anyone run `npm run dev` and see every page without Notion credentials.
 * Content is illustrative only — production always reads from Notion.
 */

type Localized = Record<Locale, string>;
const pick = (text: Localized, locale: Locale) => text[locale] ?? text.es;

const DAY = 24 * 60 * 60 * 1000;

/** `days` from now at `hour` Buenos Aires time (UTC-3), so sample events are always upcoming. */
function daysFromNow(days: number, hour: number): Date {
  const date = new Date(Date.now() + days * DAY);
  date.setUTCHours(hour + 3, 0, 0, 0);
  return date;
}

const faqs: Array<{ question: Localized; answer: Localized; category: Localized }> = [
  {
    category: { es: 'Llegada', en: 'Arrival' },
    question: { es: '¿Cómo me asignan un buddy?', en: 'How do I get a buddy?' },
    answer: {
      es: 'Antes de que empiece el cuatrimestre te enviamos un formulario. Con tus respuestas te emparejamos con un estudiante del ITBA que te va a escribir antes de que llegues.',
      en: 'Before the semester starts we send you a form. Based on your answers we pair you with an ITBA student who will reach out before you arrive.',
    },
  },
  {
    category: { es: 'Llegada', en: 'Arrival' },
    question: { es: '¿Qué SIM o plan de celular conviene?', en: 'Which SIM card or phone plan should I get?' },
    answer: {
      es: 'Las opciones más usadas son **Personal**, **Claro** y **Movistar**. Podés comprar un chip prepago en cualquier kiosco y cargarlo online.',
      en: 'The most common carriers are **Personal**, **Claro** and **Movistar**. You can buy a prepaid SIM at any kiosk and top it up online.',
    },
  },
  {
    category: { es: 'Vida en Buenos Aires', en: 'Life in Buenos Aires' },
    question: { es: '¿Cómo me muevo por la ciudad?', en: 'How do I get around the city?' },
    answer: {
      es: 'Con la tarjeta **SUBE** podés usar subte, colectivos y trenes. Se consigue en kioscos y estaciones de subte.',
      en: 'The **SUBE** card works on the subway, buses and trains. You can get one at kiosks and subway stations.',
    },
  },
  {
    category: { es: 'Vida en Buenos Aires', en: 'Life in Buenos Aires' },
    question: { es: '¿Qué es el mate?', en: 'What is mate?' },
    answer: {
      es: 'Una infusión que se comparte en ronda. Si te ofrecen, aceptá: ¡es la mejor forma de hacer amigos!',
      en: 'A herbal drink shared in a circle. If someone offers you one, say yes — it is the best way to make friends!',
    },
  },
];

const team: Array<Omit<TeamMember, 'role' | 'career'> & { role: Localized; career: Localized }> = [
  { id: 'team-1', name: 'Sofía Martínez', image: '/assets/img/team/team-1.jpg', role: { es: 'Presidenta', en: 'President' }, career: { es: 'Ing. Industrial', en: 'Industrial Engineering' } },
  { id: 'team-2', name: 'Tomás García', image: '/assets/img/team/team-2.jpg', role: { es: 'Eventos', en: 'Events' }, career: { es: 'Ing. Informática', en: 'Computer Engineering' } },
  { id: 'team-3', name: 'Lucía Fernández', image: '/assets/img/team/team-3.jpg', role: { es: 'Comunicación', en: 'Communications' }, career: { es: 'Bioingeniería', en: 'Bioengineering' } },
  { id: 'team-4', name: 'Mateo López', image: '/assets/img/team/team-4.jpg', role: { es: 'Matching', en: 'Matching' }, career: { es: 'Ing. Mecánica', en: 'Mechanical Engineering' } },
];

const events: Array<Omit<Event, 'title' | 'description'> & { title: Localized; description: Localized }> = [
  {
    id: 'evt-welcome',
    title: { es: 'Asado de bienvenida', en: 'Welcome asado' },
    description: { es: 'Arrancamos el cuatrimestre con el clásico asado argentino. Conocé a tu buddy y al resto de los estudiantes.', en: 'We kick off the semester with a classic Argentine asado. Meet your buddy and the rest of the students.' },
    date: daysFromNow(5, 19),
    location: 'Campus ITBA, Parque Patricios',
    image: '/assets/img/asado.png',
    capacity: 120,
    registrationType: 'forms',
    registrationLink: 'https://forms.gle/example',
    showInHome: true,
    showInEvents: true,
  },
  {
    id: 'evt-tour',
    title: { es: 'City tour por el centro', en: 'Downtown city tour' },
    description: { es: 'Recorremos el Obelisco, Plaza de Mayo y San Telmo con guías buddies.', en: 'We walk around the Obelisco, Plaza de Mayo and San Telmo with buddy guides.' },
    date: daysFromNow(12, 10),
    location: 'Obelisco, CABA',
    image: '/assets/img/tour_hero.png',
    registrationType: 'whatsapp',
    showInHome: true,
    showInEvents: true,
    exchangeOnly: true,
  },
  {
    id: 'evt-mate',
    title: { es: 'Mateada en el parque', en: 'Mate in the park' },
    description: { es: 'Tarde tranquila de mate, facturas y charla en Parque Centenario.', en: 'A chill afternoon of mate, pastries and conversation at Parque Centenario.' },
    date: daysFromNow(38, 16),
    location: 'Parque Centenario',
    image: '/assets/img/mate_about.JPG',
    registrationType: 'whatsapp',
    showInHome: true,
    showInEvents: true,
  },
];

const posts: Array<Omit<BlogPost, 'title' | 'excerpt' | 'category'> & { title: Localized; excerpt: Localized; category: Localized }> = [
  {
    id: 'post-first-week',
    slug: 'primera-semana-en-buenos-aires',
    title: { es: 'Tu primera semana en Buenos Aires', en: 'Your first week in Buenos Aires' },
    excerpt: { es: 'Todo lo que tenés que resolver apenas llegás: SUBE, chip, banco y dónde comer.', en: 'Everything to sort out when you land: SUBE card, SIM, banking and where to eat.' },
    category: { es: 'Guías', en: 'Guides' },
    coverImage: '/assets/img/ba-tour.jpg',
    publishedAt: new Date(Date.now() - 10 * DAY),
    author: { id: '', name: 'Buddies ITBA', image: '' },
  },
  {
    id: 'post-asado',
    slug: 'que-es-un-asado',
    title: { es: '¿Qué es un asado?', en: 'What is an asado?' },
    excerpt: { es: 'La guía definitiva para sobrevivir (y disfrutar) tu primer asado argentino.', en: 'The ultimate guide to surviving (and enjoying) your first Argentine asado.' },
    category: { es: 'Cultura', en: 'Culture' },
    coverImage: '/assets/img/asado.png',
    publishedAt: new Date(Date.now() - 30 * DAY),
    author: { id: '', name: 'Buddies ITBA', image: '' },
  },
];

export class SampleCMS implements CMSClient {
  async getFAQs(locale: Locale): Promise<FAQ[]> {
    return faqs.map((faq, index) => ({
      id: `faq-${index}`,
      question: pick(faq.question, locale),
      answer: pick(faq.answer, locale),
      category: pick(faq.category, locale),
      order: index,
    }));
  }

  async getTeamMembers(locale: Locale): Promise<TeamMember[]> {
    return team.map((member) => ({
      ...member,
      role: pick(member.role, locale),
      career: pick(member.career, locale),
    }));
  }

  async getUpcomingEvents(locale: Locale): Promise<Event[]> {
    return events
      .filter((event) => event.showInEvents)
      .map((event) => this.localizeEvent(event, locale));
  }

  async getHomeEvents(locale: Locale): Promise<Event[]> {
    return events
      .filter((event) => event.showInHome)
      .map((event) => this.localizeEvent(event, locale));
  }

  async getPosts(locale: Locale, limit?: number): Promise<BlogPost[]> {
    return posts.slice(0, limit).map((post) => this.localizePost(post, locale));
  }

  async getPostBySlug(slug: string, locale: Locale): Promise<BlogPost | null> {
    const post = posts.find((p) => p.slug === slug);
    return post ? this.localizePost(post, locale) : null;
  }

  // No rich body content offline: pages fall back to the localized description/excerpt.
  async getPageBlocks(): Promise<NotionBlock[]> {
    return [];
  }

  private localizeEvent(event: (typeof events)[number], locale: Locale): Event {
    return { ...event, title: pick(event.title, locale), description: pick(event.description, locale) };
  }

  private localizePost(post: (typeof posts)[number], locale: Locale): BlogPost {
    return {
      ...post,
      title: pick(post.title, locale),
      excerpt: pick(post.excerpt, locale),
      category: pick(post.category, locale),
    };
  }
}
