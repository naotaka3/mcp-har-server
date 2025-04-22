import { parseAndExtractDomains } from '../utils/har-parser.js';
import { z } from 'zod';

/**
 * Schema for domain list tool arguments
 */
export const domainListSchema = z.object({
  filePath: z.string().min(1).describe('Path to the HAR file to parse'),
});

/**
 * Type definition for domain list arguments
 */
export type DomainListArgs = z.infer<typeof domainListSchema>;

/**
 * Handles domain list requests and returns unique domains from HAR file
 * @param args Arguments for the domain list tool
 * @returns List of unique domains or error message
 */
export async function handleDomainList(args: DomainListArgs) {
  const { filePath } = args;

  try {
    const domainList = await parseAndExtractDomains(filePath);

    return {
      content: [{ type: 'text' as const, text: domainList }],
    };
  } catch (error) {
    let errorMessage = 'An error occurred while processing the HAR file';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      content: [{ type: 'text' as const, text: `Error: ${errorMessage}` }],
    };
  }
}
