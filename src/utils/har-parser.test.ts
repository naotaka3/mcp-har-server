import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  readHarFile,
  removeQueryParams,
  formatHarEntries,
  parseAndFormatHar,
  getHarEntryByIndex,
  formatHeaders,
  formatBody,
  formatEntryDetails,
  getHarEntryDetails,
  extractDomains,
  parseAndExtractDomains,
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
      {
        request: {
          method: 'POST',
          url: 'https://api.example.com/data?token=abc123',
          headers: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Authorization', value: 'Bearer token123' },
          ],
          postData: {
            mimeType: 'application/json',
            text: '{"name":"John","email":"john@example.com"}',
          },
        },
        response: {
          status: 404,
          statusText: 'Not Found',
          headers: [{ name: 'Content-Type', value: 'application/json' }],
          content: {
            size: 31,
            mimeType: 'application/json',
            text: '{"error":"Resource not found"}',
          },
        },
      },
      {
        request: {
          method: 'PUT',
          url: 'https://api.example.com/update',
          headers: [{ name: 'Content-Type', value: 'application/json' }],
          postData: {
            mimeType: 'application/json',
            text: '{"id":123,"status":"updated"}',
          },
        },
        response: {
          status: 201,
          statusText: 'Created',
          headers: [
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Location', value: '/resources/123' },
          ],
          content: {
            size: 25,
            mimeType: 'application/json',
            text: '{"id":123,"created":true}',
          },
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

  describe('getHarEntryByIndex', () => {
    it('should return the correct entry by index', () => {
      const entry = getHarEntryByIndex(mockHarData, 2);
      expect(entry).toBe(mockHarData.log.entries[1]); // 1-based to 0-based index conversion
    });

    it('should return undefined for out-of-bounds index', () => {
      const entry = getHarEntryByIndex(mockHarData, 10);
      expect(entry).toBeUndefined();
    });

    it('should return undefined for negative index', () => {
      const entry = getHarEntryByIndex(mockHarData, -1);
      expect(entry).toBeUndefined();
    });
  });

  describe('formatHeaders', () => {
    it('should format headers correctly', () => {
      const headers = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Authorization', value: 'Bearer token123' },
      ];

      const result = formatHeaders(headers);
      expect(result).toBe('Content-Type: application/json\nAuthorization: Bearer token123');
    });

    it('should handle empty headers array', () => {
      const result = formatHeaders([]);
      expect(result).toBe('');
    });
  });

  describe('formatBody', () => {
    it('should format JSON body with proper indentation', () => {
      const content = {
        mimeType: 'application/json',
        text: '{"name":"John","age":30}',
      };

      const result = formatBody(content);
      expect(result).toBe(JSON.stringify(JSON.parse(content.text), null, 2));
    });

    it('should handle non-JSON content', () => {
      const content = {
        mimeType: 'text/plain',
        text: 'Hello, World!',
      };

      const result = formatBody(content);
      expect(result).toBe('Hello, World!');
    });

    it('should handle missing text', () => {
      const content = {
        mimeType: 'application/json',
      };

      const result = formatBody(content);
      expect(result).toBe('[No Body Content]');
    });

    it('should handle malformed JSON', () => {
      const content = {
        mimeType: 'application/json',
        text: '{ invalid json',
      };

      const result = formatBody(content);
      expect(result).toBe('{ invalid json');
    });
  });

  describe('formatEntryDetails', () => {
    it('should format entry details without body', () => {
      const entry = mockHarData.log.entries[0];
      const result = formatEntryDetails(entry, { showBody: false });

      // Verify the result contains headers but not body
      expect(result).toContain('=== REQUEST ===');
      expect(result).toContain('=== RESPONSE ===');
      expect(result).toContain('--- Headers ---');
      expect(result).toContain('Accept: application/json');
      expect(result).toContain('Content-Type: application/json');
      expect(result).not.toContain('--- Body ---');
    });

    it('should format entry details with body', () => {
      const entry = mockHarData.log.entries[0];
      const result = formatEntryDetails(entry, { showBody: true });

      // Verify the result contains headers and body
      expect(result).toContain('=== REQUEST ===');
      expect(result).toContain('=== RESPONSE ===');
      expect(result).toContain('--- Headers ---');
      expect(result).toContain('Accept: application/json');
      expect(result).toContain('Content-Type: application/json');
      expect(result).toContain('--- Body ---');
      expect(result).toContain('"message": "Hello, World!"');
    });
  });

  describe('getHarEntryDetails', () => {
    it('should get details for a single entry', async () => {
      // Mock the file read operation
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockHarData));

      const result = await getHarEntryDetails('/path/to/file.har', [1], { showBody: false });

      expect(result.success).toBe(true);
      expect(result.content).toContain('ENTRY [1]');
      expect(result.content).toContain('=== REQUEST ===');
      expect(result.content).toContain('=== RESPONSE ===');
    });

    it('should get details for multiple entries', async () => {
      // Mock the file read operation
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockHarData));

      const result = await getHarEntryDetails('/path/to/file.har', [1, 3], { showBody: true });

      expect(result.success).toBe(true);
      expect(result.content).toContain('ENTRY [1]');
      expect(result.content).toContain('ENTRY [3]');
      expect(result.content).toContain('=== REQUEST ===');
      expect(result.content).toContain('=== RESPONSE ===');
      expect(result.content).toContain('--- Body ---');
    });

    it('should handle non-existent entries', async () => {
      // Mock the file read operation
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockHarData));

      const result = await getHarEntryDetails('/path/to/file.har', [10], { showBody: false });

      expect(result.success).toBe(true);
      expect(result.content).toContain('Entry [10] does not exist');
      expect(result.content).toContain('Valid range: 1-3');
    });

    it('should handle errors', async () => {
      // Mock a file read error
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const result = await getHarEntryDetails('/path/to/file.har', [1], { showBody: false });

      expect(result.success).toBe(false);
      expect(result.content).toContain('Failed to get HAR entry details');
      expect(result.content).toContain('File not found');
    });

    it('should handle empty HAR files', async () => {
      // Mock an empty HAR file
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ log: { entries: [] } }));

      const result = await getHarEntryDetails('/path/to/file.har', [1], { showBody: false });

      expect(result.success).toBe(false);
      expect(result.content).toBe('No entries found in HAR file.');
    });
  });

  describe('extractDomains', () => {
    it('should extract unique domains from HAR data', () => {
      const domains = extractDomains(mockHarData);
      expect(domains).toEqual(['api.example.com', 'example.com']);
    });

    it('should handle HAR data with no valid URLs', () => {
      const emptyHarData = {
        log: {
          entries: [
            {
              request: { method: 'GET', url: 'invalid-url', headers: [] },
              response: {
                status: 200,
                statusText: 'OK',
                headers: [],
                content: {
                  size: 0,
                  mimeType: 'text/plain',
                },
              },
            },
          ],
        },
      };
      const domains = extractDomains(emptyHarData);
      expect(domains).toEqual([]);
    });

    it('should return an empty array for HAR data with no entries', () => {
      const emptyHarData = { log: { entries: [] } };
      const domains = extractDomains(emptyHarData);
      expect(domains).toEqual([]);
    });
  });

  describe('parseAndExtractDomains', () => {
    it('should parse HAR file and extract domains as formatted string', async () => {
      // Mock the file read operation
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockHarData));

      const result = await parseAndExtractDomains('/path/to/file.har');
      expect(result).toBe('api.example.com\nexample.com');
    });

    it('should handle HAR files with no domains', async () => {
      // Mock a HAR file with no valid URLs
      const emptyHarData = { log: { entries: [] } };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(emptyHarData));

      const result = await parseAndExtractDomains('/path/to/file.har');
      expect(result).toBe('No domains found in HAR file.');
    });

    it('should handle errors', async () => {
      // Mock a file read error
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      await expect(parseAndExtractDomains('/path/to/file.har')).rejects.toThrow(
        'Failed to read or parse HAR file: File not found'
      );
    });
  });
});
