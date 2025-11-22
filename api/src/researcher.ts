import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

/**
 * @param name The ful name of the guest speaker.
 * @param description A brief description of the guest speaker's background. Used to identify them.
 * @param targetAudience The audience the guest speaker will be addressing.
 */
export const research_guest = (
  { name, description, targetAudience }: {
    name: string;
    description: string;
    targetAudience: string;
  },
) => {
  const prompt = buildPrompt({ name, description, targetAudience });

  return streamText({
    model: google('gemini-3-pro-preview'),
    prompt,
    tools: {
      google_search: google.tools.googleSearch({}),
    },
  });
};

const buildPrompt = ({ name, description, targetAudience }: {
  name: string;
  description: string;
  targetAudience: string;
}) => `
You are an expert podcast researcher. 

You are tasked with researching a guest speaker for a podcast episode and producing a script.

This episode's guest speaker is:
${name}
${description}

Use the Google Search tool to identify key sources of information about the guest speaker.
Make at most 10 searches.
Output a detailed report for the podcast host, including key talking points and suggested questions for the guest speaker.
Include citations for all information sources used.
Tailor your questions so that they will be relevant and interesting to the audience: ${targetAudience}. 
Ensure that they relate to the guest speaker's background and expertise. Do not directly reference the audience (${targetAudience}) in your questions.

Output format:
# <speaker name>

## Bio
<executive summary bio of the guest speaker, based on research. Two paragraphs.>

Key talking points you can weave into the interview:
- <talking point 1>
- <talking point 2>
- etc.

## Questions
- <question 1>
- <question 2>
- etc.

## Sources
- <source 1 name (description)>: <markdown link to source 1>
- <source 2 name (description)>: <markdown link to source 2>
- etc.
`;
