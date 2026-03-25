import { z } from 'zod';

export const PricingModeSchema = z.enum(['PER_PERSON', 'PER_ROOM']);

export const AgencySettingsSchema = z.object({
    agency_id: z.string().uuid(),
    pricing_mode: PricingModeSchema.default('PER_PERSON'),
    currency: z.string().length(3).default('EUR'),
});

export type PricingMode = z.infer<typeof PricingModeSchema>;
export type AgencySettings = z.infer<typeof AgencySettingsSchema>;
