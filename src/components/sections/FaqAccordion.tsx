import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ } from '@/lib/cms/types';
import ReactMarkdown from 'react-markdown';

type Props = {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
};

export function FaqAccordion({ faqs, title, subtitle }: Props) {
  // Group FAQs by category
  const faqsByCategory = faqs.reduce(
    (acc, faq) => {
      const category = faq.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    },
    {} as Record<string, FAQ[]>
  );

  const categories = Object.keys(faqsByCategory);

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-16">
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="text-3xl font-heading font-bold text-heading">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-text-muted">{subtitle}</p>
            )}
          </div>
        )}

        {categories.length === 1 ? (
          // Single category - just show accordion
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="rounded-xl border-none bg-surface px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium text-heading hover:text-primary hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="prose prose-sm max-w-none text-text-muted prose-strong:text-text prose-a:text-primary prose-a:no-underline prose-a:hover:underline prose-ul:my-2 prose-li:my-0">
                    <ReactMarkdown>{faq.answer}</ReactMarkdown>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          // Multiple categories - show grouped
          <div className="mx-auto max-w-3xl space-y-10">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="mb-4 text-lg font-semibold capitalize text-heading">
                  {category}
                </h3>
                <Accordion type="single" collapsible className="space-y-3">
                  {faqsByCategory[category].map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="rounded-xl border-none bg-surface px-6 shadow-sm"
                    >
                      <AccordionTrigger className="text-left font-medium text-heading hover:text-primary hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="prose prose-sm max-w-none text-text-muted prose-strong:text-text prose-a:text-primary prose-a:no-underline prose-a:hover:underline prose-ul:my-2 prose-li:my-0">
                        <ReactMarkdown>{faq.answer}</ReactMarkdown>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
