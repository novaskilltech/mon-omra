import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePilgrimAction } from '../concierge';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock Supabase Server Utils
vi.mock('@/utils/supabase/server', () => {
    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
    };
    return {
        createClient: vi.fn(() => mockSupabase)
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
