/**
 * Cloudflare Pages Publish Helper
 *
 * Deploys the dist/ directory to Cloudflare Pages with retry logic,
 * structured logging, and JSON output parsing.
 */

import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const LOG_DIR = path.join(__dirname, 'logs');

// Load environment variables
dotenv.config({ path: path.join(ROOT_DIR, '.env') });

/**
 * @typedef {Object} PublishResult
 * @property {string} url - Deployment URL
 * @property {number} count - Number of files deployed
 * @property {number} size - Total size in bytes
 * @property {number} duration - Deployment duration in ms
 */

/**
 * @typedef {Object} PublishOptions
 * @property {number} maxRetries - Maximum retry attempts (default: 3)
 * @property {number} initialBackoff - Initial backoff delay in ms (default: 1000)
 * @property {boolean} verbose - Enable verbose logging (default: false)
 */

/**
 * Validates required environment variables for Cloudflare deployment.
 * @throws {Error} If required variables are missing
 */
function validateEnvironment() {
  const required = ['CF_ACCOUNT_ID', 'CF_API_TOKEN', 'CF_PAGES_PROJECT'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        `Please add them to your .env file:\n` +
        `  CF_ACCOUNT_ID=your-account-id\n` +
        `  CF_API_TOKEN=your-api-token\n` +
        `  CF_PAGES_PROJECT=your-project-name`
    );
  }
}

/**
 * Checks if the dist directory exists and contains files.
 * @param {string} outDir - Path to the output directory
 * @throws {Error} If directory doesn't exist or is empty
 */
async function validateDistDirectory(outDir) {
  try {
    const stat = await fs.stat(outDir);
    if (!stat.isDirectory()) {
      throw new Error(`${outDir} is not a directory`);
    }

    const entries = await fs.readdir(outDir);
    if (entries.length === 0) {
      throw new Error(`${outDir} is empty. Build your site first.`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Directory ${outDir} does not exist. Build your site first.`);
    }
    throw error;
  }
}

/**
 * Generates a timestamped log filename.
 * @returns {string} Log filename in format YYYYMMDD-HHMMSS-publish.log
 */
function generateLogFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}-publish.log`;
}

/**
 * Writes log entry to file.
 * @param {string} logPath - Path to log file
 * @param {string} message - Log message
 */
async function appendLog(logPath, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  await fs.appendFile(logPath, logEntry, 'utf-8');
}

/**
 * Spawns wrangler process and captures output.
 * @param {string} outDir - Directory to deploy
 * @param {string} projectName - Cloudflare Pages project name
 * @param {string} logPath - Path to log file
 * @param {boolean} verbose - Enable verbose output
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function runWranglerDeploy(outDir, projectName, logPath, verbose = false) {
  return new Promise((resolve, reject) => {
    const args = ['pages', 'deploy', outDir, '--project-name', projectName, '--format', 'json'];

    const env = {
      ...process.env,
      CLOUDFLARE_API_TOKEN: process.env.CF_API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
    };

    if (verbose) {
      console.log(`→ Running: wrangler ${args.join(' ')}`);
    }

    appendLog(logPath, `Command: wrangler ${args.join(' ')}`);

    const wrangler = spawn('wrangler', args, {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    let stdout = '';
    let stderr = '';

    wrangler.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      if (verbose) {
        process.stdout.write(chunk);
      }
    });

    wrangler.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      if (verbose) {
        process.stderr.write(chunk);
      }
    });

    wrangler.on('error', (error) => {
      if (error.code === 'ENOENT') {
        const installMsg =
          'Wrangler CLI not found. Install it globally:\n' +
          '  npm install -g wrangler\n' +
          'or\n' +
          '  pnpm add -g wrangler';
        appendLog(logPath, `ERROR: ${installMsg}`);
        reject(
          Object.assign(new Error(installMsg), {
            code: 'ENOENT',
            stderr: installMsg,
          })
        );
      } else {
        appendLog(logPath, `ERROR: ${error.message}`);
        reject(error);
      }
    });

    wrangler.on('close', (code) => {
      appendLog(logPath, `Exit code: ${code}`);
      appendLog(logPath, `Stdout: ${stdout.substring(0, 1000)}`);
      if (stderr) {
        appendLog(logPath, `Stderr: ${stderr.substring(0, 1000)}`);
      }

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(
          Object.assign(new Error(`Wrangler exited with code ${code}\n${stderr || stdout}`), {
            code,
            stdout,
            stderr,
          })
        );
      }
    });
  });
}

/**
 * Parses wrangler JSON output to extract deployment details.
 * @param {string} output - Raw stdout from wrangler
 * @returns {PublishResult}
 */
function parseWranglerOutput(output) {
  const result = {
    url: null,
    count: 0,
    size: 0,
    duration: 0,
  };

  try {
    // Try to parse the entire output as JSON first
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);

      // Extract URL from various possible fields
      result.url = data.url || data.deployment_url || data.preview_url || null;

      // Extract file count
      result.count = data.files?.length || data.file_count || data.assets?.length || 0;

      // Extract size (may be in different units)
      result.size = data.size || data.total_size || data.bytes || 0;

      // Extract duration
      result.duration = data.duration || data.build_time || 0;
    }
  } catch (parseError) {
    // Fall back to regex extraction if JSON parse fails
    const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.pages\.dev/);
    if (urlMatch) {
      result.url = urlMatch[0];
    }

    const countMatch = output.match(/(\d+)\s+files?/i);
    if (countMatch) {
      result.count = parseInt(countMatch[1], 10);
    }

    const sizeMatch = output.match(/(\d+(?:\.\d+)?)\s*(KB|MB|GB|bytes)/i);
    if (sizeMatch) {
      const value = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();
      const multipliers = { BYTES: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
      result.size = Math.round(value * (multipliers[unit] || 1));
    }

    const durationMatch = output.match(/(\d+(?:\.\d+)?)\s*(ms|s|seconds?)/i);
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      result.duration = unit.startsWith('s') ? value * 1000 : value;
    }
  }

  return result;
}

/**
 * Determines if an error is retryable (5xx or network errors).
 * @param {Error} error - Error object
 * @returns {boolean}
 */
function isRetryableError(error) {
  if (error.code === 'ENOENT') {
    return false; // Don't retry if wrangler is not installed
  }

  const errorText = (error.message + (error.stderr || '')).toLowerCase();

  // Check for 5xx status codes
  if (/5\d{2}/.test(errorText)) {
    return true;
  }

  // Check for common network errors
  const networkErrors = [
    'econnrefused',
    'econnreset',
    'etimedout',
    'enetunreach',
    'socket hang up',
    'network error',
  ];

  return networkErrors.some((err) => errorText.includes(err));
}

/**
 * Sleeps for specified duration.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Publishes the dist directory to Cloudflare Pages with retry logic.
 * @param {string} outDir - Path to directory to deploy (default: './dist')
 * @param {PublishOptions} options - Publish options
 * @returns {Promise<PublishResult>}
 */
export async function publish(outDir = './dist', options = {}) {
  const { maxRetries = 3, initialBackoff = 1000, verbose = false } = options;

  const startTime = Date.now();

  // Setup logging
  await fs.mkdir(LOG_DIR, { recursive: true });
  const logFilename = generateLogFilename();
  const logPath = path.join(LOG_DIR, logFilename);

  await appendLog(logPath, '=== Cloudflare Pages Deployment Started ===');
  await appendLog(logPath, `Output directory: ${outDir}`);
  await appendLog(logPath, `Max retries: ${maxRetries}`);

  try {
    // Validate environment
    if (verbose) {console.log('→ Validating environment...');}
    validateEnvironment();
    await appendLog(logPath, '✓ Environment validated');

    // Validate dist directory
    if (verbose) {console.log('→ Validating dist directory...');}
    const resolvedOutDir = path.resolve(outDir);
    await validateDistDirectory(resolvedOutDir);
    await appendLog(logPath, `✓ Directory validated: ${resolvedOutDir}`);

    const projectName = process.env.CF_PAGES_PROJECT;

    let lastError = null;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      const attemptLog = `Attempt ${attempt}/${maxRetries}`;

      if (verbose) {console.log(`\n→ ${attemptLog}`);}
      await appendLog(logPath, attemptLog);

      try {
        const { stdout, stderr } = await runWranglerDeploy(
          resolvedOutDir,
          projectName,
          logPath,
          verbose
        );

        const result = parseWranglerOutput(stdout);
        result.duration = Date.now() - startTime;

        await appendLog(logPath, '=== Deployment Successful ===');
        await appendLog(logPath, `URL: ${result.url || 'N/A'}`);
        await appendLog(logPath, `Files: ${result.count}`);
        await appendLog(logPath, `Size: ${result.size} bytes`);
        await appendLog(logPath, `Duration: ${result.duration}ms`);

        if (verbose) {
          console.log('\n✓ Deployment successful!');
          console.log(`  URL: ${result.url || 'N/A'}`);
          console.log(`  Files: ${result.count}`);
          console.log(`  Size: ${(result.size / 1024).toFixed(2)} KB`);
          console.log(`  Duration: ${(result.duration / 1000).toFixed(2)}s`);
          console.log(`  Log: ${logPath}`);
        }

        return result;
      } catch (error) {
        lastError = error;

        // Don't retry if wrangler is not installed
        if (error.code === 'ENOENT') {
          throw error;
        }

        // Check if error is retryable
        if (!isRetryableError(error)) {
          throw error;
        }

        // Calculate backoff delay
        const backoff = initialBackoff * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 0.3 * backoff; // Add 0-30% jitter
        const delay = Math.round(backoff + jitter);

        await appendLog(logPath, `Retryable error: ${error.message.substring(0, 200)}`);

        if (attempt < maxRetries) {
          if (verbose) {
            console.log(`✗ Retryable error, waiting ${delay}ms...`);
          }
          await appendLog(logPath, `Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    // All retries exhausted
    await appendLog(logPath, `=== Deployment Failed (${maxRetries} attempts) ===`);
    throw new Error(
      `Deployment failed after ${maxRetries} attempts.\n` +
        `Last error: ${lastError?.message || 'Unknown error'}\n` +
        `Check log: ${logPath}`
    );
  } catch (error) {
    await appendLog(logPath, `FATAL ERROR: ${error.message}`);

    if (error.code === 'ENOENT') {
      // Wrangler not found - exit with code 1
      if (verbose) {
        console.error('\n✗ ' + error.message);
      }
      process.exitCode = 1;
    }

    throw error;
  }
}

/**
 * CLI entry point when run directly.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] || './dist';
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  publish(outDir, { verbose })
    .then((result) => {
      console.log('\n✓ Deployment complete');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Deployment failed');
      console.error(error.message);
      process.exit(1);
    });
}
