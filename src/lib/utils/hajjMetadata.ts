/**
 * Utilitaires de gestion des métadonnées enrichies des pèlerins Hajj
 * (Paiements, montants, conseillers, notes internes)
 */

export interface HajjMetadataInput {
    statutPaiement?: string;
    montantPaye?: number | string;
    datePaiement?: string;
    conseiller?: string;
    adminNotes?: string;
}

export interface ParsedHajjMetadata {
    statutPaiement: string | null;
    montantPaye: number | null;
    datePaiement: string | null;
    conseiller: string | null;
    cleanNotes: string;
}

/**
 * Extrait les balises structurées stockées dans admin_notes
 */
export function parseHajjAdminMetadata(rawNotes: string | null | undefined): ParsedHajjMetadata {
    if (!rawNotes || typeof rawNotes !== 'string') {
        return {
            statutPaiement: null,
            montantPaye: null,
            datePaiement: null,
            conseiller: null,
            cleanNotes: ''
        };
    }

    let statutPaiement: string | null = null;
    let montantPaye: number | null = null;
    let datePaiement: string | null = null;
    let conseiller: string | null = null;

    // Détection [Paiement: STATUS (MONTANT€) le DATE]
    const paymentMatch = rawNotes.match(/\[Paiement:\s*([A-Z_]+)(?:\s*\(([\d.]+)\s*€?\))?(?:\s*le\s*([0-9T:.-]+Z?))?\]/i);
    if (paymentMatch) {
        statutPaiement = paymentMatch[1].toUpperCase();
        if (paymentMatch[2]) {
            const parsed = parseFloat(paymentMatch[2]);
            if (!isNaN(parsed)) montantPaye = parsed;
        }
        if (paymentMatch[3]) {
            datePaiement = paymentMatch[3];
        }
    }

    // Détection [Conseiller: NOM]
    const conseillerMatch = rawNotes.match(/\[Conseiller:\s*([^\]]+)\]/i);
    if (conseillerMatch) {
        conseiller = conseillerMatch[1].trim();
    }

    return {
        statutPaiement,
        montantPaye,
        datePaiement,
        conseiller,
        cleanNotes: rawNotes.trim()
    };
}

/**
 * Fusionne les métadonnées de paiement et conseiller dans admin_notes de manière idempotente
 */
export function mergeHajjAdminMetadata(
    existingNotes: string | null | undefined,
    input: HajjMetadataInput
): string {
    let base = existingNotes ? existingNotes.trim() : '';

    // Si une nouvelle note administrative brute est fournie
    if (input.adminNotes !== undefined) {
        // Retirer les anciennes balises paiement/conseiller de la note fournie si elle les contient
        base = input.adminNotes.trim();
    }

    // Retirer les anciennes balises paiement et conseiller existantes pour les remplacer proprement
    base = base.replace(/\[Paiement:[^\]]*\]/gi, '').trim();
    base = base.replace(/\[Conseiller:[^\]]*\]/gi, '').trim();

    // Reconstituer les balises
    const tags: string[] = [];

    // Conserver le tag provider si présent ou l'ajouter
    if (!base.includes('[Provider: Yusr Al Mashaer]')) {
        tags.push('[Provider: Yusr Al Mashaer]');
    }

    // Balise paiement
    if (input.statutPaiement !== undefined || input.montantPaye !== undefined) {
        const statut = input.statutPaiement ? String(input.statutPaiement).toUpperCase().trim() : 'EN_ATTENTE';
        const montantPart = input.montantPaye !== undefined && input.montantPaye !== null && input.montantPaye !== ''
            ? ` (${Number(input.montantPaye).toFixed(2)} €)`
            : '';
        const datePart = input.datePaiement
            ? ` le ${input.datePaiement.trim()}`
            : ` le ${new Date().toISOString()}`;
        tags.push(`[Paiement: ${statut}${montantPart}${datePart}]`);
    }

    // Balise conseiller
    if (input.conseiller) {
        tags.push(`[Conseiller: ${input.conseiller.trim()}]`);
    }

    // Nettoyer le corps du message restant
    const cleanRemaining = base
        .replace(/\[Provider:\s*Yusr Al Mashaer\]/gi, '')
        .trim();

    return [...tags, cleanRemaining].filter(Boolean).join(' ').trim();
}
