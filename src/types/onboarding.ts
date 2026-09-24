import { z } from 'zod';

export const VerifyPasscodeSchema = z.object({
    passcode: z.string().trim().min(1, "Le mot de passe d'accès est requis.")
});

export const PilgrimSelfOnboardingSchema = z.object({
    passcode: z.string().trim().min(1, "Le mot de passe d'accès est requis."),
    gender: z.enum(['M', 'F']),
    familyName: z.string().trim().min(2, "Le nom de famille doit contenir au moins 2 caractères.").max(100),
    firstName: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères.").max(100),
    invoiceNumber: z.string().trim().min(2, "Le numéro de facture est obligatoire.").max(50),
    email: z.string().trim().email("Format d'adresse e-mail invalide.").toLowerCase(),
    phone: z.string().trim().min(6, "Le numéro de téléphone est invalide.").max(30),
    address: z.string().trim().min(3, "L'adresse postale est obligatoire.").max(255),
    postalCode: z.string().trim().min(2, "Le code postal est obligatoire.").max(20),
    city: z.string().trim().min(2, "La ville est obligatoire.").max(100),
    departureAirport: z.string().trim().min(2, "Veuillez sélectionner un aéroport de départ."),
    travelDates: z.string().trim().min(3, "Veuillez indiquer les dates de votre séjour.").max(100),
    groupId: z.string().uuid().optional().nullable(),
    requestedRoomType: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'QUADRUPLE', 'QUINTUPLE']).optional()
});

export type VerifyPasscodeInput = z.infer<typeof VerifyPasscodeSchema>;
export type PilgrimSelfOnboardingInput = z.infer<typeof PilgrimSelfOnboardingSchema>;
