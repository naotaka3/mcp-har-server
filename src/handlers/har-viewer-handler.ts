import { parseAndFormatHar } from '../utils/har-parser.js';
import { z } from 'zod';

/**
 * Schema for HAR viewer tool arguments
 * Displays HAR file requests in a simplified format with hash identifiers
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
      excludeDomains: z
        .array(z.string())
        .optional()
        .describe('Domains to exclude from the output (multiple domains can be specified)'),
    })
    .describe('Required filters to narrow down the displayed requests'),
});

/**
 * Type definition for HAR viewer arguments
 */
export type HarViewerArgs = z.infer<typeof harViewerSchema>;

/**
 * Handles HAR viewer requests and returns formatted HAR data
 * @param args Arguments for the HAR viewer
 * @param validateFilters Whether to validate filter requirements (default: true)
 * @returns Formatted HAR data or error message
 */
export async function handleHarViewer(args: HarViewerArgs, validateFilters: boolean = true) {
  const { filePath, showQueryParams, filter } = args;

  // Validate the filter requirement if enabled
  if (
    validateFilters &&
    !filter.urlPattern &&
    (!filter.excludeDomains || filter.excludeDomains.length === 0)
  ) {
    return {
      content: [
        {
          type: 'text' as const,
          text: 'Error: Either urlPattern or excludeDomains must be provided to filter the output. Use the domain_list tool first to see available domains.',
        },
      ],
    };
  }

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
