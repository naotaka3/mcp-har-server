import { getHarEntryDetails } from '../utils/har-parser.js';
import { z } from 'zod';

/**
 * Schema for HAR detail tool arguments
 */
export const harDetailSchema = z.object({
  filePath: z.string().min(1).describe('Path to the HAR file to examine'),
  hashes: z.string().describe('Request hashes to view (single hash or comma-separated list)'),
  showBody: z
    .boolean()
    .default(false)
    .describe('Whether to include request and response bodies in the output'),
});

/**
 * Type definition for HAR detail arguments
 */
export type HarDetailArgs = z.infer<typeof harDetailSchema>;

/**
 * Parses the hashes input to an array of hash strings
 * @param hashes Input from user, either a single hash string or comma-separated hash values
 * @returns Array of parsed hash strings
 */
function parseHashes(hashes: string): string[] {
  // Split by comma for multiple values
  const parts = hashes.split(',').map((part) => part.trim());

  // Return array of trimmed hash strings
  return parts.filter((part) => part.length > 0);
}

/**
 * Handles HAR detail requests and returns entry details
 * @param args Arguments for the HAR detail tool
 * @returns Detailed information about the specified HAR entries
 */
export async function handleHarDetail(args: HarDetailArgs) {
  const { filePath, hashes, showBody } = args;
  const parsedHashes = parseHashes(hashes);

  try {
    const result = await getHarEntryDetails(filePath, parsedHashes, { showBody });

    return {
      content: [{ type: 'text' as const, text: result.content }],
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
