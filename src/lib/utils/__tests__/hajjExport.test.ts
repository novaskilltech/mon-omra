import { describe, it, expect } from 'vitest';
import { generateHajjCsv, generateHajjJson, formatEmissionDate, HajjExportItem } from '../hajjExport';

describe('Hajj Export Utility Tests (CSV & JSON with Form Emission Date)', () => {
    const mockHajjItems: HajjExportItem[] = [
        {
            id: 'hajj-req-001',
            first_name: 'Youssef',
            family_name: 'Bennani',
            nationality: 'Française',
            phone: '0612345678',
            email: 'youssef@example.com',
            address: '10 Rue de la Paix, 75002 Paris',
            people_count: 2,
            hajj_year: 2027,
            has_nusuk_account: 'OUI',
            nusuk_account_year: '2026_2027',
            nusuk_account_status: 'VERIFIE',
            availability_slots: 'Soirée (18h-21h)',
            admin_notes: '[Provider: Yusr Al Mashaer] Dossier prioritaire',
            status: 'CONFIRMED',
            created_at: '2026-10-30T10:15:30.000Z'
        },
        {
            id: 'hajj-req-002',
            first_name: 'Fatima',
            family_name: 'El Mansouri',
            nationality: 'Marocaine',
            phone: '+33798765432',
            email: 'fatima@example.com',
            address: '15 Boulevard des Belges, 69006 Lyon',
            people_count: 1,
            hajj_year: 2028,
            has_nusuk_account: 'NON',
            nusuk_account_year: 'NON_APPLICABLE',
            nusuk_account_status: 'NON_VERIFIE',
            availability_slots: 'Midi (12h-14h)',
            admin_notes: '=cmd|calc!A1', // CSV injection test
            status: 'PENDING',
            created_at: '2026-08-16T07:52:32.000Z'
        }
    ];

    it('formats emission date correctly into ISO and French localized strings', () => {
        const formatted = formatEmissionDate('2026-10-30T10:15:30.000Z');
        expect(formatted.iso).toBe('2026-10-30T10:15:30.000Z');
        expect(formatted.dateOnly).toBe('2026-10-30');
        expect(formatted.formattedFr).toContain('2026');
        expect(formatted.timestamp).toBeGreaterThan(0);
    });

    it('generates CSV with UTF-8 BOM, semicolon separator and emission dates', () => {
        const csv = generateHajjCsv(mockHajjItems);

        // UTF-8 BOM check
        expect(csv.charCodeAt(0)).toBe(0xFEFF);

        // Semicolon delimiter & Headers
        expect(csv).toContain(';');
        expect(csv).toContain('"Date émission formulaire (FR)"');
        expect(csv).toContain('"Date émission formulaire (ISO)"');

        // Content verification
        expect(csv).toContain('"Youssef"');
        expect(csv).toContain('"2026-10-30T10:15:30.000Z"');
        expect(csv).toContain('"2026-08-16T07:52:32.000Z"');

        // Anti-injection formula verification (= must be prefixed with ')
        expect(csv).toContain('\'=cmd|calc!A1');
    });

    it('generates structured JSON explicitly including form emission date for each client', () => {
        const jsonStr = generateHajjJson(mockHajjItems);
        const parsed = JSON.parse(jsonStr);

        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBe(2);

        const first = parsed[0];
        expect(first.id).toBe('hajj-req-001');
        expect(first.fullName).toBe('Youssef Bennani');
        expect(first.provider).toBe('Yusr Al Mashaer');
        expect(first.nusuk.hasAccount).toBe(true);

        // Specific checks on form emission date
        expect(first.dateEmission).toBe('2026-10-30T10:15:30.000Z');
        expect(first.dateEmissionFormatee).toBeDefined();
        expect(first.dateEmissionTimestamp).toBe(new Date('2026-10-30T10:15:30.000Z').getTime());
        expect(first.submissionDate).toBe('2026-10-30T10:15:30.000Z');
        expect(first.submittedAt).toBe('2026-10-30T10:15:30.000Z');
        expect(first.createdAt).toBe('2026-10-30T10:15:30.000Z');

        const second = parsed[1];
        expect(second.dateEmission).toBe('2026-08-16T07:52:32.000Z');
        expect(second.nusuk.hasAccount).toBe(false);
    });
});
