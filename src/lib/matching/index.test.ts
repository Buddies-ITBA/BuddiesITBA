import { describe, expect, it } from 'vitest';
import { assignBuddies, compatibility, hungarian, questionSimilarity, type Candidate, type MatchQuestion } from './index';

const questions: MatchQuestion[] = [
  { id: 'interests', type: 'multiselect', matchWeight: 5 },
  { id: 'social', type: 'scale', matchWeight: 3, scale: { min: 1, max: 5 } },
  { id: 'availability', type: 'select', matchWeight: 2 },
];

const person = (id: string, answers: Candidate['answers'], extra: Partial<Candidate> = {}): Candidate => ({
  id,
  gender: 'female',
  genderPreference: 'any',
  languages: ['es', 'en'],
  answers,
  ...extra,
});

describe('questionSimilarity', () => {
  it('uses Jaccard for multiselect and reports shared options', () => {
    const r = questionSimilarity(questions[0], ['music', 'food', 'sports'], ['music', 'food', 'art']);
    expect(r?.similarity).toBeCloseTo(2 / 4);
    expect(r?.shared).toEqual(['music', 'food']);
  });

  it('uses distance over range for scales', () => {
    expect(questionSimilarity(questions[1], 1, 5)?.similarity).toBe(0);
    expect(questionSimilarity(questions[1], 4, 5)?.similarity).toBeCloseTo(0.75);
  });

  it('skips unanswered questions', () => {
    expect(questionSimilarity(questions[1], undefined, 3)).toBeNull();
  });
});

describe('compatibility', () => {
  it('is 1 for identical answers and shared language', () => {
    const answers = { interests: ['music'], social: 3, availability: 'high' };
    expect(compatibility(person('l', answers), person('e', answers), questions).score).toBeCloseTo(1);
  });

  it('ignores questions with weight 0', () => {
    const c = compatibility(
      person('l', { about: 'x' }),
      person('e', { about: 'y' }),
      [{ id: 'about', type: 'select', matchWeight: 0 }]
    );
    expect(c.breakdown).toEqual([]);
  });

  it('blocks pairs that break a "same gender" preference', () => {
    const local = person('l', {}, { gender: 'male' });
    const exchange = person('e', {}, { gender: 'female', genderPreference: 'same' });
    expect(compatibility(local, exchange, questions).allowed).toBe(false);
  });

  it('penalizes having no language in common', () => {
    const answers = { interests: ['music'] };
    const withLanguage = compatibility(person('l', answers), person('e', answers), questions).score;
    const without = compatibility(person('l', answers, { languages: ['es'] }), person('e', answers, { languages: ['de'] }), questions).score;
    expect(without).toBeLessThan(withLanguage);
  });
});

describe('hungarian', () => {
  it('finds the minimum-cost assignment', () => {
    const cost = [
      [4, 1, 3],
      [2, 0, 5],
      [3, 2, 2],
    ];
    const result = hungarian(cost);
    const total = result.reduce((sum, col, row) => sum + cost[row][col], 0);
    expect(total).toBe(5); // 1 + 2 + 2
    expect(new Set(result).size).toBe(3);
  });
});

describe('assignBuddies', () => {
  const musicFan = { interests: ['music', 'nightlife'], social: 5, availability: 'high' };
  const bookworm = { interests: ['reading', 'culture'], social: 1, availability: 'low' };

  it('pairs people with similar answers', () => {
    const result = assignBuddies({
      locals: [person('L-music', musicFan), person('L-books', bookworm)],
      exchanges: [person('E-books', bookworm), person('E-music', musicFan)],
      questions,
    });
    const byExchange = Object.fromEntries(result.matches.map((m) => [m.exchangeId, m.localId]));
    expect(byExchange).toEqual({ 'E-books': 'L-books', 'E-music': 'L-music' });
    expect(result.unassigned).toEqual([]);
  });

  it('respects capacity and reports who is left without a buddy', () => {
    const result = assignBuddies({
      locals: [person('L1', musicFan, { capacity: 1 })],
      exchanges: [person('E1', musicFan), person('E2', musicFan)],
      questions,
    });
    expect(result.matches).toHaveLength(1);
    expect(result.unassigned).toHaveLength(1);
  });

  it('spreads load before giving anyone a second student', () => {
    const almost = { ...musicFan, availability: 'medium' };
    const result = assignBuddies({
      locals: [person('Best', musicFan, { capacity: 2 }), person('Good', almost, { capacity: 2 })],
      exchanges: [person('E1', musicFan), person('E2', musicFan)],
      questions,
    });
    const load = result.matches.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.localId]: (acc[m.localId] ?? 0) + 1 }), {});
    expect(load).toEqual({ Best: 1, Good: 1 });
  });

  it('still doubles up when the alternative is a much worse match', () => {
    const result = assignBuddies({
      locals: [person('Best', musicFan, { capacity: 2 }), person('Opposite', bookworm, { capacity: 2 })],
      exchanges: [person('E1', musicFan), person('E2', musicFan)],
      questions,
    });
    expect(result.matches.every((m) => m.localId === 'Best')).toBe(true);
  });

  it('never creates impossible pairs, even if it leaves someone unassigned', () => {
    const result = assignBuddies({
      locals: [person('L', musicFan, { gender: 'male' })],
      exchanges: [person('E', musicFan, { gender: 'female', genderPreference: 'same' })],
      questions,
    });
    expect(result.matches).toEqual([]);
    expect(result.unassigned).toEqual(['E']);
  });

  it('keeps locked pairs and uses up their capacity', () => {
    const result = assignBuddies({
      locals: [person('L-music', musicFan, { capacity: 1 }), person('L-books', bookworm, { capacity: 1 })],
      exchanges: [person('E-music', musicFan), person('E-books', bookworm)],
      questions,
      locked: [{ localId: 'L-books', exchangeId: 'E-music' }],
    });
    expect(result.matches).toContainEqual(expect.objectContaining({ localId: 'L-books', exchangeId: 'E-music', locked: true }));
    expect(result.matches).toContainEqual(expect.objectContaining({ localId: 'L-music', exchangeId: 'E-books', locked: false }));
  });

  it('handles a realistic cohort quickly', () => {
    const rand = (() => {
      let s = 1;
      return () => ((s = (s * 16807) % 2147483647) / 2147483647);
    })();
    const make = (prefix: string, n: number, capacity?: number) =>
      Array.from({ length: n }, (_, i) =>
        person(`${prefix}${i}`, { interests: ['music', 'food', 'sports', 'art'].filter(() => rand() > 0.5), social: 1 + Math.floor(rand() * 5) }, { capacity })
      );
    const start = performance.now();
    const result = assignBuddies({ locals: make('L', 80, 2), exchanges: make('E', 150), questions });
    expect(performance.now() - start).toBeLessThan(3000);
    expect(result.matches.length + result.unassigned.length).toBe(150);
  });
});
