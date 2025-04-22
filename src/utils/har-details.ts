import { HarEntry, EntryDetailOptions } from '../types/har.js';
import { readHarFile } from './har-reader.js';
import { formatHeaders, formatBody } from './har-formatter.js';
import { generateEntryHash, shortenHash } from './hash.js';

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
 * Gets and formats details for HAR entries by their hash identifiers
 * @param filePath Path to the HAR file
 * @param hashes Array of hash identifiers of entries to retrieve
 * @param options Options for detail display
 * @returns Object with formatted details or error message
 */
export async function getHarEntryDetails(
  filePath: string,
  hashes: string[],
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
    // Build a map of shortened hashes to entries
    const entryMap = new Map<string, HarEntry>();

    // Generate hashes for all entries
    harData.log.entries.forEach((entry) => {
      const hash = generateEntryHash(entry);
      const shortHash = shortenHash(hash);
      entryMap.set(shortHash, entry);
    });

    // Process each requested hash
    for (const hash of hashes) {
      const entry = entryMap.get(hash);

      if (!entry) {
        results.push(`Entry with hash [${hash}] does not exist.`);
      } else {
        results.push(`ENTRY [${hash}]\n${formatEntryDetails(entry, options)}`);
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
