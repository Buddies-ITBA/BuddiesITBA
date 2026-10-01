import { Instagram, Mail } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

type Contact = { name: string; email: string; instagram?: string };

type UsefulContactsSectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  contacts: Contact[];
};

export function UsefulContactsSection({ eyebrow, title, subtitle, contacts }: UsefulContactsSectionProps) {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {contacts.map((contact) => (
            <li key={contact.email} className="rounded-2xl border bg-background p-6">
              <h3 className="text-lg font-bold">{contact.name}</h3>
              <a
                href={`mailto:${contact.email}`}
                className="mt-3 flex items-center gap-2 break-all text-sm font-medium text-primary hover:underline"
              >
                <Mail className="size-4 shrink-0" aria-hidden />
                {contact.email}
              </a>
              {contact.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 text-sm text-text-muted hover:text-primary hover:underline"
                >
                  <Instagram className="size-4 shrink-0" aria-hidden />@{contact.instagram}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
