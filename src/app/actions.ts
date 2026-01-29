'use server';

import { cms } from '@/lib/cms';
import { NotionBlock } from '@/lib/cms/types';

export async function getEventDetails(eventId: string): Promise<NotionBlock[]> {
    try {
        const blocks = await cms.getPageBlocks(eventId);
        return blocks;
    } catch (error) {
        console.error('Error fetching event details:', error);
        return [];
    }
}
