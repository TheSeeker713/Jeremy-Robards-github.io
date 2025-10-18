const STOP_WORDS = new Set([
    "the",
    "and",
    "with",
    "have",
    "from",
    "that",
    "this",
    "into",
    "your",
    "about",
    "there",
    "their",
    "will",
    "would",
    "should",
    "could",
    "what",
    "when",
    "where",
    "which",
    "while",
    "over",
    "under",
    "after",
    "before",
    "because",
    "through",
    "across",
    "also",
    "within",
    "between",
    "these",
    "those",
    "them",
    "they",
    "been",
    "being",
    "each",
    "such",
    "even",
    "much",
    "more",
    "very",
    "ever",
    "only",
    "some",
    "many",
    "like",
    "just",
    "thing",
    "things"
]);

export default class MetadataPanel {
    constructor(formElement, { onChange } = {}) {
        this.form = formElement;
        this.onChange = onChange;
        this.tags = [];
        this.tagSuggestions = [];
        this.validation = { valid: true, errors: {} };
        this.fields = {};
        this.fieldWrappers = {};
        this.fieldMessages = {};
        if (!this.form) return;
        this.#cacheElements();
        this.#bindEvents();
    }

    setMetadata(metadata = {}) {
        if (!this.form) return;
        const source = metadata || {};
        this.#setFieldValue("title", source.title || "");
        this.#setFieldValue("subtitle", source.subtitle || "");
        this.#setFieldValue("author", source.author || "");
        this.#setFieldValue("category", source.category || "");
        this.#setFieldValue("excerpt", source.excerpt || "");
        this.#setFieldValue("hero_image", source.hero_image || "");
        this.#setFieldValue("hero_caption", source.hero_caption || "");

        const initialTags = this.#normaliseTags(source.tags);
        this.tags = initialTags;
        this.#renderTags();

        const iso = source.published_at || "";
        if (this.fields.published_at) {
            const value = iso ? this.#formatDateForInput(iso) : this.#formatDateForInput(new Date().toISOString());
            this.fields.published_at.value = value;
        }

        this.#setLinks(Array.isArray(source.links) ? source.links : []);
        const slugPreview = source.slug ? this.#slugify(source.slug) : this.#slugify(this.fields.title?.value || "");
        this.#updateSlugPreview(slugPreview);
        this.#applyValidationState({ valid: true, errors: {} });
        this.#renderTagSuggestions();
    }

    getMetadata(options = {}) {
        const { skipAutofill = false } = options;
        if (!this.form) return {};
        this.#commitTagInput();
        const metadata = {
            title: this.fields.title?.value.trim() || "",
            subtitle: this.fields.subtitle?.value.trim() || "",
            author: this.fields.author?.value.trim() || "",
            category: this.fields.category?.value.trim() || "",
            tags: [...this.tags],
            published_at: this.#normalisePublishedAt(this.fields.published_at?.value || ""),
            excerpt: this.fields.excerpt?.value.trim() || "",
            hero_image: this.fields.hero_image?.value.trim() || "",
            hero_caption: this.fields.hero_caption?.value.trim() || "",
            links: this.#collectLinks(),
            slug: this.#slugify(this.fields.title?.value || "")
        };
        if (!metadata.published_at && !skipAutofill) {
            metadata.published_at = new Date().toISOString();
            if (this.fields.published_at) {
                this.fields.published_at.value = this.#formatDateForInput(metadata.published_at);
            }
        }
        this.validation = this.#validate(metadata);
        this.#applyValidationState(this.validation);
        this.#updateSlugPreview(metadata.slug || "");
        return metadata;
    }

    updateContent(blocks = []) {
        if (!Array.isArray(blocks)) return;
        const suggestions = this.#generateSuggestions(blocks);
        this.tagSuggestions = suggestions;
        this.#renderTagSuggestions();
    }

    #cacheElements() {
        this.fields = {
            title: this.form.querySelector("[name='title']"),
            subtitle: this.form.querySelector("[name='subtitle']"),
            author: this.form.querySelector("[name='author']"),
            category: this.form.querySelector("[name='category']"),
            excerpt: this.form.querySelector("[name='excerpt']"),
            hero_image: this.form.querySelector("[name='hero_image']"),
            hero_caption: this.form.querySelector("[name='hero_caption']"),
            published_at: this.form.querySelector("[name='published_at']")
        };
        this.tagsInput = this.form.querySelector("[data-tags-input]");
        this.tagsContainer = this.form.querySelector("[data-tags-container]");
        this.tagSuggestionsEl = this.form.querySelector("[data-tag-suggestions]");
        this.slugPreview = this.form.querySelector("[data-slug-preview]");
        this.linksList = this.form.querySelector("[data-links]");

        this.form.querySelectorAll("[data-field]").forEach((wrapper) => {
            const key = wrapper.dataset.field;
            if (!key) return;
            this.fieldWrappers[key] = wrapper;
            const message = wrapper.querySelector(`[data-field-message='${key}']`);
            if (message) {
                this.fieldMessages[key] = message;
            }
        });
    }

    #bindEvents() {
        this.form.addEventListener("submit", (event) => event.preventDefault());
        this.form.addEventListener("input", (event) => {
            const target = event.target;
            if (!target || target === this.tagsInput) return;
            if (target.name === "title") {
                this.#updateSlugPreview(this.#slugify(target.value));
            }
            this.#notify();
        });
        this.form.addEventListener("change", (event) => {
            const target = event.target;
            if (!target || target === this.tagsInput) return;
            this.#notify();
        });
        this.form.addEventListener("click", (event) => {
            const action = event.target?.dataset?.action;
            if (action === "add-link") {
                this.#addLinkRow();
                this.#notify();
                return;
            }
            if (action === "remove-link") {
                const row = event.target.closest("[data-link-row]");
                this.#removeLinkRow(row);
                this.#notify();
            }
        });

        if (this.tagsInput) {
            this.tagsInput.addEventListener("keydown", (event) => this.#handleTagKeydown(event));
            this.tagsInput.addEventListener("blur", () => {
                this.#commitTagInput();
                this.#notify();
            });
        }

        if (this.tagsContainer) {
            this.tagsContainer.addEventListener("click", (event) => {
                const btn = event.target.closest("[data-tag-remove]");
                if (!btn) return;
                this.#removeTag(btn.dataset.tagRemove || "");
                this.#notify();
            });
        }

        if (this.tagSuggestionsEl) {
            this.tagSuggestionsEl.addEventListener("click", (event) => {
                const btn = event.target.closest("[data-tag-suggestion]");
                if (!btn) return;
                const added = this.#addTag(btn.dataset.tagSuggestion || "");
                if (added) {
                    this.tagSuggestions = this.tagSuggestions.filter((tag) => tag !== btn.dataset.tagSuggestion);
                    this.#renderTagSuggestions();
                    this.#notify();
                }
            });
        }

        if (this.linksList) {
            this.linksList.addEventListener("input", () => this.#notify());
        }
    }

    #notify() {
        const metadata = this.getMetadata({ skipAutofill: true });
        this.onChange?.(metadata, this.validation);
    }

    #handleTagKeydown(event) {
        if (!this.tagsInput) return;
        const shouldAdd = event.key === "Enter" || event.key === ",";
        if (!shouldAdd) return;
        event.preventDefault();
        this.#commitTagInput();
        this.#notify();
    }

    #commitTagInput() {
        if (!this.tagsInput) return;
        const raw = this.tagsInput.value;
        if (!raw || !raw.trim()) return;
        const pieces = raw.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
        let added = false;
        pieces.forEach((piece) => {
            if (this.#addTag(piece)) {
                added = true;
            }
        });
        if (added) {
            this.tagSuggestions = this.tagSuggestions.filter(
                (suggestion) => !this.tags.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())
            );
            this.#renderTagSuggestions();
        }
        this.tagsInput.value = "";
    }

    #addTag(tag) {
        const value = String(tag || "").trim();
        if (!value) return false;
        const normalised = value.toLowerCase();
        const exists = this.tags.some((item) => item.toLowerCase() === normalised);
        if (exists) return false;
        this.tags.push(value);
        this.#renderTags();
        return true;
    }

    #removeTag(tag) {
        const normalised = String(tag || "").toLowerCase();
        const before = this.tags.length;
        this.tags = this.tags.filter((item) => item.toLowerCase() !== normalised);
        if (this.tags.length !== before) {
            this.#renderTags();
        }
    }

    #renderTags() {
        if (!this.tagsContainer) return;
        this.tagsContainer.innerHTML = "";
        this.tags.forEach((tag) => {
            const chip = document.createElement("span");
            chip.className = "metadata-form__chip";
            const label = document.createElement("span");
            label.textContent = tag;
            const remove = document.createElement("button");
            remove.type = "button";
            remove.dataset.tagRemove = tag;
            remove.setAttribute("aria-label", `Remove tag ${tag}`);
            remove.textContent = "×";
            chip.append(label, remove);
            this.tagsContainer.appendChild(chip);
        });
    }

    #renderTagSuggestions() {
        if (!this.tagSuggestionsEl) return;
        this.tagSuggestionsEl.innerHTML = "";
        this.tagSuggestions
            .filter((suggestion) => !this.tags.some((tag) => tag.toLowerCase() === suggestion.toLowerCase()))
            .slice(0, 6)
            .forEach((suggestion) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "metadata-form__suggestion";
                button.dataset.tagSuggestion = suggestion;
                button.textContent = suggestion;
                this.tagSuggestionsEl.appendChild(button);
            });
    }

    #setLinks(links) {
        if (!this.linksList) return;
        this.linksList.innerHTML = "";
        const list = Array.isArray(links) ? links : [];
        if (!list.length) {
            this.#addLinkRow();
            return;
        }
        list.forEach((link) => this.#addLinkRow(link));
    }

    #collectLinks() {
        if (!this.linksList) return [];
        const rows = Array.from(this.linksList.querySelectorAll("[data-link-row]"));
        return rows
            .map((row) => {
                const labelInput = row.querySelector("[data-link-label]");
                const urlInput = row.querySelector("[data-link-url]");
                const label = labelInput?.value.trim() || "";
                const url = urlInput?.value.trim() || "";
                if (!label && !url) return null;
                return { label, url };
            })
            .filter(Boolean);
    }

    #addLinkRow(link = { label: "", url: "" }) {
        if (!this.linksList) return;
        const row = document.createElement("div");
        row.className = "metadata-form__link-row";
        row.dataset.linkRow = "true";

        const labelInput = document.createElement("input");
        labelInput.type = "text";
        labelInput.placeholder = "Label";
        labelInput.value = link.label || "";
        labelInput.dataset.linkLabel = "true";

        const urlInput = document.createElement("input");
        urlInput.type = "url";
        urlInput.placeholder = "https://";
        urlInput.value = link.url || "";
        urlInput.dataset.linkUrl = "true";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "metadata-form__link-remove";
        removeButton.dataset.action = "remove-link";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", "Remove link");

        row.append(labelInput, urlInput, removeButton);
        this.linksList.appendChild(row);
    }

    #removeLinkRow(row) {
        if (!row || !this.linksList) return;
        this.linksList.removeChild(row);
        if (!this.linksList.querySelector("[data-link-row]")) {
            this.#addLinkRow();
        }
    }

    #setFieldValue(key, value) {
        const field = this.fields[key];
        if (!field) return;
        field.value = value;
    }

    #normaliseTags(value) {
        if (Array.isArray(value)) {
            return value
                .map((item) => (typeof item === "string" ? item.trim() : ""))
                .filter(Boolean)
                .filter((item, index, array) => index === array.findIndex((other) => other.toLowerCase() === item.toLowerCase()));
        }
        if (typeof value === "string") {
            return value
                .split(/[,;\n]/)
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return [];
    }

    #generateSuggestions(blocks) {
        const content = this.#extractText(blocks);
        const matches = content.match(/[a-zA-Z][a-z0-9\-]{3,}/g) || [];
        const counts = new Map();
        matches
            .map((word) => word.toLowerCase())
            .filter((word) => !STOP_WORDS.has(word))
            .forEach((word) => {
                counts.set(word, (counts.get(word) || 0) + 1);
            });
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([word]) => word)
            .filter((word, index, array) => index === array.findIndex((item) => item === word))
            .slice(0, 12);
    }

    #extractText(blocks) {
        return blocks
            .map((block) => {
                switch (block.type) {
                    case "paragraph":
                    case "heading":
                    case "quote":
                        return block.text || block.content || "";
                    case "list":
                        return Array.isArray(block.items) ? block.items.join(" ") : "";
                    case "code":
                        return block.code || "";
                    case "image":
                        return [block.caption, block.alt].filter(Boolean).join(" ");
                    default:
                        return "";
                }
            })
            .filter(Boolean)
            .join(" ");
    }

    #validate(metadata) {
        const errors = {};
        if (!metadata.title) {
            errors.title = "Add a title.";
        }
        if (!metadata.excerpt) {
            errors.excerpt = "Add an excerpt.";
        }
        if (!metadata.published_at) {
            errors.published_at = "Set a publish date.";
        }
        if (!metadata.tags || metadata.tags.length === 0) {
            errors.tags = "Add at least one tag.";
        }
        return { valid: Object.keys(errors).length === 0, errors };
    }

    #applyValidationState(validation) {
        Object.entries(this.fieldWrappers).forEach(([key, wrapper]) => {
            if (!wrapper) return;
            const message = this.fieldMessages[key];
            const error = validation.errors?.[key];
            if (error) {
                wrapper.dataset.invalid = "true";
                if (message) message.textContent = error;
            } else {
                delete wrapper.dataset.invalid;
                if (message) message.textContent = "";
            }
        });
    }

    #updateSlugPreview(slug) {
        if (!this.slugPreview) return;
        const value = slug || this.#slugify(this.fields.title?.value || "") || "draft";
        this.slugPreview.textContent = value;
    }

    #formatDateForInput(isoString) {
        if (!isoString) return "";
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    #normalisePublishedAt(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toISOString();
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
}
