import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAndFormatHar, parseAndExtractDomains } from './har-parser.js';
import * as harReader from './har-reader.js';

// Mock har-reader module
vi.mock('./har-reader.js', () => ({
  readHarFile: vi.fn(),
}));

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
    ],
  },
};

describe('HAR Parser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('parseAndFormatHar', () => {
    it('should parse and format a HAR file', async () => {
      // Mock the readHarFile function
      vi.mocked(harReader.readHarFile).mockResolvedValue(mockHarData);

      const result = await parseAndFormatHar('/path/to/file.har', { showQueryParams: true });
      expect(result).toBe(
        '[1] 200 GET https://example.com/api?param=value\n' +
          '[2] 404 POST https://api.example.com/data?token=abc123'
      );
      expect(harReader.readHarFile).toHaveBeenCalledWith('/path/to/file.har');
    });

    it('should handle errors', async () => {
      // Mock a file read error
      vi.mocked(harReader.readHarFile).mockRejectedValue(new Error('File not found'));

      await expect(
        parseAndFormatHar('/path/to/file.har', { showQueryParams: true })
      ).rejects.toThrow('File not found');
    });
  });

  describe('parseAndExtractDomains', () => {
    it('should parse HAR file and extract domains as formatted string', async () => {
      // Mock the readHarFile function
      vi.mocked(harReader.readHarFile).mockResolvedValue(mockHarData);

      const result = await parseAndExtractDomains('/path/to/file.har');
      expect(result).toBe('api.example.com\nexample.com');
      expect(harReader.readHarFile).toHaveBeenCalledWith('/path/to/file.har');
    });

    it('should handle HAR files with no domains', async () => {
      // Mock a HAR file with no entries
      vi.mocked(harReader.readHarFile).mockResolvedValue({ log: { entries: [] } });

      const result = await parseAndExtractDomains('/path/to/file.har');
      expect(result).toBe('No domains found in HAR file.');
    });

    it('should handle errors', async () => {
      // Mock a file read error
      vi.mocked(harReader.readHarFile).mockRejectedValue(new Error('File not found'));

      await expect(parseAndExtractDomains('/path/to/file.har')).rejects.toThrow(
        /Failed to read or parse HAR file: File not found/
      );
    });
  });
});
