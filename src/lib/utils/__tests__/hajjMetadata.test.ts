import { describe, it, expect } from 'vitest';
import { parseHajjAdminMetadata, mergeHajjAdminMetadata } from '../hajjMetadata';

describe('Hajj Metadata Utilities (Payment & Counselor Tagging)', () => {
    it('parses payment and counselor tags from admin_notes correctly', () => {
        const raw = '[Provider: Yusr Al Mashaer] [Paiement: PAYE (390.00 €) le 2026-10-31T10:00:00.000Z] [Conseiller: Conseiller 1] [Audit passeport validé] Client prêt.';
        const parsed = parseHajjAdminMetadata(raw);

        expect(parsed.statutPaiement).toBe('PAYE');
        expect(parsed.montantPaye).toBe(390.0);
        expect(parsed.datePaiement).toBe('2026-10-31T10:00:00.000Z');
        expect(parsed.conseiller).toBe('Conseiller 1');
    });

    it('returns null fields if no metadata tags exist', () => {
        const parsed = parseHajjAdminMetadata('Simple note sans balise');
        expect(parsed.statutPaiement).toBeNull();
        expect(parsed.montantPaye).toBeNull();
        expect(parsed.conseiller).toBeNull();
    });

    it('merges payment and counselor metadata idempotently into existing admin notes', () => {
        const initial = '[Provider: Yusr Al Mashaer] Client en attente';
        const updated = mergeHajjAdminMetadata(initial, {
            statutPaiement: 'PAYE',
            montantPaye: 390.0,
            datePaiement: '2026-10-31T10:00:00.000Z',
            conseiller: 'Conseiller 1',
            adminNotes: '[Audit passeport validé] Prêt pour Nusuk'
        });

        expect(updated).toContain('[Paiement: PAYE (390.00 €) le 2026-10-31T10:00:00.000Z]');
        expect(updated).toContain('[Conseiller: Conseiller 1]');
        expect(updated).toContain('[Audit passeport validé] Prêt pour Nusuk');

        const parsed = parseHajjAdminMetadata(updated);
        expect(parsed.statutPaiement).toBe('PAYE');
        expect(parsed.montantPaye).toBe(390.0);
        expect(parsed.conseiller).toBe('Conseiller 1');
    });
});
