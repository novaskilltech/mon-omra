import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPilgrimProgram, getPilgrimBadgeData, createRoomAction, deleteRoomAction, toggleRoomBreakfastAction } from '../logistics';
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
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: vi.fn(() => Promise.resolve({ data: { signedUrl: 'https://supabase.signed.url/photo.jpg' }, error: null }))
      }))
    }
  };
  return {
    createClient: vi.fn(() => mockSupabase),
  };
});

vi.mock('../auth', () => ({
  isAdminAuthenticated: vi.fn(() => Promise.resolve(true)),
  getAuthUserId: vi.fn(() => Promise.resolve('mock-user-id'))
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

describe('getPilgrimProgram Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate empty guidedActivities by default with 14 days duration', async () => {
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
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimProgram('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('MAKKAH_FIRST');
    expect(result.duration).toBe(14);
    expect(result.days).toHaveLength(14);
    // Verify first day has no pre-populated guided activities
    const day1 = result.days[0];
    expect(day1.city).toBe('MAKKAH');
    expect(day1.guidedActivities).toHaveLength(0);
  });

  it('should load custom_planning when defined in group_logistics', async () => {
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
            ],
            error: null,
          }),
        };
      }
      if (table === 'group_logistics') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          // mock response for logistics list
          then: (resolve: any) => resolve({
            data: [{
              custom_planning: {
                '1': [{ time: '09:00', title: 'Visite guidée Uhud', location: 'Uhud', type: 'ZIYARAT', description: 'Visite guidée' }]
              }
            }],
            error: null
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimProgram('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.days[0].guidedActivities).toHaveLength(1);
    expect(result.days[0].guidedActivities[0].title).toBe('Visite guidée Uhud');
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
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimProgram('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('MADINAH_FIRST');
    const day1 = result.days[0];
    expect(day1.city).toBe('MADINAH');
    expect(day1.guidedActivities).toHaveLength(0);
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
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimProgram('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('TWO_OMRAS');
    const day10 = result.days[9];
    expect(day10.guidedActivities).toHaveLength(0);
  });
});

describe('getPilgrimBadgeData Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return complete badge data with signed photo URL', async () => {
    const mockSupabase = createClient();
    
    const selectMock = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { full_name: 'Ahmad Siddiq', phone: '+33678901234' },
            error: null,
          }),
        };
      }
      if (table === 'pilgrims') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { group_id: 'group-789' },
            error: null,
          }),
        };
      }
      if (table === 'groups') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { name: 'Ramadan Prestige', departure_date: '2026-03-25T12:00:00Z' },
            error: null,
          }),
        };
      }
      if (table === 'group_hotel_stays') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          eq2: vi.fn().mockResolvedValue({
            data: [
              { hotels: { name: 'Makkah Clock Royal', city: 'MAKKAH' } },
              { hotels: { name: 'Oberoi Madinah', city: 'MADINAH' } },
            ],
            error: null,
          }),
        };
      }
      if (table === 'user_documents') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { storage_path: 'user-123/passport-photo.jpg' },
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    mockSupabase.from = selectMock as any;

    const result = await getPilgrimBadgeData('pilgrim-123');

    expect(result.success).toBe(true);
    expect(result.badge.fullName).toBe('Ahmad Siddiq');
    expect(result.badge.phone).toBe('+33678901234');
    expect(result.badge.groupName).toBe('Ramadan Prestige');
    expect(result.badge.photoUrl).toBe('https://supabase.signed.url/photo.jpg');
  });
});

describe('Dynamic Room Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create room successfully', async () => {
    const mockSupabase = createClient();
    const insertMock = vi.fn().mockReturnThis();
    const selectMock = vi.fn().mockReturnThis();
    const singleMock = vi.fn().mockResolvedValue({
      data: { id: 'room-123', room_number: '101', type: 'DOUBLE', capacity: 2, has_breakfast: false },
      error: null
    });

    mockSupabase.from = vi.fn().mockReturnValue({
      insert: insertMock,
      select: selectMock,
      single: singleMock
    });

    const result = await createRoomAction('hotel-123', 'DOUBLE', '101', 2, false);

    expect(result.success).toBe(true);
    expect(result.room.room_number).toBe('101');
    expect(result.room.has_breakfast).toBe(false);
  });

  it('should toggle breakfast option successfully', async () => {
    const mockSupabase = createClient();
    const updateMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ error: null });

    mockSupabase.from = vi.fn().mockReturnValue({
      update: updateMock,
      eq: eqMock
    });

    const result = await toggleRoomBreakfastAction('room-123', true);

    expect(result.success).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({ has_breakfast: true });
  });
});


