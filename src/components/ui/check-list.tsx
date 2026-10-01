import { Check } from 'lucide-react';

/** Brand checklist: sky circle with a check, used for highlights/points. */
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 space-y-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sky text-primary">
            <Check className="size-3.5" strokeWidth={3} aria-hidden />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
