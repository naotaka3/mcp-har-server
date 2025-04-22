import fs from 'fs/promises';
import path from 'path';
import { HarFile } from '../types/har.js';

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
