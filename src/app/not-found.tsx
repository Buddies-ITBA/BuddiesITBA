import { NotFoundView } from '@/components/feedback/NotFoundView';
import { SiteChrome } from '@/components/sections/SiteChrome';

// Unmatched URLs render outside the (site) group, so add the site frame here.
export default function GlobalNotFound() {
  return (
    <SiteChrome>
      <NotFoundView />
    </SiteChrome>
  );
}
