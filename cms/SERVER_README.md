# CMS Development Server

Local development server that bridges the browser-based editor with Node.js export/publish functions.

## Quick Start

```bash
# Start the dev server
npm run cms:dev

# Open in browser
http://localhost:5173
```

The server will:
- ✅ Serve editor UI on `http://localhost:5173`
- ✅ Provide `/api/export` endpoint (calls `exportArticle()`)
- ✅ Provide `/api/publish` endpoint (calls `publish()`)
- ✅ Enable CORS for localhost only
- ✅ Serve shared modules for preview iframe

## Architecture

```
Browser (Editor)          Node.js Server              Cloudflare
┌────────────────┐       ┌─────────────────┐        ┌──────────┐
│                │       │                 │        │          │
│  editor/app.js │──────▶│  cms/serve.js   │───────▶│  Pages   │
│                │ HTTP  │                 │ Deploy │          │
│  [ExportBtn]  │──────▶│  cms/export.ts  │───────▶│  dist/   │
│  [Publish Btn] │       │  cms/publish.js │        │          │
│                │       │                 │        │          │
└────────────────┘       └─────────────────┘        └──────────┘
```

## API Endpoints

### POST /api/export

Converts draft to static HTML and writes to `/dist`.

**Request:**
```json
{
  "metadata": {
    "title": "Article Title",
    "excerpt": "Description",
    "tags": ["tag1", "tag2"],
    "published_at": "2025-10-17T12:00:00Z",
    ...
  },
  "blocks": [
    { "type": "paragraph", "text": "Content..." },
    ...
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Article exported successfully",
  "data": {
    "slug": "article-title",
    "path": "article/2025/10/article-title/index.html",
    "outDir": "dist"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Metadata.title is required.",
  "details": "Error stack trace..."
}
```

### POST /api/publish

Deploys `/dist` to Cloudflare Pages.

**Request:**
```json
{
  "outDir": "./dist"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Deployment successful",
  "data": {
    "url": "https://abc123.pages.dev",
    "count": 42,
    "size": 524288,
    "duration": 12500
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Directory ./dist does not exist",
  "hint": "Click 'Export Draft' before publishing"
}
```

### GET /api/health

Server health check.

**Response:**
```json
{
  "status": "ok",
  "service": "cms-dev-server",
  "port": 5173,
  "endpoints": [
    "POST /api/export",
    "POST /api/publish",
    "GET  /api/health"
  ]
}
```

## Editor Integration

The editor (`editor/app.js`) now calls these endpoints:

### Export Flow
```javascript
async #exportDraft() {
  // Validate metadata
  if (!this.state.metadataValidation.valid) {
    this.toast.show("⚠️ Fix validation errors");
    return;
  }

  // POST to /api/export
  const response = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      metadata: this.state.metadata,
      blocks: this.state.blocks
    })
  });

  const result = await response.json();
  // Show success/error toast
}
```

### Publish Flow
```javascript
async #publishDraft() {
  // Confirm deployment
  if (!confirm("Deploy to Cloudflare Pages?")) return;

  // POST to /api/publish
  const response = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outDir: "./dist" })
  });

  const result = await response.json();
  // Show deployment URL
}
```

## Static File Serving

The server serves these directories:
- `/` → `editor/` (UI files)
- `/shared` → `shared/` (preview helpers)
- `/templates` → `templates/` (Eta template)
- `/css` → `css/` (stylesheets for preview iframe)

This allows the preview iframe to fetch:
- `../templates/article.eta`
- `../shared/articleTemplate.js`
- `../css/style.css`

## CORS Configuration

CORS is restricted to localhost:
```javascript
cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  credentials: true
})
```

## Error Handling

All endpoints return structured JSON errors:

**400 Bad Request** - Invalid input
```json
{
  "success": false,
  "error": "Invalid draft format. Expected { metadata, blocks }"
}
```

**500 Internal Server Error** - Export/publish failed
```json
{
  "success": false,
  "error": "Deployment failed after 3 attempts",
  "hint": "Check console logs and cms/logs/ for details"
}
```

**503 Service Unavailable** - Wrangler not installed
```json
{
  "success": false,
  "error": "Wrangler CLI not found",
  "code": "ENOENT",
  "hint": "Install wrangler: npm install -g wrangler"
}
```

## Development Workflow

1. **Start dev server:**
   ```bash
   npm run cms:dev
   ```

2. **Open editor:**
   ```
   http://localhost:5173
   ```

3. **Import content:**
   - Drag/drop Markdown, JSON, or PDF

4. **Edit article:**
   - Fill metadata panel
   - Add/edit blocks
   - Preview updates live

5. **Export:**
   - Click "Export Draft"
   - Creates `/dist/article/YYYY/MM/slug/index.html`

6. **Publish:**
   - Click "Publish"
   - Deploys to Cloudflare Pages
   - Opens deployment URL

## Troubleshooting

**"Port 5173 already in use"**
→ Change port: `CMS_PORT=5174 npm run cms:dev`

**"Export failed: Cannot find module 'export.js'"**
→ Ensure TypeScript is compiled or use ts-node

**"Publish failed: wrangler not found"**
→ Install: `npm install -g wrangler`

**Preview iframe not loading**
→ Check browser console for CORS/404 errors
→ Verify `/shared` and `/templates` routes

**"Invalid draft format"**
→ Check metadata and blocks structure
→ Ensure required fields are present

## Environment Variables

```env
# Optional: Override default port (5173)
CMS_PORT=5173

# Required for publish (see .env.example)
CF_ACCOUNT_ID=...
CF_API_TOKEN=...
CF_PAGES_PROJECT=...
```

## Next Steps

- Add WebSocket support for real-time export progress
- Implement Server-Sent Events for publish status
- Add authentication for multi-user access
- Create deployment preview before publish
- Add rollback functionality
