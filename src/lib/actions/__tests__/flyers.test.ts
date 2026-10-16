import { describe, it, expect, vi } from 'vitest';
import { 
    getPublicFlyers, 
    getFlyerById,
    analyzeFlyerImageWithAiAction
} from '../flyers';

import { extractFlyerInfoFromText, SEED_FLYERS } from '@/lib/utils/flyers';
import { getFlyerWhatsAppUrl, AGENCY_WHATSAPP_PHONE } from '@/lib/utils/phone';

vi.mock('../auth', () => ({
    isAdminAuthenticated: vi.fn(() => Promise.resolve(true))
}));


// Mock Supabase to test memory fallback cleanly
vi.mock('@/utils/supabase/server', () => ({
    createClient: () => ({
        from: () => ({
            select: () => ({
                eq: () => ({
                    order: () => Promise.resolve({ data: null, error: new Error('Mock table') }),
                    single: () => Promise.resolve({ data: null, error: new Error('Mock table') })
                })
            })
        })
    })
}));

describe('3D Promotional Flyers & AI Extraction Tests', () => {
    it('returns seed flyers with complete 9:16 attributes', async () => {
        const flyers = await getPublicFlyers();
        expect(flyers.length).toBeGreaterThanOrEqual(3);

        const lyonFlyer = flyers.find(f => f.id === 'flyer-lyon-decembre');
        expect(lyonFlyer).toBeDefined();
        expect(lyonFlyer?.airport).toContain('Lyon');
        expect(lyonFlyer?.price).toContain('1 290');
        expect(lyonFlyer?.imageUrl).toBe('/flyers/flyer-lyon-decembre.svg');
    });

    it('retrieves specific flyer by ID', async () => {
        const parisFlyer = await getFlyerById('flyer-paris-noel');
        expect(parisFlyer).not.toBeNull();
        expect(parisFlyer?.title).toContain('FIN D\'ANNÉE');
        expect(parisFlyer?.airport).toContain('Paris');
    });

    it('generates rich WhatsApp URL with offer parameters and deep-link for OpenGraph preview', () => {
        const sampleFlyer = {
            id: 'flyer-lyon-decembre',
            title: 'OMRA CONFORT 4★ DÉCEMBRE',
            airport: 'Lyon Saint-Exupéry (LYS)',
            dates: '08 au 15 Décembre 2026',
            price: '1 290 €',
            imageUrl: '/flyers/flyer-lyon-decembre.svg'
        };

        const url = getFlyerWhatsAppUrl(sampleFlyer);
        expect(url).toContain(`api.whatsapp.com/send?phone=33${AGENCY_WHATSAPP_PHONE.substring(1)}`);
        
        const decoded = decodeURIComponent(url);
        expect(decoded).toContain('OMRA CONFORT 4★ DÉCEMBRE');
        expect(decoded).toContain('Lyon Saint-Exupéry (LYS)');
        expect(decoded).toContain('08 au 15 Décembre 2026');
        expect(decoded).toContain('1 290 €');
        expect(decoded).toContain('https://omrayanair.novaskill.tech/offres/flyer-lyon-decembre');
    });

    it('extracts airport, dates, price, and title accurately from raw flyer text (AI Extraction helper)', () => {
        const sampleOcrText = `
            ★ GRANDE OFFRE OMRA CONFORT ★
            Départ exceptionnel de Lyon Saint-Exupéry (LYS)
            Du 08 au 15 décembre 2026
            Hôtels 4 étoiles proches du Haram avec navettes
            Tarif exclusif par pèlerin : 1 290 €
            Places limitées, réservez dès maintenant !
        `;

        const extracted = extractFlyerInfoFromText(sampleOcrText);
        expect(extracted.airport).toBe('Lyon Saint-Exupéry (LYS)');
        expect(extracted.dates).toContain('08 au 15 décembre');
        expect(extracted.price).toBe('1 290 €');
        expect(extracted.title).toBe('OMRA CONFORT');
    });

    it('handles international airports like Mulhouse, Marseille and Paris in extraction', () => {
        const mulhouseText = "Superbe formule au départ de Mulhouse EuroAirport pour 1450 EUR du 22 au 30 décembre";
        const res = extractFlyerInfoFromText(mulhouseText);
        expect(res.airport).toBe('Mulhouse EuroAirport (MLH/BSL)');
        expect(res.price).toBe('1450 EUR');
    });

    it('returns error if no file provided to analyzeFlyerImageWithAiAction', async () => {
        const formData = new FormData();
        const res = await analyzeFlyerImageWithAiAction(formData);
        expect(res.success).toBe(false);
        expect(res.error).toContain('sélectionner une image');
    });
});
