import crypto from 'crypto';

export interface AuthValidationResult {
    valid: boolean;
    error?: string;
    statusCode?: number;
}

/**
 * Lit la clé API de synchronisation Hajj configurée côté serveur.
 */
export function getHajjSyncApiKey(): string | null {
    return process.env.HAJJ_SYNC_API_KEY || null;
}

/**
 * Valide un en-tête d'autorisation ou une clé API avec comparaison en temps constant (anti timing-attack).
 */
export function validateHajjApiKey(authHeaderOrKey: string | null | undefined): AuthValidationResult {
    const configuredKey = getHajjSyncApiKey();

    if (!configuredKey) {
        return {
            valid: false,
            error: "La clé API de synchronisation n'est pas encore configurée sur le serveur (HAJJ_SYNC_API_KEY).",
            statusCode: 500
        };
    }

    if (!authHeaderOrKey || typeof authHeaderOrKey !== 'string') {
        return {
            valid: false,
            error: "Clé API manquante. Veuillez fournir l'en-tête 'Authorization: Bearer <clé>' ou 'X-API-Key: <clé>'.",
            statusCode: 401
        };
    }

    let token = authHeaderOrKey.trim();
    if (token.toLowerCase().startsWith('bearer ')) {
        token = token.slice(7).trim();
    }

    if (!token) {
        return {
            valid: false,
            error: "Le jeton d'autorisation est vide.",
            statusCode: 401
        };
    }

    try {
        const tokenBuf = Buffer.from(token, 'utf-8');
        const configuredBuf = Buffer.from(configuredKey, 'utf-8');

        if (tokenBuf.length !== configuredBuf.length) {
            return {
                valid: false,
                error: "Clé API invalide.",
                statusCode: 401
            };
        }

        const isValid = crypto.timingSafeEqual(tokenBuf, configuredBuf);
        if (!isValid) {
            return {
                valid: false,
                error: "Clé API invalide.",
                statusCode: 401
            };
        }

        return { valid: true };
    } catch {
        return {
            valid: false,
            error: "Erreur lors de la validation de la clé API.",
            statusCode: 401
        };
    }
}
