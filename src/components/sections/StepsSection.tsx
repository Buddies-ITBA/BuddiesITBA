import { CalendarHeart, Compass, HeartHandshake } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';

type Step = { title: string; description: string };

type StepsSectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: Step[];
};

const icons = [HeartHandshake, CalendarHeart, Compass];

export function StepsSection({ eyebrow, title, subtitle, steps }: StepsSectionProps) {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="section bg-white">
      <div className="container-page">
        <SectionHeading id="how-it-works-title" eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Dashed connector between steps on desktop */}
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-plane/50 md:block"
          />
          {steps.map((step, index) => {
            const Icon = icons[index % icons.length];
            return (
              <li key={step.title} className="relative rounded-2xl border bg-background p-6 text-center md:border-0 md:bg-transparent md:p-0">
                <div className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <Icon className="size-7" aria-hidden />
                  <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-sun font-nav text-xs font-bold text-primary-dark ring-4 ring-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-text-muted">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
