import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { validateHajjApiKey } from '@/lib/utils/hajjSyncAuth';
import { formatEmissionDate } from '@/lib/utils/hajjExport';
import { parseHajjAdminMetadata, mergeHajjAdminMetadata } from '@/lib/utils/hajjMetadata';

export const dynamic = 'force-dynamic';

const VALID_NUSUK_STATUSES = ['VERIFIE', 'NON_VERIFIE', 'EN_ATTENTE_DOCS'];
const VALID_HAS_NUSUK = ['OUI', 'NON', 'EN_COURS'];

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // 1. Authentification M2M
    const authHeader = request.headers.get('authorization') || request.headers.get('x-api-key');
    const auth = validateHajjApiKey(authHeader);

    if (!auth.valid) {
        return NextResponse.json(
            {
                success: false,
                error: auth.error || "Accès non autorisé"
            },
            {
                status: auth.statusCode || 401,
                headers: { 'Cache-Control': 'no-store' }
            }
        );
    }

    const { id } = params;
    if (!id || typeof id !== 'string' || id.trim() === '') {
        return NextResponse.json(
            { success: false, error: "Identifiant du pèlerin (:id) manquant ou invalide." },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    // 2. Parsing du corps de requête
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Corps de requête JSON invalide ou malformé." },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    if (!body || typeof body !== 'object') {
        return NextResponse.json(
            { success: false, error: "Le corps de requête doit être un objet JSON valide." },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    // 3. Extraction et validation des champs modifiables
    const payload: Record<string, any> = {};

    // Statut du dossier (ouvert pour supporter PACKS_VALIDES, CONFIRMED, etc.)
    if (body.status !== undefined) {
        payload.status = String(body.status).trim();
    }

    // Compte Nusuk : Existence
    const rawHasNusuk = body.hasNusukAccount !== undefined ? body.hasNusukAccount : body.has_nusuk_account;
    if (rawHasNusuk !== undefined) {
        const normalized = String(rawHasNusuk).toUpperCase().trim();
        if (!VALID_HAS_NUSUK.includes(normalized)) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: `hasNusukAccount invalide. Valeurs acceptées : ${VALID_HAS_NUSUK.join(', ')}.` 
                },
                { status: 400, headers: { 'Cache-Control': 'no-store' } }
            );
        }
        payload.has_nusuk_account = normalized;
        if (normalized !== 'OUI') {
            payload.nusuk_account_year = 'NON_APPLICABLE';
        }
    }

    // Compte Nusuk : Année
    const rawNusukYear = body.nusukAccountYear !== undefined ? body.nusukAccountYear : body.nusuk_account_year;
    if (rawNusukYear !== undefined && payload.has_nusuk_account !== 'NON') {
        payload.nusuk_account_year = String(rawNusukYear).trim();
    }

    // Compte Nusuk : Statut de vérification
    const rawNusukStatus = body.nusukAccountStatus !== undefined ? body.nusukAccountStatus : body.nusuk_account_status;
    if (rawNusukStatus !== undefined) {
        const normalized = String(rawNusukStatus).toUpperCase().trim();
        if (!VALID_NUSUK_STATUSES.includes(normalized)) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: `nusukAccountStatus invalide. Valeurs acceptées : ${VALID_NUSUK_STATUSES.join(', ')}.` 
                },
                { status: 400, headers: { 'Cache-Control': 'no-store' } }
            );
        }
        payload.nusuk_account_status = normalized;
    }

    // Créneaux de disponibilité
    const rawSlots = body.availabilitySlots !== undefined ? body.availabilitySlots : body.availability_slots;
    if (rawSlots !== undefined) {
        payload.availability_slots = String(rawSlots).trim();
    }

    // Métadonnées de paiement et conseiller
    const hasPaymentOrConseillerOrNotes = 
        body.statutPaiement !== undefined || 
        body.statut_paiement !== undefined ||
        body.montantPaye !== undefined ||
        body.montant_paye !== undefined ||
        body.datePaiement !== undefined ||
        body.date_paiement !== undefined ||
        body.conseiller !== undefined ||
        body.adminNotes !== undefined ||
        body.admin_notes !== undefined;

    // Vérifier qu'au moins un champ valide a été fourni
    if (Object.keys(payload).length === 0 && !hasPaymentOrConseillerOrNotes) {
        return NextResponse.json(
            {
                success: false,
                error: "Aucun champ modifiable fourni. Champs acceptés : status, nusukAccountStatus, hasNusukAccount, statutPaiement, montantPaye, datePaiement, conseiller, adminNotes, availabilitySlots."
            },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    try {
        const supabase = createAdminClient();

        // 4. Vérification d'existence du dossier
        const { data: existing, error: fetchErr } = await supabase
            .from('hajj_requests')
            .select('*')
            .eq('id', id.trim())
            .maybeSingle();

        if (fetchErr) {
            console.error('Erreur Supabase vérification pèlerin:', fetchErr);
            return NextResponse.json(
                { success: false, error: "Erreur base de données lors de la vérification du dossier." },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        if (!existing) {
            return NextResponse.json(
                { success: false, error: `Pèlerin avec l'identifiant '${id}' introuvable.` },
                { status: 404, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        // Fusion des notes et métadonnées de paiement/conseiller
        if (hasPaymentOrConseillerOrNotes) {
            payload.admin_notes = mergeHajjAdminMetadata(existing.admin_notes, {
                statutPaiement: body.statutPaiement || body.statut_paiement,
                montantPaye: body.montantPaye !== undefined ? body.montantPaye : body.montant_paye,
                datePaiement: body.datePaiement || body.date_paiement,
                conseiller: body.conseiller,
                adminNotes: body.adminNotes !== undefined ? body.adminNotes : body.admin_notes
            });
        }

        // 5. Exécution de la mise à jour
        const { data: updated, error: updateErr } = await supabase
            .from('hajj_requests')
            .update(payload)
            .eq('id', id.trim())
            .select('*')
            .single();

        if (updateErr) {
            console.error('Erreur Supabase mise à jour pèlerin:', updateErr);
            return NextResponse.json(
                { success: false, error: "Erreur lors de la mise à jour du dossier en base de données." },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        const emission = formatEmissionDate(updated.created_at);
        const parsedMeta = parseHajjAdminMetadata(updated.admin_notes);
        const fullName = `${updated.first_name || ''} ${updated.family_name || ''}`.trim();
        const nowIso = new Date().toISOString();

        return NextResponse.json(
            {
                success: true,
                message: "Dossier pèlerin mis à jour avec succès.",
                data: {
                    id: updated.id,
                    fullName,
                    firstName: updated.first_name,
                    familyName: updated.family_name,
                    status: updated.status,
                    nusukAccountStatus: updated.nusuk_account_status,
                    hasNusukAccount: updated.has_nusuk_account,
                    nusukAccountYear: updated.nusuk_account_year,
                    // Suivi financier & conciergerie
                    statutPaiement: parsedMeta.statutPaiement,
                    montantPaye: parsedMeta.montantPaye,
                    datePaiement: parsedMeta.datePaiement,
                    conseiller: parsedMeta.conseiller,
                    adminNotes: updated.admin_notes,
                    availabilitySlots: updated.availability_slots,
                    // Horodatages
                    updatedAt: nowIso,
                    dateEmission: emission.iso,
                    createdAt: updated.created_at || emission.iso
                }
            },
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'
                }
            }
        );
    } catch (err: any) {
        console.error('Exception PATCH /api/v1/hajj/pilgrims/[id]:', err);
        return NextResponse.json(
            { success: false, error: "Erreur interne du serveur lors de la mise à jour." },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}

// Support de la méthode PUT comme alias transparent de PATCH
export const PUT = PATCH;
