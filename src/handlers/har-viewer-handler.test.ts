import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handleHarViewer, harViewerSchema } from './har-viewer-handler.js';
import * as harParser from '../utils/har-parser.js';

vi.mock('../utils/har-parser.js', () => ({
  parseAndFormatHar: vi.fn(),
}));

describe('harViewerSchema', () => {
  it('should validate when urlPattern is provided', () => {
    const validInput = {
      filePath: '/path/to/file.har',
      showQueryParams: false,
      filter: {
        urlPattern: 'example.com',
      },
    };
    expect(() => harViewerSchema.parse(validInput)).not.toThrow();
  });

  it('should validate when excludeDomains is provided with at least one domain', () => {
    const validInput = {
      filePath: '/path/to/file.har',
      showQueryParams: true,
      filter: {
        excludeDomains: ['google.com'],
      },
    };
    expect(() => harViewerSchema.parse(validInput)).not.toThrow();
  });

  it('should not validate when neither urlPattern nor excludeDomains is provided', () => {
    const invalidInput = {
      filePath: '/path/to/file.har',
      showQueryParams: false,
      filter: {
        statusCode: 200,
      },
    };
    expect(() => harViewerSchema.parse(invalidInput)).toThrow();
  });

  it('should not validate when excludeDomains is an empty array', () => {
    const invalidInput = {
      filePath: '/path/to/file.har',
      showQueryParams: false,
      filter: {
        excludeDomains: [],
      },
    };
    expect(() => harViewerSchema.parse(invalidInput)).toThrow();
  });
});

describe('handleHarViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return formatted HAR data when parsing succeeds with urlPattern filter', async () => {
    const mockFormattedHar = '[1] 200 GET https://example.com';
    const mockArgs = {
      filePath: '/path/to/example.har',
      showQueryParams: false,
      filter: {
        statusCode: 200,
        urlPattern: 'example.com',
      },
    };

    vi.mocked(harParser.parseAndFormatHar).mockResolvedValue(mockFormattedHar);

    const result = await handleHarViewer(mockArgs);

    expect(harParser.parseAndFormatHar).toHaveBeenCalledWith(mockArgs.filePath, {
      showQueryParams: mockArgs.showQueryParams,
      filter: mockArgs.filter,
    });

    expect(result).toEqual({
      content: [{ type: 'text', text: mockFormattedHar }],
    });
  });

  it('should handle excludeDomains filter parameter', async () => {
    const mockFormattedHar = '[1] 200 GET https://example.com';
    const mockArgs = {
      filePath: '/path/to/example.har',
      showQueryParams: false,
      filter: {
        excludeDomains: ['google.com', 'analytics.com'],
      },
    };

    vi.mocked(harParser.parseAndFormatHar).mockResolvedValue(mockFormattedHar);

    const result = await handleHarViewer(mockArgs);

    expect(harParser.parseAndFormatHar).toHaveBeenCalledWith(mockArgs.filePath, {
      showQueryParams: mockArgs.showQueryParams,
      filter: mockArgs.filter,
    });

    expect(result).toEqual({
      content: [{ type: 'text', text: mockFormattedHar }],
    });
  });

  it('should handle errors during HAR parsing', async () => {
    const mockError = new Error('Failed to read HAR file');
    const mockArgs = {
      filePath: '/path/to/nonexistent.har',
      showQueryParams: false,
      filter: { urlPattern: 'example.com' },
    };

    vi.mocked(harParser.parseAndFormatHar).mockRejectedValue(mockError);

    const result = await handleHarViewer(mockArgs);

    expect(result).toEqual({
      content: [{ type: 'text', text: `Error: Failed to read HAR file` }],
    });
  });

  it('should handle non-Error objects during HAR parsing', async () => {
    const mockArgs = {
      filePath: '/path/to/corrupt.har',
      showQueryParams: false,
      filter: { urlPattern: 'example.com' },
    };

    vi.mocked(harParser.parseAndFormatHar).mockRejectedValue('Not an error object');

    const result = await handleHarViewer(mockArgs);

    expect(result).toEqual({
      content: [{ type: 'text', text: `Error: An error occurred while processing the HAR file` }],
    });
  });

  it('should return error when neither urlPattern nor excludeDomains is provided', async () => {
    const mockArgs = {
      filePath: '/path/to/example.har',
      showQueryParams: false,
      filter: { statusCode: 200 },
    };

    const result = await handleHarViewer(mockArgs);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Error: Either urlPattern or excludeDomains must be provided to filter the output. Use the domain_list tool first to see available domains.',
        },
      ],
    });
  });
});
