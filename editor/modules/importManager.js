import matter from "../vendor/gray-matter.js";
import { ensurePdfJs } from "../vendor/pdfjs/index.js";

const JSON_FIELDS = [
    { key: "title", label: "Title", required: true, aliases: ["title", "name", "headline"] },
    { key: "subtitle", label: "Subtitle", aliases: ["subtitle", "subheading"] },
    { key: "author", label: "Author", aliases: ["author", "byline"] },
    { key: "category", label: "Category", aliases: ["category", "section"] },
    { key: "tags", label: "Tags", aliases: ["tags", "keywords"] },
    { key: "published_at", label: "Published Date", aliases: ["published_at", "publishdate", "date"] },
    { key: "excerpt", label: "Excerpt", aliases: ["excerpt", "summary", "description"] },
    { key: "hero_image", label: "Hero Image", aliases: ["hero_image", "heroimage", "image", "hero"] },
    { key: "hero_caption", label: "Hero Caption", aliases: ["hero_caption", "caption"] },
    { key: "links", label: "Links", aliases: ["links", "resources", "related"] },
    { key: "body", label: "Body", required: true, aliases: ["body", "content", "sections"] }
];

const REQUIRED_FIELDS = JSON_FIELDS.filter((field) => field.required).map((field) => field.key);
const TEXT_DECODER = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : null;

export default class ImportManager {
    constructor({ dropzoneEl, listEl, toast, modalRoot, onImport }) {
        this.dropzoneEl = dropzoneEl;
        this.listEl = listEl;
        this.toast = toast;
        this.modalRoot = modalRoot;
        this.onImport = onImport;
        this.importedItems = [];
        this.activeModalCleanup = null;

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
        let successCount = 0;

        for (const file of files) {
            try {
                const { draft, detection } = await this.#processFile(file);
                if (draft) {
                    successCount += 1;
                    this.#recordImport(file, detection);
                    this.onImport?.(draft);
                }
            } catch (error) {
                console.warn("Import failed", error);
                this.toast?.show(`Failed to import ${file.name}: ${error.message}`);
            }
        }

        if (successCount) {
            this.toast?.show(`Imported ${successCount} file${successCount === 1 ? "" : "s"}.`);
        }

        this.#renderImportList();
    }

    async #processFile(file) {
        const buffer = await this.#readBuffer(file);
        const detection = this.#detectFileType(file, buffer);

        switch (detection.kind) {
            case "markdown":
                return { draft: await this.#processMarkdown(file, buffer), detection };
            case "json":
                return { draft: await this.#processJson(file, buffer), detection };
            case "pdf":
                return { draft: await this.#processPdf(file, buffer), detection };
            default:
                throw new Error("Unsupported file type");
        }
    }

    #detectFileType(file, buffer) {
        const extension = this.#fileExtension(file.name);
        const signature = this.#readSignature(buffer);
        const snippet = this.#decodeSnippet(buffer).trimStart();

        if (signature.startsWith("%PDF")) {
            return { kind: "pdf", label: "PDF" };
        }

        if (snippet.startsWith("{") || snippet.startsWith("[")) {
            return { kind: "json", label: "JSON" };
        }

        if (snippet.startsWith("---") || snippet.includes("\n#") || snippet.startsWith("#")) {
            return { kind: "markdown", label: "Markdown" };
        }

        switch (extension) {
            case "pdf":
                return { kind: "pdf", label: "PDF" };
            case "json":
                return { kind: "json", label: "JSON" };
            case "md":
            case "markdown":
            case "txt":
            default:
                return { kind: "markdown", label: "Markdown" };
        }
    }

    async #processMarkdown(file, buffer) {
        const text = this.#decodeText(buffer);
        const parsed = matter(text);
        const metadataInfo = this.#normaliseMarkdownMetadata(parsed.data, parsed.content, file.name);
        let blocks = this.#markdownToBlocks(parsed.content);
        const warnings = [...(metadataInfo.warnings || [])];

        if (!blocks.length) {
            blocks = [this.#createTextBlock("Import detected no body content.")];
            warnings.push("Markdown file contained no paragraphs. Verify the source.");
        }

        return this.#createDraft({
            metadata: metadataInfo.metadata,
            additionalMetadata: metadataInfo.additional,
            blocks,
            assets: [],
            source: {
                type: "markdown",
                fileName: file.name,
                frontmatter: parsed.data
            },
            warnings
        });
    }

    async #processJson(file, buffer) {
        const text = this.#decodeText(buffer);
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            throw new Error(`Invalid JSON: ${error.message}`);
        }

        if (Array.isArray(data)) {
            data = data[0];
        }

        if (typeof data !== "object" || data === null) {
            throw new Error("JSON root must be an object.");
        }

        const { mapping, needsUserInput } = this.#deriveJsonMapping(data);
        let resolvedMapping = mapping;

        if (needsUserInput) {
            const userMapping = await this.#promptJsonMapping(Object.keys(data), mapping);
            if (!userMapping) {
                throw new Error("JSON import cancelled.");
            }
            resolvedMapping = userMapping;
        }

        const titleValue = this.#valueFromMapping(data, resolvedMapping.title);
        const bodyValue = this.#valueFromMapping(data, resolvedMapping.body);

        if (!titleValue || !bodyValue) {
            throw new Error("JSON is missing required fields after mapping.");
        }

        const metadata = {
            title: String(titleValue).trim(),
            subtitle: this.#coerceString(this.#valueFromMapping(data, resolvedMapping.subtitle)),
            author: this.#coerceString(this.#valueFromMapping(data, resolvedMapping.author)),
            category: this.#coerceString(this.#valueFromMapping(data, resolvedMapping.category)),
            excerpt: this.#coerceString(this.#valueFromMapping(data, resolvedMapping.excerpt)),
            tags: this.#normaliseTags(this.#valueFromMapping(data, resolvedMapping.tags)),
            published_at: this.#coerceDate(this.#valueFromMapping(data, resolvedMapping.published_at)),
            hero_image: this.#coerceString(this.#valueFromMapping(data, resolvedMapping.hero_image)),
            hero_caption: this.#coerceString(this.#valueFromMapping(data, resolvedMapping.hero_caption)),
            links: this.#normaliseLinks(this.#valueFromMapping(data, resolvedMapping.links)),
            slug: this.#coerceString(data.slug)
        };
        metadata.slug = metadata.slug || this.#slugify(metadata.title);

        const blocks = this.#normaliseJsonBody(bodyValue);
        if (!blocks.length) {
            throw new Error("JSON body produced no blocks.");
        }

        if (!metadata.excerpt) {
            metadata.excerpt = this.#inferDescriptionFromBlocks(blocks);
        }

        return this.#createDraft({
            metadata,
            additionalMetadata: {},
            blocks,
            assets: [],
            source: {
                type: "json",
                fileName: file.name,
                mapping: resolvedMapping
            }
        });
    }

    async #processPdf(file, buffer) {
        let pdfjs;
        try {
            pdfjs = await ensurePdfJs();
        } catch (error) {
            throw new Error(error.message || "PDF.js loader error.");
        }

        const loadingTask = pdfjs.getDocument({ data: buffer });
        const pdfDocument = await loadingTask.promise;
        const pagesText = [];

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
            const page = await pdfDocument.getPage(pageNumber);
            const content = await page.getTextContent();
            const strings = content.items
                .map((item) => (item.str || "").trim())
                .filter(Boolean);
            if (strings.length) {
                pagesText.push(strings.join(" "));
            }
        }

        const rawText = pagesText.join("\n\n");
        if (!rawText.trim()) {
            throw new Error("PDF extraction returned no text.");
        }

        const editedText = await this.#promptTextEdit({
            title: "Review PDF Extraction",
            description: "Edit the extracted text below before converting into article blocks.",
            initialValue: rawText
        });

        if (editedText === null) {
            throw new Error("PDF import cancelled.");
        }

        const blocks = this.#plainTextToBlocks(editedText, { detectHeadings: true });
        const metadata = { title: "", excerpt: "", slug: "" };
        const warnings = [];

        const headingBlock = blocks.find((block) => block.type === "text" && block.variant?.startsWith("heading"));
        if (headingBlock) {
            metadata.title = headingBlock.content;
        } else if (blocks.length) {
            metadata.title = this.#extractFirstSentence(blocks[0].content);
        }

        if (!metadata.title) {
            metadata.title = file.name.replace(/\.[^.]+$/, "");
            warnings.push("Title inferred from filename. Update before publishing.");
        }

        metadata.excerpt = this.#inferDescriptionFromBlocks(blocks);
        metadata.slug = metadata.slug || this.#slugify(metadata.title);

        return this.#createDraft({
            metadata,
            additionalMetadata: {},
            blocks,
            assets: [],
            source: {
                type: "pdf",
                fileName: file.name,
                pageCount: pdfDocument.numPages
            },
            warnings
        });
    }

    #normaliseMarkdownMetadata(data = {}, content = "", fileName = "") {
        const metadata = {
            title: this.#coerceString(data.title),
            subtitle: this.#coerceString(data.subtitle),
            author: this.#coerceString(data.author || data.byline),
            category: this.#coerceString(data.category),
            tags: this.#normaliseTags(data.tags),
            published_at: this.#coerceDate(data.published_at || data.publishDate || data.publishedAt || data.date),
            excerpt: "",
            hero_image: this.#coerceString(data.hero_image || data.heroImage),
            hero_caption: this.#coerceString(data.hero_caption || data.heroCaption),
            links: this.#normaliseLinks(data.links),
            slug: this.#coerceString(data.slug)
        };
        const additional = { ...data };
        const warnings = [];

        const descriptionSource = data.excerpt ?? data.summary ?? data.description;
        if (descriptionSource !== undefined) {
            metadata.excerpt = this.#coerceString(descriptionSource);
        }

        if (!metadata.title) {
            const firstHeading = this.#findFirstMarkdownHeading(content);
            if (firstHeading) {
                metadata.title = firstHeading;
            } else {
                metadata.title = fileName.replace(/\.[^.]+$/, "");
                warnings.push("Title inferred from filename. Update before publishing.");
            }
        }

        if (!metadata.excerpt) {
            metadata.excerpt = this.#inferDescriptionFromText(content);
        }

        metadata.slug = metadata.slug || this.#slugify(metadata.title);

        const knownKeys = [
            "title",
            "slug",
            "description",
            "summary",
            "excerpt",
            "subtitle",
            "author",
            "byline",
            "category",
            "tags",
            "published_at",
            "publishDate",
            "publishedAt",
            "date",
            "hero_image",
            "heroImage",
            "hero_caption",
            "heroCaption",
            "links"
        ];
        knownKeys.forEach((key) => {
            if (key in additional) {
                delete additional[key];
            }
        });

        return { metadata, additional, warnings };
    }

    #markdownToBlocks(markdown = "") {
        const lines = markdown.split(/\r?\n/);
        const blocks = [];
        let buffer = [];

        const flushParagraph = () => {
            if (!buffer.length) return;
            const paragraph = buffer.join("\n").trim();
            if (paragraph) {
                blocks.push(this.#createTextBlock(paragraph, "paragraph"));
            }
            buffer = [];
        };

        lines.forEach((rawLine) => {
            const line = rawLine.trim();
            const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
            if (imageMatch) {
                flushParagraph();
                blocks.push(this.#createImageBlock({ src: imageMatch[2], caption: imageMatch[1] }));
                return;
            }

            if (/^#{1,6}\s+/.test(line)) {
                flushParagraph();
                const level = Math.min(line.match(/^#{1,6}/)[0].length, 4);
                const content = line.replace(/^#{1,6}\s+/, "").trim();
                blocks.push(this.#createTextBlock(content, `heading-${level}`));
                return;
            }

            if (line.startsWith(">")) {
                flushParagraph();
                const quote = line.replace(/^>\s?/, "");
                blocks.push(this.#createTextBlock(quote, "quote"));
                return;
            }

            if (!line) {
                flushParagraph();
                return;
            }

            buffer.push(line);
        });

        flushParagraph();
        return blocks;
    }

    #normaliseJsonBody(body) {
        if (Array.isArray(body)) {
            return body
                .map((item) => this.#convertJsonSection(item))
                .flat()
                .filter(Boolean);
        }

        if (typeof body === "string") {
            return this.#plainTextToBlocks(body);
        }

        if (typeof body === "object" && body) {
            return this.#convertJsonSection(body).filter(Boolean);
        }

        return [];
    }

    #convertJsonSection(section) {
        if (typeof section === "string") {
            return [this.#createTextBlock(section, "paragraph")];
        }

        if (Array.isArray(section)) {
            return section.map((item) => this.#convertJsonSection(item)).flat();
        }

        if (typeof section !== "object" || !section) {
            return [];
        }

        const type = (section.type || "paragraph").toLowerCase();
        switch (type) {
            case "heading":
            case "header":
                return [this.#createTextBlock(section.text || section.content || "", `heading-${Math.min(section.level || 2, 4)}`)];
            case "quote":
                return [this.#createTextBlock(section.text || section.content || "", "quote")];
            case "list":
            case "bulleted-list":
            case "ordered-list":
                return [
                    this.#createListBlock({
                        items: section.items || section.content || [],
                        style: type === "ordered-list" || section.style === "ordered" ? "ordered" : "unordered"
                    })
                ];
            case "image":
                return [
                    this.#createImageBlock({
                        src: section.src || section.url || "",
                        caption: section.caption || "",
                        alt: section.alt || section.caption || "",
                        layout: section.layout || "full"
                    })
                ];
            case "html":
                return [this.#createTextBlock(section.html || section.content || "", "paragraph")];
            default:
                return [this.#createTextBlock(section.text || section.content || "", "paragraph")];
        }
    }

    #plainTextToBlocks(text, { detectHeadings = false } = {}) {
        const segments = text
            .split(/\r?\n{2,}/)
            .map((segment) => segment.trim())
            .filter(Boolean);

        return segments.map((segment) => {
            if (detectHeadings && this.#looksLikeHeading(segment)) {
                return this.#createTextBlock(segment, "heading-2");
            }
            return this.#createTextBlock(segment, "paragraph");
        });
    }

    #looksLikeHeading(segment) {
        if (!segment) return false;
        const words = segment.split(/\s+/);
        const isShort = segment.length <= 80 && words.length <= 12;
        const isUppercase = segment === segment.toUpperCase() && /[A-Z]/.test(segment);
        const endsWithSentencePunctuation = /[.!?]$/.test(segment.trim());
        return !endsWithSentencePunctuation && (isUppercase || isShort);
    }

    #createDraft({ metadata = {}, additionalMetadata = {}, blocks = [], assets = [], source = {}, warnings = [] }) {
        const baseMetadata = {
            title: this.#coerceString(metadata.title),
            subtitle: this.#coerceString(metadata.subtitle),
            author: this.#coerceString(metadata.author),
            category: this.#coerceString(metadata.category),
            tags: this.#normaliseTags(metadata.tags),
            published_at: this.#coerceDate(metadata.published_at || metadata.publishDate || metadata.date),
            excerpt: this.#coerceString(metadata.excerpt || metadata.description),
            hero_image: this.#coerceString(metadata.hero_image || metadata.heroImage),
            hero_caption: this.#coerceString(metadata.hero_caption || metadata.heroCaption),
            links: this.#normaliseLinks(metadata.links),
            slug: this.#coerceString(metadata.slug)
        };

        if (!baseMetadata.slug) {
            baseMetadata.slug = this.#slugify(baseMetadata.title || source.fileName || "article");
        }

        if (!Array.isArray(baseMetadata.links)) {
            baseMetadata.links = [];
        }

        return {
            metadata: baseMetadata,
            additionalMetadata,
            blocks: Array.isArray(blocks) ? blocks : [],
            assets: Array.isArray(assets) ? assets : [],
            source: {
                ...source,
                importedAt: new Date().toISOString()
            },
            warnings
        };
    }

    #recordImport(file, detection) {
        this.importedItems.push({
            name: file.name,
            size: file.size,
            type: detection.label || detection.kind
        });
    }

    #renderImportList() {
        if (!this.listEl) return;
        this.listEl.innerHTML = "";
        this.importedItems.slice(-6).forEach((item) => {
            const li = document.createElement("li");
            li.textContent = `${item.name} • ${item.type} • ${this.#formatSize(item.size)}`;
            this.listEl.appendChild(li);
        });
    }

    #deriveJsonMapping(data) {
        const keys = Object.keys(data || {});
        const normalisedMap = keys.reduce((acc, key) => {
            acc[key.toLowerCase()] = key;
            return acc;
        }, {});

        const mapping = {};
        JSON_FIELDS.forEach((field) => {
            const found = field.aliases?.map((alias) => normalisedMap[alias.toLowerCase()]).find(Boolean);
            if (found) {
                mapping[field.key] = found;
            }
        });

        const missingRequired = REQUIRED_FIELDS.some((key) => !mapping[key]);

        return {
            mapping,
            needsUserInput: missingRequired
        };
    }

    async #promptJsonMapping(keys, initialMapping = {}) {
        if (!this.modalRoot) {
            const titleKey = window.prompt("JSON mapping: enter the key for title", initialMapping.title || "");
            const bodyKey = window.prompt("JSON mapping: enter the key for body", initialMapping.body || "");
            if (!titleKey || !bodyKey) return null;
            return { ...initialMapping, title: titleKey, body: bodyKey };
        }

        return new Promise((resolve) => {
            const overlay = this.modalRoot;
            overlay.innerHTML = "";
            overlay.hidden = false;
            overlay.dataset.open = "true";

            const modal = document.createElement("section");
            modal.className = "modal";

            const form = document.createElement("form");
            form.className = "modal__form";

            const header = document.createElement("header");
            header.className = "modal__header";
            const title = document.createElement("h2");
            title.className = "modal__title";
            title.textContent = "Map JSON Fields";
            header.appendChild(title);

            const body = document.createElement("div");
            body.className = "modal__body modal__form";
            const hint = document.createElement("p");
            hint.textContent = "Choose which keys match the CMS schema. Title and Body are required.";
            body.appendChild(hint);

            JSON_FIELDS.forEach((field) => {
                const wrapper = document.createElement("div");
                wrapper.className = "modal__field";
                const label = document.createElement("label");
                label.textContent = `${field.label}${field.required ? " *" : ""}`;
                const select = document.createElement("select");
                select.name = field.key;
                if (field.required) select.required = true;

                const ignoreOption = document.createElement("option");
                ignoreOption.value = "__none__";
                ignoreOption.textContent = field.required ? "Select key" : "Ignore";
                select.appendChild(ignoreOption);

                keys.forEach((key) => {
                    const option = document.createElement("option");
                    option.value = key;
                    option.textContent = key;
                    if (initialMapping[field.key] === key) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });

                if (!initialMapping[field.key] && !field.required) {
                    select.value = "__none__";
                }

                wrapper.appendChild(label);
                wrapper.appendChild(select);
                body.appendChild(wrapper);
            });

            const actions = document.createElement("div");
            actions.className = "modal__actions";
            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "button button--ghost";
            cancelButton.textContent = "Cancel";
            const confirmButton = document.createElement("button");
            confirmButton.type = "submit";
            confirmButton.className = "button button--primary";
            confirmButton.textContent = "Apply Mapping";
            actions.appendChild(cancelButton);
            actions.appendChild(confirmButton);

            form.appendChild(header);
            form.appendChild(body);
            form.appendChild(actions);
            modal.appendChild(form);
            overlay.appendChild(modal);

            const cleanup = () => {
                overlay.dataset.open = "false";
                overlay.hidden = true;
                overlay.innerHTML = "";
                document.removeEventListener("keydown", onKeydown);
            };

            const onKeydown = (event) => {
                if (event.key === "Escape") {
                    cleanup();
                    resolve(null);
                }
            };

            document.addEventListener("keydown", onKeydown);

            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const formData = new FormData(form);
                const mapping = {};
                let valid = true;
                JSON_FIELDS.forEach((field) => {
                    const value = formData.get(field.key);
                    if (field.required && (!value || value === "__none__")) {
                        valid = false;
                    }
                    if (value && value !== "__none__") {
                        mapping[field.key] = value;
                    }
                });

                if (!valid) {
                    this.toast?.show("Please map all required fields.");
                    return;
                }

                cleanup();
                resolve(mapping);
            });

            cancelButton.addEventListener("click", () => {
                cleanup();
                resolve(null);
            });
        });
    }

    async #promptTextEdit({ title, description, initialValue }) {
        if (!this.modalRoot) {
            const result = window.prompt(`${title}\n${description}`, initialValue);
            return result === null ? null : result;
        }

        return new Promise((resolve) => {
            const overlay = this.modalRoot;
            overlay.innerHTML = "";
            overlay.hidden = false;
            overlay.dataset.open = "true";

            const modal = document.createElement("section");
            modal.className = "modal";

            const form = document.createElement("form");
            form.className = "modal__form";

            const header = document.createElement("header");
            header.className = "modal__header";
            const heading = document.createElement("h2");
            heading.className = "modal__title";
            heading.textContent = title;
            header.appendChild(heading);

            const body = document.createElement("div");
            body.className = "modal__body";
            const hint = document.createElement("p");
            hint.textContent = description;
            const textarea = document.createElement("textarea");
            textarea.className = "modal__textarea";
            textarea.value = initialValue;
            body.appendChild(hint);
            body.appendChild(textarea);

            const actions = document.createElement("div");
            actions.className = "modal__actions";
            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "button button--ghost";
            cancelButton.textContent = "Cancel";
            const confirmButton = document.createElement("button");
            confirmButton.type = "submit";
            confirmButton.className = "button button--primary";
            confirmButton.textContent = "Use Text";
            actions.appendChild(cancelButton);
            actions.appendChild(confirmButton);

            form.appendChild(header);
            form.appendChild(body);
            form.appendChild(actions);
            modal.appendChild(form);
            overlay.appendChild(modal);

            const cleanup = () => {
                overlay.dataset.open = "false";
                overlay.hidden = true;
                overlay.innerHTML = "";
                document.removeEventListener("keydown", onKeydown);
            };

            const onKeydown = (event) => {
                if (event.key === "Escape") {
                    cleanup();
                    resolve(null);
                }
            };

            document.addEventListener("keydown", onKeydown);

            form.addEventListener("submit", (event) => {
                event.preventDefault();
                cleanup();
                resolve(textarea.value);
            });

            cancelButton.addEventListener("click", () => {
                cleanup();
                resolve(null);
            });
        });
    }

    #findFirstMarkdownHeading(content) {
        const match = content.match(/^#{1,6}\s+(.+)$/m);
        return match ? match[1].trim() : "";
    }

    #inferDescriptionFromText(text = "") {
        const match = text
            .replace(/^---[\s\S]*?---/, "")
            .split(/\r?\n{2,}/)
            .map((paragraph) => paragraph.trim())
            .find((paragraph) => paragraph && !paragraph.startsWith("#"));
        return match ? this.#extractFirstSentence(match) : "";
    }

    #inferDescriptionFromBlocks(blocks = []) {
        const paragraph = blocks.find((block) => block.type === "paragraph");
        if (paragraph) {
            return this.#extractFirstSentence(paragraph.text || paragraph.content || "");
        }
        const quote = blocks.find((block) => block.type === "quote");
        return quote ? this.#extractFirstSentence(quote.text || quote.content || "") : "";
    }

    #extractFirstSentence(text = "") {
        const match = String(text).trim().match(/[^.!?]+[.!?]?/);
        return match ? match[0].trim() : String(text).trim();
    }

    #createTextBlock(content, variant = "paragraph") {
        const text = String(content || "");
        const id = this.#id();
        switch (variant) {
            case "quote":
                return { id, type: "quote", text };
            case "heading-3":
            case "heading-4":
            case "heading-2": {
                const level = Number(variant.split("-")[1] || 2);
                return { id, type: "heading", text, level };
            }
            default:
                return { id, type: "paragraph", text };
        }
    }

    #createImageBlock({ src = "", caption = "", alt = "", layout = "full" }) {
        return {
            id: this.#id(),
            type: "image",
            src,
            caption,
            alt,
            layout
        };
    }

    #createListBlock({ items = [], style = "unordered" }) {
        let listItems = [];
        if (Array.isArray(items)) {
            listItems = items.map((item) => String(item).trim()).filter(Boolean);
        } else if (typeof items === "string") {
            listItems = items
                .split(/\r?\n/)
                .map((item) => item.replace(/^[-*]\s*/, "").trim())
                .filter(Boolean);
        }
        return {
            id: this.#id(),
            type: "list",
            style: style === "ordered" ? "ordered" : "unordered",
            items: listItems
        };
    }

    #normaliseTags(value) {
        const source = Array.isArray(value)
            ? value
            : typeof value === "string"
                ? value.split(/[,;\n]/)
                : [];
        const deduped = [];
        source
            .map((item) => this.#coerceString(item))
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
                        const label = this.#coerceString(entry);
                        return label ? { label, url: "" } : null;
                    }
                    if (typeof entry === "object") {
                        const label = this.#coerceString(entry.label ?? entry.title ?? entry.name);
                        const url = this.#coerceString(entry.url ?? entry.href ?? entry.link);
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
                    const cleanLabel = this.#coerceString(label);
                    const cleanUrl = this.#coerceString(url);
                    if (!cleanLabel && !cleanUrl) return null;
                    return { label: cleanLabel, url: cleanUrl };
                })
                .filter(Boolean);
        }
        if (typeof value === "string") {
            const label = this.#coerceString(value);
            return label ? [{ label, url: "" }] : [];
        }
        return [];
    }

    #valueFromMapping(data, key) {
        if (!key) return undefined;
        if (key === "__none__") return undefined;
        return data[key];
    }

    #coerceDate(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return date.toISOString();
    }

    #coerceString(value) {
        if (value === undefined || value === null) return "";
        return String(value).trim();
    }

    #slugify(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            || "article";
    }

    #readBuffer(file) {
        return file.arrayBuffer();
    }

    #decodeText(buffer) {
        if (TEXT_DECODER) {
            return TEXT_DECODER.decode(buffer);
        }
        return new TextDecoder("utf-8").decode(buffer);
    }

    #decodeSnippet(buffer, length = 512) {
        const view = buffer instanceof ArrayBuffer ? new Uint8Array(buffer, 0, Math.min(length, buffer.byteLength)) : new Uint8Array(buffer.buffer, buffer.byteOffset, Math.min(length, buffer.byteLength));
        return this.#decodeText(view);
    }

    #readSignature(buffer, length = 5) {
        const bytes = new Uint8Array(buffer instanceof ArrayBuffer ? buffer.slice(0, length) : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + length));
        return Array.from(bytes)
            .map((byte) => String.fromCharCode(byte))
            .join("");
    }

    #fileExtension(filename = "") {
        const parts = filename.toLowerCase().split(".");
        return parts.length > 1 ? parts.pop() : "";
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

    #id() {
        return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
    }
}
