import { describe, it, expect } from 'vitest';
import { removeQueryParams, formatHarEntries, formatHeaders, formatBody } from './har-formatter.js';

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

describe('HAR Formatter', () => {
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
      // Match the format but don't rely on specific hash values which could change
      expect(result).toMatch(/\[[0-9a-f]{7}\] 200 GET https:\/\/example\.com\/api\?param=value/);
      expect(result).toMatch(
        /\[[0-9a-f]{7}\] 404 POST https:\/\/api\.example\.com\/data\?token=abc123/
      );
      expect(result).toMatch(/\[[0-9a-f]{7}\] 201 PUT https:\/\/api\.example\.com\/update/);
    });

    it('should format entries without query parameters', () => {
      const result = formatHarEntries(mockHarData, { showQueryParams: false });
      // Match the format but don't rely on specific hash values
      expect(result).toMatch(/\[[0-9a-f]{7}\] 200 GET https:\/\/example\.com\/api/);
      expect(result).toMatch(/\[[0-9a-f]{7}\] 404 POST https:\/\/api\.example\.com\/data/);
      expect(result).toMatch(/\[[0-9a-f]{7}\] 201 PUT https:\/\/api\.example\.com\/update/);
    });

    it('should filter entries by status code', () => {
      const result = formatHarEntries(mockHarData, {
        showQueryParams: true,
        filter: { statusCode: 200 },
      });
      expect(result).toMatch(/\[[0-9a-f]{7}\] 200 GET https:\/\/example\.com\/api\?param=value/);
    });

    it('should filter entries by method', () => {
      const result = formatHarEntries(mockHarData, {
        showQueryParams: true,
        filter: { method: 'POST' },
      });
      expect(result).toMatch(
        /\[[0-9a-f]{7}\] 404 POST https:\/\/api\.example\.com\/data\?token=abc123/
      );
    });

    it('should filter entries by URL pattern', () => {
      const result = formatHarEntries(mockHarData, {
        showQueryParams: true,
        filter: { urlPattern: 'api.example' },
      });
      expect(result).toMatch(
        /\[[0-9a-f]{7}\] 404 POST https:\/\/api\.example\.com\/data\?token=abc123/
      );
      expect(result).toMatch(/\[[0-9a-f]{7}\] 201 PUT https:\/\/api\.example\.com\/update/);
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
});
