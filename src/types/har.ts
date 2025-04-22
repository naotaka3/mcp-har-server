/**
 * HAR file entry interface defining the structure of a request in a HAR file
 */
export interface HarEntry {
  request: {
    method: string;
    url: string;
    headers: HarHeader[];
    postData?: {
      mimeType: string;
      text: string;
    };
    // Additional fields available but not used in this implementation
  };
  response: {
    status: number;
    statusText: string;
    headers: HarHeader[];
    content?: {
      size: number;
      mimeType: string;
      text?: string;
    };
    // Additional fields available but not used in this implementation
  };
  // Other available fields not used in this implementation
}

/**
 * Interface for HAR header
 */
export interface HarHeader {
  name: string;
  value: string;
}

/**
 * HAR file structure interface
 */
export interface HarFile {
  log: {
    entries: HarEntry[];
    // Additional fields available but not used in this implementation
  };
}

/**
 * Filter options for HAR entries
 */
export interface HarFilter {
  statusCode?: number;
  method?: string;
  urlPattern?: string;
}

/**
 * Options for formatting HAR entries
 */
export interface FormatOptions {
  showQueryParams: boolean;
  filter?: HarFilter;
}

/**
 * Options for retrieving entry details
 */
export interface EntryDetailOptions {
  showBody: boolean;
}
