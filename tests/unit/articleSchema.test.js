/**
 * Tests for Article Schema Validation
 * 
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import {
  validateArticleDraft,
  validateMetadata,
  validateBlock,
  validateBlocks,
  assertArticleDraft,
  assertMetadata,
  assertBlock,
  validatePartialMetadata,
  isArticleDraftLike,
  ArticleDraftSchema,
  ArticleMetadataSchema,
  ArticleBlockSchema,
} from '../../shared/articleSchema.js';

describe('ArticleBlockSchema', () => {
  it('validates paragraph block', () => {
    const block = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      type: 'paragraph',
      text: 'Hello world',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('paragraph');
      expect(result.data.text).toBe('Hello world');
    }
  });

  it('validates heading block with level', () => {
    const block = {
      type: 'heading',
      text: 'My Heading',
      level: 3,
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.level).toBe(3);
    }
  });

  it('clamps heading level to valid range', () => {
    const block = {
      type: 'heading',
      text: 'Invalid',
      level: 1, // Should fail (must be 2-6)
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('level');
    }
  });

  it('validates list block', () => {
    const block = {
      type: 'list',
      style: 'ordered',
      items: ['First', 'Second', 'Third'],
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(3);
    }
  });

  it('validates quote block with citation', () => {
    const block = {
      type: 'quote',
      text: 'To be or not to be',
      cite: 'Shakespeare',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cite).toBe('Shakespeare');
    }
  });

  it('validates code block', () => {
    const block = {
      type: 'code',
      code: 'console.log("hello");',
      language: 'javascript',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('javascript');
    }
  });

  it('validates image block with URL', () => {
    const block = {
      type: 'image',
      src: 'https://example.com/image.jpg',
      alt: 'Test image',
      caption: 'A test',
      layout: 'full',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
  });

  it('rejects image block with invalid URL', () => {
    const block = {
      type: 'image',
      src: 'not-a-url',
      alt: 'Test',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('URL');
    }
  });

  it('validates embed block', () => {
    const block = {
      type: 'embed',
      url: 'https://youtube.com/watch?v=123',
      html: '<iframe></iframe>',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
  });

  it('validates note block', () => {
    const block = {
      type: 'note',
      text: 'Important note',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
  });

  it('applies defaults to paragraph block', () => {
    const block = {
      type: 'paragraph',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe('');
    }
  });

  it('applies defaults to list block', () => {
    const block = {
      type: 'list',
    };
    
    const result = validateBlock(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.style).toBe('unordered');
      expect(result.data.items).toEqual([]);
    }
  });
});

describe('ArticleMetadataSchema', () => {
  it('validates complete metadata', () => {
    const metadata = {
      title: 'My Article',
      subtitle: 'A great read',
      slug: 'my-article',
      author: 'John Doe',
      category: 'Tech',
      tags: ['javascript', 'web'],
      excerpt: 'This is an excerpt',
      hero: 'https://example.com/hero.jpg',
      date: new Date('2025-01-01'),
      published: true,
      links: [{ label: 'GitHub', url: 'https://github.com' }],
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('My Article');
      expect(result.data.tags).toHaveLength(2);
    }
  });

  it('requires title', () => {
    const metadata = {
      slug: 'test-slug',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(e => e.includes('title'))).toBe(true);
    }
  });

  it('requires slug', () => {
    const metadata = {
      title: 'Test Title',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(e => e.includes('slug'))).toBe(true);
    }
  });

  it('validates slug format', () => {
    const metadata = {
      title: 'Test',
      slug: 'Invalid Slug!',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('slug');
      expect(result.errors[0]).toContain('lowercase');
    }
  });

  it('accepts valid slug format', () => {
    const metadata = {
      title: 'Test',
      slug: 'my-valid-slug-123',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(true);
  });

  it('applies default values', () => {
    const metadata = {
      title: 'Test',
      slug: 'test',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.links).toEqual([]);
      expect(result.data.published).toBe(false);
      expect(result.data.date).toBeInstanceOf(Date);
    }
  });

  it('coerces string date to Date object', () => {
    const metadata = {
      title: 'Test',
      slug: 'test',
      date: '2025-01-01',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date);
    }
  });

  it('validates hero image URL', () => {
    const metadata = {
      title: 'Test',
      slug: 'test',
      hero: 'not-a-url',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('hero');
    }
  });
});

describe('ArticleDraftSchema', () => {
  it('validates complete draft', () => {
    const draft = {
      metadata: {
        title: 'My Article',
        slug: 'my-article',
      },
      blocks: [
        { type: 'paragraph', text: 'First paragraph' },
        { type: 'heading', text: 'Section', level: 2 },
      ],
    };
    
    const result = validateArticleDraft(draft);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.blocks).toHaveLength(2);
    }
  });

  it('applies defaults to empty draft', () => {
    const draft = {
      metadata: {
        title: 'Test',
        slug: 'test',
      },
    };
    
    const result = validateArticleDraft(draft);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.blocks).toEqual([]);
    }
  });

  it('validates nested block array', () => {
    const draft = {
      metadata: {
        title: 'Test',
        slug: 'test',
      },
      blocks: [
        { type: 'paragraph', text: 'Valid' },
        { type: 'heading', level: 10, text: 'Invalid' }, // level out of range
      ],
    };
    
    const result = validateArticleDraft(draft);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('blocks.1');
    }
  });

  it('requires metadata object', () => {
    const draft = {
      blocks: [],
    };
    
    const result = validateArticleDraft(draft);
    expect(result.success).toBe(false);
  });
});

describe('validateBlocks', () => {
  it('validates array of blocks', () => {
    const blocks = [
      { type: 'paragraph', text: 'First' },
      { type: 'heading', text: 'Second', level: 2 },
      { type: 'list', style: 'unordered', items: ['A', 'B'] },
    ];
    
    const result = validateBlocks(blocks);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(3);
    }
  });

  it('rejects invalid block in array', () => {
    const blocks = [
      { type: 'paragraph', text: 'Valid' },
      { type: 'invalid-type', text: 'Bad' },
    ];
    
    const result = validateBlocks(blocks);
    expect(result.success).toBe(false);
  });
});

describe('Assertion functions', () => {
  it('assertArticleDraft throws on invalid data', () => {
    const invalid = {
      metadata: {},
      blocks: [],
    };
    
    expect(() => assertArticleDraft(invalid)).toThrow('validation failed');
    expect(() => assertArticleDraft(invalid)).toThrow('title');
  });

  it('assertArticleDraft returns data on success', () => {
    const valid = {
      metadata: {
        title: 'Test',
        slug: 'test',
      },
      blocks: [],
    };
    
    const result = assertArticleDraft(valid);
    expect(result.metadata.title).toBe('Test');
  });

  it('assertMetadata throws on invalid data', () => {
    const invalid = {
      title: '',
      slug: 'test',
    };
    
    expect(() => assertMetadata(invalid)).toThrow('validation failed');
  });

  it('assertBlock throws on invalid data', () => {
    const invalid = {
      type: 'heading',
      text: 'Test',
      level: 1, // Out of range
    };
    
    expect(() => assertBlock(invalid)).toThrow('validation failed');
  });
});

describe('validatePartialMetadata', () => {
  it('validates partial updates', () => {
    const partial = {
      title: 'Updated Title',
    };
    
    const result = validatePartialMetadata(partial);
    expect(result.success).toBe(true);
  });

  it('allows empty object', () => {
    const result = validatePartialMetadata({});
    expect(result.success).toBe(true);
  });

  it('still validates types in partial', () => {
    const partial = {
      hero: 'not-a-url',
    };
    
    const result = validatePartialMetadata(partial);
    expect(result.success).toBe(false);
  });
});

describe('isArticleDraftLike', () => {
  it('returns true for valid shape', () => {
    const data = {
      metadata: {},
      blocks: [],
    };
    
    expect(isArticleDraftLike(data)).toBe(true);
  });

  it('returns false for invalid shape', () => {
    expect(isArticleDraftLike(null)).toBe(false);
    expect(isArticleDraftLike({})).toBe(false);
    expect(isArticleDraftLike({ metadata: {} })).toBe(false);
    expect(isArticleDraftLike({ blocks: [] })).toBe(false);
  });
});

describe('Error messages', () => {
  it('provides clear error messages for missing fields', () => {
    const draft = {
      metadata: {},
      blocks: [],
    };
    
    const result = validateArticleDraft(draft);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(e => e.includes('title'))).toBe(true);
      expect(result.errors.some(e => e.includes('slug'))).toBe(true);
    }
  });

  it('includes field path in error messages', () => {
    const draft = {
      metadata: {
        title: 'Test',
        slug: 'test',
      },
      blocks: [
        { type: 'image', src: 'bad-url' },
      ],
    };
    
    const result = validateArticleDraft(draft);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toContain('blocks.0');
      expect(result.errors[0]).toContain('src');
    }
  });

  it('provides helpful messages for invalid formats', () => {
    const metadata = {
      title: 'Test',
      slug: 'Invalid Slug!',
    };
    
    const result = validateMetadata(metadata);
    expect(result.success).toBe(false);
    if (!result.success) {
      const error = result.errors[0];
      expect(error.toLowerCase()).toMatch(/lowercase|hyphen/);
    }
  });
});
