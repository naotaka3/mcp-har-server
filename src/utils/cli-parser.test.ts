import { describe, expect, it } from 'vitest';
import { parseCliArgs } from './cli-parser.js';

describe('CLI parser', () => {
  it('should parse file path from positional argument', () => {
    const args = ['example.har'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.filePath).toBe('example.har');
    expect(options?.showQueryParams).toBe(true); // default
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

  it('should parse hide-query option', () => {
    const args = ['example.har', '--hide-query'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.showQueryParams).toBe(false);
  });

  it('should parse status code filter', () => {
    const args = ['example.har', '--status', '200'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.statusCode).toBe(200);
  });

  it('should parse method filter', () => {
    const args = ['example.har', '--method', 'GET'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.method).toBe('GET');
  });

  it('should parse URL pattern filter', () => {
    const args = ['example.har', '--url', 'api'];
    const options = parseCliArgs(args);

    expect(options).not.toBeNull();
    expect(options?.urlPattern).toBe('api');
  });

  it('should return null for help request', () => {
    const args = ['--help'];
    const options = parseCliArgs(args);

    expect(options).toBeNull();
  });

  it('should throw error for missing file path', () => {
    const args: string[] = [];

    expect(() => parseCliArgs(args)).toThrow('HAR file path is required');
  });

  it('should throw error for invalid status code', () => {
    const args = ['example.har', '--status', 'abc'];

    expect(() => parseCliArgs(args)).toThrow('Status code must be a number');
  });
});
