import { parseAndFormatHar } from '../utils/har-parser.js';
import { z } from 'zod';

/**
 * Schema for HAR viewer tool arguments
 */
export const harViewerSchema = z.object({
  filePath: z.string().min(1),
  showQueryParams: z.boolean().default(false),
  filter: z
    .object({
      statusCode: z.number().optional(),
      method: z.string().optional(),
      urlPattern: z.string().optional(),
    })
    .optional(),
});

/**
 * Type definition for HAR viewer arguments
 */
export type HarViewerArgs = z.infer<typeof harViewerSchema>;

/**
 * Handles HAR viewer requests and returns formatted HAR data
 * @param args Arguments for the HAR viewer
 * @returns Formatted HAR data or error message
 */
export async function handleHarViewer(args: HarViewerArgs) {
  const { filePath, showQueryParams, filter } = args;

  try {
    const formattedHar = await parseAndFormatHar(filePath, {
      showQueryParams,
      filter,
    });

    return {
      content: [{ type: 'text' as const, text: formattedHar }],
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
