'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolvePilgrimIdByEmail } from './logistics';
import { isAdminAuthenticated } from './auth';

export interface FeedbackData {
    flight_rating: number;
    makkah_hotel_rating: number;
    madinah_hotel_rating: number;
    guide_rating: number;
    overall_rating: number;
    comment?: string;
}

/**
 * Submits or updates a feedback for the logged-in pilgrim.
 */
export async function submitFeedbackAction(data: FeedbackData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : null);

    if (!resolvedId) {
        return { error: 'Non autorisé' };
    }

    // Validate notes
    const ratings = [
        data.flight_rating,
        data.makkah_hotel_rating,
        data.madinah_hotel_rating,
        data.guide_rating,
        data.overall_rating
    ];

    for (const r of ratings) {
        if (typeof r !== 'number' || r < 1 || r > 5) {
            return { error: 'Les notes doivent être comprises entre 1 et 5' };
        }
    }

    try {
        // Fetch pilgrim's group_id
        const { data: pilgrim } = await supabase
            .from('pilgrims')
            .select('group_id')
            .eq('id', resolvedId)
            .maybeSingle();

        const groupId = pilgrim?.group_id || null;

        // Upsert to ensure one feedback per pilgrim
        const { error } = await supabase
            .from('pilgrim_feedbacks')
            .upsert({
                pilgrim_id: resolvedId,
                group_id: groupId,
                flight_rating: data.flight_rating,
                makkah_hotel_rating: data.makkah_hotel_rating,
                madinah_hotel_rating: data.madinah_hotel_rating,
                guide_rating: data.guide_rating,
                overall_rating: data.overall_rating,
                comment: data.comment || null,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'pilgrim_id'
            });

        if (error) throw error;

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/feedback');
        revalidatePath('/backoffice/feedbacks');
        
        return { success: true };
    } catch (e: any) {
        console.error('Submit feedback error:', e);
        return { error: e.message || "Erreur lors de la soumission de l'évaluation." };
    }
}

/**
 * Gets feedback for the logged-in pilgrim.
 */
export async function getPilgrimFeedback() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
    const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : null);

    if (!resolvedId) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('pilgrim_feedbacks')
            .select('*')
            .eq('pilgrim_id', resolvedId)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error('Error fetching pilgrim feedback:', e);
        return null;
    }
}

/**
 * Gets all feedbacks for admin dashboard.
 */
export async function getAllFeedbacks() {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        throw new Error('Non autorisé');
    }

    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from('pilgrim_feedbacks')
            .select(`
                *,
                profiles (
                    full_name
                ),
                groups (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Error fetching all feedbacks:', e);
        return [];
    }
}

/**
 * Checks if the pilgrim is eligible to see/submit feedback (based on their return date or group check-out)
 * and if they have already submitted one.
 */
export async function checkFeedbackStatus(pilgrimId: string, email?: string) {
    const supabase = createClient();
    const resolvedId = await resolvePilgrimIdByEmail(pilgrimId, email);

    try {
        // 1. Check if feedback has already been submitted
        const { data: existingFeedback } = await supabase
            .from('pilgrim_feedbacks')
            .select('id')
            .eq('pilgrim_id', resolvedId)
            .maybeSingle();

        const hasSubmitted = !!existingFeedback;

        // 2. Determine target return date
        let returnDate: Date | null = null;

        // A. Check pilgrim table for group_id and individual_flight_info
        const { data: pilgrim } = await supabase
            .from('pilgrims')
            .select('group_id, individual_flight_info')
            .eq('id', resolvedId)
            .maybeSingle();

        if (pilgrim) {
            // Check individual flight info return flight
            if (pilgrim.individual_flight_info) {
                const indFlight = pilgrim.individual_flight_info as any;
                const flights = indFlight.flights || [];
                if (Array.isArray(flights) && flights.length > 0) {
                    let maxTime = 0;
                    for (const f of flights) {
                        if (f.arrival_time) {
                            const t = new Date(f.arrival_time).getTime();
                            if (t > maxTime) maxTime = t;
                        }
                    }
                    if (maxTime > 0) {
                        returnDate = new Date(maxTime);
                    }
                }
            }

            // B. If no return date found from individual flight, check group return flight
            if (!returnDate && pilgrim.group_id) {
                const { data: groupLogistics } = await supabase
                    .from('group_logistics')
                    .select('flight_return_id')
                    .eq('group_id', pilgrim.group_id)
                    .maybeSingle();

                if (groupLogistics && groupLogistics.flight_return_id) {
                    const { data: flight } = await supabase
                        .from('flights')
                        .select('*, flight_segments(*)')
                        .eq('id', groupLogistics.flight_return_id)
                        .maybeSingle();

                    if (flight && flight.flight_segments && flight.flight_segments.length > 0) {
                        let maxTime = 0;
                        for (const s of flight.flight_segments) {
                            if (s.arrival_time) {
                                const t = new Date(s.arrival_time).getTime();
                                if (t > maxTime) maxTime = t;
                            }
                        }
                        if (maxTime > 0) {
                            returnDate = new Date(maxTime);
                        }
                    }
                }

                // C. If still no flight return date, fall back to check_out date of latest group hotel stay
                if (!returnDate) {
                    const { data: stays } = await supabase
                        .from('group_hotel_stays')
                        .select('check_out')
                        .eq('group_id', pilgrim.group_id)
                        .order('check_out', { ascending: false });

                    if (stays && stays.length > 0 && stays[0].check_out) {
                        returnDate = new Date(stays[0].check_out);
                    }
                }
            }
        }

        // D. Fallback / Dev Mode
        let ready = false;
        if (returnDate) {
            const now = new Date();
            const returnDay = new Date(returnDate);
            returnDay.setHours(0, 0, 0, 0);
            ready = now.getTime() >= returnDay.getTime();
        } else if (pilgrimId.startsWith('demo')) {
            ready = true; // Always show in demo mode for UI validation
        }

        return {
            ready,
            hasSubmitted,
            returnDate: returnDate ? returnDate.toISOString() : null
        };
    } catch (e) {
        console.error('Error checking feedback status:', e);
        return { ready: false, hasSubmitted: false, returnDate: null };
    }
}
