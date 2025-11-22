/**
 * Research module public API.
 * Provides functionality for researching guest speakers using AI.
 */

export type { ResearchParams } from './types.ts';
export type { ResearchRequest } from './schema.ts';

export type { ResearchService } from './service.ts';

export { createResearchHandler } from './handler.ts';

export { AI_CONFIG } from './config.ts';

import { createResearchService } from './service.ts';
import { createResearchHandler } from './index.ts';

const defaultService = createResearchService();
export const researchHandler = createResearchHandler(defaultService);
