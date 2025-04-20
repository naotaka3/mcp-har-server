import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import * as cliParser from './utils/cli-parser.js';

// Mock dependencies
vi.mock('./utils/cli-parser.js', () => ({
  parseCliArgs: vi.fn(),
  printHelp: vi.fn(),
}));

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods to avoid polluting test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Mock process.exit to prevent tests from terminating
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should exit with code 0 when help is requested', async () => {
    // Setup
    vi.mocked(cliParser.parseCliArgs).mockReturnValue(null);

    // Import the module (will execute the main function)
    await import('./cli.js');

    // Verify
    expect(cliParser.printHelp).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });

  // Note: We're not testing the full CLI flow here since it would require
  // more complex mocking. The individual components (parser and handler)
  // are already tested separately.
});
