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

/**
 * Analyse par IA Vision d'un flyer téléversé (PNG, JPG, WebP)
 * Sauvegarde l'image et extrait automatiquement les champs du flyer (Titre, Aéroport, Dates, Tarif)
 */
export async function analyzeFlyerImageWithAiAction(formData: FormData): Promise<{
    success: boolean;
    imageUrl?: string;
    extracted?: {
        title: string;
        airport: string;
        dates: string;
        price: string;
        badge?: string;
        description?: string;
    };
    error?: string;
}> {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { success: false, error: "Non autorisé : accès réservé à l'administrateur." };

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: "Veuillez sélectionner une image de flyer." };

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${base64}`;

        // 1. Sauvegarde locale du fichier image dans public/uploads/flyers/
        const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
        const fileName = `flyer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const relativePath = `/uploads/flyers/${fileName}`;

        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const targetDir = path.join(process.cwd(), 'public', 'uploads', 'flyers');
            await fs.mkdir(targetDir, { recursive: true });
            await fs.writeFile(path.join(targetDir, fileName), buffer);
        } catch (fsErr) {
            console.warn("Could not write flyer file to public uploads:", fsErr);
        }

        // 2. Appel IA Vision via OpenRouter (google/gemini-3.8-flash)
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        let extractedData = {
            title: 'OMRA CONFORT',
            airport: 'Lyon Saint-Exupéry (LYS)',
            dates: 'Dates sur flyer',
            price: 'Tarif sur demande',
            badge: 'OFFRE FLASH',
            description: ''
        };

        if (openRouterKey) {
            try {
                const prompt = `Tu es un assistant IA spécialisé dans l'analyse de flyers publicitaires pour agence de voyage Omra et Hajj (OMRAYANAIR).
Lis attentivement le flyer fourni et extrait précisément les éléments suivants au format JSON strict (aucun texte avant ou après) :
{
  "title": "Titre exact de l'offre (ex: OMRA CONFORT, OMRA VACANCES D'HIVER, etc.)",
  "airport": "Aéroport de départ (ex: Lyon Saint-Exupéry (LYS), Paris-Orly (ORY), Marseille-Provence (MRS), Mulhouse, etc.)",
  "dates": "Dates du séjour (ex: 08 au 15 Décembre 2026)",
  "price": "Tarif par personne avec devise (ex: 1 290 €)",
  "badge": "Court badge marketing (ex: PLACES LIMITÉES, SÉLECTION PRIVILÈGE, OFFRE FLASH)",
  "description": "Courte description des prestations incluses (hôtels, vols, transferts)"
}`;

                const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openRouterKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'google/gemini-3.8-flash',
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: prompt },
                                    { type: 'image_url', image_url: { url: dataUri } }
                                ]
                            }
                        ]
                    })
                });

                if (aiRes.ok) {
                    const aiJson = await aiRes.json();
                    const rawContent = aiJson.choices?.[0]?.message?.content || '';
                    const jsonClean = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(jsonClean);
                    if (parsed.title) extractedData.title = parsed.title;
                    if (parsed.airport) extractedData.airport = parsed.airport;
                    if (parsed.dates) extractedData.dates = parsed.dates;
                    if (parsed.price) extractedData.price = parsed.price;
                    if (parsed.badge) extractedData.badge = parsed.badge;
                    if (parsed.description) extractedData.description = parsed.description;
                }
            } catch (aiErr) {
                console.warn("AI Vision flyer extraction failed:", aiErr);
            }
        }

        return {
            success: true,
            imageUrl: relativePath,
            extracted: extractedData
        };

    } catch (err: any) {
        console.error("Error analyzing flyer image:", err);
        return { success: false, error: err.message || "Erreur lors de l'analyse du flyer." };
    }
}

