import { createTool } from '@mastra/core/tools';
import { google } from 'googleapis';
import { z } from 'zod';

export const googleSearch = createTool({
  id: 'google-search',
  description: 'Searches Google for information about a topic. Returns search results with titles, links, and snippets.',
  inputSchema: z.object({
    query: z.string().describe('The search query to execute'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        link: z.string(),
        snippet: z.string(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const { query } = context;

    const apiKey = process.env.GOOGLE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;

    if (!apiKey || !cseId) {
      throw new Error('GOOGLE_API_KEY and GOOGLE_CSE_ID must be set in environment variables');
    }

    const customsearch = google.customsearch('v1');

    try {
      const response = await customsearch.cse.list({
        auth: apiKey,
        cx: cseId,
        q: query,
        num: 10, // Return up to 10 results per search
      });

      const results = (response.data.items || []).map((item) => ({
        title: item.title || '',
        link: item.link || '',
        snippet: item.snippet || '',
      }));

      return { results };
    } catch (error) {
      console.error('Google Search API error:', error);
      throw new Error(`Failed to search Google: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
