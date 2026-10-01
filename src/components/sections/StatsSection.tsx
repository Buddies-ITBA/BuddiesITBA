'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';

type StatItem = { value: string; label: string };

function parseStatValue(value: string): { number: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  return match ? { number: parseInt(match[1], 10), suffix: match[2] } : { number: 0, suffix: value };
}

/**
 * Renders the real number on the server (so no-JS and screenshots never show 0)
 * and counts up from 0 once the band scrolls into view.
 */
function CountUp({ to, start }: { to: number; start: boolean }) {
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!start || reduceMotion) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [start, to, reduceMotion]);

  return <>{new Intl.NumberFormat(locale).format(value)}</>;
}

export function StatsSection({ stats }: { stats: StatItem[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-primary text-white">
      <div className="container-page py-14 md:py-16">
        <dl ref={ref} className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {stats.map((stat) => {
            const { number, suffix } = parseStatValue(stat.value);
            return (
              <div key={stat.label} className="flex flex-col-reverse items-center text-center">
                <dt className="mt-1 text-sm font-medium text-white/80">{stat.label}</dt>
                <dd className="font-heading text-4xl font-extrabold tabular-nums md:text-5xl">
                  {/* Screen readers get the final value; the count-up is visual only */}
                  <span className="sr-only">{stat.value}</span>
                  <span aria-hidden>
                    <CountUp to={number} start={inView} />
                    {suffix}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
