export interface FlyerOffer {
    id: string;
    title: string;
    airport: string;
    dates: string;
    price: string;
    imageUrl: string;
    aspectRatio?: number;
    badge?: string;
    isActive: boolean;
    createdAt: string;
    description?: string;
}

export const SEED_FLYERS: FlyerOffer[] = [
    {
        id: 'flyer-lyon-decembre',
        title: 'OMRA CONFORT 4★ DÉCEMBRE',
        airport: 'Lyon Saint-Exupéry (LYS)',
        dates: '08 au 15 Décembre 2026',
        price: '1 290 €',
        imageUrl: '/flyers/flyer-lyon-decembre.svg',
        badge: 'PLACES LIMITÉES',
        isActive: true,
        createdAt: '2026-10-16T10:00:00.000Z',
        description: 'Vols directs depuis Lyon, hôtels 4★ face Haram, transferts VIP et encadrement spirituel complet.'
    },
    {
        id: 'flyer-paris-noel',
        title: 'OMRA VACANCES FIN D\'ANNÉE',
        airport: 'Paris-Orly (ORY)',
        dates: '22 au 30 Décembre 2026',
        price: '1 450 €',
        imageUrl: '/flyers/flyer-paris-noel.svg',
        badge: 'SÉLECTION PRIVILÈGE',
        isActive: true,
        createdAt: '2026-10-16T10:00:00.000Z',
        description: 'Formule Vacances Scolaires au départ de Paris-Orly. Hôtels 5★ front Haram et petit-déjeuner inclus.'
    },
    {
        id: 'flyer-marseille-fevrier',
        title: 'OMRA SÉRÉNITÉ FÉVRIER 2027',
        airport: 'Marseille-Provence (MRS)',
        dates: '14 au 23 Février 2027',
        price: '1 350 €',
        imageUrl: '/flyers/flyer-marseille-fevrier.svg',
        badge: 'RÉSERVATION OUVERTE',
        isActive: true,
        createdAt: '2026-10-16T10:00:00.000Z',
        description: 'Idéal en famille pour les vacances d\'hiver. Vols directs depuis Marseille avec navette VIP 24h/24.'
    }
];

/**
 * Extraction assistée intelligente des données d'un flyer (Titre, Aéroport, Dates, Tarif)
 * Parse le texte brut extrait par OCR ou saisi par l'admin
 */
export function extractFlyerInfoFromText(rawText: string): {
    title: string;
    airport: string;
    dates: string;
    price: string;
} {
    const text = rawText || '';
    const lower = text.toLowerCase();

    // 1. Détection de l'Aéroport
    let airport = '';
    const airportMatches = [
        { key: 'lyon', name: 'Lyon Saint-Exupéry (LYS)' },
        { key: 'lys', name: 'Lyon Saint-Exupéry (LYS)' },
        { key: 'marseille', name: 'Marseille-Provence (MRS)' },
        { key: 'mrs', name: 'Marseille-Provence (MRS)' },
        { key: 'orly', name: 'Paris-Orly (ORY)' },
        { key: 'ory', name: 'Paris-Orly (ORY)' },
        { key: 'cdg', name: 'Paris Charles de Gaulle (CDG)' },
        { key: 'paris', name: 'Paris-Orly / CDG' },
        { key: 'mulhouse', name: 'Mulhouse EuroAirport (MLH/BSL)' },
        { key: 'bruxelles', name: 'Bruxelles (BRU)' },
        { key: 'charleroi', name: 'Bruxelles Charleroi (CRL)' },
        { key: 'nice', name: 'Nice Côte d\'Azur (NCE)' },
        { key: 'toulouse', name: 'Toulouse-Blagnac (TLS)' },
        { key: 'nantes', name: 'Nantes Atlantique (NTE)' },
        { key: 'bordeaux', name: 'Bordeaux Mérignac (BOD)' },
        { key: 'lille', name: 'Lille Lesquin (LIL)' },
        { key: 'strasbourg', name: 'Strasbourg Entzheim (SXB)' },
        { key: 'casablanca', name: 'Casablanca Mohammed V (CMN)' },
        { key: 'alger', name: 'Alger Houari Boumédiène (ALG)' },
        { key: 'tunis', name: 'Tunis-Carthage (TUN)' }
    ];

    for (const item of airportMatches) {
        if (lower.includes(item.key)) {
            airport = item.name;
            break;
        }
    }

    // 2. Détection du Tarif (ex: 1290 €, 1 290€, 1450 EUR)
    let price = '';
    const priceRegex = /(\b\d{1,2}[\s.]?\d{3}\s*(?:€|eur|euros)|(?:\b\d{3,4}\s*(?:€|eur|euros)))/i;
    const priceMatch = text.match(priceRegex);
    if (priceMatch) {
        price = priceMatch[0].trim();
        if (!price.includes('€') && !price.toLowerCase().includes('eur')) {
            price += ' €';
        }
    }

    // 3. Détection des Dates (ex: 08 au 15 décembre, du 22 au 30/12/2026)
    let dates = '';
    const datesRegex = /(?:du\s+)?(\d{1,2}(?:\s*(?:au|-|à)\s*\d{1,2})?\s*(?:janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre|ramadan)(?:\s*\d{4})?)/i;
    const datesMatch = text.match(datesRegex);
    if (datesMatch) {
        dates = datesMatch[1].trim();
    } else {
        const numDatesRegex = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*(?:au|-|à)\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i;
        const numDatesMatch = text.match(numDatesRegex);
        if (numDatesMatch) {
            dates = numDatesMatch[1].trim();
        }
    }

    // 4. Détection du Titre (ex: OMRA CONFORT, OMRA RAMADAN, OMRA VACANCES)
    let title = 'OMRA PRIVILÈGE';
    if (lower.includes('confort')) {
        title = 'OMRA CONFORT';
    } else if (lower.includes('ramadan')) {
        title = 'OMRA RAMADAN';
    } else if (lower.includes('vacances')) {
        title = 'OMRA VACANCES SCOLAIRES';
    } else if (lower.includes('noel') || lower.includes('fin d\'année') || lower.includes('fin d’année')) {
        title = 'OMRA FIN D\'ANNÉE';
    } else if (lower.includes('sérénité') || lower.includes('serenite')) {
        title = 'OMRA SÉRÉNITÉ';
    } else if (lower.includes('hajj')) {
        title = 'HAJJ PRESTIGE';
    }

    return {
        title,
        airport: airport || 'France / Europe',
        dates: dates || 'Dates à confirmer',
        price: price || 'Tarif sur demande'
    };
}
