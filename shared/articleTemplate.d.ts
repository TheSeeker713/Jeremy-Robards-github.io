export type ParagraphBlock = { type: "paragraph"; text?: string };
export type HeadingBlock = { type: "heading"; text?: string; level?: number };
export type ListBlock = { type: "list"; style?: "ordered" | "unordered"; items?: string[] };
export type QuoteBlock = { type: "quote"; text?: string; cite?: string };
export type CodeBlock = { type: "code"; code?: string; language?: string };
export type ImageBlock = {
  type: "image";
  src?: string;
  alt?: string;
  caption?: string;
  layout?: string;
  width?: number;
  height?: number;
};
export type EmbedBlock = { type: "embed"; url?: string; html?: string };
export type NoteBlock = { type: "note"; text?: string };

export type ArticleBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | QuoteBlock
  | CodeBlock
  | ImageBlock
  | EmbedBlock
  | NoteBlock;

export type ArticleLink = { label?: string; url?: string };

export interface ArticleMetadata {
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
}

export function renderBlocks(blocks?: ArticleBlock[]): string;
export function buildMetaLine(metadata: Partial<ArticleMetadata>, publishedDate: Date): string;
export function buildJsonLd(metadata: Partial<ArticleMetadata>, canonicalUrl: string, baseUrl: string): string;
export function absoluteUrl(resource: string, baseUrl: string): string;
export function escapeHtml(value: string): string;
export function formatText(text: string): string;
export function slugify(value: string): string;
export function normaliseTags(value: string[] | undefined): string[];
export function normaliseLinks(value: ArticleLink[] | undefined): ArticleLink[];
