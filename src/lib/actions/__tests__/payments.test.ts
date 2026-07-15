import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePayment, deletePayment } from '../concierge';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock Supabase Server Utils
vi.mock('@/utils/supabase/server', () => {
    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
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

describe('Payment modification actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully update a payment', async () => {
        const mockSupabase = createClient();
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        mockSupabase.from = vi.fn().mockReturnValue({
            update: updateMock
        });

        const result = await updatePayment('payment-123', 450, 'CASH', 'REF-450');

        expect(result).toEqual({ success: true });
        expect(mockSupabase.from).toHaveBeenCalledWith('payments');
        expect(updateMock).toHaveBeenCalledWith({
            amount: 450,
            method: 'CASH',
            reference: 'REF-450'
        });
        expect(revalidatePath).toHaveBeenCalledWith('/backoffice/concierge');
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('should successfully delete a payment', async () => {
        const mockSupabase = createClient();
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const deleteMock = vi.fn().mockReturnValue({ eq: eqMock });
        
        mockSupabase.from = vi.fn().mockReturnValue({
            delete: deleteMock
        });

        const result = await deletePayment('payment-123');

        expect(result).toEqual({ success: true });
        expect(mockSupabase.from).toHaveBeenCalledWith('payments');
        expect(deleteMock).toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalledWith('/backoffice/concierge');
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
});
