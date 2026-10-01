import { CMSClient } from './types';
import { NotionCMS } from './notion';
import { SampleCMS } from './sample';

// Strategy Pattern: swap the implementation here (e.g. `new SanityCMS()`).
// Without NOTION_TOKEN we fall back to bundled sample content so the site
// builds and runs locally with zero setup.
function createCMS(): CMSClient {
  if (process.env.NOTION_TOKEN) {
    return new NotionCMS();
  }
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    console.error('[cms] NOTION_TOKEN missing in production — serving sample content.');
  } else {
    console.info('[cms] NOTION_TOKEN not set — using sample content (see .env.example).');
  }
  return new SampleCMS();
}

export const cms: CMSClient = createCMS();

export * from './types';
