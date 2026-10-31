import { describe, it, expect, beforeEach } from 'vitest';
import { 
    checkLoginAttempts, 
    recordFailedAttempt, 
    resetLoginAttempts, 
    clearAllLoginAttempts,
    verifyPasswordTimingSafe,
    formatRemainingTimeFr,
    MAX_LOGIN_ATTEMPTS,
    LOCKOUT_DURATION_MS
} from '../authProtection';

describe('Auth Protection & Anti-Brute Force Utilities', () => {
    const testIp = '192.168.1.100';

    beforeEach(() => {
        clearAllLoginAttempts();
    });

    it('allows initial login attempt with 3 attempts remaining', () => {
        const check = checkLoginAttempts(testIp);
        expect(check.allowed).toBe(true);
        expect(check.remainingAttempts).toBe(MAX_LOGIN_ATTEMPTS);
    });

    it('records 1st and 2nd failed attempts without locking', () => {
        const fail1 = recordFailedAttempt(testIp);
        expect(fail1.locked).toBe(false);
        expect(fail1.attempts).toBe(1);
        expect(fail1.remainingAttempts).toBe(2);

        const fail2 = recordFailedAttempt(testIp);
        expect(fail2.locked).toBe(false);
        expect(fail2.attempts).toBe(2);
        expect(fail2.remainingAttempts).toBe(1);
    });

    it('locks out for 1 hour exactly on the 3rd failed attempt', () => {
        recordFailedAttempt(testIp); // 1
        recordFailedAttempt(testIp); // 2
        const fail3 = recordFailedAttempt(testIp); // 3

        expect(fail3.locked).toBe(true);
        expect(fail3.attempts).toBe(3);
        expect(fail3.remainingAttempts).toBe(0);
        expect(fail3.remainingLockoutMs).toBe(LOCKOUT_DURATION_MS);

        // Verification of subsequent check
        const check = checkLoginAttempts(testIp);
        expect(check.allowed).toBe(false);
        expect(check.remainingLockoutMs).toBeGreaterThan(0);
    });

    it('resets attempts back to 0 on successful login', () => {
        recordFailedAttempt(testIp);
        recordFailedAttempt(testIp);
        resetLoginAttempts(testIp);

        const check = checkLoginAttempts(testIp);
        expect(check.allowed).toBe(true);
        expect(check.remainingAttempts).toBe(MAX_LOGIN_ATTEMPTS);
    });

    it('verifies password using timing-safe comparison without errors', () => {
        expect(verifyPasswordTimingSafe('Secret123!', 'Secret123!')).toBe(true);
        expect(verifyPasswordTimingSafe('Wrong', 'Secret123!')).toBe(false);
        expect(verifyPasswordTimingSafe('', 'Secret123!')).toBe(false);
        expect(verifyPasswordTimingSafe('Secret123!', undefined)).toBe(false);
    });

    it('formats remaining lockout time accurately in French', () => {
        expect(formatRemainingTimeFr(60 * 60 * 1000)).toBe('1 heure(s)');
        expect(formatRemainingTimeFr(45 * 60 * 1000)).toBe('45 minute(s)');
        expect(formatRemainingTimeFr(30 * 1000)).toBe('1 minute(s)');
    });
});
