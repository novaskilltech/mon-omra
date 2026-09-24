'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { AgencySettingsSchema, PricingMode } from '@/types/agency';
import { isAdminAuthenticated } from './auth';

async function getAuthUserId(supabase: any): Promise<string> {
    const isAdmin = await isAdminAuthenticated();
    if (isAdmin) {
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'SUPER_ADMIN')
            .limit(1)
            .single();
        if (adminProfile) return adminProfile.id;
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || '';
}

export async function getAgencySettings() {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);

    if (!userId) return null;

    const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('agency_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching settings:', error);
        return null;
    }

    return data;
}

export async function updateAgencySettings(pricingMode: PricingMode) {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);

    if (!userId) throw new Error('Non autorisé');

    const { error } = await supabase
        .from('agency_settings')
        .upsert({
            agency_id: userId,
            pricing_mode: pricingMode,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error('Error updating settings:', error);
        return { error: "Erreur lors de la mise à jour des réglages." };
    }

    revalidatePath('/backoffice/settings');
    return { success: true };
}

export async function updateAgencyOnboardingPasscode(newPasscode: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const trimmed = (newPasscode || '').trim();
    if (!trimmed || trimmed.length < 3) {
        return { error: "Le mot de passe doit comporter au moins 3 caractères." };
    }

    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) return { error: "Utilisateur introuvable" };

    const { error } = await supabase
        .from('agency_settings')
        .upsert({
            agency_id: userId,
            onboarding_passcode: trimmed,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        console.error('Error updating onboarding passcode:', error);
        return { error: "Erreur lors de la mise à jour du mot de passe." };
    }

    revalidatePath('/backoffice/concierge');
    revalidatePath('/backoffice/settings');
    return { success: true, passcode: trimmed };
}

