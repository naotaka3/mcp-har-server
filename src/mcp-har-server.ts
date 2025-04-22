import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { handleHarViewer, harViewerSchema } from './handlers/har-viewer-handler.js';
import { handleHarDetail, harDetailSchema } from './handlers/har-detail-handler.js';
import { handleDomainList, domainListSchema } from './handlers/domain-list-handler.js';

export const createMcpHarServer = async () => {
  // Create an MCP server
  const mcpServer = new McpServer({
    name: 'mcp-har-server',
    version: '1.0.0',
  });

  // Define the har_viewer tool
  mcpServer.tool(
    'har_viewer',
    'Displays HAR file requests in a simplified format with options to filter by method, status code, or URL pattern and toggle query parameter visibility.',
    harViewerSchema.shape,
    handleHarViewer
  );
  // Define the har_detail tool
  mcpServer.tool(
    'har_detail',
    'Provides detailed information about specific HAR file entries including headers and request/response bodies.',
    harDetailSchema.shape,
    handleHarDetail
  );

  // Define the domain_list tool
  mcpServer.tool(
    'domain_list',
    'Lists all unique domains found in a HAR file to help reduce output volume and provide filtering options.',
    domainListSchema.shape,
    handleDomainList
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
