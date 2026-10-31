import crypto from 'crypto';

interface AttemptRecord {
    attempts: number;
    lockedUntil: number | null;
    firstAttemptAt: number;
}

// Magasin en mémoire pour le suivi des tentatives par IP
const loginAttemptsMap = new Map<string, AttemptRecord>();

export const MAX_LOGIN_ATTEMPTS = 3;
export const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 heure

/**
 * Nettoyage périodique des enregistrements expirés pour éviter les fuites mémoire
 */
function cleanupExpiredRecords() {
    const now = Date.now();
    const toDelete: string[] = [];

    loginAttemptsMap.forEach((record, ip) => {
        if (record.lockedUntil && now > record.lockedUntil) {
            toDelete.push(ip);
        } else if (!record.lockedUntil && now - record.firstAttemptAt > LOCKOUT_DURATION_MS) {
            toDelete.push(ip);
        }
    });

    toDelete.forEach((ip) => {
        loginAttemptsMap.delete(ip);
    });
}

/**
 * Vérifie si une IP a le droit de tenter une connexion
 */
export function checkLoginAttempts(ip: string): { 
    allowed: boolean; 
    remainingLockoutMs?: number; 
    remainingAttempts?: number 
} {
    cleanupExpiredRecords();
    const record = loginAttemptsMap.get(ip);

    if (!record) {
        return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
    }

    const now = Date.now();

    // Si l'IP est sous le coup d'un blocage de 1 heure
    if (record.lockedUntil) {
        if (now < record.lockedUntil) {
            return {
                allowed: false,
                remainingLockoutMs: record.lockedUntil - now
            };
        }
        // Le blocage est expiré, on réinitialise
        loginAttemptsMap.delete(ip);
        return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
    }

    const remaining = Math.max(0, MAX_LOGIN_ATTEMPTS - record.attempts);
    return {
        allowed: remaining > 0,
        remainingAttempts: remaining
    };
}

/**
 * Enregistre un échec de mot de passe.
 * Si 3 échecs sont atteints, bloque pendant 1 heure.
 */
export function recordFailedAttempt(ip: string): {
    locked: boolean;
    remainingLockoutMs?: number;
    attempts: number;
    remainingAttempts: number;
} {
    const now = Date.now();
    let record = loginAttemptsMap.get(ip);

    if (!record) {
        record = {
            attempts: 1,
            lockedUntil: null,
            firstAttemptAt: now
        };
        loginAttemptsMap.set(ip, record);
        return {
            locked: false,
            attempts: 1,
            remainingAttempts: MAX_LOGIN_ATTEMPTS - 1
        };
    }

    // Incrémente le nombre d'échecs
    record.attempts += 1;

    if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_DURATION_MS;
        return {
            locked: true,
            remainingLockoutMs: LOCKOUT_DURATION_MS,
            attempts: record.attempts,
            remainingAttempts: 0
        };
    }

    return {
        locked: false,
        attempts: record.attempts,
        remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - record.attempts)
    };
}

/**
 * Réinitialise le compteur d'échecs en cas de mot de passe correct
 */
export function resetLoginAttempts(ip: string): void {
    loginAttemptsMap.delete(ip);
}

/**
 * Réinitialise l'ensemble du magasin (utile pour les tests unitaires)
 */
export function clearAllLoginAttempts(): void {
    loginAttemptsMap.clear();
}

/**
 * Vérification de mot de passe en temps constant (Timing-Safe)
 * Empêche les attaques par analyse temporelle (OWASP A07)
 */
export function verifyPasswordTimingSafe(providedPassword: string, expectedPassword?: string): boolean {
    if (!expectedPassword || !providedPassword) {
        return false;
    }

    try {
        const providedBuf = Buffer.from(providedPassword, 'utf-8');
        const expectedBuf = Buffer.from(expectedPassword, 'utf-8');

        if (providedBuf.length !== expectedBuf.length) {
            // Comparaison leurre en temps constant pour éviter la détection de longueur
            crypto.timingSafeEqual(providedBuf, providedBuf);
            return false;
        }

        return crypto.timingSafeEqual(providedBuf, expectedBuf);
    } catch {
        return false;
    }
}

/**
 * Formate un délai en millisecondes en texte français lisible (ex: "58 minute(s)")
 */
export function formatRemainingTimeFr(ms: number): string {
    const totalMinutes = Math.max(1, Math.ceil(ms / (60 * 1000)));
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours} heure(s)`;
    }
    return `${totalMinutes} minute(s)`;
}

/**
 * Calcule dynamiquement le secret de session administrateur sécurisé
 * (Sans fallback en clair dans le code)
 */
export function getAdminAuthSecret(): string {
    if (process.env.ADMIN_AUTH_SECRET && process.env.ADMIN_AUTH_SECRET.trim() !== '') {
        return process.env.ADMIN_AUTH_SECRET.trim();
    }
    // Dérivation cryptographique depuis le secret Supabase ou le mot de passe admin
    const seed = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_PASSWORD;
    if (seed) {
        return crypto.createHmac('sha256', seed).update('mon_omra_admin_session_v1').digest('hex');
    }
    throw new Error("Sécurité critique : Ni ADMIN_AUTH_SECRET, ni ADMIN_PASSWORD, ni SUPABASE_SERVICE_ROLE_KEY n'est configuré.");
}
