const DEFAULT_STATE = {
    metadata: {
        title: "Untitled Feature Story",
        subtitle: "",
        excerpt: "Add an excerpt to see the standfirst.",
        published_at: "",
        category: "",
        author: "",
        tags: [],
        hero_image: "",
        hero_caption: "",
        links: []
    },
    blocks: []
};

export default class Preview {
    constructor({ root, kicker, title, subtitle, dek, meta, body }) {
        this.root = root;
        this.kicker = kicker;
        this.title = title;
        this.subtitle = subtitle;
        this.dek = dek;
        this.meta = meta;
        this.body = body;
    }

    render(state = DEFAULT_STATE) {
        const metadata = { ...DEFAULT_STATE.metadata, ...(state.metadata || {}) };
        const blocks = Array.isArray(state.blocks) ? state.blocks : DEFAULT_STATE.blocks;

        if (this.kicker) {
            const kickerValue = metadata.category || "Feature";
            this.kicker.textContent = kickerValue ? kickerValue.toUpperCase() : "FEATURE";
        }

        if (this.title) {
            this.title.textContent = metadata.title || DEFAULT_STATE.metadata.title;
        }

        if (this.subtitle) {
            if (metadata.subtitle) {
                this.subtitle.textContent = metadata.subtitle;
                this.subtitle.hidden = false;
            } else {
                this.subtitle.textContent = "";
                this.subtitle.hidden = true;
            }
        }

        if (this.dek) {
            this.dek.textContent = metadata.excerpt || DEFAULT_STATE.metadata.excerpt;
        }

        if (this.meta) {
            const dateText = metadata.published_at ? this.#formatDate(metadata.published_at) : "Publish date pending";
            const authorText = metadata.author ? `By ${metadata.author}` : "";
            const tagsText = metadata.tags?.length ? metadata.tags.join(" • ") : "Add tags";
            const metaParts = [dateText, authorText, tagsText].filter(Boolean);
            this.meta.textContent = metaParts.join(" • ");
        }

        if (this.body) {
            const hero = this.#renderHero(metadata);
            const content = this.#renderBlocks(blocks);
            const links = this.#renderLinks(metadata.links);
            this.body.innerHTML = [hero, content, links].filter(Boolean).join("");
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

    #renderHero(metadata) {
        if (!metadata.hero_image) return "";
        const caption = metadata.hero_caption ? `<figcaption>${this.#escape(metadata.hero_caption)}</figcaption>` : "";
        const alt = this.#escape(metadata.hero_caption || metadata.title || "Feature hero image");
        const src = this.#escape(metadata.hero_image);
        return `<figure class="preview__hero"><img src="${src}" alt="${alt}">${caption}</figure>`;
    }

    #renderLinks(links) {
        if (!Array.isArray(links) || !links.length) return "";
        const items = links
            .map((link) => {
                if (!link) return "";
                const label = this.#escape(link.label || link.url || "Resource");
                const url = link.url ? this.#escape(link.url) : "";
                if (url) {
                    return `<li><a href="${url}" target="_blank" rel="noopener">${label}</a></li>`;
                }
                return `<li>${label}</li>`;
            })
            .filter(Boolean)
            .join("");
        if (!items) return "";
        return `<section class="preview__links"><h3>Further Reading</h3><ul>${items}</ul></section>`;
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

    #formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Publish date pending";
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }
}
