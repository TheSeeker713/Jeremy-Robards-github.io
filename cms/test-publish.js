#!/usr/bin/env node

/**
 * Quick publish test script
 *
 * This script validates the publish module without actually deploying.
 * Run with: node cms/test-publish.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🧪 Testing CMS Publish Module\n');

// Test 1: Check .env file exists
console.log('1️⃣  Checking .env file...');
const envPath = path.join(ROOT_DIR, '.env');
try {
  await fs.access(envPath);
  console.log('   ✓ .env file exists');

  const envContent = await fs.readFile(envPath, 'utf-8');
  const hasAccountId = /CF_ACCOUNT_ID=.+/.test(envContent);
  const hasApiToken = /CF_API_TOKEN=.+/.test(envContent);
  const hasProject = /CF_PAGES_PROJECT=.+/.test(envContent);

  if (hasAccountId) {console.log('   ✓ CF_ACCOUNT_ID is set');}
  else {console.log('   ✗ CF_ACCOUNT_ID is missing or empty');}

  if (hasApiToken) {console.log('   ✓ CF_API_TOKEN is set');}
  else {console.log('   ✗ CF_API_TOKEN is missing or empty');}

  if (hasProject) {console.log('   ✓ CF_PAGES_PROJECT is set');}
  else {console.log('   ✗ CF_PAGES_PROJECT is missing or empty');}
} catch {
  console.log('   ✗ .env file not found');
  console.log('   → Copy .env.example to .env and configure credentials');
}

// Test 2: Check dist directory
console.log('\n2️⃣  Checking dist directory...');
const distPath = path.join(ROOT_DIR, 'dist');
try {
  const stat = await fs.stat(distPath);
  if (stat.isDirectory()) {
    console.log('   ✓ dist/ directory exists');
    const entries = await fs.readdir(distPath);
    console.log(`   ✓ Contains ${entries.length} items`);
  } else {
    console.log('   ✗ dist/ is not a directory');
  }
} catch {
  console.log('   ✗ dist/ directory not found');
  console.log('   → Run export script to build dist/');
}

// Test 3: Check wrangler installation
console.log('\n3️⃣  Checking wrangler CLI...');
import { spawn } from 'child_process';

const checkWrangler = new Promise((resolve) => {
  const wrangler = spawn('wrangler', ['--version'], {
    shell: process.platform === 'win32',
    stdio: 'pipe',
  });

  let output = '';
  wrangler.stdout?.on('data', (data) => {
    output += data.toString();
  });

  wrangler.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.log('   ✗ wrangler not found');
      console.log('   → Install: npm install -g wrangler');
      resolve(false);
    } else {
      console.log('   ✗ Error checking wrangler:', error.message);
      resolve(false);
    }
  });

  wrangler.on('close', (code) => {
    if (code === 0) {
      const version = output.trim().split('\n')[0];
      console.log(`   ✓ wrangler installed: ${version}`);
      resolve(true);
    } else {
      console.log('   ✗ wrangler check failed');
      resolve(false);
    }
  });
});

await checkWrangler;

// Test 4: Check logs directory
console.log('\n4️⃣  Checking logs directory...');
const logsPath = path.join(__dirname, 'logs');
try {
  await fs.access(logsPath);
  console.log('   ✓ cms/logs/ directory exists');
} catch {
  console.log('   ℹ️  cms/logs/ will be created on first publish');
}

// Test 5: Validate publish.js module
console.log('\n5️⃣  Validating publish module...');
try {
  const publishPath = path.join(__dirname, 'publish.js');
  await fs.access(publishPath);
  console.log('   ✓ cms/publish.js exists');

  // Try importing (without calling)
  const { publish } = await import('./publish.js');
  if (typeof publish === 'function') {
    console.log('   ✓ publish() function exported');
  } else {
    console.log('   ✗ publish() is not a function');
  }
} catch (error) {
  console.log('   ✗ Error loading publish module:', error.message);
}

console.log('\n✅ Pre-flight checks complete');
console.log('\n📝 To test publish:');
console.log('   npm run cms:publish');
console.log('\n📚 Documentation:');
console.log('   cms/PUBLISH_README.md');
