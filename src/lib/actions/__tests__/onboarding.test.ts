import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    verifyOnboardingPasscodeAction, 
    submitPilgrimSelfOnboardingAction,
    getAvailableAirportsAction
} from '../onboarding';
import { PilgrimSelfOnboardingSchema } from '@/types/onboarding';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { cookies, headers } from 'next/headers';

// Mock Supabase Server Utils
vi.mock('@/utils/supabase/server', () => {
    const mockSupabase: any = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ error: null }),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { onboarding_passcode: 'TEST-SECRET-123' }, error: null }),
        auth: {
            admin: {
                createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-uuid' } }, error: null }),
                listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null })
            }
        }
    };
    return {
        createClient: vi.fn(() => mockSupabase),
        createAdminClient: vi.fn(() => mockSupabase),
    };
});

// Mock next/headers
const mockCookieSet = vi.fn();
const mockCookieGet = vi.fn();
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        set: mockCookieSet,
        get: mockCookieGet
    })),
    headers: vi.fn(() => ({
        get: vi.fn((name: string) => (name === 'x-real-ip' ? '127.0.0.1' : null))
    }))
}));

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

// Mock auth
vi.mock('../auth', () => ({
    isAdminAuthenticated: vi.fn(() => Promise.resolve(true))
}));

describe('PilgrimSelfOnboardingSchema Validation', () => {
    it('should validate valid onboarding input', () => {
        const input = {
            passcode: 'TEST-SECRET-123',
            gender: 'M',
            familyName: 'El Amrani',
            firstName: 'Karim',
            invoiceNumber: 'FAC-2026-089',
            email: 'karim@example.com',
            phone: '0612345678',
            address: '12 rue de la Paix',
            postalCode: '75001',
            city: 'Paris',
            departureAirport: 'PARIS',
            travelDates: 'Du 10 au 24 Mars 2026',
            requestedRoomType: 'DOUBLE'
        };

        const result = PilgrimSelfOnboardingSchema.safeParse(input);
        expect(result.success).toBe(true);
    });

    it('should reject when invoiceNumber is missing', () => {
        const input = {
            passcode: 'TEST-SECRET-123',
            gender: 'F',
            familyName: 'Benali',
            firstName: 'Fatima',
            invoiceNumber: '',
            email: 'fatima@example.com',
            phone: '0612345678',
            address: '12 rue de la Paix',
            postalCode: '69001',
            city: 'Lyon',
            departureAirport: 'LYON',
            travelDates: 'Avril 2026'
        };

        const result = PilgrimSelfOnboardingSchema.safeParse(input);
        expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
        const input = {
            passcode: 'TEST-SECRET-123',
            gender: 'M',
            familyName: 'Dupont',
            firstName: 'Jean',
            invoiceNumber: 'FAC-001',
            email: 'not-an-email',
            phone: '0612345678',
            address: '1 rue test',
            postalCode: '13001',
            city: 'Marseille',
            departureAirport: 'MARSEILLE',
            travelDates: 'Mai 2026'
        };

        const result = PilgrimSelfOnboardingSchema.safeParse(input);
        expect(result.success).toBe(false);
    });
});

describe('verifyOnboardingPasscodeAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should succeed and set cookie when passcode matches', async () => {
        const res = await verifyOnboardingPasscodeAction('TEST-SECRET-123');
        expect(res).toEqual({ success: true });
        expect(mockCookieSet).toHaveBeenCalledWith(
            'omra_onboarding_unlocked',
            'true',
            expect.objectContaining({ httpOnly: true })
        );
    });

    it('should fail with appropriate error message when passcode is wrong', async () => {
        const res = await verifyOnboardingPasscodeAction('WRONG-PASSCODE');
        expect(res.error).toBeDefined();
        expect(res.error).toContain("Mot de passe d'accès incorrect");
    });
});

describe('submitPilgrimSelfOnboardingAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should refuse submission if passcode does not match', async () => {
        const res = await submitPilgrimSelfOnboardingAction({
            passcode: 'INVALID-CODE',
            gender: 'M',
            familyName: 'Test',
            firstName: 'User',
            invoiceNumber: 'INV-123',
            email: 'test@example.com',
            phone: '0600000000',
            address: '10 avenue Victor Hugo',
            postalCode: '75016',
            city: 'Paris',
            departureAirport: 'PARIS',
            travelDates: '15-30 Avril 2026'
        });

        expect(res.error).toBeDefined();
        expect(res.error).toContain("Accès refusé");
    });

    it('should successfully onboard pilgrim and return invoice confirmation', async () => {
        const res = await submitPilgrimSelfOnboardingAction({
            passcode: 'TEST-SECRET-123',
            gender: 'M',
            familyName: 'El Amrani',
            firstName: 'Karim',
            invoiceNumber: 'FAC-2026-999',
            email: 'karim.elamrani@example.com',
            phone: '0612345678',
            address: '12 rue de la République',
            postalCode: '69002',
            city: 'Lyon',
            departureAirport: 'LYON',
            travelDates: '10 au 25 Novembre 2026'
        });

        expect(res.success).toBe(true);
        expect(res.invoiceNumber).toBe('FAC-2026-999');
        expect(res.fullName).toBe('Karim El Amrani');
        expect(res.pilgrimId).toBe('test-user-uuid');
    });
});

describe('getAvailableAirportsAction', () => {
    it('should return list of unique airports', async () => {
        const airports = await getAvailableAirportsAction();
        expect(Array.isArray(airports)).toBe(true);
        expect(airports).toContain('PARIS');
        expect(airports).toContain('LYON');
        expect(airports).toContain('MARSEILLE');
    });
});
