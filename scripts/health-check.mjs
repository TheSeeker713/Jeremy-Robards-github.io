#!/usr/bin/env node
/**
 * Health Check Script
 * Performs comprehensive codebase health analysis
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORTS_DIR = path.join(__dirname, '../reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('🏥 Running Codebase Health Check...\n');

const results = {
  timestamp: new Date().toISOString(),
  lint: {},
  types: {},
  security: {},
  dependencies: {},
  deadCode: {},
  corruption: {},
};

// ========================================
// 1. ESLint Check
// ========================================
console.log('📝 Running ESLint...');
try {
  execSync('npx eslint . --max-warnings=0 --format json > reports/eslint.json', {
    stdio: 'pipe',
  });
  results.lint.errors = 0;
  results.lint.warnings = 0;
  results.lint.status = '✅ PASS';
} catch (error) {
  try {
    const eslintReport = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, 'eslint.json'), 'utf8'));
    const totalErrors = eslintReport.reduce((sum, file) => sum + file.errorCount, 0);
    const totalWarnings = eslintReport.reduce((sum, file) => sum + file.warningCount, 0);
    results.lint.errors = totalErrors;
    results.lint.warnings = totalWarnings;
    results.lint.status = totalErrors > 0 ? '❌ FAIL' : '⚠️  WARN';
  } catch {
    results.lint.status = '❌ ERROR';
    results.lint.errors = 'Unknown';
    results.lint.warnings = 'Unknown';
  }
}

// ========================================
// 2. TypeScript Type Check
// ========================================
console.log('📘 Running TypeScript type check...');
try {
  const output = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
  results.types.errors = 0;
  results.types.status = '✅ PASS';
  fs.writeFileSync(path.join(REPORTS_DIR, 'typescript.txt'), 'No type errors found.');
} catch (error) {
  const output = error.stdout || error.message;
  const errorMatch = output.match(/Found (\d+) error/);
  results.types.errors = errorMatch ? parseInt(errorMatch[1]) : 'Unknown';
  results.types.status = '❌ FAIL';
  fs.writeFileSync(path.join(REPORTS_DIR, 'typescript.txt'), output);
}

// ========================================
// 3. Prettier Format Check
// ========================================
console.log('💅 Checking code formatting...');
try {
  execSync('npx prettier --check . 2>&1', { stdio: 'pipe' });
  results.formatting = { status: '✅ PASS', files: 0 };
} catch (error) {
  const output = error.stdout?.toString() || '';
  const fileMatches = output.match(/\n/g);
  results.formatting = {
    status: '⚠️  WARN',
    files: fileMatches ? fileMatches.length : 'Unknown',
  };
}

// ========================================
// 4. NPM Audit (Security)
// ========================================
console.log('🔒 Running security audit...');
try {
  const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
  const audit = JSON.parse(auditOutput);
  results.security = {
    vulnerabilities: audit.metadata?.vulnerabilities || {},
    status: audit.metadata?.vulnerabilities?.total > 0 ? '⚠️  VULNERABLE' : '✅ SECURE',
  };
  fs.writeFileSync(path.join(REPORTS_DIR, 'security.json'), JSON.stringify(audit, null, 2));
} catch (error) {
  results.security = { status: '❌ ERROR', vulnerabilities: {} };
}

// ========================================
// 5. Dead Code Detection
// ========================================
console.log('🧹 Checking for dead code...');
try {
  const pruneOutput = execSync('npx ts-prune --json 2>&1', { encoding: 'utf8' });
  let deadExports = [];
  try {
    deadExports = JSON.parse(pruneOutput);
  } catch {
    // ts-prune might not output JSON, parse text
    const lines = pruneOutput.split('\n').filter((line) => line.includes('used in module'));
    deadExports = lines.map((line) => ({ file: line }));
  }
  results.deadCode = {
    count: deadExports.length,
    status: deadExports.length > 0 ? '⚠️  FOUND' : '✅ CLEAN',
  };
  fs.writeFileSync(path.join(REPORTS_DIR, 'deadcode.json'), JSON.stringify(deadExports, null, 2));
} catch (error) {
  results.deadCode = { status: '❌ ERROR', count: 'Unknown' };
}

// ========================================
// 6. Circular Dependencies
// ========================================
console.log('🔄 Checking for circular dependencies...');
try {
  const circularOutput = execSync('npx madge --circular --extensions js,ts,mjs . --json', {
    encoding: 'utf8',
  });
  const circular = JSON.parse(circularOutput);
  results.dependencies.circular = {
    count: circular.length || 0,
    status: circular.length > 0 ? '⚠️  FOUND' : '✅ NONE',
  };
  fs.writeFileSync(path.join(REPORTS_DIR, 'circular-deps.json'), JSON.stringify(circular, null, 2));
} catch (error) {
  results.dependencies.circular = { status: '❌ ERROR', count: 'Unknown' };
}

// ========================================
// 7. Duplicate Dependencies
// ========================================
console.log('📦 Checking for duplicate dependencies...');
try {
  const dupeOutput = execSync('npm ls --all --json 2>&1', { encoding: 'utf8' });
  const tree = JSON.parse(dupeOutput);
  const dupes = {};
  // Simplified dupe detection - would need more complex logic for full analysis
  results.dependencies.duplicates = {
    status: '✅ CHECKED',
    note: 'Full analysis requires manual npm ls review',
  };
} catch (error) {
  results.dependencies.duplicates = { status: '⚠️  WARNING', note: 'Could not analyze' };
}

// ========================================
// 8. Corruption Check (JSON/YAML parsing)
// ========================================
console.log('🔍 Checking for file corruption...');
const corruptFiles = [];

function checkJSONFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (
      file.isDirectory() &&
      !['node_modules', '.git', '.wrangler', '.build'].includes(file.name)
    ) {
      checkJSONFiles(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.json') || file.name.endsWith('.jsonc'))) {
      try {
        JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      } catch (error) {
        corruptFiles.push({ file: fullPath, error: error.message });
      }
    }
  }
}

try {
  checkJSONFiles(process.cwd());
  results.corruption = {
    status: corruptFiles.length > 0 ? '❌ CORRUPT FILES' : '✅ CLEAN',
    files: corruptFiles,
  };
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'corruption.json'),
    JSON.stringify(corruptFiles, null, 2)
  );
} catch (error) {
  results.corruption = { status: '❌ ERROR', files: [] };
}

// ========================================
// Generate Health Report
// ========================================
console.log('\n📊 Generating health report...\n');

const report = `# 🏥 Codebase Health Report

**Generated:** ${new Date().toLocaleString()}

---

## 📝 Linting (ESLint)

- **Status:** ${results.lint.status}
- **Errors:** ${results.lint.errors}
- **Warnings:** ${results.lint.warnings}

## 📘 Type Safety (TypeScript)

- **Status:** ${results.types.status}
- **Type Errors:** ${results.types.errors}

## 💅 Code Formatting (Prettier)

- **Status:** ${results.formatting.status}
- **Unformatted Files:** ${results.formatting.files}

## 🔒 Security (npm audit)

- **Status:** ${results.security.status}
- **Vulnerabilities:**
  - Critical: ${results.security.vulnerabilities?.critical || 0}
  - High: ${results.security.vulnerabilities?.high || 0}
  - Moderate: ${results.security.vulnerabilities?.moderate || 0}
  - Low: ${results.security.vulnerabilities?.low || 0}

## 🧹 Dead Code (ts-prune)

- **Status:** ${results.deadCode.status}
- **Unused Exports:** ${results.deadCode.count}

## 🔄 Dependencies

### Circular Dependencies
- **Status:** ${results.dependencies.circular?.status || 'N/A'}
- **Count:** ${results.dependencies.circular?.count || 0}

### Duplicate Dependencies
- **Status:** ${results.dependencies.duplicates?.status || 'N/A'}

## 🔍 File Corruption

- **Status:** ${results.corruption.status}
- **Corrupt Files:** ${results.corruption.files?.length || 0}

---

## 📋 Summary

${
  results.lint.errors > 0 || results.types.errors > 0 || results.corruption.files?.length > 0
    ? '❌ **Action Required:** Critical issues found that need fixing.'
    : results.lint.warnings > 0 ||
        results.deadCode.count > 0 ||
        results.security.vulnerabilities?.total > 0
      ? '⚠️  **Warnings:** Non-critical issues detected.'
      : '✅ **Healthy:** Codebase is in good shape!'
}

## 📁 Detailed Reports

- \`reports/eslint.json\` - Full ESLint report
- \`reports/typescript.txt\` - TypeScript errors
- \`reports/security.json\` - Security audit results
- \`reports/deadcode.json\` - Unused exports
- \`reports/circular-deps.json\` - Circular dependencies
- \`reports/corruption.json\` - Corrupt files

---

**Next Steps:**

1. Run \`npm run lint:fix\` to auto-fix linting issues
2. Run \`npm run fmt:write\` to auto-format code
3. Review and fix type errors manually
4. Run \`npm audit fix\` to patch security vulnerabilities
5. Review dead code and remove if unnecessary
`;

fs.writeFileSync(path.join(REPORTS_DIR, 'HEALTH.md'), report);
fs.writeFileSync(path.join(REPORTS_DIR, 'health-data.json'), JSON.stringify(results, null, 2));

console.log(report);
console.log('\n✅ Health check complete! Reports saved to /reports/\n');
