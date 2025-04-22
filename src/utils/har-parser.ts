import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';
import { HarEntry, HarFile, HarHeader, FormatOptions, EntryDetailOptions } from '../types/har.js';

/**
 * Reads and parses a HAR file from the given path
 * @param filePath Path to the HAR file
 * @returns Parsed HAR data
 */
export async function readHarFile(filePath: string): Promise<HarFile> {
  try {
    const resolvedPath = path.resolve(filePath);
    const fileContent = await fs.readFile(resolvedPath, 'utf8');
    const harData: HarFile = JSON.parse(fileContent);

    // Validate that the file is a HAR file with the expected structure
    if (!harData.log || !Array.isArray(harData.log.entries)) {
      throw new Error('Invalid HAR file format');
    }

    return harData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Failed to read or parse HAR file: ${error.message}`);
    }
    throw new Error('Failed to read or parse HAR file');
  }
}

/**
 * Removes query parameters from a URL
 * @param urlString URL string
 * @returns URL without query parameters
 */
export function removeQueryParams(urlString: string): string {
  try {
    const url = new URL(urlString);
    return `${url.origin}${url.pathname}`;
  } catch {
    // If URL parsing fails, return the original string
    return urlString;
  }
}

/**
 * Formats HAR entries as a numbered list of requests
 * @param harData Parsed HAR file data
 * @param options Formatting options
 * @returns Formatted string with numbered requests
 */
export function formatHarEntries(harData: HarFile, options: FormatOptions): string {
  const { showQueryParams, filter } = options;

  // Filter entries based on provided criteria
  let filteredEntries = harData.log.entries;

  if (filter) {
    if (filter.statusCode !== undefined) {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.response.status === filter.statusCode
      );
    }

    if (filter.method !== undefined) {
      filteredEntries = filteredEntries.filter(
        (entry) =>
          filter.method !== undefined &&
          entry.request.method.toUpperCase() === filter.method.toUpperCase()
      );
    }

    if (filter.urlPattern !== undefined) {
      filteredEntries = filteredEntries.filter(
        (entry) => filter.urlPattern !== undefined && entry.request.url.includes(filter.urlPattern)
      );
    }
  }

  // Format each entry
  const formattedEntries = filteredEntries.map((entry, index) => {
    const { method } = entry.request;
    const { status } = entry.response;
    let url = entry.request.url;

    if (!showQueryParams) {
      url = removeQueryParams(url);
    }

    return `[${index + 1}] ${status} ${method} ${url}`;
  });

  return formattedEntries.join('\n');
}

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
 * Format headers from a HAR entry into a readable string
 * @param headers Array of headers from HAR entry
 * @returns Formatted string of headers
 */
export function formatHeaders(headers: HarHeader[]): string {
  return headers.map((header) => `${header.name}: ${header.value}`).join('\n');
}

/**
 * Format request or response body content
 * @param content Body content data
 * @returns Formatted string of body content
 */
export function formatBody(content: { mimeType: string; text?: string }): string {
  if (!content.text) return '[No Body Content]';

  // For JSON content, try to prettify it
  if (content.mimeType.includes('application/json')) {
    try {
      const jsonObj = JSON.parse(content.text);
      return JSON.stringify(jsonObj, null, 2);
    } catch {
      // If parsing fails, return the original text
      return content.text;
    }
  }

  return content.text;
}

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

/**
 * Parses HAR file and extracts unique domains
 * @param filePath Path to the HAR file
 * @returns Formatted string of unique domains
 */
export async function parseAndExtractDomains(filePath: string): Promise<string> {
  const harData = await readHarFile(filePath);
  const domains = extractDomains(harData);

  if (domains.length === 0) {
    return 'No domains found in HAR file.';
  }

  return domains.map((domain, index) => `[${index + 1}] ${domain}`).join('\n');
}
