'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { PilgrimSelfOnboardingSchema, VerifyPasscodeSchema, PilgrimSelfOnboardingInput } from '@/types/onboarding';
import { isAdminAuthenticated } from './auth';

// ---------------------------------------------------------------------------
// Rate Limiting (Anti brute-force pour le passcode pèlerin)
// ---------------------------------------------------------------------------
interface AttemptRecord {
    count: number;
    firstAttemptAt: number;
    blockedUntil?: number;
}

const attemptsMap = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(): string {
    try {
        const headerList = headers();
        const forwardedFor = headerList.get('x-forwarded-for');
        if (forwardedFor) {
            return forwardedFor.split(',')[0].trim();
        }
        return headerList.get('x-real-ip') || '127.0.0.1';
    } catch {
        return '127.0.0.1';
    }
}

function checkRateLimit(ip: string): { blocked: boolean; message?: string } {
    const record = attemptsMap.get(ip);
    if (!record) return { blocked: false };

    const now = Date.now();

    if (record.blockedUntil && now < record.blockedUntil) {
        const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
        return {
            blocked: true,
            message: `Trop de tentatives infructueuses. Veuillez patienter encore ${remainingMinutes} minute(s).`
        };
    }

    // Reset window after 15 min
    if (now - record.firstAttemptAt > BLOCK_DURATION_MS) {
        attemptsMap.delete(ip);
        return { blocked: false };
    }

    return { blocked: false };
}

function recordFailedAttempt(ip: string) {
    const now = Date.now();
    const record = attemptsMap.get(ip) || { count: 0, firstAttemptAt: now };
    record.count += 1;

    if (record.count >= MAX_ATTEMPTS) {
        record.blockedUntil = now + BLOCK_DURATION_MS;
    }
    attemptsMap.set(ip, record);
}

function resetAttempts(ip: string) {
    attemptsMap.delete(ip);
}

function safeCompare(a: string, b: string): boolean {
    const normA = (a || '').trim().toLowerCase();
    const normB = (b || '').trim().toLowerCase();
    if (normA.length !== normB.length) return false;
    try {
        return crypto.timingSafeEqual(Buffer.from(normA), Buffer.from(normB));
    } catch {
        return normA === normB;
    }
}

// ---------------------------------------------------------------------------
// Helpers Passcode
// ---------------------------------------------------------------------------
export async function getExpectedOnboardingPasscode(): Promise<string> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('agency_settings')
            .select('onboarding_passcode')
            .limit(1)
            .single();

        if (!error && data?.onboarding_passcode) {
            return data.onboarding_passcode.trim();
        }
    } catch (e) {
        console.error("Erreur lors de la lecture du code d'enrôlement :", e);
    }
    return process.env.ONBOARDING_PASSCODE || 'OMRA2026';
}

// ---------------------------------------------------------------------------
// Server Actions Publiques Sécurisées
// ---------------------------------------------------------------------------

/**
 * Vérifie le code d'accès agence saisi par le pèlerin
 */
export async function verifyOnboardingPasscodeAction(passcode: string) {
    const parseResult = VerifyPasscodeSchema.safeParse({ passcode });
    if (!parseResult.success) {
        const msg = (parseResult.error as any).issues?.[0]?.message || (parseResult.error as any).errors?.[0]?.message || "Mot de passe requis";
        return { error: msg };
    }

    const ip = getClientIp();
    const rateCheck = checkRateLimit(ip);
    if (rateCheck.blocked) {
        return { error: rateCheck.message };
    }

    const expectedPasscode = await getExpectedOnboardingPasscode();
    const isValid = safeCompare(parseResult.data.passcode, expectedPasscode);

    if (!isValid) {
        recordFailedAttempt(ip);
        return { error: "Mot de passe d'accès incorrect. Veuillez vérifier le code communiqué par votre agence." };
    }

    resetAttempts(ip);

    // Définition d'un cookie sécurisé de session de déverrouillage
    cookies().set('omra_onboarding_unlocked', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2, // 2 heures
        path: '/'
    });

    return { success: true };
}

/**
 * Vérifie si la session d'inscription est déverrouillée
 */
export async function checkOnboardingUnlockedAction(): Promise<boolean> {
    const val = cookies().get('omra_onboarding_unlocked')?.value;
    return val === 'true';
}

/**
 * Récupère les aéroports disponibles sur la plateforme
 */
export async function getAvailableAirportsAction(): Promise<string[]> {
    const defaultAirports = ['PARIS', 'LYON', 'MARSEILLE', 'TOULOUSE', 'NICE', 'NANTES', 'BRUXELLES', 'CHARLEROI', 'GENEVE'];
    try {
        const supabase = createClient();
        const { data: groups } = await supabase
            .from('groups')
            .select('name');

        const detectedAirports = new Set<string>(defaultAirports);
        if (groups) {
            groups.forEach((g: any) => {
                const upper = (g.name || '').toUpperCase();
                for (const airport of defaultAirports) {
                    if (upper.includes(airport)) {
                        detectedAirports.add(airport);
                    }
                }
            });
        }
        return Array.from(detectedAirports).sort();
    } catch {
        return defaultAirports.sort();
    }
}

/**
 * Soumission complète du formulaire d'auto-enrôlement pèlerin
 */
export async function submitPilgrimSelfOnboardingAction(rawInput: PilgrimSelfOnboardingInput) {
    // 1. Validation stricte Zod
    const parsed = PilgrimSelfOnboardingSchema.safeParse(rawInput);
    if (!parsed.success) {
        const msg = (parsed.error as any).issues?.[0]?.message || (parsed.error as any).errors?.[0]?.message || "Données invalides.";
        return { error: msg };
    }

    const data = parsed.data;

    // 2. Double vérification du Passcode côté serveur (Anti-bypass)
    const expectedPasscode = await getExpectedOnboardingPasscode();
    if (!safeCompare(data.passcode, expectedPasscode)) {
        return { error: "Accès refusé : mot de passe d'enrôlement invalide." };
    }

    const supabaseAdmin = createAdminClient();
    const normalizedEmail = data.email.trim().toLowerCase();

    try {
        let realUserId: string = crypto.randomUUID();

        // 3. Création ou liaison du compte Auth Supabase
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            email_confirm: true
        });

        if (authError) {
            if (authError.message.includes("already registered") || authError.status === 422) {
                const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (!listError && listData?.users) {
                    const matchedUser = listData.users.find(u => u.email === normalizedEmail);
                    if (matchedUser) {
                        realUserId = matchedUser.id;
                    } else {
                        throw authError;
                    }
                } else {
                    throw authError;
                }
            } else {
                throw authError;
            }
        } else if (authUser?.user) {
            realUserId = authUser.user.id;
        }

        // 4. Upsert du profil pèlerin avec les nouvelles coordonnées et numéro de facture
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: realUserId,
                full_name: `${data.firstName.trim()} ${data.familyName.trim()}`,
                family_name: data.familyName.trim(),
                gender: data.gender,
                role: 'PILGRIM', // Verrouillé strictement côté serveur
                phone: data.phone.trim(),
                address: data.address.trim(),
                postal_code: data.postalCode.trim(),
                city: data.city.trim(),
                invoice_number: data.invoiceNumber.trim(),
                email: normalizedEmail,
                visa_status: 'PENDING',
                checkin_done: false,
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error("Erreur insertion profil:", profileError);
            throw profileError;
        }

        // 5. Recherche d'un groupe correspondant ou conservation à null si non créé
        let targetGroupId = data.groupId || null;
        if (!targetGroupId) {
            const { data: matchedGroups } = await supabaseAdmin
                .from('groups')
                .select('id, name, departure_date')
                .ilike('name', `%${data.departureAirport}%`)
                .limit(1);

            if (matchedGroups && matchedGroups.length > 0) {
                targetGroupId = matchedGroups[0].id;
            }
        }

        // 6. Enregistrement dans la table pilgrims
        const flightDetails = {
            requested_airport: data.departureAirport,
            requested_dates: data.travelDates,
            invoice_number: data.invoiceNumber.trim(),
            registration_source: 'SELF_ONBOARDING_PORTAL',
            registered_at: new Date().toISOString()
        };

        const { error: pilgrimError } = await supabaseAdmin
            .from('pilgrims')
            .upsert({
                id: realUserId,
                group_id: targetGroupId,
                individual_flight_info: flightDetails,
                requested_room_type: data.requestedRoomType || 'DOUBLE'
            });

        if (pilgrimError) {
            console.error("Erreur insertion pilgrims:", pilgrimError);
            throw pilgrimError;
        }

        // Revalidation du Backoffice Conciergerie
        revalidatePath('/backoffice/concierge');
        revalidatePath('/backoffice/groups');

        return {
            success: true,
            pilgrimId: realUserId,
            invoiceNumber: data.invoiceNumber.trim(),
            fullName: `${data.firstName.trim()} ${data.familyName.trim()}`
        };

    } catch (err: any) {
        console.error("Erreur submitPilgrimSelfOnboardingAction:", err);
        return { error: "Une erreur est survenue lors de l'enregistrement de votre dossier. Veuillez contacter l'agence." };
    }
}

/**
 * Récupère le mot de passe actuel pour l'administrateur dans le backoffice
 */
export async function getAdminOnboardingPasscodeAction() {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const passcode = await getExpectedOnboardingPasscode();
    return { success: true, passcode };
}
