import { URL } from 'url';
import { HarFile, HarHeader, FormatOptions } from '../types/har.js';
import { generateEntryHash, shortenHash } from './hash.js';

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
 * Formats HAR entries as a list of requests with hash identifiers
 * @param harData Parsed HAR file data
 * @param options Formatting options
 * @returns Formatted string with hash-identified requests
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

    if (filter.excludeDomains !== undefined && filter.excludeDomains.length > 0) {
      filteredEntries = filteredEntries.filter((entry) => {
        try {
          const url = new URL(entry.request.url);
          const hostname = url.hostname;
          return !filter.excludeDomains?.some(
            (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
          );
        } catch {
          // If URL parsing fails, keep the entry
          return true;
        }
      });
    }
  }

  // Process each entry

  // Format each entry
  const formattedEntries = filteredEntries.map((entry) => {
    const { method } = entry.request;
    const { status } = entry.response;
    let url = entry.request.url;

    const hash = generateEntryHash(entry);
    const shortHash = shortenHash(hash);

    if (!showQueryParams) {
      url = removeQueryParams(url);
    }

    return `[${shortHash}] ${status} ${method} ${url}`;
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
