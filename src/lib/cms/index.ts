import { CMSClient } from './types';
import { NotionCMS } from './notion';
import { SampleCMS } from './sample';

// Strategy Pattern: swap the implementation here (e.g. `new SanityCMS()`).
// Without NOTION_TOKEN we fall back to bundled sample content so the site
// builds and runs locally/in CI/in previews with zero setup.
function createCMS(): CMSClient {
  if (process.env.NOTION_TOKEN) {
    return new NotionCMS();
  }
  if (process.env.VERCEL_ENV === 'production') {
    // Never ship sample events to real users: fail the deploy instead.
    throw new Error('NOTION_TOKEN is required in production.');
  }
  console.info('[cms] NOTION_TOKEN not set — using sample content (see .env.example).');
  return new SampleCMS();
}

export const cms: CMSClient = createCMS();

export * from './types';
