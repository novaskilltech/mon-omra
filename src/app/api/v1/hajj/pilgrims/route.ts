import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { validateHajjApiKey } from '@/lib/utils/hajjSyncAuth';
import { formatEmissionDate } from '@/lib/utils/hajjExport';
import { parseHajjAdminMetadata, mergeHajjAdminMetadata } from '@/lib/utils/hajjMetadata';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // 1. Extraction et validation de la clé API (Bearer ou X-API-Key)
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

    // 2. Traitement des paramètres de filtrage et synchronisation delta
    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get('since');
    const statusParam = searchParams.get('status');
    const yearParam = searchParams.get('year');
    const limitParam = searchParams.get('limit');

    const limit = Math.min(Math.max(parseInt(limitParam || '100', 10) || 100, 1), 500);

    try {
        const supabase = createAdminClient();
        let query = supabase
            .from('hajj_requests')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        // Synchronisation différentielle : filtrage par date d'émission (depuis la dernière synchro)
        if (sinceParam) {
            const sinceDate = new Date(sinceParam);
            if (!isNaN(sinceDate.getTime())) {
                query = query.gt('created_at', sinceDate.toISOString());
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Le paramètre 'since' doit être une date ISO valide (ex: 2026-10-30T00:00:00.000Z)."
                    },
                    { status: 400, headers: { 'Cache-Control': 'no-store' } }
                );
            }
        }

        if (statusParam) {
            query = query.eq('status', statusParam);
        }

        if (yearParam && !isNaN(parseInt(yearParam, 10))) {
            query = query.eq('hajj_year', parseInt(yearParam, 10));
        }

        const { data, error } = await query;

        if (error) {
            console.error('Erreur Supabase API Hajj sync:', error);
            return NextResponse.json(
                { success: false, error: "Erreur lors de la récupération des données pèlerins." },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        const pilgrims = (data || []).map((row) => {
            const emission = formatEmissionDate(row.created_at);
            const parsedMeta = parseHajjAdminMetadata(row.admin_notes);
            const fullName = `${row.first_name || ''} ${row.family_name || ''}`.trim();

            return {
                id: row.id,
                // Identité & contact
                fullName,
                firstName: row.first_name,
                familyName: row.family_name,
                nationality: row.nationality,
                phone: row.phone,
                email: row.email,
                address: row.address,
                // Dossier Hajj
                peopleCount: row.people_count,
                hajjYear: row.hajj_year,
                partnerAgency: "Yusr Al Mashaer",
                // Profil Nusuk
                hasNusukAccount: row.has_nusuk_account || 'NON',
                nusukAccountYear: row.nusuk_account_year || 'NON_APPLICABLE',
                nusukAccountStatus: row.nusuk_account_status || 'NON_VERIFIE',
                availabilitySlots: row.availability_slots || '',
                status: row.status || 'PENDING',
                adminNotes: row.admin_notes || '',
                // Métadonnées conciergerie & paiement
                statutPaiement: parsedMeta.statutPaiement,
                montantPaye: parsedMeta.montantPaye,
                datePaiement: parsedMeta.datePaiement,
                conseiller: parsedMeta.conseiller,
                // Date d'émission du formulaire pour chaque client
                dateEmission: emission.iso,
                dateEmissionFormatee: emission.formattedFr,
                dateEmissionTimestamp: emission.timestamp,
                submissionDate: emission.dateOnly,
                submittedAt: emission.iso,
                createdAt: row.created_at || emission.iso,
                // Rétrocompatibilité snake_case
                raw: {
                    first_name: row.first_name,
                    family_name: row.family_name,
                    nationality: row.nationality,
                    phone: row.phone,
                    email: row.email,
                    address: row.address,
                    people_count: row.people_count,
                    hajj_year: row.hajj_year,
                    has_nusuk_account: row.has_nusuk_account,
                    nusuk_account_year: row.nusuk_account_year,
                    nusuk_account_status: row.nusuk_account_status,
                    availability_slots: row.availability_slots,
                    admin_notes: row.admin_notes,
                    status: row.status,
                    created_at: row.created_at
                }
            };
        });

        return NextResponse.json(
            {
                success: true,
                count: pilgrims.length,
                limit,
                syncedAt: new Date().toISOString(),
                filters: {
                    since: sinceParam || null,
                    status: statusParam || null,
                    year: yearParam ? parseInt(yearParam, 10) : null
                },
                data: pilgrims
            },
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
            }
        );
    } catch (err: any) {
        console.error('Exception API Hajj sync:', err);
        return NextResponse.json(
            { success: false, error: "Erreur interne du serveur lors de la synchronisation." },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}

/**
 * Création directe d'une inscription pèlerin depuis une plateforme externe / tunnel de secours
 */
export async function POST(request: NextRequest) {
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
            { success: false, error: "Le corps de requête doit être un objet JSON." },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    // Extraction et normalisation des identifiants (firstName, familyName ou fullName)
    let firstName = body.firstName || body.first_name || '';
    let familyName = body.familyName || body.family_name || '';

    if ((!firstName || !familyName) && body.fullName) {
        const parts = String(body.fullName).trim().split(/\s+/);
        firstName = parts[0] || '';
        familyName = parts.slice(1).join(' ') || parts[0] || '';
    }

    firstName = String(firstName).trim();
    familyName = String(familyName).trim();

    if (!firstName || !familyName) {
        return NextResponse.json(
            { success: false, error: "Veuillez fournir le prénom ('firstName') et le nom de famille ('familyName') ou le 'fullName'." },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();

    if (!email || !email.includes('@')) {
        return NextResponse.json(
            { success: false, error: "Adresse e-mail invalide ou manquante." },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    if (!phone || phone.length < 6) {
        return NextResponse.json(
            { success: false, error: "Numéro de téléphone invalide ou manquant." },
            { status: 400, headers: { 'Cache-Control': 'no-store' } }
        );
    }

    const nationality = String(body.nationality || 'Française').trim();
    const address = String(body.address || 'Non renseignée').trim();
    const peopleCount = Math.max(parseInt(body.peopleCount || body.people_count || '1', 10) || 1, 1);
    const hajjYear = Math.max(parseInt(body.hajjYear || body.hajj_year || '2027', 10) || 2027, 2027);
    const status = String(body.status || 'PENDING').trim();
    const hasNusukAccount = String(body.hasNusukAccount || body.has_nusuk_account || 'NON').toUpperCase().trim();
    const nusukAccountYear = String(body.nusukAccountYear || body.nusuk_account_year || 'NON_APPLICABLE').trim();
    const nusukAccountStatus = String(body.nusukAccountStatus || body.nusuk_account_status || 'NON_VERIFIE').toUpperCase().trim();
    const availabilitySlots = String(body.availabilitySlots || body.availability_slots || '').trim();

    // Notes administratives avec métadonnées
    const rawAdminNotes = body.adminNotes !== undefined ? body.adminNotes : (body.admin_notes || '');
    const finalAdminNotes = mergeHajjAdminMetadata(rawAdminNotes, {
        statutPaiement: body.statutPaiement || body.statut_paiement,
        montantPaye: body.montantPaye !== undefined ? body.montantPaye : body.montant_paye,
        datePaiement: body.datePaiement || body.date_paiement,
        conseiller: body.conseiller,
        adminNotes: rawAdminNotes
    });

    try {
        const supabase = createAdminClient();

        const insertPayload = {
            first_name: firstName,
            family_name: familyName,
            nationality,
            phone,
            email,
            address,
            people_count: peopleCount,
            hajj_year: hajjYear,
            has_nusuk_account: hasNusukAccount,
            nusuk_account_year: hasNusukAccount === 'OUI' ? nusukAccountYear : 'NON_APPLICABLE',
            nusuk_account_status: nusukAccountStatus,
            availability_slots: availabilitySlots,
            admin_notes: finalAdminNotes,
            status: status
        };

        const { data, error } = await supabase
            .from('hajj_requests')
            .insert(insertPayload)
            .select('*')
            .single();

        if (error) {
            console.error('Erreur Supabase insertion pèlerin POST:', error);
            return NextResponse.json(
                { success: false, error: "Erreur base de données lors de la création du pèlerin." },
                { status: 500, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        const emission = formatEmissionDate(data.created_at);
        const fullName = `${data.first_name || ''} ${data.family_name || ''}`.trim();

        return NextResponse.json(
            {
                success: true,
                message: "Pèlerin créé avec succès.",
                data: {
                    id: data.id,
                    fullName,
                    firstName: data.first_name,
                    familyName: data.family_name,
                    email: data.email,
                    phone: data.phone,
                    hajjYear: data.hajj_year,
                    status: data.status,
                    createdAt: data.created_at || emission.iso,
                    dateEmission: emission.iso
                }
            },
            {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store'
                }
            }
        );
    } catch (err: any) {
        console.error('Exception POST /api/v1/hajj/pilgrims:', err);
        return NextResponse.json(
            { success: false, error: "Erreur interne du serveur lors de la création du dossier." },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
