import { z } from 'zod';

/**
 * DOCUMENTS - TYPES & CONTRACTS
 * Phase: Ready for Build (DoR) - Hardened Security Whitelist P1
 */

export const DocumentTypeSchema = z.enum(['PASSPORT', 'PHOTO', 'RESIDENCE_PERMIT', 'INVOICE']);

export const ALLOWED_DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
] as const;

export const ALLOWED_DOCUMENT_EXTENSIONS = [
    'pdf',
    'jpg',
    'jpeg',
    'png',
    'webp',
] as const;

export const FORBIDDEN_EXTENSIONS = [
    'svg',
    'html',
    'htm',
    'xml',
    'xhtml',
    'js',
    'mjs',
    'ts',
    'php',
    'exe',
    'bat',
    'sh',
    'vbs',
    'scr',
    'cmd',
] as const;

export const MIME_BY_EXTENSION: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

export const UserDocumentSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid(),
    type: DocumentTypeSchema,
    storage_path: z.string(),
    file_name: z.string().min(1).max(255),
    file_size: z.number().positive().max(5 * 1024 * 1024, "La taille du fichier ne peut pas dépasser 5 Mo."), // 5MB limit
    content_type: z.enum(ALLOWED_DOCUMENT_MIME_TYPES, {
        message: "Format ou type de document non autorisé (seuls PDF, JPEG, PNG, WebP sont acceptés)."
    }),
    verified: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type UserDocument = z.infer<typeof UserDocumentSchema>;

/**
 * Validateur centralisé et hermétique pour tout fichier envoyé sur la plateforme.
 * Prévient les attaques XSS stockées (SVG/HTML) et l'injection de fichiers exécutables.
 */
export function validateUploadedFile(
    file: { name?: string; size?: number; type?: string } | null | undefined,
    maxSizeBytes = 5 * 1024 * 1024
): { valid: boolean; error?: string; cleanExt?: string; resolvedMime?: string } {
    if (!file || !file.name) {
        return { valid: false, error: "Aucun fichier valide fourni." };
    }

    if (typeof file.size === 'number') {
        if (file.size <= 0) {
            return { valid: false, error: "Le fichier sélectionné est vide." };
        }
        if (file.size > maxSizeBytes) {
            const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
            return { valid: false, error: `Fichier trop volumineux. La taille maximale autorisée est de ${maxMb} Mo.` };
        }
    }

    const rawExt = file.name.split('.').pop();
    const ext = rawExt ? rawExt.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '';

    if (!ext || (FORBIDDEN_EXTENSIONS as readonly string[]).includes(ext) || !(ALLOWED_DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) {
        return {
            valid: false,
            error: "Format de fichier non autorisé. Seuls les fichiers PDF, JPEG, PNG et WebP sont acceptés (les fichiers SVG, HTML et scripts sont strictement interdits pour des raisons de sécurité)."
        };
    }

    const declaredMime = file.type ? file.type.toLowerCase().trim() : '';
    let resolvedMime = MIME_BY_EXTENSION[ext] || 'application/pdf';

    if (declaredMime && declaredMime !== 'application/octet-stream') {
        if (!(ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(declaredMime)) {
            return {
                valid: false,
                error: `Type de contenu non autorisé (${declaredMime}). Seuls les fichiers PDF, JPEG, PNG et WebP sont acceptés.`
            };
        }
        resolvedMime = declaredMime;
    }

    return {
        valid: true,
        cleanExt: ext,
        resolvedMime
    };
}
