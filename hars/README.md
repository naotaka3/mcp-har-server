# HAR Files Directory

This directory is used to store HAR (HTTP Archive) files for testing and demonstration purposes. HAR files contain detailed information about HTTP transactions that can be processed by the MCP HAR server.

## Standard HAR Format

HAR (HTTP Archive) is a file format used by various HTTP session tools to export the captured data. It contains a JSON formatted archive file of interactions between a web browser and websites.

## Sample Files

The samples in this directory can be used with the MCP HAR server tool. To use your own HAR files, place them in this directory and reference them by path in the tool parameters.

## Usage

```javascript
const result = await mcpClient.callTool('har_viewer', {
  filePath: '/path/to/your/file.har',
  showQueryParams: true, // Set to false to hide query parameters
  filter: {
    statusCode: 200, // Optional: Filter by status code
    method: 'GET', // Optional: Filter by HTTP method
    urlPattern: 'api', // Optional: Filter by URL pattern
  },
});
```
