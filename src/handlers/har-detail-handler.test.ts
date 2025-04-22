import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleHarDetail } from './har-detail-handler.js';
import * as harParser from '../utils/har-parser.js';

// Mock the har parser module
vi.mock('../utils/har-parser.js', () => ({
  getHarEntryDetails: vi.fn(),
}));

describe('har-detail-handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return entry details for a single hash', async () => {
    const mockContent = 'Mock HAR entry details';
    vi.mocked(harParser.getHarEntryDetails).mockResolvedValue({
      success: true,
      content: mockContent,
    });

    const result = await handleHarDetail({
      filePath: 'test.har',
      hashes: 'abc1234',
      showBody: false,
    });

    expect(harParser.getHarEntryDetails).toHaveBeenCalledWith('test.har', ['abc1234'], {
      showBody: false,
    });
    expect(result.content[0].text).toBe(mockContent);
  });

  it('should return entry details for multiple comma-separated hashes', async () => {
    const mockContent = 'Mock HAR entry details for multiple entries';
    vi.mocked(harParser.getHarEntryDetails).mockResolvedValue({
      success: true,
      content: mockContent,
    });

    const result = await handleHarDetail({
      filePath: 'test.har',
      hashes: 'abc1234,def5678,ghi9012',
      showBody: true,
    });

    expect(harParser.getHarEntryDetails).toHaveBeenCalledWith(
      'test.har',
      ['abc1234', 'def5678', 'ghi9012'],
      {
        showBody: true,
      }
    );
    expect(result.content[0].text).toBe(mockContent);
  });

  it('should handle errors from getHarEntryDetails', async () => {
    const mockError = new Error('Test error');
    vi.mocked(harParser.getHarEntryDetails).mockRejectedValue(mockError);

    const result = await handleHarDetail({
      filePath: 'test.har',
      hashes: 'abc1234',
      showBody: false,
    });

    expect(result.content[0].text).toBe('Error: Test error');
  });

  it('should handle non-Error type errors', async () => {
    vi.mocked(harParser.getHarEntryDetails).mockRejectedValue('string error');

    const result = await handleHarDetail({
      filePath: 'test.har',
      hashes: 'abc1234',
      showBody: false,
    });

    expect(result.content[0].text).toBe('Error: An error occurred while processing the HAR file');
  });
});
