import { cn } from '@/lib/utils';

/**
 * Decorative dashed flight path + paper plane, borrowed from the Buddies logo.
 * Purely visual: hidden from assistive tech.
 */
export function FlightPath({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 120"
      fill="none"
      className={cn('pointer-events-none text-plane', className)}
    >
      <path
        d="M2 104 C 90 120, 140 30, 220 52 S 330 96, 360 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="8 10"
        opacity="0.7"
      />
      <path
        d="M352 34 L398 6 L384 52 L370 40 Z M370 40 L398 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
