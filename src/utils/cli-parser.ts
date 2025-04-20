/**
 * CLI argument parsing utilities
 */

import { parseArgs } from 'node:util';

export interface CliOptions {
  filePath: string;
  showQueryParams: boolean;
  statusCode?: number;
  method?: string;
  urlPattern?: string;
}

/**
 * Parses command line arguments
 * @param args Command line arguments (typically process.argv.slice(2))
 * @returns Parsed CLI options or null if help was requested
 * @throws Error if required arguments are missing or invalid
 */
export function parseCliArgs(args: string[]): CliOptions | null {
  const { values } = parseArgs({
    args,
    options: {
      file: { type: 'string', short: 'f' },
      'show-query': { type: 'boolean', short: 'q', default: false },
      status: { type: 'string', short: 's' },
      method: { type: 'string', short: 'm' },
      url: { type: 'string', short: 'u' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  if (values.help) {
    return null; // Indicate help was requested
  }

  const filePath = values.file || args.find((arg) => !arg.startsWith('-')) || '';

  if (!filePath) {
    throw new Error('HAR file path is required');
  }

  const statusCode = values.status ? parseInt(values.status, 10) : undefined;
  if (values.status && isNaN(statusCode!)) {
    throw new Error('Status code must be a number');
  }

  return {
    filePath,
    showQueryParams: values['show-query'],
    statusCode,
    method: values.method,
    urlPattern: values.url,
  };
}

/**
 * Prints help information to the console
 */
export function printHelp(): void {
  console.log(`
HAR Viewer CLI - View and filter HAR file requests

Usage: mcp-har-cli [options] <har-file-path>

Options:
  -f, --file <path>     Path to HAR file
  --show-query          Show query parameters in URLs (hidden by default)
  -s, --status <code>   Filter by status code
  -m, --method <method> Filter by HTTP method
  -u, --url <pattern>   Filter by URL pattern
  -h, --help            Show this help message
`);
}
