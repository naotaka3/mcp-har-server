#!/usr/bin/env node

/**
 * Example script demonstrating how to use the MCP HAR Viewer tool
 *
 * This script shows how to interact with the HAR viewer tool through MCP protocol.
 *
 * To run this example:
 * 1. Start the MCP HAR server in one terminal: npm run dev
 * 2. Run this example in another terminal: node examples/har-viewer-example.js
 */

import { McpClient } from '@modelcontextprotocol/sdk/client/mcp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to our HAR file relative to this script
const harFilePath = path.resolve(__dirname, './sample.har');

async function main() {
  // Spawn the MCP server process
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // Create an MCP client that communicates with the server over stdio
  const transport = new StdioClientTransport({
    input: serverProcess.stdout,
    output: serverProcess.stdin,
  });

  const client = new McpClient();
  await client.connect(transport);

  try {
    console.log('\n\nExample 1: Show all requests with query parameters');
    const result1 = await client.callTool('har_viewer', {
      filePath: harFilePath,
      showQueryParams: true,
    });
    console.log(result1.content[0].text);

    console.log('\n\nExample 2: Show all requests without query parameters');
    const result2 = await client.callTool('har_viewer', {
      filePath: harFilePath,
      showQueryParams: false,
    });
    console.log(result2.content[0].text);

    console.log('\n\nExample 3: Filter only GET requests');
    const result3 = await client.callTool('har_viewer', {
      filePath: harFilePath,
      showQueryParams: true,
      filter: {
        method: 'GET',
      },
    });
    console.log(result3.content[0].text);

    console.log('\n\nExample 4: Filter by status code 200');
    const result4 = await client.callTool('har_viewer', {
      filePath: harFilePath,
      showQueryParams: true,
      filter: {
        statusCode: 200,
      },
    });
    console.log(result4.content[0].text);

    console.log('\n\nExample 5: Filter by URL pattern');
    const result5 = await client.callTool('har_viewer', {
      filePath: harFilePath,
      showQueryParams: true,
      filter: {
        urlPattern: 'cloudfront',
      },
    });
    console.log(result5.content[0].text);
  } catch (error) {
    console.error('Error calling HAR viewer tool:', error);
  } finally {
    // Clean up
    await client.disconnect();
    serverProcess.kill();
  }
}

main().catch((error) => {
  console.error('Error in example script:', error);
  process.exit(1);
});
