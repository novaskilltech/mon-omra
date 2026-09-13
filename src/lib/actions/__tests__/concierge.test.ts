import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePilgrimAction, toggleGroupFeaturedAction, getFeaturedGroupAction } from '../concierge';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock Supabase Server Utils
vi.mock('@/utils/supabase/server', () => {
    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    return {
        createClient: vi.fn(() => mockSupabase),
        createAdminClient: vi.fn(() => mockSupabase),
    };
});

// Mock Auth Check
vi.mock('../auth', () => ({
    isAdminAuthenticated: vi.fn(() => Promise.resolve(true))
}));

// Mock Next.js Cache Revalidation
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

describe('updatePilgrimAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully update profile and pilgrim information', async () => {
        const mockSupabase = createClient();
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        mockSupabase.from = vi.fn().mockReturnValue({
            update: updateMock
        });

        const result = await updatePilgrimAction('pilgrim-123', {
            firstName: 'Ahmad',
            familyName: 'Siddiq',
            gender: 'M',
            email: 'ahmad@example.com',
            groupId: 'group-456'
        });

        expect(result).toEqual({ success: true });
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSupabase.from).toHaveBeenCalledWith('pilgrims');
        expect(revalidatePath).toHaveBeenCalledWith('/backoffice/concierge');
    });

    it('should handle empty email as null to prevent constraint violation', async () => {
        const mockSupabase = createClient();
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        mockSupabase.from = vi.fn().mockReturnValue({
            update: updateMock
        });

        const result = await updatePilgrimAction('pilgrim-123', {
            firstName: 'Fatima',
            familyName: 'Zahra',
            gender: 'F',
            email: '', // Empty email
            groupId: undefined
        });

        expect(result).toEqual({ success: true });
        // Email check
        expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
            email: null
        }));
    });
});

describe('toggleGroupFeaturedAction & getFeaturedGroupsAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should set group as featured without unsetting others', async () => {
        const mockSupabase = createAdminClient();
        const updateMock = vi.fn().mockReturnThis();
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        
        mockSupabase.from = vi.fn().mockReturnValue({
            update: updateMock,
            eq: eqMock
        });

        const result = await toggleGroupFeaturedAction('group-123', true);

        expect(result).toEqual({ success: true, isFeatured: true });
        expect(mockSupabase.from).toHaveBeenCalledWith('groups');
        expect(revalidatePath).toHaveBeenCalledWith('/');
        expect(revalidatePath).toHaveBeenCalledWith('/backoffice/groups');
    });

    it('should unset featured status for a group', async () => {
        const mockSupabase = createAdminClient();
        const updateMock = vi.fn().mockReturnThis();
        const eqMock = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from = vi.fn().mockReturnValue({
            update: updateMock,
            eq: eqMock
        });

        const result = await toggleGroupFeaturedAction('group-123', false);

        expect(result).toEqual({ success: true, isFeatured: false });
        expect(mockSupabase.from).toHaveBeenCalledWith('groups');
    });

    it('should fetch featured groups for the carousel', async () => {
        const mockSupabase = createClient();
        const selectMock = vi.fn().mockReturnThis();
        const eqMock = vi.fn().mockReturnThis();
        const inMock = vi.fn().mockReturnThis();
        const orderMock = vi.fn().mockResolvedValue({
            data: [
                { id: 'grp-1', name: 'OMRA PARIS', is_featured: true, departure_date: '2026-05-01' },
                { id: 'grp-2', name: 'OMRA LYON', is_featured: true, departure_date: '2026-05-15' }
            ],
            error: null
        });

        mockSupabase.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'groups') {
                return {
                    select: selectMock,
                    eq: eqMock,
                    in: inMock,
                    order: orderMock
                };
            }
            if (table === 'group_hotel_stays') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({ data: [], error: null })
                };
            }
            return mockSupabase;
        });

        const { getFeaturedGroupsAction } = await import('../concierge');
        const res = await getFeaturedGroupsAction();

        expect(res.success).toBe(true);
        expect(res.groups).toBeDefined();
        expect(res.groups?.length).toBe(2);
    });

    it('should fetch groups sorted chronologically by departure_date', async () => {
        const mockSupabase = createClient();
        const selectMock = vi.fn().mockReturnThis();
        const orderSecondaryMock = vi.fn().mockResolvedValue({
            data: [
                { id: 'g1', name: 'OMRA LYON', departure_date: '2026-05-01', status: 'En préparation' },
                { id: 'g2', name: 'OMRA PARIS', departure_date: '2026-06-01', status: 'En préparation' }
            ],
            error: null
        });
        const orderMock = vi.fn().mockReturnValue({
            order: orderSecondaryMock
        });

        mockSupabase.from = vi.fn().mockReturnValue({
            select: selectMock.mockReturnValue({
                order: orderMock
            })
        });

        const { getGroups } = await import('../concierge');
        const res = await getGroups();

        expect(mockSupabase.from).toHaveBeenCalledWith('groups');
        expect(selectMock).toHaveBeenCalledWith('id, name, departure_date, status');
        expect(orderMock).toHaveBeenCalledWith('departure_date', { ascending: true });
        expect(orderSecondaryMock).toHaveBeenCalledWith('name', { ascending: true });
        expect(res.length).toBe(2);
        expect(res[0].name).toBe('OMRA LYON');
    });
});

