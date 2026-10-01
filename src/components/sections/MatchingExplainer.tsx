import { Languages, Shapes, Sparkles, UserCheck } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

type Item = { title: string; description: string };
const icons = [Shapes, Sparkles, Languages, UserCheck];

/** Explains the questionnaire → match logic, so people trust it and answer honestly. */
export function MatchingExplainer({ eyebrow, title, subtitle, items }: { eyebrow: string; title: string; subtitle: string; items: Item[] }) {
  return (
    <section className="section bg-white">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />
          {/* Illustration: two "profiles" whose shared interests light up */}
          <div aria-hidden className="relative mt-10 hidden h-44 lg:block">
            {[
              { side: 'left-0', chips: ['🎵', '🍕', '⚽', '✈️'], tone: 'bg-primary text-white' },
              { side: 'right-0', chips: ['🎵', '📚', '✈️', '🎨'], tone: 'bg-sun text-primary-dark' },
            ].map(({ side, chips, tone }, i) => (
              <div key={i} className={`absolute top-0 ${side} w-[46%] rounded-2xl border bg-background p-4 shadow-sm`}>
                <div className={`mb-3 size-10 rounded-full ${tone} grid place-items-center font-bold`}>{i ? 'B' : 'A'}</div>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((c) => (
                    <span key={c} className={`rounded-full px-2 py-1 text-sm ${c === '🎵' || c === '✈️' ? 'bg-plane/20 ring-2 ring-plane' : 'bg-white ring-1 ring-border'}`}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="absolute left-1/2 top-12 grid size-12 -translate-x-1/2 place-items-center rounded-full bg-white font-heading text-sm font-extrabold text-primary shadow-lg ring-4 ring-sky">
              87%
            </div>
          </div>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <li key={item.title} className="rounded-2xl border bg-background p-6">
                <Icon className="size-6 text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-text-muted">{item.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
