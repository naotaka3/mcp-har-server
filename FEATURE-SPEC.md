# MCP HAR Parser and Viewer Tool Specification

This document defines the requirements for an MCP server tool that parses HAR (HTTP Archive) files and returns a simplified view of the requests in a clean, readable format.

## Features

1. **HAR File Parsing**: Ability to read and parse HAR files from a specified file path

2. **Simplified Request Display**: Formats HAR requests in a clean, numbered list format:

   ```
   [1] 200 GET https://example.com
   [2] 404 POST https://api.example.com
   ```

3. **Query Parameter Toggle**: Option to show or hide URL query parameters

4. **Filtering Options**: Ability to filter requests by status code, method, or URL pattern

5. **MCP Integration**: Implements the Model Context Protocol to make this tool available to AI assistants

## Implementation Plan

1. Create a HAR parser utility to read and extract relevant information from HAR files
2. Implement the MCP tool interface with appropriate schema validation
3. Add query parameter toggle and filtering functionality
4. Add comprehensive error handling for file access and parsing issues
5. Document usage and examples

## Usage Example

The tool would be invoked through the MCP protocol, allowing a user to interact with the HAR data through an AI assistant. Example:

```
Tool: har_viewer
Args: {
  "filePath": "/path/to/example.har",
  "showQueryParams": false,
  "filter": {
    "statusCode": 200,
    "method": "GET"
  }
}
```

This would return all successful GET requests from the HAR file, with query parameters hidden.

## Additional Considerations

- **Performance**: For large HAR files, consider implementing pagination or chunking
- **Security**: Validate file paths to prevent directory traversal attacks
- **Extensibility**: Design the parser to be extensible for future features like detailed timing information or response body inspection
