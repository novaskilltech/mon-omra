import { SupabaseClient } from '@supabase/supabase-js';

export interface StoragePurgeResult {
    success: boolean;
    deletedFilesCount: number;
    deletedPaths: string[];
    error?: string;
}

export const PILGRIM_DOCUMENTS_BUCKET = 'pelerin-documents';

/**
 * Purge de manière sécurisée et exhaustive tous les fichiers de documents personnels
 * (passeports, visas, photos, justificatifs de paiement) d'un pèlerin dans Supabase Storage
 * afin de respecter rigoureusement le droit à l'effacement RGPD (Art. 17).
 */
export async function purgePilgrimStorageFiles(
    supabaseAdmin: SupabaseClient,
    pilgrimId: string
): Promise<StoragePurgeResult> {
    if (!pilgrimId || typeof pilgrimId !== 'string') {
        return { 
            success: false, 
            deletedFilesCount: 0, 
            deletedPaths: [], 
            error: 'Identifiant pèlerin invalide.' 
        };
    }

    const pathsToDelete = new Set<string>();

    try {
        // 1. Récupérer les chemins explicitement référencés dans user_documents
        const { data: userDocs } = await supabaseAdmin
            .from('user_documents')
            .select('storage_path')
            .eq('user_id', pilgrimId);

        if (userDocs && userDocs.length > 0) {
            userDocs.forEach((doc: { storage_path: string }) => {
                if (doc.storage_path && typeof doc.storage_path === 'string') {
                    pathsToDelete.add(doc.storage_path);
                }
            });
        }

        // 2. Lister les fichiers dans le dossier pèlerin `${pilgrimId}/`
        const { data: folderFiles } = await supabaseAdmin.storage
            .from(PILGRIM_DOCUMENTS_BUCKET)
            .list(pilgrimId);

        if (folderFiles && folderFiles.length > 0) {
            folderFiles.forEach((f: { name: string }) => {
                if (f.name && f.name !== '.emptyFolderPlaceholder') {
                    pathsToDelete.add(`${pilgrimId}/${f.name}`);
                }
            });
        }

        // 3. Repérer les justificatifs de paiement dans `proofs/` liés à ce pèlerin
        const { data: proofFiles } = await supabaseAdmin.storage
            .from(PILGRIM_DOCUMENTS_BUCKET)
            .list('proofs');

        if (proofFiles && proofFiles.length > 0) {
            proofFiles.forEach((f: { name: string }) => {
                if (f.name && f.name.startsWith(`${pilgrimId}_`)) {
                    pathsToDelete.add(`proofs/${f.name}`);
                }
            });
        }

        // 4. Suppression physique des fichiers du Storage
        const pathsList = Array.from(pathsToDelete);
        if (pathsList.length > 0) {
            const { error: removeError } = await supabaseAdmin.storage
                .from(PILGRIM_DOCUMENTS_BUCKET)
                .remove(pathsList);

            if (removeError) {
                console.error(`Erreur suppression Storage pour pèlerin ${pilgrimId}:`, removeError);
            }
        }

        // 5. Suppression des enregistrements dans user_documents
        await supabaseAdmin
            .from('user_documents')
            .delete()
            .eq('user_id', pilgrimId);

        return {
            success: true,
            deletedFilesCount: pathsList.length,
            deletedPaths: pathsList
        };
    } catch (err: any) {
        console.error(`Exception purge storage pèlerin ${pilgrimId}:`, err);
        return {
            success: false,
            deletedFilesCount: pathsToDelete.size,
            deletedPaths: Array.from(pathsToDelete),
            error: err.message || 'Erreur lors de la purge des documents Storage.'
        };
    }
}

/**
 * Purge des documents liés à une demande Hajj dans le Storage
 */
export async function purgeHajjStorageFiles(
    supabaseAdmin: SupabaseClient,
    hajjId: string
): Promise<StoragePurgeResult> {
    if (!hajjId || typeof hajjId !== 'string') {
        return { success: false, deletedFilesCount: 0, deletedPaths: [] };
    }

    const pathsToDelete = new Set<string>();

    try {
        const { data: folderFiles } = await supabaseAdmin.storage
            .from(PILGRIM_DOCUMENTS_BUCKET)
            .list(`hajj/${hajjId}`);

        if (folderFiles && folderFiles.length > 0) {
            folderFiles.forEach((f: { name: string }) => {
                if (f.name && f.name !== '.emptyFolderPlaceholder') {
                    pathsToDelete.add(`hajj/${hajjId}/${f.name}`);
                }
            });
        }

        const pathsList = Array.from(pathsToDelete);
        if (pathsList.length > 0) {
            await supabaseAdmin.storage
                .from(PILGRIM_DOCUMENTS_BUCKET)
                .remove(pathsList);
        }

        return {
            success: true,
            deletedFilesCount: pathsList.length,
            deletedPaths: pathsList
        };
    } catch (err: any) {
        return {
            success: false,
            deletedFilesCount: 0,
            deletedPaths: [],
            error: err.message
        };
    }
}
