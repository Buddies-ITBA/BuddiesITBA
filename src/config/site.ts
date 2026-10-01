/** Non-translatable site facts. Translatable copy lives in src/messages/*.json. */
export const site = {
  name: 'Buddies ITBA',
  // Used for absolute URLs in share previews (WhatsApp, Instagram DMs…)
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
  email: 'buddies@itba.edu.ar',
  instagram: { handle: 'buddiesitba', url: 'https://instagram.com/buddiesitba' },
  linkedin: { url: 'https://linkedin.com/company/buddiesitba' },
  mapsUrl: 'https://maps.google.com/?q=Iguaz%C3%BA+341,+CABA,+Argentina',
  mapsEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.731039628759!2d-58.40791292435624!3d-34.62779856655948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb6b5f8702d9%3A0xb6fa82f8e04b3dc!2sIguaz%C3%BA%20341%2C%20CABA%2C%20Argentina!5e0!3m2!1ses-419!2sar!4v1696970221668!5m2!1ses-419!2sar',
} as const;

export const navItems = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'events', href: '/events' },
  { key: 'blog', href: '/blog' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
] as const;
