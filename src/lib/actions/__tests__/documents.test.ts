import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
    uploadDocument, 
    deleteDocumentAction, 
    getDocumentUrl, 
    getPilgrimDocuments 
} from '../documents';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '../auth';

const { SELF_ID, FAMILY_MEMBER_ID, STRANGER_ID, DOC_ID } = vi.hoisted(() => ({
    SELF_ID: 'a0000000-0000-4000-8000-000000000001',
    FAMILY_MEMBER_ID: 'b0000000-0000-4000-8000-000000000002',
    STRANGER_ID: 'c0000000-0000-4000-8000-000000000003',
    DOC_ID: 'd0000000-0000-4000-8000-000000000004'
}));

// Mock Supabase Server Utils
vi.mock('@/utils/supabase/server', () => {
    const mockStorage = {
        from: vi.fn(() => ({
            upload: vi.fn().mockResolvedValue({ error: null }),
            remove: vi.fn().mockResolvedValue({ error: null }),
            createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://storage.supabase.co/signed/doc.pdf' }, error: null })
        }))
    };

    const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        storage: mockStorage,
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: { id: SELF_ID, email: 'pilgrim@test.com' } } })
        }
    };

    return {
        createClient: vi.fn(() => mockSupabase),
        createAdminClient: vi.fn(() => mockSupabase)
    };
});

// Mock Auth Check
vi.mock('../auth', () => ({
    isAdminAuthenticated: vi.fn(() => Promise.resolve(false))
}));

// Mock Next.js Cache Revalidation
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));

// Mock Next.js Cookies
let mockCookiesValue: Record<string, string | undefined> = {
    pilgrim_id: SELF_ID
};

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        get: vi.fn((name: string) => {
            const val = mockCookiesValue[name];
            return val ? { value: val } : undefined;
        })
    }))
}));

describe('uploadDocument Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCookiesValue = { pilgrim_id: SELF_ID };
    });

    it('should return error if unauthenticated', async () => {
        mockCookiesValue = {};
        const mockSupabase = createClient();
        mockSupabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } });

        const formData = new FormData();
        formData.append('type', 'PASSPORT');
        const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });
        formData.append('file', file);

        const result = await uploadDocument(formData);
        expect(result.error).toMatch(/Non autorisé/i);
    });

    it('should return error if file or type is missing', async () => {
        const formData = new FormData();
        const result = await uploadDocument(formData);
        expect(result.error).toMatch(/Fichier ou type/i);
    });

    it('should return error if file size exceeds limit (5MB)', async () => {
        const formData = new FormData();
        formData.append('type', 'PASSPORT');
        const bigFile = new File(['x'], 'big.pdf', { type: 'application/pdf' });
        Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });
        formData.append('file', bigFile);

        const result = await uploadDocument(formData);
        expect(result.error).toBeDefined();
    });

    it('should successfully upload document for self', async () => {
        const mockAdmin = createAdminClient();
        const uploadMock = vi.fn().mockResolvedValue({ error: null });
        mockAdmin.storage.from = vi.fn().mockReturnValue({
            upload: uploadMock,
            remove: vi.fn().mockResolvedValue({ error: null })
        });

        const insertMock = vi.fn().mockResolvedValue({ error: null });
        mockAdmin.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'user_documents') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: [] })
                            })
                        })
                    }),
                    insert: insertMock
                };
            }
            return {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis()
            };
        });

        const formData = new FormData();
        formData.append('type', 'PASSPORT');
        const file = new File(['content'], 'passport.pdf', { type: 'application/pdf' });
        file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));
        formData.append('file', file);

        const result = await uploadDocument(formData);
        expect(result.success).toBe(true);
        expect(uploadMock).toHaveBeenCalled();
        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
            user_id: SELF_ID,
            type: 'PASSPORT',
            file_name: 'passport.pdf'
        }));
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/documents');
    });

    it('should allow family head to upload document for family member', async () => {
        const mockAdmin = createAdminClient();
        const uploadMock = vi.fn().mockResolvedValue({ error: null });
        mockAdmin.storage.from = vi.fn().mockReturnValue({
            upload: uploadMock,
            remove: vi.fn().mockResolvedValue({ error: null })
        });

        const insertMock = vi.fn().mockResolvedValue({ error: null });
        mockAdmin.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'pilgrims') {
                return {
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                { id: SELF_ID, family_head_id: null },
                                { id: FAMILY_MEMBER_ID, family_head_id: SELF_ID }
                            ]
                        })
                    })
                };
            }
            if (table === 'user_documents') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: [] })
                            })
                        })
                    }),
                    insert: insertMock
                };
            }
            return {};
        });

        const formData = new FormData();
        formData.append('type', 'PHOTO');
        formData.append('targetUserId', FAMILY_MEMBER_ID);
        const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
        file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));
        formData.append('file', file);

        const result = await uploadDocument(formData);
        expect(result.success).toBe(true);
        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
            user_id: FAMILY_MEMBER_ID,
            type: 'PHOTO'
        }));
    });

    it('should reject upload for unrelated pilgrim (anti-IDOR)', async () => {
        const mockAdmin = createAdminClient();
        mockAdmin.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'pilgrims') {
                return {
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                { id: SELF_ID, family_head_id: null },
                                { id: STRANGER_ID, family_head_id: 'other-head-id' }
                            ]
                        })
                    })
                };
            }
            return {};
        });

        const formData = new FormData();
        formData.append('type', 'PASSPORT');
        formData.append('targetUserId', STRANGER_ID);
        const file = new File(['stranger'], 'passport.pdf', { type: 'application/pdf' });
        formData.append('file', file);

        const result = await uploadDocument(formData);
        expect(result.error).toMatch(/Non autorisé à charger des documents/i);
    });

    it('should allow admin to upload invoice for pilgrim without pilgrim cookie', async () => {
        vi.mocked(isAdminAuthenticated).mockResolvedValueOnce(true);
        mockCookiesValue = {};
        const mockSupabase = createClient();
        mockSupabase.auth.getUser = vi.fn().mockResolvedValue({ data: { user: null } });

        const mockAdmin = createAdminClient();
        const uploadMock = vi.fn().mockResolvedValue({ error: null });
        mockAdmin.storage.from = vi.fn().mockReturnValue({
            upload: uploadMock,
            remove: vi.fn().mockResolvedValue({ error: null })
        });

        const insertMock = vi.fn().mockResolvedValue({ error: null });
        mockAdmin.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'user_documents') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockReturnValue({
                                order: vi.fn().mockResolvedValue({ data: [] })
                            })
                        })
                    }),
                    insert: insertMock
                };
            }
            if (table === 'profiles') {
                return {
                    select: vi.fn().mockReturnThis(),
                    in: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'admin-123' } })
                };
            }
            if (table === 'notifications') {
                return {
                    insert: vi.fn().mockResolvedValue({ error: null })
                };
            }
            return {};
        });

        const formData = new FormData();
        formData.append('type', 'INVOICE');
        formData.append('targetUserId', STRANGER_ID);
        const file = new File(['invoice content'], 'facture-001.pdf', { type: 'application/pdf' });
        file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));
        formData.append('file', file);

        const result = await uploadDocument(formData);
        expect(result.success).toBe(true);
        expect(uploadMock).toHaveBeenCalled();
        expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
            user_id: STRANGER_ID,
            type: 'INVOICE',
            file_name: 'facture-001.pdf',
            verified: true
        }));
    });
});

describe('deleteDocumentAction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockCookiesValue = { pilgrim_id: SELF_ID };
    });

    it('should successfully delete document owned by self', async () => {
        const mockAdmin = createAdminClient();
        const removeMock = vi.fn().mockResolvedValue({ error: null });
        mockAdmin.storage.from = vi.fn().mockReturnValue({
            remove: removeMock
        });

        const deleteMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
        });

        mockAdmin.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'user_documents') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: {
                                    id: DOC_ID,
                                    user_id: SELF_ID,
                                    storage_path: `${SELF_ID}/PASSPORT_123.pdf`
                                },
                                error: null
                            })
                        })
                    }),
                    delete: deleteMock
                };
            }
            return {};
        });

        const result = await deleteDocumentAction(DOC_ID);
        expect(result.success).toBe(true);
        expect(removeMock).toHaveBeenCalledWith([`${SELF_ID}/PASSPORT_123.pdf`]);
        expect(deleteMock).toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard/documents');
    });

    it('should reject deleting document belonging to another unrelated user', async () => {
        const mockAdmin = createAdminClient();
        mockAdmin.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'user_documents') {
                return {
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: {
                                    id: DOC_ID,
                                    user_id: STRANGER_ID,
                                    storage_path: `${STRANGER_ID}/PASSPORT_999.pdf`
                                },
                                error: null
                            })
                        })
                    })
                };
            }
            if (table === 'pilgrims') {
                return {
                    select: vi.fn().mockReturnValue({
                        in: vi.fn().mockResolvedValue({
                            data: [
                                { id: SELF_ID, family_head_id: null },
                                { id: STRANGER_ID, family_head_id: 'stranger-head' }
                            ]
                        })
                    })
                };
            }
            return {};
        });

        const result = await deleteDocumentAction(DOC_ID);
        expect(result.error).toMatch(/Non autorisé à supprimer ce document/i);
    });
});

describe('getDocumentUrl and getPilgrimDocuments', () => {
    it('getDocumentUrl should create signed url with 3600 seconds duration', async () => {
        const mockAdmin = createAdminClient();
        const signedUrlMock = vi.fn().mockResolvedValue({
            data: { signedUrl: 'https://supabase.co/signed-url-test' },
            error: null
        });
        mockAdmin.storage.from = vi.fn().mockReturnValue({
            createSignedUrl: signedUrlMock
        });

        const url = await getDocumentUrl('path/to/doc.pdf');
        expect(url).toBe('https://supabase.co/signed-url-test');
        expect(signedUrlMock).toHaveBeenCalledWith('path/to/doc.pdf', 3600);
    });

    it('getPilgrimDocuments should reject non-admin users', async () => {
        const result = await getPilgrimDocuments(SELF_ID);
        expect(result.error).toBe('Non autorisé');
    });
});
