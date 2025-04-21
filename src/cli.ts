#!/usr/bin/env node

import { handleHarViewer } from './handlers/har-viewer-handler.js';
import { handleHarDetail } from './handlers/har-detail-handler.js';
import { parseCliArgs, printHelp } from './utils/cli-parser.js';

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  try {
    // Parse command line arguments
    const options = parseCliArgs(process.argv.slice(2));

    // If help was requested (options is null), print help and exit
    if (options === null) {
      printHelp();
      process.exit(0);
    }

    let result;

    // Determine which mode to use based on command
    if (options.command === 'detail') {
      // Detail mode - show headers and optionally body for specific entries
      result = await handleHarDetail({
        filePath: options.filePath,
        indices: options.indices!,
        showBody: options.showBody,
      });
    } else {
      // List mode - show list of all entries with filtering
      result = await handleHarViewer({
        filePath: options.filePath,
        showQueryParams: options.showQueryParams,
        filter: {
          statusCode: options.statusCode,
          method: options.method,
          urlPattern: options.urlPattern,
        },
      });
    }

    // Output the result
    console.log(result.content[0].text);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
