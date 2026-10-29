import type { Answers, FormField } from '@/lib/forms/schema';

/**
 * Buddy matching.
 *
 * 1. compatibility(): a 0–1 score per (local, exchange) pair — a weighted
 *    average of per-question similarity, plus shared languages. Hard
 *    constraints (gender preference) make a pair impossible.
 * 2. assignBuddies(): picks the set of pairs with the highest total
 *    compatibility (Hungarian algorithm), respecting each local's capacity.
 *    Each extra student for the same local costs a small penalty, so load is
 *    spread before anyone gets a second buddy. Locked pairs are kept.
 */

export type Candidate = {
  id: string;
  gender: string;
  genderPreference: 'any' | 'same';
  languages: string[];
  /** Locals only: how many exchange students they can take. */
  capacity?: number;
  answers: Answers;
};

export type MatchQuestion = Pick<FormField, 'id' | 'type' | 'matchWeight' | 'scale'>;

export type QuestionBreakdown = { questionId: string; similarity: number; shared?: string[] };

export type Compatibility = {
  allowed: boolean;
  score: number;
  breakdown: QuestionBreakdown[];
  sharedLanguages: string[];
};

export const LANGUAGE_WEIGHT = 2;
/**
 * Cost added per extra student assigned to the same local (scores are 0–1).
 * 0.25 means a local only gets a second student before someone else gets a
 * first one when that match is >25 points better — locals who signed up
 * should rarely end up with nobody.
 */
export const DEFAULT_LOAD_PENALTY = 0.25;

const asArray = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : v == null ? [] : [String(v)]);

/** 0–1 similarity of two answers to one question, or null if either is missing. */
export function questionSimilarity(question: MatchQuestion, a: unknown, b: unknown): QuestionBreakdown | null {
  if (a == null || b == null || a === '' || b === '') return null;
  switch (question.type) {
    case 'multiselect': {
      const setA = new Set(asArray(a));
      const setB = new Set(asArray(b));
      if (setA.size === 0 || setB.size === 0) return null;
      const shared = [...setA].filter((x) => setB.has(x));
      const union = new Set([...setA, ...setB]).size;
      return { questionId: question.id, similarity: shared.length / union, shared };
    }
    case 'scale': {
      const min = question.scale?.min ?? 1;
      const max = question.scale?.max ?? 5;
      const diff = Math.abs(Number(a) - Number(b));
      if (!Number.isFinite(diff)) return null;
      return { questionId: question.id, similarity: 1 - diff / (max - min) };
    }
    case 'select':
      return { questionId: question.id, similarity: String(a) === String(b) ? 1 : 0, shared: String(a) === String(b) ? [String(a)] : [] };
    default:
      return null;
  }
}

function genderAllowed(a: Candidate, b: Candidate) {
  const wantsSame = a.genderPreference === 'same' || b.genderPreference === 'same';
  if (!wantsSame) return true;
  return a.gender === b.gender && a.gender !== 'na';
}

export function compatibility(local: Candidate, exchange: Candidate, questions: MatchQuestion[]): Compatibility {
  const sharedLanguages = local.languages.filter((l) => exchange.languages.includes(l));
  if (!genderAllowed(local, exchange)) {
    return { allowed: false, score: 0, breakdown: [], sharedLanguages };
  }

  let weighted = 0;
  let totalWeight = 0;
  const breakdown: QuestionBreakdown[] = [];

  for (const question of questions) {
    const weight = question.matchWeight ?? 0;
    if (weight <= 0) continue;
    const result = questionSimilarity(question, local.answers[question.id], exchange.answers[question.id]);
    if (!result) continue;
    breakdown.push(result);
    weighted += weight * result.similarity;
    totalWeight += weight;
  }

  if (local.languages.length && exchange.languages.length) {
    weighted += LANGUAGE_WEIGHT * (sharedLanguages.length > 0 ? 1 : 0);
    totalWeight += LANGUAGE_WEIGHT;
  }

  return {
    allowed: true,
    score: totalWeight > 0 ? weighted / totalWeight : 0,
    breakdown,
    sharedLanguages,
  };
}

/**
 * Minimum-cost assignment of every row to a distinct column (rows ≤ columns).
 * Classic O(n²·m) Hungarian algorithm with potentials. Returns column per row.
 */
export function hungarian(cost: number[][]): number[] {
  const n = cost.length;
  if (n === 0) return [];
  const m = cost[0].length;
  if (m < n) throw new Error('hungarian: needs at least as many columns as rows');

  const INF = Number.POSITIVE_INFINITY;
  const u = new Array<number>(n + 1).fill(0);
  const v = new Array<number>(m + 1).fill(0);
  const p = new Array<number>(m + 1).fill(0); // p[j] = row matched to column j (1-based)
  const way = new Array<number>(m + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array<number>(m + 1).fill(INF);
    const used = new Array<boolean>(m + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF;
      let j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }

  const result = new Array<number>(n).fill(-1);
  for (let j = 1; j <= m; j++) if (p[j] > 0) result[p[j] - 1] = j - 1;
  return result;
}

export type ProposedMatch = { localId: string; exchangeId: string; score: number; locked: boolean };

export type AssignmentResult = {
  matches: ProposedMatch[];
  /** Exchange students left without a buddy (no capacity or no allowed pair). */
  unassigned: string[];
};

export function assignBuddies(input: {
  locals: Candidate[];
  exchanges: Candidate[];
  questions: MatchQuestion[];
  locked?: { localId: string; exchangeId: string }[];
  loadPenalty?: number;
}): AssignmentResult {
  const { locals, exchanges, questions, locked = [], loadPenalty = DEFAULT_LOAD_PENALTY } = input;
  const localsById = new Map(locals.map((l) => [l.id, l]));
  const exchangesById = new Map(exchanges.map((e) => [e.id, e]));

  // Keep locked pairs (if both people still exist) and use up that capacity.
  const lockedMatches: ProposedMatch[] = [];
  const used = new Map<string, number>();
  const lockedExchanges = new Set<string>();
  for (const pair of locked) {
    const local = localsById.get(pair.localId);
    const exchange = exchangesById.get(pair.exchangeId);
    if (!local || !exchange || lockedExchanges.has(exchange.id)) continue;
    lockedExchanges.add(exchange.id);
    used.set(local.id, (used.get(local.id) ?? 0) + 1);
    lockedMatches.push({ localId: local.id, exchangeId: exchange.id, score: compatibility(local, exchange, questions).score, locked: true });
  }

  const rows = exchanges.filter((e) => !lockedExchanges.has(e.id));
  // One column per free slot; slot k of a local costs k × penalty extra.
  const slots: { local: Candidate; k: number }[] = [];
  for (const local of locals) {
    const start = used.get(local.id) ?? 0;
    const capacity = Math.max(local.capacity ?? 1, 0);
    for (let k = start; k < capacity; k++) slots.push({ local, k });
  }

  if (rows.length === 0) return { matches: lockedMatches, unassigned: [] };

  // Cost scale: allowed pairs ∈ [0, 1 + penalty·k]; "stay unassigned" is worse
  // than any allowed pair; impossible pairs are worse than staying unassigned.
  const UNASSIGNED = 10 + loadPenalty * Math.max(...locals.map((l) => l.capacity ?? 1), 1);
  const IMPOSSIBLE = 1e6;

  const compat = new Map<string, Compatibility>();
  const getCompat = (local: Candidate, exchange: Candidate) => {
    const key = `${local.id}|${exchange.id}`;
    let c = compat.get(key);
    if (!c) {
      c = compatibility(local, exchange, questions);
      compat.set(key, c);
    }
    return c;
  };

  const cost = rows.map((exchange) => [
    ...slots.map(({ local, k }) => {
      const c = getCompat(local, exchange);
      return c.allowed ? 1 - c.score + loadPenalty * k : IMPOSSIBLE;
    }),
    // One private "nobody" column per row, so every row can stay unassigned.
    ...rows.map(() => UNASSIGNED),
  ]);

  const assignment = hungarian(cost);
  const matches = [...lockedMatches];
  const unassigned: string[] = [];

  assignment.forEach((col, row) => {
    const exchange = rows[row];
    const slot = col >= 0 && col < slots.length ? slots[col] : null;
    if (!slot || cost[row][col] >= IMPOSSIBLE) {
      unassigned.push(exchange.id);
      return;
    }
    matches.push({ localId: slot.local.id, exchangeId: exchange.id, score: getCompat(slot.local, exchange).score, locked: false });
  });

  return { matches, unassigned };
}
