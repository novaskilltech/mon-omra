'use server';

// Google Flights integration using SerpApi
// Recalculates package prices depending on duration rules:
// - 1 week (base: 540 €, standard: 890 €). Limit threshold: 890 €.
// - 2 weeks (base: 650 €, standard: 1090 €). Limit threshold: 1090 €.
// - 9 to 11 nights (base: 650 €, standard: 990 €). Limit threshold: 990 €.

interface FlightSearchParameters {
    departureAirport: string;
    departureDate: string; // YYYY-MM-DD
}

interface PriceAdjustmentResult {
    originalPrice: number;
    adjustedPrice: number;
    ticketPrice: number;
    durationDays: number;
    appliedFormula: string;
    isAdjusted: boolean;
}

/**
 * Calculates duration in days/nights between departure date and return date.
 * If group name contains duration details or return date isn't set, parses from metadata or defaults to 14.
 */
function getDurationDays(groupName: string): number {
    const normalized = groupName.toLowerCase();
    
    // Parse from name, e.g. "9 nuits", "10 nuits", "11 nuits"
    const matchNights = normalized.match(/(\d+)\s*nuit/);
    if (matchNights) {
        return parseInt(matchNights[1], 10);
    }

    if (normalized.includes("une semaine") || normalized.includes("1 semaine") || normalized.includes(" 7 nuits") || normalized.includes(" 8 nuits")) {
        return 7;
    }
    if (normalized.includes("deux semaines") || normalized.includes("2 semaines") || normalized.includes("14 nuits") || normalized.includes("15 nuits")) {
        return 14;
    }

    // Default to 14 if undetermined
    return 14;
}

/**
 * Fetches real-time flight ticket price from SerpApi or falls back to live estimation.
 */
async function fetchFlightPrice(params: FlightSearchParameters): Promise<number> {
    const apiKey = process.env.SERPAPI_KEY || 'b077c878470758906378e01001c15d9f96c2d384dface81e8a9d9d73c2796df4';
    const departure = params.departureAirport.toUpperCase();
    const date = params.departureDate;

    // Mapping departure airport to standard codes (ORY for Paris flights)
    let depCode = 'ORY';
    if (departure.includes('LYON') || departure === 'LYS') depCode = 'LYS';
    else if (departure.includes('MARSEILLE') || departure === 'MRS') depCode = 'MRS';
    else if (departure.includes('BRUXELLES') || departure === 'BRU') depCode = 'BRU';
    else if (departure.includes('NICE') || departure === 'NCE') depCode = 'NCE';
    else if (departure.includes('TOULOUSE') || departure === 'TLS') depCode = 'TLS';

    try {
        const queryUrl = `https://serpapi.com/search.json?engine=google_flights&departure_id=${depCode}&arrival_id=JED&outbound_date=${date}&currency=EUR&hl=fr&gl=fr&api_key=${apiKey}`;
        const response = await fetch(queryUrl, { next: { revalidate: 3600 } }); // Cache results for 1 hour
        if (!response.ok) throw new Error("API response error");
        
        const data = await response.json();
        
        // Try getting price from best flights
        if (data.best_flights && data.best_flights.length > 0) {
            const bestFlight = data.best_flights[0];
            if (bestFlight.price) {
                return Number(bestFlight.price);
            }
        }
        
        // Try other flights if best_flights not present
        if (data.other_flights && data.other_flights.length > 0) {
            const flight = data.other_flights[0];
            if (flight.price) {
                return Number(flight.price);
            }
        }
    } catch (e) {
        console.warn("SerpApi search failed or key limit hit. Falling back to dynamic estimation.", e);
    }

    // Dynamic fallback simulation based on departure city and typical rates
    let baseTicketPrice = 380; // Standard ticket cost
    if (depCode === 'LYS' || depCode === 'MRS') baseTicketPrice = 430;
    if (depCode === 'NCE' || depCode === 'TLS') baseTicketPrice = 450;
    
    // Add seasonal variations depending on month
    if (date) {
        const month = new Date(date).getMonth();
        if ([6, 7, 11].includes(month)) { // Summer & December peaks
            baseTicketPrice += 150;
        }
    }

    return baseTicketPrice;
}

export async function calculateAdjustedGroupPrice(
    groupName: string,
    departureAirport: string,
    departureDate: string,
    fallbackPrice: number
): Promise<PriceAdjustmentResult> {
    try {
        const ticketPrice = await fetchFlightPrice({
            departureAirport,
            departureDate: departureDate ? departureDate.split('T')[0] : new Date().toISOString().split('T')[0]
        });

        const durationDays = getDurationDays(groupName);
        let baseNoFlightPrice = 650;
        let limitThreshold = 990;
        let appliedFormula = "9-11 Nuits (Base 650 €, Seuil 990 €)";

        if (durationDays === 7) {
            baseNoFlightPrice = 540;
            limitThreshold = 890;
            appliedFormula = "1 Semaine (Base 540 €, Seuil 890 €)";
        } else if (durationDays === 14) {
            baseNoFlightPrice = 650;
            limitThreshold = 1090;
            appliedFormula = "2 Semaines (Base 650 €, Seuil 1090 €)";
        } else if (durationDays > 10) {
            const extraDays = durationDays - 10;
            baseNoFlightPrice = 650 + (extraDays * 10);
            limitThreshold = 990 + (extraDays * 10);
            appliedFormula = `${durationDays} Nuits (Base ${baseNoFlightPrice} €, Seuil ${limitThreshold} €)`;
        } else if (durationDays >= 9 && durationDays <= 10) {
            baseNoFlightPrice = 650;
            limitThreshold = 990;
            appliedFormula = "9-10 Nuits (Base 650 €, Seuil 990 €)";
        }

        const calculatedTotal = baseNoFlightPrice + ticketPrice;
        const finalPrice = calculatedTotal > limitThreshold ? calculatedTotal : limitThreshold;

        return {
            originalPrice: fallbackPrice || limitThreshold,
            adjustedPrice: finalPrice,
            ticketPrice,
            durationDays,
            appliedFormula,
            isAdjusted: finalPrice !== limitThreshold
        };
    } catch (error) {
        console.error("Error adjusting group price:", error);
        return {
            originalPrice: fallbackPrice,
            adjustedPrice: fallbackPrice,
            ticketPrice: 0,
            durationDays: 14,
            appliedFormula: "Error Fallback",
            isAdjusted: false
        };
    }
}
