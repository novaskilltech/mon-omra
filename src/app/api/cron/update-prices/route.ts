import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { calculateAdjustedGroupPrice } from '@/lib/actions/flights';

// Helper function to extract airport code from group name
function getAirportFromGroupName(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("lyon") || lowerName.includes("lys")) return "LYON";
    if (lowerName.includes("marseille") || lowerName.includes("mrs")) return "MARSEILLE";
    if (lowerName.includes("bruxelles") || lowerName.includes("bru") || lowerName.includes("brussels")) return "BRUXELLES";
    if (lowerName.includes("charleroi") || lowerName.includes("crl")) return "CHARLEROI";
    if (lowerName.includes("barcelone") || lowerName.includes("bcn") || lowerName.includes("barcelona")) return "BARCELONE";
    if (lowerName.includes("madrid") || lowerName.includes("mad")) return "MADRID";
    if (lowerName.includes("milan") || lowerName.includes("mxp")) return "MILAN";
    if (lowerName.includes("rome") || lowerName.includes("fco")) return "ROME";
    if (lowerName.includes("cologne") || lowerName.includes("cgn")) return "COLOGNE";
    if (lowerName.includes("malaga") || lowerName.includes("agp")) return "MALAGA";
    if (lowerName.includes("nice") || lowerName.includes("nce")) return "NICE";
    if (lowerName.includes("casablanca") || lowerName.includes("cmn")) return "CASABLANCA";
    if (lowerName.includes("tunis") || lowerName.includes("tun")) return "TUNIS";
    if (lowerName.includes("alger") || lowerName.includes("alg")) return "ALGER";
    if (lowerName.includes("caire") || lowerName.includes("cai") || lowerName.includes("cairo")) return "LE CAIRE";
    if (lowerName.includes("zurich") || lowerName.includes("zrh")) return "ZURICH";
    if (lowerName.includes("genève") || lowerName.includes("geneve") || lowerName.includes("gva")) return "GENEVE";
    if (lowerName.includes("mulhouse") || lowerName.includes("mlh") || lowerName.includes("bsl") || lowerName.includes("eap")) return "MULHOUSE";
    if (lowerName.includes("toulouse") || lowerName.includes("tls")) return "TOULOUSE";
    if (lowerName.includes("cdg") || lowerName.includes("ory") || lowerName.includes("bva") || lowerName.includes("paris")) return "PARIS";
    return "PARIS";
}

export async function GET(request: Request) {
    // SerpApi pricing update is suspended by user request
    const isSuspended = true;
    if (isSuspended) {
        return NextResponse.json({ 
            message: 'La vérification automatique des tarifs SerpApi est temporairement suspendue.' 
        }, { status: 200 });
    }

    // 1. Safety check / Authentication via authorization header or query param
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'omrayanair_cron_secret_2026';

    if (secret !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    try {
        // 2. Fetch all active and preparing groups
        const { data: groups, error } = await supabase
            .from('groups')
            .select('id, name, departure_date, price, status')
            .in('status', ['En préparation', 'Complet']);

        if (error) throw error;
        if (!groups || groups.length === 0) {
            return NextResponse.json({ message: 'No active groups found' }, { status: 200 });
        }

        const results = [];

        // 3. Update each group's price with SerpApi
        for (const group of groups) {
            // Wiser groups are excluded from automatic price override (kept on demand)
            if (group.name.toLowerCase().includes('wiser')) {
                results.push({
                    id: group.id,
                    name: group.name,
                    status: 'skipped (wiser formula)'
                });
                continue;
            }

            const airport = getAirportFromGroupName(group.name);
            const dateStr = group.departure_date ? group.departure_date.split('T')[0] : null;

            if (!dateStr) {
                results.push({
                    id: group.id,
                    name: group.name,
                    status: 'skipped (no departure date)'
                });
                continue;
            }

            // We default to the current price as fallback
            const fallbackPrice = group.price ? Number(group.price) : 990;

            const adjustment = await calculateAdjustedGroupPrice(
                group.name,
                airport,
                dateStr,
                fallbackPrice
            );

            // Update the group price in database
            const { error: updateError } = await supabase
                .from('groups')
                .update({ 
                    price: adjustment.adjustedPrice,
                    is_api_success: adjustment.isApiSuccess
                })
                .eq('id', group.id);

            if (updateError) {
                console.error(`Failed to update group ${group.id}:`, updateError);
                results.push({
                    id: group.id,
                    name: group.name,
                    status: 'error',
                    error: updateError.message
                });
            } else {
                results.push({
                    id: group.id,
                    name: group.name,
                    status: 'updated',
                    oldPrice: fallbackPrice,
                    newPrice: adjustment.adjustedPrice,
                    ticketPrice: adjustment.ticketPrice,
                    formula: adjustment.appliedFormula
                });
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results
        }, { status: 200 });

    } catch (e: any) {
        console.error("Cron job error updating prices:", e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
