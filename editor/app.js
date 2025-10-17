import ImportManager from "./modules/importManager.js";
import BlockEditor from "./modules/blockEditor.js";
import MetadataPanel from "./modules/metadataPanel.js";
import Preview from "./modules/preview.js";
import Store from "./modules/store.js";
import Toast from "./modules/toast.js";
import ImageTools from "./modules/imageTools.js";

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
			previewTitle: document.querySelector("[data-preview-title]"),
			previewDek: document.querySelector("[data-preview-dek]"),
			previewMeta: document.querySelector("[data-preview-meta]"),
			previewBody: document.querySelector("[data-preview-body]")
		};

		this.state = {
			metadata: {
				title: "",
				slug: "",
				description: "",
				tags: [],
				publishDate: ""
			},
			blocks: [],
			assets: []
		};

		this.#hydrateFromStore();
		this.#initialiseModules();
		this.#bindGlobalActions();
		this.#render();
	}

	#hydrateFromStore() {
		const cached = this.store.load();
		if (cached) {
			this.state = {
				metadata: { ...this.state.metadata, ...cached.metadata },
				blocks: Array.isArray(cached.blocks) ? cached.blocks : [],
				assets: Array.isArray(cached.assets) ? cached.assets : []
			};
		}
	}

	#initialiseModules() {
		this.metadataPanel = new MetadataPanel(this.elements.metadataForm, {
			onChange: (metadata) => {
				this.state.metadata = metadata;
				this.#persist();
				this.#renderPreview();
			}
		});
		this.metadataPanel.setMetadata(this.state.metadata);

		this.blockEditor = new BlockEditor(this.elements.blockList, {
			onChange: (blocks) => {
				this.state.blocks = blocks;
				this.#persist();
				this.#renderPreview();
			},
			toast: this.toast,
			imageTools: this.imageTools
		});
		this.blockEditor.loadBlocks(this.state.blocks);

		this.preview = new Preview({
			root: this.elements.previewRoot,
			title: this.elements.previewTitle,
			dek: this.elements.previewDek,
			meta: this.elements.previewMeta,
			body: this.elements.previewBody
		});

		this.importManager = new ImportManager({
			dropzoneEl: this.elements.dropzone,
			listEl: this.elements.importList,
			toast: this.toast,
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
			case "add-text":
				this.blockEditor.addTextBlock();
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

	#handleImport({ metadata = {}, blocks = [], assets = [] }) {
		if (Object.keys(metadata).length) {
			const mergedMetadata = { ...this.state.metadata, ...metadata };
			this.state.metadata = mergedMetadata;
			this.metadataPanel.setMetadata(mergedMetadata);
		}

		if (blocks.length) {
			const nextBlocks = [...this.state.blocks, ...blocks];
			this.state.blocks = nextBlocks;
			this.blockEditor.loadBlocks(nextBlocks);
		}

		if (assets.length) {
			this.state.assets = [...this.state.assets, ...assets];
		}

		this.#persist();
		this.#renderPreview();
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

	#persist() {
		this.store.save(this.state);
	}

	#exportDraft() {
		const payload = {
			...this.state,
			exportedAt: new Date().toISOString()
		};
		const slug = this.state.metadata.slug || "draft";
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${slug}-draft.json`;
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
		URL.revokeObjectURL(url);
		this.toast.show("Draft exported. Connect build pipeline to populate dist/.");
	}

	#publishDraft() {
		const event = new CustomEvent("cms:publish", { detail: { state: this.state } });
		window.dispatchEvent(event);
		this.toast.show("Publish pipeline pending. Hook this button to cms/publish.");
	}
}

window.addEventListener("DOMContentLoaded", () => {
	new EditorApp();
});
