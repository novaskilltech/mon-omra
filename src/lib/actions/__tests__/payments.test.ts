import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    updatePayment, deletePayment, 
    submitPilgrimPaymentProofAction, 
    getPendingPaymentsAction, 
    approvePaymentAction, 
    rejectPaymentAction, 
    getPaymentProofSignedUrlAction,
    getPilgrimPaymentSummary 
} from '../concierge';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '../auth';

// Mock Supabase Server Utils
vi.mock('@/utils/supabase/server', () => {
    const mockStorage = {
        from: vi.fn(() => ({
            upload: vi.fn().mockResolvedValue({ error: null }),
            createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://storage.supabase.co/signed/proof.pdf' }, error: null })
        }))
    };

    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        storage: mockStorage,
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } } })
        }
    };

    return {
        createClient: vi.fn(() => mockSupabase),
        createAdminClient: vi.fn(() => mockSupabase)
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

// Mock Next.js Cookies
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        get: vi.fn((name: string) => name === 'pilgrim_id' ? { value: 'pilgrim-123' } : undefined)
    }))
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

describe('submitPilgrimPaymentProofAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return error if amount is invalid or zero', async () => {
        const formData = new FormData();
        formData.append('amount', '0');
        formData.append('method', 'TRANSFER');
        
        const result = await submitPilgrimPaymentProofAction(formData);
        expect(result.error).toMatch(/montant valide supérieur à 0 €/i);
    });

    it('should return error if file is missing', async () => {
        const formData = new FormData();
        formData.append('amount', '500');
        formData.append('method', 'TRANSFER');
        
        const result = await submitPilgrimPaymentProofAction(formData);
        expect(result.error).toMatch(/preuve de paiement/i);
    });

    it('should return error if file type is unsupported', async () => {
        const formData = new FormData();
        formData.append('amount', '500');
        formData.append('method', 'TRANSFER');
        const file = new File(['fake content'], 'test.exe', { type: 'application/x-msdownload' });
        formData.append('file', file);
        
        const result = await submitPilgrimPaymentProofAction(formData);
        expect(result.error).toMatch(/Format de fichier non supporté/i);
    });

    it('should successfully submit payment with proof and notify agency', async () => {
        const mockSupabase = createAdminClient();
        
        // Mock storage upload
        const uploadMock = vi.fn().mockResolvedValue({ error: null });
        mockSupabase.storage.from = vi.fn().mockReturnValue({
            upload: uploadMock
        });

        // Mock admin profile lookup
        const singleAdminMock = vi.fn().mockResolvedValue({ data: { id: 'admin-123' }, error: null });
        
        // Mock payment insert
        const singlePaymentMock = vi.fn().mockResolvedValue({ data: { id: 'pay-new-123' }, error: null });
        const selectPaymentMock = vi.fn().mockReturnValue({ single: singlePaymentMock });
        const insertPaymentMock = vi.fn().mockReturnValue({ select: selectPaymentMock });

        // Mock notification insert
        const insertNotifMock = vi.fn().mockResolvedValue({ error: null });

        mockSupabase.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: 'Test Pilgrim' } }),
                    single: singleAdminMock
                };
            }
            if (table === 'payments') {
                return {
                    insert: insertPaymentMock
                };
            }
            if (table === 'notifications') {
                return {
                    insert: insertNotifMock
                };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null })
            };
        });

        const formData = new FormData();
        formData.append('amount', '750');
        formData.append('method', 'TRANSFER');
        formData.append('reference', 'VIR-TEST-750');
        const file = new File(['dummy receipt content'], 'receipt.pdf', { type: 'application/pdf' });
        file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));
        formData.append('file', file);

        const result = await submitPilgrimPaymentProofAction(formData);

        expect(result.success).toBe(true);
        expect(result.paymentId).toBe('pay-new-123');
        expect(uploadMock).toHaveBeenCalled();
        expect(insertPaymentMock).toHaveBeenCalledWith(expect.objectContaining({
            amount: 750,
            method: 'TRANSFER',
            status: 'PENDING',
            reference: 'VIR-TEST-750'
        }));
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
        expect(revalidatePath).toHaveBeenCalledWith('/backoffice/concierge');
    });
});

describe('Agency Payment Validation Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('approvePaymentAction should transition payment status to COMPLETED', async () => {
        const mockSupabase = createAdminClient();

        const paymentMock = {
            id: 'pay-123',
            amount: 1000,
            pilgrim_id: 'pilgrim-abc',
            agency_id: 'agency-xyz',
            status: 'PENDING'
        };

        const eqUpdateMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock });

        mockSupabase.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'payments') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn((col, val) => {
                        if (col === 'id') {
                            return { single: vi.fn().mockResolvedValue({ data: paymentMock, error: null }) };
                        }
                        return { single: vi.fn().mockResolvedValue({ data: null, error: null }) };
                    }),
                    update: updateMock
                };
            }
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'admin-id' } })
                };
            }
            if (table === 'notifications') {
                return {
                    insert: vi.fn().mockResolvedValue({ error: null })
                };
            }
            return {};
        });

        const result = await approvePaymentAction('pay-123');

        expect(result).toEqual({ success: true });
        expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
            status: 'COMPLETED'
        }));
        expect(revalidatePath).toHaveBeenCalledWith('/backoffice/concierge');
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('rejectPaymentAction should require a reason and set status to FAILED', async () => {
        // Missing reason
        const resultNoReason = await rejectPaymentAction('pay-123', '');
        expect(resultNoReason.error).toMatch(/motif de refus/i);

        const mockSupabase = createAdminClient();
        const paymentMock = {
            id: 'pay-123',
            amount: 1000,
            pilgrim_id: 'pilgrim-abc',
            status: 'PENDING'
        };

        const eqUpdateMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock });

        mockSupabase.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'payments') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: paymentMock, error: null }) }),
                    update: updateMock
                };
            }
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'admin-id' } })
                };
            }
            if (table === 'notifications') {
                return {
                    insert: vi.fn().mockResolvedValue({ error: null })
                };
            }
            return {};
        });

        const result = await rejectPaymentAction('pay-123', 'Virement non reçu sur le compte bancaire');

        expect(result).toEqual({ success: true });
        expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({
            status: 'FAILED',
            admin_notes: 'Virement non reçu sur le compte bancaire'
        }));
        expect(revalidatePath).toHaveBeenCalledWith('/backoffice/concierge');
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('getPendingPaymentsAction should return pending payments list for admin', async () => {
        const mockSupabase = createAdminClient();

        const pendingList = [
            { id: 'p1', amount: 500, status: 'PENDING', pilgrim_id: 'pilg-1', created_at: new Date().toISOString() }
        ];

        mockSupabase.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'payments') {
                return {
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    order: vi.fn().mockResolvedValue({ data: pendingList, error: null })
                };
            }
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({ data: [{ id: 'pilg-1', full_name: 'Omar Farooq', email: 'omar@example.com' }], error: null })
                };
            }
            if (table === 'pilgrims') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockResolvedValue({ data: [{ id: 'pilg-1', group_id: 'grp-1', groups: { name: 'Groupe A' } }], error: null })
                };
            }
            return {};
        });

        const res = await getPendingPaymentsAction();

        expect(res.success).toBe(true);
        expect(res.data).toHaveLength(1);
        expect(res.data[0].pilgrim_name).toBe('Omar Farooq');
        expect(res.data[0].group_name).toBe('Groupe A');
    });

    it('getPaymentProofSignedUrlAction should return signed url', async () => {
        const mockSupabase = createAdminClient();
        mockSupabase.storage.from = vi.fn().mockReturnValue({
            createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.example.com/receipt.pdf' }, error: null })
        });

        const res = await getPaymentProofSignedUrlAction('payment-proofs/pilgrim-123/receipt.pdf');

        expect(res.success).toBe(true);
        expect(res.signedUrl).toBe('https://signed.example.com/receipt.pdf');
    });
});
