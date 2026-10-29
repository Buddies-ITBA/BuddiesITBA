import Image from 'next/image';
import { site } from '@/config/site';
import { InstagramIcon } from '@/components/brand/social-icons';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/utils';

type Photo = { id: string; imageUrl: string; caption: string };

const tilts = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1'];

/** A row of polaroids, like photos pinned to a travel journal. Swipeable. */
export function GalleryStrip({ eyebrow, title, instagramLabel, photos }: { eyebrow: string; title: string; instagramLabel: string; photos: Photo[] }) {
  if (photos.length === 0) return null;
  return (
    <section className="section overflow-hidden bg-sky/60">
      <div className="container-page flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow={eyebrow} title={title} align="left" />
        <a
          href={site.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 font-nav text-sm font-semibold text-primary hover:underline"
        >
          <InstagramIcon className="size-4" /> {instagramLabel}
        </a>
      </div>
      <ul className="mt-12 flex snap-x gap-6 overflow-x-auto px-[max(1rem,calc((100vw-72rem)/2+1.5rem))] pb-8 pt-4 [mask-image:linear-gradient(to_right,transparent,black_3%,black_90%,transparent)]">
        {photos.map((photo, i) => (
          <li key={photo.id} className={cn('w-56 shrink-0 snap-center transition-transform duration-300 hover:z-10 hover:rotate-0 hover:scale-105 sm:w-64', tilts[i % tilts.length])}>
            <figure className="bg-white p-3 pb-4 shadow-lg">
              <div className="relative aspect-square overflow-hidden bg-sky">
                <Image src={photo.imageUrl} alt={photo.caption} fill sizes="256px" className="object-cover" />
              </div>
              {photo.caption && <figcaption className="mt-3 text-center font-heading text-sm italic text-text">{photo.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
