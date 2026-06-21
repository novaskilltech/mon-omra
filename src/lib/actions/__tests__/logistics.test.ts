import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPilgrimProgram } from '../logistics';
import { createClient } from '@/utils/supabase/server';

vi.mock('@/utils/supabase/server', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
  return {
    createClient: vi.fn(() => mockSupabase),
  };
});

describe('getPilgrimProgram Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate Makkah First program by default with 14 days duration', async () => {
    const mockSupabase = createClient();
    
    // Mock profiles select
    const selectMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'pilgrim-123', full_name: 'Salah Lamkhannet' },
            error: null,
          }),
        };
      }
      if (table === 'pilgrims') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { group_id: 'group-123', individual_flight_info: null, individual_hotel_info: null },
            error: null,
          }),
        };
      }
      if (table === 'groups') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { name: 'Ramadan Classic', departure_date: '2026-03-25T12:00:00Z' },
            error: null,
          }),
        };
      }
      if (table === 'group_hotel_stays') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { hotels: { city: 'MAKKAH' } },
              { hotels: { city: 'MADINAH' } },
            ],
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimProgram('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('MAKKAH_FIRST');
    expect(result.duration).toBe(14);
    expect(result.days).toHaveLength(14);
    // Verify first day has guided activities for Makkah first (arrival/OMRA)
    const day1 = result.days[0];
    expect(day1.city).toBe('MAKKAH');
    expect(day1.guidedActivities[0].title).toContain('Arrivée');
    expect(day1.guidedActivities[2].title).toContain('Omra');
  });

  it('should detect MADINAH_FIRST when the first hotel is in Madinah', async () => {
    const mockSupabase = createClient();
    
    const selectMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'pilgrim-123', full_name: 'Salah Lamkhannet' },
            error: null,
          }),
        };
      }
      if (table === 'pilgrims') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { group_id: 'group-123', individual_flight_info: null },
            error: null,
          }),
        };
      }
      if (table === 'groups') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { name: 'Ramadan Madinah First', departure_date: '2026-03-25T12:00:00Z' },
            error: null,
          }),
        };
      }
      if (table === 'group_hotel_stays') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { hotels: { city: 'MADINAH' } },
              { hotels: { city: 'MAKKAH' } },
            ],
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimProgram('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('MADINAH_FIRST');
    const day1 = result.days[0];
    expect(day1.city).toBe('MADINAH');
    expect(day1.guidedActivities[0].title).toContain('Arrivée à Médine');
  });

  it('should detect TWO_OMRAS when name matches double/two/deux or has 3 city hops', async () => {
    const mockSupabase = createClient();
    
    const selectMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'pilgrim-123', full_name: 'Salah Lamkhannet' },
            error: null,
          }),
        };
      }
      if (table === 'pilgrims') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { group_id: 'group-123', individual_flight_info: null },
            error: null,
          }),
        };
      }
      if (table === 'groups') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { name: 'Double Omra 2026', departure_date: '2026-03-25T12:00:00Z' },
            error: null,
          }),
        };
      }
      if (table === 'group_hotel_stays') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              { hotels: { city: 'MAKKAH' } },
              { hotels: { city: 'MADINAH' } },
              { hotels: { city: 'MAKKAH' } },
            ],
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimProgram('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('TWO_OMRAS');
    // Day 10 is second Omra transition
    const day10 = result.days[9];
    expect(day10.guidedActivities[0].title).toContain('Retour à Makkah');
    expect(day10.guidedActivities[2].title).toContain('Deuxième Omra');
  });
});
