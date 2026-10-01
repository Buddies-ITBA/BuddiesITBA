import { count } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/password';
import { defaultBuddyQuestions } from '@/lib/buddies/default-questions';
import type { DB } from './index';
import * as s from './schema';

/** Local-only credentials, printed to the console on first run. */
export const DEV_ADMIN = { email: 'admin@buddies.local', password: 'buddies-admin' };

const DAY = 24 * 60 * 60 * 1000;
/** `days` from now at `hour` Buenos Aires time (UTC-3). */
function daysFromNow(days: number, hour: number): Date {
  const date = new Date(Date.now() + days * DAY);
  date.setUTCHours(hour + 3, 0, 0, 0);
  return date;
}

/** Fills an empty local database with sample content so every page has something to show. */
export async function seedIfEmpty(db: DB) {
  const [{ value: adminCount }] = await db.select({ value: count() }).from(s.admins);
  if (adminCount > 0) return;

  console.info(`[db] Seeding local database. Admin login: ${DEV_ADMIN.email} / ${DEV_ADMIN.password}`);

  await db.insert(s.admins).values({
    email: DEV_ADMIN.email,
    name: 'Admin local',
    passwordHash: await hashPassword(DEV_ADMIN.password),
  });

  await db.insert(s.events).values([
    {
      slug: 'asado-de-bienvenida',
      title: { es: 'Asado de bienvenida', en: 'Welcome asado' },
      summary: {
        es: 'Arrancamos el cuatrimestre con el clásico asado argentino. Conocé a tu buddy y al resto de los estudiantes.',
        en: 'We kick off the semester with a classic Argentine asado. Meet your buddy and the rest of the students.',
      },
      body: {
        es: '## Qué incluye\n\n- Asado completo y opción vegetariana\n- Bebidas\n- Juegos y música\n\n**Traé ganas de conocer gente.**',
        en: "## What's included\n\n- Full asado and vegetarian option\n- Drinks\n- Games and music\n\n**Bring your best mood.**",
      },
      startsAt: daysFromNow(5, 19),
      location: 'Campus ITBA, Parque Patricios',
      imageUrl: '/assets/img/asado.png',
      published: true,
      showInHome: true,
      homeOrder: 1,
      registrationType: 'form',
      capacity: 120,
      registrationDeadline: daysFromNow(4, 23),
      formFields: [
        {
          id: 'diet',
          type: 'select',
          label: { es: 'Alimentación', en: 'Diet' },
          required: true,
          options: [
            { value: 'any', label: { es: 'Como de todo', en: 'I eat everything' } },
            { value: 'vegetarian', label: { es: 'Vegetariano/a', en: 'Vegetarian' } },
            { value: 'vegan', label: { es: 'Vegano/a', en: 'Vegan' } },
          ],
        },
        {
          id: 'university',
          type: 'text',
          label: { es: 'Universidad de origen', en: 'Home university' },
          required: false,
        },
      ],
    },
    {
      slug: 'city-tour-centro',
      title: { es: 'City tour por el centro', en: 'Downtown city tour' },
      summary: {
        es: 'Recorremos el Obelisco, Plaza de Mayo y San Telmo con guías buddies.',
        en: 'We walk around the Obelisco, Plaza de Mayo and San Telmo with buddy guides.',
      },
      body: { es: '', en: '' },
      startsAt: daysFromNow(12, 10),
      location: 'Obelisco, CABA',
      imageUrl: '/assets/img/tour_hero.png',
      exchangeOnly: true,
      published: true,
      showInHome: true,
      homeOrder: 2,
      registrationType: 'whatsapp',
    },
    {
      slug: 'mateada-en-el-parque',
      title: { es: 'Mateada en el parque', en: 'Mate in the park' },
      summary: {
        es: 'Tarde tranquila de mate, facturas y charla en Parque Centenario.',
        en: 'A chill afternoon of mate, pastries and conversation at Parque Centenario.',
      },
      body: { es: '', en: '' },
      startsAt: daysFromNow(38, 16),
      location: 'Parque Centenario',
      imageUrl: '/assets/img/mate_about.JPG',
      published: true,
      showInHome: true,
      homeOrder: 3,
    },
  ]);

  await db.insert(s.faqs).values([
    {
      sortOrder: 1,
      category: { es: 'Llegada', en: 'Arrival' },
      question: { es: '¿Cómo me asignan un buddy?', en: 'How do I get a buddy?' },
      answer: {
        es: 'Completá la inscripción al programa en la sección **Buddies**. Con tus respuestas te emparejamos con un estudiante del ITBA que te escribe antes de que llegues.',
        en: 'Fill in the program application in the **Buddies** section. Based on your answers we pair you with an ITBA student who reaches out before you arrive.',
      },
    },
    {
      sortOrder: 2,
      category: { es: 'Llegada', en: 'Arrival' },
      question: { es: '¿Qué SIM o plan de celular conviene?', en: 'Which SIM card should I get?' },
      answer: {
        es: 'Las opciones más usadas son **Personal**, **Claro** y **Movistar**. Podés comprar un chip prepago en cualquier kiosco.',
        en: 'The most common carriers are **Personal**, **Claro** and **Movistar**. You can buy a prepaid SIM at any kiosk.',
      },
    },
    {
      sortOrder: 3,
      category: { es: 'Vida en Buenos Aires', en: 'Life in Buenos Aires' },
      question: { es: '¿Cómo me muevo por la ciudad?', en: 'How do I get around the city?' },
      answer: {
        es: 'Con la tarjeta **SUBE** podés usar subte, colectivos y trenes.',
        en: 'The **SUBE** card works on the subway, buses and trains.',
      },
    },
  ]);

  await db.insert(s.teamMembers).values([
    { name: 'Sofía Martínez', imageUrl: '/assets/img/team/team-1.jpg', sortOrder: 1, role: { es: 'Presidenta', en: 'President' }, career: { es: 'Ing. Industrial', en: 'Industrial Engineering' } },
    { name: 'Tomás García', imageUrl: '/assets/img/team/team-2.jpg', sortOrder: 2, role: { es: 'Eventos', en: 'Events' }, career: { es: 'Ing. Informática', en: 'Computer Engineering' } },
    { name: 'Lucía Fernández', imageUrl: '/assets/img/team/team-3.jpg', sortOrder: 3, role: { es: 'Comunicación', en: 'Communications' }, career: { es: 'Bioingeniería', en: 'Bioengineering' } },
    { name: 'Mateo López', imageUrl: '/assets/img/team/team-4.jpg', sortOrder: 4, role: { es: 'Matching', en: 'Matching' }, career: { es: 'Ing. Mecánica', en: 'Mechanical Engineering' } },
  ]);

  await db.insert(s.posts).values({
    slug: 'primera-semana-en-buenos-aires',
    title: { es: 'Tu primera semana en Buenos Aires', en: 'Your first week in Buenos Aires' },
    excerpt: {
      es: 'Todo lo que tenés que resolver apenas llegás: SUBE, chip, banco y dónde comer.',
      en: 'Everything to sort out when you land: SUBE card, SIM, banking and where to eat.',
    },
    body: {
      es: '## 1. Conseguí la SUBE\n\nEs la tarjeta para moverte en transporte público.\n\n## 2. Comprá un chip\n\nCualquier kiosco vende chips prepagos.',
      en: '## 1. Get a SUBE card\n\nIt is the card for public transport.\n\n## 2. Buy a SIM\n\nAny kiosk sells prepaid SIM cards.',
    },
    category: { es: 'Guías', en: 'Guides' },
    coverUrl: '/assets/img/ba-tour.jpg',
    published: true,
    publishedAt: new Date(Date.now() - 10 * DAY),
  });

  const [program] = await db
    .insert(s.buddyPrograms)
    .values({ name: 'Programa de ejemplo', active: true, registrationOpen: true, questions: defaultBuddyQuestions })
    .returning();
  await db.insert(s.buddyApplicants).values(sampleApplicants(program.id));
}

/** Deterministic fake applicants so the matching screen has data locally. */
function sampleApplicants(programId: string) {
  const interests = ['sports', 'outdoors', 'music', 'nightlife', 'food', 'culture', 'travel', 'gaming', 'art', 'tech', 'movies', 'reading'];
  const goals = ['friends', 'language', 'city', 'party', 'academic', 'trips'];
  const availability = ['low', 'medium', 'high'];
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const sample = <T,>(list: T[], n: number) => [...list].sort(() => rand() - 0.5).slice(0, n);
  const answers = () => ({
    interests: sample(interests, 3 + Math.floor(rand() * 3)),
    goals: sample(goals, 2),
    social_energy: 1 + Math.floor(rand() * 5),
    going_out: 1 + Math.floor(rand() * 5),
    planning: 1 + Math.floor(rand() * 5),
    availability: availability[Math.floor(rand() * 3)],
  });

  const locals = ['Valentina Ruiz', 'Joaquín Pérez', 'Camila Torres', 'Santiago Díaz', 'Martina Gómez'];
  const exchange = [
    ['Emma Schneider', 'Germany', 'TU München'],
    ['Lucas Martin', 'France', 'INSA Lyon'],
    ['Olivia Rossi', 'Italy', 'Politecnico di Milano'],
    ['Noah Johnson', 'USA', 'Georgia Tech'],
    ['Sofia Andersson', 'Sweden', 'KTH'],
    ['Liam Murphy', 'Ireland', 'UCD'],
    ['Mia Müller', 'Austria', 'TU Wien'],
    ['Hugo García', 'Spain', 'UPM'],
  ];
  const genders = ['female', 'male'] as const;
  return [
    ...locals.map((name, i) => ({
      programId,
      role: 'local' as const,
      name,
      email: `local${i + 1}@itba.edu.ar`,
      institution: 'Ing. Informática',
      country: 'Argentina',
      gender: genders[i % 2],
      languages: i % 2 ? ['es', 'en'] : ['es', 'en', 'pt'],
      capacity: i < 3 ? 2 : 1,
      answers: answers(),
    })),
    ...exchange.map(([name, country, institution], i) => ({
      programId,
      role: 'exchange' as const,
      name,
      email: `exchange${i + 1}@example.com`,
      institution,
      country,
      gender: genders[(i + 1) % 2],
      genderPreference: i === 2 ? ('same' as const) : ('any' as const),
      languages: ['en', i % 3 === 0 ? 'de' : 'es'],
      answers: answers(),
    })),
  ];
}
