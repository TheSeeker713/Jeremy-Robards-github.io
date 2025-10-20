/**
 * Tests for shared utilities (slugify, formatDate, etc.)
 */

import { describe, it, expect } from 'vitest';
import { slugify, formatDate, escapeHtml, truncate } from '../../shared/articleTemplate.js';

describe('slugify', () => {
  it('should convert basic strings to slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Test Article')).toBe('test-article');
  });

  it('should handle special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(slugify('Test & Demo')).toBe('test-demo');
    expect(slugify('Email@test.com')).toBe('emailtestcom');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
    expect(slugify('Hello---World')).toBe('hello-world');
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('should handle leading/trailing hyphens', () => {
    expect(slugify('-Hello-')).toBe('hello');
    expect(slugify('--Test--')).toBe('test');
  });

  it('should handle unicode characters', () => {
    expect(slugify('Café au lait')).toBe('caf-au-lait');
    expect(slugify('Naïve résumé')).toBe('nave-rsum');
  });

  it('should handle numbers', () => {
    expect(slugify('Article 123')).toBe('article-123');
    expect(slugify('2025 Update')).toBe('2025-update');
  });

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });

  it('should handle already-slugified strings', () => {
    expect(slugify('already-a-slug')).toBe('already-a-slug');
    expect(slugify('test-123')).toBe('test-123');
  });
});

describe('formatDate', () => {
  it('should format ISO dates', () => {
    const result = formatDate('2025-10-20T12:00:00.000Z');
    expect(result).toMatch(/Oct(ober)?\s+20,\s+2025/);
  });

  it('should handle Date objects', () => {
    const date = new Date('2025-10-20T12:00:00.000Z');
    const result = formatDate(date);
    expect(result).toMatch(/Oct(ober)?\s+20,\s+2025/);
  });

  it('should handle invalid dates', () => {
    const result = formatDate('invalid');
    expect(result).toBe('Invalid Date');
  });

  it('should handle null/undefined', () => {
    expect(formatDate(null)).toBe('Invalid Date');
    expect(formatDate(undefined)).toBe('Invalid Date');
  });
});

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml('Hello & Goodbye')).toBe('Hello &amp; Goodbye');
    expect(escapeHtml("It's a test")).toBe('It&#039;s a test');
  });

  it('should handle empty strings', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle strings without special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });

  it('should handle multiple special characters', () => {
    expect(escapeHtml('<div class="test">&nbsp;</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;&amp;nbsp;&lt;/div&gt;'
    );
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    const longText = 'This is a very long string that should be truncated';
    expect(truncate(longText, 20)).toBe('This is a very long…');
  });

  it('should not truncate short strings', () => {
    expect(truncate('Short text', 20)).toBe('Short text');
  });

  it('should handle custom suffix', () => {
    expect(truncate('This is a test', 10, '...')).toBe('This is...');
  });

  it('should handle edge cases', () => {
    expect(truncate('', 10)).toBe('');
    expect(truncate('Test', 10)).toBe('Test');
    expect(truncate('Exactly ten', 11)).toBe('Exactly ten');
  });
});
