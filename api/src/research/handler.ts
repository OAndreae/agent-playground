import type { Context } from 'hono';
import type { ResearchService } from './service.ts';
import { researchRequestSchema } from './schema.ts';
import z from 'zod';

/**
 * Creates a research handler with the provided service.
 * This factory pattern enables dependency injection for better testability.
 * @param service The research service to use.
 * @returns A Hono handler function.
 */
export const createResearchHandler = (service: ResearchService) => {
  return async (c: Context) => {
    try {
      const body = await c.req.json();
      const data = researchRequestSchema.parse(body);

      return service
        .researchGuest({
          name: data.guestSpeaker,
          description: data.speakerDescription,
          targetAudience: data.audience,
        })
        .toTextStreamResponse();
    } catch (error) {
      return handleResearchError(c, error);
    }
  };
};

const handleResearchError = (c: Context, error: unknown) => {
  if (error instanceof z.ZodError) {
    return c.json(
      {
        error: 'Validation failed.',
        issues: error.errors,
      },
      400,
    );
  }

  console.error('Research handler error:', error);
  return c.json(
    {
      error: 'Internal server error.',
    },
    500,
  );
};
