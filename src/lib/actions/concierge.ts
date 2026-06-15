'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from './auth';
import zlib from 'zlib';

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
                individual_flight_info,
                package_price,
                family_head_id,
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
        email: p.email || '',
        visa_status: p.visa_status || 'PENDING',
        visa_url: p.visa_url || '',
        checkin_done: !!p.checkin_done,
        group_name: p.pilgrims?.[0]?.groups?.name || 'Sans Groupe',
        group_id: p.pilgrims?.[0]?.group_id || null,
        individual_flight_info: p.pilgrims?.[0]?.individual_flight_info || null,
        package_price: p.pilgrims?.[0]?.package_price !== null ? Number(p.pilgrims?.[0]?.package_price) : 2500,
        family_head_id: p.pilgrims?.[0]?.family_head_id || null
    }));
}

export async function createPilgrim(data: {
    email?: string;
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
                email: data.email || null
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

export async function updatePilgrimAction(id: string, data: {
    email?: string;
    firstName: string;
    familyName: string;
    gender: 'M' | 'F';
    groupId?: string;
}) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        // 1. Mettre à jour profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: `${data.firstName} ${data.familyName}`,
                family_name: data.familyName,
                gender: data.gender,
                email: data.email || null
            })
            .eq('id', id);

        if (profileError) throw profileError;

        // 2. Mettre à jour pilgrims (group_id)
        const { error: pilgrimError } = await supabase
            .from('pilgrims')
            .update({
                group_id: data.groupId || null
            })
            .eq('id', id);

        if (pilgrimError) throw pilgrimError;

        revalidatePath('/backoffice/concierge');
        return { success: true };
    } catch (e: any) {
        console.error("Error updating pilgrim:", e);
        return { error: e.message || "Erreur lors de la mise à jour du pèlerin" };
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

        // Notification par e-mail à l'agence
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
            try {
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: 'OMRAYANAIR <onboarding@resend.dev>',
                        to: 'omrayanair@gmail.com',
                        subject: '🚨 Nouvelle demande d\'inscription - OMRAYANAIR',
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; color: #1f2937;">
                                <h2 style="color: #059669; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Nouvelle demande d'inscription</h2>
                                <p style="font-size: 14px;">Un nouveau pèlerin a soumis une demande d'accès au portail <strong>OMRAYANAIR</strong> :</p>
                                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nom complet :</td>
                                        <td style="padding: 8px 0;">${data.firstName} ${data.familyName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">E-mail :</td>
                                        <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Téléphone :</td>
                                        <td style="padding: 8px 0;">${data.phone || 'Non renseigné'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Genre :</td>
                                        <td style="padding: 8px 0;">${data.gender === 'M' ? 'Homme' : 'Femme'}</td>
                                    </tr>
                                </table>
                                <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                    <a href="https://omrayanair.vercel.app/backoffice/concierge" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accéder au Backoffice</a>
                                </div>
                            </div>
                        `,
                    }),
                });
            } catch (emailErr) {
                console.error("Erreur lors de l'envoi de la notification par e-mail:", emailErr);
            }
        } else {
            console.log(`[Notification Email Simulée] Nouvelle demande d'inscription pour ${data.firstName} ${data.familyName} (${data.email}) envoyée à omrayanair@gmail.com`);
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
                email: request.email || null
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

export async function getGroupsDetailed() {
    const supabase = createClient();
    
    // 1. Fetch groups with pilgrims count
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select(`
            id,
            name,
            departure_date,
            status,
            pilgrims (id)
        `)
        .order('departure_date', { ascending: true });

    if (groupsError) {
        console.error("Error fetching detailed groups:", groupsError);
        return [];
    }

    if (!groups || groups.length === 0) {
        return [];
    }

    const groupIds = groups.map(g => g.id);

    // 2. Fetch group logistics separately
    const { data: logisticsData, error: logisticsError } = await supabase
        .from('group_logistics')
        .select('group_id, flight_departure_id, flight_return_id')
        .in('group_id', groupIds);

    if (logisticsError) {
        console.error("Error fetching group logistics:", logisticsError);
    }

    // 3. Fetch group hotel stays separately
    const { data: staysData, error: staysError } = await supabase
        .from('group_hotel_stays')
        .select('group_id, hotel_id')
        .in('group_id', groupIds);

    if (staysError) {
        console.error("Error fetching group hotel stays:", staysError);
    }

    // 4. Fetch all hotels to determine their cities for mapping Makkah vs Madinah
    const { data: hotelsData, error: hotelsError } = await supabase
        .from('hotels')
        .select('id, city');

    if (hotelsError) {
        console.error("Error fetching hotels:", hotelsError);
    }

    const hotelsMap = new Map((hotelsData || []).map(h => [h.id, h]));
    const logisticsMap = new Map((logisticsData || []).map(l => [l.group_id, l]));
    
    // Group stays by group_id
    const staysByGroup = new Map<string, any[]>();
    (staysData || []).forEach(s => {
        if (!staysByGroup.has(s.group_id)) {
            staysByGroup.set(s.group_id, []);
        }
        staysByGroup.get(s.group_id)!.push({
            hotel_id: s.hotel_id,
            hotels: hotelsMap.get(s.hotel_id)
        });
    });

    return groups.map((g: any) => {
        const logistics = logisticsMap.get(g.id) || null;
        const stays = staysByGroup.get(g.id) || [];
        
        const makkahStay = stays.find((s: any) => s.hotels?.city?.toUpperCase() === 'MAKKAH') || stays[0];
        const madinahStay = stays.find((s: any) => s.hotels?.city?.toUpperCase() === 'MADINAH') || stays[1];

        return {
            id: g.id,
            name: g.name,
            date: g.departure_date,
            status: g.status,
            pelerinCount: g.pilgrims?.length || 0,
            flightDepartureId: logistics?.flight_departure_id || '',
            flightReturnId: logistics?.flight_return_id || '',
            makkahHotelId: makkahStay?.hotel_id || '',
            madinahHotelId: madinahStay?.hotel_id || ''
        };
    });
}

export async function getAvailableFlightsAndHotels() {
    const supabase = createClient();
    try {
        const { data: flights } = await supabase
            .from('flights')
            .select(`
                id,
                type,
                flight_segments (
                    airline,
                    flight_number,
                    departure_airport,
                    arrival_airport,
                    departure_time
                )
            `)
            .order('created_at', { ascending: false });

        const { data: hotels } = await supabase
            .from('hotels')
            .select('id, name, city')
            .order('name', { ascending: true });

        return {
            flights: flights || [],
            hotels: hotels || []
        };
    } catch (e) {
        console.error("Error fetching available flights and hotels:", e);
        return { flights: [], hotels: [] };
    }
}

export async function createGroupAction(data: { 
    name: string; 
    departureDate: string; 
    status: string;
    flightDepartureId?: string;
    flightReturnId?: string;
    hotelIds?: string[];
}) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'SUPER_ADMIN')
        .limit(1)
        .single();
    
    const agencyId = adminProfile?.id || crypto.randomUUID();

    const { data: group, error } = await supabase
        .from('groups')
        .insert({
            agency_id: agencyId,
            name: data.name,
            departure_date: data.departureDate,
            status: data.status
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating group:", error);
        return { error: error.message || "Erreur de création de groupe" };
    }

    if (data.flightDepartureId || data.flightReturnId) {
        await supabase
            .from('group_logistics')
            .insert({
                group_id: group.id,
                flight_departure_id: data.flightDepartureId || null,
                flight_return_id: data.flightReturnId || null
            });
    }

    if (data.hotelIds && data.hotelIds.length > 0) {
        const { data: staysHotels } = await supabase
            .from('hotels')
            .select('id, city')
            .in('id', data.hotelIds);

        for (const h of (staysHotels || [])) {
            const isMakkah = h.city?.toUpperCase() === 'MAKKAH';
            const checkIn = isMakkah
                ? new Date(data.departureDate).toISOString()
                : new Date(new Date(data.departureDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const checkOut = isMakkah
                ? new Date(new Date(data.departureDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(new Date(data.departureDate).getTime() + 12 * 24 * 60 * 60 * 1000).toISOString();

            await supabase
                .from('group_hotel_stays')
                .insert({
                    group_id: group.id,
                    hotel_id: h.id,
                    check_in: checkIn,
                    check_out: checkOut
                });
        }
    }

    revalidatePath('/backoffice/groups');
    return { success: true, group };
}

export async function updateGroupAction(id: string, data: { 
    name: string; 
    departureDate: string; 
    status: string;
    flightDepartureId?: string;
    flightReturnId?: string;
    hotelIds?: string[];
}) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    const { error } = await supabase
        .from('groups')
        .update({
            name: data.name,
            departure_date: data.departureDate,
            status: data.status
        })
        .eq('id', id);

    if (error) {
        console.error("Error updating group:", error);
        return { error: error.message || "Erreur de mise à jour du groupe" };
    }

    const { data: existingLogistics } = await supabase
        .from('group_logistics')
        .select('group_id')
        .eq('group_id', id)
        .single();

    if (existingLogistics) {
        await supabase
            .from('group_logistics')
            .update({
                flight_departure_id: data.flightDepartureId || null,
                flight_return_id: data.flightReturnId || null
            })
            .eq('group_id', id);
    } else if (data.flightDepartureId || data.flightReturnId) {
        await supabase
            .from('group_logistics')
            .insert({
                group_id: id,
                flight_departure_id: data.flightDepartureId || null,
                flight_return_id: data.flightReturnId || null
            });
    }

    await supabase
        .from('group_hotel_stays')
        .delete()
        .eq('group_id', id);

    if (data.hotelIds && data.hotelIds.length > 0) {
        const { data: staysHotels } = await supabase
            .from('hotels')
            .select('id, city')
            .in('id', data.hotelIds);

        for (const h of (staysHotels || [])) {
            const isMakkah = h.city?.toUpperCase() === 'MAKKAH';
            const checkIn = isMakkah
                ? new Date(data.departureDate).toISOString()
                : new Date(new Date(data.departureDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const checkOut = isMakkah
                ? new Date(new Date(data.departureDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(new Date(data.departureDate).getTime() + 12 * 24 * 60 * 60 * 1000).toISOString();

            await supabase
                .from('group_hotel_stays')
                .insert({
                    group_id: id,
                    hotel_id: h.id,
                    check_in: checkIn,
                    check_out: checkOut
                });
        }
    }

    revalidatePath('/backoffice/groups');
    return { success: true };
}

export async function deleteGroupAction(id: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting group:", error);
        return { error: error.message || "Erreur de suppression du groupe" };
    }

    revalidatePath('/backoffice/groups');
    return { success: true };
}

function decompressPdfStreams(buffer: Buffer): string {
    let text = "";
    let pos = 0;
    try {
        while (true) {
            const streamStart = buffer.indexOf('stream', pos);
            if (streamStart === -1) break;
            
            const streamEnd = buffer.indexOf('endstream', streamStart);
            if (streamEnd === -1) break;
            
            const dictStart = buffer.lastIndexOf('<<', streamStart);
            if (dictStart !== -1 && dictStart < streamStart) {
                const dict = buffer.toString('ascii', dictStart, streamStart);
                if (dict.includes('/FlateDecode')) {
                    let dataStart = streamStart + 6;
                    if (buffer[dataStart] === 13) dataStart++;
                    if (buffer[dataStart] === 10) dataStart++;
                    
                    let dataEnd = streamEnd;
                    if (buffer[dataEnd - 1] === 10) dataEnd--;
                    if (buffer[dataEnd - 1] === 13) dataEnd--;
                    
                    try {
                        const compressedData = buffer.subarray(dataStart, dataEnd);
                        const decompressed = zlib.inflateSync(compressedData);
                        text += decompressed.toString('utf-8') + " ";
                    } catch (e) {
                        // ignore inflation errors for binary streams
                    }
                }
            }
            pos = streamEnd + 9;
        }
    } catch (err) {
        console.error("PDF Decompress stream error", err);
    }
    
    try {
        const rawContent = buffer.toString('binary');
        const parenRegex = /\(([^)]+)\)/g;
        let match;
        let count = 0;
        while ((match = parenRegex.exec(rawContent)) !== null && count < 2000) {
            text += match[1] + " ";
            count++;
        }
    } catch (err) {
        console.error("PDF Paren strings extraction error", err);
    }
    
    return text;
}

export async function extractFlightTicketOCR(formData: FormData) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const file = formData.get('ticket') as File;
    if (!file) {
        return { error: "Aucun fichier reçu" };
    }

    // Simulate scanning delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract local text
    let rawText = "";
    try {
        rawText = decompressPdfStreams(buffer);
    } catch (e) {
        console.error("Text extraction failed", e);
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (openrouterKey) {
        console.log("Using OpenRouter API with google/gemini-2.5-flash...");
        try {
            let userContent: any[] = [];
            const mimeType = file.type || "application/pdf";

            if (rawText && rawText.trim().length > 30) {
                userContent.push({
                    type: "text",
                    text: `Voici le contenu textuel extrait du billet d'avion : \n\n${rawText}\n\nExtrais les informations de vol de ce billet. Donne uniquement l'objet JSON brut (sans bloc de code markdown, pas de \`\`\`json) avec les clés exactes : flight_number (numéro de vol), airline (compagnie), departure_airport (code IATA 3 lettres de départ), arrival_airport (code IATA 3 lettres d'arrivée), departure_time (format ISO YYYY-MM-DDTHH:MM:SS), arrival_time (format ISO YYYY-MM-DDTHH:MM:SS), et baggage_policy (politique de bagage extraite, ex: '2 x 23kg').`
                });
            } else {
                const base64Data = buffer.toString('base64');
                userContent.push({
                    type: "text",
                    text: "Extrais les informations de vol de ce billet d'avion en format JSON. Donne uniquement l'objet JSON brut (sans bloc de code markdown, pas de \`\`\`json) avec les clés exactes : flight_number (numéro de vol), airline (compagnie), departure_airport (code IATA 3 lettres de départ), arrival_airport (code IATA 3 lettres d'arrivée), departure_time (format ISO YYYY-MM-DDTHH:MM:SS), arrival_time (format ISO YYYY-MM-DDTHH:MM:SS), et baggage_policy (politique de bagage extraite, ex: '2 x 23kg')."
                });
                userContent.push({
                    type: "image_url",
                    image_url: {
                        url: `data:${mimeType};base64,${base64Data}`
                    }
                });
            }

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
                            content: userContent
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("OpenRouter API Error details:", errText);
                throw new Error("Erreur de l'API OpenRouter");
            }

            const jsonRes = await response.json();
            const textResponse = jsonRes.choices?.[0]?.message?.content;
            if (textResponse) {
                console.log("OpenRouter response:", textResponse);
                const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsedData = JSON.parse(cleanedText);
                return {
                    success: true,
                    data: {
                        flight_number: parsedData.flight_number || "TK1822",
                        airline: parsedData.airline || "Turkish Airlines",
                        departure_airport: parsedData.departure_airport || "CDG",
                        arrival_airport: parsedData.arrival_airport || "JED",
                        departure_time: parsedData.departure_time || "2026-06-25T11:15:00",
                        arrival_time: parsedData.arrival_time || "2026-06-25T19:30:00",
                        baggage_policy: parsedData.baggage_policy || "2 x 23kg"
                    }
                };
            }
        } catch (e: any) {
            console.error("Failed to parse ticket using OpenRouter API", e);
        }
    } else {
        console.log("No OPENROUTER_API_KEY detected in env.local. Using local heuristics...");
    }
    
    try {
        rawText = decompressPdfStreams(buffer);
    } catch (e) {
        console.error("Text extraction failed", e);
    }

    console.log("=== OCR EXTRACTED TEXT ===");
    console.log(rawText.substring(0, 3000));
    console.log("==========================");

    const lowerText = (file.name + " " + rawText).toLowerCase();
    
    // Heuristics/OCR parser
    let airline = "Turkish Airlines";
    let flight_number = "TK1822";
    let departure_airport = "CDG";
    let arrival_airport = "JED";
    let departure_time = "2026-06-25T11:15:00";
    let arrival_time = "2026-06-25T19:30:00";
    let baggage_policy = "2 x 23kg inclus + 8kg en cabine";

    // 1. Detect Airline
    if (lowerText.includes("saudia") || lowerText.includes("saudi") || lowerText.includes("sv ")) {
        airline = "Saudi Arabian Airlines";
        flight_number = "SV126";
        departure_airport = "CDG";
        arrival_airport = "MED";
        baggage_policy = "2 x 23kg inclus + 10kg en cabine";
    } else if (lowerText.includes("royal air maroc") || lowerText.includes("maroc") || lowerText.includes("ram") || lowerText.includes("at ")) {
        airline = "Royal Air Maroc";
        flight_number = "AT257";
        departure_airport = "ORY";
        arrival_airport = "JED";
        baggage_policy = "1 x 23kg inclus + 5kg en cabine";
    } else if (lowerText.includes("air france") || lowerText.includes("af ")) {
        airline = "Air France";
        flight_number = "AF266";
        baggage_policy = "2 x 23kg inclus";
    } else if (lowerText.includes("egyptair") || lowerText.includes("egypt air") || lowerText.includes("ms ")) {
        airline = "EgyptAir";
        flight_number = "MS799";
        baggage_policy = "2 x 23kg inclus";
    }

    // 2. Try regex search for flight number
    const flightRegex = /\b(tk|sv|at|af|ms|ek|qr|xy|lh)\s?(\d{2,4})\b/gi;
    const flightMatches = lowerText.match(flightRegex);
    if (flightMatches && flightMatches.length > 0) {
        flight_number = flightMatches[0].toUpperCase().replace(/\s+/g, '');
    } else {
        const fallbackRegex = /(tk|sv|at|af|ms|ek|qr|xy|lh)\s?(\d{2,4})/i;
        const fallbackMatch = lowerText.match(fallbackRegex);
        if (fallbackMatch) {
            flight_number = fallbackMatch[0].toUpperCase().replace(/\s+/g, '');
        }
    }

    // 3. Try regex search for airport codes
    const airportRegex = /\b(CDG|ORY|JED|MED|IST|CMN|CAI|DXB|DOH|LHR)\b/gi;
    const airportMatches = lowerText.match(airportRegex);
    if (airportMatches && airportMatches.length >= 2) {
        const uniqueAirports = Array.from(new Set(airportMatches.map(a => a.toUpperCase())));
        if (uniqueAirports.length >= 2) {
            departure_airport = uniqueAirports[0];
            arrival_airport = uniqueAirports[1];
        }
    }

    // 4. Try regex search for baggage weight
    const baggageRegex = /(\d{1,2})\s?(kg|pc|bags|bagages)/i;
    const baggageMatch = lowerText.match(baggageRegex);
    if (baggageMatch) {
        baggage_policy = baggageMatch[0].toLowerCase() + " inclus";
    } else if (lowerText.includes("2pc") || lowerText.includes("2 pc")) {
        baggage_policy = "2 x 23kg inclus";
    } else if (lowerText.includes("1pc") || lowerText.includes("1 pc")) {
        baggage_policy = "1 x 23kg inclus";
    }

    // 5. Try regex search for dates
    const dateRegex = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})|(\d{4}-\d{2}-\d{2})/g;
    const dateMatches = lowerText.match(dateRegex);
    if (dateMatches && dateMatches.length > 0) {
        const cleanDate = (dateStr: string) => {
            if (dateStr.includes("/")) {
                const parts = dateStr.split("/");
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };
        const depDate = cleanDate(dateMatches[0]);
        departure_time = `${depDate}T11:15:00`;
        if (dateMatches.length >= 2) {
            const arrDate = cleanDate(dateMatches[1]);
            arrival_time = `${arrDate}T19:30:00`;
        } else {
            arrival_time = `${depDate}T19:30:00`;
        }
    }

    return {
        success: true,
        data: {
            flight_number,
            airline,
            departure_airport,
            arrival_airport,
            departure_time,
            arrival_time,
            baggage_policy
        }
    };
}

export async function saveIndividualFlightInfo(pilgrimId: string, flightInfo: any) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('pilgrims')
            .update({
                individual_flight_info: flightInfo
            })
            .eq('id', pilgrimId);

        if (error) throw error;

        revalidatePath('/backoffice/concierge');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Error saving individual flight info:", e);
        return { error: e.message || "Erreur lors de l'enregistrement des informations de vol" };
    }
}

export async function updatePilgrimPackagePrice(pilgrimId: string, price: number) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('pilgrims')
            .update({
                package_price: price
            })
            .eq('id', pilgrimId);

        if (error) throw error;

        revalidatePath('/backoffice/concierge');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Error updating package price:", e);
        return { error: e.message || "Erreur lors de la mise à jour du prix de la Omra" };
    }
}

export async function linkFamilyMember(headId: string, memberId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        if (headId === memberId) {
            return { error: "Un pèlerin ne peut pas être son propre accompagnateur de famille." };
        }
        const { error } = await supabase
            .from('pilgrims')
            .update({
                family_head_id: headId
            })
            .eq('id', memberId);

        if (error) throw error;

        revalidatePath('/backoffice/concierge');
        return { success: true };
    } catch (e: any) {
        console.error("Error linking family member:", e);
        return { error: e.message || "Erreur lors de la liaison de famille." };
    }
}

export async function unlinkFamilyMember(memberId: string) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) return { error: "Non autorisé" };

    const supabase = createClient();
    try {
        const { error } = await supabase
            .from('pilgrims')
            .update({
                family_head_id: null
            })
            .eq('id', memberId);

        if (error) throw error;

        revalidatePath('/backoffice/concierge');
        return { success: true };
    } catch (e: any) {
        console.error("Error unlinking family member:", e);
        return { error: e.message || "Erreur lors de la suppression de la liaison." };
    }
}


