'use server';

import { createClient } from '@/utils/supabase/server';
import { isAdminAuthenticated } from './auth';
import { revalidatePath } from 'next/cache';

export interface FlyerOffer {
    id: string;
    title: string;
    airport: string;
    dates: string;
    price: string;
    imageUrl: string;
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

// In-memory fallback cache to allow smooth operations even if DB table migration is pending
let localFlyersStore: FlyerOffer[] = [...SEED_FLYERS];

/**
 * Récupère tous les flyers actifs pour affichage public dans le carrousel 3D
 */
export async function getPublicFlyers(): Promise<FlyerOffer[]> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('promotional_flyers')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            return data.map((d: any) => ({
                id: d.id,
                title: d.title,
                airport: d.airport,
                dates: d.dates,
                price: d.price,
                imageUrl: d.image_url,
                badge: d.badge || undefined,
                isActive: d.is_active,
                createdAt: d.created_at,
                description: d.description || undefined
            }));
        }
    } catch {
        // Fallback to in-memory store
    }
    return localFlyersStore.filter(f => f.isActive);
}

/**
 * Récupère l'ensemble des flyers pour l'administration (actifs et inactifs)
 */
export async function getAllFlyersAdmin(): Promise<FlyerOffer[]> {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        throw new Error("Non autorisé : accès réservé aux administrateurs.");
    }

    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('promotional_flyers')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            return data.map((d: any) => ({
                id: d.id,
                title: d.title,
                airport: d.airport,
                dates: d.dates,
                price: d.price,
                imageUrl: d.image_url,
                badge: d.badge || undefined,
                isActive: d.is_active,
                createdAt: d.created_at,
                description: d.description || undefined
            }));
        }
    } catch {
        // Fallback to in-memory store
    }
    return localFlyersStore;
}

/**
 * Récupère un flyer par son ID (pour page publique et OpenGraph)
 */
export async function getFlyerById(id: string): Promise<FlyerOffer | null> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('promotional_flyers')
            .select('*')
            .eq('id', id)
            .single();

        if (!error && data) {
            return {
                id: data.id,
                title: data.title,
                airport: data.airport,
                dates: data.dates,
                price: data.price,
                imageUrl: data.image_url,
                badge: data.badge || undefined,
                isActive: data.is_active,
                createdAt: data.created_at,
                description: data.description || undefined
            };
        }
    } catch {
        // Fallback
    }

    const found = localFlyersStore.find(f => f.id === id);
    return found || null;
}

/**
 * Création d'un nouveau flyer par l'administrateur
 */
export async function createFlyerAction(data: {
    title: string;
    airport: string;
    dates: string;
    price: string;
    imageUrl: string;
    badge?: string;
    description?: string;
}) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    if (!data.title || !data.airport || !data.dates || !data.price || !data.imageUrl) {
        return { error: "Veuillez renseigner tous les champs obligatoires (Titre, Aéroport, Dates, Tarif, Image)." };
    }

    const slugId = 'flyer-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newFlyer: FlyerOffer = {
        id: slugId,
        title: data.title.trim(),
        airport: data.airport.trim(),
        dates: data.dates.trim(),
        price: data.price.trim(),
        imageUrl: data.imageUrl.trim(),
        badge: data.badge ? data.badge.trim() : 'NOUVELLE OFFRE',
        isActive: true,
        createdAt: new Date().toISOString(),
        description: data.description ? data.description.trim() : undefined
    };

    try {
        const supabase = createClient();
        const { error } = await supabase
            .from('promotional_flyers')
            .insert({
                id: newFlyer.id,
                title: newFlyer.title,
                airport: newFlyer.airport,
                dates: newFlyer.dates,
                price: newFlyer.price,
                image_url: newFlyer.imageUrl,
                badge: newFlyer.badge,
                is_active: true,
                description: newFlyer.description
            });

        if (error) {
            console.warn("DB insert error for flyer, using memory store:", error.message);
        }
    } catch (e) {
        console.warn("Supabase error for flyer insert:", e);
    }

    // Always update local cache
    localFlyersStore = [newFlyer, ...localFlyersStore];

    revalidatePath('/');
    revalidatePath('/backoffice/flyers');
    return { success: true, flyer: newFlyer };
}

/**
 * Active / désactive un flyer
 */
export async function toggleFlyerActiveAction(id: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    try {
        const supabase = createClient();
        const existing = localFlyersStore.find(f => f.id === id);
        const newStatus = existing ? !existing.isActive : false;

        await supabase
            .from('promotional_flyers')
            .update({ is_active: newStatus })
            .eq('id', id);
    } catch {
        // Continue
    }

    localFlyersStore = localFlyersStore.map(f => {
        if (f.id === id) {
            return { ...f, isActive: !f.isActive };
        }
        return f;
    });

    revalidatePath('/');
    revalidatePath('/backoffice/flyers');
    return { success: true };
}

/**
 * Suppression d'un flyer
 */
export async function deleteFlyerAction(id: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    try {
        const supabase = createClient();
        await supabase
            .from('promotional_flyers')
            .delete()
            .eq('id', id);
    } catch {
        // Continue
    }

    localFlyersStore = localFlyersStore.filter(f => f.id !== id);

    revalidatePath('/');
    revalidatePath('/backoffice/flyers');
    return { success: true };
}

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
        // Alternative numérique: 08/12 au 15/12
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
