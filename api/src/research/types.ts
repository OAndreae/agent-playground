/**
 * Domain types for the research module.
 */

/**
 * Parameters required to research a guest speaker.
 */
export interface ResearchParams {
  /** The full name of the guest speaker. */
  name: string;
  /** A brief description of the guest speaker's background. Used to identify them. */
  description: string;
  /** The audience the guest speaker will be addressing. */
  targetAudience: string;
}