import { z } from 'zod';

// Request DTOs
export const CreateSessionRequestSchema = z.object({
  guest_speaker: z.string().min(1, 'Guest speaker name is required'),
  guest_speaker_bio: z.string().min(1, 'Guest speaker bio is required'),
  audience_description: z.string().min(1, 'Audience description is required'),
});

export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>;

// Response DTOs
export const CreateSessionResponseSchema = z.object({
  session_id: z.string(),
  created_at: z.string(),
  status: z.string(),
});

export type CreateSessionResponse = z.infer<typeof CreateSessionResponseSchema>;

// Stream Event DTOs
export const StreamEventSchema = z.object({
  // Text chunk event
  mime_type: z.string().optional(),
  data: z.string().optional(),

  // Turn completion event
  turn_complete: z.boolean().optional(),
  interrupted: z.boolean().nullable().optional(),

  // Stream completion event
  complete: z.boolean().optional(),

  // Error event
  error: z.string().optional(),
  detail: z.string().optional(),
});

export type StreamEvent = z.infer<typeof StreamEventSchema>;

// Error response
export const ErrorResponseSchema = z.object({
  detail: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
