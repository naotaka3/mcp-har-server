import { describe, it, expect, vi } from 'vitest';
import { handleDomainList } from './domain-list-handler.js';
import * as harParser from '../utils/har-parser.js';

// Mock the har-parser module
vi.mock('../utils/har-parser.js', () => ({
  parseAndExtractDomains: vi.fn(),
}));

describe('Domain List Handler', () => {
  it('should return a list of domains when successful', async () => {
    // Setup mock
    const mockDomainList = '[1] example.com\n[2] api.example.com';
    vi.mocked(harParser.parseAndExtractDomains).mockResolvedValue(mockDomainList);

    // Call the handler
    const result = await handleDomainList({
      filePath: 'test.har',
    });

    // Verify expectations
    expect(harParser.parseAndExtractDomains).toHaveBeenCalledWith('test.har');
    expect(result).toEqual({
      content: [{ type: 'text', text: mockDomainList }],
    });
  });

  it('should return an error message when an error occurs', async () => {
    // Setup mock to throw an error
    const mockError = new Error('File not found');
    vi.mocked(harParser.parseAndExtractDomains).mockRejectedValue(mockError);

    // Call the handler
    const result = await handleDomainList({
      filePath: 'nonexistent.har',
    });

    // Verify expectations
    expect(harParser.parseAndExtractDomains).toHaveBeenCalledWith('nonexistent.har');
    expect(result).toEqual({
      content: [{ type: 'text', text: 'Error: File not found' }],
    });
  });
});
