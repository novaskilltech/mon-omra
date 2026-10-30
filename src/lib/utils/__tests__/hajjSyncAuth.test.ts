import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateHajjApiKey, getHajjSyncApiKey } from '../hajjSyncAuth';

describe('Hajj Sync API Key Authentication Utility', () => {
    const originalEnvKey = process.env.HAJJ_SYNC_API_KEY;
    const testSecret = 'hajj_live_test_secret_key_1234567890abcdef';

    beforeEach(() => {
        process.env.HAJJ_SYNC_API_KEY = testSecret;
    });

    afterEach(() => {
        process.env.HAJJ_SYNC_API_KEY = originalEnvKey;
    });

    it('returns the configured key from environment', () => {
        expect(getHajjSyncApiKey()).toBe(testSecret);
    });

    it('returns 500 error if key is not configured on server', () => {
        delete process.env.HAJJ_SYNC_API_KEY;
        const res = validateHajjApiKey('any-key');
        expect(res.valid).toBe(false);
        expect(res.statusCode).toBe(500);
        expect(res.error).toContain('pas encore configurée');
    });

    it('returns 401 error if auth header is missing or empty', () => {
        expect(validateHajjApiKey(null).valid).toBe(false);
        expect(validateHajjApiKey(undefined).valid).toBe(false);
        expect(validateHajjApiKey('').valid).toBe(false);
        expect(validateHajjApiKey('   ').valid).toBe(false);
        expect(validateHajjApiKey('Bearer ').valid).toBe(false);
    });

    it('returns 401 error if key length or content does not match', () => {
        const shortKey = validateHajjApiKey('Bearer hajj_wrong');
        expect(shortKey.valid).toBe(false);
        expect(shortKey.statusCode).toBe(401);

        const sameLengthWrongKey = validateHajjApiKey('Bearer hajj_live_test_secret_key_1234567890zzzzzz');
        expect(sameLengthWrongKey.valid).toBe(false);
        expect(sameLengthWrongKey.statusCode).toBe(401);
    });

    it('validates successfully with Authorization: Bearer <key>', () => {
        const res = validateHajjApiKey(`Bearer ${testSecret}`);
        expect(res.valid).toBe(true);
        expect(res.error).toBeUndefined();
    });

    it('validates successfully with direct raw key (X-API-Key style)', () => {
        const res = validateHajjApiKey(testSecret);
        expect(res.valid).toBe(true);
        expect(res.error).toBeUndefined();
    });
});
