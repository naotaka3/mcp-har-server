/**
 * CLI argument parsing utilities
 */

import { parseArgs } from 'node:util';

export interface CliOptions {
  filePath: string;
  command: 'list' | 'detail' | 'domains';
  // List mode options
  showQueryParams: boolean;
  statusCode?: number;
  method?: string;
  urlPattern?: string;
  // Detail mode options
  indices?: string;
  showBody: boolean;
}

/**
 * Parses command line arguments
 * @param args Command line arguments (typically process.argv.slice(2))
 * @returns Parsed CLI options or null if help was requested
 * @throws Error if required arguments are missing or invalid
 */
export function parseCliArgs(args: string[]): CliOptions | null {
  // Check for help flag first
  if (args.includes('-h') || args.includes('--help')) {
    return null; // Indicate help was requested
  }

  // Determine command (first positional argument)
  const firstArg = args.find((arg) => !arg.startsWith('-'));
  let command: 'list' | 'detail' | 'domains' = 'list'; // Default command
  let remainingArgs = [...args];

  if (firstArg === 'list' || firstArg === 'detail' || firstArg === 'domains') {
    command = firstArg;
    remainingArgs = args.filter((arg) => arg !== firstArg);
  }

  // Parse command-specific options
  const { values } = parseArgs({
    args: remainingArgs,
    options: {
      file: { type: 'string', short: 'f' },
      'show-query': { type: 'boolean', short: 'q', default: false },
      status: { type: 'string', short: 's' },
      method: { type: 'string', short: 'm' },
      url: { type: 'string', short: 'u' },
      indices: { type: 'string', short: 'i' },
      body: { type: 'boolean', short: 'b', default: false },
    },
    allowPositionals: true,
  });

  // Get file path, either from --file option or first positional arg that's not the command
  const filePath = values.file || remainingArgs.find((arg) => !arg.startsWith('-')) || '';

  if (!filePath) {
    throw new Error('HAR file path is required');
  }

  // Parse status code if provided
  const statusCode = values.status ? parseInt(values.status, 10) : undefined;
  if (values.status && isNaN(statusCode!)) {
    throw new Error('Status code must be a number');
  }

  // Validate command-specific requirements
  if (command === 'detail') {
    if (values.indices === undefined) {
      throw new Error('Indices are required in detail mode (-i or --indices)');
    }

    // Validate indices format if provided
    if (values.indices !== undefined && !/^\d+(,\d+)*$/.test(values.indices)) {
      throw new Error('Indices must be comma-separated positive integers');
    }
  }

  return {
    filePath,
    command,
    showQueryParams: values['show-query'],
    statusCode,
    method: values.method,
    urlPattern: values.url,
    indices: values.indices,
    showBody: values.body || false,
  };
}

/**
 * Prints help information to the console
 */
export function printHelp(): void {
  console.log(`
HAR Viewer CLI - View and filter HAR file requests

Usage: mcp-har-cli [command] [options] <har-file-path>

Commands:
  list              List HAR entries with optional filtering (default)
  detail            Show detailed information for specific HAR entries
  domains           List all unique domains found in the HAR file

Common Options:
  -f, --file <path>      Path to HAR file
  -h, --help             Show this help message

List Command Options:
  -q, --show-query       Show query parameters in URLs (hidden by default)
  -s, --status <code>    Filter by status code
  -m, --method <method>  Filter by HTTP method
  -u, --url <pattern>    Filter by URL pattern

Detail Command Options:
  -i, --indices <list>   Comma-separated list of entry indices to show
  -b, --body             Show request/response body (headers only by default)

Examples:
  # Show list of all requests in HAR file
  mcp-har-cli list example.har

  # Show details of entry #1 with headers only
  mcp-har-cli detail -i 1 example.har

  # Show details of entries #2 and #5 including body content
  mcp-har-cli detail -i 2,5 -b example.har

  # Show list of all unique domains in the HAR file
  mcp-har-cli domains example.har
`);
}
