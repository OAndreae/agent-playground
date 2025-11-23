import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { researchHandler } from './research/index.ts';

const PORT = 8002;

const app = new Hono();

// Enable CORS for front-end integration
app.use(
  '*',
  cors({
    origin: 'http://localhost:3000',
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true,
  }),
);

app.post('/research', researchHandler);
app.notFound((c) => c.json({ message: 'Not Found' }, 404));

Deno.serve({ port: PORT }, app.fetch);
