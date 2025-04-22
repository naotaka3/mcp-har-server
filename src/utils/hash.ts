import { createHash } from 'crypto';
import { HarEntry } from '../types/har.js';

/**
 * Generates a hash for a HAR entry based on its full content
 * @param entry The HAR entry to hash
 * @returns A SHA-256 hash string
 */
export function generateEntryHash(entry: HarEntry): string {
  // Create a more comprehensive string representation of the entry
  const { request, response } = entry;

  // Combine multiple aspects of the request and response
  const requestPart = `${request.method}|${request.url}|${JSON.stringify(request.headers)}`;
  const responsePart = `${response.status}|${response.statusText}|${JSON.stringify(response.headers)}`;

  // Include request post data if available
  const postDataPart = request.postData
    ? `|${request.postData.mimeType}|${request.postData.text}`
    : '';

  // Include response content if available
  const contentPart = response.content
    ? `|${response.content.mimeType}|${response.content.text || ''}`
    : '';

  // Combine all parts for a more unique hash
  const hashInput = `${requestPart}|${responsePart}${postDataPart}${contentPart}`;

  // Generate a SHA-256 hash
  const hash = createHash('sha256').update(hashInput).digest('hex');

  return hash;
}

/**
 * Shortens a hash to a specified length (default: 7 characters)
 * @param hash The full hash string
 * @param length The desired length of the shortened hash (default: 7)
 * @returns A shortened version of the hash
 */
export function shortenHash(hash: string, length: number = 7): string {
  return hash.substring(0, length);
}
