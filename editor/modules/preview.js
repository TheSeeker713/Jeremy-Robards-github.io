const DEFAULT_STATE = {
    metadata: {
        title: "Untitled Feature Story",
        description: "Add a description to see the deck.",
        publishDate: "",
        tags: []
    },
    blocks: []
};

export default class Preview {
    constructor({ root, title, dek, meta, body }) {
        this.root = root;
        this.title = title;
        this.dek = dek;
        this.meta = meta;
        this.body = body;
    }

    render(state = DEFAULT_STATE) {
        const metadata = state.metadata || DEFAULT_STATE.metadata;
        const blocks = Array.isArray(state.blocks) ? state.blocks : DEFAULT_STATE.blocks;

        if (this.title) {
            this.title.textContent = metadata.title || DEFAULT_STATE.metadata.title;
        }

        if (this.dek) {
            this.dek.textContent = metadata.description || DEFAULT_STATE.metadata.description;
        }

        if (this.meta) {
            const date = metadata.publishDate
                ? new Date(metadata.publishDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                  })
                : "Pending publish date";
            const tags = metadata.tags?.length ? metadata.tags.join(" • ") : "Tags pending";
            this.meta.textContent = `${date} • ${tags}`;
        }

        if (this.body) {
            this.body.innerHTML = this.#renderBlocks(blocks);
        }
    }

    #renderBlocks(blocks) {
        if (!blocks.length) {
            return "<p>Add blocks to build your article. The live preview will use a editorial, magazine-inspired layout.</p>";
        }

        return blocks
            .map((block) => {
                switch (block.type) {
                    case "heading":
                        return this.#renderHeading(block);
                    case "list":
                        return this.#renderList(block);
                    case "quote":
                        return this.#renderQuote(block);
                    case "code":
                        return this.#renderCode(block);
                    case "image":
                        return this.#renderImage(block);
                    case "embed":
                        return this.#renderEmbed(block);
                    case "note":
                        return `<aside>${this.#escape(block.text || block.content || "Note")}</aside>`;
                    case "paragraph":
                    default:
                        return `<p>${this.#formatText(block.text || block.content || "")}</p>`;
                }
            })
            .join("");
    }

    #renderHeading(block) {
        const level = Number(block.level) >= 2 && Number(block.level) <= 4 ? Number(block.level) : 2;
        const tag = `h${level}`;
        return `<${tag}>${this.#escape(block.text || "Heading")}</${tag}>`;
    }

    #renderList(block) {
        const items = Array.isArray(block.items) ? block.items : [];
        if (!items.length) {
            return "";
        }
        const tag = block.style === "ordered" ? "ol" : "ul";
        const listItems = items.map((item) => `<li>${this.#escape(item)}</li>`).join("");
        return `<${tag}>${listItems}</${tag}>`;
    }

    #renderQuote(block) {
        const cite = block.cite ? `<cite>${this.#escape(block.cite)}</cite>` : "";
        return `<blockquote>${this.#escape(block.text || "")}${cite}</blockquote>`;
    }

    #renderCode(block) {
        const language = block.language ? ` class="language-${this.#escape(block.language)}"` : "";
        return `<pre><code${language}>${this.#escape(block.code || "")}</code></pre>`;
    }

    #renderImage(block) {
        if (!block.src) return "";
        const layout = block.layout || "full";
        const caption = block.caption ? `<figcaption>${this.#escape(block.caption)}</figcaption>` : "";
        const alt = this.#escape(block.alt || block.caption || "Article image");
        return `<figure class="preview__figure preview__figure--${layout}"><img src="${block.src}" alt="${alt}">${caption}</figure>`;
    }

    #renderEmbed(block) {
        if (block.html) {
            return `<div class="preview__embed">${block.html}</div>`;
        }
        if (block.url) {
            return `<div class="preview__embed"><a href="${this.#escape(block.url)}" target="_blank" rel="noopener">${this.#escape(block.url)}</a></div>`;
        }
        return "";
    }

    #escape(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    #formatText(text) {
        return this.#escape(text).replace(/\n/g, "<br>");
    }
}
