import { expect } from '@std/expect';
import { Hono } from 'hono';
import { createResearchHandler } from './handler.ts';
import type { ResearchService } from './service.ts';

const createMockService = (): ResearchService => {
  return {
    researchGuest: () => ({
      toTextStreamResponse: () => new Response('Mock research results', {
        headers: { 'Content-Type': 'text/plain' },
      }),
    } as ReturnType<ResearchService['researchGuest']>),
  };
};

const createTestApp = (service: ResearchService) => {
  const app = new Hono();
  app.post('/research', createResearchHandler(service));
  return app;
};

Deno.test('handler processes valid request successfully', async () => {
  const mockService = createMockService();
  const app = createTestApp(mockService);

  const req = new Request('http://localhost/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guestSpeaker: 'Jane Doe',
      speakerDescription: 'A software engineer with 10 years of experience.',
      audience: 'Software developers',
    }),
  });

  const res = await app.fetch(req);

  expect(res.status).toBe(200);
  expect(res.headers.get('Content-Type')).toBe('text/plain');
});

Deno.test('handler returns 400 for missing required fields', async () => {
  const mockService = createMockService();
  const app = createTestApp(mockService);

  const req = new Request('http://localhost/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guestSpeaker: 'Jane Doe',
    }),
  });

  const res = await app.fetch(req);
  const body = await res.json();

  expect(res.status).toBe(400);
  expect(body.error).toBe('Validation failed.');
  expect(body.issues).toBeDefined();
});

Deno.test('handler returns 400 for invalid field values', async () => {
  const mockService = createMockService();
  const app = createTestApp(mockService);

  const req = new Request('http://localhost/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guestSpeaker: '',
      speakerDescription: 'Short',
      audience: 'Developers',
    }),
  });

  const res = await app.fetch(req);
  const body = await res.json();

  expect(res.status).toBe(400);
  expect(body.error).toBe('Validation failed.');
});

Deno.test('handler returns 500 for service errors', async () => {
  const errorService: ResearchService = {
    researchGuest: (() => {
      throw new Error('Service error');
    }) as ResearchService['researchGuest'],
  };
  const app = createTestApp(errorService);

  const req = new Request('http://localhost/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guestSpeaker: 'Jane Doe',
      speakerDescription: 'A software engineer with experience.',
      audience: 'Developers',
    }),
  });

  const res = await app.fetch(req);
  const body = await res.json();

  expect(res.status).toBe(500);
  expect(body.error).toBe('Internal server error.');
});

Deno.test('handler accepts optional objectives field', async () => {
  const mockService = createMockService();
  const app = createTestApp(mockService);

  const req = new Request('http://localhost/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guestSpeaker: 'John Smith',
      speakerDescription: 'A data scientist and AI researcher.',
      audience: 'Data scientists',
      objectives: 'Focus on AI ethics.',
    }),
  });

  const res = await app.fetch(req);

  expect(res.status).toBe(200);
});
