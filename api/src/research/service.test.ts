import { expect } from '@std/expect';
import { createResearchService } from './service.ts';
import type { LanguageModel, Tool } from 'ai';

Deno.test('createResearchService returns service with researchGuest method', () => {
  const mockModel = {} as unknown as LanguageModel;
  const mockTool = {} as unknown as Tool;

  const service = createResearchService(mockModel, mockTool);

  expect(service).toBeDefined();
  expect(typeof service.researchGuest).toBe('function');
});

Deno.test('createResearchService can be called with custom model and tool', () => {
  const customModel = {} as unknown as LanguageModel;
  const customTool = {} as unknown as Tool;

  const service = createResearchService(customModel, customTool);

  expect(service).toBeDefined();
  expect(typeof service.researchGuest).toBe('function');
});

Deno.test('createResearchService can be called with defaults', () => {
  // This will use the default Google model and search tool
  const service = createResearchService();

  expect(service).toBeDefined();
  expect(typeof service.researchGuest).toBe('function');
});
