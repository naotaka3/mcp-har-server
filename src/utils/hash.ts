import { createHash } from 'crypto';
import { HarEntry } from '../types/har.js';

/**
 * Generates a hash for a HAR entry based on its request and response properties
 * @param entry The HAR entry to hash
 * @returns A SHA-256 hash string
 */
export function generateEntryHash(entry: HarEntry): string {
  // Create a string combining key aspects of the entry
  const { request, response } = entry;
  const hashInput = `${request.method}|${request.url}|${response.status}`;

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
