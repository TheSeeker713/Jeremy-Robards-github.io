export default class MetadataPanel {
    constructor(formElement, { onChange }) {
        this.form = formElement;
        this.onChange = onChange;
        this.#bindEvents();
    }

    #bindEvents() {
        if (!this.form) return;
        this.form.addEventListener("input", () => this.#notify());
        this.form.addEventListener("change", () => this.#notify());
    }

    #notify() {
        this.onChange?.(this.getMetadata());
    }

    getMetadata() {
        if (!this.form) return {};
        const data = new FormData(this.form);
        return {
            title: data.get("title")?.trim() || "",
            slug: data.get("slug")?.trim() || "",
            description: data.get("description")?.trim() || "",
            tags: data.get("tags")?.split(",").map((tag) => tag.trim()).filter(Boolean) || [],
            publishDate: data.get("publishDate") || ""
        };
    }

    setMetadata(metadata = {}) {
        if (!this.form) return;
        const { title = "", slug = "", description = "", tags = [], publishDate = "" } = metadata;
        if (this.form.elements.title) this.form.elements.title.value = title;
        if (this.form.elements.slug) this.form.elements.slug.value = slug;
        if (this.form.elements.description) this.form.elements.description.value = description;
        if (this.form.elements.tags) this.form.elements.tags.value = Array.isArray(tags) ? tags.join(", ") : tags;
        if (this.form.elements.publishDate) this.form.elements.publishDate.value = publishDate || "";
    }
}
