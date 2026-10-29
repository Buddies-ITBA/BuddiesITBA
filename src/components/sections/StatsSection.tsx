'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';

type StatItem = { value: number; label: string };

const DURATION_MS = 1600;

export function StatsSection({ stats }: { stats: StatItem[] }) {
  const locale = useLocale();
  const format = useMemo(() => new Intl.NumberFormat(locale).format, [locale]);
  const ref = useRef<HTMLDListElement>(null);

  // Numbers are rendered final on the server (no-JS / screenshots never show 0).
  // When the band first scrolls into view we count up by writing textContent
  // directly — no re-renders, no animation library.
  useEffect(() => {
    const list = ref.current;
    if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = [...list.querySelectorAll<HTMLElement>('[data-count]')];
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION_MS, 1);
          const eased = 1 - (1 - progress) ** 3;
          for (const node of nodes) node.textContent = format(Math.round(Number(node.dataset.count) * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { rootMargin: '-80px' }
    );
    observer.observe(list);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [format]);

  return (
    <section className="bg-primary text-white">
      <div className="container-page py-14 md:py-16">
        <dl ref={ref} className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center text-center">
              <dt className="mt-1 text-sm font-medium text-white/80">{stat.label}</dt>
              <dd data-count={stat.value} className="font-heading text-4xl font-extrabold tabular-nums md:text-5xl">
                {format(stat.value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
