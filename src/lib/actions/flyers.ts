'use server';

import { createClient } from '@/utils/supabase/server';
import { isAdminAuthenticated } from './auth';
import { revalidatePath } from 'next/cache';
import { FlyerOffer, SEED_FLYERS, extractFlyerInfoFromText } from '@/lib/utils/flyers';

export type { FlyerOffer };

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
 * Server Action pour extraire les informations d'un flyer
 */
export async function extractFlyerInfoAction(rawText: string) {
    return extractFlyerInfoFromText(rawText);
}
