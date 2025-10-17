const SUPPORTED_TYPES = ["text/markdown", "text/plain", "application/json", "application/pdf"];

export default class ImportManager {
    constructor({ dropzoneEl, listEl, toast, onImport }) {
        this.dropzoneEl = dropzoneEl;
        this.listEl = listEl;
        this.toast = toast;
        this.onImport = onImport;
        this.importedItems = [];

        this.#bindEvents();
    }

    #bindEvents() {
        if (!this.dropzoneEl) return;

        this.dropzoneEl.addEventListener("dragover", (event) => {
            event.preventDefault();
            this.dropzoneEl.dataset.active = "true";
        });

        this.dropzoneEl.addEventListener("dragleave", (event) => {
            if (event.relatedTarget === null) {
                this.dropzoneEl.dataset.active = "false";
            }
        });

        this.dropzoneEl.addEventListener("drop", async (event) => {
            event.preventDefault();
            this.dropzoneEl.dataset.active = "false";
            await this.#handleFiles(event.dataTransfer.files);
        });

        const input = this.dropzoneEl.querySelector("input[type='file']");
        if (input) {
            input.addEventListener("change", async (event) => {
                await this.#handleFiles(event.target.files);
                input.value = "";
            });
        }
    }

    async #handleFiles(fileList) {
        if (!fileList || fileList.length === 0) {
            this.toast?.show("No files detected.");
            return;
        }

        const files = Array.from(fileList);
        const results = await Promise.all(files.map((file) => this.#processFile(file)));

        const merged = results.reduce(
            (acc, result) => {
                if (!result) return acc;
                if (result.metadata) {
                    acc.metadata = { ...acc.metadata, ...result.metadata };
                }
                if (result.blocks?.length) {
                    acc.blocks.push(...result.blocks);
                }
                if (result.assets?.length) {
                    acc.assets.push(...result.assets);
                }
                return acc;
            },
            { metadata: {}, blocks: [], assets: [] }
        );

        this.importedItems.push(...files.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type || "unknown"
        })));

        this.#renderImportList();
        this.toast?.show(`Imported ${files.length} file${files.length > 1 ? "s" : ""}.`);
        this.onImport?.(merged);
    }

    async #processFile(file) {
        const mime = file.type || this.#inferMime(file.name);
        if (!SUPPORTED_TYPES.includes(mime)) {
            return {
                blocks: [this.#createNoteBlock(`Unsupported file type: ${file.name}`)]
            };
        }

        if (mime === "application/pdf") {
            const placeholder = await this.#createPdfPlaceholder(file);
            return { assets: [placeholder.asset], blocks: [placeholder.block] };
        }

        const text = await this.#readAsText(file);
        if (mime === "application/json") {
            return this.#parseJson(text, file.name);
        }

        return {
            blocks: this.#markdownToBlocks(text)
        };
    }

    async #createPdfPlaceholder(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = this.#arrayBufferToBase64(reader.result);
                resolve({
                    asset: {
                        kind: "pdf",
                        name: file.name,
                        data: base64
                    },
                    block: this.#createNoteBlock(`PDF ready for manual review: ${file.name}`)
                });
            };
            reader.readAsArrayBuffer(file);
        });
    }

    #arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i += 1) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    async #readAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
            reader.onload = () => resolve(reader.result);
            reader.readAsText(file);
        });
    }

    #parseJson(raw, filename) {
        try {
            const parsed = JSON.parse(raw);
            const blocks = Array.isArray(parsed.blocks) ? parsed.blocks : [];
            const metadata = typeof parsed.metadata === "object" ? parsed.metadata : {};
            return { blocks, metadata };
        } catch (error) {
            return {
                blocks: [this.#createNoteBlock(`Failed to parse ${filename}: ${error.message}`)]
            };
        }
    }

    #markdownToBlocks(text) {
        const sections = text
            .split(/\n{2,}/)
            .map((chunk) => chunk.trim())
            .filter(Boolean);

        if (!sections.length) {
            return [this.#createNoteBlock("No content detected in markdown file.")];
        }

        return sections.map((section) => ({
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
            type: "text",
            content: section
        }));
    }

    #createNoteBlock(message) {
        return {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
            type: "note",
            content: message
        };
    }

    #inferMime(filename) {
        const ext = filename.split(".").pop()?.toLowerCase();
        switch (ext) {
            case "md":
            case "markdown":
            case "txt":
                return "text/markdown";
            case "json":
                return "application/json";
            case "pdf":
                return "application/pdf";
            default:
                return "";
        }
    }

    #renderImportList() {
        if (!this.listEl) return;
        this.listEl.innerHTML = "";
        this.importedItems.slice(-6).forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.name} • ${this.#formatSize(item.size)}`;
            this.listEl.appendChild(li);
        });
    }

    #formatSize(bytes) {
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex += 1;
        }
        return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    }
}
