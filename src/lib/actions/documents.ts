'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { UserDocumentSchema, DocumentType } from '@/types/documents';
import { resolvePilgrimIdByEmail } from './logistics';
import { isAdminAuthenticated } from './auth';

/**
 * Uploads a pilgrim document to Supabase Storage and records it in the database.
 * @param formData - Must contain 'file' and 'type'
 */
export async function uploadDocument(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : null);

    if (!resolvedId) {
        throw new Error('Non autorisé');
    }

    const file = formData.get('file') as File;
    const type = formData.get('type') as DocumentType;

    if (!file || !type) {
        throw new Error('Fichier ou type manquant');
    }

    // 1. Validate with Zod (Contract Enforcement)
    const validation = UserDocumentSchema.safeParse({
        user_id: resolvedId,
        type: type,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
        storage_path: 'pending', // Temporary
    });

    if (!validation.success) {
        return { error: validation.error.issues[0]?.message || 'Données invalides' };
    }

    try {
        // 2. Upload to Supabase Storage (Private Bucket)
        const fileExt = file.name.split('.').pop();
        const filePath = `${resolvedId}/${type}_${Date.now()}.${fileExt}`;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabase.storage
            .from('pelerin-documents')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                duplex: 'half'
            });

        if (uploadError) throw uploadError;

        // 3. Record in DB
        const { error: dbError } = await supabase
            .from('user_documents')
            .insert({
                user_id: resolvedId,
                type: type,
                storage_path: filePath,
                file_name: file.name,
                file_size: file.size,
                content_type: file.type,
                verified: false,
            });

        if (dbError) throw dbError;

        revalidatePath('/dashboard/documents');
        return { success: true, path: filePath };

    } catch (error: any) {
        console.error('Upload error:', error);
        return { error: "Erreur lors de l'envoi du document." };
    }
}

/**
 * Retrieves the signed URL for a document.
 */
export async function getDocumentUrl(storagePath: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
        .from('pelerin-documents')
        .createSignedUrl(storagePath, 3600); // 1 hour link

    if (error) {
        console.error('Error getting signed URL:', error);
        return null;
    }

    return data.signedUrl;
}

/**
 * Gets all documents for a given pilgrim (agency backoffice view).
 */
export async function getPilgrimDocuments(pilgrimId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return { error: "Non autorisé" };
    }

    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('user_documents')
            .select('*')
            .eq('user_id', pilgrimId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Resolve signed URLs for each document
        const docsWithUrls = await Promise.all((data || []).map(async (doc: any) => {
            const signedUrl = await getDocumentUrl(doc.storage_path);
            return {
                ...doc,
                url: signedUrl
            };
        }));

        return { success: true, documents: docsWithUrls };
    } catch (e: any) {
        console.error("Error in getPilgrimDocuments:", e);
        return { error: e.message || "Erreur lors de la récupération des documents" };
    }
}
