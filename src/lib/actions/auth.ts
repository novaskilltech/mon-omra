'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function checkEmailRegistration(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', email)
        .single();
    
    if (error || !data) {
        return { allowed: false };
    }
    return { allowed: true, role: data.role };
}


const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'OmraRyanair2026!';
const SESSION_COOKIE = 'omra_admin_session';

// Pour la démo, on utilise un secret simple. En prod, ce serait une variable d'env.
const ADMIN_SECRET = process.env.ADMIN_AUTH_SECRET || 'nova_squad_secret_secure_key_2024';

export async function loginAdmin(formData: FormData) {
    const password = formData.get('password');

    if (password === ADMIN_PASSWORD) {
        // Définir un cookie de session avec une valeur "signée" (simulée ici par le secret)
        cookies().set(SESSION_COOKIE, ADMIN_SECRET, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 heures pour plus de sécurité
            path: '/',
        });
        return { success: true };
    }

    // Fix Anti-Brute Force : Délai artificiel en cas d'erreur
    await new Promise(r => setTimeout(r, 1500));

    return { error: "Mot de passe incorrect" };
}

export async function logoutAdmin() {
    cookies().delete(SESSION_COOKIE);
    redirect('/backoffice/login');
}

export async function isAdminAuthenticated() {
    return cookies().get(SESSION_COOKIE)?.value === ADMIN_SECRET;
}
