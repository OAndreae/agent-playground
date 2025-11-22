import type { Context } from 'hono';
import z from 'zod';

/**
 * Handles errors in the research endpoint.
 * @param c The Hono context.
 * @param error The error that occurred.
 * @returns An appropriate HTTP response.
 */
export const handleResearchError = (c: Context, error: unknown) => {
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
