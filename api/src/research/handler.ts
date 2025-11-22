import type { Context } from 'hono';
import type { ResearchService } from './service.ts';
import { researchRequestSchema } from './schema.ts';
import { handleResearchError } from './errors.ts';
import { AI_CONFIG } from './config.ts';

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
          targetAudience: data.audience || AI_CONFIG.defaultAudience,
        })
        .toTextStreamResponse();
    } catch (error) {
      return handleResearchError(c, error);
    }
  };
};
