'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { AgencySettingsSchema, PricingMode } from '@/types/agency';

export async function getAgencySettings() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('agency_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching settings:', error);
        return null;
    }

    return data;
}

export async function updateAgencySettings(pricingMode: PricingMode) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Non autorisé');

    const { error } = await supabase
        .from('agency_settings')
        .upsert({
            agency_id: user.id,
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
