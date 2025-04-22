import { getHarEntryDetails } from '../utils/har-parser.js';
import { z } from 'zod';

/**
 * Schema for HAR detail tool arguments
 */
export const harDetailSchema = z.object({
  filePath: z.string().min(1),
  indices: z.union([
    z.number().int().positive(),
    z.string().refine(
      (val) => {
        // Accept comma-separated list of integers
        return /^\d+(,\d+)*$/.test(val);
      },
      {
        message: 'Indices must be comma-separated positive integers',
      }
    ),
  ]),
  showBody: z.boolean().default(false),
});

/**
 * Type definition for HAR detail arguments
 */
export type HarDetailArgs = z.infer<typeof harDetailSchema>;

/**
 * Parses the indices input to an array of numbers
 * @param indices Input from user, either a number or comma-separated string of numbers
 * @returns Array of parsed indices
 */
function parseIndices(indices: number | string): number[] {
  if (typeof indices === 'number') {
    return [indices];
  }

  return indices.split(',').map((idx) => parseInt(idx.trim(), 10));
}

/**
 * Handles HAR detail requests and returns entry details
 * @param args Arguments for the HAR detail tool
 * @returns Detailed information about the specified HAR entries
 */
export async function handleHarDetail(args: HarDetailArgs) {
  const { filePath, indices, showBody } = args;
  const parsedIndices = parseIndices(indices);

  try {
    const result = await getHarEntryDetails(filePath, parsedIndices, { showBody });

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
