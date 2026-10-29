'use server';

import { redirect } from 'next/navigation';
import { cancelByToken } from '@/lib/registrations';

export async function confirmCancellation(token: string) {
  const ok = await cancelByToken(token);
  redirect(`/events/cancel?${ok ? 'done=1' : 'invalid=1'}`);
}
