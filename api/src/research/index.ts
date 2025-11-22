/**
 * Research module public API.
 * Provides functionality for researching guest speakers using AI.
 */

// Export types.
export type { ResearchParams, ResearchRequest } from './types.ts';

// Export service.
export { ResearchService } from './service.ts';

// Export handler factory.
export { createResearchHandler } from './handler.ts';

// Export configuration.
export { AI_CONFIG } from './config.ts';

// Create and export default handler instance.
import { ResearchService } from './service.ts';
import { createResearchHandler } from './index.ts';

const defaultService = new ResearchService();
export const researchHandler = createResearchHandler(defaultService);
