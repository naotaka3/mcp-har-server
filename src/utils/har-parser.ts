import { FormatOptions } from '../types/har.js';
import { readHarFile } from './har-reader.js';
import { formatHarEntries, removeQueryParams, formatHeaders, formatBody } from './har-formatter.js';
import { getHarEntryByIndex, extractDomains } from './har-extractor.js';
import { formatEntryDetails, getHarEntryDetails } from './har-details.js';

/**
 * Main function to parse and format a HAR file
 * @param filePath Path to the HAR file
 * @param options Formatting options
 * @returns Formatted string with numbered requests
 */
export async function parseAndFormatHar(filePath: string, options: FormatOptions): Promise<string> {
  const harData = await readHarFile(filePath);
  return formatHarEntries(harData, options);
}

/**
 * Parses HAR file and extracts unique domains
 * @param filePath Path to the HAR file
 * @returns Formatted string of unique domains
 */
export async function parseAndExtractDomains(filePath: string): Promise<string> {
  try {
    const harData = await readHarFile(filePath);
    const domains = extractDomains(harData);

    if (domains.length === 0) {
      return 'No domains found in HAR file.';
    }

    return domains.join('\n');
  } catch (error: unknown) {
    // Re-throw the error with the same message format as readHarFile
    if (error instanceof Error) {
      throw new Error(`Failed to read or parse HAR file: ${error.message}`);
    }
    throw new Error('Failed to read or parse HAR file');
  }
}

// Re-export all functions to maintain backward compatibility
export {
  readHarFile,
  removeQueryParams,
  formatHarEntries,
  getHarEntryByIndex,
  formatHeaders,
  formatBody,
  formatEntryDetails,
  getHarEntryDetails,
  extractDomains,
};
