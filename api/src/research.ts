/**
 * Research module public API.
 * Provides functionality for researching guest speakers using AI.
 */

// Export types.
export type { ResearchParams, ResearchRequest } from './research/types.ts';

// Export service.
export { ResearchService } from './research/service.ts';

// Export handler factory.
export { createResearchHandler } from './research/handler.ts';

// Export configuration.
export { AI_CONFIG } from './research/config.ts';

// Create and export default handler instance.
import { ResearchService } from './research/service.ts';
import { createResearchHandler } from './research/handler.ts';

const defaultService = new ResearchService();
export const researchHandler = createResearchHandler(defaultService);
