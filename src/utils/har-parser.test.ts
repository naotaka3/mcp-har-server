import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  readHarFile,
  removeQueryParams,
  formatHarEntries,
  parseAndFormatHar,
} from './har-parser.js';
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
        },
        response: {
          status: 200,
          statusText: 'OK',
        },
      },
      {
        request: {
          method: 'POST',
          url: 'https://api.example.com/data?token=abc123',
        },
        response: {
          status: 404,
          statusText: 'Not Found',
        },
      },
      {
        request: {
          method: 'PUT',
          url: 'https://api.example.com/update',
        },
        response: {
          status: 201,
          statusText: 'Created',
        },
      },
    ],
  },
};

describe('HAR Parser', () => {
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

  describe('removeQueryParams', () => {
    it('should remove query parameters from a URL', () => {
      const url = 'https://example.com/api?param=value&another=123';
      const result = removeQueryParams(url);
      expect(result).toBe('https://example.com/api');
    });

    it('should handle URLs without query parameters', () => {
      const url = 'https://example.com/api';
      const result = removeQueryParams(url);
      expect(result).toBe('https://example.com/api');
    });

    it('should handle invalid URLs gracefully', () => {
      const url = 'invalid-url';
      const result = removeQueryParams(url);
      expect(result).toBe('invalid-url');
    });
  });

  describe('formatHarEntries', () => {
    it('should format entries with query parameters', () => {
      const result = formatHarEntries(mockHarData, { showQueryParams: true });
      expect(result).toBe(
        '[1] 200 GET https://example.com/api?param=value\n' +
          '[2] 404 POST https://api.example.com/data?token=abc123\n' +
          '[3] 201 PUT https://api.example.com/update'
      );
    });

    it('should format entries without query parameters', () => {
      const result = formatHarEntries(mockHarData, { showQueryParams: false });
      expect(result).toBe(
        '[1] 200 GET https://example.com/api\n' +
          '[2] 404 POST https://api.example.com/data\n' +
          '[3] 201 PUT https://api.example.com/update'
      );
    });

    it('should filter entries by status code', () => {
      const result = formatHarEntries(mockHarData, {
        showQueryParams: true,
        filter: { statusCode: 200 },
      });
      expect(result).toBe('[1] 200 GET https://example.com/api?param=value');
    });

    it('should filter entries by method', () => {
      const result = formatHarEntries(mockHarData, {
        showQueryParams: true,
        filter: { method: 'POST' },
      });
      expect(result).toBe('[1] 404 POST https://api.example.com/data?token=abc123');
    });

    it('should filter entries by URL pattern', () => {
      const result = formatHarEntries(mockHarData, {
        showQueryParams: true,
        filter: { urlPattern: 'api.example' },
      });
      expect(result).toBe(
        '[1] 404 POST https://api.example.com/data?token=abc123\n' +
          '[2] 201 PUT https://api.example.com/update'
      );
    });
  });

  describe('parseAndFormatHar', () => {
    it('should parse and format a HAR file', async () => {
      // Mock the file read operation
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockHarData));

      const result = await parseAndFormatHar('/path/to/file.har', { showQueryParams: true });
      expect(result).toBe(
        '[1] 200 GET https://example.com/api?param=value\n' +
          '[2] 404 POST https://api.example.com/data?token=abc123\n' +
          '[3] 201 PUT https://api.example.com/update'
      );
    });
  });
});
