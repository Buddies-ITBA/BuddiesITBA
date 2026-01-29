"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useSpring,
  useTransform,
  MotionValue,
} from "framer-motion";

type StatItem = {
  value: string;
  label: string;
};

function AnimatedNumber({ value, inView }: { value: number; inView: boolean }) {
  const spring = useSpring(0, { duration: 2000, bounce: 0 });
  const rounded = useTransform(spring, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [rounded]);

  return <>{displayValue}</>;
}

function parseStatValue(value: string): { number: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) {
    return { number: parseInt(match[1], 10), suffix: match[2] };
  }
  return { number: 0, suffix: value };
}

export function StatsSection({ stats }: { stats: StatItem[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-background/80">
      <div className="container mx-auto px-4 py-16">
        <div
          ref={ref}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const { number, suffix } = parseStatValue(stat.value);

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="rounded-2xl bg-surface px-6 py-8 text-center shadow-sm"
              >
                <p className="text-3xl font-heading font-bold text-primary">
                  <AnimatedNumber value={number} inView={isInView} />
                  {suffix}
                </p>
                <p className="mt-2 text-sm font-medium text-text-muted">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
