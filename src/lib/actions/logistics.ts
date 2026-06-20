'use server';

import { createClient } from '@/utils/supabase/server';
import { FlightSchema, Flight } from '@/types/logistics';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { isAdminAuthenticated } from './auth';


async function getAuthUserId(supabase: any): Promise<string> {
    const isAdmin = await isAdminAuthenticated();
    if (isAdmin) {
        try {
            const { data: adminProfile } = await supabase
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

        // 4. --- MAHRAM VALIDATION ---
        const occupants = room.room_assignments.map((ra: any) => ra.profiles);
        
        if (occupants.length > 0) {
            const mixedGender = occupants.some((o: any) => o.gender !== pilgrim.gender);
            const differentFamily = occupants.some((o: any) => o.family_name !== pilgrim.family_name);

            if (mixedGender && differentFamily) {
                return { 
                    error: "Règle Mahram : Impossible de mixer les genres de familles différentes dans la même chambre." 
                };
            }
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

            const first = segments[0];
            const last = segments[segments.length - 1];

            flightInfo = {
                departureAirport: first.departure_airport,
                arrivalAirport: last.arrival_airport,
                departureCity: first.departure_airport === 'CDG' || first.departure_airport === 'ORY' ? 'Paris, FR' : first.departure_airport,
                arrivalCity: last.arrival_airport === 'JED' ? 'Jeddah, SA' : last.arrival_airport === 'MED' ? 'Médine, SA' : last.arrival_airport,
                departureDate: first.departure_time ? new Date(first.departure_time).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
                departureTime: first.departure_time ? new Date(first.departure_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
                departureDateIso: first.departure_time ? new Date(first.departure_time).toISOString() : '',
                carrier: first.airline,
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
            const { data: rawMembers } = await supabase
                .from('profiles')
                .select(`
                    id,
                    full_name,
                    visa_status,
                    checkin_done,
                    pilgrims!inner (
                        id,
                        family_head_id,
                        package_price
                    )
                `)
                .or(`id.eq.${familyHeadId},pilgrims.family_head_id.eq.${familyHeadId}`)
                .eq('role', 'PILGRIM');

            const filteredMembers = (rawMembers || []).filter((m: any) => m.id !== resolvedId);
            
            for (const member of filteredMembers) {
                const { data: memberPayments } = await supabase
                    .from('payments')
                    .select('amount')
                    .eq('pilgrim_id', member.id)
                    .eq('status', 'COMPLETED');
                const memberTotalPaid = memberPayments ? memberPayments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) : 0;
                
                const memberDetail = Array.isArray(member.pilgrims) ? member.pilgrims[0] : member.pilgrims;
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
                    payment_status: memberIsPaid ? 'Payé' : 'En attente',
                    payment_ok: memberIsPaid
                });
            }
        } catch (familyErr) {
            console.error("Error fetching family members:", familyErr);
        }

        return {
            pilgrimName: `${profile.full_name || ''}`.trim() || "Salah Lamkhannet",
            daysToDeparture: daysToDeparture,
            departureAirport: flightInfo?.departureAirport || "CDG",
            arrivalAirport: flightInfo?.arrivalAirport || "JED",
            departureCity: flightInfo?.departureCity || "Paris, FR",
            arrivalCity: flightInfo?.arrivalCity || "Jeddah, SA",
            departureDate: flightInfo?.departureDate || targetDateStr,
            departureTime: flightInfo?.departureTime || targetTimeStr,
            departureDateIso: flightInfo?.departureDateIso || targetDateIso,
            carrier: flightInfo?.carrier || "Turkish Airlines",
            baggage_policy: flightInfo?.baggage_policy || "2 x 23kg inclus",
            segments: flightInfo?.segments || [
                { departure_airport: 'CDG', arrival_airport: 'IST', airline: 'Turkish Airlines', flight_number: 'TK1822', departure_time: new Date(targetDate.getTime() - 4 * 60 * 60 * 1000).toISOString(), arrival_time: new Date(targetDate.getTime() - 2 * 60 * 60 * 1000).toISOString(), sequence_order: 0 },
                { departure_airport: 'IST', arrival_airport: 'JED', airline: 'Turkish Airlines', flight_number: 'TK96', departure_time: new Date(targetDate.getTime() - 1 * 60 * 60 * 1000).toISOString(), arrival_time: targetDateIso, sequence_order: 1 }
            ],
            checklist: [
                { label: "Visa Omra", status: profile.visa_status === 'APPROVED' ? "OK" : "En cours", ok: profile.visa_status === 'APPROVED' },
                { label: "Solde", status: isPaid ? "Payé" : "En attente", ok: isPaid },
                { label: "Check-in", status: profile.checkin_done ? "Prêt" : "À faire", ok: !!profile.checkin_done },
            ],
            familyMembers
        };
    } catch (err) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 12);
        targetDate.setHours(11, 15, 0, 0);

        const targetDateStr = targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        const targetTimeStr = targetDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const targetDateIso = targetDate.toISOString();

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
        .select('id, full_name, family_name, gender, pilgrims!inner(group_id)')
        .eq('pilgrims.group_id', groupId);

    const mappedPilgrims = (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || '',
        family: p.family_name || p.full_name?.split(' ')[1] || '',
        gender: p.gender || 'M'
    }));

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

    const mappedStays = (stays || []).map((s: any) => ({
        id: s.id,
        hotel_id: s.hotel_id,
        hotel_name: s.hotels?.name || 'Hôtel',
        city: s.hotels?.city || 'MAKKAH'
    }));

    // 4. Get rooms of these hotels
    const hotelIds = mappedStays.map(s => s.hotel_id);
    let mappedRooms: any[] = [];
    if (hotelIds.length > 0) {
        let { data: rooms } = await supabase
            .from('rooms')
            .select('*')
            .in('hotel_id', hotelIds);
        
        let currentRooms = rooms || [];

        // Check if any hotel is missing rooms; if so, populate defaults.
        for (const hotelId of hotelIds) {
            const hasRooms = currentRooms.some(r => r.hotel_id === hotelId);
            if (!hasRooms) {
                const defaultRooms = [];
                // Generate 5 rooms of each major type (DOUBLE, TRIPLE, QUADRUPLE)
                for (let i = 1; i <= 5; i++) {
                    defaultRooms.push({ hotel_id: hotelId, type: 'DOUBLE', capacity: 2 });
                    defaultRooms.push({ hotel_id: hotelId, type: 'TRIPLE', capacity: 3 });
                    defaultRooms.push({ hotel_id: hotelId, type: 'QUADRUPLE', capacity: 4 });
                }
                const { data: inserted, error: insertError } = await supabase
                    .from('rooms')
                    .insert(defaultRooms)
                    .select();
                if (!insertError && inserted) {
                    currentRooms = [...currentRooms, ...inserted];
                }
            }
        }
        
        mappedRooms = currentRooms.map((r: any) => ({
            id: r.id,
            hotel_id: r.hotel_id,
            type: r.type,
            capacity: r.capacity
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

export async function createRoomAction(hotelId: string, roomNumber: string, type: 'DOUBLE' | 'TRIPLE' | 'QUADRUPLE') {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();
    
    const capacity = type === 'DOUBLE' ? 2 : type === 'TRIPLE' ? 3 : 4;

    const { data, error } = await supabase
        .from('rooms')
        .insert({
            hotel_id: hotelId,
            room_number: roomNumber || null,
            type,
            capacity
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/backoffice/logistics/hotels');
    return { success: true, room: data };
}

export async function deleteRoomAction(roomId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) throw new Error("Non autorisé");

    const supabase = createClient();

    // Check assignments
    const { data: assignments } = await supabase
        .from('room_assignments')
        .select('id')
        .eq('room_id', roomId)
        .limit(1);

    if (assignments && assignments.length > 0) {
        return { error: "Cette chambre contient des occupants et ne peut pas être supprimée." };
    }

    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

    if (error) throw new Error(error.message);

    revalidatePath('/backoffice/logistics/hotels');
    return { success: true };
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
