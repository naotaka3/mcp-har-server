import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { parseAndFormatHar } from './utils/har-parser.js';

export const createMcpHarServer = async () => {
  // Create an MCP server
  const mcpServer = new McpServer({
    name: 'mcp-har-server',
    version: '1.0.0',
  });

  // Define the har_viewer tool
  mcpServer.tool(
    'har_viewer',
    {
      filePath: z.string().min(1),
      showQueryParams: z.boolean().default(true),
      filter: z
        .object({
          statusCode: z.number().optional(),
          method: z.string().optional(),
          urlPattern: z.string().optional(),
        })
        .optional(),
    },
    async ({ filePath, showQueryParams, filter }) => {
      try {
        const formattedHar = await parseAndFormatHar(filePath, {
          showQueryParams,
          filter,
        });

        return {
          content: [{ type: 'text', text: formattedHar }],
        };
      } catch (error) {
        let errorMessage = 'An error occurred while processing the HAR file';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        };
      }
    }
  );

  async function cleanup() {
    try {
      await mcpServer.close();
    } catch (error) {
      console.error('Error closing server:', error);
    }
  }

  return { server: mcpServer, cleanup };
};
