import { parseAndFormatHar } from '../utils/har-parser.js';
import { z } from 'zod';

/**
 * Schema for HAR viewer tool arguments
 */
export const harViewerSchema = z.object({
  filePath: z.string().min(1).describe('Path to the HAR file to parse'),
  showQueryParams: z
    .boolean()
    .default(false)
    .describe('Whether to include query parameters in the URL output'),
  filter: z
    .object({
      statusCode: z.number().optional().describe('Filter requests by HTTP status code'),
      method: z.string().optional().describe('Filter requests by HTTP method (GET, POST, etc.)'),
      urlPattern: z
        .string()
        .optional()
        .describe('Filter requests by URL pattern (substring match)'),
    })
    .optional()
    .describe('Optional filters to narrow down the displayed requests'),
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
