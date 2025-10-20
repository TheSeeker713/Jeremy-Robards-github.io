#!/usr/bin/env node

/**
 * Automated Dogfood Cycle Launcher
 * Opens editor with review tools and sample files
 */

import { spawn } from 'child_process';
import { platform } from 'os';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EDITOR_URL = 'http://localhost:5173/editor/?debug=true';
const CMS_COMMAND = 'npm';
const CMS_ARGS = ['run', 'cms:dev'];

let cmsProcess = null;

/**
 * Open URL in default browser
 */
function openBrowser(url) {
  const cmd = platform() === 'win32' ? 'start' : platform() === 'darwin' ? 'open' : 'xdg-open';

  const child =
    platform() === 'win32'
      ? spawn('cmd', ['/c', 'start', url], { stdio: 'ignore', detached: true })
      : spawn(cmd, [url], { stdio: 'ignore', detached: true });

  child.unref();
}

/**
 * Start CMS dev server
 */
function startCMS() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting CMS dev server...');

    cmsProcess = spawn(CMS_COMMAND, CMS_ARGS, {
      stdio: 'inherit',
      shell: true,
    });

    cmsProcess.on('error', (error) => {
      console.error('Failed to start CMS:', error);
      reject(error);
    });

    // Wait for server to be ready
    setTimeout(() => {
      console.log('✅ CMS server started\n');
      resolve();
    }, 5000);
  });
}

/**
 * Check if fixtures exist
 */
function checkFixtures() {
  const fixturesDir = join(__dirname, '../tests/fixtures');
  const required = ['sample-article.md', 'sample-article.json'];

  console.log('📂 Checking test fixtures...');

  if (!existsSync(fixturesDir)) {
    console.warn('⚠️  Fixtures directory not found:', fixturesDir);
    console.warn('   Run: npm run generate-fixtures');
    return false;
  }

  const missing = required.filter((file) => !existsSync(join(fixturesDir, file)));

  if (missing.length > 0) {
    console.warn('⚠️  Missing fixtures:', missing.join(', '));
    console.warn('   Run: npm run generate-fixtures');
    return false;
  }

  console.log('✅ Fixtures ready\n');
  return true;
}

/**
 * Display instructions
 */
function showInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('🐕 DOGFOOD CYCLE - Manual Testing Guide');
  console.log('='.repeat(60));
  console.log('\n📋 TESTING CHECKLIST:\n');
  console.log('  Phase 1: Import Flow (8 min)');
  console.log('    □ Drag/drop sample-article.md');
  console.log('    □ Browse to sample-article.json');
  console.log('    □ Try malformed.md (error testing)');
  console.log('');
  console.log('  Phase 2: Editing (10 min)');
  console.log('    □ Add paragraph, heading, image blocks');
  console.log('    □ Reorder with drag/drop');
  console.log('    □ Delete blocks');
  console.log('    □ Test keyboard navigation (Tab through)');
  console.log('');
  console.log('  Phase 3: Metadata & Preview (7 min)');
  console.log('    □ Fill metadata form');
  console.log('    □ Watch live preview update');
  console.log('    □ Test validation (submit without required)');
  console.log('');
  console.log('  Phase 4: Export & Publish (5 min)');
  console.log('    □ Export to dist/');
  console.log('    □ Verify HTML output');
  console.log('    □ (Optional) Publish to Cloudflare');
  console.log('');
  console.log('  Phase 5: Review Tools (5 min)');
  console.log('    □ Ctrl+R - Review Mode (spacing/contrast)');
  console.log('    □ Ctrl+A - Accessibility Check');
  console.log('    □ Ctrl+U - UX Checklist');
  console.log('    □ Ctrl+F - Submit Feedback');
  console.log('\n' + '='.repeat(60));
  console.log('⚡ KEYBOARD SHORTCUTS:');
  console.log('='.repeat(60));
  console.log('  Ctrl+R : Toggle Review Mode');
  console.log('  Ctrl+A : Run Accessibility Audit');
  console.log('  Ctrl+U : Open UX Checklist');
  console.log('  Ctrl+F : Open Feedback Drawer');
  console.log('\n' + '='.repeat(60));
  console.log('📝 AFTER TESTING:');
  console.log('='.repeat(60));
  console.log('  1. Run: npm run feedback:digest');
  console.log('  2. Review: reports/feedback-digest.md');
  console.log('  3. Triage: Create GitHub issues for P0/P1');
  console.log('  4. Fix blockers before next release');
  console.log('\n' + '='.repeat(60));
  console.log('💡 TIPS:');
  console.log('='.repeat(60));
  console.log('  • Test slowly - observe everything');
  console.log('  • Use review tools liberally');
  console.log('  • Screenshot issues (built into Feedback drawer)');
  console.log("  • Test with keyboard only (no mouse)");
  console.log('  • Throttle network in DevTools (Fast 3G)');
  console.log('  • Check responsive views (mobile, tablet)');
  console.log('\n');
}

/**
 * Cleanup on exit
 */
function cleanup() {
  if (cmsProcess) {
    console.log('\n🛑 Stopping CMS server...');
    cmsProcess.kill();
  }
  process.exit(0);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🐕 DOGFOOD CYCLE LAUNCHER\n');

  // Check fixtures
  checkFixtures();

  // Start CMS server
  try {
    await startCMS();
  } catch (error) {
    console.error('Failed to start CMS server');
    process.exit(1);
  }

  // Open browser
  console.log('🌐 Opening editor in browser...');
  console.log(`   URL: ${EDITOR_URL}\n`);
  openBrowser(EDITOR_URL);

  // Show instructions
  showInstructions();

  // Wait for user to finish testing
  console.log('Press Ctrl+C to stop server and exit...\n');

  // Handle cleanup
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep process alive
  setInterval(() => {}, 1000);
}

main().catch((error) => {
  console.error('Dogfood cycle failed:', error);
  cleanup();
});
