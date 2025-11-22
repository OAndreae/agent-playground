import { expect } from '@std/expect';
import { buildResearchPrompt } from './prompts.ts';

Deno.test('buildResearchPrompt includes all required parameters', () => {
  const params = {
    name: 'Jane Doe',
    description: 'A renowned software engineer',
    targetAudience: 'Software developers',
  };

  const prompt = buildResearchPrompt(params);

  expect(prompt).toContain('Jane Doe');
  expect(prompt).toContain('A renowned software engineer');
  expect(prompt).toContain('Software developers');
});

Deno.test('buildResearchPrompt uses default maxSearches of 10', () => {
  const params = {
    name: 'John Smith',
    description: 'A data scientist',
    targetAudience: 'Researchers',
  };

  const prompt = buildResearchPrompt(params);

  expect(prompt).toContain('Make at most 10 searches');
});

Deno.test('buildResearchPrompt accepts custom maxSearches', () => {
  const params = {
    name: 'John Smith',
    description: 'A data scientist',
    targetAudience: 'Researchers',
    maxSearches: 5,
  };

  const prompt = buildResearchPrompt(params);

  expect(prompt).toContain('Make at most 5 searches');
});

Deno.test('buildResearchPrompt includes output format instructions', () => {
  const params = {
    name: 'Test Speaker',
    description: 'Test description',
    targetAudience: 'Test audience',
  };

  const prompt = buildResearchPrompt(params);

  expect(prompt).toContain('## Bio');
  expect(prompt).toContain('## Questions');
  expect(prompt).toContain('## Sources');
});
