import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatEntryDetails, getHarEntryDetails } from './har-details.js';
import * as harReader from './har-reader.js';
import * as hashUtils from './hash.js';

// Mock har-reader module
vi.mock('./har-reader.js', () => ({
  readHarFile: vi.fn(),
}));

// Mock hash module
vi.mock('./hash.js', () => ({
  generateEntryHash: vi.fn().mockImplementation((entry) => {
    // Return predictable hash based on the request method
    return entry.request.method === 'GET' ? 'abcd123456789' : 'efgh456789012';
  }),
  shortenHash: vi.fn().mockImplementation((hash) => {
    // Return first 7 characters of the hash
    return hash.substring(0, 7);
  }),
}));

const mockEntry = {
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
};

const mockPostEntry = {
  request: {
    method: 'POST',
    url: 'https://api.example.com/data',
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
};

const mockHarData = {
  log: {
    entries: [mockEntry, mockPostEntry],
  },
};

describe('HAR Details', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('formatEntryDetails', () => {
    it('should format entry details without body', () => {
      const result = formatEntryDetails(mockEntry, { showBody: false });

      // Verify the result contains headers but not body
      expect(result).toContain('=== REQUEST ===');
      expect(result).toContain('=== RESPONSE ===');
      expect(result).toContain('--- Headers ---');
      expect(result).toContain('Accept: application/json');
      expect(result).toContain('Content-Type: application/json');
      expect(result).not.toContain('--- Body ---');
    });

    it('should format entry details with body', () => {
      const result = formatEntryDetails(mockEntry, { showBody: true });

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
    beforeEach(() => {
      // Reset all mocks before each test
      vi.mocked(harReader.readHarFile).mockReset();
      vi.mocked(hashUtils.generateEntryHash).mockReset();
      vi.mocked(hashUtils.shortenHash).mockReset();

      // Configure mocks with default behavior
      vi.mocked(hashUtils.generateEntryHash).mockImplementation((entry) => {
        return entry.request.method === 'GET' ? 'abcd123456789' : 'efgh456789012';
      });

      vi.mocked(hashUtils.shortenHash).mockImplementation((hash) => {
        if (hash === 'abcd123456789') return 'abcd123';
        if (hash === 'efgh456789012') return 'efgh456';
        return hash.substring(0, 7);
      });
    });

    it('should get details for a single hash entry', async () => {
      // Mock the readHarFile function
      vi.mocked(harReader.readHarFile).mockResolvedValue(mockHarData);

      // Use a hash that matches the first entry
      const result = await getHarEntryDetails('/path/to/file.har', ['abcd123'], {
        showBody: false,
      });

      expect(result.success).toBe(true);
      expect(result.content).toMatch(/ENTRY \[abcd123\]/);
      expect(result.content).toContain('=== REQUEST ===');
      expect(result.content).toContain('=== RESPONSE ===');
    });

    it('should get details for multiple hash entries', async () => {
      // Mock the readHarFile function
      vi.mocked(harReader.readHarFile).mockResolvedValue(mockHarData);

      const result = await getHarEntryDetails('/path/to/file.har', ['abcd123', 'efgh456'], {
        showBody: true,
      });

      expect(result.success).toBe(true);
      // There should be multiple entries
      const matches = result.content.match(/ENTRY \[(abcd123|efgh456)\]/g) || [];
      expect(matches.length).toBeGreaterThanOrEqual(1);
      expect(result.content).toContain('=== REQUEST ===');
      expect(result.content).toContain('=== RESPONSE ===');
      expect(result.content).toContain('--- Body ---');
    });

    it('should handle non-existent hash entries', async () => {
      // Mock the readHarFile function
      vi.mocked(harReader.readHarFile).mockResolvedValue(mockHarData);

      const result = await getHarEntryDetails('/path/to/file.har', ['nonexist'], {
        showBody: false,
      });

      expect(result.success).toBe(true);
      expect(result.content).toContain('Entry with hash [nonexist] does not exist');
    });

    it('should handle errors', async () => {
      // Mock a file read error
      vi.mocked(harReader.readHarFile).mockRejectedValue(new Error('File not found'));

      const result = await getHarEntryDetails('/path/to/file.har', ['abcd123'], {
        showBody: false,
      });

      expect(result.success).toBe(false);
      expect(result.content).toContain('Failed to get HAR entry details');
      expect(result.content).toContain('File not found');
    });

    it('should handle empty HAR files', async () => {
      // Mock an empty HAR file
      vi.mocked(harReader.readHarFile).mockResolvedValue({ log: { entries: [] } });

      const result = await getHarEntryDetails('/path/to/file.har', ['abcd123'], {
        showBody: false,
      });

      expect(result.success).toBe(false);
      expect(result.content).toBe('No entries found in HAR file.');
    });
  });
});
