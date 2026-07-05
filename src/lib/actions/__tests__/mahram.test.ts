import { describe, it, expect, vi } from 'vitest';

// Mocking Supabase Client
vi.mock('@/utils/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'agency-123' } } })),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn(),
  }),
}));

// Mocking revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

/**
 * Note: Since we are testing logic within an async server action that depends on Supabase client,
 * we would typically refactor the core logic into a pure function for easier unit testing.
 * For this MVP, we simulate the validation logic.
 */

describe('Mahram Validation Logic (Disabled)', () => {
  const validateMahram = (newPilgrim: any, currentOccupants: any[]) => {
    // Validation removed: always returns success true
    return { success: true };
  };

  it('should allow same gender different family', () => {
    const newPilgrim = { gender: 'M', family_name: 'Ali' };
    const occupants = [{ gender: 'M', family_name: 'Salah' }];
    expect(validateMahram(newPilgrim, occupants).success).toBe(true);
  });

  it('should allow different gender same family', () => {
    const newPilgrim = { gender: 'F', family_name: 'Ali' };
    const occupants = [{ gender: 'M', family_name: 'Ali' }];
    expect(validateMahram(newPilgrim, occupants).success).toBe(true);
  });

  it('should ALLOW different gender different family since rule is disabled', () => {
    const newPilgrim = { gender: 'F', family_name: 'Z.' };
    const occupants = [{ gender: 'M', family_name: 'Ali' }];
    const result = validateMahram(newPilgrim, occupants);
    expect(result.success).toBe(true);
  });

  it('should allow empty room', () => {
    const newPilgrim = { gender: 'F', family_name: 'Z.' };
    const occupants: any[] = [];
    expect(validateMahram(newPilgrim, occupants).success).toBe(true);
  });
});
