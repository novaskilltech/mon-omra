import { z } from 'zod';

export type AirlineCode = 'RJ' | 'TK' | 'XY' | 'PC' | 'QR' | 'AT' | 'SV' | 'ET';

export interface FraterniteAirline {
    code: AirlineCode;
    name: string;
    baggageAllowance: string;
    paidHoldBaggage: boolean;
}

export interface FraterniteDeparture {
    country: string;
    city: string;
    iata: string;
    basePriceEur: number;
    airlineCode: AirlineCode;
    stopover: string;
    outboundDep: string;
    outboundArr: string;
    outboundLayover: string;
    outboundDuration: string;
    returnDep: string;
    returnArr: string;
    returnLayover: string;
    returnDuration: string;
    specialNote?: string;
}

export type FraterniteRoomType = 'QUADRUPLE' | 'TRIPLE' | 'DOUBLE';

export const FRATERNITE_WHATSAPP_PHONE = '33752280890';
export const FRATERNITE_WHATSAPP_DISPLAY = '+33 7 52 28 08 90';

export const FRATERNITE_ROOM_OPTIONS: Record<FraterniteRoomType, { label: string; shortLabel: string; supplementEur: number }> = {
    QUADRUPLE: { label: 'Quadruple — tarif de base', shortLabel: 'Quadruple', supplementEur: 0 },
    TRIPLE: { label: 'Triple — +150 €/pers.', shortLabel: 'Triple', supplementEur: 150 },
    DOUBLE: { label: 'Double — +300 €/pers.', shortLabel: 'Double', supplementEur: 300 },
};

export const FRATERNITE_BREAKFAST_SUPPLEMENT_EUR = 150;

export const FRATERNITE_AIRLINES: Record<AirlineCode, FraterniteAirline> = {
    RJ: {
        code: 'RJ',
        name: 'Royal Jordanian',
        baggageAllowance: 'Sac personnel + petite valise cabine + 30 kg en soute (poids cabine à confirmer).',
        paidHoldBaggage: false,
    },
    TK: {
        code: 'TK',
        name: 'Turkish Airlines',
        baggageAllowance: 'Sac personnel 4 kg + cabine 8 kg + soute 23 kg.',
        paidHoldBaggage: false,
    },
    XY: {
        code: 'XY',
        name: 'Flynas',
        baggageAllowance: 'Sac personnel 3 kg + cabine 7 kg. Soute en supplément.',
        paidHoldBaggage: true,
    },
    PC: {
        code: 'PC',
        name: 'Pegasus Airlines',
        baggageAllowance: 'Sac personnel 3 kg + cabine 8 kg. Soute en supplément.',
        paidHoldBaggage: true,
    },
    QR: {
        code: 'QR',
        name: 'Qatar Airways / Iberia',
        baggageAllowance: 'Cabine 7 kg + soute 23 kg minimum prévu, à confirmer sur le billet.',
        paidHoldBaggage: false,
    },
    AT: {
        code: 'AT',
        name: 'Royal Air Maroc',
        baggageAllowance: 'Cabine 10 kg + 1 à 2 bagages de 23 kg en soute selon billet.',
        paidHoldBaggage: false,
    },
    SV: {
        code: 'SV',
        name: 'Saudia',
        baggageAllowance: 'Cabine 8 kg + soute 23 kg.',
        paidHoldBaggage: false,
    },
    ET: {
        code: 'ET',
        name: 'Ethiopian Airlines',
        baggageAllowance: 'Cabine 7 kg + 2 × 23 kg en soute.',
        paidHoldBaggage: false,
    },
};

export const FRATERNITE_DEPARTURES: FraterniteDeparture[] = [
    {
        country: 'France',
        city: 'Lyon',
        iata: 'LYS',
        basePriceEur: 1195,
        airlineCode: 'RJ',
        stopover: 'Amman',
        outboundDep: '15h25',
        outboundArr: '03h45 +1',
        outboundLayover: '3h50',
        outboundDuration: '10h20',
        returnDep: '07h20',
        returnArr: '14h25',
        returnLayover: '2h10',
        returnDuration: '9h05',
    },
    {
        country: 'France',
        city: 'Paris',
        iata: 'CDG',
        basePriceEur: 1195,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '17h40',
        outboundArr: '05h20 +1',
        outboundLayover: '2h10',
        outboundDuration: '9h40',
        returnDep: '13h50',
        returnArr: '22h35',
        returnLayover: '2h45',
        returnDuration: '10h45',
    },
    {
        country: 'France',
        city: 'Toulouse',
        iata: 'TLS',
        basePriceEur: 1295,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '11h05',
        outboundArr: '01h00 +1',
        outboundLayover: '4h30',
        outboundDuration: '11h55',
        returnDep: '02h25',
        returnArr: '10h10',
        returnLayover: '2h',
        returnDuration: '9h45',
    },
    {
        country: 'France',
        city: 'Marseille',
        iata: 'MRS',
        basePriceEur: 1195,
        airlineCode: 'XY',
        stopover: 'Direct',
        outboundDep: '23h15',
        outboundArr: '06h35 +1',
        outboundLayover: '—',
        outboundDuration: '5h20',
        returnDep: '18h10',
        returnArr: '22h25',
        returnLayover: '—',
        returnDuration: '6h15',
    },
    {
        country: 'France',
        city: 'Bordeaux',
        iata: 'BOD',
        basePriceEur: 1395,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '18h10',
        outboundArr: '05h20 +1',
        outboundLayover: '1h30',
        outboundDuration: '9h10',
        returnDep: '08h15',
        returnArr: '17h15',
        returnLayover: '2h55',
        returnDuration: '11h',
    },
    {
        country: 'France',
        city: 'Nice',
        iata: 'NCE',
        basePriceEur: 1195,
        airlineCode: 'PC',
        stopover: 'Istanbul SAW',
        outboundDep: '13h55',
        outboundArr: '04h10 +1',
        outboundLayover: '5h40',
        outboundDuration: '12h15',
        returnDep: '05h30',
        returnArr: '12h50',
        returnLayover: '2h10',
        returnDuration: '9h20',
        specialNote: 'Conditions de correspondance à vérifier (alerte sur la recherche initiale).',
    },
    {
        country: 'Espagne',
        city: 'Barcelone',
        iata: 'BCN',
        basePriceEur: 1195,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '05h55',
        outboundArr: '19h10',
        outboundLayover: '3h50',
        outboundDuration: '11h15',
        returnDep: '14h35',
        returnArr: '23h50',
        returnLayover: '3h10',
        returnDuration: '11h15',
    },
    {
        country: 'Espagne',
        city: 'Madrid',
        iata: 'MAD',
        basePriceEur: 1195,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '17h55',
        outboundArr: '05h20 +1',
        outboundLayover: '1h20',
        outboundDuration: '9h25',
        returnDep: '13h50',
        returnArr: '23h35',
        returnLayover: '2h50',
        returnDuration: '11h45',
    },
    {
        country: 'Espagne',
        city: 'Malaga',
        iata: 'AGP',
        basePriceEur: 1295,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '12h10',
        outboundArr: '01h00 +1',
        outboundLayover: '2h45',
        outboundDuration: '10h50',
        returnDep: '02h25',
        returnArr: '11h10',
        returnLayover: '2h',
        returnDuration: '10h45',
    },
    {
        country: 'Italie',
        city: 'Rome',
        iata: 'FCO',
        basePriceEur: 1195,
        airlineCode: 'QR',
        stopover: 'Doha',
        outboundDep: '08h55',
        outboundArr: '20h35',
        outboundLayover: '1h50',
        outboundDuration: '9h40',
        returnDep: '05h10',
        returnArr: '13h30',
        returnLayover: '2h',
        returnDuration: '10h20',
    },
    {
        country: 'Italie',
        city: 'Milan',
        iata: 'MXP',
        basePriceEur: 1195,
        airlineCode: 'QR',
        stopover: 'Doha',
        outboundDep: '22h25',
        outboundArr: '11h00 +1',
        outboundLayover: '2h10',
        outboundDuration: '10h35',
        returnDep: '11h35',
        returnArr: '20h05',
        returnLayover: '2h',
        returnDuration: '10h30',
    },
    {
        country: 'Belgique',
        city: 'Bruxelles',
        iata: 'BRU',
        basePriceEur: 1295, // Tarif officiel validé : 1 295 €
        airlineCode: 'XY',
        stopover: 'Direct',
        outboundDep: '09h20',
        outboundArr: '17h15',
        outboundLayover: '—',
        outboundDuration: '5h55',
        returnDep: '03h40',
        returnArr: '08h25',
        returnLayover: '—',
        returnDuration: '6h45',
    },
    {
        country: 'Belgique',
        city: 'Charleroi',
        iata: 'CRL',
        basePriceEur: 1195,
        airlineCode: 'PC',
        stopover: 'Istanbul SAW',
        outboundDep: '15h00',
        outboundArr: '04h10 +1',
        outboundLayover: '4h10',
        outboundDuration: '11h10',
        returnDep: '05h30',
        returnArr: '13h55',
        returnLayover: '2h55',
        returnDuration: '10h25',
    },
    {
        country: 'Maroc',
        city: 'Casablanca',
        iata: 'CMN',
        basePriceEur: 1395,
        airlineCode: 'AT',
        stopover: 'Direct',
        outboundDep: '03h50',
        outboundArr: '13h00',
        outboundLayover: '—',
        outboundDuration: '6h10',
        returnDep: '15h00',
        returnArr: '19h10',
        returnLayover: '—',
        returnDuration: '7h10',
    },
    {
        country: 'Algérie',
        city: 'Alger',
        iata: 'ALG',
        basePriceEur: 1295,
        airlineCode: 'SV',
        stopover: 'Direct',
        outboundDep: '15h30',
        outboundArr: '22h20',
        outboundLayover: '—',
        outboundDuration: '4h50',
        returnDep: '10h20',
        returnArr: '14h05',
        returnLayover: '—',
        returnDuration: '5h45',
    },
    {
        country: 'Tunisie',
        city: 'Tunis',
        iata: 'TUN',
        basePriceEur: 1195,
        airlineCode: 'SV',
        stopover: 'Direct',
        outboundDep: '11h40',
        outboundArr: '17h55',
        outboundLayover: '—',
        outboundDuration: '4h15',
        returnDep: '06h25',
        returnArr: '09h30',
        returnLayover: '—',
        returnDuration: '5h05',
    },
    {
        country: 'Sénégal',
        city: 'Dakar',
        iata: 'DSS',
        basePriceEur: 2095,
        airlineCode: 'AT',
        stopover: 'Casablanca',
        outboundDep: '20h00',
        outboundArr: '13h00 +1',
        outboundLayover: '4h40',
        outboundDuration: '14h',
        returnDep: '15h00',
        returnArr: '01h05 +1',
        returnLayover: '2h35',
        returnDuration: '13h05',
    },
    {
        country: 'Côte d’Ivoire',
        city: 'Abidjan',
        iata: 'ABJ',
        basePriceEur: 1895,
        airlineCode: 'ET',
        stopover: 'Addis-Abeba',
        outboundDep: '11h00',
        outboundArr: '02h40 +1',
        outboundLayover: '4h10',
        outboundDuration: '12h40',
        returnDep: '04h40',
        returnArr: '12h00',
        returnLayover: '1h50',
        returnDuration: '10h20',
    },
    {
        country: 'Canada',
        city: 'Montréal',
        iata: 'YUL',
        basePriceEur: 1795,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '19h55',
        outboundArr: '19h10 +1',
        outboundLayover: '1h55',
        outboundDuration: '15h15',
        returnDep: '06h35',
        returnArr: '18h00',
        returnLayover: '5h',
        returnDuration: '19h25',
    },
    {
        country: 'États-Unis',
        city: 'Chicago',
        iata: 'ORD',
        basePriceEur: 1295,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '11h45',
        outboundArr: '12h50 +1',
        outboundLayover: '1h50',
        outboundDuration: '16h05',
        returnDep: '02h25',
        returnArr: '10h00',
        returnLayover: '1h05',
        returnDuration: '16h35',
    },
    {
        country: 'États-Unis',
        city: 'New York',
        iata: 'JFK',
        basePriceEur: 1395,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '12h50',
        outboundArr: '12h50 +1',
        outboundLayover: '2h35',
        outboundDuration: '16h',
        returnDep: '08h15',
        returnArr: '18h20',
        returnLayover: '2h55',
        returnDuration: '18h05',
    },
    {
        country: 'Royaume-Uni',
        city: 'Londres Stansted',
        iata: 'STN',
        basePriceEur: 1195,
        airlineCode: 'PC',
        stopover: 'Istanbul SAW',
        outboundDep: '15h40',
        outboundArr: '04h10 +1',
        outboundLayover: '2h05',
        outboundDuration: '9h30',
        returnDep: '05h30',
        returnArr: '12h10',
        returnLayover: '1h40',
        returnDuration: '9h40',
    },
    {
        country: 'Pays-Bas',
        city: 'Amsterdam',
        iata: 'AMS',
        basePriceEur: 1195,
        airlineCode: 'TK',
        stopover: 'Istanbul IST',
        outboundDep: '18h30',
        outboundArr: '05h20 +1',
        outboundLayover: '1h30',
        outboundDuration: '8h50',
        returnDep: '08h15',
        returnArr: '17h05',
        returnLayover: '3h',
        returnDuration: '10h50',
    },
];

export const FRATERNITE_PROGRAM_STEPS = [
    {
        step: '01 · Makkah',
        dates: '27 janvier → 4 février',
        nightsBadge: '8 nuits réservées',
        hotel: 'M Makkah by Millennium ★★★★',
        description: 'Navette vers le Haram. Première Omra pendant Chaabane. Joumouaa du 29 janvier.',
    },
    {
        step: '02 · Médine',
        dates: '4 → 7 février',
        nightsBadge: '3 nuits',
        hotel: 'Zaha Taiba ★★★',
        description: 'Visites religieuses : Quba, Uhud, palmeraie et cours selon programme. Joumouaa du 5 février.',
    },
    {
        step: '03 · Makkah',
        dates: '7 → 10 février',
        nightsBadge: '3 nuits réservées',
        hotel: 'Verta Hotel – Mahbas Al Jinn',
        description: 'À environ 200 m de la mosquée Qatari. Deuxième Omra pendant Ramadan*, premières Tarawih.',
    },
] as const;

export const FRATERNITE_INCLUDED_TILES = [
    { title: 'Billets aller-retour', subtitle: 'Compagnie selon départ' },
    { title: 'Visa Omra', subtitle: 'Selon formule et passeport' },
    { title: '14 nuits réservées', subtitle: 'Trois hôtels' },
    { title: 'Transferts aéroport', subtitle: 'Aller-retour' },
    { title: 'Transferts interurbains', subtitle: 'Makkah – Médine – Makkah' },
    { title: 'Visites religieuses', subtitle: 'À Médine' },
    { title: 'Organisation de deux Omras', subtitle: 'Chaabane puis Ramadan*' },
    { title: 'Accompagnement', subtitle: 'Assistance Omrayanair' },
] as const;

export const FRATERNITE_FAQS = [
    {
        question: 'Le visa est-il inclus ?',
        answer: 'Casablanca sans visa, Tunis avec visa. Autres départs selon éligibilité et confirmation.',
    },
    {
        question: 'Comment confirmer ma réservation ?',
        answer: 'Remplissez ce formulaire : votre demande est enregistrée auprès de notre équipe Conciergerie et s’ouvre simultanément sur WhatsApp (+33 7 52 28 08 90). L’équipe vous confirme le tarif final, les places et les modalités.',
    },
    {
        question: 'Comment mes informations sont-elles traitées ?',
        answer: 'Vos informations sont transmises de manière sécurisée à l’espace Conciergerie OMRAYANAIR uniquement pour l’étude de votre préinscription, puis pré-remplies dans WhatsApp. Aucun paiement en ligne n’est demandé à cette étape ; vous disposez d’un droit d’accès, de rectification et de suppression sur simple demande.',
    },
] as const;

export function formatEur(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function isPaidHoldBaggage(departure: FraterniteDeparture): boolean {
    return FRATERNITE_AIRLINES[departure.airlineCode].paidHoldBaggage;
}

export function getVisaRuleLabel(iata: string): string {
    if (iata === 'CMN') return 'Visa non inclus';
    if (iata === 'TUN') return 'Visa inclus';
    return 'Visa selon éligibilité et confirmation';
}

export function normalizeSearchText(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export function getFraterniteCountries(): string[] {
    return Array.from(new Set(FRATERNITE_DEPARTURES.map((d) => d.country)));
}

export function findFraterniteDeparture(iata: string): FraterniteDeparture | undefined {
    return FRATERNITE_DEPARTURES.find((d) => d.iata === iata.toUpperCase());
}

export function filterFraterniteDepartures(searchQuery: string, countryFilter: string): FraterniteDeparture[] {
    const q = normalizeSearchText(searchQuery.trim());
    return FRATERNITE_DEPARTURES.filter((d) => {
        if (countryFilter && d.country !== countryFilter) return false;
        if (!q) return true;
        const airlineName = FRATERNITE_AIRLINES[d.airlineCode].name;
        const haystack = normalizeSearchText(`${d.country} ${d.city} ${d.iata} ${airlineName}`);
        return haystack.includes(q);
    });
}

export interface FraterniteQuoteInput {
    airportIata: string;
    roomType: FraterniteRoomType;
    pilgrimsCount: number;
    breakfast: boolean;
}

export interface FraterniteQuoteResult {
    departure: FraterniteDeparture;
    airline: FraterniteAirline;
    pilgrimsCount: number;
    perPersonEur: number;
    totalEur: number;
    validCount: boolean;
    paidHoldBaggage: boolean;
    visaRule: string;
}

export function calculateFraterniteQuote(input: FraterniteQuoteInput): FraterniteQuoteResult {
    const departure = findFraterniteDeparture(input.airportIata) || FRATERNITE_DEPARTURES[0];
    const airline = FRATERNITE_AIRLINES[departure.airlineCode];
    const roomSupplement = FRATERNITE_ROOM_OPTIONS[input.roomType]?.supplementEur ?? 0;
    const breakfastSupplement = input.breakfast ? FRATERNITE_BREAKFAST_SUPPLEMENT_EUR : 0;
    const perPersonEur = departure.basePriceEur + roomSupplement + breakfastSupplement;
    const validCount = Number.isInteger(input.pilgrimsCount) && input.pilgrimsCount >= 1 && input.pilgrimsCount <= 30;
    const totalEur = validCount ? perPersonEur * input.pilgrimsCount : 0;

    return {
        departure,
        airline,
        pilgrimsCount: input.pilgrimsCount,
        perPersonEur,
        totalEur,
        validCount,
        paidHoldBaggage: airline.paidHoldBaggage,
        visaRule: getVisaRuleLabel(departure.iata),
    };
}

export const FraterniteSubmissionSchema = z.object({
    airportIata: z.string().trim().min(3).max(3).refine((code) => Boolean(findFraterniteDeparture(code)), {
        message: 'Aéroport de départ invalide.',
    }),
    roomType: z.enum(['QUADRUPLE', 'TRIPLE', 'DOUBLE']),
    pilgrimsCount: z.number().int().min(1, 'Minimum 1 pèlerin.').max(30, 'Maximum 30 pèlerins par demande.'),
    breakfast: z.boolean(),
    extraBaggage: z.boolean(),
    gender: z.enum(['M', 'F']),
    firstName: z.string().trim().min(1, 'Le prénom est obligatoire.').max(80),
    familyName: z.string().trim().min(1, 'Le nom est obligatoire.').max(80),
    phone: z.string().trim().min(6, 'Le numéro Téléphone / WhatsApp est obligatoire.').max(40),
    email: z
        .string()
        .trim()
        .max(120)
        .optional()
        .or(z.literal(''))
        .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
            message: 'Adresse e-mail invalide.',
        }),
    nationality: z.string().trim().min(2, 'La nationalité du passeport est obligatoire.').max(80),
    visaSituation: z.enum(['À vérifier / à obtenir', 'Visa déjà détenu']),
    remarks: z.string().trim().max(500).optional().or(z.literal('')),
    consent: z.literal(true, {
        message: 'Veuillez accepter le traitement de votre demande pour continuer.',
    }),
    website: z.string().max(0).optional().or(z.literal('')), // Honeypot anti-spam
});

export type FraterniteSubmissionInput = z.infer<typeof FraterniteSubmissionSchema>;

export function buildFraterniteWhatsAppMessage(input: FraterniteSubmissionInput): string {
    const quote = calculateFraterniteQuote({
        airportIata: input.airportIata,
        roomType: input.roomType,
        pilgrimsCount: input.pilgrimsCount,
        breakfast: input.breakfast,
    });
    const d = quote.departure;
    const roomLabel = FRATERNITE_ROOM_OPTIONS[input.roomType].shortLabel;

    const outboundStopInfo = d.stopover === 'Direct' ? 'Direct' : `${d.stopover} ${d.outboundLayover}`;
    const returnStopInfo = d.stopover === 'Direct' ? 'Direct' : `${d.stopover} ${d.returnLayover}`;

    const baggageLine = quote.paidHoldBaggage
        ? `Soute en supplément : ${input.extraBaggage ? 'Souhaitée, devis à confirmer' : 'Non demandée'}`
        : `Bagages : ${quote.airline.baggageAllowance}`;

    return [
        'السلام عليكم ورحمة الله وبركاته',
        'Bonjour, je souhaite me préinscrire à l’Omra de la Fraternité Musulmane (27 janvier – 10 février 2027).',
        `Nom : ${input.familyName.trim()} ${input.firstName.trim()}`,
        `Téléphone : ${input.phone.trim()}`,
        input.email?.trim() ? `E-mail : ${input.email.trim()}` : '',
        `Nationalité du passeport : ${input.nationality.trim()}`,
        `Visa : ${input.visaSituation} — ${quote.visaRule}`,
        `Départ : ${d.city} (${d.iata})`,
        `Compagnie : ${quote.airline.name}`,
        `Aller : 27/01 ${d.outboundDep} → JED ${d.outboundArr} ; ${outboundStopInfo}`,
        `Retour : 10/02 JED ${d.returnDep} → ${d.iata} ${d.returnArr} ; ${returnStopInfo}`,
        `Nombre de pèlerins : ${quote.pilgrimsCount}`,
        `Chambre : ${roomLabel}`,
        `Petit-déjeuner : ${input.breakfast ? 'Oui' : 'Non'}`,
        baggageLine,
        `Tarif indicatif par personne : ${formatEur(quote.perPersonEur)}`,
        `Total indicatif : ${formatEur(quote.totalEur)} (hors frais non chiffrés)`,
        input.remarks?.trim() ? `Précisions : ${input.remarks.trim()}` : '',
        'Merci de me confirmer les disponibilités, le prix final et les modalités.',
    ]
        .filter(Boolean)
        .join('\n');
}

export function buildFraterniteWhatsAppUrl(input: FraterniteSubmissionInput): string {
    const message = buildFraterniteWhatsAppMessage(input);
    return `https://wa.me/${FRATERNITE_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function buildFraterniteBackofficeMessage(input: FraterniteSubmissionInput): string {
    const quote = calculateFraterniteQuote({
        airportIata: input.airportIata,
        roomType: input.roomType,
        pilgrimsCount: input.pilgrimsCount,
        breakfast: input.breakfast,
    });
    const d = quote.departure;
    const roomLabel = FRATERNITE_ROOM_OPTIONS[input.roomType].shortLabel;
    const baggageInfo = quote.paidHoldBaggage
        ? `Soute suppl. : ${input.extraBaggage ? 'Souhaitée (à chiffrer)' : 'Non demandée'}`
        : `Bagages inclus selon cie`;

    const lines = [
        `🌍 [OFFRE PROMO : OMRA DE LA FRATERNITÉ MUSULMANE • 27/01–10/02/2027]`,
        `✈️ Départ : ${d.city} (${d.iata}) — ${quote.airline.name} (${d.stopover === 'Direct' ? 'Vol direct' : `Escale ${d.stopover}`})`,
        `👥 Pèlerins : ${quote.pilgrimsCount} | Chambre : ${roomLabel} | Petit-déj : ${input.breakfast ? 'Oui (+150€/pers.)' : 'Non'}`,
        `🧳 ${baggageInfo}`,
        `🛂 Passeport : ${input.nationality.trim()} | Visa : ${input.visaSituation} (${quote.visaRule})`,
        `💶 Devis indicatif : ${formatEur(quote.perPersonEur)} / pers. — Total estimé : ${formatEur(quote.totalEur)}`,
    ];

    if (input.remarks?.trim()) {
        lines.push(`📝 Précisions : ${input.remarks.trim()}`);
    }

    return lines.join('\n');
}
