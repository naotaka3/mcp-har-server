#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpHarServer } from './mcp-har-server.js';

async function main() {
  const transport = new StdioServerTransport();
  const { server, cleanup } = await createMcpHarServer();

  await server.connect(transport);

  async function exit() {
    setTimeout(() => process.exit(0), 15000);
    await cleanup();
    process.exit(0);
  }

  process.stdin.on('close', exit);
  process.on('SIGINT', exit);
  process.on('SIGTERM', exit);
}

main().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
