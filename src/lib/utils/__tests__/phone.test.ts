import { describe, it, expect } from 'vitest';
import { formatPhoneForWhatsApp, getWhatsAppUrl, getWhatsAppWebUrl, formatDisplayPhone } from '../phone';

describe('Phone formatting utilities for WhatsApp', () => {
    it('converts French 10-digit mobile numbers (06/07) to international E.164', () => {
        expect(formatPhoneForWhatsApp('0755319577', 'Française')).toBe('33755319577');
        expect(formatPhoneForWhatsApp('06 15 36 83 39', 'Française')).toBe('33615368339');
        expect(formatPhoneForWhatsApp('+33679525730', 'Française')).toBe('33679525730');
        expect(formatPhoneForWhatsApp('0033 7 80 20 72 16', 'Française')).toBe('33780207216');
    });

    it('handles country prefixes according to nationality', () => {
        expect(formatPhoneForWhatsApp('0666270528', 'Marocaine')).toBe('212666270528');
        expect(formatPhoneForWhatsApp('0550123456', 'Algérienne')).toBe('213550123456');
    });

    it('generates correct WhatsApp API URL and Web URL', () => {
        const url = getWhatsAppUrl('0755319577', 'Salam alaykoum', 'Française');
        expect(url).toContain('api.whatsapp.com/send?phone=33755319577');
        expect(url).toContain('text=Salam%20alaykoum');

        const webUrl = getWhatsAppWebUrl('0755319577', 'Salam', 'Française');
        expect(webUrl).toContain('web.whatsapp.com/send?phone=33755319577');
    });

    it('formats display phone numbers nicely', () => {
        expect(formatDisplayPhone('0755319577', 'Française')).toBe('+33 7 55 31 95 77');
    });
});
