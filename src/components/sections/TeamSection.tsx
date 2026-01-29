import Image from 'next/image';
import { TeamMember } from '@/lib/cms/types';

type Props = {
  title: string;
  subtitle?: string;
  members: TeamMember[];
};

export function TeamSection({ title, subtitle, members }: Props) {
  if (members.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-heading font-bold text-heading">{title}</h2>
          {subtitle && <p className="mt-2 text-text-muted">{subtitle}</p>}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="group rounded-2xl bg-background p-6 text-center transition hover:shadow-md"
            >
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  width={160}
                  height={160}
                  className="mx-auto h-32 w-32 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
              )}
              <h3 className="mt-4 font-heading font-semibold text-heading">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-primary">{member.role}</p>
              {member.bio && (
                <p className="mt-2 text-sm text-text-muted">{member.bio}</p>
              )}
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  LinkedIn
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
