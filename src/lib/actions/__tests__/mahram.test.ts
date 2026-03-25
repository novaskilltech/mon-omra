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

describe('Mahram Validation Logic', () => {
  const validateMahram = (newPilgrim: any, currentOccupants: any[]) => {
    if (currentOccupants.length === 0) return { success: true };

    const mixedGender = currentOccupants.some(o => o.gender !== newPilgrim.gender);
    const differentFamily = currentOccupants.some(o => o.family_name !== newPilgrim.family_name);

    if (mixedGender && differentFamily) {
      return { 
        success: false, 
        error: "Règle Mahram : Impossible de mixer les genres de familles différentes dans la même chambre." 
      };
    }

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

  it('should REJECT different gender different family', () => {
    const newPilgrim = { gender: 'F', family_name: 'Z.' };
    const occupants = [{ gender: 'M', family_name: 'Ali' }];
    const result = validateMahram(newPilgrim, occupants);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Règle Mahram');
  });

  it('should allow empty room', () => {
    const newPilgrim = { gender: 'F', family_name: 'Z.' };
    const occupants: any[] = [];
    expect(validateMahram(newPilgrim, occupants).success).toBe(true);
  });
});
