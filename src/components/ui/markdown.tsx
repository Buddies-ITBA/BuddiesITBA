import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

/** Renders admin-authored markdown (event bodies, posts, FAQ answers). Raw HTML is not allowed. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose max-w-none text-text prose-headings:font-heading prose-headings:text-heading prose-a:text-primary prose-strong:text-heading prose-img:rounded-2xl',
        className
      )}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
