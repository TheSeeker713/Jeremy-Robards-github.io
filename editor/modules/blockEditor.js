const BLOCK_TYPES = {
    TEXT: "text",
    IMAGE: "image",
    NOTE: "note"
};

export default class BlockEditor {
    constructor(listEl, { onChange, toast, imageTools }) {
        this.listEl = listEl;
        this.onChange = onChange;
        this.toast = toast;
        this.imageTools = imageTools;
        this.blocks = [];

        this.#bindEvents();
    }

    #bindEvents() {
        if (!this.listEl) return;

        this.listEl.addEventListener("input", (event) => {
            const item = event.target.closest(".block-item");
            if (!item) return;
            const id = item.dataset.id;
            const field = event.target.dataset.field;
            const value = event.target.value;
            this.#updateBlock(id, field, value);
        });

        this.listEl.addEventListener("click", async (event) => {
            const target = event.target;
            const item = target.closest(".block-item");
            if (!item) return;
            const id = item.dataset.id;

            if (target.matches("[data-action='remove-block']")) {
                this.removeBlock(id);
            }

            if (target.matches("[data-action='pick-image']")) {
                await this.#replaceImageFromPicker(id);
            }
        });
    }

    loadBlocks(blocks = []) {
        this.blocks = blocks.map((block) => ({ ...block }));
        this.#render();
    }

    addTextBlock(content = "") {
        const block = {
            id: this.#id(),
            type: BLOCK_TYPES.TEXT,
            content
        };
        this.blocks.push(block);
        this.#render();
        this.#notify();
        return block;
    }

    async addImageBlock(initial = {}) {
        let imageData = initial;
        if (!initial.src && this.imageTools) {
            try {
                imageData = await this.imageTools.pickImage();
            } catch (error) {
                this.toast?.show(error.message || "Image selection cancelled.");
                return null;
            }
        }

        const block = {
            id: this.#id(),
            type: BLOCK_TYPES.IMAGE,
            src: imageData.src || "",
            caption: imageData.filename || ""
        };
        this.blocks.push(block);
        this.#render();
        this.#notify();
        return block;
    }

    removeBlock(id) {
        this.blocks = this.blocks.filter((block) => block.id !== id);
        this.#render();
        this.#notify();
    }

    getBlocks() {
        return this.blocks.map((block) => ({ ...block }));
    }

    #updateBlock(id, field, value) {
        const block = this.blocks.find((item) => item.id === id);
        if (!block) return;
        block[field] = value;
        this.#notify();
    }

    async #replaceImageFromPicker(id) {
        if (!this.imageTools) return;
        try {
            const data = await this.imageTools.pickImage();
            const block = this.blocks.find((item) => item.id === id);
            if (!block) return;
            block.src = data.src;
            block.caption = data.filename;
            this.#render();
            this.#notify();
        } catch (error) {
            this.toast?.show(error.message || "Failed to update image block.");
        }
    }

    #render() {
        if (!this.listEl) return;
        this.listEl.innerHTML = "";
        this.blocks.forEach((block, index) => {
            const element = this.#renderBlock(block, index + 1);
            this.listEl.appendChild(element);
        });
    }

    #renderBlock(block, position) {
        const item = document.createElement("li");
        item.className = "block-item";
        item.dataset.id = block.id;
        item.dataset.type = block.type;

        const heading = document.createElement("header");
        heading.className = "block-item__heading";
        heading.innerHTML = `<strong>${position.toString().padStart(2, "0")}.</strong> ${this.#label(block.type)}`;
        item.appendChild(heading);

        if (block.type === BLOCK_TYPES.TEXT) {
            const textarea = document.createElement("textarea");
            textarea.rows = 5;
            textarea.dataset.field = "content";
            textarea.value = block.content || "";
            item.appendChild(textarea);
        }

        if (block.type === BLOCK_TYPES.IMAGE) {
            if (block.src) {
                const preview = document.createElement("img");
                preview.src = block.src;
                preview.alt = block.caption || "Image block preview";
                preview.loading = "lazy";
                item.appendChild(preview);
            }

            const pickButton = document.createElement("button");
            pickButton.type = "button";
            pickButton.className = "button button--sm";
            pickButton.dataset.action = "pick-image";
            pickButton.textContent = block.src ? "Replace Image" : "Select Image";
            item.appendChild(pickButton);

            const caption = document.createElement("input");
            caption.type = "text";
            caption.placeholder = "Image caption";
            caption.value = block.caption || "";
            caption.dataset.field = "caption";
            item.appendChild(caption);
        }

        if (block.type === BLOCK_TYPES.NOTE) {
            const note = document.createElement("p");
            note.textContent = block.content;
            note.className = "block-item__note";
            item.appendChild(note);
        }

        const toolbar = document.createElement("div");
        toolbar.className = "block-item__toolbar";
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "button button--sm button--ghost";
        removeButton.dataset.action = "remove-block";
        removeButton.textContent = "Remove";
        toolbar.appendChild(removeButton);
        item.appendChild(toolbar);

        return item;
    }

    #label(type) {
        switch (type) {
            case BLOCK_TYPES.TEXT:
                return "Text";
            case BLOCK_TYPES.IMAGE:
                return "Image";
            case BLOCK_TYPES.NOTE:
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
