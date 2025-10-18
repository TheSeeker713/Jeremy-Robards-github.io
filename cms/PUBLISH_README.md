# CMS Publish Module

Automated deployment helper for Cloudflare Pages with retry logic and structured logging.

## Features

- ✅ Environment validation (CF_ACCOUNT_ID, CF_API_TOKEN, CF_PAGES_PROJECT)
- ✅ Pre-deployment checks (dist/ exists and not empty)
- ✅ Automatic retry with exponential backoff (3 attempts)
- ✅ JSON output parsing (deployment URL, file count, size, duration)
- ✅ Structured logging to `cms/logs/YYYYMMDD-HHMMSS-publish.log`
- ✅ Graceful error handling with helpful messages

## Setup

1. **Install Wrangler CLI globally:**
   ```bash
   npm install -g wrangler
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   ```env
   CF_ACCOUNT_ID=your-account-id
   CF_API_TOKEN=your-api-token
   CF_PAGES_PROJECT=your-project-name
   ```

   **Finding your Cloudflare credentials:**
   - **Account ID:** Cloudflare Dashboard → Account Home (right sidebar)
   - **API Token:** Dashboard → Profile → API Tokens → Create Token
     - Use template: "Edit Cloudflare Workers"
     - Or custom with permissions: `Account.Cloudflare Pages:Edit`
   - **Project Name:** The name you gave your Cloudflare Pages project

## Usage

### CLI (Direct Execution)

```bash
# Publish dist/ directory
node cms/publish.js

# Publish with verbose logging
node cms/publish.js --verbose

# Publish custom directory
node cms/publish.js ./build --verbose
```

### NPM Script

```bash
# Run via package.json script
npm run cms:publish
```

### Programmatic API

```javascript
import { publish } from "./cms/publish.js";

try {
  const result = await publish("./dist", {
    maxRetries: 3,
    initialBackoff: 1000,
    verbose: true
  });

  console.log("Deployment URL:", result.url);
  console.log("Files deployed:", result.count);
  console.log("Total size:", result.size, "bytes");
  console.log("Duration:", result.duration, "ms");
} catch (error) {
  console.error("Deployment failed:", error.message);
}
```

## Return Value

```typescript
{
  url: string;      // Deployment URL (e.g., https://abc123.pages.dev)
  count: number;    // Number of files deployed
  size: number;     // Total size in bytes
  duration: number; // Deployment duration in milliseconds
}
```

## Error Handling

### Wrangler Not Found (ENOENT)
If `wrangler` is not installed, the script will:
- Print installation instructions
- Exit with code `1`
- **Not retry** (manual fix required)

### Retryable Errors (5xx, Network Issues)
For server errors or network failures, the script will:
- Retry up to 3 times (configurable)
- Use exponential backoff with jitter
- Log each attempt to the log file

### Non-Retryable Errors
For client errors (4xx) or other issues:
- Fail immediately
- Log error details
- Return meaningful error message

## Logs

All deployments are logged to:
```
cms/logs/YYYYMMDD-HHMMSS-publish.log
```

**Log contents:**
- Timestamp for each action
- Environment validation results
- Wrangler command executed
- Stdout/stderr output (truncated to 1000 chars)
- Retry attempts and backoff delays
- Final deployment result or error

## Integration with Editor

The `publish()` function can be called from the editor UI via:

1. **Local HTTP bridge** (recommended):
   - Create a simple Express/Fastify server in `cms/server.js`
   - Expose POST `/api/publish` endpoint
   - Call `publish()` and return JSON response

2. **File protocol bridge** (alternative):
   - Editor writes draft to temp file
   - Spawns Node subprocess: `node cms/publish-cli.js <file>`
   - Reads result from stdout JSON

3. **WebSocket** (advanced):
   - Bi-directional communication
   - Real-time progress updates
   - Stream logs to editor UI

## Troubleshooting

**"Missing required environment variables"**
→ Create `.env` file with CF_ACCOUNT_ID, CF_API_TOKEN, CF_PAGES_PROJECT

**"Wrangler CLI not found"**
→ Install globally: `npm install -g wrangler`

**"Directory ./dist does not exist"**
→ Build your site first or check output directory path

**"Deployment failed after 3 attempts"**
→ Check the log file for detailed error messages
→ Verify Cloudflare credentials and project name
→ Ensure network connectivity

## Next Steps

See `STEP 10` for editor integration via local HTTP server.
