import { expect } from '@std/expect';
import { researchRequestSchema } from './schema.ts';

Deno.test('researchRequestSchema validates valid requests', () => {
  const validRequest = {
    guestSpeaker: 'Jane Doe',
    speakerDescription: 'A software engineer with 10 years of experience.',
    audience: 'Software developers',
  };

  const result = researchRequestSchema.parse(validRequest);

  expect(result).toEqual(validRequest);
});

Deno.test('researchRequestSchema accepts optional objectives', () => {
  const requestWithObjectives = {
    guestSpeaker: 'John Smith',
    speakerDescription: 'A renowned data scientist and AI researcher.',
    audience: 'Data scientists',
    objectives: 'Focus on recent AI breakthroughs.',
  };

  const result = researchRequestSchema.parse(requestWithObjectives);

  expect(result).toEqual(requestWithObjectives);
});

Deno.test('researchRequestSchema rejects empty guest speaker', () => {
  const invalidRequest = {
    guestSpeaker: '',
    speakerDescription: 'A software engineer.',
    audience: 'Developers',
  };

  expect(() => researchRequestSchema.parse(invalidRequest)).toThrow();
});

Deno.test('researchRequestSchema rejects short speaker description', () => {
  const invalidRequest = {
    guestSpeaker: 'Jane Doe',
    speakerDescription: 'Too short',
    audience: 'Developers',
  };

  expect(() => researchRequestSchema.parse(invalidRequest)).toThrow();
});

Deno.test('researchRequestSchema rejects long speaker description', () => {
  const invalidRequest = {
    guestSpeaker: 'Jane Doe',
    speakerDescription: 'a'.repeat(251),
    audience: 'Developers',
  };

  expect(() => researchRequestSchema.parse(invalidRequest)).toThrow();
});

Deno.test('researchRequestSchema requires audience', () => {
  const invalidRequest = {
    guestSpeaker: 'Jane Doe',
    speakerDescription: 'A software engineer with experience.',
  };

  expect(() => researchRequestSchema.parse(invalidRequest)).toThrow();
});
