import Image from 'next/image';
import { LinkedinIcon as Linkedin } from '@/components/brand/social-icons';
import type { PublicTeamMember } from '@/lib/data/public';
import { SectionHeading } from '@/components/ui/section-heading';

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  members: Array<PublicTeamMember & { linkedinLabel: string }>;
};

export function TeamSection({ eyebrow, title, subtitle, members }: Props) {
  if (members.length === 0) {
    return null;
  }

  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member) => (
            <li key={member.id} className="text-center">
              <div className="relative mx-auto aspect-square w-full max-w-44 overflow-hidden rounded-full bg-sky ring-4 ring-white shadow-md">
                {member.imageUrl ? (
                  <Image src={member.imageUrl} alt="" fill sizes="176px" className="object-cover" />
                ) : (
                  <span aria-hidden className="grid h-full place-items-center font-heading text-5xl font-bold text-primary">
                    {member.name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-bold">{member.name}</h3>
              <p className="font-nav text-sm font-semibold text-primary">{member.role}</p>
              {member.career && <p className="text-sm text-text-muted">{member.career}</p>}
              {member.bio && <p className="mx-auto mt-2 max-w-xs text-sm text-text-muted">{member.bio}</p>}
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={member.linkedinLabel}
                  className="mt-3 inline-grid size-9 place-items-center rounded-full bg-sky text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <Linkedin className="size-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
