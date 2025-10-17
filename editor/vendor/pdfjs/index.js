let pdfjsLibPromise = null;

export async function ensurePdfJs() {
    if (typeof window !== "undefined" && window.pdfjsLib) {
        return window.pdfjsLib;
    }

    if (!pdfjsLibPromise) {
        pdfjsLibPromise = import('./pdf.min.js')
            .then((module) => {
                const lib = module?.default || module?.pdfjsLib || window.pdfjsLib;
                if (!lib) {
                    throw new Error("PDF.js library missing. Place the pdf.js build in /editor/vendor/pdfjs");
                }
                if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
                    lib.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.js';
                }
                return lib;
            })
            .catch((error) => {
                throw new Error(
                    `Unable to load pdf.js build. Ensure pdf.min.js and pdf.worker.min.js exist in /editor/vendor/pdfjs. (${error.message})`
                );
            });
    }

    return pdfjsLibPromise;
}
