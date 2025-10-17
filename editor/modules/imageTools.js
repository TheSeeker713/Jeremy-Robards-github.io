export default class ImageTools {
    constructor() {
        this.fileInput = this.#createFileInput();
    }

    #createFileInput() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.hidden = true;
        document.body.appendChild(input);
        return input;
    }

    pickImage() {
        return new Promise((resolve, reject) => {
            this.fileInput.value = "";
            this.fileInput.onchange = async () => {
                const [file] = this.fileInput.files;
                if (!file) {
                    reject(new Error("No image selected"));
                    return;
                }

                try {
                    const dataUrl = await this.#fileToDataUrl(file);
                    resolve({
                        filename: file.name,
                        src: dataUrl,
                        size: file.size,
                        type: file.type
                    });
                } catch (error) {
                    reject(error);
                }
            };

            this.fileInput.click();
        });
    }

    async #fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Unable to read image"));
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }
}
