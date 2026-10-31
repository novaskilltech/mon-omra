'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import {
    checkLoginAttempts,
    recordFailedAttempt,
    resetLoginAttempts,
    verifyPasswordTimingSafe,
    formatRemainingTimeFr,
    getAdminAuthSecret,
    isValidSessionSecret
} from '@/lib/utils/authProtection';

export async function checkEmailRegistration(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, role')
        .ilike('email', email)
        .single();
    
    if (error || !data) {
        return { allowed: false };
    }
    return { allowed: true, role: data.role };
}

const SESSION_COOKIE = 'omra_admin_session';

function getClientIp(): string {
    const h = headers();
    const forwarded = h.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return h.get('x-real-ip') || '127.0.0.1';
}

export async function loginAdmin(formData: FormData) {
    const ip = getClientIp();
    const rawPassword = String(formData.get('password') || '').trim();

    // Mots de passe autorisés (variable d'environnement ADMIN_PASSWORD + mot de passe agence)
    const validPasswords = [
        process.env.ADMIN_PASSWORD,
        'Khouribga25000*'
    ].filter(Boolean) as string[];

    // 1. Vérification en temps constant
    const isPasswordValid = validPasswords.some(expected => 
        verifyPasswordTimingSafe(rawPassword, expected)
    );

    if (isPasswordValid) {
        // Succès : Déblocage et réinitialisation immédiate du compteur d'échecs
        resetLoginAttempts(ip);

        const secret = getAdminAuthSecret();
        cookies().set(SESSION_COOKIE, secret, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 jours
            path: '/',
        });
        return { success: true };
    }

    // 2. Si le mot de passe est faux : vérifier si l'IP est bloquée
    const attemptStatus = checkLoginAttempts(ip);
    if (!attemptStatus.allowed) {
        const remainingStr = formatRemainingTimeFr(attemptStatus.remainingLockoutMs || 3600000);
        return {
            error: `Accès temporairement bloqué suite à 3 tentatives échouées. Veuillez réessayer dans ${remainingStr}.`
        };
    }

    // 3. Échec : Enregistrement de la tentative
    const failedStatus = recordFailedAttempt(ip);

    await new Promise(r => setTimeout(r, 600));

    if (failedStatus.locked) {
        return {
            error: "Mot de passe incorrect. Vous avez atteint 3 tentatives échouées : votre accès est bloqué pendant 1 heure."
        };
    }

    return {
        error: `Mot de passe incorrect. Il vous reste ${failedStatus.remainingAttempts} tentative(s) avant un blocage de 1 heure.`
    };
}

export async function logoutAdmin() {
    cookies().delete(SESSION_COOKIE);
    redirect('/backoffice/login');
}

export async function isAdminAuthenticated() {
    // 1. Vérification sécurisée du cookie de session d'administration
    const sessionVal = cookies().get(SESSION_COOKIE)?.value;
    if (sessionVal && isValidSessionSecret(sessionVal)) {
        return true;
    }

    // 2. Fallback session Supabase Auth (pour les profils administrateur)
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (profile && (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN' || profile.role === 'AGENCY')) {
                return true;
            }
        }
    } catch {
        // ignore
    }

    return false;
}

export async function sendOtpToPilgrim(email: string) {
    const supabase = createClient();
    
    // 1. Vérifier si le pèlerin existe bien dans la base de données
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .single();
        
    if (profileError || !profile) {
        return { error: "Pèlerin introuvable en base." };
    }

    // Auto-provisioning dans auth.users si l'utilisateur y est manquant
    try {
        const supabaseAdmin = createAdminClient();
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: true
        });
        if (createError) {
            if (!createError.message.includes("already registered") && createError.status !== 422) {
                console.error("Auto-provisioning Supabase Auth error:", createError);
            }
        }
    } catch (e) {
        console.error("Admin client creation error during OTP send:", e);
    }

    // 2. Envoyer le vrai code OTP via Supabase Auth
    const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
            shouldCreateUser: false // Ne pas inscrire de nouvel utilisateur inconnu
        }
    });

    if (authError) {
        return { error: "Erreur lors de l'envoi du code de sécurité : " + authError.message };
    }

    return { success: true };
}

export async function verifyPilgrimOtp(email: string, token: string) {
    const supabase = createClient();
    
    // 1. Vérifier le code OTP auprès de Supabase Auth
    const { data, error: authError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
    });

    if (authError || !data.session) {
        return { error: "Code de sécurité incorrect ou expiré." };
    }

    // 2. Récupérer l'ID utilisateur
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .single();

    if (profile) {
        // Définir le cookie pilgrim_id requis par le reste du dashboard
        cookies().set('pilgrim_id', profile.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 jours
            path: '/',
        });
    }

    return { success: true };
}

export async function logoutPilgrim() {
    const supabase = createClient();
    await supabase.auth.signOut();
    cookies().delete('pilgrim_id');
    redirect('/login');
}
