import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getDb, schema } from '@/db';
import type { BuddyProgramRow } from '@/db/schema';
import { defaultBuddyQuestions } from './default-questions';
vi.mock('@/lib/email/templates', () => ({ applicationReceivedEmail: async () => ({ to: '', subject: '', html: '', text: '', kind: 'x' }) }));
vi.mock('@/lib/email/send', () => ({ sendEmail: async () => true }));
const { questionsFor, submitApplication } = await import('./applications');

let program: BuddyProgramRow;

beforeAll(async () => {
  const db = await getDb();
  [program] = await db
    .insert(schema.buddyPrograms)
    .values({ name: 'Test', active: true, registrationOpen: true, questions: defaultBuddyQuestions })
    .returning();
});

function validForm(email: string) {
  const fd = new FormData();
  for (const [k, v] of Object.entries({
    name: 'Emma Schneider',
    email,
    phone: '+49 151 1234567',
    institution: 'TU München',
    country: 'DE',
    gender: 'female',
    genderPreference: 'any',
    consent: 'on',
    q_social_energy: '4',
    q_going_out: '3',
    q_planning: '2',
    q_availability: 'medium',
  })) fd.set(k, v);
  fd.append('languages', 'en');
  fd.append('languages', 'de');
  fd.append('q_interests', 'music');
  fd.append('q_goals', 'friends');
  return fd;
}

describe('submitApplication', () => {
  it('stores a valid application with its answers', async () => {
    expect(await submitApplication(program, 'exchange', validForm('emma@example.com'))).toEqual({ ok: true });
  });

  it('rejects a second application with the same email', async () => {
    expect(await submitApplication(program, 'exchange', validForm('EMMA@example.com'))).toEqual({ ok: false, reason: 'duplicate' });
  });

  it('reports which fields are invalid', async () => {
    const fd = validForm('other@example.com');
    fd.delete('q_interests');
    fd.set('gender', 'robot');
    const result = await submitApplication(program, 'exchange', fd);
    expect(result).toMatchObject({ ok: false, reason: 'invalid' });
    expect(result.ok === false && result.reason === 'invalid' && result.errors).toEqual(expect.arrayContaining(['gender', 'interests']));
  });

  it('refuses applications when registration is closed', async () => {
    expect(await submitApplication({ ...program, registrationOpen: false }, 'local', validForm('x@itba.edu.ar'))).toEqual({ ok: false, reason: 'closed' });
  });
});

describe('questionsFor', () => {
  it('shows shared questions plus role-specific ones', () => {
    const questions = [
      { ...defaultBuddyQuestions[0], audience: 'both' as const },
      { ...defaultBuddyQuestions[1], id: 'only_local', audience: 'local' as const },
    ];
    expect(questionsFor({ questions }, 'exchange').map((q) => q.id)).toEqual(['interests']);
    expect(questionsFor({ questions }, 'local').map((q) => q.id)).toEqual(['interests', 'only_local']);
  });
});
