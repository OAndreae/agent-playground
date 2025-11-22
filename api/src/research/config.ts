/**
 * Configuration for the research module.
 */

/**
 * AI model configuration.
 */
export const AI_CONFIG = {
  /** The AI model to use for research. */
  model: 'gemini-3-pro-preview',
  /** Maximum number of searches to perform. */
  maxSearches: 10,
  /** Default audience when none is specified. */
  defaultAudience: 'General Audience',
} as const;
