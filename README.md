# MCP HAR Server

A Model Context Protocol (MCP) server that parses HAR (HTTP Archive) files and displays requests in a simplified format. This tool is designed to be used with AI assistants through the MCP protocol.

## Features

- Parse HAR files and extract request/response information
- Display requests with hash identifiers for easy reference
- Toggle query parameter visibility
- Filter requests by status code, method, URL pattern, or exclude specific domains
- View detailed headers and body information for specific requests
- List unique domains from HAR files to help with filtering

## Available Tools

### har_viewer

Displays HAR file requests in a simplified format with hash identifiers. Includes filtering options to narrow down results.

### har_detail

Provides detailed information about specific HAR file entries including headers and request/response bodies. Uses hash identifiers to reference specific requests.

### domain_list

Lists all unique domains found in a HAR file to help reduce output volume and provide filtering options.

## Usage with Claude Desktop

To use this server with Claude Desktop, add the following configuration to your `claude_desktop_config.json`:

The configuration file `claude_desktop_config.json` is located at:
After changing the configuration, please restart Claude Desktop.

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### Using npx

```json
{
  "mcpServers": {
    "mcp-har-server": {
      "command": "npx",
      "args": ["-y", "@naotaka/mcp-har-server@latest"]
    }
  }
}
```

### Using build

```json
{
  "mcpServers": {
    "mcp-har-server": {
      "command": "node",
      "args": ["/path/to/mcp-har-server/build/index.js"]
    }
  }
}
```

## Usage

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
    excludeDomains: ['cdn.example.com', 'analytics.example.com'], // Optional: Exclude specific domains
  },
});
```

HAR Viewer Output Example

With `showQueryParams: true`:

```text
[abc123] 200 GET https://example.com/api/users?page=1&limit=10
[def456] 404 POST https://api.example.org/data/process?format=json&version=2.1
[ghi789] 500 PUT https://service.example.net/update?id=12345&token=abc123
```

With `showQueryParams: false`:

```text
[abc123] 200 GET https://example.com/api/users
[def456] 404 POST https://api.example.org/data/process
[ghi789] 500 PUT https://service.example.net/update
```

### Using the HAR Detail tool

The HAR Detail tool allows you to view detailed information about specific requests in a HAR file. You can view headers and optionally body content:

```javascript
// Example usage through MCP protocol
const result = await mcpClient.callTool('har_detail', {
  filePath: '/path/to/your/file.har',
  hashes: 'abc123', // Single hash or comma-separated list like 'abc123,def456,ghi789'
  showBody: true, // Set to false to hide request/response bodies
});
```

HAR Detail Output Example

```text
ENTRY [abc123]
=== REQUEST ===
GET https://example.com/api/users?page=1&limit=10

--- Headers ---
Accept: application/json
User-Agent: Mozilla/5.0

=== RESPONSE ===
200 OK

--- Headers ---
Content-Type: application/json
Cache-Control: no-cache

--- Body ---
{
  "users": [
    {
      "id": 1,
      "name": "John Doe"
    },
    {
      "id": 2,
      "name": "Jane Smith"
    }
  ],
  "page": 1,
  "total": 42
}
```

### Using the Domain List tool

The Domain List tool helps you see all unique domains in a HAR file, which is useful for filtering:

```javascript
// Example usage through MCP protocol
const result = await mcpClient.callTool('domain_list', {
  filePath: '/path/to/your/file.har',
});
```

Domain List Output Example

```text
example.com
api.example.org
service.example.net
cdn.example.com
analytics.example.com
```

## Development

### Installation

```bash
# Install dependencies
npm ci
```

### Build and Test

```bash
# Build the project
npm run build

# Run tests
npm test
```

## About MCP

This tool uses the Model Context Protocol (MCP), which allows AI assistants to interact with external tools and services. Learn more about MCP at [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk).

## License

MIT
