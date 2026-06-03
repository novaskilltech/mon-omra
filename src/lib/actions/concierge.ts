'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from './auth';

export async function getPilgrimsList(filters?: { groupId?: string; visaStatus?: string }) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();
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
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
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
                checkin_done: false,
                email: data.email
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
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
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
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        // Résolution de l'ID administrateur
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'SUPER_ADMIN')
            .limit(1)
            .single();

        const agencyId = adminProfile?.id || crypto.randomUUID();

        const { error } = await supabase
            .from('payments')
            .insert({
                agency_id: agencyId,
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

export async function requestRegistration(data: {
    email: string;
    firstName: string;
    familyName: string;
    gender: 'M' | 'F';
    phone?: string;
}) {
    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('registration_requests')
            .insert({
                email: data.email,
                first_name: data.firstName,
                family_name: data.familyName,
                gender: data.gender,
                phone: data.phone || null,
                status: 'PENDING'
            });

        if (error) {
            if (error.code === '23505') {
                return { error: "Une demande pour cette adresse e-mail a déjà été soumise." };
            }
            throw error;
        }
        return { success: true };
    } catch (e: any) {
        console.error("Error submitting registration request:", e);
        return { error: e.message || "Erreur lors de la soumission de la demande." };
    }
}

export async function getRegistrationRequests() {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();
    const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching registration requests:", error);
        return [];
    }
    return data;
}

export async function approveRegistrationRequest(requestId: string, groupId?: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        // 1. Get request details
        const { data: request, error: fetchError } = await supabase
            .from('registration_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if (fetchError || !request) {
            throw new Error("Demande introuvable");
        }

        const pilgrimId = crypto.randomUUID();

        // 2. Insert into profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: pilgrimId,
                full_name: `${request.first_name} ${request.family_name}`,
                family_name: request.family_name,
                gender: request.gender,
                role: 'PILGRIM',
                visa_status: 'PENDING',
                checkin_done: false,
                email: request.email
            });

        if (profileError) throw profileError;

        // 3. Insert into pilgrims
        const { error: pilgrimError } = await supabase
            .from('pilgrims')
            .insert({
                id: pilgrimId,
                group_id: groupId || null
            });

        if (pilgrimError) throw pilgrimError;

        // 4. Update request status
        const { error: updateError } = await supabase
            .from('registration_requests')
            .update({ status: 'APPROVED' })
            .eq('id', requestId);

        if (updateError) throw updateError;

        revalidatePath('/backoffice/concierge');
        return { success: true };
    } catch (e: any) {
        console.error("Error approving registration request:", e);
        return { error: e.message || "Erreur lors de la validation." };
    }
}

export async function rejectRegistrationRequest(requestId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('registration_requests')
            .update({ status: 'REJECTED' })
            .eq('id', requestId);

        if (error) throw error;

        revalidatePath('/backoffice/concierge');
        return { success: true };
    } catch (e: any) {
        console.error("Error rejecting registration request:", e);
        return { error: e.message || "Erreur lors du rejet de la demande." };
    }
}

