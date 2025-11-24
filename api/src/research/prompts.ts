/**
 * Builds the research prompt for the AI model.
 * @param params The research parameters.
 * @returns The formatted prompt string.
 */
export const buildResearchPrompt = ({
  name,
  description,
  targetAudience,
  maxSearches = 10,
}: {
  name: string;
  description: string;
  targetAudience: string;
  maxSearches?: number;
}): string => `
You are an expert podcast researcher.

You are tasked with researching a guest speaker for a podcast episode and producing a script.

This episode's guest speaker is:
${name}
${description}

Use the Google Search tool to identify key sources of information about the guest speaker.
Make at most ${maxSearches} searches.
Output a detailed report for the podcast host, including suggested questions for the guest speaker.
Refer to the guest speaker by their first name.
Include citations for all information sources used.
Tailor your questions so that they will be relevant and interesting to the audience: ${targetAudience}.
Ensure that they relate to the guest speaker's background and expertise. Do not directly reference the audience (${targetAudience}) in your questions.
Order the questions to follow a logical flow, starting with introductory questions and progressing to more in-depth topics. There should be a narrative.
Include segues between questions to help the host transition smoothly.
Use markdown links for all sources. Don't display raw URLs.

Output format:
# <speaker name>

## Bio
<executive summary bio of the guest speaker, based on research. One paragraph. Punchy. Suitable as an introduction to the guest. Tailored to the audience.>

## Questions
- ***[question topic]*** <question 1>

  *<segue to next question>*

- ***[question topic]*** <question 2>

  *<segue to next question>*

- etc.

## Sources
- [<source 1 name>](<link to source 1>)
- [<source 2 name>](<link to source 2>)
- etc.
`;
