import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PATCH, PUT } from '../route';
import { NextRequest } from 'next/server';

const mockExisting = {
    id: 'test-uuid-hajj-999',
    first_name: 'Youssef',
    family_name: 'Bennani',
    nationality: 'Française',
    phone: '+33612345678',
    email: 'youssef@example.com',
    address: '10 Rue de la Paix, 75002 Paris',
    people_count: 2,
    hajj_year: 2027,
    has_nusuk_account: 'OUI',
    nusuk_account_year: '2026_2027',
    nusuk_account_status: 'NON_VERIFIE',
    availability_slots: 'Soirée',
    status: 'PENDING',
    admin_notes: '[Provider: Yusr Al Mashaer]',
    created_at: '2026-10-30T10:15:30.000Z'
};

vi.mock('@/utils/supabase/server', () => ({
    createAdminClient: () => ({
        from: (table: string) => ({
            select: () => ({
                eq: (col: string, val: string) => ({
                    maybeSingle: () => {
                        if (val === 'test-uuid-hajj-999') {
                            return Promise.resolve({ data: mockExisting, error: null });
                        }
                        return Promise.resolve({ data: null, error: null });
                    }
                })
            }),
            update: (payload: any) => ({
                eq: (col: string, val: string) => ({
                    select: () => ({
                        single: () => Promise.resolve({
                            data: {
                                ...mockExisting,
                                ...payload
                            },
                            error: null
                        })
                    })
                })
            })
        })
    })
}));

describe('PATCH & PUT /api/v1/hajj/pilgrims/:id Route Tests', () => {
    const validKey = 'hajj_live_test_api_key_sync_9999999999';

    beforeEach(() => {
        process.env.HAJJ_SYNC_API_KEY = validKey;
    });

    it('rejects with 401 when unauthorized', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims/test-uuid-hajj-999', {
            method: 'PATCH',
            body: JSON.stringify({ status: 'PACKS_VALIDES' })
        });
        const res = await PATCH(req, { params: { id: 'test-uuid-hajj-999' } });
        expect(res.status).toBe(401);
    });

    it('rejects with 404 when pilgrim id does not exist', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims/unknown-id', {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${validKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'PACKS_VALIDES' })
        });
        const res = await PATCH(req, { params: { id: 'unknown-id' } });
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toContain('introuvable');
    });

    it('rejects with 400 when no valid update field is provided', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims/test-uuid-hajj-999', {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${validKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        const res = await PATCH(req, { params: { id: 'test-uuid-hajj-999' } });
        expect(res.status).toBe(400);
    });

    it('updates pilgrim status, Nusuk and payment metadata with 200 OK', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims/test-uuid-hajj-999', {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${validKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'PACKS_VALIDES',
                nusukAccountStatus: 'VERIFIE',
                hasNusukAccount: 'OUI',
                statutPaiement: 'PAYE',
                montantPaye: 390.0,
                datePaiement: '2026-10-31T10:00:00.000Z',
                conseiller: 'Conseiller 1',
                adminNotes: '[Audit passeport validé] Client prêt pour ouverture des ventes Nusuk.'
            })
        });

        const res = await PATCH(req, { params: { id: 'test-uuid-hajj-999' } });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.status).toBe('PACKS_VALIDES');
        expect(json.data.nusukAccountStatus).toBe('VERIFIE');
        expect(json.data.statutPaiement).toBe('PAYE');
        expect(json.data.montantPaye).toBe(390.0);
        expect(json.data.conseiller).toBe('Conseiller 1');
        expect(json.data.updatedAt).toBeDefined();
    });

    it('supports PUT alias identical to PATCH', async () => {
        const req = new NextRequest('http://localhost:3000/api/v1/hajj/pilgrims/test-uuid-hajj-999', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${validKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'CONFIRMED'
            })
        });

        const res = await PUT(req, { params: { id: 'test-uuid-hajj-999' } });
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.status).toBe('CONFIRMED');
    });
});
