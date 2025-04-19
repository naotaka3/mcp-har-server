import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';

/**
 * HAR file entry interface defining the structure of a request in a HAR file
 */
interface HarEntry {
  request: {
    method: string;
    url: string;
    // Additional fields available but not used in this implementation
  };
  response: {
    status: number;
    statusText: string;
    // Additional fields available but not used in this implementation
  };
  // Other available fields not used in this implementation
}

/**
 * HAR file structure interface
 */
interface HarFile {
  log: {
    entries: HarEntry[];
    // Additional fields available but not used in this implementation
  };
}

/**
 * Filter options for HAR entries
 */
export interface HarFilter {
  statusCode?: number;
  method?: string;
  urlPattern?: string;
}

/**
 * Options for formatting HAR entries
 */
export interface FormatOptions {
  showQueryParams: boolean;
  filter?: HarFilter;
}

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
