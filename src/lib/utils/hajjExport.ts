/**
 * Utilitaire d'export des candidatures et pèlerins Hajj (CSV & JSON)
 * Compatible Excel (UTF-8 BOM), Google Sheets et APIs d'applications Hajj dédiées.
 */

export interface HajjExportItem {
    id: string;
    first_name: string;
    family_name: string;
    nationality: string;
    phone: string;
    email: string;
    address: string;
    people_count: number;
    hajj_year: number;
    has_nusuk_account?: string;
    nusuk_account_year?: string;
    nusuk_account_status?: string;
    availability_slots?: string;
    admin_notes?: string;
    status: string;
    created_at?: string;
    [key: string]: any;
}

/**
 * Assainit une chaîne pour éviter les injections de formules CSV (=, +, -, @)
 */
function sanitizeCsvValue(val: any): string {
    if (val === null || val === undefined) return '';
    let str = String(val).trim();

    // Remplacement des sauts de ligne internes
    str = str.replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');

    // Protection anti-injection CSV
    if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
    }

    // Échappement des guillemets
    return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Convertit une liste de requêtes Hajj en CSV structuré (UTF-8 avec BOM)
 */
export function generateHajjCsv(requests: HajjExportItem[]): string {
    const headers = [
        'ID Candidat',
        'Prénom',
        'Nom de famille',
        'Nationalité',
        'Téléphone',
        'Email',
        'Adresse complète',
        'Nombre de pèlerins',
        'Année du Hajj',
        'Compte Nusuk',
        'Année compte Nusuk',
        'Statut vérification Nusuk',
        'Créneaux de rappel',
        'Notes administrateur',
        'Statut dossier',
        'Date inscription'
    ];

    const rows = requests.map(r => [
        sanitizeCsvValue(r.id),
        sanitizeCsvValue(r.first_name),
        sanitizeCsvValue(r.family_name),
        sanitizeCsvValue(r.nationality),
        sanitizeCsvValue(r.phone),
        sanitizeCsvValue(r.email),
        sanitizeCsvValue(r.address),
        sanitizeCsvValue(r.people_count || 1),
        sanitizeCsvValue(r.hajj_year || 2027),
        sanitizeCsvValue(r.has_nusuk_account || 'NON'),
        sanitizeCsvValue(r.nusuk_account_year || 'NON_APPLICABLE'),
        sanitizeCsvValue(r.nusuk_account_status || 'NON_VERIFIE'),
        sanitizeCsvValue(r.availability_slots || ''),
        sanitizeCsvValue(r.admin_notes || ''),
        sanitizeCsvValue(r.status || 'PENDING'),
        sanitizeCsvValue(r.created_at || '')
    ]);

    const csvContent = [
        headers.map(h => `"${h}"`).join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\r\n');

    // Ajout du BOM UTF-8 (\uFEFF) pour compatibilité Excel native
    return '\uFEFF' + csvContent;
}

/**
 * Convertit une liste de requêtes Hajj en structure JSON propre et typée pour application dédiée
 */
export function generateHajjJson(requests: HajjExportItem[]): string {
    const formatted = requests.map(r => ({
        id: r.id,
        firstName: r.first_name,
        familyName: r.family_name,
        fullName: `${r.first_name || ''} ${r.family_name || ''}`.trim(),
        nationality: r.nationality,
        phone: r.phone,
        email: r.email,
        address: r.address,
        peopleCount: Number(r.people_count) || 1,
        hajjYear: Number(r.hajj_year) || 2027,
        provider: 'Yusr Al Mashaer',
        nusuk: {
            hasAccount: r.has_nusuk_account === 'OUI',
            rawHasAccount: r.has_nusuk_account || 'NON',
            accountYear: r.nusuk_account_year || 'NON_APPLICABLE',
            verificationStatus: r.nusuk_account_status || 'NON_VERIFIE'
        },
        availabilitySlots: r.availability_slots || '',
        adminNotes: r.admin_notes || '',
        status: r.status || 'PENDING',
        createdAt: r.created_at || new Date().toISOString()
    }));

    return JSON.stringify(formatted, null, 2);
}

/**
 * Déclenche le téléchargement du fichier généré côté client
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
    if (typeof window === 'undefined') return;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
