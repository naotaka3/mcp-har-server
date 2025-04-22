import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readHarFile } from './har-reader.js';
import fs from 'fs/promises';

// Mock fs module
vi.mock('fs/promises', async () => ({
  default: {
    readFile: vi.fn(),
  },
  readFile: vi.fn(),
}));

const mockHarData = {
  log: {
    entries: [
      {
        request: {
          method: 'GET',
          url: 'https://example.com/api?param=value',
          headers: [
            { name: 'Accept', value: 'application/json' },
            { name: 'User-Agent', value: 'Mozilla/5.0' },
          ],
        },
        response: {
          status: 200,
          statusText: 'OK',
          headers: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Cache-Control', value: 'no-cache' },
          ],
          content: {
            size: 38,
            mimeType: 'application/json',
            text: '{"message":"Hello, World!","status":"ok"}',
          },
        },
      },
    ],
  },
};

describe('HAR Reader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('readHarFile', () => {
    it('should read and parse a HAR file', async () => {
      // Mock the file read operation
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockHarData));

      const result = await readHarFile('/path/to/file.har');
      expect(result).toEqual(mockHarData);
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should throw an error for invalid HAR files', async () => {
      // Mock an invalid HAR file
      vi.mocked(fs.readFile).mockResolvedValue('{"invalid": "data"}');

      await expect(readHarFile('/path/to/file.har')).rejects.toThrow('Invalid HAR file format');
    });

    it('should handle file read errors', async () => {
      // Mock a file read error
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(readHarFile('/path/to/file.har')).rejects.toThrow(
        'Failed to read or parse HAR file: File not found'
      );
    });
  });
});
