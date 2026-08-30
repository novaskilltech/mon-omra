/**
 * Utilitaires de formatage et de normalisation des numeros de telephone pour WhatsApp
 * Supporte la conversion automatique des numeros nationaux (06, 07, etc.) au format international E.164.
 */

interface CountryPrefix {
    keywords: string[];
    prefix: string;
}

const COUNTRY_PREFIXES: CountryPrefix[] = [
    { keywords: ['maroc', 'morocco', 'marocaine'], prefix: '212' },
    { keywords: ['alger', 'algerie', 'algerienne', 'algér', 'algérie', 'algérienne'], prefix: '213' },
    { keywords: ['tunis', 'tunisie', 'tunisienne'], prefix: '216' },
    { keywords: ['belg', 'belgique', 'belge'], prefix: '32' },
    { keywords: ['suiss', 'switzerland', 'suisse'], prefix: '41' },
    { keywords: ['senegal', 'sénégal', 'senegalaise', 'sénégalaise'], prefix: '221' },
    { keywords: ['mali', 'malienne'], prefix: '223' },
    { keywords: ['ivoir', 'côte d\'ivoire', 'cote d\'ivoire', 'ivoirienne'], prefix: '225' },
    { keywords: ['royaume-uni', 'uk', 'united kingdom', 'angleterre', 'britannique'], prefix: '44' },
    { keywords: ['etats-unis', 'états-unis', 'usa', 'united states', 'canada', 'canadienne', 'americaine', 'américaine'], prefix: '1' },
    { keywords: ['arabie', 'saoudite', 'saudi', 'ksa'], prefix: '966' },
    { keywords: ['turquie', 'turkey', 'turque'], prefix: '90' },
    { keywords: ['allemagne', 'germany', 'allemande'], prefix: '49' },
    { keywords: ['espagne', 'spain', 'espagnole'], prefix: '34' },
    { keywords: ['italie', 'italy', 'italienne'], prefix: '39' },
    { keywords: ['pays-bas', 'netherlands', 'hollande'], prefix: '31' },
    { keywords: ['france', 'francaise', 'française', 'francais'], prefix: '33' },
];

export function formatPhoneForWhatsApp(phone: string | null | undefined, nationality?: string | null): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2);
    }
    let countryCode = '33';
    if (nationality) {
        const natLower = nationality.toLowerCase().trim();
        const match = COUNTRY_PREFIXES.find(c => c.keywords.some(k => natLower.includes(k)));
        if (match) {
            countryCode = match.prefix;
        }
    }
    if (cleaned.startsWith('0')) {
        cleaned = countryCode + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith('6') || cleaned.startsWith('7')) && countryCode === '33') {
        cleaned = '33' + cleaned;
    }
    return cleaned;
}

export function getWhatsAppUrl(phone: string | null | undefined, message?: string, nationality?: string | null): string {
    const cleanPhone = formatPhoneForWhatsApp(phone, nationality);
    if (!cleanPhone) return '';
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return 'https://api.whatsapp.com/send?phone=' + cleanPhone + (encodedMessage ? '&text=' + encodedMessage : '');
}

export function getWhatsAppWebUrl(phone: string | null | undefined, message?: string, nationality?: string | null): string {
    const cleanPhone = formatPhoneForWhatsApp(phone, nationality);
    if (!cleanPhone) return '';
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return 'https://web.whatsapp.com/send?phone=' + cleanPhone + (encodedMessage ? '&text=' + encodedMessage : '');
}

export function formatDisplayPhone(phone: string | null | undefined, nationality?: string | null): string {
    const clean = formatPhoneForWhatsApp(phone, nationality);
    if (!clean) return phone || '';
    if (clean.startsWith('33') && clean.length === 11) {
        const body = clean.substring(2);
        return '+33 ' + body[0] + ' ' + body.substring(1, 3) + ' ' + body.substring(3, 5) + ' ' + body.substring(5, 7) + ' ' + body.substring(7, 9);
    }
    if (clean.startsWith('212') && clean.length === 12) {
        const body = clean.substring(3);
        return '+212 ' + body[0] + ' ' + body.substring(1, 3) + ' ' + body.substring(3, 5) + ' ' + body.substring(5, 7) + ' ' + body.substring(7, 9);
    }
    return '+' + clean;
}
