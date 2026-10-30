import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { validateHajjApiKey } from '@/lib/utils/hajjSyncAuth';
import { formatEmissionDate } from '@/lib/utils/hajjExport';

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
