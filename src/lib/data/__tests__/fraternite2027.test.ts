import { describe, it, expect } from 'vitest';
import {
    FRATERNITE_DEPARTURES,
    FRATERNITE_AIRLINES,
    FRATERNITE_PROGRAM_STEPS,
    FRATERNITE_INCLUDED_TILES,
    FRATERNITE_FAQS,
    findFraterniteDeparture,
    getFraterniteCountries,
    calculateFraterniteQuote,
    filterFraterniteDepartures,
    getVisaRuleLabel,
    isPaidHoldBaggage,
    buildFraterniteWhatsAppMessage,
    buildFraterniteWhatsAppUrl,
    FraterniteSubmissionSchema,
} from '../fraternite2027';

describe('fraternite2027 — Données & Calculateur Omra de la Fraternité Musulmane', () => {
    it('contient exactement les 23 aéroports, 13 pays, 8 compagnies, 3 étapes, 8 tuiles et 3 FAQ', () => {
        expect(FRATERNITE_DEPARTURES).toHaveLength(23);
        expect(getFraterniteCountries()).toHaveLength(13);
        expect(Object.keys(FRATERNITE_AIRLINES)).toHaveLength(8);
        expect(FRATERNITE_PROGRAM_STEPS).toHaveLength(3);
        expect(FRATERNITE_INCLUDED_TILES).toHaveLength(8);
        expect(FRATERNITE_FAQS).toHaveLength(3);
    });

    it('applique bien le tarif officiel mis à jour de Bruxelles (BRU) à 1 295 €', () => {
        const bru = findFraterniteDeparture('BRU');
        const crl = findFraterniteDeparture('CRL');
        expect(bru).toBeDefined();
        expect(bru?.city).toBe('Bruxelles');
        expect(bru?.basePriceEur).toBe(1295);
        expect(crl?.basePriceEur).toBe(1195);
    });

    it('calcule fidèlement le devis par personne et le total du groupe (chambre + petit-déjeuner)', () => {
        // Bruxelles (1295) + Chambre Double (+300) + Petit-déjeuner (+150) = 1745 €/pers × 3 = 5235 €
        const quote = calculateFraterniteQuote({
            airportIata: 'BRU',
            roomType: 'DOUBLE',
            pilgrimsCount: 3,
            breakfast: true,
        });

        expect(quote.validCount).toBe(true);
        expect(quote.perPersonEur).toBe(1745);
        expect(quote.totalEur).toBe(5235);
        expect(quote.paidHoldBaggage).toBe(true); // Flynas (XY)
    });

    it('identifie correctement les compagnies à soute payante (PC & XY) et les règles de visa', () => {
        const paidIatas = FRATERNITE_DEPARTURES.filter(isPaidHoldBaggage).map((d) => d.iata).sort();
        expect(paidIatas).toEqual(['BRU', 'CRL', 'MRS', 'NCE', 'STN']);

        expect(getVisaRuleLabel('CMN')).toBe('Visa non inclus');
        expect(getVisaRuleLabel('TUN')).toBe('Visa inclus');
        expect(getVisaRuleLabel('CDG')).toBe('Visa selon éligibilité et confirmation');
    });

    it('filtre par pays et par recherche insensible aux accents (ville, IATA, compagnie)', () => {
        const belgium = filterFraterniteDepartures('', 'Belgique');
        expect(belgium.map((d) => d.iata)).toEqual(['BRU', 'CRL']);

        const montreal = filterFraterniteDepartures('montreal', '');
        expect(montreal).toHaveLength(1);
        expect(montreal[0].iata).toBe('YUL');

        const saudia = filterFraterniteDepartures('saudia', '');
        expect(saudia.map((d) => d.iata)).toEqual(['ALG', 'TUN']);
    });

    it('génère le message et le lien WhatsApp pré-rempli vers +33 7 52 28 08 90', () => {
        const payload = {
            airportIata: 'BRU',
            roomType: 'TRIPLE' as const,
            pilgrimsCount: 2,
            breakfast: false,
            extraBaggage: true,
            gender: 'M' as const,
            firstName: 'Karim',
            familyName: 'Benali',
            phone: '+32 470 00 11 22',
            email: 'karim@example.com',
            nationality: 'Belge',
            visaSituation: 'À vérifier / à obtenir' as const,
            remarks: 'Couple',
            consent: true as const,
            website: '',
        };

        const parsed = FraterniteSubmissionSchema.safeParse(payload);
        expect(parsed.success).toBe(true);

        const msg = buildFraterniteWhatsAppMessage(payload);
        expect(msg).toContain('السلام عليكم ورحمة الله وبركاته');
        expect(msg).toContain('Départ : Bruxelles (BRU)');
        expect(msg).toContain('Soute en supplément : Souhaitée, devis à confirmer');
        // 1295 + 150 = 1445 €/pers ; × 2 = 2890 €
        expect(msg).toContain('1\u202f445');
        expect(msg).toContain('2\u202f890');

        const url = buildFraterniteWhatsAppUrl(payload);
        expect(url.startsWith('https://wa.me/33752280890?text=')).toBe(true);
    });
});
