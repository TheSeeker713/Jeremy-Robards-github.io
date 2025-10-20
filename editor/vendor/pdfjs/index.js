let pdfjsLibPromise = null;

export async function ensurePdfJs() {
    if (typeof window !== "undefined" && window.pdfjsLib) {
        // Configure worker if not already set
        if (window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.js';
        }
        return window.pdfjsLib;
    }

    if (!pdfjsLibPromise) {
        pdfjsLibPromise = new Promise((resolve, reject) => {
            // Load pdf.min.js as a script tag since it's not an ES module
            const script = document.createElement('script');
            script.src = './vendor/pdfjs/pdf.min.js';
            script.onload = () => {
                if (window.pdfjsLib) {
                    // Configure the worker
                    if (window.pdfjsLib.GlobalWorkerOptions) {
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.js';
                    }
                    resolve(window.pdfjsLib);
                } else {
                    reject(new Error("PDF.js library failed to load. window.pdfjsLib is undefined."));
                }
            };
            script.onerror = () => {
                reject(new Error("Failed to load pdf.min.js. Ensure the file exists in /editor/vendor/pdfjs/"));
            };
            document.head.appendChild(script);
        });
    }

    return pdfjsLibPromise;
}
