import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import type { ResearchParams } from './types.ts';
import { buildResearchPrompt } from './prompts.ts';
import { AI_CONFIG } from './config.ts';

/**
 * Service for researching guest speakers.
 * Encapsulates the business logic for AI-powered research.
 */
export class ResearchService {
  /**
   * Creates a new ResearchService instance.
   * @param modelProvider The AI model provider (defaults to Google).
   * @param modelName The model name to use (defaults to configured model).
   */
  constructor(
    private modelProvider: typeof google = google,
    private modelName: string = AI_CONFIG.model,
  ) {}

  /**
   * Researches a guest speaker and generates a report.
   * @param params The research parameters.
   * @returns A stream text response containing the research results.
   */
  researchGuest(params: ResearchParams) {
    const prompt = buildResearchPrompt(params);

    return streamText({
      model: this.modelProvider(this.modelName),
      prompt,
      tools: {
        google_search: this.modelProvider.tools.googleSearch({}),
      },
    });
  }
}
