'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
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
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    const resolvedId = pilgrimCookieId || user?.id;
    
    if (!resolvedId) return [];

    const { data, error } = await supabase
        .from('ritual_progress')
        .select('ritual_step, completed_at')
        .eq('user_id', resolvedId)
        .order('completed_at', { ascending: true });

    if (error) {
        console.error("Erreur gRP:", error);
        return [];
    }

    return data.map(d => d.ritual_step as RitualStep);
}

export async function markRitualStepComplete(step: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    const resolvedId = pilgrimCookieId || user?.id;
    
    if (!resolvedId) throw new Error("Non autorisé");

    const parsedStep = RitualStepSchema.safeParse(step);
    if (!parsedStep.success) {
        return { error: "Étape invalide" };
    }

    const { error } = await supabase
        .from('ritual_progress')
        .insert({
            user_id: resolvedId,
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
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    const resolvedId = pilgrimCookieId || user?.id;
    
    if (!resolvedId) throw new Error("Non autorisé");

    const parsedStep = RitualStepSchema.safeParse(step);
    if (!parsedStep.success) {
        return { error: "Étape invalide" };
    }

    const { error } = await supabase
        .from('ritual_progress')
        .delete()
        .match({ 
            user_id: resolvedId, 
            ritual_step: parsedStep.data 
        });

    if (error) {
        console.error("Erreur uRS:", error);
        return { error: "Erreur lors de l'annulation" };
    }

    revalidatePath('/dashboard/rites');
    return { success: true };
}
