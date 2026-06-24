import { z } from 'zod';

/**
 * DOCUMENTS - TYPES & CONTRACTS
 * Phase: Ready for Build (DoR)
 */

export const DocumentTypeSchema = z.enum(['PASSPORT', 'PHOTO', 'RESIDENCE_PERMIT', 'INVOICE']);

export const UserDocumentSchema = z.object({
    id: z.string().uuid().optional(),
    user_id: z.string().uuid(),
    type: DocumentTypeSchema,
    storage_path: z.string(),
    file_name: z.string(),
    file_size: z.number().max(5 * 1024 * 1024), // 5MB limit
    content_type: z.string(),
    verified: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type UserDocument = z.infer<typeof UserDocumentSchema>;
