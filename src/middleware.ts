import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // 1. CONTENT SECURITY POLICY (CSP)
    // Permet de restreindre d'où les scripts, styles et images peuvent être chargés.
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);

    // 2. AUTRES EN-TÊTES DE SÉCURITÉ (Baseline OWASP)
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'DENY'); // Empêche le Clickjacking
    response.headers.set('X-Content-Type-Options', 'nosniff'); // Empêche le MIME sniffing
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

    // 3. PROTECTION DU BACKOFFICE (Admin Gate)
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/backoffice')) {
        // Ignorer la page de login elle-même pour éviter une boucle infinie
        if (pathname !== '/backoffice/login') {
            const ADMIN_SECRET = process.env.ADMIN_AUTH_SECRET || 'nova_squad_secret_secure_key_2024';
            const session = request.cookies.get('omra_admin_session')?.value;
            if (session !== ADMIN_SECRET) {
                return NextResponse.redirect(new URL('/backoffice/login', request.url));
            }
        }
    }

    // 4. LOGIQUE DE RATE LIMITING (Placeholder SIMULÉ)
    // Dans une infra réelle, on utiliserait Upstash ou un service tiers.
    // Ici, on marque simplement le passage.
    const ip = request.ip || '127.0.0.1';
    response.headers.set('X-RateLimit-Limit', '100');

    return response;
}

// Configuration du matcher pour exclure les assets statiques
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
