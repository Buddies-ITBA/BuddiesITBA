'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { PublicFaq } from '@/lib/data/public';
import { matchesWords, normalize, queryWords } from '@/lib/search';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/feedback/EmptyState';

type Translations = {
  label: string;
  placeholder: string;
  all: string;
  /** Contains "{query}" placeholder */
  noResults: string;
  noResultsHint: string;
  empty: string;
};

/** `answerNode` is the answer markdown pre-rendered on the server (keeps the parser out of the client bundle). */
export type FaqItem = PublicFaq & { answerNode: React.ReactNode };

type Props = {
  faqs: FaqItem[];
  translations: Translations;
};

export function FaqAccordion({ faqs, translations: t }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(() => [...new Set(faqs.map((faq) => faq.category))], [faqs]);
  const searchable = useMemo(
    () => faqs.map((faq) => ({ faq, text: normalize(`${faq.question} ${faq.answer}`) })),
    [faqs]
  );

  const groups = useMemo(() => {
    const words = queryWords(deferredQuery);
    const visible = searchable
      .filter(({ faq, text }) => (category === null || faq.category === category) && matchesWords(text, words))
      .map(({ faq }) => faq);
    return categories
      .map((name) => ({ name, items: visible.filter((faq) => faq.category === name) }))
      .filter((group) => group.items.length > 0);
  }, [searchable, categories, category, deferredQuery]);

  return (
    <section className="section pt-8 md:pt-12">
      <div className="container-page max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t.label}
            placeholder={t.placeholder}
            className="h-14 w-full rounded-2xl border bg-white pl-12 pr-4 text-base shadow-sm outline-none transition placeholder:text-text-muted/80 focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        {categories.length > 1 && (
          <div role="group" aria-label={t.label} className="mt-4 flex flex-wrap gap-2">
            {[null, ...categories].map((name) => {
              const active = category === name;
              return (
                <button
                  key={name ?? 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(name)}
                  className={cn(
                    'rounded-full px-4 py-1.5 font-nav text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                    active ? 'bg-primary text-white' : 'bg-white text-text ring-1 ring-border hover:bg-sky'
                  )}
                >
                  {name ?? t.all}
                </button>
              );
            })}
          </div>
        )}

        <div aria-live="polite" className="mt-10 space-y-10">
          {groups.length === 0 ? (
            faqs.length === 0 ? (
              <EmptyState Icon={SearchX} title={t.empty} />
            ) : (
              <EmptyState Icon={SearchX} title={t.noResults.replace('{query}', query)} hint={t.noResultsHint} />
            )
          ) : (
            groups.map((group) => (
              <div key={group.name}>
                {categories.length > 1 && (
                  <h2 className="mb-4 text-lg font-bold text-primary">{group.name}</h2>
                )}
                <Accordion type="single" collapsible className="space-y-3">
                  {group.items.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="rounded-2xl border bg-white px-5 shadow-sm transition-shadow data-[state=open]:shadow-md md:px-6"
                    >
                      <AccordionTrigger className="py-5 text-left text-base font-semibold text-heading hover:text-primary hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="prose-cms pb-5">
                        {faq.answerNode}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
