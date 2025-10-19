/**
 * ImageTools - Client-side image processing for the editor
 * 
 * Features:
 * - Resize images to max 1200px width
 * - Quality compression (~0.85 for JPEG)
 * - WebP support with fallback
 * - Generate short IDs for filenames
 * - Store as data URLs in draft state
 */

export default class ImageTools {
    constructor() {
        this.fileInput = this.#createFileInput();
        this.maxWidth = 1200;
        this.jpegQuality = 0.85;
        this.webpQuality = 0.85;
    }

    #createFileInput() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = false;
        input.hidden = true;
        document.body.appendChild(input);
        return input;
    }

    /**
     * Pick and process an image file
     * @param {string} slug - Article slug for filename generation
     * @returns {Promise<Object>} Processed image data
     */
    async pickImage(slug = "image") {
        return new Promise((resolve, reject) => {
            this.fileInput.value = "";
            this.fileInput.onchange = async () => {
                const [file] = this.fileInput.files;
                if (!file) {
                    reject(new Error("No image selected"));
                    return;
                }

                try {
                    const processed = await this.processImage(file, slug);
                    resolve(processed);
                } catch (error) {
                    reject(error);
                }
            };

            this.fileInput.click();
        });
    }

    /**
     * Process an image file: resize, compress, generate filename
     * @param {File} file - Original image file
     * @param {string} slug - Article slug for filename
     * @returns {Promise<Object>} Processed image metadata
     */
    async processImage(file, slug = "image") {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            throw new Error("File must be an image");
        }

        // Load image to determine dimensions
        const img = await this.#loadImage(file);
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        // Calculate new dimensions (max width 1200px, preserve aspect ratio)
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (originalWidth > this.maxWidth) {
            targetWidth = this.maxWidth;
            targetHeight = Math.round((originalHeight * this.maxWidth) / originalWidth);
        }

        // Resize on canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Determine output format and quality
        const originalFormat = file.type;
        let outputFormat = originalFormat;
        let quality = this.jpegQuality;

        // Use WebP if supported, otherwise fall back to JPEG/PNG
        const supportsWebP = await this.#supportsWebP();
        
        if (supportsWebP && !originalFormat.includes("svg")) {
            outputFormat = "image/webp";
            quality = this.webpQuality;
        } else if (originalFormat === "image/png" && originalWidth <= this.maxWidth) {
            // Keep PNG if it wasn't resized (likely has transparency)
            outputFormat = "image/png";
            quality = 1.0; // PNG doesn't use quality
        } else if (originalFormat === "image/jpeg" || originalFormat === "image/jpg") {
            outputFormat = "image/jpeg";
            quality = this.jpegQuality;
        } else {
            // Default to JPEG for other formats
            outputFormat = "image/jpeg";
            quality = this.jpegQuality;
        }

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL(outputFormat, quality);

        // Calculate size reduction
        const originalSize = file.size;
        const processedSize = this.#dataUrlToSize(dataUrl);
        const reduction = ((originalSize - processedSize) / originalSize) * 100;

        // Generate filename with short ID
        const shortId = this.#generateShortId();
        const extension = this.#getExtension(outputFormat);
        const filename = `${slug}-${shortId}${extension}`;

        return {
            filename,
            src: dataUrl,
            originalSize,
            processedSize,
            reduction: Math.round(reduction),
            originalDimensions: { width: originalWidth, height: originalHeight },
            processedDimensions: { width: targetWidth, height: targetHeight },
            format: outputFormat,
            type: outputFormat
        };
    }

    /**
     * Load image file into an Image element
     * @param {File} file - Image file
     * @returns {Promise<HTMLImageElement>} Loaded image
     */
    async #loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load image"));
            };

            img.src = url;
        });
    }

    /**
     * Check if browser supports WebP
     * @returns {Promise<boolean>} WebP support status
     */
    async #supportsWebP() {
        // Use cached result if available
        if (this._webpSupport !== undefined) {
            return this._webpSupport;
        }

        return new Promise((resolve) => {
            const webpData = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=";
            const img = new Image();

            img.onload = () => {
                this._webpSupport = img.width === 2 && img.height === 1;
                resolve(this._webpSupport);
            };

            img.onerror = () => {
                this._webpSupport = false;
                resolve(false);
            };

            img.src = webpData;
        });
    }

    /**
     * Generate a short random ID (6 characters)
     * @returns {string} Short ID
     */
    #generateShortId() {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    /**
     * Get file extension from MIME type
     * @param {string} mimeType - MIME type
     * @returns {string} File extension with dot
     */
    #getExtension(mimeType) {
        const map = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "image/svg+xml": ".svg"
        };
        return map[mimeType] || ".jpg";
    }

    /**
     * Estimate data URL size in bytes
     * @param {string} dataUrl - Data URL
     * @returns {number} Estimated size in bytes
     */
    #dataUrlToSize(dataUrl) {
        const base64 = dataUrl.split(",")[1] || "";
        return Math.round((base64.length * 3) / 4);
    }

    /**
     * Convert file to data URL (fallback for non-image files)
     * @param {File} file - File to convert
     * @returns {Promise<string>} Data URL
     */
    async #fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Unable to read file"));
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Get image dimensions from data URL
     * @param {string} dataUrl - Data URL
     * @returns {Promise<Object>} Width and height
     */
    async getImageDimensions(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
                reject(new Error("Failed to load image from data URL"));
            };
            img.src = dataUrl;
        });
    }

    /**
     * Validate image data URL
     * @param {string} dataUrl - Data URL to validate
     * @returns {boolean} Valid or not
     */
    isValidDataUrl(dataUrl) {
        if (!dataUrl || typeof dataUrl !== "string") return false;
        return dataUrl.startsWith("data:image/");
    }
}

