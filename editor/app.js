import ImportManager from './modules/importManager.js';
import BlockEditor from './modules/blockEditor.js';
import MetadataPanel from './modules/metadataPanel.js';
import Preview from './modules/preview.js';
import Store from './modules/store.js';
import Toast from './modules/toast.js';
import ImageTools from './modules/imageTools.js';

const DEFAULT_METADATA = {
  title: '',
  subtitle: '',
  author: '',
  category: '',
  tags: [],
  published_at: '',
  excerpt: '',
  hero_image: '',
  hero_caption: '',
  links: [],
  slug: '',
};

const DEFAULT_VALIDATION = { valid: false, errors: {} };

class EditorApp {
  constructor() {
    this.store = new Store();
    this.toast = new Toast(document.querySelector('[data-toast]'));
    this.imageTools = new ImageTools();

    this.elements = {
      dropzone: document.querySelector('[data-dropzone]'),
      importList: document.querySelector('[data-import-list]'),
      blockList: document.querySelector('[data-block-list]'),
      metadataForm: document.querySelector('[data-metadata-form]'),
      previewRoot: document.querySelector('[data-preview]'),
      previewStatus: document.querySelector('[data-preview-status]'),
      previewFrame: document.querySelector('[data-preview-frame]'),
      modalRoot: document.querySelector('[data-modal-root]'),
      exportButton: document.querySelector('[data-action="export"]'),
      publishButton: document.querySelector('[data-action="publish"]'),
      exportStatus: document.querySelector('[data-export-status]'),
      publishStatus: document.querySelector('[data-publish-status]'),
    };

    this.state = {
      metadata: { ...DEFAULT_METADATA },
      metadataValidation: { ...DEFAULT_VALIDATION },
      blocks: [],
      assets: [],
      additionalMetadata: {},
      source: null,
      warnings: [],
      exportStatus: null, // { route, fileCount, timestamp }
      publishStatus: null, // { url, timestamp }
    };

    this.#hydrateFromStore();
    this.#initialiseModules();
    this.#bindGlobalActions();
    this.#render();
  }

  #hydrateFromStore() {
    const cached = this.store.load();
    if (cached) {
      this.state.metadata = this.#normaliseMetadata(cached.metadata || {});
      this.state.metadataValidation = cached.metadataValidation
        ? { ...cached.metadataValidation }
        : { ...DEFAULT_VALIDATION };
      this.state.blocks = Array.isArray(cached.blocks) ? cached.blocks : [];
      this.state.assets = Array.isArray(cached.assets) ? cached.assets : [];
      this.state.additionalMetadata = cached.additionalMetadata || {};
      this.state.source = cached.source || null;
      this.state.warnings = cached.warnings || [];
      this.state.exportStatus = cached.exportStatus || null;
      this.state.publishStatus = cached.publishStatus || null;
    }
  }

  #initialiseModules() {
    this.metadataPanel = new MetadataPanel(this.elements.metadataForm, {
      onChange: (metadata, validation) => {
        this.state.metadata = this.#normaliseMetadata(metadata);
        this.state.metadataValidation = validation || { ...DEFAULT_VALIDATION };
        this.#persist();
        this.#renderPreview();
        this.#updateButtonStates();
      },
    });
    this.metadataPanel.setMetadata(this.state.metadata);
    this.metadataPanel.updateContent(this.state.blocks);
    const initialMetadata = this.metadataPanel.getMetadata();
    this.state.metadata = this.#normaliseMetadata(initialMetadata);
    this.state.metadataValidation = this.metadataPanel.validation;

    this.blockEditor = new BlockEditor(this.elements.blockList, {
      onChange: (blocks) => {
        this.state.blocks = blocks;
        this.metadataPanel.updateContent(blocks);
        this.#persist();
        this.#renderPreview();
      },
      toast: this.toast,
      imageTools: this.imageTools,
      getMetadata: () => this.state.metadata,
    });
    this.blockEditor.loadBlocks(this.state.blocks);

    this.preview = new Preview({
      root: this.elements.previewRoot,
      status: this.elements.previewStatus,
      frame: this.elements.previewFrame,
    });

    this.importManager = new ImportManager({
      dropzoneEl: this.elements.dropzone,
      listEl: this.elements.importList,
      toast: this.toast,
      modalRoot: this.elements.modalRoot,
      onImport: (payload) => this.#handleImport(payload),
    });
  }

  #bindGlobalActions() {
    document.addEventListener('click', (event) => {
      const action = event.target?.dataset?.action;
      if (!action) {return;}
      event.preventDefault();
      this.#handleAction(action);
    });

    // Keyboard shortcuts for UX review tools
    document.addEventListener('keydown', (event) => {
      // Only trigger if Ctrl/Cmd is pressed
      if (!event.ctrlKey && !event.metaKey) {return;}

      // Don't trigger in input fields
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          this.#handleAction('toggle-review-mode');
          break;
        case 'a':
          event.preventDefault();
          this.#handleAction('run-a11y-check');
          break;
        case 'u':
          event.preventDefault();
          this.#handleAction('toggle-ux-checklist');
          break;
        case 'f':
          event.preventDefault();
          this.#handleAction('toggle-feedback');
          break;
        default:
          break;
      }
    });

    window.addEventListener('beforeunload', () => this.#persist());
  }

  #handleAction(action) {
    switch (action) {
      case 'add-paragraph':
        this.blockEditor.addBlock('paragraph');
        break;
      case 'add-heading':
        this.blockEditor.addBlock('heading');
        break;
      case 'add-list':
        this.blockEditor.addBlock('list');
        break;
      case 'add-quote':
        this.blockEditor.addBlock('quote');
        break;
      case 'add-code':
        this.blockEditor.addBlock('code');
        break;
      case 'add-embed':
        this.blockEditor.addBlock('embed');
        break;
      case 'add-image':
        this.blockEditor.addImageBlock();
        break;
      case 'clear-draft':
        this.#clearDraft();
        break;
      case 'export':
        this.#exportDraft();
        break;
      case 'publish':
        this.#publishDraft();
        break;
      default:
        break;
    }
  }

  #handleImport(draft) {
    if (!draft) {return;}
    const {
      metadata = {},
      blocks = [],
      assets = [],
      additionalMetadata = {},
      source = null,
      warnings = [],
    } = draft;

    const incomingMetadata = this.#normaliseMetadata(metadata, this.state.metadata);
    this.metadataPanel.setMetadata(incomingMetadata);
    const syncedMetadata = this.metadataPanel.getMetadata();
    this.state.metadata = this.#normaliseMetadata(syncedMetadata);
    this.state.metadataValidation = this.metadataPanel.validation || { ...DEFAULT_VALIDATION };

    this.state.blocks = Array.isArray(blocks) ? blocks : [];
    this.blockEditor.loadBlocks(this.state.blocks);

    this.state.assets = Array.isArray(assets) ? assets : [];
    this.state.additionalMetadata = { ...additionalMetadata };
    this.state.source = source;
    this.state.warnings = warnings;

    this.#persist();
    this.#renderPreview();
    this.metadataPanel.updateContent(this.state.blocks);

    if (warnings?.length) {
      this.toast.show(warnings[0]);
    }
  }

  #render() {
    this.#renderPreview();
    this.#updateButtonStates();
    this.#renderExportStatus();
    this.#renderPublishStatus();
  }

  #renderPreview() {
    this.preview.render({
      metadata: this.state.metadata,
      blocks: this.state.blocks,
    });
  }

  #normaliseMetadata(metadata = {}, fallback = this.state.metadata || DEFAULT_METADATA) {
    const base = { ...DEFAULT_METADATA, ...(fallback || {}) };
    const source = metadata || {};
    const result = { ...base };

    if (source.title !== undefined) {result.title = this.#asString(source.title);}
    if (source.subtitle !== undefined) {result.subtitle = this.#asString(source.subtitle);}
    if (source.author !== undefined) {result.author = this.#asString(source.author ?? source.byline);}
    if (source.byline !== undefined && !source.author)
      {result.author = this.#asString(source.byline);}
    if (source.category !== undefined) {result.category = this.#asString(source.category);}

    const excerptSource =
      source.excerpt !== undefined
        ? source.excerpt
        : source.description !== undefined
          ? source.description
          : source.summary;
    if (excerptSource !== undefined) {
      result.excerpt = this.#asString(excerptSource);
    }

    const heroImageSource = source.hero_image ?? source.heroImage;
    if (heroImageSource !== undefined) {
      result.hero_image = this.#asString(heroImageSource);
    }

    const heroCaptionSource = source.hero_caption ?? source.heroCaption;
    if (heroCaptionSource !== undefined) {
      result.hero_caption = this.#asString(heroCaptionSource);
    }

    const publishedSource =
      source.published_at !== undefined
        ? source.published_at
        : source.publishDate !== undefined
          ? source.publishDate
          : source.publishedAt !== undefined
            ? source.publishedAt
            : source.date;
    if (publishedSource !== undefined) {
      result.published_at = this.#normaliseDate(publishedSource);
    }

    result.tags = this.#normaliseTags(source.tags !== undefined ? source.tags : base.tags);
    result.links = this.#normaliseLinks(source.links !== undefined ? source.links : base.links);

    if (source.slug !== undefined) {
      result.slug = this.#slugify(source.slug);
    } else if (!result.slug && result.title) {
      result.slug = this.#slugify(result.title);
    }

    if (!Array.isArray(result.tags)) {result.tags = [];}
    if (!Array.isArray(result.links)) {result.links = [];}
    if (!result.published_at) {result.published_at = '';}

    return result;
  }

  #normaliseTags(value) {
    const source = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(/[;,\n]/)
        : [];
    const deduped = [];
    source
      .map((item) => this.#asString(item))
      .filter(Boolean)
      .forEach((tag) => {
        if (!deduped.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
          deduped.push(tag);
        }
      });
    return deduped;
  }

  #normaliseLinks(value) {
    if (!value) {return [];}
    if (Array.isArray(value)) {
      return value
        .map((entry) => {
          if (!entry) {return null;}
          if (typeof entry === 'string') {
            const label = this.#asString(entry);
            return label ? { label, url: '' } : null;
          }
          if (typeof entry === 'object') {
            const label = this.#asString(entry.label ?? entry.title ?? entry.name);
            const url = this.#asString(entry.url ?? entry.href ?? entry.link);
            if (!label && !url) {return null;}
            return { label, url };
          }
          return null;
        })
        .filter(Boolean);
    }
    if (typeof value === 'object') {
      return Object.entries(value)
        .map(([label, url]) => {
          const cleanLabel = this.#asString(label);
          const cleanUrl = this.#asString(url);
          if (!cleanLabel && !cleanUrl) {return null;}
          return { label: cleanLabel, url: cleanUrl };
        })
        .filter(Boolean);
    }
    if (typeof value === 'string') {
      const label = this.#asString(value);
      return label ? [{ label, url: '' }] : [];
    }
    return [];
  }

  #normaliseDate(value) {
    if (!value) {return '';}
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {return '';}
    return date.toISOString();
  }

  #asString(value) {
    if (value === undefined || value === null) {return '';}
    return String(value).trim();
  }

  #slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  #persist() {
    this.store.save(this.state);
    this.#scheduleAutoSave();
  }

  #scheduleAutoSave() {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    // Auto-save after 2 seconds of inactivity
    this.autoSaveTimeout = setTimeout(() => {
      this.toast.show('💾 Draft auto-saved', 2000);
    }, 2000);
  }

  #clearDraft() {
    if (!confirm('Clear all draft data? This cannot be undone.')) {
      return;
    }

    // Clear localStorage
    this.store.clear();

    // Reset state to defaults
    this.state = {
      metadata: { ...DEFAULT_METADATA },
      metadataValidation: { ...DEFAULT_VALIDATION },
      blocks: [],
      assets: [],
      additionalMetadata: {},
      source: null,
      warnings: [],
      exportStatus: null,
      publishStatus: null,
    };

    // Clear UI
    this.metadataPanel.setMetadata(this.state.metadata);
    this.blockEditor.loadBlocks([]);
    this.#renderPreview();
    this.#updateButtonStates();
    this.#renderExportStatus();
    this.#renderPublishStatus();

    this.toast.show('✅ Draft cleared successfully');
  }

  async #exportDraft() {
    // Validate required metadata before export
    if (!this.state.metadataValidation.valid) {
      this.toast.show('⚠️ Please fix validation errors before exporting.');
      return;
    }

    // Disable export button during operation
    if (this.elements.exportButton) {
      this.elements.exportButton.disabled = true;
    }

    const payload = {
      metadata: { ...this.state.metadata, ...this.state.additionalMetadata },
      blocks: this.state.blocks,
      assets: this.state.assets,
      source: this.state.source,
      warnings: this.state.warnings,
      additionalMetadata: this.state.additionalMetadata,
      exportedAt: new Date().toISOString(),
    };

    this.toast.show('📦 Exporting article...');

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Export failed: ${response.status}`);
      }

      // Extract export details from response
      const { path, fileCount } = result.data;
      const route = path || result.data.route || 'unknown';

      // Update export status
      this.state.exportStatus = {
        route: route,
        fileCount: fileCount || 1,
        timestamp: new Date().toISOString(),
      };

      this.#persist();
      this.#updateButtonStates();

      // Show success message with details
      const fileText = fileCount ? ` (${fileCount} file${fileCount !== 1 ? 's' : ''})` : '';
      this.toast.show(`✅ Exported to /dist/${route}${fileText}`);

      // Update status UI
      this.#renderExportStatus();

      console.log('Export result:', result);
    } catch (error) {
      console.error('Export error:', error);
      this.toast.show(`❌ Export failed: ${error.message}`);
    } finally {
      // Re-enable export button
      if (this.elements.exportButton) {
        this.elements.exportButton.disabled = false;
      }
    }
  }

  async #publishDraft() {
    // Check if metadata is valid
    if (!this.state.metadataValidation.valid) {
      this.toast.show('⚠️ Please fix validation errors before publishing.');
      return;
    }

    // Check if export has been run
    if (!this.state.exportStatus) {
      this.toast.show('⚠️ Please export the article first before publishing.');
      return;
    }

    // Confirm publish action
    if (!confirm('Deploy to Cloudflare Pages? This will make your article live.')) {
      return;
    }

    // Disable publish button during operation
    if (this.elements.publishButton) {
      this.elements.publishButton.disabled = true;
    }

    this.toast.show('🚀 Publishing to Cloudflare Pages...');

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outDir: './dist' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Publish failed: ${response.status}`);
      }

      const { url, count, size, duration } = result.data;
      const sizeKB = (size / 1024).toFixed(2);
      const durationSec = (duration / 1000).toFixed(2);

      // Update publish status
      this.state.publishStatus = {
        url: url,
        timestamp: new Date().toISOString(),
      };

      this.#persist();
      this.#updateButtonStates();

      // Show success message
      this.toast.show(`✅ Published! ${count} files (${sizeKB} KB) in ${durationSec}s`);

      // Update status UI and render "View live" link
      this.#renderPublishStatus();

      console.log('Publish result:', result);

      // Show deployment URL
      if (url) {
        setTimeout(() => {
          if (confirm(`Open deployment?\n${url}`)) {
            window.open(url, '_blank');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Publish error:', error);
      this.toast.show(`❌ Publish failed: ${error.message}`);

      if (error.message.includes('wrangler')) {
        setTimeout(() => {
          this.toast.show('💡 Install wrangler: npm install -g wrangler');
        }, 3000);
      }
    } finally {
      // Re-enable publish button
      if (this.elements.publishButton) {
        this.elements.publishButton.disabled = false;
      }
    }
  }

  /**
   * Update button states based on validation and export status
   */
  #updateButtonStates() {
    const hasValidMetadata = this.state.metadataValidation.valid;
    const hasExported = !!this.state.exportStatus;

    // Export button: disabled if metadata invalid
    if (this.elements.exportButton) {
      this.elements.exportButton.disabled = !hasValidMetadata;
      this.elements.exportButton.title = hasValidMetadata
        ? 'Export article to /dist'
        : 'Fix validation errors first';
    }

    // Publish button: disabled if metadata invalid OR not exported yet
    if (this.elements.publishButton) {
      this.elements.publishButton.disabled = !hasValidMetadata || !hasExported;

      let title = 'Publish to Cloudflare Pages';
      if (!hasValidMetadata) {
        title = 'Fix validation errors first';
      } else if (!hasExported) {
        title = 'Export article first';
      }
      this.elements.publishButton.title = title;
    }
  }

  /**
   * Render export status UI
   */
  #renderExportStatus() {
    if (!this.elements.exportStatus) {return;}

    if (this.state.exportStatus) {
      const { route, fileCount, timestamp } = this.state.exportStatus;
      const timeAgo = this.#formatTimeAgo(timestamp);

      const fileText = fileCount > 1 ? `${fileCount} files` : '1 file';

      this.elements.exportStatus.innerHTML = `
				<div class="status-badge status-badge--success">
					<span class="status-badge__icon">✅</span>
					<div class="status-badge__content">
						<strong>Exported ${timeAgo}</strong>
						<small>${fileText} → /dist/${route}</small>
					</div>
				</div>
			`;
      this.elements.exportStatus.hidden = false;
    } else {
      this.elements.exportStatus.innerHTML = '';
      this.elements.exportStatus.hidden = true;
    }
  }

  /**
   * Render publish status UI with "View live" link
   */
  #renderPublishStatus() {
    if (!this.elements.publishStatus) {return;}

    if (this.state.publishStatus && this.state.exportStatus) {
      const { url, timestamp } = this.state.publishStatus;
      const { route } = this.state.exportStatus;
      const timeAgo = this.#formatTimeAgo(timestamp);

      // Build article URL based on route
      const articlePath = route.replace(/^article\//, ''); // Remove 'article/' prefix if present
      const articleUrl = url.includes('pages.dev')
        ? `${url}/article/${articlePath}`
        : `${url}/article/${articlePath}`;

      this.elements.publishStatus.innerHTML = `
				<div class="status-badge status-badge--info">
					<span class="status-badge__icon">🚀</span>
					<div class="status-badge__content">
						<strong>Published ${timeAgo}</strong>
						<small>
							<a href="${articleUrl}" target="_blank" rel="noopener noreferrer" class="status-badge__link">
								View live article →
							</a>
						</small>
					</div>
				</div>
			`;
      this.elements.publishStatus.hidden = false;
    } else {
      this.elements.publishStatus.innerHTML = '';
      this.elements.publishStatus.hidden = true;
    }
  }

  /**
   * Format timestamp as relative time (e.g., "2 minutes ago")
   */
  #formatTimeAgo(timestamp) {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diffMs = now - time;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {return 'just now';}
    if (diffMin < 60) {return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;}
    if (diffHour < 24) {return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;}
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new EditorApp();
});
