import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHajjRequestAction, getHajjRequestsAction, updateHajjRequestStatusAction, deleteHajjRequestAction } from '../hajj';
import { createClient } from '@/utils/supabase/server';

vi.mock('@/utils/supabase/server', () => {
    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [{ id: 'hajj-1', first_name: 'Omar' }], error: null }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
    };
    return {
        createClient: vi.fn(() => mockSupabase)
    };
});

vi.mock('../auth', () => ({
    isAdminAuthenticated: vi.fn(() => Promise.resolve(true))
}));

describe('Hajj Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a hajj request successfully', async () => {
        const result = await createHajjRequestAction({
            firstName: 'Youssef',
            familyName: 'Bennani',
            nationality: 'Marocaine',
            phone: '+33612345678',
            email: 'youssef@example.com',
            address: '10 Rue de Paris, 75001 Paris',
            peopleCount: 2,
            hajjYear: 2027
        });

        expect(result).toEqual({ success: true });
    });

    it('should reject submission with missing required fields', async () => {
        const result = await createHajjRequestAction({
            firstName: '',
            familyName: 'Bennani',
            nationality: 'Marocaine',
            phone: '+33612345678',
            email: 'youssef@example.com',
            address: '10 Rue de Paris',
            peopleCount: 2,
            hajjYear: 2027
        });

        expect(result.error).toBeDefined();
    });

    it('should fetch hajj requests for admin', async () => {
        const result = await getHajjRequestsAction();
        expect(result.success).toBe(true);
        expect(result.requests).toBeDefined();
        expect(result.requests?.length).toBe(1);
    });

    it('should update hajj request status', async () => {
        const result = await updateHajjRequestStatusAction('hajj-1', 'CONTACTED');
        expect(result).toEqual({ success: true });
    });

    it('should delete a hajj request', async () => {
        const result = await deleteHajjRequestAction('hajj-1');
        expect(result).toEqual({ success: true });
    });
});
