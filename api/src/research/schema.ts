import z from 'zod';

/**
 * Validation schema for research requests.
 */
export const researchRequestSchema = z.object({
  guestSpeaker: z.string().min(1, 'Guest speaker name is required.'),
  speakerDescription: z.string()
    .min(10, 'Speaker description is required.')
    .max(250, 'Speaker description is too long.'),
  audience: z.string().optional(),
  objectives: z.string().optional(),
});
