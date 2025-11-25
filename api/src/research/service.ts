import { LanguageModel, streamText, Tool } from 'ai';
import { google } from '@ai-sdk/google';
import type { ResearchParams } from './types.ts';
import { buildResearchPrompt } from './prompts.ts';

/**
 * Creates a research service for gathering information about guest speakers.
 *
 * @param model - The language model to use for generating research content. Defaults to Google's Gemini 2.5 Flash model.
 * @param searchTool - The search tool to use for gathering information. Defaults to Google Search tool.
 * @returns A research service object with methods for researching guest speakers.
 *
 * @example
 * ```typescript
 * const researchService = createResearchService();
 * const results = researchService.researchGuest({ guestName: "John Doe" });
 * ```
 */
export const createResearchService = (
  model: LanguageModel = google('gemini-2.5-pro'),
  searchTool: Tool = google.tools.googleSearch({}),
) => {
  return {
    /**
     * Researches a guest speaker and generates a report.
     * @param params The research parameters.
     * @returns A stream text response containing the research results.
     */
    researchGuest: (params: ResearchParams) => {
      const prompt = buildResearchPrompt(params);

      return streamText({
        model,
        prompt,
        tools: {
          google_search: searchTool,
        },
      });
    },
  };
};

/**
 * Type representing a research service instance.
 */
export type ResearchService = ReturnType<typeof createResearchService>;
