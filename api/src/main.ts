import { Hono } from 'hono';
import { researchHandler } from './research/index.ts';

const PORT = 8002;

const app = new Hono();

app.post('/research', researchHandler);
app.notFound((c) => c.json({ message: 'Not Found' }, 404));

Deno.serve({ port: PORT }, app.fetch);
