import ImportManager from "./modules/importManager.js";
import BlockEditor from "./modules/blockEditor.js";
import MetadataPanel from "./modules/metadataPanel.js";
import Preview from "./modules/preview.js";
import Store from "./modules/store.js";
import Toast from "./modules/toast.js";
import ImageTools from "./modules/imageTools.js";

const DEFAULT_METADATA = {
	title: "",
	subtitle: "",
	author: "",
	category: "",
	tags: [],
	published_at: "",
	excerpt: "",
	hero_image: "",
	hero_caption: "",
	links: [],
	slug: ""
};

const DEFAULT_VALIDATION = { valid: false, errors: {} };

class EditorApp {
	constructor() {
		this.store = new Store();
		this.toast = new Toast(document.querySelector("[data-toast]"));
		this.imageTools = new ImageTools();

		this.elements = {
			dropzone: document.querySelector("[data-dropzone]"),
			importList: document.querySelector("[data-import-list]"),
			blockList: document.querySelector("[data-block-list]"),
			metadataForm: document.querySelector("[data-metadata-form]"),
			previewRoot: document.querySelector("[data-preview]"),
			previewStatus: document.querySelector("[data-preview-status]"),
			previewFrame: document.querySelector("[data-preview-frame]"),
			modalRoot: document.querySelector("[data-modal-root]")
		};

		this.state = {
			metadata: { ...DEFAULT_METADATA },
			metadataValidation: { ...DEFAULT_VALIDATION },
			blocks: [],
			assets: [],
			additionalMetadata: {},
			source: null,
			warnings: []
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
		}
	}

	#initialiseModules() {
		this.metadataPanel = new MetadataPanel(this.elements.metadataForm, {
			onChange: (metadata, validation) => {
				this.state.metadata = this.#normaliseMetadata(metadata);
				this.state.metadataValidation = validation || { ...DEFAULT_VALIDATION };
				this.#persist();
				this.#renderPreview();
			}
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
			imageTools: this.imageTools
		});
		this.blockEditor.loadBlocks(this.state.blocks);

		this.preview = new Preview({
			root: this.elements.previewRoot,
			status: this.elements.previewStatus,
			frame: this.elements.previewFrame
		});

		this.importManager = new ImportManager({
			dropzoneEl: this.elements.dropzone,
			listEl: this.elements.importList,
			toast: this.toast,
			modalRoot: this.elements.modalRoot,
			onImport: (payload) => this.#handleImport(payload)
		});
	}

	#bindGlobalActions() {
		document.addEventListener("click", (event) => {
			const action = event.target?.dataset?.action;
			if (!action) return;
			event.preventDefault();
			this.#handleAction(action);
		});

		window.addEventListener("beforeunload", () => this.#persist());
	}

	#handleAction(action) {
		switch (action) {
			case "add-paragraph":
				this.blockEditor.addBlock("paragraph");
				break;
			case "add-heading":
				this.blockEditor.addBlock("heading");
				break;
			case "add-list":
				this.blockEditor.addBlock("list");
				break;
			case "add-quote":
				this.blockEditor.addBlock("quote");
				break;
			case "add-code":
				this.blockEditor.addBlock("code");
				break;
			case "add-embed":
				this.blockEditor.addBlock("embed");
				break;
			case "add-image":
				this.blockEditor.addImageBlock();
				break;
			case "export":
				this.#exportDraft();
				break;
			case "publish":
				this.#publishDraft();
				break;
			default:
				break;
		}
	}

	#handleImport(draft) {
		if (!draft) return;
		const { metadata = {}, blocks = [], assets = [], additionalMetadata = {}, source = null, warnings = [] } = draft;

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
	}

	#renderPreview() {
		this.preview.render({
			metadata: this.state.metadata,
			blocks: this.state.blocks
		});
	}

	#normaliseMetadata(metadata = {}, fallback = this.state.metadata || DEFAULT_METADATA) {
		const base = { ...DEFAULT_METADATA, ...(fallback || {}) };
		const source = metadata || {};
		const result = { ...base };

		if (source.title !== undefined) result.title = this.#asString(source.title);
		if (source.subtitle !== undefined) result.subtitle = this.#asString(source.subtitle);
		if (source.author !== undefined) result.author = this.#asString(source.author ?? source.byline);
		if (source.byline !== undefined && !source.author) result.author = this.#asString(source.byline);
		if (source.category !== undefined) result.category = this.#asString(source.category);

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

		if (!Array.isArray(result.tags)) result.tags = [];
		if (!Array.isArray(result.links)) result.links = [];
		if (!result.published_at) result.published_at = "";

		return result;
	}

	#normaliseTags(value) {
		const source = Array.isArray(value)
			? value
			: typeof value === "string"
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
		if (!value) return [];
		if (Array.isArray(value)) {
			return value
				.map((entry) => {
					if (!entry) return null;
					if (typeof entry === "string") {
						const label = this.#asString(entry);
						return label ? { label, url: "" } : null;
					}
					if (typeof entry === "object") {
						const label = this.#asString(entry.label ?? entry.title ?? entry.name);
						const url = this.#asString(entry.url ?? entry.href ?? entry.link);
						if (!label && !url) return null;
						return { label, url };
					}
					return null;
				})
				.filter(Boolean);
		}
		if (typeof value === "object") {
			return Object.entries(value)
				.map(([label, url]) => {
					const cleanLabel = this.#asString(label);
					const cleanUrl = this.#asString(url);
					if (!cleanLabel && !cleanUrl) return null;
					return { label: cleanLabel, url: cleanUrl };
				})
				.filter(Boolean);
		}
		if (typeof value === "string") {
			const label = this.#asString(value);
			return label ? [{ label, url: "" }] : [];
		}
		return [];
	}

	#normaliseDate(value) {
		if (!value) return "";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "";
		return date.toISOString();
	}

	#asString(value) {
		if (value === undefined || value === null) return "";
		return String(value).trim();
	}

	#slugify(value) {
		return String(value || "")
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");
	}

	#persist() {
		this.store.save(this.state);
	}

	async #exportDraft() {
		// Validate required metadata before export
		if (!this.state.metadataValidation.valid) {
			this.toast.show("⚠️ Please fix validation errors before exporting.");
			return;
		}

		const payload = {
			metadata: { ...this.state.metadata, ...this.state.additionalMetadata },
			blocks: this.state.blocks,
			assets: this.state.assets,
			source: this.state.source,
			warnings: this.state.warnings,
			additionalMetadata: this.state.additionalMetadata,
			exportedAt: new Date().toISOString()
		};

		this.toast.show("📦 Exporting article...");

		try {
			const response = await fetch("/api/export", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || `Export failed: ${response.status}`);
			}

			this.toast.show(`✓ Exported to /dist/${result.data.path}`);
			console.log("Export result:", result);
		} catch (error) {
			console.error("Export error:", error);
			this.toast.show(`✗ Export failed: ${error.message}`);
		}
	}

	async #publishDraft() {
		// Check if metadata is valid
		if (!this.state.metadataValidation.valid) {
			this.toast.show("⚠️ Please fix validation errors before publishing.");
			return;
		}

		// Confirm publish action
		if (!confirm("Deploy to Cloudflare Pages? This will make your article live.")) {
			return;
		}

		this.toast.show("🚀 Publishing to Cloudflare Pages...");

		try {
			const response = await fetch("/api/publish", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ outDir: "./dist" })
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || `Publish failed: ${response.status}`);
			}

			const { url, count, size, duration } = result.data;
			const sizeKB = (size / 1024).toFixed(2);
			const durationSec = (duration / 1000).toFixed(2);
			
			this.toast.show(`✓ Published! ${count} files (${sizeKB} KB) in ${durationSec}s`);
			console.log("Publish result:", result);

			// Show deployment URL
			if (url) {
				setTimeout(() => {
					if (confirm(`Open deployment?\n${url}`)) {
						window.open(url, "_blank");
					}
				}, 1000);
			}
		} catch (error) {
			console.error("Publish error:", error);
			this.toast.show(`✗ Publish failed: ${error.message}`);

			if (error.message.includes("wrangler")) {
				setTimeout(() => {
					this.toast.show("💡 Install wrangler: npm install -g wrangler");
				}, 3000);
			}
		}
	}
}

window.addEventListener("DOMContentLoaded", () => {
	new EditorApp();
});
