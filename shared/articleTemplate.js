/**
 * Shared article rendering helpers used by the Node exporter and the browser preview.
 */

/** @typedef {{ type: string, [key: string]: any }} ArticleBlock */

export function renderBlocks(blocks = []) {
  if (!Array.isArray(blocks) || !blocks.length) {
    return '';
  }

  return blocks
    .map((block) => {
      if (!block || typeof block !== 'object') {return '';}
      switch (block.type) {
        case 'heading':
          return renderHeading(block);
        case 'list':
          return renderList(block);
        case 'quote':
          return renderQuote(block);
        case 'code':
          return renderCode(block);
        case 'image':
          return renderImage(block);
        case 'embed':
          return renderEmbed(block);
        case 'note':
          return `<aside>${escapeHtml(block.text || block.content || '')}</aside>`;
        case 'paragraph':
        default:
          return `<p>${formatText(block.text || block.content || '')}</p>`;
      }
    })
    .filter(Boolean)
    .join('\n');
}

function renderHeading(block) {
  const rawLevel = Number(block.level);
  const level = rawLevel >= 2 && rawLevel <= 4 ? rawLevel : 2;
  const tag = `h${level}`;
  return `<${tag}>${escapeHtml(block.text || '')}</${tag}>`;
}

function renderList(block) {
  const items = Array.isArray(block.items) ? block.items : [];
  if (!items.length) {return '';}
  const tag = block.style === 'ordered' ? 'ol' : 'ul';
  const listItems = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<${tag}>${listItems}</${tag}>`;
}

function renderQuote(block) {
  const text = escapeHtml(block.text || '');
  const cite = block.cite ? `<cite>${escapeHtml(block.cite)}</cite>` : '';
  return `<blockquote><p>${text}</p>${cite}</blockquote>`;
}

function renderCode(block) {
  const language = block.language ? ` class="language-${escapeHtml(block.language)}"` : '';
  const code = escapeHtml(block.code || '');
  return `<pre><code${language}>${code}</code></pre>`;
}

function renderImage(block) {
  if (!block.src) {return '';}
  const layout = escapeHtml(block.layout || 'full');
  const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
  const alt = escapeHtml(block.alt || block.caption || 'Article image');
  const src = escapeHtml(block.src);
  return `<figure class="article-image article-image--${layout}"><img src="${src}" alt="${alt}">${caption}</figure>`;
}

function renderEmbed(block) {
  if (block.html) {return String(block.html);}
  if (block.url) {
    const safe = escapeHtml(block.url);
    return `<div class="article-embed"><a href="${safe}" rel="noopener" target="_blank">${safe}</a></div>`;
  }
  return '';
}

export function buildMetaLine(metadata, publishedDate) {
  const safeDate =
    publishedDate instanceof Date ? publishedDate : new Date(publishedDate || Date.now());
  const hasValidDate = !Number.isNaN(safeDate.getTime());
  const dateText = hasValidDate
    ? safeDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Publish date pending';
  const parts = [dateText];
  if (metadata && metadata.author) {
    parts.push(`By ${metadata.author}`);
  }
  return parts.join(' — ');
}

export function buildJsonLd(metadata, canonicalUrl, baseUrl) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metadata?.title || '',
    description: metadata?.excerpt || '',
    datePublished: metadata?.published_at || new Date().toISOString(),
    dateModified: metadata?.published_at || new Date().toISOString(),
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
  };

  if (metadata?.author) {
    json.author = {
      '@type': 'Person',
      name: metadata.author,
    };
  }
  if (metadata?.hero_image) {
    json.image = [absoluteUrl(metadata.hero_image, baseUrl)];
  }
  if (metadata?.tags && metadata.tags.length) {
    json.keywords = metadata.tags.join(', ');
  }

  return JSON.stringify(json, null, 2);
}

export function absoluteUrl(resource, baseUrl) {
  if (!resource) {return baseUrl;}
  if (resource.startsWith('http://') || resource.startsWith('https://')) {
    return resource;
  }
  const trimmedBase = (baseUrl || '').replace(/index\.html$/u, '').replace(/\/+$/u, '');
  const cleanResource = resource.replace(/^\/+/, '');
  return `${trimmedBase}/${cleanResource}`;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#039;');
}

export function formatText(text) {
  return escapeHtml(text).replace(/\n/gu, '<br>');
}

export function slugify(value) {
  const slug = String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .trim();
  return slug || 'article';
}

export function normaliseTags(value) {
  if (!Array.isArray(value)) {return [];}
  const set = new Set();
  value.forEach((tag) => {
    const clean = String(tag || '').trim();
    if (clean) {set.add(clean);}
  });
  return Array.from(set);
}

export function normaliseLinks(value) {
  if (!Array.isArray(value)) {return [];}
  return value
    .map((link) => {
      if (!link || typeof link !== 'object') {return null;}
      const label = link.label != null ? String(link.label).trim() : '';
      const url = link.url != null ? String(link.url).trim() : '';
      if (!label && !url) {return null;}
      return { label, url };
    })
    .filter(Boolean);
}
