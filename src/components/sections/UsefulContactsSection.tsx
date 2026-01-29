import { CheckCircle } from 'lucide-react';

type UsefulContactsSectionProps = {
  title: string;
  subtitle: string;
  contacts: string[];
};

export function UsefulContactsSection({
  title,
  subtitle,
  contacts,
}: UsefulContactsSectionProps) {
  return (
    <section className="bg-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-heading">
            {title}
          </h2>
          <p className="mt-2 text-text-muted">{subtitle}</p>
        </div>
        <ul className="mt-8 space-y-3 max-w-3xl mx-auto">
          {contacts.map((contact) => (
            <li key={contact} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-accent" />
              <span className="text-text">{contact}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

