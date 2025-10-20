# Portfolio CMS Documentation

A lightweight, offline-first content management system for the portfolio
website. The CMS provides a browser-based editor for creating articles, with
Node.js-powered export and deployment to Cloudflare Pages.

---

## 🏗️ Architecture Overview

The CMS consists of three main components:

1. **Browser-based Editor** (`editor/`) - Visual editing interface with block
   editor, metadata panel, and live preview
2. **Node.js Backend** (`cms/`) - TypeScript modules for exporting static
   HTML/Markdown and publishing to Cloudflare
3. **Dev Server** (`cms/serve.js`) - Express server bridging the browser editor
   with Node.js functions via REST API

### Technology Stack

- **Frontend**: Vanilla JavaScript ES2025+, Eta templating (browser bundle),
  localStorage persistence
- **Backend**: TypeScript compiled to ES2020, Node.js with Express
- **Deployment**: Cloudflare Pages Direct Upload via Wrangler CLI
- **Styling**: Tailwind CSS with custom properties design system

---

## 📦 Package Scripts

### Core CMS Commands

#### `npm run cms:dev`

```bash
npm run cms:dev
```

**Purpose**: Start the CMS development server

**What it does**:

- Compiles TypeScript files from `cms/` to `.build/`
- Starts Express server on `http://localhost:5173`
- Serves the editor UI with live API endpoints
- Enables CORS for localhost only

**When to use**: This is your main command for working with the CMS. Run it
whenever you want to create, edit, or publish articles.

**Output**:

```
🚀 CMS Development Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Editor UI:   http://localhost:5173
🔌 API:         http://localhost:5173/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### `npm run cms:export`

```bash
npm run cms:export
```

**Purpose**: Directly export an article from the command line (bypasses editor
UI)

**What it does**:

- Runs `cms/export.ts` via ts-node
- Reads article draft from a JSON file or stdin
- Generates static HTML, Markdown archive, and updates feed.json
- Outputs to `dist/` directory

**When to use**:

- Scripting/automation workflows
- Batch processing multiple articles
- CI/CD pipeline integration

**Example**:

```bash
# Export a specific draft file
npm run cms:export < drafts/my-article.json

# Or modify export.ts to accept file path argument
node --loader ts-node/esm cms/export.ts drafts/my-article.json
```

---

#### `npm run cms:publish`

```bash
npm run cms:publish
```

**Purpose**: Deploy the `dist/` directory to Cloudflare Pages

**What it does**:

- Validates Cloudflare environment variables (CF_ACCOUNT_ID, CF_API_TOKEN,
  CF_PAGES_PROJECT)
- Spawns `wrangler pages deploy` with retry logic (3 attempts, exponential
  backoff)
- Parses deployment output for URL, file count, size, and duration
- Writes structured logs to `cms/logs/YYYYMMDD-HHMMSS-publish.log`

**When to use**:

- After exporting articles via the editor or `cms:export`
- When you're ready to deploy changes to production
- Can be called from the editor UI "Publish" button or directly from CLI

**Prerequisites**:

- `.env` file with Cloudflare credentials (see Setup section)
- `wrangler` CLI installed globally: `npm install -g wrangler`
- `dist/` directory exists with exported content

**Example output**:

```
✅ Published to Cloudflare Pages
   URL: https://your-project.pages.dev
   Files: 42 assets
   Size: 1.2 MB
   Duration: 3.4s
```

---

#### `npm run cms:setup`

```bash
npm run cms:setup
```

**Purpose**: One-time setup for Cloudflare credentials

**What it does**:

- Prompts for Cloudflare Account ID and API Token (inquirer)
- Writes `.env` with CF_ACCOUNT_ID, CF_API_TOKEN, CF_PAGES_PROJECT=jr-articles
- Optionally verifies credentials using `wrangler whoami`
- Supports a `--dry-run` flag to print the .env content without writing

**When to use**:

- First time setting up the CMS on a new machine
- Updating Cloudflare credentials
- Troubleshooting authentication issues

**Interactive prompts**:

```
? Cloudflare Account ID: abc123...
? Cloudflare API Token: ••••••••
? Write .env to J:/.../.env? (Y/n)
? Verify credentials with 'wrangler whoami'? (Y/n)
```

**Dry run example**:

```bash
npm run cms:setup -- --dry-run
# or
node cms/setup.js --dry-run
```

---

### Utility Commands

#### `npm run clean`

```bash
npm run clean
```

**Purpose**: Remove generated files and build artifacts

**What it does**:

- Deletes `dist/` directory (exported static files)
- Deletes `.build/` directory (compiled TypeScript output)
- Uses `rimraf` for cross-platform compatibility

**When to use**:

- Before a fresh export to ensure no stale files
- Troubleshooting build issues
- Cleaning up before committing to git

---

#### `npm run cms:compile`

```bash
npm run cms:compile
```

**Purpose**: Compile TypeScript files without starting the server

**What it does**:

- Runs `tsc` to compile `cms/**/*.ts` to `.build/cms/**/*.js`
- Uses configuration from `tsconfig.json`
- Target: ES2020 modules

**When to use**:

- Checking for TypeScript errors without running the server
- Pre-compiling before running `cms:publish` directly
- CI/CD build steps

---

### Legacy/Testing Commands

#### `npm run cms:proxy`

```bash
npm run cms:proxy
```

**Purpose**: Run Decap CMS proxy server (legacy, for Git-based workflow)

**What it does**: Starts `decap-server` for local preview of Decap CMS (formerly
Netlify CMS)

**Status**: Not actively used in current offline-first workflow

---

#### `npm run cms:test`

```bash
npm run cms:test
```

**Purpose**: Run publish module tests

**What it does**: Executes `cms/test-publish.js` to verify deployment logic
without actually deploying

---

## 🚀 Quick Start Guide

### 1. Initial Setup

```bash
# Install dependencies
npm install

# Run interactive setup
npm run cms:setup

# Start the dev server
npm run cms:dev
```

### 2. Create Your First Article

1. Open `http://localhost:5173` in your browser
2. Click "Import Draft" and select a Markdown file (or create from scratch)
3. Edit metadata in the left panel:
   - Title, description, author, date
   - Categories, tags, reading time
   - Featured image and social preview
4. Edit content blocks in the center panel:
   - Add paragraphs, headings, images, code blocks
   - Drag to reorder blocks
   - Delete unwanted blocks
5. Preview live updates in the right panel

### 3. Export and Publish

```bash
# Option A: Use the editor UI
# Click "Export Draft" → "Publish"

# Option B: Use CLI commands
npm run cms:export   # Creates dist/ folder
npm run cms:publish  # Deploys to Cloudflare
```

---

## 🔧 Configuration

### Environment Variables (.env)

Create a `.env` file in the project root:

```bash
# Cloudflare Pages Configuration
CF_ACCOUNT_ID=your_account_id_here
CF_API_TOKEN=your_api_token_here
CF_PAGES_PROJECT=your_project_name
```

**How to get these values**:

1. **CF_ACCOUNT_ID**:
   - Log in to Cloudflare Dashboard
   - Account ID is in the URL: `dash.cloudflare.com/<ACCOUNT_ID>/`

2. **CF_API_TOKEN**:
   - Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Create Token → "Edit Cloudflare Pages" template
   - Copy the token (you won't see it again!)

3. **CF_PAGES_PROJECT**:
   - Your Cloudflare Pages project name (e.g., "portfolio-articles")

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./.build",
    "rootDir": "."
  },
  "include": ["cms/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 📁 Project Structure

```
portfolio/
├── cms/                      # Node.js backend modules
│   ├── serve.js             # Express dev server
│   ├── export.ts            # Static HTML/MD export
│   ├── publish.js           # Cloudflare deployment
│   ├── setup.js             # Interactive configuration
│   └── logs/                # Deployment logs
├── editor/                   # Browser-based editor
│   ├── index.html           # Editor UI
│   ├── app.js              # Main orchestrator
│   ├── ImportManager.js     # File import pipeline
│   ├── BlockEditor.js       # Content block editing
│   ├── MetadataPanel.js     # Article metadata
│   └── Preview.js           # Live preview iframe
├── shared/                   # Shared rendering code
│   └── articleTemplate.js   # Template + helpers (Node + Browser)
├── templates/               # Eta templates
│   └── article.eta          # Article HTML template
├── dist/                    # Exported static files (gitignored)
├── .build/                  # Compiled TypeScript (gitignored)
├── .env                     # Cloudflare credentials (gitignored)
└── package.json             # Scripts and dependencies
```

---

## 🔄 Development Workflow

### Typical Session

```bash
# 1. Start dev server
npm run cms:dev

# 2. Open browser to http://localhost:5173

# 3. Import/create article in editor

# 4. Export when ready (creates dist/)

# 5. Publish to Cloudflare (one-click or CLI)

# 6. View live at https://your-project.pages.dev/article/YYYY/MM/slug/
```

### File Watching

For CSS development alongside CMS work:

```bash
# Terminal 1: Watch Tailwind CSS
npm run dev

# Terminal 2: Run CMS dev server
npm run cms:dev
```

---

## 🐛 Troubleshooting

### Server won't start

**Error**: `Cannot find module './export.js'`

**Solution**: Compile TypeScript first

```bash
npm run cms:compile
npm run cms:dev
```

---

### Publish fails with "wrangler not found"

**Error**: `Error: spawn wrangler ENOENT`

**Solution**: Install wrangler globally

```bash
npm install -g wrangler
```

---

### Export creates empty dist/ folder

**Issue**: No files generated after export

**Solution**: Check browser console for validation errors. Ensure:

- Title and description are filled
- At least one content block exists
- Date is valid
- Slug is generated (auto-filled from title)

---

### CORS errors in browser console

**Issue**: `Access-Control-Allow-Origin` errors

**Solution**:

- Ensure dev server is running on `localhost:5173`
- Don't access via `127.0.0.1` (use `localhost`)
- Check that CORS middleware is enabled in `cms/serve.js`

---

### Cloudflare deployment fails with 401/403

**Error**: `Authentication error` or `Forbidden`

**Solution**:

1. Verify `.env` credentials are correct
2. Check API token has "Edit Cloudflare Pages" permissions
3. Confirm Account ID matches the project owner
4. Run `npm run cms:setup` to reconfigure

---

## 🎯 API Endpoints

When `npm run cms:dev` is running, the following endpoints are available:

### POST /api/export

Export a draft to static HTML/Markdown

**Request body**:

```json
{
  "metadata": {
    "title": "My Article",
    "description": "Article description",
    "author": "Jeremy Robards",
    "date": "2025-10-17",
    "slug": "my-article"
  },
  "blocks": [
    {
      "type": "paragraph",
      "content": "Article content here..."
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "paths": {
    "html": "dist/article/2025/10/my-article/index.html",
    "markdown": "articles/2025-10-17-my-article.md",
    "feed": "dist/feed.json"
  },
  "message": "Exported article to dist/"
}
```

---

### POST /api/publish

Deploy dist/ to Cloudflare Pages

**Request body**:

```json
{
  "outDir": "./dist"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Deployment successful",
  "data": {
    "url": "https://your-project.pages.dev",
    "count": 42,
    "size": "1.2 MB",
    "duration": "3.4s"
  }
}
```

---

### GET /api/health

Server status check

**Response**:

```json
{
  "status": "ok",
  "service": "cms-dev-server",
  "port": 5173,
  "endpoints": ["POST /api/export", "POST /api/publish", "GET  /api/health"]
}
```

---

## 📚 Additional Documentation

- **`cms/SERVER_README.md`** - Detailed API documentation and integration
  patterns
- **`WRITING_WORKFLOW.md`** - Content creation guidelines
- **`MAGAZINE_WRITING_GUIDE.md`** - Editorial style guide

---

## 🛣️ Roadmap

### ✅ Completed (STEP 0-11)

- Scaffolding and directory structure
- TypeScript toolchain with Eta templating
- Browser-based editor with import pipeline
- Block editor with drag-and-drop
- Metadata panel with validation
- Static HTML/Markdown export
- Preview with template parity
- Cloudflare Pages publish helper
- Editor ↔ Node.js bridge via Express API
- Package scripts and documentation

### 🔮 Future Enhancements

- WebSocket/SSE for real-time export progress
- Authentication for multi-user editing
- Draft versioning and auto-save
- Image upload and optimization
- Deployment preview URLs
- Rollback functionality
- Rich text editor improvements
- Markdown import enhancements

---

## 📄 License

MIT License - See LICENSE file for details
