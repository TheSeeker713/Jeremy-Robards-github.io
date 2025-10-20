/**
 * Article Schema Validation
 * 
 * Provides runtime type checking for ArticleDraft and related types
 * using Zod schemas. Ensures data integrity and provides clear error
 * messages when required fields are missing.
 * 
 * @module shared/articleSchema
 */

import { z } from 'zod';

// ============================================================================
// Block Schemas
// ============================================================================

const ParagraphBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('paragraph'),
  text: z.string().default(''),
});

const HeadingBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('heading'),
  text: z.string().default(''),
  level: z.number().int().min(2).max(6).default(2),
});

const ListBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('list'),
  style: z.enum(['ordered', 'unordered']).default('unordered'),
  items: z.array(z.string()).default([]),
});

const QuoteBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('quote'),
  text: z.string().default(''),
  cite: z.string().optional(),
});

const CodeBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('code'),
  code: z.string().default(''),
  language: z.string().optional(),
});

const ImageBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('image'),
  src: z.string().url('Image src must be a valid URL'),
  alt: z.string().optional(),
  caption: z.string().optional(),
  layout: z.enum(['full', 'left', 'right', 'gallery']).default('full'),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

const EmbedBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('embed'),
  url: z.string().url('Embed URL must be valid').optional(),
  html: z.string().optional(),
});

const NoteBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.literal('note'),
  text: z.string().default(''),
});

/**
 * Union of all block types
 */
export const ArticleBlockSchema = z.discriminatedUnion('type', [
  ParagraphBlockSchema,
  HeadingBlockSchema,
  ListBlockSchema,
  QuoteBlockSchema,
  CodeBlockSchema,
  ImageBlockSchema,
  EmbedBlockSchema,
  NoteBlockSchema,
]);

// ============================================================================
// Article Link Schema
// ============================================================================

export const ArticleLinkSchema = z.object({
  label: z.string().optional(),
  url: z.string().url('Link URL must be valid').optional(),
});

// ============================================================================
// Article Metadata Schema
// ============================================================================

export const ArticleMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  excerpt: z.string().optional(),
  hero: z.string().url('Hero image must be a valid URL').optional(),
  date: z.coerce.date().default(() => new Date()),
  published: z.boolean().default(false),
  links: z.array(ArticleLinkSchema).default([]),
});

// ============================================================================
// Article Draft Schema
// ============================================================================

export const ArticleDraftSchema = z.object({
  metadata: ArticleMetadataSchema,
  blocks: z.array(ArticleBlockSchema).default([]),
});

// ============================================================================
// Type Definitions (JSDoc for IDE support)
// ============================================================================

/**
 * @typedef {object} ParagraphBlock
 * @property {string} [id]
 * @property {'paragraph'} type
 * @property {string} text
 */

/**
 * @typedef {object} HeadingBlock
 * @property {string} [id]
 * @property {'heading'} type
 * @property {string} text
 * @property {number} level
 */

/**
 * @typedef {object} ListBlock
 * @property {string} [id]
 * @property {'list'} type
 * @property {'ordered' | 'unordered'} style
 * @property {string[]} items
 */

/**
 * @typedef {object} QuoteBlock
 * @property {string} [id]
 * @property {'quote'} type
 * @property {string} text
 * @property {string} [cite]
 */

/**
 * @typedef {object} CodeBlock
 * @property {string} [id]
 * @property {'code'} type
 * @property {string} code
 * @property {string} [language]
 */

/**
 * @typedef {object} ImageBlock
 * @property {string} [id]
 * @property {'image'} type
 * @property {string} src
 * @property {string} [alt]
 * @property {string} [caption]
 * @property {'full' | 'left' | 'right' | 'gallery'} layout
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {object} EmbedBlock
 * @property {string} [id]
 * @property {'embed'} type
 * @property {string} [url]
 * @property {string} [html]
 */

/**
 * @typedef {object} NoteBlock
 * @property {string} [id]
 * @property {'note'} type
 * @property {string} text
 */

/**
 * @typedef {ParagraphBlock | HeadingBlock | ListBlock | QuoteBlock | CodeBlock | ImageBlock | EmbedBlock | NoteBlock} ArticleBlock
 */

/**
 * @typedef {object} ArticleLink
 * @property {string} [label]
 * @property {string} [url]
 */

/**
 * @typedef {object} ArticleMetadata
 * @property {string} title
 * @property {string} [subtitle]
 * @property {string} slug
 * @property {string} [author]
 * @property {string} [category]
 * @property {string[]} tags
 * @property {string} [excerpt]
 * @property {string} [hero]
 * @property {Date} date
 * @property {boolean} published
 * @property {ArticleLink[]} links
 */

/**
 * @typedef {object} ArticleDraft
 * @property {ArticleMetadata} metadata
 * @property {ArticleBlock[]} blocks
 */

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate an article draft and return parsed data or errors
 * 
 * @param {unknown} data - Data to validate
 * @returns {{ success: true, data: ArticleDraft } | { success: false, errors: string[] }}
 * 
 * @example
 * const result = validateArticleDraft(rawData);
 * if (!result.success) {
 *   console.error('Validation failed:', result.errors);
 *   return;
 * }
 * const draft = result.data;
 */
export function validateArticleDraft(data) {
  const result = ArticleDraftSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format errors into human-readable messages
  const errors = result.error?.issues?.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  }) || ['Unknown validation error'];
  
  return { success: false, errors };
}

/**
 * Validate article metadata
 * 
 * @param {unknown} data - Metadata to validate
 * @returns {{ success: true, data: ArticleMetadata } | { success: false, errors: string[] }}
 */
export function validateMetadata(data) {
  const result = ArticleMetadataSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error?.issues?.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  }) || ['Unknown validation error'];
  
  return { success: false, errors };
}

/**
 * Validate a single block
 * 
 * @param {unknown} data - Block to validate
 * @returns {{ success: true, data: ArticleBlock } | { success: false, errors: string[] }}
 */
export function validateBlock(data) {
  const result = ArticleBlockSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error?.issues?.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  }) || ['Unknown validation error'];
  
  return { success: false, errors };
}

/**
 * Validate array of blocks
 * 
 * @param {unknown} data - Blocks array to validate
 * @returns {{ success: true, data: ArticleBlock[] } | { success: false, errors: string[] }}
 */
export function validateBlocks(data) {
  const schema = z.array(ArticleBlockSchema);
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error?.issues?.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  }) || ['Unknown validation error'];
  
  return { success: false, errors };
}

// ============================================================================
// Assertion Functions (throw on error)
// ============================================================================

/**
 * Assert that data is a valid ArticleDraft (throws on error)
 * 
 * @param {unknown} data - Data to validate
 * @returns {ArticleDraft} Validated draft
 * @throws {Error} If validation fails
 * 
 * @example
 * try {
 *   const draft = assertArticleDraft(rawData);
 *   // draft is guaranteed to be valid here
 * } catch (error) {
 *   console.error(error.message); // Clear validation error
 * }
 */
export function assertArticleDraft(data) {
  try {
    return ArticleDraftSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues?.map((err) => `${err.path.join('.')}: ${err.message}`) || [];
      throw new Error(`Article draft validation failed:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Assert that data is valid ArticleMetadata (throws on error)
 * 
 * @param {unknown} data - Data to validate
 * @returns {ArticleMetadata} Validated metadata
 * @throws {Error} If validation fails
 */
export function assertMetadata(data) {
  try {
    return ArticleMetadataSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues?.map((err) => `${err.path.join('.')}: ${err.message}`) || [];
      throw new Error(`Metadata validation failed:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Assert that data is a valid ArticleBlock (throws on error)
 * 
 * @param {unknown} data - Data to validate
 * @returns {ArticleBlock} Validated block
 * @throws {Error} If validation fails
 */
export function assertBlock(data) {
  try {
    return ArticleBlockSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues?.map((err) => `${err.path.join('.')}: ${err.message}`) || [];
      throw new Error(`Block validation failed:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

// ============================================================================
// Partial Validation (for updates)
// ============================================================================

/**
 * Partial metadata schema for updates (all fields optional)
 */
export const PartialMetadataSchema = ArticleMetadataSchema.partial();

/**
 * Validate partial metadata update
 * 
 * @param {unknown} data - Partial metadata to validate
 * @returns {{ success: true, data: Partial<ArticleMetadata> } | { success: false, errors: string[] }}
 */
export function validatePartialMetadata(data) {
  const result = PartialMetadataSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error?.issues?.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  }) || ['Unknown validation error'];
  
  return { success: false, errors };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if data looks like a valid article draft (basic check)
 * 
 * @param {unknown} data - Data to check
 * @returns {boolean} True if data has required shape
 */
export function isArticleDraftLike(data) {
  return (
    data !== null &&
    typeof data === 'object' &&
    'metadata' in data &&
    'blocks' in data &&
    typeof data.metadata === 'object' &&
    Array.isArray(data.blocks)
  );
}

/**
 * Get human-readable field name for error messages
 * 
 * @param {string} path - Field path (e.g., "metadata.title")
 * @returns {string} Human-readable name
 */
export function getFieldName(path) {
  const names = {
    'metadata.title': 'Article Title',
    'metadata.slug': 'URL Slug',
    'metadata.hero': 'Hero Image',
    'metadata.excerpt': 'Excerpt',
    'metadata.tags': 'Tags',
    'blocks': 'Content Blocks',
  };
  return names[path] || path;
}
