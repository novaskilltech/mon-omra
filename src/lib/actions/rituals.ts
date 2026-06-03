'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const RitualStepSchema = z.enum([
    'ihram_intention',
    'ihram_talbiyah',
    'tawaf_start',
    'tawaf_complete',
    'sai_safa',
    'sai_marwa',
    'sai_complete',
    'halq_taqsir'
]);

export type RitualStep = z.infer<typeof RitualStepSchema>;

export async function getRitualProgress() {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return [];

    const { data, error } = await supabase
        .from('ritual_progress')
        .select('ritual_step, completed_at')
        .order('completed_at', { ascending: true });

    if (error) {
        console.error("Erreur gRP:", error);
        return [];
    }

    return data.map(d => d.ritual_step as RitualStep);
}

export async function markRitualStepComplete(step: string) {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Non autorisé");

    const parsedStep = RitualStepSchema.safeParse(step);
    if (!parsedStep.success) {
        return { error: "Étape invalide" };
    }

    const { error } = await supabase
        .from('ritual_progress')
        .insert({
            user_id: user.id,
            ritual_step: parsedStep.data
        });

    if (error) {
        // If it's a unique constraint violation, it just means they already checked it. No big deal.
        if (error.code !== '23505') {
            console.error("Erreur mRSC:", error);
            return { error: "Erreur lors de l'enregistrement" };
        }
    }

    revalidatePath('/dashboard/rites');
    return { success: true };
}

export async function unmarkRitualStep(step: string) {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Non autorisé");

    const parsedStep = RitualStepSchema.safeParse(step);
    if (!parsedStep.success) {
        return { error: "Étape invalide" };
    }

    const { error } = await supabase
        .from('ritual_progress')
        .delete()
        .match({ 
            user_id: user.id, 
            ritual_step: parsedStep.data 
        });

    if (error) {
        console.error("Erreur uRS:", error);
        return { error: "Erreur lors de l'annulation" };
    }

    revalidatePath('/dashboard/rites');
    return { success: true };
}
