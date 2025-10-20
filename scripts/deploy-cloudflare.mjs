#!/usr/bin/env node

/**
 * Cloudflare Deployment Orchestrator
 * 
 * Automates the complete deployment sequence:
 * 1. Main portfolio (Project A)
 * 2. Article worker (routing proxy)
 * 3. Optional: Sample article (Project B)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ============================================================================
// Configuration
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const PROJECTS = {
  mainSite: {
    name: 'jeremyrobards-site',
    type: 'Pages',
    description: 'Main Portfolio',
    required: true,
  },
  worker: {
    name: 'jr-articles-mount',
    type: 'Worker',
    description: 'Article Proxy',
    required: true,
  },
  articles: {
    name: 'jr-articles',
    type: 'Pages',
    description: 'CMS Articles',
    required: false,
  },
};

// ============================================================================
// Utilities
// ============================================================================

function log(message, color = '') {
  console.log(`${color}${message}${COLORS.reset}`);
}

function success(message) {
  log(`✅ ${message}`, COLORS.green);
}

function error(message) {
  log(`❌ ${message}`, COLORS.red);
}

function warning(message) {
  log(`⚠️  ${message}`, COLORS.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, COLORS.cyan);
}

function section(title) {
  console.log();
  log(`${'='.repeat(80)}`, COLORS.bright);
  log(title.toUpperCase(), COLORS.bright + COLORS.magenta);
  log(`${'='.repeat(80)}`, COLORS.bright);
  console.log();
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: options.cwd || ROOT_DIR,
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
    });
    return { success: true, output: result };
  } catch (err) {
    return { success: false, error: err, output: err.stdout || err.message };
  }
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${COLORS.cyan}${question}${COLORS.reset} `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

// ============================================================================
// Pre-Flight Checks
// ============================================================================

async function runPreFlightChecks() {
  section('Pre-Flight Checks');

  const checks = [
    { name: 'Wrangler CLI', command: 'wrangler --version' },
    { name: 'Node.js', command: 'node --version' },
    { name: 'npm', command: 'npm --version' },
  ];

  let allPassed = true;

  for (const check of checks) {
    const result = runCommand(check.command, { silent: true });
    if (result.success) {
      success(`${check.name}: ${result.output.trim()}`);
    } else {
      error(`${check.name}: Not found`);
      allPassed = false;
    }
  }

  // Check for .env or environment variables
  const envPath = path.join(ROOT_DIR, '.env');
  if (fs.existsSync(envPath)) {
    success('.env file found');
  } else {
    warning('.env file not found (may need CF_ACCOUNT_ID for worker)');
  }

  if (!allPassed) {
    error('Pre-flight checks failed. Please install missing dependencies.');
    process.exit(1);
  }

  console.log();
  return true;
}

// ============================================================================
// Deployment Steps
// ============================================================================

async function deployMainSite() {
  section(`Deploying Main Portfolio (${PROJECTS.mainSite.name})`);

  info('Deploying to Cloudflare Pages...');
  const result = runCommand('npm run deploy');

  if (result.success) {
    success('Main site deployed successfully!');
    info('Available at: https://jeremyrobards-site.pages.dev');
    info('Custom domain: https://www.jeremyrobards.com');
    return true;
  } else {
    error('Main site deployment failed');
    return false;
  }
}

async function deployWorker() {
  section(`Deploying Article Worker (${PROJECTS.worker.name})`);

  const workerDir = path.join(ROOT_DIR, 'worker');

  // Check if worker directory exists
  if (!fs.existsSync(workerDir)) {
    error('Worker directory not found');
    return false;
  }

  info('Deploying worker...');
  const result = runCommand('npm run deploy', { cwd: workerDir });

  if (result.success) {
    success('Worker deployed successfully!');
    info('Handles routes: www.jeremyrobards.com/article/*');
    return true;
  } else {
    error('Worker deployment failed');
    return false;
  }
}

async function deploySampleArticle() {
  section(`Deploying Sample Article (${PROJECTS.articles.name})`);

  const distDir = path.join(ROOT_DIR, 'dist');

  // Check if dist/ exists
  if (!fs.existsSync(distDir)) {
    warning('No dist/ directory found');
    info('Run `npm run cms:export` first to generate articles');
    return false;
  }

  info('Deploying articles to Cloudflare Pages...');
  const result = runCommand(
    `wrangler pages deploy dist --project-name ${PROJECTS.articles.name} --branch production`
  );

  if (result.success) {
    success('Articles deployed successfully!');
    info('Available at: https://jr-articles.pages.dev');
    return true;
  } else {
    error('Article deployment failed');
    return false;
  }
}

// ============================================================================
// Post-Deploy Verification
// ============================================================================

async function verifyDeployment() {
  section('Post-Deploy Verification');

  info('Deployment complete. Please verify:');
  console.log();

  log('1. Main Site:', COLORS.bright);
  log('   → https://www.jeremyrobards.com');
  log('   → Test navigation, theme toggle, responsiveness');
  console.log();

  log('2. Worker:', COLORS.bright);
  log('   → Check logs: cd worker && npm run worker:tail');
  log('   → Test route: https://www.jeremyrobards.com/article/test');
  console.log();

  log('3. Articles (if deployed):', COLORS.bright);
  log('   → https://jr-articles.pages.dev/article/...');
  log('   → Verify images, styles, content');
  console.log();

  log('4. Performance:', COLORS.bright);
  log('   → Run Lighthouse: npx lighthouse https://www.jeremyrobards.com');
  log('   → Check Cloudflare Analytics');
  console.log();

  log('5. Security:', COLORS.bright);
  log('   → Test headers: curl -I https://www.jeremyrobards.com');
  log('   → SSL Labs: https://www.ssllabs.com/ssltest/');
  console.log();
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.clear();
  log('🚀 CLOUDFLARE DEPLOYMENT ORCHESTRATOR', COLORS.bright + COLORS.cyan);
  log('Portfolio Website - Automated Deployment', COLORS.cyan);
  console.log();

  try {
    // Run pre-flight checks
    await runPreFlightChecks();

    // Confirm deployment
    const confirm = await promptUser('Deploy to production? (yes/no):');
    if (confirm !== 'yes' && confirm !== 'y') {
      warning('Deployment cancelled by user');
      process.exit(0);
    }

    const results = {};

    // Step 1: Deploy main site
    results.mainSite = await deployMainSite();
    if (!results.mainSite) {
      error('Main site deployment failed. Stopping.');
      process.exit(1);
    }

    // Step 2: Deploy worker
    results.worker = await deployWorker();
    if (!results.worker) {
      warning('Worker deployment failed. Main site is live but /article/* routing may not work.');
    }

    // Step 3: Deploy articles (optional)
    const deployArticles = await promptUser('Deploy articles? (yes/no):');
    if (deployArticles === 'yes' || deployArticles === 'y') {
      results.articles = await deploySampleArticle();
    } else {
      info('Skipping article deployment');
    }

    // Post-deploy verification
    await verifyDeployment();

    // Summary
    section('Deployment Summary');
    log('Main Site:', results.mainSite ? '✅ Success' : '❌ Failed', results.mainSite ? COLORS.green : COLORS.red);
    log('Worker:', results.worker ? '✅ Success' : '❌ Failed', results.worker ? COLORS.green : COLORS.red);
    if (results.articles !== undefined) {
      log('Articles:', results.articles ? '✅ Success' : '❌ Failed', results.articles ? COLORS.green : COLORS.red);
    }

    console.log();
    const allSucceeded = results.mainSite && results.worker;
    if (allSucceeded) {
      success('🎉 Deployment completed successfully!');
    } else {
      warning('⚠️  Deployment completed with warnings');
    }

  } catch (err) {
    error(`Deployment failed with error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
