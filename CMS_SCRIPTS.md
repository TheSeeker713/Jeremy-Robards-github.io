# CMS Quick Reference

## 📦 Package Scripts - Quick Command Reference

### Essential Commands

```bash
# 🚀 Start the CMS (most common command)
npm run cms:dev

# 🧹 Clean build artifacts
npm run clean

# 🔧 First-time setup
npm run cms:setup
```

### Build Commands

```bash
# 📦 Compile TypeScript
npm run cms:compile

# 🏗️ Export article to static HTML/MD
npm run cms:export

# 🚀 Deploy to Cloudflare Pages
npm run cms:publish
```

### Development Workflow

```bash
# 1️⃣ Clean start
npm run clean
npm run cms:compile

# 2️⃣ Start dev server
npm run cms:dev

# 3️⃣ Open browser → http://localhost:5173

# 4️⃣ Create/edit article in UI

# 5️⃣ Click "Export" button in UI (or use cms:export)

# 6️⃣ Click "Publish" button in UI (or use cms:publish)
```

---

## 🎯 Command Details

### `npm run cms:dev`
**What**: Starts the CMS development server  
**Port**: `http://localhost:5173`  
**Requires**: TypeScript must be compiled first (`npm run cms:compile`)  
**Usage**: Open browser, import/create articles, export, publish

**Features**:
- Browser-based editor UI
- Live preview with template parity
- REST API endpoints (`/api/export`, `/api/publish`)
- Auto-saves drafts to localStorage

---

### `npm run cms:compile`
**What**: Compiles TypeScript files to JavaScript  
**Input**: `cms/**/*.ts`  
**Output**: `.build/cms/**/*.js`  
**Required**: Before running `cms:dev` or `cms:publish`

**When needed**:
- After cloning the repo
- After modifying `.ts` files in `cms/`
- After running `npm run clean`

---

### `npm run cms:export`
**What**: CLI export tool (bypasses editor UI)  
**Input**: JSON draft from file or stdin  
**Output**: Static HTML + Markdown to `dist/`

**Example**:
```bash
# Export from file
npm run cms:export < drafts/my-article.json

# Or modify export.ts to accept path
node --loader ts-node/esm cms/export.ts drafts/my-article.json
```

---

### `npm run cms:publish`
**What**: Deploys `dist/` to Cloudflare Pages  
**Requires**: 
- `.env` with CF credentials (run `cms:setup`)
- `wrangler` CLI installed globally
- `dist/` directory with content

**Features**:
- Retry logic (3 attempts, exponential backoff)
- Structured logging to `cms/logs/`
- Deployment URL in output

---

### `npm run cms:setup`
**What**: Interactive configuration wizard  
**Collects**:
- Cloudflare Account ID
- Cloudflare API Token
- Pages Project Name

**Creates**: `.env` file with credentials

**When to run**:
- First time using the CMS
- Updating Cloudflare credentials
- Setting up on new machine

---

### `npm run clean`
**What**: Removes build artifacts  
**Deletes**:
- `dist/` - Exported static files
- `.build/` - Compiled TypeScript

**When to use**:
- Before fresh export
- Troubleshooting build issues
- Cleaning repo before commit

---

## 🔥 Common Workflows

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure Cloudflare
npm run cms:setup

# 3. Compile TypeScript
npm run cms:compile

# 4. Start dev server
npm run cms:dev
```

### Daily Writing Session
```bash
# Start server (compiles if needed)
npm run cms:compile && npm run cms:dev

# Open http://localhost:5173
# Import/create article
# Export + Publish via UI buttons
```

### Clean Build + Deploy
```bash
# Remove old artifacts
npm run clean

# Compile fresh
npm run cms:compile

# Start editor
npm run cms:dev

# ... create content ...

# Deploy (via UI or CLI)
npm run cms:publish
```

---

## 🐛 Troubleshooting

### Error: "TypeScript files not compiled"
```bash
# Fix: Compile first
npm run cms:compile
npm run cms:dev
```

### Error: "wrangler not found"
```bash
# Fix: Install globally
npm install -g wrangler
```

### Error: "CF_ACCOUNT_ID not set"
```bash
# Fix: Run setup wizard
npm run cms:setup
```

### Port 5173 already in use
```bash
# Fix: Set custom port
CMS_PORT=5174 npm run cms:dev
```

---

## 📚 More Documentation

- **`CMS_README.md`** - Complete documentation with architecture, API, troubleshooting
- **`cms/SERVER_README.md`** - API endpoint specifications and integration patterns
- **`WRITING_WORKFLOW.md`** - Content creation guidelines
- **`MAGAZINE_WRITING_GUIDE.md`** - Editorial style guide

---

## 🎓 Tips & Best Practices

1. **Always compile before running dev server**  
   `npm run cms:compile` → `npm run cms:dev`

2. **Use the editor UI for most work**  
   Browser interface is easier than CLI for article creation

3. **Test locally before publishing**  
   Preview in editor before clicking "Publish"

4. **Keep .env secure**  
   Never commit `.env` to git (already in `.gitignore`)

5. **Check logs for deployment issues**  
   See `cms/logs/` for detailed publish output

6. **Clean periodically**  
   `npm run clean` removes stale build artifacts
