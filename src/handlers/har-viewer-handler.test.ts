import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handleHarViewer } from './har-viewer-handler.js';
import * as harParser from '../utils/har-parser.js';

vi.mock('../utils/har-parser.js', () => ({
  parseAndFormatHar: vi.fn(),
}));

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

  it('should return error when neither urlPattern nor excludeDomains is provided and validateFilters is true', async () => {
    const mockArgs = {
      filePath: '/path/to/example.har',
      showQueryParams: false,
      filter: { statusCode: 200 },
    };

    const result = await handleHarViewer(mockArgs, true);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Error: Either urlPattern or excludeDomains must be provided to filter the output. Use the domain_list tool first to see available domains.',
        },
      ],
    });
  });

  it('should skip validation when validateFilters is false', async () => {
    const mockFormattedHar = '[1] 200 GET https://example.com';
    const mockArgs = {
      filePath: '/path/to/example.har',
      showQueryParams: false,
      filter: { statusCode: 200 },
    };

    vi.mocked(harParser.parseAndFormatHar).mockResolvedValue(mockFormattedHar);

    const result = await handleHarViewer(mockArgs, false);

    expect(harParser.parseAndFormatHar).toHaveBeenCalledWith(mockArgs.filePath, {
      showQueryParams: mockArgs.showQueryParams,
      filter: mockArgs.filter,
    });

    expect(result).toEqual({
      content: [{ type: 'text', text: mockFormattedHar }],
    });
  });
});
