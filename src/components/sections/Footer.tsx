import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/buddiesitba', icon: 'instagram' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/buddiesitba', icon: 'linkedin' },
];

const footerLinks = [
  { key: 'about', href: '/about' },
  { key: 'events', href: '/events' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
];

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('nav');
  const tFooter = await getTranslations('footer');

  return (
    <footer className="bg-primary-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-heading font-bold mb-4 text-white">
              Buddies ITBA
            </h3>
            <p className="text-white/85 text-sm">
              {tFooter('tagline')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-white">Links</h4>
            <nav className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.key}
                  href={`/${locale}${link.href}`}
                  className="text-white/75 hover:text-white transition-colors text-sm"
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-white">
              {tFooter('contact')}
            </h4>
            <div className="text-white/75 text-sm space-y-2">
              <p>ITBA - Instituto Tecnológico de Buenos Aires</p>
              <p>Iguazú 341</p>
              <p>Buenos Aires, Argentina</p>
              <p className="mt-4">
                <a href="mailto:buddies@itba.edu.ar" className="hover:text-white">
                  buddies@itba.edu.ar
                </a>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/25" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/65 text-sm">
            © {new Date().getFullYear()} Buddies ITBA. {tFooter('rights')}.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label={social.name}
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
