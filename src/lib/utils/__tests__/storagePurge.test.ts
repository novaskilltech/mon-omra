import { describe, it, expect, vi } from 'vitest';
import { purgePilgrimStorageFiles, purgeHajjStorageFiles, PILGRIM_DOCUMENTS_BUCKET } from '../storagePurge';

describe('GDPR Storage Purge Utility (Right to Erasure Art. 17)', () => {
    it('collects user documents, folder files and payment proofs and calls storage.remove', async () => {
        const removedPaths: string[] = [];

        const mockSupabaseAdmin: any = {
            from: (table: string) => {
                if (table === 'user_documents') {
                    return {
                        select: () => ({
                            eq: () => Promise.resolve({
                                data: [
                                    { storage_path: 'user-123/passport.pdf' },
                                    { storage_path: 'user-123/visa.pdf' }
                                ]
                            })
                        }),
                        delete: () => ({
                            eq: () => Promise.resolve({ error: null })
                        })
                    };
                }
                return {};
            },
            storage: {
                from: (bucket: string) => {
                    expect(bucket).toBe(PILGRIM_DOCUMENTS_BUCKET);
                    return {
                        list: (folder: string) => {
                            if (folder === 'user-123') {
                                return Promise.resolve({
                                    data: [
                                        { name: 'photo.jpg' },
                                        { name: '.emptyFolderPlaceholder' }
                                    ]
                                });
                            }
                            if (folder === 'proofs') {
                                return Promise.resolve({
                                    data: [
                                        { name: 'user-123_transfer_proof.pdf' },
                                        { name: 'other-user_proof.pdf' }
                                    ]
                                });
                            }
                            return Promise.resolve({ data: [] });
                        },
                        remove: (paths: string[]) => {
                            removedPaths.push(...paths);
                            return Promise.resolve({ error: null });
                        }
                    };
                }
            }
        };

        const result = await purgePilgrimStorageFiles(mockSupabaseAdmin, 'user-123');

        expect(result.success).toBe(true);
        expect(result.deletedFilesCount).toBe(4);
        expect(result.deletedPaths).toContain('user-123/passport.pdf');
        expect(result.deletedPaths).toContain('user-123/visa.pdf');
        expect(result.deletedPaths).toContain('user-123/photo.jpg');
        expect(result.deletedPaths).toContain('proofs/user-123_transfer_proof.pdf');
        expect(result.deletedPaths).not.toContain('proofs/other-user_proof.pdf');
        expect(result.deletedPaths).not.toContain('user-123/.emptyFolderPlaceholder');
    });

    it('handles empty files gracefully without throwing errors', async () => {
        const mockSupabaseAdmin: any = {
            from: () => ({
                select: () => ({ eq: () => Promise.resolve({ data: [] }) }),
                delete: () => ({ eq: () => Promise.resolve({ error: null }) })
            }),
            storage: {
                from: () => ({
                    list: () => Promise.resolve({ data: [] }),
                    remove: vi.fn()
                })
            }
        };

        const result = await purgePilgrimStorageFiles(mockSupabaseAdmin, 'user-empty');
        expect(result.success).toBe(true);
        expect(result.deletedFilesCount).toBe(0);
        expect(result.deletedPaths.length).toBe(0);
    });

    it('rejects invalid or empty pilgrim id', async () => {
        const result = await purgePilgrimStorageFiles({} as any, '');
        expect(result.success).toBe(false);
        expect(result.deletedFilesCount).toBe(0);
    });
});
