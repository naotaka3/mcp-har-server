# MCP HAR Server

A Model Context Protocol (MCP) server that parses HAR (HTTP Archive) files and displays requests in a simplified format. This tool is designed to be used with AI assistants through the MCP protocol.

## Features

- Parse HAR files and extract request/response information
- Display requests in a numbered list format with status codes and methods
- Toggle query parameter visibility
- Filter requests by status code, method, or URL pattern

## Installation

```bash
# Clone the repository
git clone https://github.com/shimizu1995/mcp-har-server.git
cd mcp-har-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Running the server

```bash
npm run dev
```

### Using the HAR viewer tool

The HAR viewer tool can be accessed through the MCP protocol. Here's an example of how to use it:

```javascript
// Example usage through MCP protocol
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

### Example Output

With `showQueryParams: true`:

```
[1] 200 GET https://www.googletagmanager.com/static/service_worker/54a0/sw_iframe.html?origin=https%3A%2F%2Fp.ieyasu.co
[2] 200 GET https://d28smvig8jlp61.cloudfront.net/sync/sync.html?1744984310014
[3] 200 GET https://d28smvig8jlp61.cloudfront.net/sync/sync.js?1744984310178
```

With `showQueryParams: false`:

```
[1] 200 GET https://www.googletagmanager.com/static/service_worker/54a0/sw_iframe.html
[2] 200 GET https://d28smvig8jlp61.cloudfront.net/sync/sync.html
[3] 200 GET https://d28smvig8jlp61.cloudfront.net/sync/sync.js
```

## Development

```bash
# Run the development server with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## About MCP

This tool uses the Model Context Protocol (MCP), which allows AI assistants to interact with external tools and services. Learn more about MCP at [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk).

## License

MIT
