import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleHarViewer, harViewerSchema } from './handlers/har-viewer-handler.js';
import { handleHarDetail, harDetailSchema } from './handlers/har-detail-handler.js';

export const createMcpHarServer = async () => {
  // Create an MCP server
  const mcpServer = new McpServer({
    name: 'mcp-har-server',
    version: '1.0.0',
  });

  // Define the har_viewer tool
  mcpServer.tool('har_viewer', harViewerSchema.shape, handleHarViewer);

  // Define the har_detail tool
  mcpServer.tool('har_detail', harDetailSchema.shape, handleHarDetail);

  async function cleanup() {
    try {
      await mcpServer.close();
    } catch (error) {
      console.error('Error closing server:', error);
    }
  }

  return { server: mcpServer, cleanup };
};
