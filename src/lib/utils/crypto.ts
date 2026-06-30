import crypto from 'crypto';

const SECRET_KEY = process.env.SUPABASE_ANON_KEY || 'default-secret-key-at-least-32-chars-long';

export function encryptToken(data: any): string {
    const text = JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export function decryptToken(token: string): any | null {
    try {
        const decodedToken = decodeURIComponent(token);
        const parts = decodedToken.split(':');
        if (parts.length !== 2) return null;
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch (e) {
        console.error("Token decryption failed:", e);
        return null;
    }
}

export function hashPIN(pin: string): string {
    return crypto.createHash('sha256').update(pin).digest('hex');
}
