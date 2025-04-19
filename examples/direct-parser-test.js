#!/usr/bin/env node

/**
 * Direct test script for HAR parser utility
 *
 * This script demonstrates the usage of the HAR parser directly without going through the MCP protocol.
 * It can be used for quick testing and debugging of the parser functionality.
 */

import { parseAndFormatHar } from '../src/utils/har-parser.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to our HAR file relative to this script
const harFilePath = path.resolve(__dirname, './sample.har');

async function main() {
  try {
    console.log('\n\nTest 1: Show all requests with query parameters');
    const result1 = await parseAndFormatHar(harFilePath, { showQueryParams: true });
    console.log(result1);

    console.log('\n\nTest 2: Show all requests without query parameters');
    const result2 = await parseAndFormatHar(harFilePath, { showQueryParams: false });
    console.log(result2);

    console.log('\n\nTest 3: Filter only GET requests');
    const result3 = await parseAndFormatHar(harFilePath, {
      showQueryParams: true,
      filter: { method: 'GET' },
    });
    console.log(result3);

    console.log('\n\nTest 4: Filter by status code 200');
    const result4 = await parseAndFormatHar(harFilePath, {
      showQueryParams: true,
      filter: { statusCode: 200 },
    });
    console.log(result4);

    console.log('\n\nTest 5: Filter by URL pattern');
    const result5 = await parseAndFormatHar(harFilePath, {
      showQueryParams: true,
      filter: { urlPattern: 'cloudfront' },
    });
    console.log(result5);
  } catch (error) {
    console.error('Error testing HAR parser:', error);
  }
}

main().catch((error) => {
  console.error('Unhandled error in test script:', error);
  process.exit(1);
});
