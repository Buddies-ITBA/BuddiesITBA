import { CMSClient } from './types';
import { NotionCMS } from './notion';

// Use Notion as the CMS implementation
// To switch to another CMS (e.g., Sanity), just change this line:
// import { SanityCMS } from './sanity';
// export const cms: CMSClient = new SanityCMS();

export const cms: CMSClient = new NotionCMS();

export * from './types';
