import { getTranslations } from 'next-intl/server';
import { Instagram, Linkedin, Mail, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { navItems, site } from '@/config/site';
import { FlightPath } from '@/components/brand/flight-path';

export async function Footer() {
  const t = await getTranslations('nav');
  const tFooter = await getTranslations('footer');
  const tContact = await getTranslations('contact.section');

  const socials = [
    { name: 'Instagram', href: site.instagram.url, Icon: Instagram },
    { name: 'LinkedIn', href: site.linkedin.url, Icon: Linkedin },
  ];

  return (
    <footer className="relative overflow-hidden bg-primary-dark text-white">
      <FlightPath className="absolute -right-10 top-6 w-80 text-white/15 md:w-[28rem]" />
      <div className="container-page relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-heading text-2xl font-bold">{site.name}</p>
            <p className="mt-3 max-w-xs text-sm text-white/80">{tFooter('tagline')}</p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="font-nav text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {tFooter('explore')}
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-white/85 transition-colors hover:text-white hover:underline">
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-nav text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {tFooter('contact')}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-white hover:underline">
                  <Mail className="size-4 shrink-0" />
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 hover:text-white hover:underline">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{tContact.raw('addressLines').slice(0, 2).join(', ')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/65">
          © {new Date().getFullYear()} {site.name}. {tFooter('rights')}.
        </div>
      </div>
    </footer>
  );
}
