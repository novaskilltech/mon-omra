'use server';

import { createClient } from '@/utils/supabase/server';
import { FlightSchema, Flight } from '@/types/logistics';
import { revalidatePath } from 'next/cache';

/**
 * LOGISTICS ACTIONS (LOT 2)
 * Implementation of server-side logic for Flights and Hotels
 */

export async function createFlight(data: Flight) {
    const supabase = createClient();

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Non autorisé");

    // 2. Validation logic
    const validated = FlightSchema.parse(data);

    // 3. Insert parent Flight (FORCE agency_id from session)
    const { data: flight, error: flightError } = await supabase
        .from('flights')
        .insert({
            agency_id: user.id, // Secure: never trust client provided ID
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

    const { data, error } = await supabase
        .from('flights')
        .select(`
            *,
            flight_segments (*)
        `)
        .eq('agency_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function getAgencyHotels() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

    const { data, error } = await supabase
        .from('hotels')
        .select(`
            *,
            rooms (*)
        `)
        .eq('agency_id', user.id);

    if (error) throw new Error(error.message);
    return data;
}

export async function createHotel(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

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
                agency_id: user.id,
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

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
            .eq('agency_id', user.id);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

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
            .eq('agency_id', user.id);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Non autorisé");

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Non autorisé" };

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
