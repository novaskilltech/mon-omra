'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { FlightSchema, Flight } from '@/types/logistics';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { isAdminAuthenticated } from './auth';


async function getAuthUserId(supabase: any): Promise<string> {
    const isAdmin = await isAdminAuthenticated();
    if (isAdmin) {
        try {
            const adminClient = createAdminClient();
            const { data: adminProfile } = await adminClient
                .from('profiles')
                .select('id')
                .eq('role', 'SUPER_ADMIN')
                .limit(1)
                .single();
            if (adminProfile) return adminProfile.id;
        } catch (e) {
            console.error("Error fetching admin profile:", e);
        }
        return '00000000-0000-0000-0000-000000000000';
    }
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || '';
}

/**
 * LOGISTICS ACTIONS (LOT 2)
 * Implementation of server-side logic for Flights and Hotels
 */

export async function createFlight(data: Flight) {
    const supabase = createClient();

    // 1. Get authenticated user
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    // 2. Validation logic
    const validated = FlightSchema.parse(data);

    // 3. Insert parent Flight (FORCE agency_id from session)
    const { data: flight, error: flightError } = await supabase
        .from('flights')
        .insert({
            agency_id: userId, // Secure: never trust client provided ID
            type: validated.type,
        })
        .select()
        .single();

    if (flightError) throw new Error(flightError.message);

    // 3. Insert Segments with sequence order
    const segments = validated.segments.map((s: any, index: number) => ({
        flight_id: flight.id,
        flight_number: s.flight_number,
        airline: s.airline,
        departure_airport: s.departure_airport,
        arrival_airport: s.arrival_airport,
        departure_time: s.departure_time,
        arrival_time: s.arrival_time,
        sequence_order: index,
    }));

    const { error: segmentsError } = await supabase
        .from('flight_segments')
        .insert(segments);

    if (segmentsError) throw new Error(segmentsError.message);

    revalidatePath('/backoffice/logistics/flights');
    return { success: true, id: flight.id };
}

export async function getAgencyFlights() {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    const { data, error } = await supabase
        .from('flights')
        .select(`
            *,
            flight_segments (*)
        `)
        .eq('agency_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getAgencyHotels() {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    const { data, error } = await supabase
        .from('hotels')
        .select(`
            *,
            rooms (*)
        `)
        .eq('agency_id', userId);

    if (error) throw new Error(error.message);
    return data;
}

export async function createHotel(formData: FormData) {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    const rawData = {
        name: formData.get('name') as string,
        city: formData.get('city') as string,
        stars: parseInt(formData.get('stars') as string) || 3,
        double_qty: parseInt(formData.get('DOUBLE_qty') as string) || 0,
        triple_qty: parseInt(formData.get('TRIPLE_qty') as string) || 0,
        quadruple_qty: parseInt(formData.get('QUADRUPLE_qty') as string) || 0,
    };

    if (!rawData.name) return { error: "Le nom de l'hôtel est obligatoire." };

    try {
        // 1. Create Hotel
        const { data: hotel, error: hotelError } = await supabase
            .from('hotels')
            .insert({
                agency_id: userId,
                name: rawData.name,
                city: rawData.city,
                stars: rawData.stars,
            })
            .select()
            .single();

        if (hotelError) throw hotelError;

        // 2. Generate Rooms based on quantity
        const roomsToInsert: any[] = [];
        
        const addRooms = (type: string, qty: number, capacity: number) => {
            for (let i = 0; i < qty; i++) {
                roomsToInsert.push({
                    hotel_id: hotel.id,
                    type,
                    capacity,
                });
            }
        };

        addRooms('DOUBLE', rawData.double_qty, 2);
        addRooms('TRIPLE', rawData.triple_qty, 3);
        addRooms('QUADRUPLE', rawData.quadruple_qty, 4);

        if (roomsToInsert.length > 0) {
            const { error: roomsError } = await supabase
                .from('rooms')
                .insert(roomsToInsert);

            if (roomsError) throw roomsError;
        }

        revalidatePath('/backoffice/logistics/hotels');
        return { success: true };

    } catch (e: any) {
        console.error("Create hotel error:", e);
        return { error: "Erreur lors de la création de l'hôtel." };
    }
}

export async function deleteHotel(hotelId: string) {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    try {
        // 1. Get room IDs for this hotel
        const { data: rooms } = await supabase.from('rooms').select('id').eq('hotel_id', hotelId);
        const roomIds = rooms?.map(r => r.id) || [];

        if (roomIds.length > 0) {
            // 2. Check for active assignments
            const { data: activeAssignments } = await supabase
                .from('room_assignments')
                .select('id')
                .in('room_id', roomIds)
                .limit(1);

            if (activeAssignments && activeAssignments.length > 0) {
                return { error: "Impossible de supprimer : cet hôtel a des chambres déjà assignées à des pèlerins." };
            }
        }

        // 3. Delete rooms first (due to FK)
        await supabase.from('rooms').delete().eq('hotel_id', hotelId);
        
        // 4. Delete hotel
        const { error: deleteError } = await supabase
            .from('hotels')
            .delete()
            .eq('id', hotelId)
            .eq('agency_id', userId);

        if (deleteError) throw deleteError;

        revalidatePath('/backoffice/logistics/hotels');
        return { success: true };

    } catch (e: any) {
        console.error("Delete hotel error:", e);
        return { error: "Erreur lors de la suppression de l'hôtel." };
    }
}

export async function deleteFlight(flightId: string) {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    try {
        // 1. Check if pilgrims are linked to this flight (simulated or real table check)
        // In this architecture, flights are linked to pilgrims via groups or directly.
        // Assuming a table 'group_flights' or similar if implemented.
        
        // Safety check placeholder:
        /*
        const { count } = await supabase
            .from('pilgrims')
            .select('id', { count: 'exact', head: true })
            .eq('flight_id', flightId);
        
        if (count && count > 0) return { error: "Action interdite : des pèlerins sont réservés sur ce vol." };
        */

        // 2. Delete segments first
        await supabase.from('flight_segments').delete().eq('flight_id', flightId);
        
        // 3. Delete flight
        const { error: deleteError } = await supabase
            .from('flights')
            .delete()
            .eq('id', flightId)
            .eq('agency_id', userId);

        if (deleteError) throw deleteError;

        revalidatePath('/backoffice/logistics/flights');
        return { success: true };

    } catch (e: any) {
        console.error("Delete flight error:", e);
        return { error: "Erreur lors de la suppression du vol." };
    }
}

export async function assignPilgrimToRoom(pilgrimId: string, roomId: string, groupId: string) {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    try {
        // 1. Get Pilgrim Profile
        const { data: pilgrim, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', pilgrimId)
            .single();
        if (pError || !pilgrim) return { error: "Pèlerin introuvable." };

        // 2. Get Room details and Current Occupants
        const { data: room, error: rError } = await supabase
            .from('rooms')
            .select(`
                *,
                room_assignments (
                    pilgrim_id,
                    profiles (*)
                )
            `)
            .eq('id', roomId)
            .single();
        
        if (rError || !room) return { error: "Chambre introuvable." };

        // 3. Check Capacity
        if (room.room_assignments.length >= room.capacity) {
            return { error: "La chambre est complète." };
        }

        // 5. Perform Assignment
        const { error: assignError } = await supabase
            .from('room_assignments')
            .insert({
                room_id: roomId,
                pilgrim_id: pilgrimId,
                group_id: groupId
            });

        if (assignError) {
            if (assignError.code === '23505') return { error: "Ce pèlerin est déjà assigné à cette chambre." };
            throw assignError;
        }

        revalidatePath(`/backoffice/groups/${groupId}/rooming`);
        return { success: true };

    } catch (e: any) {
        console.error("Assign pilgrim error:", e);
        return { error: "Erreur lors de l'assignation." };
    }
}

export async function unassignPilgrimFromRoom(pilgrimId: string, roomId: string, groupId: string) {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) return { error: "Non autorisé" };

    try {
        const { error } = await supabase
            .from('room_assignments')
            .delete()
            .eq('pilgrim_id', pilgrimId)
            .eq('room_id', roomId);

        if (error) throw error;

        revalidatePath(`/backoffice/groups/${groupId}/rooming`);
        return { success: true };
    } catch (e) {
        return { error: "Erreur lors de la désassignation." };
    }
}

export async function getPilgrimDashboardData(pilgrimId: string, email?: string) {
    const supabase = createClient();
    try {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 12);
        targetDate.setHours(11, 15, 0, 0);

        const targetDateStr = targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        const targetTimeStr = targetDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const targetDateIso = targetDate.toISOString();

        const resolvedId = await resolvePilgrimIdByEmail(pilgrimId, email);

        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', resolvedId)
            .single();

        if (pError || !profile) {
            return {
                pilgrimName: "Salah Lamkhannet",
                daysToDeparture: 12,
                departureAirport: "CDG",
                arrivalAirport: "JED",
                departureCity: "Paris, FR",
                arrivalCity: "Jeddah, SA",
                departureDate: targetDateStr,
                departureTime: targetTimeStr,
                departureDateIso: targetDateIso,
                carrier: "Turkish Airlines",
                segments: [
                    { departure_airport: 'CDG', arrival_airport: 'IST', airline: 'Turkish Airlines', flight_number: 'TK1822', departure_time: new Date(targetDate.getTime() - 4 * 60 * 60 * 1000).toISOString(), arrival_time: new Date(targetDate.getTime() - 2 * 60 * 60 * 1000).toISOString(), sequence_order: 0 },
                    { departure_airport: 'IST', arrival_airport: 'JED', airline: 'Turkish Airlines', flight_number: 'TK96', departure_time: new Date(targetDate.getTime() - 1 * 60 * 60 * 1000).toISOString(), arrival_time: targetDateIso, sequence_order: 1 }
                ],
                checklist: [
                    { label: "Visa Omra", status: "OK", ok: true },
                    { label: "Solde", status: "Payé", ok: true },
                    { label: "Check-in", status: "Prêt", ok: true },
                ]
            };
        }

        const { data: pilgrim } = await supabase
            .from('pilgrims')
            .select('group_id, individual_flight_info, package_price, family_head_id')
            .eq('id', resolvedId)
            .single();

        let groupName = "Groupe Ramadan A";
        if (pilgrim && pilgrim.group_id) {
            const { data: groupData } = await supabase
                .from('groups')
                .select('name')
                .eq('id', pilgrim.group_id)
                .maybeSingle();
            if (groupData) groupName = groupData.name;
        }

        let flightInfo = null;
        if (pilgrim && pilgrim.individual_flight_info) {
            const indFlight = pilgrim.individual_flight_info as any;
            
            const rawSegments = indFlight.flights && Array.isArray(indFlight.flights) && indFlight.flights.length > 0
                ? indFlight.flights
                : [
                    {
                        departure_airport: indFlight.departure_airport,
                        arrival_airport: indFlight.arrival_airport,
                        airline: indFlight.airline,
                        flight_number: indFlight.flight_number,
                        departure_time: indFlight.departure_time,
                        arrival_time: indFlight.arrival_time
                    }
                ];

            const segments = rawSegments.map((s: any, idx: number) => ({
                departure_airport: s.departure_airport || '',
                arrival_airport: s.arrival_airport || '',
                airline: s.airline || '',
                flight_number: s.flight_number || '',
                departure_time: s.departure_time ? new Date(s.departure_time).toISOString() : '',
                arrival_time: s.arrival_time ? new Date(s.arrival_time).toISOString() : '',
                sequence_order: idx
            }));

            // Find the upcoming flight segment based on current date
            const now = new Date();
            let activeSegment = segments.find((s: any) => s.departure_time && new Date(s.departure_time) > now);
            
            // If no segment is in the future, default to the first segment (outbound)
            if (!activeSegment) {
                activeSegment = segments[0];
            }

            flightInfo = {
                departureAirport: activeSegment.departure_airport,
                arrivalAirport: activeSegment.arrival_airport,
                departureCity: activeSegment.departure_airport === 'CDG' || activeSegment.departure_airport === 'ORY' ? 'Paris, FR' : activeSegment.departure_airport,
                arrivalCity: activeSegment.arrival_airport === 'JED' ? 'Jeddah, SA' : activeSegment.arrival_airport === 'MED' ? 'Médine, SA' : activeSegment.arrival_airport,
                departureDate: activeSegment.departure_time ? new Date(activeSegment.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
                departureTime: activeSegment.departure_time ? new Date(activeSegment.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
                departureDateIso: activeSegment.departure_time ? new Date(activeSegment.departure_time).toISOString() : '',
                carrier: activeSegment.airline,
                pnr: indFlight.pnr || '',
                baggage_policy: indFlight.baggage_policy,
                segments
            };
        } else if (pilgrim && pilgrim.group_id) {
            const { data: groupLogistics } = await supabase
                .from('group_logistics')
                .select('flight_departure_id')
                .eq('group_id', pilgrim.group_id)
                .single();

            if (groupLogistics && groupLogistics.flight_departure_id) {
                const { data: flight } = await supabase
                    .from('flights')
                    .select('*, flight_segments(*)')
                    .eq('id', groupLogistics.flight_departure_id)
                    .single();
                if (flight && flight.flight_segments && flight.flight_segments.length > 0) {
                    const sortedSegments = [...flight.flight_segments].sort((a, b) => a.sequence_order - b.sequence_order);
                    const first = sortedSegments[0];
                    const last = sortedSegments[sortedSegments.length - 1];
                    flightInfo = {
                        departureAirport: first.departure_airport,
                        arrivalAirport: last.arrival_airport,
                        departureCity: first.departure_airport === 'CDG' ? 'Paris, FR' : first.departure_airport,
                        arrivalCity: last.arrival_airport === 'JED' ? 'Jeddah, SA' : last.arrival_airport,
                        departureDate: new Date(first.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                        departureTime: new Date(first.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                        departureDateIso: new Date(first.departure_time).toISOString(),
                        segments: sortedSegments,
                        carrier: first.airline,
                        baggage_policy: "2 x 23kg inclus"
                    };
                }
            }
        }

        const daysToDeparture = flightInfo 
            ? Math.max(0, Math.ceil((new Date(flightInfo.departureDateIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) 
            : 12;

        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('pilgrim_id', resolvedId);
        
        const totalPaid = payments ? payments.reduce((acc, curr) => curr.status === 'COMPLETED' ? acc + Number(curr.amount) : acc, 0) : 0;
        const pilgrimPrice = pilgrim?.package_price !== undefined && pilgrim?.package_price !== null ? Number(pilgrim.package_price) : 2500;
        const isPaid = totalPaid >= pilgrimPrice;

        // --- FETCH FAMILY MEMBERS ---
        const familyHeadId = pilgrim?.family_head_id || resolvedId;
        let familyMembers: any[] = [];
        try {
            const { data: rawPilgrims } = await supabase
                .from('pilgrims')
                .select('id, family_head_id, package_price')
                .or(`id.eq.${familyHeadId},family_head_id.eq.${familyHeadId}`);

            if (rawPilgrims && rawPilgrims.length > 0) {
                const pilgrimIds = rawPilgrims.map(p => p.id);
                const { data: rawProfiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, visa_status, checkin_done')
                    .in('id', pilgrimIds);

                const pilgrimMap = new Map(rawPilgrims.map(p => [p.id, p]));
                const filteredMembers = (rawProfiles || []).filter((m: any) => m.id !== resolvedId);

                for (const member of filteredMembers) {
                    const { data: memberPayments } = await supabase
                        .from('payments')
                        .select('amount')
                        .eq('pilgrim_id', member.id)
                        .eq('status', 'COMPLETED');
                    const memberTotalPaid = memberPayments ? memberPayments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) : 0;
                    
                    const memberDetail = pilgrimMap.get(member.id);
                    const memberPrice = memberDetail?.package_price !== null && memberDetail?.package_price !== undefined ? Number(memberDetail.package_price) : 2500;
                    const memberIsPaid = memberTotalPaid >= memberPrice;

                    familyMembers.push({
                        id: member.id,
                        name: member.full_name || '',
                        is_head: member.id === familyHeadId,
                        visa_status: member.visa_status === 'APPROVED' ? 'OK' : 'En cours',
                        visa_ok: member.visa_status === 'APPROVED',
                        checkin_status: member.checkin_done ? 'Prêt' : 'À faire',
                        checkin_ok: !!member.checkin_done,
                        payment_status: memberIsPaid ? 'Payé' : `Reste : ${memberPrice - memberTotalPaid} €`,
                        payment_ok: memberIsPaid
                    });
                }
            }
        } catch (familyErr) {
            console.error("Error fetching family members:", familyErr);
        }

        let visaUrl = profile.visa_url || null;
        if (visaUrl && !visaUrl.startsWith('http')) {
            try {
                const { data: signedData } = await supabase.storage
                    .from('pelerin-documents')
                    .createSignedUrl(visaUrl, 3600);
                if (signedData) {
                    visaUrl = signedData.signedUrl;
                }
            } catch (err) {
                console.error("Error signing visa URL:", err);
            }
        }

        // --- FETCH DAILY TIMELINE & MEETING POINT ---
        let currentDayOfTrip = 1;
        let todayActivities: any[] = [];
        let meetingPoint: any = null;

        if (pilgrim && pilgrim.group_id) {
            try {
                // Fetch group departure date
                const { data: group } = await supabase
                    .from('groups')
                    .select('departure_date')
                    .eq('id', pilgrim.group_id)
                    .single();

                if (group && group.departure_date) {
                    const depDate = new Date(group.departure_date);
                    depDate.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const diffTime = today.getTime() - depDate.getTime();
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    currentDayOfTrip = Math.max(1, diffDays);
                }

                // Fetch custom planning and meeting point from group_logistics
                const { data: logist } = await supabase
                    .from('group_logistics')
                    .select('custom_planning, meeting_point')
                    .eq('group_id', pilgrim.group_id)
                    .maybeSingle();

                if (logist) {
                    if (logist.custom_planning && typeof logist.custom_planning === 'object') {
                        todayActivities = (logist.custom_planning as any)[currentDayOfTrip.toString()] || [];
                    }
                    meetingPoint = logist.meeting_point || null;
                }
            } catch (err) {
                console.error("Error loading daily activities and meeting point:", err);
            }
        }

        // Fallback for demo/testing purposes
        if (todayActivities.length === 0 && pilgrim?.group_id) {
            todayActivities = [
                { time: "08:30", title: "Rassemblement Hall Hôtel", location: "Hôtel Médine", type: "TRANSPORT", description: "Départ en bus privé climatisé pour les visites historiques de la ville de Médine." },
                { time: "09:30", title: "Visite de la Mosquée de Quba", location: "Mosquée de Quba", type: "ZIYARAT", description: "Première mosquée de l'Islam. Pensez à faire vos ablutions à l'hôtel pour bénéficier de la récompense d'une Omra." },
                { time: "11:30", title: "Mont Uhud & Cimetière des Martyrs", location: "Mont Uhud", type: "ZIYARAT", description: "Explications historiques par nos guides sur la bataille d'Uhud et moment de recueillement." },
                { time: "13:30", title: "Déjeuner de Groupe (Couscous)", location: "Restaurant Traditionnel Uhud", type: "REPAS", description: "Repas convivial offert par l'agence au pied du Mont Uhud." },
                { time: "21:00", title: "Cercle Spirituel & Rappel", location: "Salle de conférence de l'Hôtel", type: "RITUEL", description: "Assise spirituelle animée par nos guides pour préparer les étapes de la Omra." }
            ];
        }

        if (!meetingPoint && pilgrim?.group_id) {
            meetingPoint = {
                name: "Porte 339 (Mosquée du Prophète - Médine)",
                description: "Rassemblement près des grands parasols blancs pour le départ des bus de visites.",
                latitude: 24.4672,
                longitude: 39.6111,
                maps_url: "https://maps.google.com/?q=24.4672,39.6111"
            };
        }

        return {
            pilgrimName: `${profile.full_name || ''}`.trim() || "Salah Lamkhannet",
            visaUrl: visaUrl,
            visaStatus: profile.visa_status || 'PENDING',
            groupId: pilgrim?.group_id || null,
            groupName: pilgrim?.group_id ? groupName : "Sans Groupe",
            hasNoGroup: !pilgrim?.group_id && !pilgrim?.individual_flight_info,
            daysToDeparture: flightInfo ? daysToDeparture : null,
            departureAirport: flightInfo?.departureAirport || null,
            arrivalAirport: flightInfo?.arrivalAirport || null,
            departureCity: flightInfo?.departureCity || null,
            arrivalCity: flightInfo?.arrivalCity || null,
            departureDate: flightInfo?.departureDate || null,
            departureTime: flightInfo?.departureTime || null,
            departureDateIso: flightInfo?.departureDateIso || null,
            carrier: flightInfo?.carrier || null,
            baggage_policy: flightInfo?.baggage_policy || null,
            segments: flightInfo?.segments || [],
            checklist: [
                { label: "Visa Omra", status: profile.visa_status === 'APPROVED' ? "OK" : "En cours", ok: profile.visa_status === 'APPROVED' },
                { label: "Solde", status: isPaid ? "Payé" : `Reste : ${pilgrimPrice - totalPaid} €`, ok: isPaid },
                { label: "Check-in", status: profile.checkin_done ? "Prêt" : "À faire", ok: !!profile.checkin_done },
            ],
            familyMembers,
            currentDayOfTrip,
            todayActivities,
            meetingPoint
        };
    } catch (err) {
        return {
            pilgrimName: "Salah Lamkhannet",
            groupId: null,
            groupName: "Sans Groupe",
            hasNoGroup: true,
            daysToDeparture: null,
            departureAirport: null,
            arrivalAirport: null,
            departureCity: null,
            arrivalCity: null,
            departureDate: null,
            departureTime: null,
            departureDateIso: null,
            carrier: null,
            baggage_policy: null,
            segments: [],
            checklist: [
                { label: "Visa Omra", status: "En cours", ok: false },
                { label: "Solde", status: "Reste : 2500 €", ok: false },
                { label: "Check-in", status: "À faire", ok: false },
            ],
            familyMembers: []
        };
    }
}

export async function createAssistanceRequest(data: { category: string, priority: string, message: string }) {
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
        const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : null);
        
        if (!resolvedId) {
            return { error: "Non autorisé" };
        }

        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'SUPER_ADMIN')
            .limit(1)
            .single();
        const agencyId = adminProfile?.id || resolvedId;

        const { error } = await supabase
            .from('assistance_requests')
            .insert({
                pilgrim_id: resolvedId,
                agency_id: agencyId,
                category: data.category,
                priority: data.priority,
                message: data.message,
                status: 'OPEN'
            });

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (e: any) {
        console.error("SOS creation error:", e);
        return { error: e.message || "Impossible de soumettre le SOS." };
    }
}

export async function getFutureDepartures() {
    const supabase = createClient();
    const now = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, departure_date')
        .gt('departure_date', now)
        .order('departure_date', { ascending: true });

    if (error) {
        console.error("Error fetching future departures:", error);
        return [];
    }
    return data;
}

export async function submitDepartureRequest(data: {
    month: string;
    duringHolidays?: boolean;
    numPeople: number;
    alreadyTravelled: boolean;
    pastTripsDetails?: string;
    loyaltyReward?: string;
    requestedGroupId?: string;
}) {
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const pilgrimCookieId = cookies().get('pilgrim_id')?.value;
        const resolvedId = pilgrimCookieId || (user ? await resolvePilgrimIdByEmail(user.id, user.email || undefined) : null);
        
        if (!resolvedId) {
            return { error: "Non autorisé" };
        }

        const { data: existing } = await supabase
            .from('departure_requests')
            .select('id')
            .eq('pilgrim_id', resolvedId)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('departure_requests')
                .update({
                    month: data.month,
                    during_holidays: data.duringHolidays ?? null,
                    num_people: data.numPeople,
                    already_travelled: data.alreadyTravelled,
                    past_trips_details: data.pastTripsDetails ?? null,
                    loyalty_reward: data.loyaltyReward ?? null,
                    requested_group_id: data.requestedGroupId || null,
                    updated_at: new Date().toISOString()
                })
                .eq('pilgrim_id', resolvedId);
            
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('departure_requests')
                .insert({
                    pilgrim_id: resolvedId,
                    month: data.month,
                    during_holidays: data.duringHolidays ?? null,
                    num_people: data.numPeople,
                    already_travelled: data.alreadyTravelled,
                    past_trips_details: data.pastTripsDetails ?? null,
                    loyalty_reward: data.loyaltyReward ?? null,
                    requested_group_id: data.requestedGroupId || null
                });
            
            if (error) throw error;
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Error submitting departure request:", e);
        return { error: e.message || "Erreur lors de l'enregistrement de votre demande." };
    }
}

export async function getDepartureRequest(pilgrimId: string, email?: string) {
    const supabase = createClient();
    try {
        const resolvedId = await resolvePilgrimIdByEmail(pilgrimId, email);
        const { data, error } = await supabase
            .from('departure_requests')
            .select('*')
            .eq('pilgrim_id', resolvedId)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (e) {
        console.error("Error fetching departure request:", e);
        return null;
    }
}

export async function resolvePilgrimIdByEmail(userId: string, email?: string): Promise<string> {
    const supabase = createClient();
    if (email) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();
        if (profile) return profile.id;
    }
    return userId;
}

export async function getRoomingState(groupId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();

    // 1. Get Group Details
    const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();

    // 2. Get pilgrims of this group
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, family_name, gender, pilgrims!inner(group_id, individual_hotel_info, package_price)')
        .eq('pilgrims.group_id', groupId);

    const pilgrimIds = (profiles || []).map((p: any) => p.id);
    let payments: any[] = [];
    if (pilgrimIds.length > 0) {
        const { data: payData } = await supabase
            .from('payments')
            .select('pilgrim_id, amount, status')
            .in('pilgrim_id', pilgrimIds);
        if (payData) payments = payData;
    }

    const mappedPilgrims = (profiles || []).map((p: any) => {
        const pilgrimObj = p.pilgrims as any;
        const packagePrice = pilgrimObj?.package_price !== null && pilgrimObj?.package_price !== undefined 
            ? Number(pilgrimObj.package_price) 
            : 2500;
        
        const totalPaid = payments
            .filter((pay: any) => pay.pilgrim_id === p.id && pay.status === 'COMPLETED')
            .reduce((sum: number, pay: any) => sum + Number(pay.amount), 0);
        
        const balanceDue = Math.max(0, packagePrice - totalPaid);

        return {
            id: p.id,
            name: p.full_name || '',
            family: p.family_name || p.full_name?.split(' ')[1] || '',
            gender: p.gender || 'M',
            balanceDue
        };
    });

    // 3. Get stays for this group
    const { data: stays } = await supabase
        .from('group_hotel_stays')
        .select(`
            id,
            hotel_id,
            hotels (
                id,
                name,
                city
            )
        `)
        .eq('group_id', groupId);

    let mappedStays = (stays || []).map((s: any) => ({
        id: s.id,
        hotel_id: s.hotel_id,
        hotel_name: s.hotels?.name || 'Hôtel',
        city: s.hotels?.city || 'MAKKAH'
    }));

    // Fallback: If no group hotel stays are defined, fallback to hotels defined on the group's pilgrims
    if (mappedStays.length === 0 && profiles && profiles.length > 0) {
        const makkahHotelIds: string[] = [];
        const madinahHotelIds: string[] = [];

        for (const p of profiles) {
            const pilgrimObj = p.pilgrims as any;
            const hotelInfo = pilgrimObj?.individual_hotel_info;
            if (hotelInfo?.makkah_hotel_id && !makkahHotelIds.includes(hotelInfo.makkah_hotel_id)) {
                makkahHotelIds.push(hotelInfo.makkah_hotel_id);
            }
            if (hotelInfo?.madinah_hotel_id && !madinahHotelIds.includes(hotelInfo.madinah_hotel_id)) {
                madinahHotelIds.push(hotelInfo.madinah_hotel_id);
            }
        }

        const allHotelIds = [...makkahHotelIds, ...madinahHotelIds];
        if (allHotelIds.length > 0) {
            const { data: fallbackHotels } = await supabase
                .from('hotels')
                .select('id, name, city')
                .in('id', allHotelIds);

            if (fallbackHotels) {
                mappedStays = fallbackHotels.map(h => ({
                    id: `fallback-${h.id}`,
                    hotel_id: h.id,
                    hotel_name: h.name,
                    city: h.city || 'MAKKAH'
                }));
            }
        }
    }

    // 4. Get rooms of these hotels
    const hotelIds = mappedStays.map(s => s.hotel_id);
    let mappedRooms: any[] = [];
    if (hotelIds.length > 0) {
        let { data: rooms } = await supabase
            .from('rooms')
            .select('*')
            .in('hotel_id', hotelIds)
            .order('room_number', { ascending: true })
            .order('created_at', { ascending: true });
        
        mappedRooms = (rooms || []).map((r: any) => ({
            id: r.id,
            hotel_id: r.hotel_id,
            type: r.type,
            capacity: r.capacity,
            room_number: r.room_number || '',
            has_breakfast: !!r.has_breakfast
        }));
    }

    // 5. Get assignments for this group
    const { data: assignments } = await supabase
        .from('room_assignments')
        .select('room_id, pilgrim_id')
        .eq('group_id', groupId);

    return {
        groupName: group?.name || "Sans Groupe",
        pilgrims: mappedPilgrims,
        stays: mappedStays,
        rooms: mappedRooms,
        assignments: assignments || []
    };
}

export async function getHotelRoomingState(hotelId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();

    // 1. Get Hotel details
    const { data: hotel } = await supabase
        .from('hotels')
        .select('name, city')
        .eq('id', hotelId)
        .single();

    // 2. Get Rooms for this hotel
    const { data: rooms } = await supabase
        .from('rooms')
        .select(`
            *,
            room_assignments (
                id,
                pilgrim_id,
                group_id,
                profiles (
                    id,
                    full_name,
                    family_name,
                    gender
                )
            )
        `)
        .eq('hotel_id', hotelId)
        .order('room_number', { ascending: true })
        .order('created_at', { ascending: true });

    // 3. Get all pilgrims of this agency (so we can select them to assign)
    const { data: profiles } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            family_name,
            gender,
            pilgrims!inner(
                id,
                group_id,
                groups(name)
            )
        `)
        .eq('role', 'PILGRIM');

    const mappedPilgrims = (profiles || []).map((p: any) => {
        const pilgrimDetail = Array.isArray(p.pilgrims) ? p.pilgrims[0] : p.pilgrims;
        return {
            id: p.id,
            name: p.full_name || '',
            family: p.family_name || p.full_name?.split(' ')[1] || '',
            gender: p.gender || 'M',
            group_name: pilgrimDetail?.groups?.name || 'Sans Groupe',
            group_id: pilgrimDetail?.group_id || null
        };
    });

    return {
        hotelName: hotel?.name || "Hôtel",
        city: hotel?.city || "MAKKAH",
        rooms: (rooms || []).map((r: any) => ({
            id: r.id,
            room_number: r.room_number || `Chambre #${r.id.slice(0, 4)}`,
            type: r.type,
            capacity: r.capacity,
            assignments: (r.room_assignments || []).map((ra: any) => ({
                id: ra.id,
                pilgrim_id: ra.pilgrim_id,
                group_id: ra.group_id,
                name: ra.profiles?.full_name || '',
                family: ra.profiles?.family_name || '',
                gender: ra.profiles?.gender || 'M'
            }))
        })),
        pilgrims: mappedPilgrims
    };
}

export async function createRoomAction(
    hotelId: string,
    arg2: string,
    arg3?: 'DOUBLE' | 'TRIPLE' | 'QUADRUPLE' | 'SUITE' | string,
    arg4?: number,
    arg5?: boolean
) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();

    let type: 'DOUBLE' | 'TRIPLE' | 'QUADRUPLE' | 'SUITE' = 'DOUBLE';
    let roomNumber = '';
    let capacity = 2;
    let hasBreakfast = false;

    // Check if arg2 is a room type
    const isType = (val: any): val is 'DOUBLE' | 'TRIPLE' | 'QUADRUPLE' | 'SUITE' => 
        ['DOUBLE', 'TRIPLE', 'QUADRUPLE', 'SUITE'].includes(val);

    if (isType(arg2)) {
        type = arg2;
        roomNumber = (arg3 as string) || '';
        capacity = arg4 ?? (type === 'DOUBLE' ? 2 : type === 'TRIPLE' ? 3 : type === 'QUADRUPLE' ? 4 : 6);
        hasBreakfast = !!arg5;
    } else {
        roomNumber = arg2 || '';
        if (isType(arg3)) {
            type = arg3;
        } else {
            type = 'DOUBLE';
        }
        capacity = type === 'DOUBLE' ? 2 : type === 'TRIPLE' ? 3 : type === 'QUADRUPLE' ? 4 : 6;
        hasBreakfast = false;
    }

    try {
        const { data, error } = await supabase
            .from('rooms')
            .insert({
                hotel_id: hotelId,
                type,
                room_number: roomNumber || null,
                capacity,
                has_breakfast: hasBreakfast
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/backoffice/logistics/hotels');
        return { success: true, room: data };
    } catch (e: any) {
        console.error("Error creating room:", e);
        return { error: e.message || "Erreur de création de chambre." };
    }
}

export async function updateRoomAction(
    roomId: string,
    updates: {
        room_number?: string;
        type?: 'DOUBLE' | 'TRIPLE' | 'QUADRUPLE' | 'SUITE' | string;
        capacity?: number;
        has_breakfast?: boolean;
    }
) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        // Enforce that new capacity is not less than current occupants count
        const { data: assignments } = await supabase
            .from('room_assignments')
            .select('id')
            .eq('room_id', roomId);
        
        const occupantCount = assignments?.length || 0;
        if (updates.capacity !== undefined && updates.capacity < occupantCount) {
            return { error: `La capacité ne peut pas être inférieure au nombre d'occupants actuels (${occupantCount}).` };
        }

        const { error } = await supabase
            .from('rooms')
            .update({
                room_number: updates.room_number,
                type: updates.type,
                capacity: updates.capacity,
                has_breakfast: updates.has_breakfast
            })
            .eq('id', roomId);

        if (error) throw error;

        revalidatePath('/backoffice/logistics/hotels');
        return { success: true };
    } catch (e: any) {
        console.error("Error updating room:", e);
        return { error: e.message || "Erreur de mise à jour de la chambre." };
    }
}

export async function deleteRoomAction(roomId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        // 1. Delete associated assignments first
        await supabase
            .from('room_assignments')
            .delete()
            .eq('room_id', roomId);

        // 2. Delete the room
        const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('id', roomId);

        if (error) throw error;

        revalidatePath('/backoffice/logistics/hotels');
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting room:", e);
        return { error: e.message || "Erreur de suppression de chambre." };
    }
}

export async function assignPilgrimToRoomFromHotel(pilgrimId: string, roomId: string) {
    const supabase = createClient();
    const userId = await getAuthUserId(supabase);
    if (!userId) throw new Error("Non autorisé");

    // Fetch the pilgrim's group_id
    const { data: pilgrimRecord, error: pilgrimErr } = await supabase
        .from('pilgrims')
        .select('group_id')
        .eq('id', pilgrimId)
        .single();
        
    if (pilgrimErr || !pilgrimRecord) {
        return { error: "Pèlerin ou groupe introuvable." };
    }
    
    const groupId = pilgrimRecord.group_id;
    if (!groupId) {
        return { error: "Le pèlerin doit d'abord être affecté à un groupe (depuis la rubrique Concierge) pour pouvoir lui attribuer une chambre." };
    }

    return assignPilgrimToRoom(pilgrimId, roomId, groupId);
}

export async function unassignPilgrimFromRoomFromHotel(pilgrimId: string, roomId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();

    const { error } = await supabase
        .from('room_assignments')
        .delete()
        .eq('pilgrim_id', pilgrimId)
        .eq('room_id', roomId);

    if (error) throw new Error(error.message);

    revalidatePath('/backoffice/logistics/hotels');
    return { success: true };
}

export async function getPilgrimProgram(pilgrimId?: string | null, email?: string, directGroupId?: string) {
    const supabase = createClient();
    try {
        let groupId = directGroupId;
        let pilgrim: any = null;
        let profile: any = null;

        if (pilgrimId) {
            const resolvedId = await resolvePilgrimIdByEmail(pilgrimId, email);

            // Fetch profile
            const { data: p } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', resolvedId)
                .single();
            profile = p;

            // Fetch pilgrim and group
            const { data: pil } = await supabase
                .from('pilgrims')
                .select('group_id, individual_flight_info, individual_hotel_info')
                .eq('id', resolvedId)
                .single();
            pilgrim = pil;
            if (pilgrim && !groupId) {
                groupId = pilgrim.group_id;
            }
        }

        let groupName = "";
        let departureDate = new Date();

        if (groupId) {
            const { data: group } = await supabase
                .from('groups')
                .select('name, departure_date')
                .eq('id', groupId)
                .single();
            if (group) {
                groupName = group.name || "";
                if (group.departure_date) {
                    departureDate = new Date(group.departure_date);
                }
            }
        }

        // Determine itinerary sequence and stays
        let stays: any[] = [];
        if (groupId) {
            const { data: groupStays } = await supabase
                .from('group_hotel_stays')
                .select('*, hotels(*)')
                .eq('group_id', groupId)
                .order('check_in', { ascending: true });
            if (groupStays) {
                stays = groupStays;
            }
        }

        const cities = stays.map(s => s.hotels?.city?.toUpperCase()).filter(Boolean);
        
        let mode: 'MAKKAH_FIRST' | 'MADINAH_FIRST' | 'TWO_OMRAS' = 'MAKKAH_FIRST';
        
        const lowerGroupName = groupName.toLowerCase();
        if (
            (cities.length >= 3 && cities[0] === 'MAKKAH' && cities[1] === 'MADINAH' && cities[2] === 'MAKKAH') ||
            lowerGroupName.includes("double") || 
            lowerGroupName.includes("2 omra") || 
            lowerGroupName.includes("deux omra")
        ) {
            mode = 'TWO_OMRAS';
        } else if (cities[0] === 'MADINAH') {
            mode = 'MADINAH_FIRST';
        }

        // Calculate stay duration
        let duration = 14; // Default
        if (pilgrim?.individual_flight_info) {
            const indFlight = pilgrim.individual_flight_info as any;
            if (indFlight.flights && Array.isArray(indFlight.flights) && indFlight.flights.length >= 2) {
                const first = indFlight.flights[0];
                const last = indFlight.flights[indFlight.flights.length - 1];
                if (first.departure_time && last.arrival_time) {
                    const diff = new Date(last.arrival_time).getTime() - new Date(first.departure_time).getTime();
                    duration = Math.max(7, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                }
            }
        } else if (groupId) {
            const { data: logistics } = await supabase
                .from('group_logistics')
                .select('flight_departure_id, flight_return_id')
                .eq('group_id', groupId)
                .single();
            if (logistics && logistics.flight_departure_id && logistics.flight_return_id) {
                const { data: depFlight } = await supabase
                    .from('flights')
                    .select('*, flight_segments(*)')
                    .eq('id', logistics.flight_departure_id)
                    .single();
                const { data: retFlight } = await supabase
                    .from('flights')
                    .select('*, flight_segments(*)')
                    .eq('id', logistics.flight_return_id)
                    .single();
                
                const depTime = depFlight?.flight_segments?.[0]?.departure_time;
                const retSegments = retFlight?.flight_segments || [];
                const retTime = retSegments[retSegments.length - 1]?.arrival_time;

                if (depTime && retTime) {
                    const diff = new Date(retTime).getTime() - new Date(depTime).getTime();
                    duration = Math.max(7, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                }
            }
        }

        // Load custom planning for the group if it exists
        let customPlanning: any = null;
        if (groupId) {
            const { data: logisticsList } = await supabase
                .from('group_logistics')
                .select('custom_planning')
                .eq('group_id', groupId)
                .limit(1);
            const logistics = logisticsList?.[0];
            if (logistics && logistics.custom_planning) {
                customPlanning = logistics.custom_planning;
            }
        }

        // Build list of days
        const days = [];
        for (let d = 1; d <= duration; d++) {
            const currentDate = new Date(departureDate.getTime() + (d - 1) * 24 * 60 * 60 * 1000);
            const dateLabel = currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            
            // Define active city
            let activeCity: 'MAKKAH' | 'MADINAH' = 'MAKKAH';
            if (mode === 'MAKKAH_FIRST') {
                activeCity = d < Math.ceil(duration / 2) ? 'MAKKAH' : 'MADINAH';
            } else if (mode === 'MADINAH_FIRST') {
                activeCity = d < Math.ceil(duration / 2) ? 'MADINAH' : 'MAKKAH';
            } else {
                // TWO_OMRAS
                if (d <= 5) activeCity = 'MAKKAH';
                else if (d <= 10) activeCity = 'MADINAH';
                else activeCity = 'MAKKAH';
            }

            let guidedActivities: any[] = [];
            const spiritualActivities: any[] = [];

            // Add standard spiritual activities based on the city
            if (activeCity === 'MAKKAH') {
                spiritualActivities.push(
                    { title: "Tawaf surérogatoire", desc: "Effectuer un Tawaf facultatif autour de la Kaaba (recommandé après l'Asr ou tard le soir)." },
                    { title: "Tahajjud au Haram", desc: "Se rendre à Masjid Al-Haram dans le dernier tiers de la nuit pour effectuer des prières nocturnes et douas." },
                    { title: "Fajr et évocation (Shuruq)", desc: "Prier le Fajr en congrégation et rester dans la mosquée à lire le Coran et faire des évocations jusqu'au lever du soleil, puis effectuer la prière de Duha." },
                    { title: "Douas au Multazam", desc: "S'approcher du Multazam (partie située entre la porte de la Kaaba et la Pierre Noire) et y faire des douas ferventes." }
                );
            } else {
                spiritualActivities.push(
                    { title: "Prière dans la Rawdah", desc: "Profiter de son créneau de réservation pour prier dans le jardin du Paradis (Rawdah ash-Sharifah)." },
                    { title: "Salutations au Messager (ﷺ)", desc: "Se présenter respectueusement devant le tombeau du Prophète (ﷺ) et de ses compagnons Abu Bakr et Umar pour leur adresser le Salam." },
                    { title: "Invocation à Al-Baqi", desc: "Visiter le cimetière historique d'Al-Baqi jouxtant la Mosquée du Prophète et faire des invocations pour les compagnons et les défunts." },
                    { title: "Assister aux cercles de science", desc: "Rejoindre l'une des assemblées d'enseignement ou d'explication religieuse tenues quotidiennement au sein de la mosquée." }
                );
            }

            // Core guided activities based on Mode and Day
            if (mode === 'MAKKAH_FIRST') {
                if (d === 1) {
                    guidedActivities.push(
                        { time: '14:30', title: 'Arrivée à Jeddah (JED)', location: 'Aéroport Roi-Abdelaziz', type: 'TRANSPORT', description: 'Accueil par notre guide local et transfert immédiat vers Makkah en bus climatisé.' },
                        { time: '18:00', title: 'Check-in Hôtel Makkah', location: 'Makkah Hotel', type: 'REPOS', description: 'Remise des clés et temps libre pour se rafraîchir avant le début des rites.' },
                        { time: '21:30', title: 'Première Omra Collective', location: 'Masjid al-Haram', type: 'RITUEL', description: 'Départ du lobby pour accomplir le Tawaf et le Sa\'y ensemble sous la direction de notre guide.' }
                    );
                } else if (d === 3) {
                    guidedActivities.push(
                        { time: '08:30', title: 'Visites Guidées Makkah (Ziyarat)', location: 'Lieux Historiques Makkah', type: 'ZIYARAT', description: 'Excursion historique guidée en bus : Mont Jabal al-Nour (grotte de Hira), Jabal Thawr, plaine d\'Arafat, Muzdalifah et Mina.' }
                    );
                } else if (d === 7) {
                    guidedActivities.push(
                        { time: '10:00', title: 'Check-out & Départ pour Médine', location: 'Lobby Hôtel Makkah', type: 'TRANSPORT', description: 'Départ en bus climatisé vers la sainte ville de Médine.' },
                        { time: '16:30', title: 'Check-in Hôtel Médine', location: 'Hôtel Madinah', type: 'REPOS', description: 'Installation à l\'hôtel et première salutation au Prophète (ﷺ).' }
                    );
                } else if (d === 9) {
                    guidedActivities.push(
                        { time: '08:30', title: 'Visites Guidées Médine (Ziyarat)', location: 'Lieux Historiques Médine', type: 'ZIYARAT', description: 'Visite guidée en groupe : Mosquée de Quba (prier 2 Rakats équivaut à une Omra), Mont Uhud (les martyrs) et Masjid al-Qiblatain.' }
                    );
                } else if (d === 11) {
                    guidedActivities.push(
                        { time: '08:00', title: 'Excursion à Badr', location: 'Site historique de Badr', type: 'ZIYARAT', description: 'Excursion historique vers le champ de bataille de Badr et le cimetière des martyrs de Badr avec les explications du guide.' }
                    );
                } else if (d === duration) {
                    guidedActivities.push(
                        { time: '12:00', title: 'Check-out & Transfert Retour', location: 'Lobby Hôtel', type: 'TRANSPORT', description: 'Transfert vers l\'aéroport de Médine (MED) ou de Jeddah (JED) pour votre vol retour.' }
                    );
                }
            } else if (mode === 'MADINAH_FIRST') {
                if (d === 1) {
                    guidedActivities.push(
                        { time: '15:30', title: 'Arrivée à Médine (MED)', location: 'Aéroport Prince Mohammad Bin Abdulaziz', type: 'TRANSPORT', description: 'Accueil par notre guide et transfert vers votre hôtel à Médine.' },
                        { time: '17:30', title: 'Check-in Hôtel Médine', location: 'Hôtel Madinah', type: 'REPOS', description: 'Remise des clés et installation dans les chambres.' }
                    );
                } else if (d === 3) {
                    guidedActivities.push(
                        { time: '08:30', title: 'Visites Guidées Médine (Ziyarat)', location: 'Lieux Historiques Médine', type: 'ZIYARAT', description: 'Visite guidée en groupe : Mosquée de Quba, Mont Uhud et la mosquée des deux Qiblas.' }
                    );
                } else if (d === 4) {
                    guidedActivities.push(
                        { time: '08:00', title: 'Excursion à Badr', location: 'Site historique de Badr', type: 'ZIYARAT', description: 'Visite guidée du champ de bataille historique de Badr et du cimetière des martyrs de la première grande bataille de l\'Islam.' }
                    );
                } else if (d === 6) {
                    guidedActivities.push(
                        { time: '09:00', title: 'Départ pour Makkah avec passage Miqat', location: 'Lobby Hôtel / Miqat', type: 'TRANSPORT', description: 'Check-out et départ vers Makkah. Halte au Miqat (Dhu\'l-Hulayfah) pour se mettre en état d\'Ihram et formuler l\'intention de l\'Omra.' },
                        { time: '16:00', title: 'Check-in Hôtel Makkah', location: 'Hôtel Makkah', type: 'REPOS', description: 'Installation dans les chambres.' },
                        { time: '20:30', title: 'Première Omra Collective', location: 'Masjid al-Haram', type: 'RITUEL', description: 'Accomplissement collectif des rites de l\'Omra guidé étape par étape.' }
                    );
                } else if (d === 9) {
                    guidedActivities.push(
                        { time: '08:30', title: 'Visites Guidées Makkah (Ziyarat)', location: 'Lieux Historiques Makkah', type: 'ZIYARAT', description: 'Visite guidée en bus : Jabal al-Nour (grotte de Hira), Jabal Thawr, Arafat, Mina.' }
                    );
                } else if (d === duration) {
                    guidedActivities.push(
                        { time: '10:00', title: 'Check-out & Transfert Jeddah', location: 'Lobby Hôtel', type: 'TRANSPORT', description: 'Départ en bus vers l\'aéroport de Jeddah (JED) pour votre vol retour.' }
                    );
                }
            } else {
                // TWO_OMRAS
                if (d === 1) {
                    guidedActivities.push(
                        { time: '14:30', title: 'Arrivée à Jeddah (JED)', location: 'Aéroport Roi-Abdelaziz', type: 'TRANSPORT', description: 'Accueil par l\'agence et transfert vers Makkah.' },
                        { time: '17:30', title: 'Check-in Makkah', location: 'Hôtel Makkah', type: 'REPOS', description: 'Installation rapide.' },
                        { time: '21:00', title: 'Première Omra Collective', location: 'Masjid al-Haram', type: 'RITUEL', description: 'Départ groupé pour accomplir la première Omra.' }
                    );
                } else if (d === 3) {
                    guidedActivities.push(
                        { time: '08:30', title: 'Visites Guidées Makkah (Ziyarat)', location: 'Lieux Historiques Makkah', type: 'ZIYARAT', description: 'Visite des sites de Jabal al-Nour, Arafat et des tentes de Mina.' }
                    );
                } else if (d === 5) {
                    guidedActivities.push(
                        { time: '09:00', title: 'Départ pour Médine', location: 'Lobby Hôtel Makkah', type: 'TRANSPORT', description: 'Check-out et transfert en bus vers Médine.' },
                        { time: '15:30', title: 'Check-in Médine', location: 'Hôtel Madinah', type: 'REPOS', description: 'Installation dans les chambres.' }
                    );
                } else if (d === 7) {
                    guidedActivities.push(
                        { time: '08:30', title: 'Visites Guidées Médine (Ziyarat)', location: 'Lieux Historiques Médine', type: 'ZIYARAT', description: 'Visite de la Mosquée de Quba, du Mont Uhud et des mosquées historiques.' }
                    );
                } else if (d === 8) {
                    guidedActivities.push(
                        { time: '08:00', title: 'Excursion à Badr', location: 'Site historique de Badr', type: 'ZIYARAT', description: 'Visite guidée historique du champ de bataille de Badr.' }
                    );
                } else if (d === 10) {
                    guidedActivities.push(
                        { time: '09:00', title: 'Retour à Makkah pour Deuxième Omra', location: 'Lobby Hôtel / Miqat', type: 'TRANSPORT', description: 'Départ de Médine vers Makkah avec halte rituelle au Miqat pour l\'Ihram.' },
                        { time: '16:30', title: 'Check-in Makkah', location: 'Hôtel Makkah', type: 'REPOS', description: 'Réinstallation dans votre hôtel.' },
                        { time: '21:00', title: 'Deuxième Omra Collective', location: 'Masjid al-Haram', type: 'RITUEL', description: 'Accomplissement de la deuxième Omra en groupe.' }
                    );
                } else if (d === duration) {
                    guidedActivities.push(
                        { time: '11:00', title: 'Check-out & Transfert Retour', location: 'Lobby Hôtel', type: 'TRANSPORT', description: 'Transfert vers l\'aéroport de Jeddah (JED) pour le vol de retour.' }
                    );
                }
            }

            if (customPlanning && customPlanning[d.toString()] && Array.isArray(customPlanning[d.toString()])) {
                guidedActivities = customPlanning[d.toString()];
            }

            // If no guided activities are scheduled for this day, add a placeholder indicating free time
            if (guidedActivities.length === 0) {
                guidedActivities.push({
                    time: 'Toute la journée',
                    title: 'Journée Libre & Spiritualité',
                    location: activeCity === 'MAKKAH' ? 'Masjid al-Haram' : 'Al-Masjid an-Nabawi',
                    type: 'REPOS',
                    description: 'Aucune activité de groupe n\'est prévue. Profitez de votre temps libre pour multiplier les prières et évocations.'
                });
            }

            days.push({
                day: d,
                date: dateLabel,
                city: activeCity,
                guidedActivities,
                spiritualActivities
            });
        }

        return {
            success: true,
            mode,
            duration,
            days
        };

    } catch (e: any) {
        console.error("Error in getPilgrimProgram:", e);
        return { error: e.message || "Erreur de génération du programme." };
    }
}

export async function getPilgrimBadgeData(pilgrimId: string, email?: string) {
    const supabase = createClient();
    try {
        const resolvedId = await resolvePilgrimIdByEmail(pilgrimId, email);

        // 1. Fetch Profile (names, phone)
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('full_name, phone, role')
            .eq('id', resolvedId)
            .single();

        if (profileErr || !profile) {
            throw new Error("Profil du pèlerin introuvable.");
        }

        // 2. Fetch Pilgrim Group
        const { data: pilgrim, error: pilgrimErr } = await supabase
            .from('pilgrims')
            .select('group_id, individual_flight_info, individual_hotel_info')
            .eq('id', resolvedId)
            .single();

        let groupId = pilgrim?.group_id;
        let groupName = "Individuel";
        let departureDate = "";
        let returnDate = "";
        let makkahHotel = "Non défini";
        let madinahHotel = "Non défini";

        // Resolve Individual Hotel Stay if configured
        if (pilgrim && pilgrim.individual_hotel_info) {
            const hotelInfo = pilgrim.individual_hotel_info as any;
            const hotelIds = [];
            if (hotelInfo.makkah_hotel_id) hotelIds.push(hotelInfo.makkah_hotel_id);
            if (hotelInfo.madinah_hotel_id) hotelIds.push(hotelInfo.madinah_hotel_id);

            if (hotelIds.length > 0) {
                const { data: dbHotels } = await supabase
                    .from('hotels')
                    .select('id, name, city')
                    .in('id', hotelIds);

                if (dbHotels) {
                    const makkahDb = dbHotels.find(h => h.id === hotelInfo.makkah_hotel_id || h.city?.toUpperCase() === 'MAKKAH');
                    const madinahDb = dbHotels.find(h => h.id === hotelInfo.madinah_hotel_id || h.city?.toUpperCase() === 'MADINAH');
                    if (makkahDb) makkahHotel = makkahDb.name;
                    if (madinahDb) madinahHotel = madinahDb.name;
                }
            }
        }

        // Resolve Individual Flight Dates if configured
        if (pilgrim && pilgrim.individual_flight_info) {
            const indFlight = pilgrim.individual_flight_info as any;
            const rawSegments = indFlight.flights && Array.isArray(indFlight.flights) && indFlight.flights.length > 0
                ? indFlight.flights
                : [indFlight];

            if (rawSegments.length > 0) {
                const firstSeg = rawSegments[0];
                const lastSeg = rawSegments[rawSegments.length - 1];
                if (firstSeg.departure_time) {
                    departureDate = new Date(firstSeg.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                }
                if (lastSeg.arrival_time) {
                    returnDate = new Date(lastSeg.arrival_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                }
            }
        }

        // 3. Fetch Stays and Flight Dates from Group as Fallback
        if (groupId) {
            const { data: group } = await supabase
                .from('groups')
                .select('name, departure_date')
                .eq('id', groupId)
                .single();
            if (group) {
                groupName = group.name || "";
                if (!departureDate && group.departure_date) {
                    departureDate = new Date(group.departure_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                }
            }

            // Fetch Hotels if still undefined
            if (makkahHotel === "Non défini" || madinahHotel === "Non défini") {
                const { data: groupStays } = await supabase
                    .from('group_hotel_stays')
                    .select('*, hotels(*)')
                    .eq('group_id', groupId);

                if (groupStays) {
                    const makkahStay = groupStays.find(s => s.hotels?.city?.toUpperCase() === 'MAKKAH');
                    const madinahStay = groupStays.find(s => s.hotels?.city?.toUpperCase() === 'MADINAH');
                    if (makkahHotel === "Non défini" && makkahStay) makkahHotel = makkahStay.hotels?.name || "Hôtel Makkah";
                    if (madinahHotel === "Non défini" && madinahStay) madinahHotel = madinahStay.hotels?.name || "Hôtel Médine";
                }
            }

            // Fetch return flight date if still undefined
            if (!returnDate) {
                const { data: groupLogistics } = await supabase
                    .from('group_logistics')
                    .select('flight_return_id')
                    .eq('group_id', groupId)
                    .single();

                if (groupLogistics && groupLogistics.flight_return_id) {
                    const { data: retFlight } = await supabase
                        .from('flights')
                        .select('*, flight_segments(*)')
                        .eq('id', groupLogistics.flight_return_id)
                        .single();
                    
                    const retTime = retFlight?.flight_segments?.[retFlight.flight_segments.length - 1]?.arrival_time;
                    if (retTime) {
                        returnDate = new Date(retTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
                    }
                }
            }
        }

        // Fallbacks for dates if not found from logistics
        if (!departureDate) {
            departureDate = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        if (!returnDate) {
            const tempReturn = new Date();
            tempReturn.setDate(tempReturn.getDate() + 14);
            returnDate = tempReturn.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        // 4. Fetch Photo and generate signed URL
        const { data: userDoc } = await supabase
            .from('user_documents')
            .select('storage_path')
            .eq('user_id', resolvedId)
            .eq('type', 'PHOTO')
            .maybeSingle();

        let photoUrl = null;
        if (userDoc && userDoc.storage_path) {
            try {
                const { data: signedData, error: signError } = await supabase
                    .storage
                    .from('pelerin-documents')
                    .createSignedUrl(userDoc.storage_path, 3600); // 1 hour validity

                if (!signError && signedData) {
                    photoUrl = signedData.signedUrl;
                }
            } catch (storageErr) {
                console.error("Error signing photo URL:", storageErr);
            }
        }

        return {
            success: true,
            badge: {
                fullName: profile.full_name || "Pèlerin",
                phone: profile.phone || "Non renseigné",
                groupName,
                makkahHotel,
                madinahHotel,
                departureDate,
                returnDate,
                photoUrl
            }
        };

    } catch (e: any) {
        console.error("Error in getPilgrimBadgeData:", e);
        return { error: e.message || "Erreur lors de la récupération des données du badge." };
    }
}

export async function getPilgrimJournalData(groupId: string, pilgrimId?: string) {
    const supabase = createClient();
    try {
        let groupName = "Groupe";
        let resolvedPilgrimName = "Tous les Pèlerins";
        
        // Fetch group details if groupId is valid
        if (groupId && groupId !== '1') {
            const { data: group } = await supabase
                .from('groups')
                .select('name')
                .eq('id', groupId)
                .maybeSingle();
            if (group) {
                groupName = group.name;
            }
        }

        // Resolving pilgrim name
        let individualFlight = null;
        let individualHotel = null;

        if (pilgrimId && pilgrimId !== 'demo-pilgrim-id') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', pilgrimId)
                .maybeSingle();
            if (profile) {
                resolvedPilgrimName = profile.full_name;
            }

            const { data: pilgrim } = await supabase
                .from('pilgrims')
                .select('individual_flight_info, individual_hotel_info')
                .eq('id', pilgrimId)
                .maybeSingle();
            if (pilgrim) {
                individualFlight = pilgrim.individual_flight_info as any;
                individualHotel = pilgrim.individual_hotel_info as any;
            }
        }

        // 1. Resolve Flights
        let flightsList: any[] = [];
        if (individualFlight && (individualFlight.flights || individualFlight.departure_airport)) {
            const rawFlights = individualFlight.flights && Array.isArray(individualFlight.flights)
                ? individualFlight.flights
                : [individualFlight];

            const segments = rawFlights.map((f: any) => ({
                from: f.departure_airport || '',
                to: f.arrival_airport || '',
                flightNum: f.flight_number || '',
                date: f.departure_time ? new Date(f.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }) : '',
                time: f.departure_time ? new Date(f.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
                departure_time: f.departure_time
            }));

            if (individualFlight.flights && Array.isArray(individualFlight.flights)) {
                let saArrivalIndex = segments.findIndex((s: any) => {
                    const toCity = s.to.toUpperCase();
                    return toCity.includes('JED') || toCity.includes('MED');
                });

                if (saArrivalIndex === -1) {
                    saArrivalIndex = Math.floor(segments.length / 2) - 1;
                }

                const outbound = segments.slice(0, saArrivalIndex + 1);
                const inbound = segments.slice(saArrivalIndex + 1);

                if (outbound.length > 0) {
                    flightsList.push({
                        type: 'ALLER',
                        carrier: rawFlights[0]?.airline || 'Turkish Airlines',
                        segments: outbound
                    });
                }
                if (inbound.length > 0) {
                    flightsList.push({
                        type: 'RETOUR',
                        carrier: rawFlights[rawFlights.length - 1]?.airline || 'Saudi Arabian',
                        segments: inbound
                    });
                }
            } else {
                flightsList.push({
                    type: 'ALLER/RETOUR',
                    carrier: individualFlight.airline || 'Compagnie',
                    segments: segments
                });
            }
        }

        // If flightsList is empty, fetch group flights
        if (flightsList.length === 0 && groupId && groupId !== '1') {
            const { data: groupLogistics } = await supabase
                .from('group_logistics')
                .select('flight_departure_id, flight_return_id')
                .eq('group_id', groupId)
                .maybeSingle();

            if (groupLogistics) {
                if (groupLogistics.flight_departure_id) {
                    const { data: dep } = await supabase
                        .from('flights')
                        .select('*, flight_segments(*)')
                        .eq('id', groupLogistics.flight_departure_id)
                        .maybeSingle();
                    if (dep && dep.flight_segments) {
                        flightsList.push({
                            type: 'ALLER',
                            carrier: dep.flight_segments[0]?.airline || 'Turkish Airlines',
                            segments: dep.flight_segments.map((s: any) => ({
                                from: s.departure_airport,
                                to: s.arrival_airport,
                                flightNum: s.flight_number,
                                date: new Date(s.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }),
                                time: new Date(s.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                            }))
                        });
                    }
                }
                if (groupLogistics.flight_return_id) {
                    const { data: ret } = await supabase
                        .from('flights')
                        .select('*, flight_segments(*)')
                        .eq('id', groupLogistics.flight_return_id)
                        .maybeSingle();
                    if (ret && ret.flight_segments) {
                        flightsList.push({
                            type: 'RETOUR',
                            carrier: ret.flight_segments[0]?.airline || 'Saudi Arabian',
                            segments: ret.flight_segments.map((s: any) => ({
                                from: s.departure_airport,
                                to: s.arrival_airport,
                                flightNum: s.flight_number,
                                date: new Date(s.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }),
                                time: new Date(s.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                            }))
                        });
                    }
                }
            }
        }

        // 2. Resolve Hotels
        let hotelsList: any[] = [];
        if (individualHotel && (individualHotel.makkah_hotel_id || individualHotel.madinah_hotel_id)) {
            const hotelIds = [];
            if (individualHotel.makkah_hotel_id) hotelIds.push(individualHotel.makkah_hotel_id);
            if (individualHotel.madinah_hotel_id) hotelIds.push(individualHotel.madinah_hotel_id);

            if (hotelIds.length > 0) {
                const { data: dbHotels } = await supabase
                    .from('hotels')
                    .select('id, name, city')
                    .in('id', hotelIds);

                if (dbHotels) {
                    const makkahDb = dbHotels.find(h => h.id === individualHotel.makkah_hotel_id);
                    const madinahDb = dbHotels.find(h => h.id === individualHotel.madinah_hotel_id);
                    
                    if (makkahDb) {
                        hotelsList.push({
                            name: makkahDb.name,
                            city: 'Makkah',
                            checkIn: individualHotel.makkah_checkin ? new Date(individualHotel.makkah_checkin).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }) : 'À définir',
                            checkOut: individualHotel.makkah_checkout ? new Date(individualHotel.makkah_checkout).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }) : 'À définir'
                        });
                    }
                    if (madinahDb) {
                        hotelsList.push({
                            name: madinahDb.name,
                            city: 'Madinah',
                            checkIn: individualHotel.madinah_checkin ? new Date(individualHotel.madinah_checkin).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }) : 'À définir',
                            checkOut: individualHotel.madinah_checkout ? new Date(individualHotel.madinah_checkout).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }) : 'À définir'
                        });
                    }
                }
            }
        }

        // If hotelsList is empty, fetch group hotel stays
        if (hotelsList.length === 0 && groupId && groupId !== '1') {
            const { data: groupStays } = await supabase
                .from('group_hotel_stays')
                .select('*, hotels(*)')
                .eq('group_id', groupId)
                .order('check_in', { ascending: true });

            if (groupStays) {
                hotelsList = groupStays.map((s: any) => ({
                    name: s.hotels?.name || 'Hôtel',
                    city: s.hotels?.city || 'MAKKAH',
                    checkIn: s.check_in ? new Date(s.check_in).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }) : '',
                    checkOut: s.check_out ? new Date(s.check_out).toLocaleDateString('fr-FR', { day: 'numeric', month: '2-digit' }) : ''
                }));
            }
        }

        // 3. Resolve Program
        let programList: any[] = [];
        const progResult = await getPilgrimProgram(
            (pilgrimId && pilgrimId !== 'demo-pilgrim-id') ? pilgrimId : null,
            undefined,
            groupId
        );
        if (progResult && progResult.days) {
            programList = progResult.days.map((d: any) => ({
                day: d.day,
                date: d.date,
                activities: d.guidedActivities.map((act: any) => ({
                    time: act.time,
                    title: act.title,
                    description: act.description
                }))
            }));
        }

        // Fallbacks for empty results - Return empty arrays instead of mock/fake data
        if (flightsList.length === 0) {
            flightsList = [];
        }

        if (hotelsList.length === 0) {
            hotelsList = [];
        }

        if (programList.length === 0) {
            programList = [];
        }

        return {
            success: true,
            data: {
                groupName,
                groupId,
                pilgrimName: resolvedPilgrimName,
                flights: flightsList,
                hotels: hotelsList,
                program: programList
            }
        };

    } catch (error: any) {
        console.error("Error fetching journal data:", error);
        return {
            success: false,
            error: error.message || "Erreur de chargement du carnet de voyage"
        };
    }
}

export async function toggleRoomBreakfastAction(roomId: string, hasBreakfast: boolean) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('rooms')
            .update({ has_breakfast: hasBreakfast })
            .eq('id', roomId);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error("Error toggling room breakfast:", e);
        return { error: e.message || "Erreur de modification du petit-déjeuner." };
    }
}

export async function getGroup(groupId: string) {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single();
        if (error) throw error;
        return { success: true, group: data };
    } catch (e: any) {
        console.error("Error in getGroup:", e);
        return { success: false, error: e.message || "Erreur de récupération du groupe" };
    }
}

export async function getRoomingAssignmentsForTransfers() {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();
    
    // 1. Get all room assignments with rooms and hotels details
    const { data: assignments, error } = await supabase
        .from('room_assignments')
        .select(`
            pilgrim_id,
            room_id,
            rooms (
                room_number,
                type,
                hotels (
                    id,
                    name,
                    city
                )
            )
        `);

    if (error) {
        console.error("Error fetching room assignments:", error);
        return {};
    }

    const result: Record<string, {
        makkahHotel: string;
        makkahRoom: string;
        madinahHotel: string;
        madinahRoom: string;
    }> = {};

    (assignments || []).forEach((item: any) => {
        const pId = item.pilgrim_id;
        const room = item.rooms as any;
        if (!room) return;
        const hotel = room.hotels as any;
        if (!hotel) return;

        if (!result[pId]) {
            result[pId] = {
                makkahHotel: '',
                makkahRoom: '',
                madinahHotel: '',
                madinahRoom: ''
            };
        }

        const city = (hotel.city || '').toUpperCase();
        if (city === 'MAKKAH') {
            result[pId].makkahHotel = hotel.name || '';
            result[pId].makkahRoom = room.room_number || '';
        } else if (city === 'MADINAH') {
            result[pId].madinahHotel = hotel.name || '';
            result[pId].madinahRoom = room.room_number || '';
        }
    });

    // 2. Fallback to individual_hotel_info from pilgrims table
    const { data: pilgrims } = await supabase
        .from('pilgrims')
        .select(`
            id,
            individual_hotel_info
        `);

    const { data: hotelsList } = await supabase
        .from('hotels')
        .select('id, name, city');

    const hotelMap: Record<string, { name: string, city: string }> = {};
    (hotelsList || []).forEach(h => {
        hotelMap[h.id] = { name: h.name || '', city: h.city || '' };
    });

    (pilgrims || []).forEach((p: any) => {
        const info = p.individual_hotel_info;
        if (!info) return;

        const pId = p.id;
        if (!result[pId]) {
            result[pId] = {
                makkahHotel: '',
                makkahRoom: '',
                madinahHotel: '',
                madinahRoom: ''
            };
        }

        if (!result[pId].makkahHotel && info.makkah_hotel_id) {
            const h = hotelMap[info.makkah_hotel_id];
            if (h) result[pId].makkahHotel = h.name;
        }

        if (!result[pId].madinahHotel && info.madinah_hotel_id) {
            const h = hotelMap[info.madinah_hotel_id];
            if (h) result[pId].madinahHotel = h.name;
        }
    });

    return result;
}

export async function parsePlanningTextAction(text: string) {
    if (!text || text.trim().length === 0) {
        return { error: "Texte vide" };
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
        return { error: "Clé API OpenRouter manquante" };
    }

    console.log("Using OpenRouter to parse raw planning text...");
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openrouterKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://omrayanair.vercel.app",
                "X-Title": "OMRAYANAIR"
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                    {
                        role: "user",
                        content: `Tu es un assistant spécialisé dans l'organisation de l'Omra. Analyse le texte brut décrivant le programme d'une journée et extrais-en la liste ordonnée chronologiquement des activités.
Pour chaque activité identifiée, détermine avec précision :
- time : l'heure ou plage horaire (ex: "04:30" ou "05:30 - 06:30" ou "12:25")
- title : le titre de l'activité (ex: "Arrivée à La Mecque" ou "Repos obligatoire")
- location : le lieu où se déroule l'activité (ex: "Hôtel", "Masjid al-Haram", "Miqat")
- type : le type approprié parmi ces valeurs exactes : "RITUEL", "ZIYARAT", "TRANSPORT", "REPAS", "REPOS"
- description : les consignes, détails pratiques, interdictions et rappels importants associés à cette étape (garde les consignes importantes sous forme textuelle synthétique claire).

Donne uniquement le tableau JSON d'objets brut (sans bloc de code markdown, pas de \`\`\`json et pas d'autre texte autour) avec la structure exacte suivante :
[
  {
    "id": "un identifiant unique (ex: chaine numérique aléatoire ou index)",
    "time": "...",
    "title": "...",
    "location": "...",
    "type": "...",
    "description": "..."
  }
]`
                    },
                    {
                        role: "user",
                        content: `Voici le texte à analyser :\n\n${text}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("OpenRouter API error:", errText);
            throw new Error("Erreur de l'API OpenRouter");
        }

        const jsonRes = await response.json();
        const textResponse = jsonRes.choices?.[0]?.message?.content;
        if (textResponse) {
            const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedActivities = JSON.parse(cleanedText);
            if (Array.isArray(parsedActivities)) {
                return { success: true, activities: parsedActivities };
            }
        }
        return { error: "Format de réponse invalide" };
    } catch (e: any) {
        console.error("Error parsing planning text:", e);
        return { error: e.message || "Erreur de traitement du planning" };
    }
}

export async function getGroupPlanningAction(groupId: string) {
    const supabase = createClient();
    try {
        const { data: logisticsList } = await supabase
            .from('group_logistics')
            .select('custom_planning')
            .eq('group_id', groupId)
            .limit(1);

        const logistics = logisticsList?.[0];
        return { success: true, customPlanning: logistics?.custom_planning || {} };
    } catch (e: any) {
        console.error("Error in getGroupPlanningAction:", e);
        return { error: e.message || "Erreur de chargement du planning" };
    }
}

export async function saveGroupPlanningAction(groupId: string, dayNumber: number, activities: any[]) {
    const supabase = createClient();
    try {
        const { data: logisticsList, error: fetchErr } = await supabase
            .from('group_logistics')
            .select('custom_planning')
            .eq('group_id', groupId)
            .limit(1);

        const logistics = logisticsList?.[0];
        let currentPlanning: any = {};
        if (logistics && logistics.custom_planning) {
            currentPlanning = logistics.custom_planning;
        }

        // Update the specific day with sanitization
        const sanitizedActivities = activities.map((act: any) => ({
            id: act.id,
            time: act.time || '',
            title: act.title || '',
            location: act.location || '',
            type: act.type || 'RITUEL',
            description: act.description || ''
        }));

        currentPlanning[dayNumber.toString()] = sanitizedActivities;

        if (logistics) {
            await supabase
                .from('group_logistics')
                .update({
                    custom_planning: currentPlanning,
                    updated_at: new Date().toISOString()
                })
                .eq('group_id', groupId);
        } else {
            await supabase
                .from('group_logistics')
                .insert({
                    group_id: groupId,
                    custom_planning: currentPlanning,
                    updated_at: new Date().toISOString()
                });
        }

        return { success: true };
    } catch (e: any) {
        console.error("Error in saveGroupPlanningAction:", e);
        return { error: e.message || "Erreur lors de l'enregistrement du planning" };
    }
}

export async function getAssistanceRequestsAction() {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from('assistance_requests')
            .select(`
                id,
                category,
                priority,
                message,
                status,
                created_at,
                pilgrim_id,
                profiles:pilgrim_id (
                    full_name,
                    phone
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch pilgrims and groups to attach group names
        const { data: pilgrims } = await supabase
            .from('pilgrims')
            .select(`
                id,
                groups (
                    name
                )
            `);

        const pilgrimGroupMap: Record<string, string> = {};
        if (pilgrims) {
            pilgrims.forEach((p: any) => {
                pilgrimGroupMap[p.id] = p.groups?.name || 'Sans groupe';
            });
        }

        const requests = (data || []).map((req: any) => ({
            ...req,
            pilgrim_name: req.profiles?.full_name || 'Pèlerin inconnu',
            pilgrim_phone: req.profiles?.phone || 'Non renseigné',
            group_name: pilgrimGroupMap[req.pilgrim_id] || 'Sans groupe'
        }));

        return { success: true, requests };
    } catch (e: any) {
        console.error("getAssistanceRequestsAction error:", e);
        return { error: e.message || "Erreur lors du chargement des demandes d'assistance" };
    }
}

export async function resolveAssistanceRequestAction(id: string) {
    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('assistance_requests')
            .update({ status: 'CLOSED' })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error("resolveAssistanceRequestAction error:", e);
        return { error: e.message || "Impossible de clore la demande d'assistance" };
    }
}

export async function updatePilgrimCheckinStatusAction(pilgrimId: string, checkinDone: boolean) {
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");

        const isAdmin = await isAdminAuthenticated();
        if (user.id !== pilgrimId && !isAdmin) {
            throw new Error("Non autorisé à modifier ce dossier");
        }

        const { error } = await supabase
            .from('profiles')
            .update({ checkin_done: checkinDone })
            .eq('id', pilgrimId);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error("updatePilgrimCheckinStatusAction error:", e);
        return { success: false, error: e.message || "Erreur de mise à jour" };
    }
}
