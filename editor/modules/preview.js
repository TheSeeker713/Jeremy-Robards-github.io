import { Eta } from '../vendor/eta.browser.mjs';
import {
  renderBlocks,
  buildMetaLine,
  buildJsonLd,
  absoluteUrl,
  slugify,
} from '../../shared/articleTemplate.js';

const TEMPLATE_URL = '../../templates/article.eta';

const DEFAULT_STATE = {
  metadata: {
    title: 'Untitled Feature Story',
    subtitle: '',
    excerpt: 'Add an excerpt to see the standfirst.',
    published_at: '',
    category: 'Feature',
    author: '',
    tags: [],
    hero_image: '',
    hero_caption: '',
    links: [],
  },
  blocks: [
    {
      type: 'paragraph',
      text: 'Start writing to see the live preview update instantly.',
    },
  ],
};

export default class Preview {
  constructor({ root, frame, status }) {
    this.root = root;
    this.frame = frame;
    this.status = status;
    this.eta = new Eta({ autoEscape: true });
    this.templatePromise = null;
    this.templateCache = null;
    this.latestState = DEFAULT_STATE;
    this.renderToken = 0;

    if (this.frame) {
      this.frame.classList.add('is-loading');
    }
  }

  render(state = DEFAULT_STATE) {
    const token = ++this.renderToken;
    this.latestState = {
      metadata: { ...DEFAULT_STATE.metadata, ...(state.metadata || {}) },
      blocks: Array.isArray(state.blocks) ? state.blocks : DEFAULT_STATE.blocks,
    };

    this.#showStatus('Rendering preview…');
    this.#renderAsync(token).catch((error) => {
      console.error('Preview render failed:', error);
      this.#showStatus('Preview unavailable. Check console for details.');
    });
  }

  async #renderAsync(token) {
    if (!this.frame || !this.eta) {
      this.#showStatus('Preview disabled in this environment.');
      return;
    }

    if (this.frame) {
      this.frame.classList.add('is-loading');
    }

    const template = await this.#loadTemplate();
    if (!template) {
      this.#showStatus('Unable to load preview template.');
      return;
    }

    if (token !== this.renderToken) {
      return;
    }

    const metadata = this.latestState.metadata;
    const blocks = this.latestState.blocks;
    const htmlBody = renderBlocks(blocks) || '<p>Start writing to see your article take shape.</p>';

    const { baseUrl, canonicalUrl, publishedIso, stylesheetHref } = this.#deriveCanonical(metadata);
    const publishedDate = new Date(publishedIso);
    const metaLine = buildMetaLine(metadata, publishedDate);
    const jsonLd = buildJsonLd({ ...metadata, published_at: publishedIso }, canonicalUrl, baseUrl);

    const rendered = this.eta.renderString(template, {
      title: metadata.title || DEFAULT_STATE.metadata.title,
      subtitle: metadata.subtitle || '',
      description: metadata.excerpt || DEFAULT_STATE.metadata.excerpt,
      canonicalUrl,
      ogImage: metadata.hero_image ? absoluteUrl(metadata.hero_image, baseUrl) : undefined,
      publishedIso,
      tags: metadata.tags || [],
      jsonLd,
      category: metadata.category || '',
      metaLine,
      heroImage: metadata.hero_image || '',
      heroCaption: metadata.hero_caption || '',
      heroAlt: metadata.hero_caption || metadata.title || 'Feature hero image',
      content: htmlBody,
      links: metadata.links || [],
      stylesheetHref,
    });

    if (token !== this.renderToken) {
      return;
    }

    this.#writeToFrame(rendered);
    this.#hideStatus();
  }

  async #loadTemplate() {
    if (this.templateCache) {return this.templateCache;}
    if (!this.templatePromise) {
      this.templatePromise = fetch(TEMPLATE_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status}`);
          }
          return response.text();
        })
        .then((text) => {
          this.templateCache = text;
          return text;
        })
        .catch((error) => {
          console.error('Failed to load article template:', error);
          this.templateCache = null;
          return null;
        });
    }
    return this.templatePromise;
  }

  #deriveCanonical(metadata) {
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
    const defaultBase = origin && origin !== 'null' ? origin : 'https://preview.local';
    const baseUrl = defaultBase.replace(/\/$/, '');
    const slugSource = metadata.slug || metadata.title || 'preview';
    const slug = slugify(slugSource || 'preview');
    const canonicalUrl = `${baseUrl}/preview/${slug}`;

    const parsedDate = metadata.published_at ? new Date(metadata.published_at) : new Date();
    const publishedIso = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    const stylesheetHref = '../css/style.css';

    return { baseUrl, canonicalUrl, publishedIso, stylesheetHref };
  }

  #writeToFrame(html) {
    if (!this.frame) {return;}
    const doc = this.frame.contentDocument;
    if (!doc) {return;}

    this.frame.classList.add('is-loading');
    doc.open();
    doc.write(html);
    doc.close();

    requestAnimationFrame(() => {
      const height = doc.documentElement?.scrollHeight || doc.body?.scrollHeight || 960;
      this.frame.style.height = `${Math.max(height, 720)}px`;
      this.frame.classList.remove('is-loading');
    });
  }

  #showStatus(message) {
    if (!this.status) {return;}
    this.status.textContent = message;
    this.status.hidden = false;
    if (this.frame) {
      this.frame.classList.remove('is-loading');
    }
  }

  #hideStatus() {
    if (!this.status) {return;}
    this.status.hidden = true;
  }
}
