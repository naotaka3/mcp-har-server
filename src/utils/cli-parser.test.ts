import { describe, expect, it } from 'vitest';
import { parseCliArgs } from './cli-parser.js';

describe('CLI parser', () => {
  it('should parse file path from positional argument', () => {
    const args = ['example.har'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.filePath).toBe('example.har');
    expect(options?.showQueryParams).toBe(false); // default
    expect(options?.command).toBe('list'); // default command
  });

  it('should parse file path from --file option', () => {
    const args = ['--file', 'example.har'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.filePath).toBe('example.har');
  });

  it('should parse file path from -f shorthand', () => {
    const args = ['-f', 'example.har'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.filePath).toBe('example.har');
  });

  it('should parse show-query option', () => {
    const args = ['list', 'example.har', '--show-query'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.showQueryParams).toBe(true);
  });

  it('should parse status code filter', () => {
    const args = ['list', 'example.har', '--status', '200'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.statusCode).toBe(200);
  });

  it('should parse method filter', () => {
    const args = ['list', 'example.har', '--method', 'GET'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.method).toBe('GET');
  });

  it('should parse URL pattern filter', () => {
    const args = ['list', 'example.har', '--url', 'api'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.urlPattern).toBe('api');
  });

  it('should parse exclude-domains option', () => {
    const args = ['list', 'example.har', '--exclude-domains', 'example.com,analytics.com'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.excludeDomains).toEqual(['example.com', 'analytics.com']);
  });

  it('should parse exclude-domains shorthand option', () => {
    const args = ['list', 'example.har', '-e', 'example.com'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.excludeDomains).toEqual(['example.com']);
  });

  it('should return null for help request', () => {
    const args = ['--help'];
    const options = parseCliArgs(args);

    expect(options).toBeNull();
  });

  it('should throw error for missing file path', () => {
    const args = ['list'];

    expect(() => parseCliArgs(args)).toThrow('HAR file path is required');
  });

  it('should throw error for invalid status code', () => {
    const args = ['list', 'example.har', '--status', 'abc'];

    expect(() => parseCliArgs(args)).toThrow('Status code must be a number');
  });

  it('should parse detail command', () => {
    const args = ['detail', '--hashes', '1,2,3', 'example.har'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.command).toBe('detail');
    expect(options?.hashes).toBe('1,2,3');
    expect(options?.showBody).toBe(false); // default
  });

  it('should parse show body option in detail mode', () => {
    const args = ['detail', '--hashes', '1', '--body', 'example.har'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.command).toBe('detail');
    expect(options?.hashes).toBe('1');
    expect(options?.showBody).toBe(true);
  });

  it('should throw error for missing hashes in detail mode', () => {
    const args = ['detail', 'example.har'];

    expect(() => parseCliArgs(args)).toThrow('Hash identifiers are required in detail mode');
  });

  // We accept any hash string values
  it('should accept alphanumeric hash values', () => {
    const args = ['detail', '--hashes', '1,a3f5z9,3', 'example.har'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.hashes).toBe('1,a3f5z9,3');
  });
});
