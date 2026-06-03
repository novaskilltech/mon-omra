'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPilgrimsList(filters?: { groupId?: string; visaStatus?: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

    let query = supabase
        .from('profiles')
        .select(`
            *,
            pilgrims!inner(
                id,
                group_id,
                groups(name)
            )
        `)
        .eq('role', 'PILGRIM');

    if (filters?.groupId) {
        query = query.eq('pilgrims.group_id', filters.groupId);
    }
    if (filters?.visaStatus) {
        query = query.eq('visa_status', filters.visaStatus);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching pilgrims:", error);
        return [];
    }

    return data.map((p: any) => ({
        id: p.id,
        first_name: p.full_name?.split(' ')[0] || '',
        family_name: p.family_name || p.full_name?.split(' ')[1] || '',
        gender: p.gender,
        visa_status: p.visa_status || 'PENDING',
        visa_url: p.visa_url || '',
        checkin_done: !!p.checkin_done,
        group_name: p.pilgrims?.[0]?.groups?.name || 'Sans Groupe',
        group_id: p.pilgrims?.[0]?.group_id || null
    }));
}

export async function createPilgrim(data: {
    email: string;
    firstName: string;
    familyName: string;
    gender: 'M' | 'F';
    groupId?: string;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    try {
        // Enregistrement d'un utilisateur factice dans profiles pour la démonstration locale
        // (Dans une vraie app, on utiliserait supabase.auth.admin.createUser)
        const fakeUserId = crypto.randomUUID();

        // 1. Insère le profil
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: fakeUserId,
                full_name: `${data.firstName} ${data.familyName}`,
                family_name: data.familyName,
                gender: data.gender,
                role: 'PILGRIM',
                visa_status: 'PENDING',
                checkin_done: false
            });

        if (profileError) throw profileError;

        // 2. Insère dans la table pilgrims
        const { error: pilgrimError } = await supabase
            .from('pilgrims')
            .insert({
                id: fakeUserId,
                group_id: data.groupId || null
            });

        if (pilgrimError) throw pilgrimError;

        revalidatePath('/backoffice/concierge');
        return { success: true, id: fakeUserId };
    } catch (e: any) {
        console.error("Error creating pilgrim:", e);
        return { error: e.message || "Erreur lors de la création du pèlerin" };
    }
}

export async function updateVisaStatus(
    pilgrimId: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    visaUrl?: string
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                visa_status: status,
                visa_url: visaUrl || null
            })
            .eq('id', pilgrimId);

        if (error) throw error;

        revalidatePath('/backoffice/concierge');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Error updating visa status:", e);
        return { error: e.message || "Erreur lors de la mise à jour du visa" };
    }
}

export async function addPayment(
    pilgrimId: string,
    amount: number,
    method: 'CASH' | 'TRANSFER' | 'CARD' | 'CHECK',
    reference?: string
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

    try {
        const { error } = await supabase
            .from('payments')
            .insert({
                agency_id: user.id,
                pilgrim_id: pilgrimId,
                amount: amount,
                method: method,
                status: 'COMPLETED',
                reference: reference || null
            });

        if (error) throw error;

        revalidatePath('/backoffice/concierge');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Error adding payment:", e);
        return { error: e.message || "Erreur lors de l'enregistrement du règlement" };
    }
}

export async function getPilgrimPayments(pilgrimId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('pilgrim_id', pilgrimId);

    if (error) {
        console.error("Error fetching pilgrim payments:", error);
        return [];
    }
    return data;
}

export async function getGroups() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('groups')
        .select('id, name');
    
    if (error) {
        console.error("Error fetching groups:", error);
        return [];
    }
    return data;
}
