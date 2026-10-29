import { describe, expect, it } from 'vitest';
import { availabilityOf } from './badges';

const base = { registrationType: 'form' as const, registrationOpen: true, spotsLeft: 50, capacity: 100 };

describe('availabilityOf', () => {
  it('ignores events without a web form', () => {
    expect(availabilityOf({ ...base, registrationType: 'whatsapp' })).toBeNull();
  });
  it('reports open, last spots, full and closed', () => {
    expect(availabilityOf(base)?.state).toBe('open');
    expect(availabilityOf({ ...base, spotsLeft: 20 })).toEqual({ state: 'lastSpots', count: 20 });
    expect(availabilityOf({ ...base, capacity: 10, spotsLeft: 5 })).toEqual({ state: 'lastSpots', count: 5 });
    expect(availabilityOf({ ...base, spotsLeft: 0 })?.state).toBe('full');
    expect(availabilityOf({ ...base, registrationOpen: false })?.state).toBe('closed');
    expect(availabilityOf({ ...base, capacity: null, spotsLeft: null })?.state).toBe('open');
  });
});
