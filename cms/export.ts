import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Eta } from 'eta';
import { fileURLToPath } from 'url';
import {
  renderBlocks,
  buildMetaLine,
  buildJsonLd,
  absoluteUrl,
  slugify,
  normaliseTags,
  normaliseLinks,
} from '../shared/articleTemplate.js';

const DEFAULT_BASE_URL = 'https://www.jeremyrobards.com';
const eta = new Eta({ autoEscape: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_PATH = path.resolve(__dirname, '../templates/article.eta');

let templateCache: string | null = null;

async function getArticleTemplate(): Promise<string> {
  if (!templateCache) {
    templateCache = await fs.readFile(TEMPLATE_PATH, 'utf-8');
  }
  return templateCache;
}

type ParagraphBlock = { type: 'paragraph'; text: string };
type HeadingBlock = { type: 'heading'; text: string; level?: number };
type ListBlock = { type: 'list'; style?: 'ordered' | 'unordered'; items?: string[] };
type QuoteBlock = { type: 'quote'; text: string; cite?: string };
type CodeBlock = { type: 'code'; code: string; language?: string };
type ImageBlock = {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  layout?: string;
  width?: number;
  height?: number;
};
type EmbedBlock = { type: 'embed'; url?: string; html?: string };
type NoteBlock = { type: 'note'; text: string };

type ArticleBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | ImageBlock
  | EmbedBlock
  | NoteBlock;

type ArticleLink = { label?: string; url?: string };

type FeedEntry = {
  title: string;
  slug: string;
  url: string;
  hero: string | null;
  excerpt: string;
  published_at: string;
};

type ArticleMetadata = {
  title: string;
  subtitle?: string;
  author?: string;
  category?: string;
  tags: string[];
  published_at: string;
  excerpt: string;
  hero_image?: string;
  hero_caption?: string;
  links?: ArticleLink[];
  slug: string;
  [key: string]: unknown;
};

type ArticleDraft = {
  metadata: Partial<ArticleMetadata>;
  blocks: ArticleBlock[];
  assets?: unknown;
  additionalMetadata?: Record<string, unknown>;
};

type ImageWriteResult = {
  url: string;
  filePath: string;
};

export async function exportArticle(draft: ArticleDraft, outDir = './dist'): Promise<void> {
  const metadata = normaliseMetadata(draft.metadata || {});
  enforceRequiredMetadata(metadata);

  const publishedDate = new Date(metadata.published_at);
  const year = String(publishedDate.getUTCFullYear());
  const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0');
  const slug = metadata.slug;

  const articleRelDir = path.posix.join('article', year, month, slug);
  const articleRelativePath = path.posix.join(articleRelDir, 'index.html');
  const articleOutputPath = path.join(outDir, articleRelativePath);

  const baseUrl = (process.env.SITE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/u, '');
  const canonicalUrl = `${baseUrl}/${articleRelDir}/`;
  const assetDir = path.join(outDir, 'article-assets', slug);
  const assetUrlBase = path.posix.join('/article-assets', slug);
  let stylesheetHref = path.posix.relative(articleRelDir, 'css/style.css');
  if (!stylesheetHref) {
    stylesheetHref = 'css/style.css';
  }
  if (!stylesheetHref.startsWith('.')) {
    stylesheetHref = `./${stylesheetHref}`;
  }

  await fs.mkdir(path.dirname(articleOutputPath), { recursive: true });
  await fs.mkdir(assetDir, { recursive: true });

  const imageCache = new Map<string, ImageWriteResult>();
  const usedFilenames = new Set<string>();

  // Rewrite hero image first so blocks can reuse the cached reference.
  if (metadata.hero_image) {
    const rewrittenHero = await ensureImageAsset(
      metadata.hero_image,
      `${slug}-hero`,
      assetDir,
      assetUrlBase,
      imageCache,
      usedFilenames
    );
    if (rewrittenHero) {
      metadata.hero_image = rewrittenHero.url;
    }
  }

  for (const block of draft.blocks) {
    if (block.type === 'image' && block.src) {
      const rewritten = await ensureImageAsset(
        block.src,
        `${slug}-image`,
        assetDir,
        assetUrlBase,
        imageCache,
        usedFilenames
      );
      if (rewritten) {
        block.src = rewritten.url;
      }
    }
  }

  const htmlBody = renderBlocks(draft.blocks);
  const heroAlt = metadata.hero_caption || metadata.title || 'Feature hero image';
  const metaLine = buildMetaLine(metadata, publishedDate);
  const jsonLd = buildJsonLd(metadata, canonicalUrl, baseUrl);
  const articleTemplate = await getArticleTemplate();

  const renderedHtml = eta.renderString(articleTemplate, {
    title: metadata.title,
    subtitle: metadata.subtitle || '',
    description: metadata.excerpt,
    canonicalUrl,
    ogImage: metadata.hero_image ? absoluteUrl(metadata.hero_image, baseUrl) : undefined,
    publishedIso: metadata.published_at,
    tags: metadata.tags,
    jsonLd,
    category: metadata.category || '',
    metaLine,
    heroImage: metadata.hero_image || '',
    heroCaption: metadata.hero_caption || '',
    heroAlt,
    content: htmlBody,
    links: metadata.links || [],
    stylesheetHref,
  });

  if (!renderedHtml) {
    throw new Error('Failed to render article template.');
  }

  await fs.writeFile(articleOutputPath, renderedHtml, 'utf-8');

  const markdownFrontmatter = buildFrontmatter(metadata, draft.additionalMetadata || {});
  const markdownBody = blocksToMarkdown(draft.blocks);
  const markdownOutput = `---\n${markdownFrontmatter}\n---\n\n${markdownBody}`.trimEnd() + '\n';
  const archiveFileName = `${year}-${month}-${slug}.md`;
  const archivePath = path.join('articles', archiveFileName);
  await fs.mkdir(path.dirname(archivePath), { recursive: true });
  await fs.writeFile(archivePath, markdownOutput, 'utf-8');

  const feedEntry: FeedEntry = {
    title: metadata.title,
    slug,
    url: canonicalUrl,
    hero: metadata.hero_image || null,
    excerpt: metadata.excerpt,
    published_at: metadata.published_at,
  };
  const feedPath = path.join(outDir, 'article', 'feed.json');
  await updateFeed(feedPath, feedEntry);
}

export default exportArticle;

function normaliseMetadata(input: Partial<ArticleMetadata>): ArticleMetadata {
  const base: ArticleMetadata = {
    title: '',
    subtitle: '',
    author: '',
    category: '',
    tags: [],
    published_at: new Date().toISOString(),
    excerpt: '',
    hero_image: '',
    hero_caption: '',
    links: [],
    slug: '',
  };

  const merged: ArticleMetadata = {
    ...base,
    ...input,
    tags: normaliseTags(input.tags || []),
    links: normaliseLinks(input.links || []),
  };

  merged.slug = slugify(merged.slug || merged.title);
  const parsedDate = new Date(merged.published_at || new Date().toISOString());
  merged.published_at = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : parsedDate.toISOString();

  return merged;
}

function enforceRequiredMetadata(metadata: ArticleMetadata): void {
  if (!metadata.title) {
    throw new Error('Metadata.title is required.');
  }
  if (!metadata.excerpt) {
    throw new Error('Metadata.excerpt is required.');
  }
  if (!metadata.published_at) {
    throw new Error('Metadata.published_at is required.');
  }
  if (!metadata.tags || !metadata.tags.length) {
    throw new Error('Metadata.tags must include at least one tag.');
  }
}

async function ensureImageAsset(
  source: string,
  nameHint: string,
  assetDir: string,
  assetUrlBase: string,
  cache: Map<string, ImageWriteResult>,
  usedNames: Set<string>
): Promise<ImageWriteResult | null> {
  if (!source) {return null;}
  if (cache.has(source)) {
    return cache.get(source)!;
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    return null;
  }

  let buffer: Buffer | null = null;
  let extension = '';

  const dataUrlMatch = /^data:(.+?);base64,(.+)$/u.exec(source);
  if (dataUrlMatch) {
    const mime = dataUrlMatch[1];
    const base64 = dataUrlMatch[2];
    buffer = Buffer.from(base64, 'base64');
    extension = mimeToExtension(mime);
  } else {
    const resolved = path.isAbsolute(source)
      ? source
      : path.join(process.cwd(), source.replace(/^\.\//u, ''));
    try {
      const fileBuffer = await fs.readFile(resolved);
      buffer = fileBuffer;
      extension = path.extname(resolved) || '.png';
    } catch {
      return null;
    }
  }

  if (!buffer) {return null;}

  const fileName = uniqueFileName(nameHint, extension, usedNames, buffer);
  const filePath = path.join(assetDir, fileName);
  await fs.writeFile(filePath, buffer);

  const result = {
    url: path.posix.join(assetUrlBase, fileName),
    filePath,
  };
  cache.set(source, result);
  return result;
}

function mimeToExtension(mime: string): string {
  if (!mime) {return '.bin';}
  const [type, subtype] = mime.split('/');
  if (type !== 'image') {return '.bin';}
  switch (subtype) {
    case 'jpeg':
    case 'jpg':
      return '.jpg';
    case 'png':
      return '.png';
    case 'gif':
      return '.gif';
    case 'webp':
      return '.webp';
    case 'svg+xml':
      return '.svg';
    default:
      return `.${subtype}`;
  }
}

function uniqueFileName(
  hint: string,
  extension: string,
  used: Set<string>,
  buffer: Buffer
): string {
  const base = slugify(hint || 'image') || 'image';
  const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 6);
  let candidate = `${base}-${hash}${extension}`;
  let suffix = 1;
  while (used.has(candidate)) {
    candidate = `${base}-${hash}-${suffix}${extension}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

async function updateFeed(feedPath: string, entry: FeedEntry): Promise<void> {
  let feed: FeedEntry[] = [];
  try {
    const raw = await fs.readFile(feedPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      feed = parsed as FeedEntry[];
    }
  } catch {
    // Fresh feed
  }

  const existingIndex = feed.findIndex((item) => item?.slug === entry.slug);
  if (existingIndex >= 0) {
    feed[existingIndex] = entry;
  } else {
    feed.push(entry);
  }

  feed.sort((a, b) => {
    const aDate = new Date(a.published_at || 0).getTime();
    const bDate = new Date(b.published_at || 0).getTime();
    return bDate - aDate;
  });

  await fs.mkdir(path.dirname(feedPath), { recursive: true });
  await fs.writeFile(feedPath, JSON.stringify(feed, null, 2), 'utf-8');
}

function buildFrontmatter(metadata: ArticleMetadata, additional: Record<string, unknown>): string {
  const lines: string[] = [];
  const appendLine = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') {return;}
    if (Array.isArray(value) && !value.length) {return;}
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach((item) => {
        if (item === undefined || item === null) {return;}
        if (typeof item === 'object') {
          const entries = Object.entries(item as Record<string, unknown>).filter(
            ([, val]) => val !== undefined && val !== null && val !== ''
          );
          if (!entries.length) {return;}
          lines.push('  -');
          entries.forEach(([childKey, childValue]) => {
            lines.push(`    ${childKey}: ${yamlString(String(childValue))}`);
          });
        } else {
          lines.push(`  - ${yamlString(String(item))}`);
        }
      });
      return;
    }
    if (typeof value === 'object') {
      lines.push(`${key}:`);
      const objectValue = value as Record<string, unknown>;
      Object.entries(objectValue).forEach(([childKey, childValue]) => {
        if (childValue === undefined || childValue === null || childValue === '') {return;}
        lines.push(`  ${childKey}: ${yamlString(String(childValue))}`);
      });
      return;
    }
    lines.push(`${key}: ${yamlString(String(value))}`);
  };

  appendLine('title', metadata.title);
  appendLine('subtitle', metadata.subtitle);
  appendLine('author', metadata.author);
  appendLine('category', metadata.category);
  appendLine('published_at', metadata.published_at);
  appendLine('excerpt', metadata.excerpt);
  appendLine('hero_image', metadata.hero_image);
  appendLine('hero_caption', metadata.hero_caption);
  appendLine('slug', metadata.slug);
  appendLine('tags', metadata.tags);
  appendLine('links', metadata.links);

  Object.entries(additional).forEach(([key, value]) => {
    if (Object.prototype.hasOwnProperty.call(metadata, key)) {return;}
    appendLine(key, value);
  });

  return lines.join('\n');
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function blocksToMarkdown(blocks: ArticleBlock[]): string {
  const sections = blocks.map((block) => {
    switch (block.type) {
      case 'heading':
        return `${'#'.repeat(block.level && block.level >= 2 && block.level <= 6 ? block.level : 2)} ${block.text || ''}`.trim();
      case 'list':
        return formatListMarkdown(block);
      case 'quote':
        return (block.text || '')
          .split(/\n/g)
          .map((line) => `> ${line}`)
          .join('\n');
      case 'code':
        return `\n\n\u0060\u0060\u0060${block.language || ''}\n${block.code || ''}\n\u0060\u0060\u0060\n`;
      case 'image':
        return `![${block.alt || ''}](${block.src || ''})${block.caption ? `\n_${block.caption}_` : ''}`;
      case 'embed':
        return block.url || block.html || '';
      case 'note':
        return `> ${block.text || ''}`;
      case 'paragraph':
      default:
        return (block as ParagraphBlock).text || '';
    }
  });
  return sections.filter(Boolean).join('\n\n').trim();
}

function formatListMarkdown(block: ListBlock): string {
  const items = Array.isArray(block.items) ? block.items : [];
  if (!items.length) {return '';}
  if (block.style === 'ordered') {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  }
  return items.map((item) => `- ${item}`).join('\n');
}
