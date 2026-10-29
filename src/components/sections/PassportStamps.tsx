import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/utils';

type Stamp = { code: string; name: string; flag: string };

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  stamps: Stamp[];
};

// Deterministic "hand-stamped" look: each stamp gets a tilt and ink color from its position.
const tilts = ['-rotate-6', 'rotate-3', '-rotate-2', 'rotate-6', 'rotate-1', '-rotate-4'];
const inks = ['text-primary border-primary/60', 'text-plane border-plane/70', 'text-sun-ink border-sun/80', 'text-primary-dark border-primary-dark/50'];

/** Countries the community comes from, drawn as passport stamps. */
export function PassportStamps({ eyebrow, title, subtitle, stamps }: Props) {
  if (stamps.length < 3) return null;
  return (
    <section className="section overflow-hidden bg-white">
      <div className="container-page">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-6">
          {stamps.map((stamp, i) => (
            <li
              key={stamp.code}
              className={cn(
                'grid size-28 place-items-center rounded-full border-[3px] border-dashed bg-white/60 p-2 text-center transition-transform duration-300 hover:rotate-0 hover:scale-110 sm:size-32',
                tilts[i % tilts.length],
                inks[i % inks.length]
              )}
            >
              <span className="flex flex-col items-center gap-1">
                <span className="text-3xl leading-none" aria-hidden>
                  {stamp.flag}
                </span>
                <span className="font-nav text-[11px] font-bold uppercase leading-tight tracking-wider">{stamp.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
