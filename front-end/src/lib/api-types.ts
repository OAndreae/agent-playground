import { z } from 'zod';

// Request DTOs
export const ResearchRequestSchema = z.object({
  guestSpeaker: z.string().min(1, 'Guest speaker name is required'),
  speakerDescription: z
    .string()
    .min(10, 'Speaker description must be at least 10 characters')
    .max(250, 'Speaker description must not exceed 250 characters'),
  audience: z.string().min(1, 'Audience description is required'),
  objectives: z.string().optional(),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

// Error response
export const ErrorResponseSchema = z.object({
  detail: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
