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
            const date = metadata.publishDate ? new Date(metadata.publishDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Pending publish date";
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
                if (block.type === "image" && block.src) {
                    const caption = block.caption ? `<figcaption>${this.#escape(block.caption)}</figcaption>` : "";
                    return `<figure><img src="${block.src}" alt="${this.#escape(block.caption || "Article image")}">${caption}</figure>`;
                }

                if (block.type === "note") {
                    return `<aside>${this.#escape(block.content || "Note")}</aside>`;
                }

                return `<p>${this.#formatText(block.content || "")}</p>`;
            })
            .join("");
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
