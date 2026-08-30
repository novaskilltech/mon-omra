'use server';

import { createClient } from '@/utils/supabase/server';
import { isAdminAuthenticated } from './auth';

export interface HajjRequestInput {
    firstName: string;
    familyName: string;
    nationality: string;
    phone: string;
    email: string;
    address: string;
    peopleCount: number;
    hajjYear: number;
    hasNusukAccount?: string;
    nusukAccountYear?: string;
    nusukAccountStatus?: string;
    availabilitySlots?: string;
    adminNotes?: string;
}

export async function createHajjRequestAction(data: HajjRequestInput) {
    const supabase = createClient();
    try {
        if (!data.firstName || !data.familyName || !data.email || !data.phone || !data.nationality || !data.address) {
            return { error: "Veuillez remplir tous les champs obligatoires du formulaire." };
        }

        const cleanEmail = data.email.trim().toLowerCase();
        const year = data.hajjYear && data.hajjYear >= 2027 ? Number(data.hajjYear) : 2027;
        const count = data.peopleCount && data.peopleCount > 0 ? Number(data.peopleCount) : 1;

        const { error } = await supabase
            .from('hajj_requests')
            .insert({
                first_name: data.firstName.trim(),
                family_name: data.familyName.trim(),
                nationality: data.nationality.trim(),
                phone: data.phone.trim(),
                email: cleanEmail,
                address: data.address.trim(),
                people_count: count,
                hajj_year: year,
                has_nusuk_account: data.hasNusukAccount || 'NON',
                nusuk_account_year: data.nusukAccountYear || 'NON_APPLICABLE',
                nusuk_account_status: data.nusukAccountStatus || 'NON_VERIFIE',
                availability_slots: data.availabilitySlots || '',
                admin_notes: data.adminNotes || '',
                status: 'PENDING'
            });

        if (error) {
            console.error("Error inserting hajj_request:", error);
            throw error;
        }

        return { success: true };
    } catch (e: any) {
        console.error("Error in createHajjRequestAction:", e);
        return { error: e.message || "Impossible d'enregistrer votre demande Hajj." };
    }
}

export async function getHajjRequestsAction() {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('hajj_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, requests: data || [] };
    } catch (e: any) {
        console.error("Error in getHajjRequestsAction:", e);
        return { error: e.message || "Erreur lors du chargement des demandes Hajj." };
    }
}

export async function updateHajjRequestStatusAction(id: string, status: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('hajj_requests')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (e: any) {
        console.error("Error in updateHajjRequestStatusAction:", e);
        return { error: e.message || "Erreur de modification du statut." };
    }
}

export async function updateHajjAuditAction(id: string, data: {
    status?: string;
    hasNusukAccount?: string;
    nusukAccountYear?: string;
    nusukAccountStatus?: string;
    availabilitySlots?: string;
    adminNotes?: string;
}) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const payload: any = {};
        if (data.status !== undefined) payload.status = data.status;
        if (data.hasNusukAccount !== undefined) payload.has_nusuk_account = data.hasNusukAccount;
        if (data.nusukAccountYear !== undefined) payload.nusuk_account_year = data.nusukAccountYear;
        if (data.nusukAccountStatus !== undefined) payload.nusuk_account_status = data.nusukAccountStatus;
        if (data.availabilitySlots !== undefined) payload.availability_slots = data.availabilitySlots;
        if (data.adminNotes !== undefined) payload.admin_notes = data.adminNotes;

        const { error } = await supabase
            .from('hajj_requests')
            .update(payload)
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (e: any) {
        console.error("Error in updateHajjAuditAction:", e);
        return { error: e.message || "Erreur lors de la mise à jour de l'audit." };
    }
}

export async function deleteHajjRequestAction(id: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('hajj_requests')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return { success: true };
    } catch (e: any) {
        console.error("Error in deleteHajjRequestAction:", e);
        return { error: e.message || "Erreur lors de la suppression." };
    }
}
