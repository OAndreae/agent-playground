
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { podcastResearchWorkflow } from './workflows/podcast-research-workflow';
import { podcastResearcherAgent } from './agents/podcast-researcher-agent';
import { podcastWriterAgent } from './agents/podcast-writer-agent';

export const mastra = new Mastra({
  workflows: { podcastResearchWorkflow },
  agents: { podcastResearcherAgent, podcastWriterAgent },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false, 
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true }, 
  },
});
