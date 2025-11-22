import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

// Step 1: Research the guest speaker
const researchStep = createStep({
  id: 'research-guest',
  description: 'Research the podcast guest speaker using Google Search',
  inputSchema: z.object({
    guestSpeaker: z.string(),
    guestSpeakerBio: z.string(),
    audienceDescription: z.string(),
  }),
  outputSchema: z.object({
    researchData: z.string(),
    guestSpeaker: z.string(),
    audienceDescription: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { guestSpeaker, guestSpeakerBio, audienceDescription } = inputData;

    const researchAgent = mastra.getAgent('podcastResearcherAgent');

    const prompt = `Research this guest speaker for a podcast episode:

Guest Speaker: ${guestSpeaker}

${guestSpeakerBio ? `Bio: ${guestSpeakerBio}` : ''}

Gather comprehensive information including:
- Professional background and achievements
- Notable work and contributions
- Recent activities and projects
- Unique perspectives and expertise
- Interesting facts and stories

Use the Google Search tool to find credible sources. Make up to 10 searches.

Provide your findings in a structured format with clear facts and source URLs.`;

    const response = await researchAgent.generate(prompt);

    return {
      researchData: response.text,
      guestSpeaker,
      audienceDescription,
    };
  },
});

// Step 2: Write the podcast briefing
const writingStep = createStep({
  id: 'write-briefing',
  description: 'Transform research into a formatted podcast briefing',
  inputSchema: z.object({
    researchData: z.string(),
    guestSpeaker: z.string(),
    audienceDescription: z.string(),
  }),
  outputSchema: z.object({
    briefing: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const { researchData, guestSpeaker, audienceDescription } = inputData;

    const writerAgent = mastra.getAgent('podcastWriterAgent');

    const prompt = `Based on the following research about ${guestSpeaker}, create a comprehensive podcast briefing.

Research Data:
${researchData}

Target Audience: ${audienceDescription}

Generate a detailed briefing following the exact format specified in your instructions.

Tailor the questions to be relevant and interesting to: ${audienceDescription}

Ensure questions relate to the guest speaker's background and expertise, but do not directly reference the audience.`;

    const response = await writerAgent.generate(prompt);

    return {
      briefing: response.text,
    };
  },
});

// Create the workflow
export const podcastResearchWorkflow = createWorkflow({
  id: 'podcast-research-workflow',
  description: 'Research a podcast guest speaker and generate a comprehensive briefing',
  inputSchema: z.object({
    guestSpeaker: z.string().describe('Name of the podcast guest speaker'),
    guestSpeakerBio: z.string().describe('Brief bio or description of the guest speaker'),
    audienceDescription: z.string().describe('Description of the podcast audience'),
  }),
  outputSchema: z.object({
    briefing: z.string().describe('The completed podcast briefing in markdown format'),
  }),
})
  .then(researchStep)
  .then(writingStep)
  .commit();
