#!/usr/bin/env node
/**
 * File Inventory Generator
 * Creates comprehensive inventory of all source files with metadata
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.join(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');

// Directories to ignore
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  '.wrangler',
  '.build',
  'dist',
  'docs-archive',
  'assets',
  'public',
];

// File extensions to analyze
const SOURCE_EXTENSIONS = ['.js', '.mjs', '.ts', '.tsx', '.jsx', '.css', '.html'];

console.log('📦 Generating file inventory...\n');

const inventory = {
  generatedAt: new Date().toISOString(),
  totalFiles: 0,
  totalSize: 0,
  byType: {},
  files: [],
};

/**
 * Get file stats and metadata
 */
function getFileInfo(filePath) {
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(ROOT, filePath);
  const ext = path.extname(filePath);

  // Get git info if available
  let lastModified = stats.mtime;
  let lastCommitAuthor = 'unknown';
  try {
    const gitDate = execSync(`git log -1 --format=%ci "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (gitDate) {
      lastModified = new Date(gitDate);
    }
    
    lastCommitAuthor = execSync(`git log -1 --format=%an "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch (error) {
    // Git info not available, use file stats
  }

  // Count lines for source files
  let lines = 0;
  if (SOURCE_EXTENSIONS.includes(ext)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      lines = content.split('\n').length;
    } catch (error) {
      // Skip binary files
    }
  }

  return {
    path: relativePath,
    fullPath: filePath,
    name: path.basename(filePath),
    ext,
    size: stats.size,
    lines,
    lastModified: lastModified.toISOString(),
    lastCommitAuthor,
    category: categorizeFile(relativePath),
  };
}

/**
 * Categorize file by directory/purpose
 */
function categorizeFile(filePath) {
  if (filePath.startsWith('cms/')) {
    return 'cms-backend';
  }
  if (filePath.startsWith('editor/')) {
    return 'cms-editor';
  }
  if (filePath.startsWith('worker/')) {
    return 'cloudflare-worker';
  }
  if (filePath.startsWith('js/')) {
    return 'frontend-js';
  }
  if (filePath.startsWith('css/')) {
    return 'frontend-css';
  }
  if (filePath.startsWith('templates/')) {
    return 'templates';
  }
  if (filePath.startsWith('shared/')) {
    return 'shared-utilities';
  }
  if (filePath.startsWith('scripts/')) {
    return 'build-scripts';
  }
  if (filePath.endsWith('.html')) {
    return 'html-pages';
  }
  if (filePath.endsWith('.md')) {
    return 'documentation';
  }
  if (filePath.includes('config') || filePath.includes('rc')) {
    return 'configuration';
  }
  return 'other';
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const info = getFileInfo(fullPath);
      inventory.files.push(info);
      inventory.totalFiles++;
      inventory.totalSize += info.size;

      // Count by type
      const ext = info.ext || 'no-extension';
      inventory.byType[ext] = (inventory.byType[ext] || 0) + 1;
    }
  }
}

/**
 * Analyze imports and dependencies
 */
function analyzeImports() {
  console.log('🔍 Analyzing imports and dependencies...\n');

  const jsFiles = inventory.files.filter((f) =>
    ['.js', '.mjs', '.ts'].includes(f.ext)
  );

  for (const file of jsFiles) {
    try {
      const content = fs.readFileSync(file.fullPath, 'utf8');
      const imports = [];
      const exports = [];

      // Match ES6 imports
      const importMatches = content.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g);
      for (const match of importMatches) {
        imports.push(match[1]);
      }

      // Match require()
      const requireMatches = content.matchAll(/require\(['"](.+?)['"]\)/g);
      for (const match of requireMatches) {
        imports.push(match[1]);
      }

      // Match exports
      if (content.includes('export default') || content.includes('export {')) {
        exports.push('default or named');
      }
      if (content.includes('module.exports')) {
        exports.push('commonjs');
      }

      file.imports = imports;
      file.exports = exports;
      file.hasImports = imports.length > 0;
      file.hasExports = exports.length > 0;
    } catch (error) {
      file.imports = [];
      file.exports = [];
      file.hasImports = false;
      file.hasExports = false;
    }
  }
}

/**
 * Find files with no importers (potential dead code)
 */
function findDeadCode() {
  console.log('🧹 Finding potential dead code...\n');

  const jsFiles = inventory.files.filter((f) =>
    ['.js', '.mjs', '.ts'].includes(f.ext)
  );

  const deadCode = [];

  for (const file of jsFiles) {
    // Skip entry points
    if (
      file.name === 'main.js' ||
      file.name === 'app.js' ||
      file.name === 'index.js' ||
      file.name.includes('serve') ||
      file.name.includes('setup') ||
      file.path.includes('scripts/')
    ) {
      continue;
    }

    // Check if any other file imports this one
    const isImported = jsFiles.some((otherFile) => {
      if (otherFile.path === file.path) {
        return false;
      }
      return otherFile.imports?.some((imp) => {
        const resolved = imp.replace(/^\.\//, '').replace(/^\.\.\//, '');
        return (
          resolved === file.path ||
          resolved === file.path.replace(/\.(js|mjs|ts)$/, '') ||
          imp.includes(file.name.replace(/\.(js|mjs|ts)$/, ''))
        );
      });
    });

    if (!isImported && file.hasExports) {
      deadCode.push({
        file: file.path,
        size: file.size,
        lines: file.lines,
        exports: file.exports,
      });
    }
  }

  return deadCode;
}

/**
 * Generate summary statistics
 */
function generateSummary() {
  const summary = {
    total: {
      files: inventory.totalFiles,
      size: `${(inventory.totalSize / 1024 / 1024).toFixed(2)} MB`,
      sizeBytes: inventory.totalSize,
    },
    byCategory: {},
    byExtension: inventory.byType,
  };

  // Group by category
  for (const file of inventory.files) {
    if (!summary.byCategory[file.category]) {
      summary.byCategory[file.category] = {
        count: 0,
        size: 0,
        files: [],
      };
    }
    summary.byCategory[file.category].count++;
    summary.byCategory[file.category].size += file.size;
    summary.byCategory[file.category].files.push(file.path);
  }

  // Format sizes
  for (const category in summary.byCategory) {
    const sizeMB = summary.byCategory[category].size / 1024 / 1024;
    summary.byCategory[category].sizeFormatted = `${sizeMB.toFixed(2)} MB`;
  }

  return summary;
}

// Main execution
try {
  // Scan all files
  scanDirectory(ROOT);

  // Analyze imports
  analyzeImports();

  // Find dead code
  const deadCode = findDeadCode();

  // Generate summary
  const summary = generateSummary();

  // Save inventory
  const inventoryData = {
    ...inventory,
    summary,
    deadCode: {
      count: deadCode.length,
      files: deadCode,
    },
  };

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'inventory.json'),
    JSON.stringify(inventoryData, null, 2)
  );

  // Create human-readable summary
  const humanReadable = `# 📦 File Inventory Report

**Generated:** ${new Date().toLocaleString()}

---

## 📊 Summary

- **Total Files:** ${summary.total.files}
- **Total Size:** ${summary.total.size}

## 📂 By Category

${Object.entries(summary.byCategory)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(
      ([cat, data]) =>
        `### ${cat}\n- Files: ${data.count}\n- Size: ${data.sizeFormatted}\n`
    )
    .join('\n')}

## 📄 By File Type

${Object.entries(summary.byExtension)
    .sort(([, a], [, b]) => b - a)
    .map(([ext, count]) => `- **${ext || 'no-extension'}**: ${count} files`)
    .join('\n')}

## 🧹 Potential Dead Code

**Found ${deadCode.length} files with exports but no importers**

${deadCode.length > 0 ? deadCode.map((f) => `- \`${f.file}\` (${f.lines} lines, ${(f.size / 1024).toFixed(1)} KB)`).join('\n') : '_None detected_'}

---

**Full details:** See \`reports/inventory.json\`
`;

  fs.writeFileSync(path.join(REPORTS_DIR, 'inventory-summary.md'), humanReadable);

  console.log('✅ Inventory generated!\n');
  console.log(`📊 Total files: ${summary.total.files}`);
  console.log(`📦 Total size: ${summary.total.size}`);
  console.log(`🧹 Dead code candidates: ${deadCode.length}\n`);
  console.log('📁 Reports saved:');
  console.log('   - reports/inventory.json');
  console.log('   - reports/inventory-summary.md\n');
} catch (error) {
  console.error('❌ Error generating inventory:', error);
  process.exit(1);
}
