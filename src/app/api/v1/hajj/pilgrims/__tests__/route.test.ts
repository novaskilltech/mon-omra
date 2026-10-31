import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

const mockPilgrims = [
    {
        id: 'hajj-001',
        first_name: 'Amine',
        family_name: 'Idrissi',
        nationality: 'Française',
        phone: '0612345678',
        email: 'amine@example.com',
        address: '25 Rue de Rivoli, 75001 Paris',
        people_count: 2,
        hajj_year: 2027,
        has_nusuk_account: 'OUI',
        nusuk_account_year: '2026_2027',
        nusuk_account_status: 'VERIFIE',
        availability_slots: 'Soirée',
        status: 'CONFIRMED',
        admin_notes: '[Provider: Yusr Al Mashaer] [Paiement: PAYE (390.00 €) le 2026-10-31] [Conseiller: Conseiller 1] Dossier prioritaire',
        created_at: '2026-10-30T10:15:30.000Z'
    }
];

// Mock Supabase admin client
vi.mock('@/utils/supabase/server', () => ({
    createAdminClient: () => {
        let currentLimit = 100;
        return {
            from: (table: string) => ({
                select: () => ({
                    order: () => ({
                        limit: (lim: number) => {
                            currentLimit = lim;
                            return {
                                eq: vi.fn().mockImplementation(() => Promise.resolve({ data: mockPilgrims, error: null })),
                                gt: vi.fn().mockImplementation(() => Promise.resolve({ data: mockPilgrims, error: null })),
                                then: (resolve: any) => Promise.resolve({ data: mockPilgrims, error: null }).then(resolve)
                            };
                        }
                    })
                }),
                insert: (payload: any) => ({
                    select: () => ({
                        single: () => Promise.resolve({
                            data: {
                                id: 'new-uuid-1234',
                                ...payload,
                                created_at: '2026-10-31T10:10:00.000Z'
                            },
                            error: null
                        })
                    })
                })
            })
        };
    }
}));

describe('GET /api/v1/hajj/pilgrims Route Tests', () => {
    const validKey = 'hajj_live_test_api_key_sync_9999999999';

    beforeEach(() => {
        process.env.HAJJ_SYNC_API_KEY = validKey;
    });

    it('rejects with 401 if no Authorization header or X-API-Key is passed', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims');
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.error).toContain('Clé API manquante');
    });

    it('rejects with 401 if wrong API key is passed', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims', {
            headers: {
                Authorization: 'Bearer hajj_wrong_key_invalid'
            }
        });
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.success).toBe(false);
        expect(json.error).toContain('invalide');
    });

    it('returns 200 with formatted pilgrim records including dateEmission & payment metadata when key is valid', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims', {
            headers: {
                Authorization: `Bearer ${validKey}`
            }
        });
        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.count).toBe(1);
        expect(Array.isArray(json.data)).toBe(true);

        const record = json.data[0];
        expect(record.id).toBe('hajj-001');
        expect(record.fullName).toBe('Amine Idrissi');
        expect(record.dateEmission).toBe('2026-10-30T10:15:30.000Z');
        expect(record.statutPaiement).toBe('PAYE');
        expect(record.montantPaye).toBe(390.0);
        expect(record.conseiller).toBe('Conseiller 1');
    });
});

describe('POST /api/v1/hajj/pilgrims Route Tests', () => {
    const validKey = 'hajj_live_test_api_key_sync_9999999999';

    beforeEach(() => {
        process.env.HAJJ_SYNC_API_KEY = validKey;
    });

    it('rejects with 401 if unauthorized', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims', {
            method: 'POST',
            body: JSON.stringify({ fullName: 'Test' })
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('rejects with 400 if required fields are missing', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${validKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: 'Karim Idrissi'
                // missing email and phone
            })
        });
        const res = await POST(req);
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.success).toBe(false);
    });

    it('creates a new pilgrim with 201 Created when valid', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${validKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: 'Karim',
                familyName: 'Idrissi',
                email: 'karim@example.com',
                phone: '+33612345678',
                address: '15 Avenue des Champs, 75008 Paris',
                nationality: 'Française',
                peopleCount: 2,
                hajjYear: 2027,
                status: 'PENDING',
                adminNotes: 'Inscription portail assistance'
            })
        });
        const res = await POST(req);
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.message).toContain('créé avec succès');
        expect(json.data.id).toBe('new-uuid-1234');
        expect(json.data.fullName).toBe('Karim Idrissi');
        expect(json.data.email).toBe('karim@example.com');
    });
});
