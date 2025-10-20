/**
 * Test Helpers and Utilities
 */

/**
 * Create mock draft data for testing
 */
export function createMockDraft(overrides = {}) {
  return {
    metadata: {
      title: 'Test Article',
      subtitle: 'A test subtitle',
      author: 'Test Author',
      category: 'Testing',
      tags: ['test', 'demo'],
      published_at: '2025-10-20T12:00:00.000Z',
      excerpt: 'This is a test article excerpt.',
      hero_image: 'https://example.com/hero.jpg',
      hero_caption: 'Test image caption',
      slug: 'test-article',
      links: [],
      ...overrides.metadata,
    },
    blocks: overrides.blocks || [
      {
        id: '1',
        type: 'paragraph',
        data: {
          text: 'This is a test paragraph.',
        },
      },
      {
        id: '2',
        type: 'heading',
        data: {
          text: 'Test Heading',
          level: 2,
        },
      },
    ],
    assets: overrides.assets || [],
    source: overrides.source || null,
    warnings: overrides.warnings || [],
    additionalMetadata: overrides.additionalMetadata || {},
  };
}

/**
 * Create mock block data
 */
export function createMockBlock(type, data = {}) {
  const blocks = {
    paragraph: {
      id: crypto.randomUUID?.() || Math.random().toString(36),
      type: 'paragraph',
      data: {
        text: 'Test paragraph text',
        ...data,
      },
    },
    heading: {
      id: crypto.randomUUID?.() || Math.random().toString(36),
      type: 'heading',
      data: {
        text: 'Test Heading',
        level: 2,
        ...data,
      },
    },
    image: {
      id: crypto.randomUUID?.() || Math.random().toString(36),
      type: 'image',
      data: {
        url: 'https://example.com/image.jpg',
        caption: 'Test image',
        alt: 'Test alt text',
        ...data,
      },
    },
    list: {
      id: crypto.randomUUID?.() || Math.random().toString(36),
      type: 'list',
      data: {
        style: 'unordered',
        items: ['Item 1', 'Item 2', 'Item 3'],
        ...data,
      },
    },
    quote: {
      id: crypto.randomUUID?.() || Math.random().toString(36),
      type: 'quote',
      data: {
        text: 'Test quote text',
        attribution: 'Test Author',
        ...data,
      },
    },
    code: {
      id: crypto.randomUUID?.() || Math.random().toString(36),
      type: 'code',
      data: {
        language: 'javascript',
        code: 'console.log("test");',
        ...data,
      },
    },
  };

  return blocks[type] || blocks.paragraph;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(condition, timeout = 5000, interval = 100) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Sleep for a specified time
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock fetch API
 */
export function createMockFetch(responses = {}) {
  return async (url, options = {}) => {
    const key = `${options.method || 'GET'} ${url}`;
    const response = responses[key] || responses[url];

    if (!response) {
      throw new Error(`No mock response for: ${key}`);
    }

    if (typeof response === 'function') {
      return response(url, options);
    }

    return {
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      json: async () => response.data || response,
      text: async () => JSON.stringify(response.data || response),
      headers: new Headers(response.headers || {}),
    };
  };
}

/**
 * Create temporary directory for testing
 */
export async function createTempDir(prefix = 'test-') {
  const { mkdtemp } = await import('fs/promises');
  const { tmpdir } = await import('os');
  const { join } = await import('path');

  return mkdtemp(join(tmpdir(), prefix));
}

/**
 * Clean up temporary directory
 */
export async function cleanupTempDir(dir) {
  const { rm } = await import('fs/promises');
  await rm(dir, { recursive: true, force: true });
}

/**
 * Create mock file system for testing
 */
export function createMockFS() {
  const files = new Map();

  return {
    writeFile: async (path, content) => {
      files.set(path, content);
    },
    readFile: async (path) => {
      if (!files.has(path)) {
        throw new Error(`File not found: ${path}`);
      }
      return files.get(path);
    },
    exists: async (path) => {
      return files.has(path);
    },
    mkdir: async (path) => {
      // Mock implementation
      return true;
    },
    readdir: async (path) => {
      return Array.from(files.keys())
        .filter((key) => key.startsWith(path))
        .map((key) => key.replace(path + '/', ''));
    },
    reset: () => {
      files.clear();
    },
    getFiles: () => {
      return Object.fromEntries(files);
    },
  };
}
