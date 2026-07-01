import crypto from 'crypto';

const SECRET_KEY = process.env.SUPABASE_ANON_KEY || 'default-secret-key-at-least-32-chars-long';

export function encryptToken(data: any): string {
    let text = '';
    if (data && data.groupId && data.expiresAt && data.passcodeHash) {
        // Compact delimited format: uuidNoHyphens:expiresAtSecs:truncatedHash16
        const uuidNoHyphens = data.groupId.replace(/-/g, '');
        const expiresAtSecs = Math.floor(data.expiresAt / 1000);
        const truncatedHash = data.passcodeHash.slice(0, 16);
        text = `${uuidNoHyphens}:${expiresAtSecs}:${truncatedHash}`;
    } else {
        text = JSON.stringify(data);
    }

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
        let decrypted = decipher.update(encryptedText).toString('utf8');
        decrypted += decipher.final('utf8');

        if (decrypted.startsWith('{')) {
            return JSON.parse(decrypted);
        } else {
            const subparts = decrypted.split(':');
            if (subparts.length === 3) {
                const hex = subparts[0];
                const groupId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
                return {
                    groupId,
                    expiresAt: parseInt(subparts[1], 10) * 1000,
                    passcodeHash: subparts[2] // This will be the 16-char truncated hash
                };
            }
        }
        return null;
    } catch (e) {
        console.error("Token decryption failed:", e);
        return null;
    }
}

export function hashPIN(pin: string): string {
    return crypto.createHash('sha256').update(pin).digest('hex');
}
