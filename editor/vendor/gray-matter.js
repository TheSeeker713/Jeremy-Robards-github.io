// Minimal frontmatter parser inspired by gray-matter for browser usage.
// Supports simple YAML-style key-value pairs and array values starting with '-'.

const FRONTMATTER_BOUNDARY = /^-{3,}\s*$/;

function normaliseValue(value) {
    const trimmed = value.trim();
    if (trimmed === "true" || trimmed === "false") {
        return trimmed === "true";
    }
    if (!Number.isNaN(Number(trimmed)) && trimmed !== "") {
        return Number(trimmed);
    }
    if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || (trimmed.startsWith("{") && trimmed.endsWith("}"))) {
        try {
            return JSON.parse(trimmed);
        } catch (error) {
            return trimmed;
        }
    }
    if (trimmed.includes(",")) {
        return trimmed
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return trimmed;
}

function processArray(lines) {
    return lines
        .map((line) => line.replace(/^\s*-\s*/, ""))
        .filter(Boolean)
        .map((item) => normaliseValue(item));
}

function parseFrontmatter(lines) {
    const data = {};
    let currentKey = null;
    let buffer = [];

    const flush = () => {
        if (!currentKey) return;
        if (buffer.length === 0) {
            data[currentKey] = "";
        } else if (buffer.every((line) => /^\s*-/.test(line))) {
            data[currentKey] = processArray(buffer);
        } else {
            data[currentKey] = buffer.join("\n").trim();
        }
        currentKey = null;
        buffer = [];
    };

    lines.forEach((line) => {
        const keyMatch = line.match(/^([A-Za-z0-9_-]+)\s*:/);
        if (keyMatch) {
            flush();
            currentKey = keyMatch[1];
            const value = line.slice(keyMatch[0].length).trim();
            if (value) {
                data[currentKey] = normaliseValue(value);
                currentKey = null;
            }
        } else if (currentKey) {
            buffer.push(line);
        }
    });

    flush();
    return data;
}

export default function matter(input) {
    const raw = typeof input === "string" ? input : String(input ?? "");
    const lines = raw.split(/\r?\n/);
    if (!lines.length || !FRONTMATTER_BOUNDARY.test(lines[0])) {
        return {
            content: raw.trim(),
            data: {},
            matter: ""
        };
    }

    let endIndex = -1;
    for (let i = 1; i < lines.length; i += 1) {
        if (FRONTMATTER_BOUNDARY.test(lines[i])) {
            endIndex = i;
            break;
        }
    }

    if (endIndex === -1) {
        return {
            content: raw.trim(),
            data: {},
            matter: ""
        };
    }

    const frontmatterLines = lines.slice(1, endIndex);
    const bodyLines = lines.slice(endIndex + 1);
    const data = parseFrontmatter(frontmatterLines);

    return {
        content: bodyLines.join("\n").trim(),
        data,
        matter: frontmatterLines.join("\n")
    };
}
