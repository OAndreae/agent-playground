import { Hono } from 'hono';
import { z } from 'zod';
import { research_guest } from './researcher.ts';

const PORT = 8002;

const app = new Hono();

const researchRequestSchema = z.object({
  guestSpeaker: z.string().min(1, 'Guest speaker name is required.'),
  speakerDescription: z.string().min(10, 'Speaker description is required.')
    .max(250, 'Speaker description is too long.'),
  audience: z.string().optional(),
  objectives: z.string().optional(),
});

app.post('/research', async (c) => {
  try {
    const body = await c.req.json();
    const data = researchRequestSchema.parse(body);

    return research_guest({
      name: data.guestSpeaker,
      description: data.speakerDescription,
      targetAudience: data.audience || 'General Audience',
    }).toTextStreamResponse();

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: 'Validation failed.',
          issues: error.errors,
        },
        400,
      );
    }
    return c.json(
      {
        error: 'Internal server error.',
      },
      500,
    );
  }
});

app.notFound((c) => c.json({ message: 'Not Found' }, 404));

Deno.serve({ port: PORT }, app.fetch);
