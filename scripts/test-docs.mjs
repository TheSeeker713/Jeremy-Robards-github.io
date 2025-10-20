#!/usr/bin/env node
/**
 * Documentation Test Suite
 * Tests documentation for broken links, spelling errors, and command validity
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('📚 Running Documentation Tests...\n');

const results = {
  linkCheck: { passed: 0, failed: 0, errors: [] },
  spellCheck: { passed: 0, failed: 0, errors: [] },
  commandCheck: { passed: 0, failed: 0, errors: [] },
};

// ==========================================
// 1. Link Checking
// ==========================================
console.log('🔗 Checking markdown links...\n');

const mdFiles = [
  'README.md',
  'CMS_README.md',
  'CMS_SCRIPTS.md',
  'CLEANUP_SUMMARY.md',
  'worker/README.md',
  'cms/README.md',
  'cms/SERVER_README.md',
  'cms/PUBLISH_README.md',
];

for (const file of mdFiles) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⏭️  Skipped: ${file} (not found)`);
    continue;
  }

  try {
    execSync(
      `npx markdown-link-check "${filePath}" --config .markdown-link-check.json --quiet`,
      { stdio: 'pipe', cwd: ROOT }
    );
    results.linkCheck.passed++;
    console.log(`  ✅ ${file}`);
  } catch (error) {
    results.linkCheck.failed++;
    results.linkCheck.errors.push({ file, error: error.message });
    console.log(`  ❌ ${file} - has broken links`);
  }
}

// ==========================================
// 2. Spell Checking
// ==========================================
console.log('\n📝 Checking spelling...\n');

for (const file of mdFiles) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  try {
    execSync(`npx cspell "${filePath}" --config .cspell.json`, {
      stdio: 'pipe',
      cwd: ROOT,
    });
    results.spellCheck.passed++;
    console.log(`  ✅ ${file}`);
  } catch (error) {
    // cspell exits with error code if misspellings found
    const output = error.stdout?.toString() || error.message;
    if (output.includes('Unknown word')) {
      results.spellCheck.failed++;
      results.spellCheck.errors.push({ file, error: 'Spelling errors found' });
      console.log(`  ⚠️  ${file} - has spelling issues`);
    } else {
      results.spellCheck.passed++;
      console.log(`  ✅ ${file}`);
    }
  }
}

// ==========================================
// 3. Command Validation (Smoke Test)
// ==========================================
console.log('\n🧪 Validating npm scripts in docs...\n');

// Get actual npm scripts from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')
);
const validScripts = Object.keys(packageJson.scripts);

// Patterns to find npm commands in markdown
const npmCommandPattern = /`npm run ([a-z:_-]+)`/g;

for (const file of mdFiles) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [...content.matchAll(npmCommandPattern)];

  let fileHasErrors = false;
  const invalidCommands = [];

  for (const match of matches) {
    const scriptName = match[1];
    if (!validScripts.includes(scriptName)) {
      fileHasErrors = true;
      invalidCommands.push(scriptName);
    }
  }

  if (fileHasErrors) {
    results.commandCheck.failed++;
    results.commandCheck.errors.push({ file, commands: invalidCommands });
    console.log(`  ❌ ${file} - invalid commands: ${invalidCommands.join(', ')}`);
  } else if (matches.length > 0) {
    results.commandCheck.passed++;
    console.log(`  ✅ ${file} - all commands valid`);
  } else {
    console.log(`  ⏭️  ${file} - no commands found`);
  }
}

// ==========================================
// Summary
// ==========================================
console.log('\n' + '='.repeat(50));
console.log('📊 Documentation Test Summary\n');

console.log('🔗 Link Check:');
console.log(`   Passed: ${results.linkCheck.passed}`);
console.log(`   Failed: ${results.linkCheck.failed}`);

console.log('\n📝 Spell Check:');
console.log(`   Passed: ${results.spellCheck.passed}`);
console.log(`   Failed: ${results.spellCheck.failed}`);

console.log('\n🧪 Command Validation:');
console.log(`   Passed: ${results.commandCheck.passed}`);
console.log(`   Failed: ${results.commandCheck.failed}`);

const totalTests =
  results.linkCheck.passed +
  results.linkCheck.failed +
  results.spellCheck.passed +
  results.spellCheck.failed +
  results.commandCheck.passed +
  results.commandCheck.failed;

const totalPassed =
  results.linkCheck.passed + results.spellCheck.passed + results.commandCheck.passed;

console.log(`\nTotal: ${totalPassed}/${totalTests} tests passed`);

// Save results
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total: totalTests,
    passed: totalPassed,
    failed: totalTests - totalPassed,
  },
  details: results,
};

fs.writeFileSync(
  path.join(ROOT, 'reports', 'docs-test-results.json'),
  JSON.stringify(report, null, 2)
);

console.log('\n📁 Full results saved to: reports/docs-test-results.json');
console.log('='.repeat(50) + '\n');

// Exit with error if any tests failed
if (totalTests - totalPassed > 0) {
  console.log('❌ Some documentation tests failed. Please review and fix.\n');
  process.exit(1);
} else {
  console.log('✅ All documentation tests passed!\n');
  process.exit(0);
}
