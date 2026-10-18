import { describe, it, expect, vi } from 'vitest';
import { 
    getPublicFlyers, 
    getFlyerById,
    createFlyerAction,
    deleteFlyerAction,
    analyzeFlyerImageWithAiAction
} from '../flyers';

import { extractFlyerInfoFromText } from '@/lib/utils/flyers';
import { getFlyerWhatsAppUrl, AGENCY_WHATSAPP_PHONE } from '@/lib/utils/phone';

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

vi.mock('../auth', () => ({
    isAdminAuthenticated: vi.fn(() => Promise.resolve(true))
}));

// Mock Supabase Admin Client without storage so unit tests verify the clean store lifecycle
vi.mock('@/utils/supabase/server', () => ({
    createAdminClient: () => ({}),
    createClient: () => ({})
}));

describe('3D Promotional Flyers & Persistent Cloud Storage Tests', () => {
    it('starts with zero fake flyers and persists created agency flyers', async () => {
        const initial = await getPublicFlyers();
        expect(initial.length).toBe(0);

        const created = await createFlyerAction({
            title: 'OMRA CONFORT 4★ DÉCEMBRE',
            airport: 'Lyon Saint-Exupéry (LYS)',
            dates: '08 au 15 Décembre 2026',
            price: '1 290 €',
            imageUrl: 'https://tqbcmcddnohnqmcxvgut.supabase.co/storage/v1/object/public/public-flyers/images/flyer-test.jpg',
            badge: 'OFFRE FLASH'
        });

        expect(created.success).toBe(true);
        expect(created.flyer).toBeDefined();

        const afterCreate = await getPublicFlyers();
        expect(afterCreate.length).toBe(1);
        expect(afterCreate[0].title).toBe('OMRA CONFORT 4★ DÉCEMBRE');

        const fetchedById = await getFlyerById(created.flyer!.id);
        expect(fetchedById).not.toBeNull();
        expect(fetchedById?.airport).toContain('Lyon');

        // Delete the flyer and ensure it never comes back
        await deleteFlyerAction(created.flyer!.id);
        const afterDelete = await getPublicFlyers();
        expect(afterDelete.length).toBe(0);
    });

    it('generates rich WhatsApp URL with offer parameters and deep-link for OpenGraph preview', () => {
        const sampleFlyer = {
            id: 'flyer-lyon-decembre',
            title: 'OMRA CONFORT 4★ DÉCEMBRE',
            airport: 'Lyon Saint-Exupéry (LYS)',
            dates: '08 au 15 Décembre 2026',
            price: '1 290 €',
            imageUrl: 'https://tqbcmcddnohnqmcxvgut.supabase.co/storage/v1/object/public/public-flyers/images/flyer-lyon.jpg'
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
