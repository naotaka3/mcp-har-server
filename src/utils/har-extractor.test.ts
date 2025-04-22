import { describe, it, expect } from 'vitest';
import { getHarEntryByIndex, extractDomains } from './har-extractor.js';

const mockHarData = {
  log: {
    entries: [
      {
        request: {
          method: 'GET',
          url: 'https://example.com/api?param=value',
          headers: [],
        },
        response: {
          status: 200,
          statusText: 'OK',
          headers: [],
        },
      },
      {
        request: {
          method: 'POST',
          url: 'https://api.example.com/data?token=abc123',
          headers: [],
        },
        response: {
          status: 404,
          statusText: 'Not Found',
          headers: [],
        },
      },
      {
        request: {
          method: 'PUT',
          url: 'https://api.example.com/update',
          headers: [],
        },
        response: {
          status: 201,
          statusText: 'Created',
          headers: [],
        },
      },
    ],
  },
};

describe('HAR Extractor', () => {
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
});
