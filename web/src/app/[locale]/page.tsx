import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('hero');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-text-muted mb-8">
          {t('subtitle')}
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary-dark">
          {t('cta')}
        </Button>

        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/es"
            className={`px-3 py-1 rounded ${locale === 'es' ? 'bg-primary text-white' : 'bg-surface'}`}
          >
            ES
          </a>
          <a
            href="/en"
            className={`px-3 py-1 rounded ${locale === 'en' ? 'bg-primary text-white' : 'bg-surface'}`}
          >
            EN
          </a>
        </div>
      </div>
    </main>
  );
}
