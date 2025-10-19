const BLOCK_TYPES = ["paragraph", "heading", "list", "quote", "code", "image", "embed", "note"];
const IMAGE_LAYOUTS = [
    { value: "full", label: "Full" },
    { value: "left", label: "Left" },
    { value: "right", label: "Right" },
    { value: "gallery", label: "Gallery" }
];

const QUICK_FORMATS = [
    { action: "format-bold", label: "Bold" },
    { action: "format-italic", label: "Italic" },
    { action: "format-link", label: "Link" }
];

export default class BlockEditor {
    constructor(listEl, { onChange, toast, imageTools, getMetadata }) {
        this.listEl = listEl;
        this.onChange = onChange;
        this.toast = toast;
        this.imageTools = imageTools;
        this.getMetadata = getMetadata; // Function to get current metadata (for slug)
        this.blocks = [];

        this.#bindEvents();
    }

    #bindEvents() {
        if (!this.listEl) return;

        this.listEl.addEventListener("input", (event) => {
            const blockEl = event.target.closest(".block-item");
            if (!blockEl) return;
            const id = blockEl.dataset.id;
            const field = event.target.dataset.field;
            if (!field) return;
            this.#updateBlockField(id, field, event.target.value);
        });

        this.listEl.addEventListener("change", (event) => {
            const blockEl = event.target.closest(".block-item");
            if (!blockEl) return;
            const id = blockEl.dataset.id;
            const action = event.target.dataset.action;
            const field = event.target.dataset.field;
            if (action === "convert-type") {
                this.convertBlock(id, event.target.value);
                return;
            }
            if (field) {
                this.#updateBlockField(id, field, event.target.value);
            }
        });

        this.listEl.addEventListener("click", async (event) => {
            const target = event.target;
            const blockEl = target.closest(".block-item");
            if (!blockEl) return;
            const id = blockEl.dataset.id;
            const action = target.dataset.action;

            switch (action) {
                case "remove-block":
                    this.removeBlock(id);
                    return;
                case "duplicate-block":
                    this.duplicateBlock(id);
                    return;
                case "move-up":
                    this.moveBlock(id, -1);
                    return;
                case "move-down":
                    this.moveBlock(id, 1);
                    return;
                case "pick-image":
                    await this.#replaceImageFromPicker(id);
                    return;
                case "clear-image":
                    this.#clearImage(id);
                    return;
                case "format-bold":
                case "format-italic":
                case "format-link":
                    this.#applyQuickFormat(blockEl, action, target.dataset.targetField);
                    return;
                default:
                    break;
            }
        });
    }

    loadBlocks(blocks = []) {
        this.blocks = blocks.map((block) => this.#normaliseBlock(block));
        this.#render();
    }

    addBlock(type, initial = {}) {
        const block = this.#createBlock(type, initial);
        this.blocks.push(block);
        this.#render();
        this.#notify();
        return block;
    }

    async addImageBlock(initial = {}) {
        const block = this.addBlock("image", initial);
        if (!block.src && this.imageTools) {
            try {
                await this.#replaceImageFromPicker(block.id);
            } catch (error) {
                this.toast?.show(error.message || "Image selection cancelled.");
            }
        }
        return block;
    }

    removeBlock(id) {
        this.blocks = this.blocks.filter((block) => block.id !== id);
        this.#render();
        this.#notify();
    }

    duplicateBlock(id) {
        const index = this.blocks.findIndex((block) => block.id === id);
        if (index === -1) return;
        const clone = structuredClone ? structuredClone(this.blocks[index]) : JSON.parse(JSON.stringify(this.blocks[index]));
        clone.id = this.#id();
        this.blocks.splice(index + 1, 0, clone);
        this.#render();
        this.#notify();
    }

    moveBlock(id, delta) {
        const index = this.blocks.findIndex((block) => block.id === id);
        if (index === -1) return;
        const targetIndex = index + delta;
        if (targetIndex < 0 || targetIndex >= this.blocks.length) return;
        const [block] = this.blocks.splice(index, 1);
        this.blocks.splice(targetIndex, 0, block);
        this.#render();
        this.#notify();
    }

    convertBlock(id, type) {
        if (!BLOCK_TYPES.includes(type)) return;
        const index = this.blocks.findIndex((block) => block.id === id);
        if (index === -1) return;
        const current = this.blocks[index];
        const next = this.#createBlock(type, current);
        next.id = id;
        this.blocks[index] = next;
        this.#render();
        this.#notify();
    }

    getBlocks() {
        return this.blocks.map((block) => ({ ...block }));
    }

    #render() {
        if (!this.listEl) return;
        this.listEl.innerHTML = "";
        this.blocks.forEach((block, index) => {
            const element = this.#renderBlock(block, index);
            this.listEl.appendChild(element);
        });
    }

    #renderBlock(block, index) {
        const item = document.createElement("li");
        item.className = "block-item";
        item.dataset.id = block.id;
        item.dataset.type = block.type;
        item.dataset.label = `${(index + 1).toString().padStart(2, "0")}. ${this.#label(block.type)}`;

        const header = document.createElement("div");
        header.className = "block-item__header";

        const title = document.createElement("h3");
        title.className = "block-item__title";
        title.textContent = this.#label(block.type);
        header.appendChild(title);

        const typeSelect = document.createElement("select");
        typeSelect.className = "block-item__type-select";
        typeSelect.dataset.action = "convert-type";
        BLOCK_TYPES.filter((t) => t !== "note").forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = this.#label(type);
            if (block.type === type) option.selected = true;
            typeSelect.appendChild(option);
        });
        header.appendChild(typeSelect);

        const controls = document.createElement("div");
        controls.className = "block-item__controls";
        controls.append(
            this.#controlButton("Move up", "move-up"),
            this.#controlButton("Move down", "move-down"),
            this.#controlButton("Duplicate", "duplicate-block"),
            this.#controlButton("Remove", "remove-block", "button--ghost")
        );
        header.appendChild(controls);
        item.appendChild(header);

        const content = document.createElement("div");
        content.className = "block-item__content";

        switch (block.type) {
            case "paragraph":
                content.append(
                    this.#quickFormatBar("text"),
                    this.#textarea({
                        value: block.text,
                        dataset: { field: "text" },
                        rows: 5,
                        placeholder: "Write your paragraph..."
                    })
                );
                break;
            case "heading":
                content.append(
                    this.#select({
                        dataset: { field: "level" },
                        opinions: [
                            { value: "2", label: "H2" },
                            { value: "3", label: "H3" },
                            { value: "4", label: "H4" }
                        ],
                        value: String(block.level || 2)
                    }),
                    this.#textarea({
                        value: block.text,
                        dataset: { field: "text" },
                        rows: 2,
                        placeholder: "Heading text"
                    })
                );
                break;
            case "list":
                content.append(
                    this.#select({
                        dataset: { field: "style" },
                        opinions: [
                            { value: "unordered", label: "Bullet" },
                            { value: "ordered", label: "Numbered" }
                        ],
                        value: block.style || "unordered"
                    }),
                    this.#textarea({
                        value: (block.items || []).join("\n"),
                        dataset: { field: "items" },
                        rows: 4,
                        placeholder: "One item per line"
                    })
                );
                break;
            case "quote":
                content.append(
                    this.#quickFormatBar("text"),
                    this.#textarea({
                        value: block.text,
                        dataset: { field: "text" },
                        rows: 3,
                        placeholder: "Quote text"
                    }),
                    this.#input({
                        type: "text",
                        value: block.cite,
                        dataset: { field: "cite" },
                        placeholder: "Citation (optional)"
                    })
                );
                break;
            case "code":
                content.append(
                    this.#input({
                        type: "text",
                        value: block.language,
                        dataset: { field: "language" },
                        placeholder: "Language hint (e.g., js)"
                    }),
                    this.#textarea({
                        value: block.code,
                        dataset: { field: "code" },
                        rows: 6,
                        placeholder: "Code snippet"
                    })
                );
                break;
            case "embed":
                content.append(
                    this.#input({
                        type: "url",
                        value: block.url,
                        dataset: { field: "url" },
                        placeholder: "https://"
                    }),
                    this.#textarea({
                        value: block.html,
                        dataset: { field: "html" },
                        rows: 4,
                        placeholder: "Optional embed HTML"
                    })
                );
                break;
            case "image":
                content.append(this.#renderImageBlockControls(block));
                break;
            case "note":
            default:
                content.append(this.#textarea({
                    value: block.text || block.content || "",
                    dataset: { field: "text" },
                    rows: 3
                }));
                break;
        }

        item.appendChild(content);
        return item;
    }

    #renderImageBlockControls(block) {
        const wrapper = document.createElement("div");
        wrapper.className = "block-item__image";

        const mediaSlot = document.createElement("div");
        mediaSlot.className = "block-item__media";
        if (block.src) {
            const img = document.createElement("img");
            img.src = block.src;
            img.alt = block.alt || "";
            mediaSlot.appendChild(img);
        } else {
            const placeholder = document.createElement("p");
            placeholder.textContent = "Drop or select an image.";
            mediaSlot.appendChild(placeholder);
        }

        const buttonRow = document.createElement("div");
        buttonRow.className = "block-item__button-row";
        buttonRow.append(
            this.#controlButton(block.src ? "Replace image" : "Select image", "pick-image", "button--primary"),
            this.#controlButton("Clear", "clear-image", "button--ghost")
        );

        const layoutSelect = this.#select({
            label: "Layout",
            dataset: { field: "layout" },
            opinions: IMAGE_LAYOUTS,
            value: block.layout || "full"
        });

        const altInput = this.#input({
            label: "Alt text",
            type: "text",
            value: block.alt,
            dataset: { field: "alt" }
        });

        const captionInput = this.#input({
            label: "Caption",
            type: "text",
            value: block.caption,
            dataset: { field: "caption" }
        });

        wrapper.append(mediaSlot, buttonRow, layoutSelect, altInput, captionInput);
        return wrapper;
    }

    #controlButton(label, action, modifier = "") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = ["button", "button--sm", modifier].filter(Boolean).join(" ");
        button.dataset.action = action;
        button.textContent = label;
        return button;
    }

    #quickFormatBar(field) {
        const bar = document.createElement("div");
        bar.className = "block-item__format";
        QUICK_FORMATS.forEach((format) => {
            const button = this.#controlButton(format.label, format.action, "button--ghost");
            button.dataset.targetField = field;
            bar.appendChild(button);
        });
        return bar;
    }

    #textarea({ value = "", rows = 3, placeholder = "", dataset = {} }) {
        const textarea = document.createElement("textarea");
        textarea.rows = rows;
        textarea.value = value || "";
        textarea.placeholder = placeholder;
        Object.entries(dataset).forEach(([key, val]) => {
            textarea.dataset[key] = val;
        });
        return textarea;
    }

    #input({ value = "", placeholder = "", type = "text", label, dataset = {} }) {
        const wrapper = document.createElement("label");
        wrapper.className = "block-item__field";
        if (label) {
            const span = document.createElement("span");
            span.textContent = label;
            wrapper.appendChild(span);
        }
        const input = document.createElement("input");
        input.type = type;
        input.value = value || "";
        input.placeholder = placeholder;
        Object.entries(dataset).forEach(([key, val]) => {
            input.dataset[key] = val;
        });
        wrapper.appendChild(input);
        return wrapper;
    }

    #select({ value, opinions, dataset = {}, label }) {
        const wrapper = document.createElement("label");
        wrapper.className = "block-item__field";
        if (label) {
            const span = document.createElement("span");
            span.textContent = label;
            wrapper.appendChild(span);
        }
        const select = document.createElement("select");
        Object.entries(dataset).forEach(([key, val]) => {
            select.dataset[key] = val;
        });
        opinions.forEach((option) => {
            const opt = document.createElement("option");
            opt.value = option.value;
            opt.textContent = option.label;
            if (String(option.value) === String(value)) opt.selected = true;
            select.appendChild(opt);
        });
        wrapper.appendChild(select);
        return wrapper;
    }

    #updateBlockField(id, field, rawValue) {
        const block = this.blocks.find((item) => item.id === id);
        if (!block) return;
        let value = rawValue;
        switch (block.type) {
            case "heading":
                if (field === "level") {
                    value = this.#clampHeadingLevel(rawValue);
                }
                if (field === "text") {
                    block.text = rawValue;
                } else {
                    block[field] = value;
                }
                break;
            case "list":
                if (field === "items") {
                    block.items = rawValue
                        .split(/\r?\n/)
                        .map((item) => item.trim())
                        .filter(Boolean);
                } else {
                    block[field] = value;
                }
                break;
            case "quote":
                block[field] = value;
                break;
            case "code":
                if (field === "code") {
                    block.code = rawValue;
                } else {
                    block[field] = value;
                }
                break;
            case "embed":
                block[field] = value;
                break;
            case "image":
                block[field] = value;
                break;
            case "paragraph":
            default:
                block[field] = value;
                break;
        }
        this.#notify();
    }

    async #replaceImageFromPicker(id) {
        if (!this.imageTools) return;
        try {
            // Get current slug from metadata (with fallback)
            const metadata = this.getMetadata ? this.getMetadata() : {};
            const slug = metadata.slug || "image";
            
            // Pick and process image with slug for filename generation
            const picked = await this.imageTools.pickImage(slug);
            
            const block = this.blocks.find((item) => item.id === id);
            if (!block) return;
            
            // Store all the processed image data
            Object.assign(block, {
                src: picked.src, // data URL
                width: picked.processedDimensions?.width || 0,
                height: picked.processedDimensions?.height || 0,
                originalFilename: picked.filename, // slug-shortid.ext
                originalSize: picked.originalSize,
                processedSize: picked.processedSize,
                reduction: picked.reduction,
                format: picked.format,
                type: "image",
                layout: block.layout || "full"
            });
            
            this.#render();
            this.#notify();
            
            // Show processing feedback
            if (picked.reduction > 0) {
                this.toast?.show(`✅ Image optimized (${picked.reduction}% smaller, ${picked.processedDimensions.width}×${picked.processedDimensions.height})`);
            } else {
                this.toast?.show(`✅ Image loaded (${picked.processedDimensions.width}×${picked.processedDimensions.height})`);
            }
        } catch (error) {
            this.toast?.show(error.message || "Image selection cancelled.");
        }
    }

    #clearImage(id) {
        const block = this.blocks.find((item) => item.id === id);
        if (!block) return;
        Object.assign(block, {
            src: "",
            width: undefined,
            height: undefined
        });
        this.#render();
        this.#notify();
    }

    #applyQuickFormat(blockEl, action, field) {
        if (!field) return;
        const textarea = blockEl.querySelector(`[data-field='${field}']`);
        if (!textarea) return;
        const { selectionStart, selectionEnd, value } = textarea;
        const selected = selectionStart !== selectionEnd ? value.slice(selectionStart, selectionEnd) : "";
        let replacement = selected;
        switch (action) {
            case "format-bold":
                replacement = `**${selected || "bold text"}**`;
                break;
            case "format-italic":
                replacement = `_${selected || "italic text"}_`;
                break;
            case "format-link":
                {
                    const url = window.prompt("Link URL", "https://");
                    if (!url) return;
                    replacement = `[${selected || "link text"}](${url})`;
                }
                break;
            default:
                break;
        }
        const next = value.slice(0, selectionStart) + replacement + value.slice(selectionEnd);
        textarea.value = next;
        textarea.focus();
        textarea.selectionStart = selectionStart;
        textarea.selectionEnd = selectionStart + replacement.length;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    async #processImage(dataUrl, maxWidth = 1200) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = () => {
                const scale = image.width > maxWidth ? maxWidth / image.width : 1;
                const width = Math.round(image.width * scale);
                const height = Math.round(image.height * scale);
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, width, height);
                try {
                    const processedUrl = canvas.toDataURL("image/jpeg", 0.9);
                    resolve({ dataUrl: processedUrl, width, height });
                } catch (error) {
                    reject(error);
                }
            };
            image.onerror = () => resolve({ dataUrl, width: undefined, height: undefined });
            image.src = dataUrl;
        });
    }

    #clampHeadingLevel(level) {
        const parsed = Number(level);
        if (!Number.isFinite(parsed)) {
            return 2;
        }
        return Math.min(4, Math.max(2, parsed));
    }

    #createBlock(type, initial = {}) {
        const base = {
            id: this.#id(),
            type
        };
        switch (type) {
            case "heading":
                return {
                    ...base,
                    text: initial.text || initial.content || "",
                    level: this.#clampHeadingLevel(initial.level)
                };
            case "list":
                return {
                    ...base,
                    style: initial.style || "unordered",
                    items: Array.isArray(initial.items)
                        ? initial.items
                        : typeof initial.text === "string"
                            ? initial.text.split(/\r?\n/).filter(Boolean)
                            : typeof initial.content === "string"
                                ? initial.content.split(/\r?\n/).filter(Boolean)
                            : []
                };
            case "quote":
                return {
                    ...base,
                    text: initial.text || initial.content || "",
                    cite: initial.cite || ""
                };
            case "code":
                return {
                    ...base,
                    language: initial.language || "",
                    code: initial.code || initial.text || ""
                };
            case "image":
                return {
                    ...base,
                    src: initial.src || "",
                    caption: initial.caption || "",
                    alt: initial.alt || "",
                    layout: initial.layout || "full",
                    width: initial.width,
                    height: initial.height
                };
            case "embed":
                return {
                    ...base,
                    url: initial.url || "",
                    html: initial.html || ""
                };
            case "note":
                return {
                    ...base,
                    text: initial.text || initial.content || "Note"
                };
            case "paragraph":
            default:
                return {
                    ...base,
                    text: initial.text || initial.content || ""
                };
        }
    }

    #normaliseBlock(block) {
        if (!block || typeof block !== "object") {
            return this.#createBlock("paragraph", {});
        }

        if (block.type === "text") {
            if (block.variant?.startsWith("heading")) {
                return this.#createBlock("heading", {
                    id: block.id,
                    text: block.content,
                    level: Number(block.variant.split("-")[1] || 2)
                });
            }
            if (block.variant === "quote") {
                return this.#createBlock("quote", { text: block.content, cite: block.cite, id: block.id });
            }
            return this.#createBlock("paragraph", { text: block.content, id: block.id });
        }

        if (block.type === "note") {
            return this.#createBlock("note", block);
        }

        if (!BLOCK_TYPES.includes(block.type)) {
            return this.#createBlock("paragraph", block);
        }

        const normalised = this.#createBlock(block.type, block);
        normalised.id = block.id || this.#id();
        return normalised;
    }

    #label(type) {
        switch (type) {
            case "paragraph":
                return "Paragraph";
            case "heading":
                return "Heading";
            case "list":
                return "List";
            case "quote":
                return "Quote";
            case "code":
                return "Code";
            case "image":
                return "Image";
            case "embed":
                return "Embed";
            case "note":
                return "Note";
            default:
                return "Block";
        }
    }

    #notify() {
        this.onChange?.(this.getBlocks());
    }

    #id() {
        return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    }
}
