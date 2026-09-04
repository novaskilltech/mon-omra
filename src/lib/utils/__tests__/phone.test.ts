import { describe, it, expect } from 'vitest';
import { formatPhoneForWhatsApp, getWhatsAppUrl, getWhatsAppWebUrl, formatDisplayPhone, getGroupInquiryWhatsAppUrl, AGENCY_WHATSAPP_PHONE } from '../phone';

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

    it('generates correct WhatsApp URL for group inquiry targeting the agency phone 0752280890', () => {
        expect(AGENCY_WHATSAPP_PHONE).toBe('0752280890');
        const url = getGroupInquiryWhatsAppUrl({
            name: 'LYON DU 08/12 AU 15/12',
            departure_date: '2026-12-08T00:00:00.000Z',
            airport: 'LYON'
        });
        expect(url).toContain('api.whatsapp.com/send?phone=33752280890');
        expect(url).toContain('LYON%20DU%2008%2F12%20AU%2015%2F12');
        expect(url).toContain("pouvez-vous%20m'en%20dire%20plus");
    });
});
