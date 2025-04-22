import { URL } from 'url';
import { HarFile, HarHeader, FormatOptions } from '../types/har.js';

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
