'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { isAdminAuthenticated } from './auth';
import { revalidatePath } from 'next/cache';
import { FlyerOffer, extractFlyerInfoFromText } from '@/lib/utils/flyers';

export type { FlyerOffer };

const FLYERS_BUCKET = 'public-flyers';
const SNAPSHOTS_FOLDER = 'snapshots';
const IMAGES_FOLDER = 'images';

// Uniquement utilisé en environnement de test unitaire si Supabase Storage est mocké
let testMemoryStore: FlyerOffer[] = [];

/**
 * S'assure que le bucket public-flyers existe dans Supabase Storage
 */
async function ensureFlyersBucket(supabaseAdmin: any) {
    try {
        if (!supabaseAdmin?.storage?.createBucket) return;
        await supabaseAdmin.storage.createBucket(FLYERS_BUCKET, { public: true });
    } catch {
        // Ignore si le bucket existe déjà
    }
}

/**
 * Lit la liste persistante des flyers depuis Supabase Storage (snapshots immuables anti-cache CDN)
 */
async function readFlyersFromStorage(): Promise<FlyerOffer[]> {
    try {
        const supabaseAdmin = createAdminClient();
        if (!supabaseAdmin?.storage?.from) {
            return testMemoryStore;
        }

        const bucket = supabaseAdmin.storage.from(FLYERS_BUCKET);
        const { data: list, error: listErr } = await bucket.list(SNAPSHOTS_FOLDER, {
            sortBy: { column: 'name', order: 'desc' }
        });

        if (listErr) {
            // Si le bucket n'existe pas encore, on l'initialise et on retourne []
            await ensureFlyersBucket(supabaseAdmin);
            return [];
        }

        if (!list || list.length === 0) {
            return [];
        }

        // Prendre le snapshot le plus récent (trié par nom décroissant state-<timestamp>)
        const validFiles = list.filter((f: any) => f.name && f.name.startsWith('state-') && f.name.endsWith('.json'));
        if (validFiles.length === 0) {
            return [];
        }

        const latestFile = validFiles[0].name;
        const { data: blob, error: dlErr } = await bucket.download(`${SNAPSHOTS_FOLDER}/${latestFile}`);
        if (dlErr || !blob) {
            return [];
        }

        const rawText = await blob.text();
        const parsed = JSON.parse(rawText);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.warn('Fallback readFlyersFromStorage:', err);
        return testMemoryStore;
    }
}

/**
 * Écrit la liste persistante des flyers dans Supabase Storage avec un nom de snapshot unique
 * (garantit une cohérence immédiate lecture-après-écriture sans cache Cloudflare CDN)
 */
async function writeFlyersToStorage(flyers: FlyerOffer[]): Promise<boolean> {
    testMemoryStore = [...flyers];
    try {
        const supabaseAdmin = createAdminClient();
        if (!supabaseAdmin?.storage?.from) {
            return true;
        }

        await ensureFlyersBucket(supabaseAdmin);
        const bucket = supabaseAdmin.storage.from(FLYERS_BUCKET);

        const { data: existing } = await bucket.list(SNAPSHOTS_FOLDER);
        const snapshotName = `state-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.json`;
        const payload = Buffer.from(JSON.stringify(flyers, null, 2), 'utf-8');

        const { error: uploadErr } = await bucket.upload(`${SNAPSHOTS_FOLDER}/${snapshotName}`, payload, {
            contentType: 'application/json',
            upsert: true
        });

        if (uploadErr) {
            console.error('Failed to upload flyers snapshot:', uploadErr.message);
            return false;
        }

        // Nettoyage des anciens snapshots pour ne garder que le dernier
        if (existing && existing.length > 0) {
            const oldPaths = existing
                .filter((f: any) => f.name && f.name !== snapshotName)
                .map((f: any) => `${SNAPSHOTS_FOLDER}/${f.name}`);
            if (oldPaths.length > 0) {
                await bucket.remove(oldPaths);
            }
        }

        return true;
    } catch (err) {
        console.error('Error in writeFlyersToStorage:', err);
        return false;
    }
}

/**
 * Récupère tous les flyers actifs pour affichage public dans le carrousel 3D
 */
export async function getPublicFlyers(): Promise<FlyerOffer[]> {
    const all = await readFlyersFromStorage();
    return all.filter(f => f.isActive);
}

/**
 * Récupère l'ensemble des flyers pour l'administration (actifs et inactifs)
 */
export async function getAllFlyersAdmin(): Promise<FlyerOffer[]> {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        throw new Error("Non autorisé : accès réservé aux administrateurs.");
    }

    return await readFlyersFromStorage();
}

/**
 * Récupère un flyer par son ID (pour page publique et OpenGraph)
 */
export async function getFlyerById(id: string): Promise<FlyerOffer | null> {
    const all = await readFlyersFromStorage();
    const found = all.find(f => f.id === id);
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
    aspectRatio?: number;
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
        aspectRatio: data.aspectRatio && data.aspectRatio > 0 ? Number(data.aspectRatio.toFixed(4)) : undefined,
        badge: data.badge ? data.badge.trim() : 'NOUVELLE OFFRE',
        isActive: true,
        createdAt: new Date().toISOString(),
        description: data.description ? data.description.trim() : undefined
    };

    const current = await readFlyersFromStorage();
    const updated = [newFlyer, ...current];
    const ok = await writeFlyersToStorage(updated);

    if (!ok) {
        return { error: "Erreur lors de la sauvegarde persistante du flyer dans le stockage cloud." };
    }

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

    const current = await readFlyersFromStorage();
    const updated = current.map(f => {
        if (f.id === id) {
            return { ...f, isActive: !f.isActive };
        }
        return f;
    });

    await writeFlyersToStorage(updated);

    revalidatePath('/');
    revalidatePath('/backoffice/flyers');
    return { success: true };
}

/**
 * Suppression définitive d'un flyer et de son image associée dans Supabase Storage
 */
export async function deleteFlyerAction(id: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const current = await readFlyersFromStorage();
    const target = current.find(f => f.id === id);

    // Supprimer également le fichier image dans le bucket s'il y est hébergé
    if (target?.imageUrl && target.imageUrl.includes(`/${FLYERS_BUCKET}/${IMAGES_FOLDER}/`)) {
        try {
            const supabaseAdmin = createAdminClient();
            const fileName = target.imageUrl.split(`/${FLYERS_BUCKET}/${IMAGES_FOLDER}/`)[1];
            if (fileName && supabaseAdmin?.storage?.from) {
                await supabaseAdmin.storage.from(FLYERS_BUCKET).remove([`${IMAGES_FOLDER}/${fileName}`]);
            }
        } catch (e) {
            console.warn("Could not remove flyer image file from storage:", e);
        }
    }

    const updated = current.filter(f => f.id !== id);
    await writeFlyersToStorage(updated);

    revalidatePath('/');
    revalidatePath('/backoffice/flyers');
    return { success: true };
}

/**
 * Server Action pour extraire les informations d'un flyer depuis du texte
 */
export async function extractFlyerInfoAction(rawText: string) {
    return extractFlyerInfoFromText(rawText);
}

/**
 * Analyse par IA Vision d'un flyer téléversé (PNG, JPG, WebP)
 * Sauvegarde l'image de façon permanente dans Supabase Storage (bucket public-flyers)
 * et extrait automatiquement les champs du flyer (Titre, Aéroport, Dates, Tarif)
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

        // 1. Sauvegarde persistante du fichier image dans Supabase Storage (public-flyers)
        const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
        const fileName = `flyer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const storagePath = `${IMAGES_FOLDER}/${fileName}`;
        let finalImageUrl = `/uploads/flyers/${fileName}`;

        try {
            const supabaseAdmin = createAdminClient();
            if (supabaseAdmin?.storage?.from) {
                await ensureFlyersBucket(supabaseAdmin);
                const { error: uploadError } = await supabaseAdmin.storage
                    .from(FLYERS_BUCKET)
                    .upload(storagePath, buffer, {
                        contentType: mimeType,
                        upsert: true
                    });

                if (uploadError) {
                    console.error("Supabase storage upload error for flyer:", uploadError.message);
                    return { success: false, error: `Échec de l'hébergement de l'image : ${uploadError.message}` };
                }

                const { data: publicUrlData } = supabaseAdmin.storage
                    .from(FLYERS_BUCKET)
                    .getPublicUrl(storagePath);

                if (publicUrlData?.publicUrl) {
                    finalImageUrl = publicUrlData.publicUrl;
                }
            }
        } catch (storageErr: any) {
            console.error("Error uploading flyer to Supabase Storage:", storageErr);
            return { success: false, error: "Erreur lors de l'envoi de l'image sur le serveur cloud." };
        }

        // 2. Appel IA Vision via OpenRouter (google/gemini-3.8-flash avec fallback google/gemini-2.5-flash)
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const extractedData = {
            title: 'OMRA CONFORT',
            airport: 'Lyon Saint-Exupéry (LYS)',
            dates: 'Dates sur flyer',
            price: 'Tarif sur flyer',
            badge: 'OFFRE FLASH',
            description: ''
        };

        if (openRouterKey) {
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

            const modelsToTry = ['google/gemini-3.8-flash', 'google/gemini-2.5-flash', 'openai/gpt-4o-mini'];
            for (const modelName of modelsToTry) {
                try {
                    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${openRouterKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: modelName,
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
                        break; // Succès !
                    }
                } catch (aiErr) {
                    console.warn(`AI Vision flyer extraction failed with ${modelName}:`, aiErr);
                }
            }
        }

        return {
            success: true,
            imageUrl: finalImageUrl,
            extracted: extractedData
        };

    } catch (err: any) {
        console.error("Error analyzing flyer image:", err);
        return { success: false, error: err.message || "Erreur lors de l'analyse du flyer." };
    }
}
