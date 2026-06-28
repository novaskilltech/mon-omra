import { z } from 'zod';

/**
 * LOGISTICS - TYPES & CONTRACTS (LOT 2)
 * Phase: Ready for Build (DoR)
 */

// --- FLIGHTS ---

export const FlightSegmentSchema = z.object({
    id: z.string().uuid().optional(),
    flight_number: z.string().min(2),
    airline: z.string(),
    departure_airport: z.string().length(3), // IATA code
    arrival_airport: z.string().length(3),   // IATA code
    departure_time: z.string().datetime(),    // ISO UTC
    arrival_time: z.string().datetime(),      // ISO UTC
});

export const FlightSchema = z.object({
    id: z.string().uuid().optional(),
    agency_id: z.string().uuid().optional(),
    type: z.enum(['ALLER', 'RETOUR']),
    segments: z.array(FlightSegmentSchema).min(1),
});

// --- HOTELS ---

export const RoomConfigSchema = z.object({
    type: z.enum(['DOUBLE', 'TRIPLE', 'QUADRUPLE', 'SUITE']),
    quantity: z.number().int().positive(),
    price_per_night: z.number().optional(), // For internal accounting
});

export const HotelSchema = z.object({
    id: z.string().uuid().optional(),
    agency_id: z.string().uuid(),
    name: z.string().min(3),
    city: z.enum(['MAKKAH', 'MADINAH', 'JEDDAH']),
    stars: z.number().min(1).max(5),
    address: z.string().optional(),
    distance_from_haram: z.number().optional(), // In meters
    room_configs: z.array(RoomConfigSchema),
});

// --- GROUP LOGISTICS (Linkage) ---

export const GroupLogisticsSchema = z.object({
    group_id: z.string().uuid(),
    flight_departure_id: z.string().uuid().optional(),
    flight_return_id: z.string().uuid().optional(),
    hotel_stays: z.array(z.object({
        hotel_id: z.string().uuid(),
        check_in: z.string().datetime(),
        check_out: z.string().datetime(),
    })),
});

export const ActivitySchema = z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(3),
    time: z.string(), // "HH:mm"
    location: z.string().optional(),
    type: z.enum(['RITUEL', 'ZIYARAT', 'TRANSPORT', 'REPAS', 'REPOS']),
    description: z.string().optional(),
});

export const DailyProgramSchema = z.object({
    day_number: z.number().int().positive(),
    date: z.string(), // ISO Date
    activities: z.array(ActivitySchema),
});

export const RoomAssignmentSchema = z.object({
    id: z.string().uuid().optional(),
    hotel_stay_id: z.string().uuid(),
    room_number: z.string().optional(),
    room_index: z.number().int(),
    room_type: z.enum(['DOUBLE', 'TRIPLE', 'QUADRUPLE', 'SUITE']),
    pilgrim_id: z.string().uuid(),
});

export type Flight = z.infer<typeof FlightSchema>;
export type FlightSegment = z.infer<typeof FlightSegmentSchema>;
export type Hotel = z.infer<typeof HotelSchema>;
export type GroupLogistics = z.infer<typeof GroupLogisticsSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type DailyProgram = z.infer<typeof DailyProgramSchema>;
export type RoomAssignment = z.infer<typeof RoomAssignmentSchema>;
