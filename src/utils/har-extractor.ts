import { URL } from 'url';
import { HarEntry, HarFile } from '../types/har.js';

/**
 * Gets a specific HAR entry by index
 * @param harData Parsed HAR file data
 * @param index The index of the entry to retrieve (1-based indexing to match display format)
 * @returns The specified HAR entry or undefined if index is out of bounds
 */
export function getHarEntryByIndex(harData: HarFile, index: number): HarEntry | undefined {
  // Convert 1-based index (displayed to user) to 0-based (used in array)
  const arrayIndex = index - 1;
  if (arrayIndex < 0 || arrayIndex >= harData.log.entries.length) {
    return undefined;
  }
  return harData.log.entries[arrayIndex];
}

/**
 * Extracts unique domains from a HAR file
 * @param harData Parsed HAR file data
 * @returns Array of unique domains
 */
export function extractDomains(harData: HarFile): string[] {
  const domains = new Set<string>();

  harData.log.entries.forEach((entry) => {
    try {
      const url = new URL(entry.request.url);
      domains.add(url.hostname);
    } catch {
      // Skip if URL parsing fails
    }
  });

  return Array.from(domains).sort();
}
