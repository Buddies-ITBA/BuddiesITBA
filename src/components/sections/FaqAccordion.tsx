'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, SearchX } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FAQ } from '@/lib/cms/types';
import { matchesQuery } from '@/lib/search';
import { cn } from '@/lib/utils';

type Translations = {
  label: string;
  placeholder: string;
  all: string;
  /** Contains "{query}" placeholder */
  noResults: string;
  noResultsHint: string;
};

type Props = {
  faqs: FAQ[];
  translations: Translations;
};

export function FaqAccordion({ faqs, translations: t }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(faqs.map((faq) => faq.category))], [faqs]);

  const groups = useMemo(() => {
    const visible = faqs.filter(
      (faq) =>
        (category === null || faq.category === category) &&
        matchesQuery(`${faq.question} ${faq.answer}`, query)
    );
    return categories
      .map((name) => ({ name, items: visible.filter((faq) => faq.category === name) }))
      .filter((group) => group.items.length > 0);
  }, [faqs, categories, category, query]);

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
            <div className="rounded-3xl border border-dashed border-plane/50 bg-white p-10 text-center">
              <SearchX className="mx-auto size-10 text-plane" aria-hidden />
              <p className="mt-4 font-semibold text-heading">{t.noResults.replace('{query}', query)}</p>
              <p className="mt-1 text-sm text-text-muted">{t.noResultsHint}</p>
            </div>
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
                        <ReactMarkdown>{faq.answer}</ReactMarkdown>
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
