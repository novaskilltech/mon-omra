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
    const targetUserId = formData.get('targetUserId') as string | null;

    if (!file || !type) {
        throw new Error('Fichier ou type manquant');
    }

    let uploadUserId = resolvedId;
    if (targetUserId && targetUserId !== resolvedId) {
        const isAdmin = await isAdminAuthenticated();
        if (isAdmin) {
            uploadUserId = targetUserId;
        } else {
            const { data: pilgrimRecords } = await supabase
                .from('pilgrims')
                .select('id, family_head_id')
                .in('id', [resolvedId, targetUserId]);
                
            if (pilgrimRecords && pilgrimRecords.length === 2) {
                const selfRecord = pilgrimRecords.find(p => p.id === resolvedId);
                const targetRecord = pilgrimRecords.find(p => p.id === targetUserId);
                const selfHead = selfRecord?.family_head_id || resolvedId;
                const targetHead = targetRecord?.family_head_id || targetUserId;
                
                if (selfHead === targetHead) {
                    uploadUserId = targetUserId;
                } else {
                    throw new Error('Non autorisé à charger des documents pour ce pèlerin');
                }
            } else {
                throw new Error('Pèlerin ou relation de famille introuvable');
            }
        }
    }

    // 1. Validate with Zod (Contract Enforcement)
    const validation = UserDocumentSchema.safeParse({
        user_id: uploadUserId,
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
        // Enforce document count limits and overwrite old ones
        const { data: existingDocs } = await supabase
            .from('user_documents')
            .select('*')
            .eq('user_id', uploadUserId)
            .eq('type', type)
            .order('created_at', { ascending: true });

        const maxAllowed = type === 'RESIDENCE_PERMIT' ? 2 : type === 'INVOICE' ? 10 : 1;
        
        if (type !== 'INVOICE' && existingDocs && existingDocs.length >= maxAllowed) {
            const docsToDelete = type === 'RESIDENCE_PERMIT' 
                ? [existingDocs[0]] 
                : existingDocs;

            for (const doc of docsToDelete) {
                // Delete file from storage
                await supabase.storage
                    .from('pelerin-documents')
                    .remove([doc.storage_path]);
                
                // Delete record from DB
                await supabase
                    .from('user_documents')
                    .delete()
                    .eq('id', doc.id);
            }
        }

        // 2. Upload to Supabase Storage (Private Bucket)
        const fileExt = file.name.split('.').pop();
        const filePath = `${uploadUserId}/${type}_${Date.now()}.${fileExt}`;
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
                user_id: uploadUserId,
                type: type,
                storage_path: filePath,
                file_name: file.name,
                file_size: file.size,
                content_type: file.type,
                verified: type === 'INVOICE', // Invoices uploaded by admin are auto-verified
            });

        if (dbError) throw dbError;

        // If it's an invoice, send notification to the pilgrim
        if (type === 'INVOICE') {
            try {
                // Find agency admin user profile for notification agency_id
                const { data: adminProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('role', 'SUPER_ADMIN')
                    .limit(1)
                    .single();
                const agencyId = adminProfile?.id || resolvedId;

                await supabase
                    .from('notifications')
                    .insert({
                        agency_id: agencyId,
                        pilgrim_id: uploadUserId,
                        type: 'PAYMENT',
                        title: 'Nouvelle facture disponible',
                        content: `Une nouvelle facture (${file.name}) a été mise en ligne dans votre dossier. Merci d'effectuer le virement sur le compte bancaire de l'agence.`
                    });
            } catch (notifErr) {
                console.error("Error creating invoice notification:", notifErr);
            }
        }

        revalidatePath('/dashboard/documents');
        revalidatePath('/backoffice/concierge');
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

/**
 * Deletes a pilgrim document (can be called by pilgrim or family head).
 */
export async function deleteDocumentAction(documentId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : null);

    if (!resolvedId) {
        throw new Error('Non autorisé');
    }

    const { data: doc, error: fetchError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

    if (fetchError || !doc) {
        return { error: 'Document introuvable' };
    }

    // Ensure ownership or same family folder, or admin status
    const isAdmin = await isAdminAuthenticated();
    let isAuthorized = isAdmin || doc.user_id === resolvedId;
    if (!isAuthorized) {
        const { data: pilgrimRecords } = await supabase
            .from('pilgrims')
            .select('id, family_head_id')
            .in('id', [resolvedId, doc.user_id]);

        if (pilgrimRecords && pilgrimRecords.length === 2) {
            const selfRecord = pilgrimRecords.find(p => p.id === resolvedId);
            const targetRecord = pilgrimRecords.find(p => p.id === doc.user_id);
            const selfHead = selfRecord?.family_head_id || resolvedId;
            const targetHead = targetRecord?.family_head_id || doc.user_id;
            if (selfHead === targetHead) {
                isAuthorized = true;
            }
        }
    }

    if (!isAuthorized) {
        return { error: 'Non autorisé à supprimer ce document' };
    }

    try {
        const { error: storageError } = await supabase.storage
            .from('pelerin-documents')
            .remove([doc.storage_path]);

        if (storageError) console.error("Storage delete error:", storageError);

        const { error: dbError } = await supabase
            .from('user_documents')
            .delete()
            .eq('id', documentId);

        if (dbError) throw dbError;

        revalidatePath('/dashboard/documents');
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting document:", e);
        return { error: e.message || "Erreur de suppression du document" };
    }
}
