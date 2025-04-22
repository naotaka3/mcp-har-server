import { HarEntry, EntryDetailOptions } from '../types/har.js';
import { readHarFile } from './har-reader.js';
import { formatHeaders, formatBody } from './har-formatter.js';
import { getHarEntryByIndex } from './har-extractor.js';

/**
 * Format details of a specific HAR entry
 * @param entry HAR entry to format
 * @param options Options for detail display
 * @returns Formatted string with entry details
 */
export function formatEntryDetails(entry: HarEntry, options: EntryDetailOptions): string {
  const { request, response } = entry;
  const { showBody } = options;

  let result = '';

  // Request section
  result += '=== REQUEST ===\n';
  result += `${request.method} ${request.url}\n\n`;
  result += '--- Headers ---\n';
  result += `${formatHeaders(request.headers)}\n\n`;

  if (showBody && request.postData) {
    result += '--- Body ---\n';
    result += `${formatBody(request.postData)}\n\n`;
  }

  // Response section
  result += '=== RESPONSE ===\n';
  result += `${response.status} ${response.statusText}\n\n`;
  result += '--- Headers ---\n';
  result += `${formatHeaders(response.headers)}\n\n`;

  if (showBody && response.content) {
    result += '--- Body ---\n';
    result += `${formatBody(response.content)}\n`;
  }

  return result;
}

/**
 * Gets and formats details for HAR entries by their indices
 * @param filePath Path to the HAR file
 * @param indices Array of 1-based indices of entries to retrieve
 * @param options Options for detail display
 * @returns Object with formatted details or error message
 */
export async function getHarEntryDetails(
  filePath: string,
  indices: number[],
  options: EntryDetailOptions
): Promise<{ success: boolean; content: string }> {
  try {
    const harData = await readHarFile(filePath);

    // If no entries found
    if (harData.log.entries.length === 0) {
      return {
        success: false,
        content: 'No entries found in HAR file.',
      };
    }

    const results: string[] = [];

    for (const index of indices) {
      const entry = getHarEntryByIndex(harData, index);

      if (!entry) {
        results.push(
          `Entry [${index}] does not exist. Valid range: 1-${harData.log.entries.length}.`
        );
      } else {
        results.push(`ENTRY [${index}]\n${formatEntryDetails(entry, options)}`);
      }
    }

    return {
      success: true,
      content: results.join('\n\n'),
    };
  } catch (error: unknown) {
    let errorMessage = 'Failed to get HAR entry details';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    return {
      success: false,
      content: errorMessage,
    };
  }
}
