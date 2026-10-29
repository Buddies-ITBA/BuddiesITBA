import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { InstagramIcon as Instagram } from '@/components/brand/social-icons';
import { mailto, site } from '@/config/site';
import { Button } from '@/components/ui/button';

type ContactSectionProps = {
  addressTitle: string;
  addressLines: string[];
  directions: string;
  emailTitle: string;
  emailDescription: string;
  emailButton: string;
  instagramTitle: string;
  instagramDescription: string;
  instagramButton: string;
  mapTitle: string;
};

export function ContactSection(t: ContactSectionProps) {
  const cards = [
    {
      Icon: Mail,
      title: t.emailTitle,
      body: <p>{t.emailDescription}</p>,
      detail: site.email,
      action: { href: mailto(site.email), label: t.emailButton, external: false },
    },
    {
      Icon: Instagram,
      title: t.instagramTitle,
      body: <p>{t.instagramDescription}</p>,
      detail: `@${site.instagram.handle}`,
      action: { href: site.instagram.url, label: t.instagramButton, external: true },
    },
    {
      Icon: MapPin,
      title: t.addressTitle,
      body: <address className="not-italic">{t.addressLines.join(', ')}</address>,
      detail: null,
      action: { href: site.mapsUrl, label: t.directions, external: true },
    },
  ];

  return (
    <section className="section pt-8 md:pt-12">
      <div className="container-page">
        <ul className="grid gap-5 md:grid-cols-3">
          {cards.map(({ Icon, title, body, detail, action }) => (
            <li key={title} className="flex flex-col rounded-3xl border bg-white p-7 shadow-sm">
              <span className="grid size-12 place-items-center rounded-2xl bg-sky text-primary">
                <Icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-bold">{title}</h2>
              <div className="mt-2 text-text-muted">{body}</div>
              {detail && <p className="mt-3 break-all font-semibold text-heading">{detail}</p>}
              <Button asChild variant={action.external ? 'outline' : 'default'} className="mt-6 self-start">
                <a
                  href={action.href}
                  {...(action.external && { target: '_blank', rel: 'noopener noreferrer' })}
                >
                  {action.label}
                  {action.external && <ArrowUpRight />}
                </a>
              </Button>
            </li>
          ))}
        </ul>

        <div className="mt-10 overflow-hidden rounded-3xl border shadow-sm">
          <iframe
            title={t.mapTitle}
            className="h-80 w-full border-0 md:h-96"
            src={site.mapsEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
