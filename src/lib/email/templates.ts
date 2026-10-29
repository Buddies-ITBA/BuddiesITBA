import 'server-only';
import { getTranslations } from 'next-intl/server';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { site } from '@/config/site';
import { formatEventDate } from '@/lib/dates';
import { countryName } from '@/lib/countries';
import { renderEmail, type EmailBlock } from './layout';
import type { Email } from './send';

/*
 * Transactional emails, written in the recipient's language (stored when they
 * signed up). Copy lives in messages/*.json under "emails".
 */

const asLocale = (value: string | null | undefined): Locale => (isLocale(value) ? value : defaultLocale);
const absolute = (path: string) => new URL(path, site.url).toString();

type EventInfo = { title: string; slug: string; startsAt: Date; location: string };
type Person = { name: string; email: string; locale: string };

export type RegistrationEmailKind = 'confirmed' | 'waitlist' | 'promoted' | 'reminder';

export async function registrationEmail(
  kind: RegistrationEmailKind,
  person: Person,
  event: EventInfo,
  cancelToken: string | null
): Promise<Email> {
  const locale = asLocale(person.locale);
  const t = await getTranslations({ locale, namespace: 'emails' });
  const when = `${formatEventDate(event.startsAt, locale, 'weekdayLong')} · ${formatEventDate(event.startsAt, locale, 'time')}`;
  const vars = { event: event.title, when };
  const blocks: EmailBlock[] = [
    { type: 'p', text: t('greeting', { name: person.name.split(' ')[0] }) },
    { type: 'p', text: kind === 'waitlist' ? t('registration.waitlistBody', vars) : t(`registration.${kind}Body`) },
    {
      type: 'details',
      rows: [
        [t('when'), `${formatEventDate(event.startsAt, locale, 'weekdayLong')} · ${formatEventDate(event.startsAt, locale, 'time')}`],
        ...(event.location ? ([[t('where'), event.location]] as [string, string][]) : []),
      ],
    },
    { type: 'button', label: t('registration.viewEvent'), href: absolute(`/events/${event.slug}`) },
  ];
  if (cancelToken) {
    blocks.push(
      { type: 'small', text: t('registration.cancelHint') },
      { type: 'small', text: `${t('registration.cancel')}: ${absolute(`/events/cancel?token=${cancelToken}`)}` }
    );
  }
  const heading = kind === 'waitlist' ? t('registration.waitlistHeading') : t(`registration.${kind}Heading`, vars);
  return {
    to: person.email,
    subject: t(`registration.${kind}Subject`, vars),
    kind: `registration.${kind}`,
    // Reminders invite a reply instead of a cancel link (only the token's hash is stored)
    ...(kind === 'reminder' && { replyTo: site.email }),
    ...renderEmail(heading, blocks, t('footer')),
  };
}

export async function applicationReceivedEmail(person: Person, programName: string): Promise<Email> {
  const locale = asLocale(person.locale);
  const t = await getTranslations({ locale, namespace: 'emails' });
  return {
    to: person.email,
    subject: t('buddies.receivedSubject'),
    kind: 'buddies.received',
    ...renderEmail(
      t('buddies.receivedHeading'),
      [
        { type: 'p', text: t('greeting', { name: person.name.split(' ')[0] }) },
        { type: 'p', text: t('buddies.receivedBody', { program: programName }) },
      ],
      t('footer')
    ),
  };
}

type BuddyContact = Person & { phone: string; country: string; institution: string };

/** One email per side; each shows the other person's contact details. Reply-to is the buddy. */
export async function buddyIntroEmails(local: BuddyContact, exchange: BuddyContact): Promise<Email[]> {
  const contactRows = async (locale: Locale, other: BuddyContact) => {
    const t = await getTranslations({ locale, namespace: 'emails.buddies' });
    return [
      [t('name'), other.name],
      [t('email'), other.email],
      ...(other.phone ? [[t('phone'), other.phone]] : []),
    ] as [string, string][];
  };

  const toExchange = async (): Promise<Email> => {
    const locale = asLocale(exchange.locale);
    const t = await getTranslations({ locale, namespace: 'emails' });
    return {
      to: exchange.email,
      replyTo: local.email,
      subject: t('buddies.introSubjectExchange', { name: local.name }),
      kind: 'buddies.intro',
      ...renderEmail(
        t('buddies.introHeadingExchange'),
        [
          { type: 'p', text: t('greeting', { name: exchange.name.split(' ')[0] }) },
          { type: 'p', text: t('buddies.introBodyExchange', { buddy: local.name }) },
          { type: 'details', rows: await contactRows(locale, local) },
          { type: 'small', text: t('buddies.replyHint') },
        ],
        t('footer')
      ),
    };
  };

  const toLocal = async (): Promise<Email> => {
    const locale = asLocale(local.locale);
    const t = await getTranslations({ locale, namespace: 'emails' });
    const origin = [exchange.institution, countryName(exchange.country, locale)].filter(Boolean).join(', ');
    return {
      to: local.email,
      replyTo: exchange.email,
      subject: t('buddies.introSubjectLocal', { name: exchange.name }),
      kind: 'buddies.intro',
      ...renderEmail(
        t('buddies.introHeadingLocal'),
        [
          { type: 'p', text: t('greeting', { name: local.name.split(' ')[0] }) },
          { type: 'p', text: t('buddies.introBodyLocal', { student: exchange.name, origin }) },
          { type: 'details', rows: await contactRows(locale, exchange) },
          { type: 'small', text: t('buddies.replyHint') },
        ],
        t('footer')
      ),
    };
  };

  return Promise.all([toExchange(), toLocal()]);
}
