# Jeremy Robards Portfolio

A modern, full-stack portfolio website with integrated content management
system, deployed on Cloudflare Pages.

**Tech Stack:** Vanilla ES2025+ JavaScript, TypeScript CMS, Tailwind CSS,
Cloudflare Pages, Cloudflare Workers

## 🚀 Quick Start

### Development

```bash
# Start the CMS for article writing
npm run cms:dev

# Build Tailwind CSS (if styles changed)
npm run build

# Clean build artifacts
npm run clean
```

### Deployment

```bash
# Deploy main site to Cloudflare Pages
npm run deploy

# Publish articles to jr-articles project
npm run cms:publish
```

## 🏗️ Project Architecture

### Two-Project System

This portfolio uses a **dual-project architecture** on Cloudflare Pages:

1. **Main Site** (`jeremyrobards-site`) - Portfolio pages and static content
2. **Articles** (`jr-articles`) - CMS-generated articles and feed
3. **Worker Proxy** - Routes `/article/*` requests from main site to articles
   project

### Project Structure

```
/
├── 📄 Core Pages
│   ├── index.html          # Main landing page
│   ├── about.html          # About/contact page
│   ├── aidev.html          # AI Development portfolio
│   ├── mpd.html            # Motion Picture & Design
│   ├── iis.html            # Interactive Systems
│   ├── writing.html        # Article listing (loads feed.json)
│   └── article.html        # Article reader
│
├── ✍️ Content Management System
│   ├── editor/             # Browser-based article editor
│   │   ├── index.html      # Editor UI
│   │   ├── app.js          # Editor application
│   │   ├── modules/        # Editor modules (blocks, images, etc.)
│   │   └── vendor/         # Third-party libraries (PDF.js, etc.)
│   ├── cms/                # TypeScript backend
│   │   ├── export.ts       # Export to static HTML/Markdown
│   │   ├── publish.ts      # Deploy to Cloudflare Pages
│   │   ├── serve.js        # Express dev server
│   │   └── dist/           # Compiled output
│   └── templates/          # Article HTML templates (Eta)
│
├── 🎨 Frontend Assets
│   ├── css/
│   │   ├── style.css       # Custom styles (CSS variables)
│   │   └── tailwind.css    # Compiled Tailwind CSS
│   ├── js/
│   │   ├── main.js         # Main app (ES2025+ class-based)
│   │   └── writing.js      # Article feed renderer
│   └── assets/             # Images, media files
│
├── 🔧 Worker & Proxy
│   ├── worker/
│   │   ├── src/proxy.ts    # Routes /article/* to jr-articles
│   │   └── wrangler.toml   # Worker configuration
│   └── wrangler.toml       # Main site Cloudflare config
│
├── 📚 Documentation
│   ├── README.md           # This file
│   ├── CMS_README.md       # Comprehensive CMS documentation
│   ├── CMS_SCRIPTS.md      # Quick command reference
│   └── docs-archive/       # Obsolete/historical docs
│
└── ⚙️ Configuration
    ├── package.json        # NPM scripts and dependencies
    ├── tsconfig.json       # TypeScript configuration
    ├── tailwind.config.mjs # Tailwind CSS configuration
    ├── wrangler.toml       # Cloudflare Pages configuration
    └── .env                # Environment variables (API keys)
```

## 🎨 Technology Stack

### Frontend

- **JavaScript**: Vanilla ES2025+ (classes, modules, modern features)
- **CSS**: Tailwind CSS + Custom Properties design system
- **HTML**: Semantic, accessible markup
- **Templating**: Eta (embedded JavaScript templates)

### Backend/CMS

- **TypeScript**: Type-safe article export and publishing
- **Node.js**: Express dev server for CMS API
- **Build Tools**: TypeScript compiler, Tailwind CLI

### Deployment & Infrastructure

- **Hosting**: Cloudflare Pages (Direct Upload)
- **CDN**: Cloudflare global network (300+ data centers)
- **Proxy**: Cloudflare Workers (article routing)
- **CLI**: Wrangler for deployments
- **Version Control**: Git + GitHub

### Key Features

- ✅ **Offline-first CMS** - Browser-based editor with localStorage
- ✅ **Image optimization** - Client-side resize, compress, WebP support
- ✅ **Feed system** - JSON feed for article listing
- ✅ **Worker proxy** - Seamless article routing between projects
- ✅ **Type safety** - TypeScript for CMS backend
- ✅ **Modern JavaScript** - ES2025+ class-based architecture
- ✅ **No database** - Static site generation
- ✅ **Fast deployments** - ~30 seconds via Wrangler CLI

## ✍️ Content Management System

### Editor Features

- **Block Editor**: Rich text, images, code blocks, quotes
- **Live Preview**: Real-time markdown/HTML preview
- **Image Processing**: Automatic resize (1200px), compression (85%), WebP
  conversion
- **Metadata Panel**: Title, subtitle, author, category, tags
- **Export Formats**: HTML + Markdown (dual output)
- **Draft System**: LocalStorage auto-save
- **PDF Support**: PDF.js integration for document preview

### CMS Workflow

```bash
# 1. Start the CMS
npm run cms:dev
# Opens: http://localhost:5173

# 2. Write article in editor
# - Add blocks (text, images, code)
# - Set metadata (title, category, tags)
# - Preview in real-time

# 3. Export to static files
# Click "Export" button in editor
# Generates: HTML + Markdown + hero image
# Updates: feed.json

# 4. Publish to Cloudflare
# Click "Publish" button in editor
# Deploys: cms/dist/ → jr-articles.pages.dev
```

### Article Output

- **HTML**: Full article page with template
- **Markdown**: Portable format with frontmatter
- **Feed**: JSON entry in `/article/feed.json`
- **Images**: Optimized hero images
- **URL**: `https://www.jeremyrobards.com/article/{slug}.html`

## 🌐 Deployment Architecture

### Main Site (jeremyrobards-site)

```bash
npm run deploy
```

**Deploys:**

- All HTML pages (index, about, portfolio pages)
- CSS, JavaScript, assets
- writing.html (article listing page)
- article.html (article reader template)

**URL:** https://www.jeremyrobards.com

### Articles (jr-articles)

```bash
npm run cms:publish
```

**Deploys:**

- `cms/dist/article/` directory
- Individual article HTML files
- `feed.json` (article listing feed)
- Article images

**URL:** https://jr-articles.pages.dev  
**Proxied:** https://www.jeremyrobards.com/article/*

### Worker Proxy

The Cloudflare Worker at `worker/src/proxy.ts` routes requests:

```
/article/* → jr-articles.pages.dev/article/*
```

This allows articles to appear at the main domain while being served from a
separate project.

## 🛠️ Development Workflows

### Writing Articles

1. Run `npm run cms:dev`
2. Open http://localhost:5173
3. Write article in editor
4. Click "Export" → generates static files
5. Click "Publish" → deploys to Cloudflare

### Updating Site Design

1. Edit HTML files (index.html, about.html, etc.)
2. Edit CSS in `tailwind/input.css` or `css/style.css`
3. Run `npm run build` (if Tailwind changed)
4. Run `npm run deploy`

### Local Testing

```bash
# Serve site locally
npx serve .
# or
python -m http.server 8000

# Access at:
http://localhost:8000
```

## � NPM Scripts Reference

### CMS Commands

```bash
npm run cms:dev        # Start CMS dev server (http://localhost:5173)
npm run cms:compile    # Compile TypeScript (cms/ → .build/)
npm run cms:export     # Export article to static files
npm run cms:publish    # Deploy articles to jr-articles project
npm run cms:setup      # First-time CMS setup
```

### Build Commands

```bash
npm run build          # Compile Tailwind CSS
npm run clean          # Remove build artifacts (.build/, dist/)
```

### Deployment Commands

```bash
npm run deploy         # Deploy main site to Cloudflare Pages
npm run deploy:test    # Test deployment (tiny index.html)
```

### Utility Commands

```bash
npm run serve          # Start simple HTTP server (for local testing)
npm run cms:proxy      # Start Decap CMS proxy (legacy, not used)
```

## � Design System

### Color Palette

- **Primary**: `#10b981` (Emerald green)
- **Background**: Black gradient (`#000` → `#2d2d2d`)
- **Text**: White with gray variants
- **Accents**: Emerald with hover states

### CSS Architecture

- **Tailwind CSS**: Utility-first framework
- **Custom Properties**: CSS variables for theming
- **Design Tokens**: Systematic spacing, colors
- **Component Classes**: Reusable patterns
- **Responsive**: Mobile-first breakpoints

### Typography

- **Headings**: Bold, clean hierarchy
- **Body**: Optimized for readability
- **Code**: Monospace with syntax highlighting
- **Article Text**: Drop caps, optimal line length

## 📱 Responsive Design

### Breakpoints

- **Mobile**: `< 768px` (default)
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Features

- Touch-optimized navigation
- Responsive images (WebP, lazy loading)
- Flexible typography scale
- Adaptive layouts (Grid, Flexbox)
- Dark theme toggle

## 📄 Pages Overview

### Portfolio Pages

- **index.html** - Main landing page with portfolio navigation
- **about.html** - Personal info, skills, contact details
- **aidev.html** - AI Development projects showcase
- **mpd.html** - Motion Picture & Design portfolio
- **iis.html** - Innovative Interactive Systems experiments

### Writing/Articles System

- **writing.html** - Article listing (fetches from feed.json)
- **article.html** - Article reader template (static)
- **Feed**: `/article/feed.json` (generated by CMS)
- **Articles**: `/article/{slug}.html` (individual articles)

### CMS Interface

- **editor/index.html** - Browser-based article editor
- **http://localhost:5173** - CMS dev server

## 🎯 Performance

### Optimization Features

- ✅ Vanilla JavaScript (no heavy frameworks)
- ✅ WebP images with fallbacks
- ✅ Client-side image compression (85% quality)
- ✅ Cloudflare CDN (global edge caching)
- ✅ CSS custom properties (efficient theming)
- ✅ Event delegation (minimal listeners)
- ✅ LocalStorage for CMS drafts
- ✅ Lazy loading for images

### Lighthouse Scores (Target)

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Loading Strategy

- Critical CSS inline
- Progressive enhancement
- Async script loading
- Minimal third-party dependencies

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```bash
CLOUDFLARE_API_TOKEN=your_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

### Cloudflare Pages Projects

- **Main Site**: `jeremyrobards-site`
- **Articles**: `jr-articles`
- **Custom Domain**: `www.jeremyrobards.com`

### Wrangler Configuration

See `wrangler.toml` for main site deployment settings. See
`worker/wrangler.toml` for worker proxy settings.

## 📚 Documentation

### Primary Docs

- **README.md** (this file) - Project overview and quick start
- **CMS_README.md** - Comprehensive CMS documentation (544 lines)
- **CMS_SCRIPTS.md** - Quick command reference

### Architecture Docs

- **.github/copilot-instructions.md** - AI coding assistant guidelines
- **docs-archive/** - Historical/obsolete documentation

### Getting Help

1. Check `CMS_README.md` for detailed CMS workflows
2. Check `CMS_SCRIPTS.md` for quick command reference
3. Check `docs-archive/` for migration history

## � Current Status

### ✅ Completed Features

- Cloudflare Pages deployment (main + articles)
- Custom TypeScript CMS with browser editor
- Worker proxy for article routing
- Feed-based article listing system
- Image optimization pipeline (resize, compress, WebP)
- Two-project architecture
- Export to HTML + Markdown
- LocalStorage draft system
- PDF.js integration

### 🔄 Active Systems

- **Hosting**: Cloudflare Pages
- **CMS**: Custom TypeScript/Node.js
- **Articles**: Feed.json + static HTML
- **Proxy**: Cloudflare Worker
- **Version Control**: Git + GitHub

### ❌ Deprecated Systems

- GitHub Pages deployment (migrated to Cloudflare)
- Decap CMS (replaced with custom CMS)
- Manifest.json system (replaced with feed.json)

## 🎓 Learning Resources

### Relevant Technologies

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Eta Templates](https://eta.js.org/)

## 📞 Support & Contact

For questions about the portfolio or code:

- **Website**: [www.jeremyrobards.com](https://www.jeremyrobards.com)
- **GitHub**:
  [TheSeeker713/Jeremy-Robards-github.io](https://github.com/TheSeeker713/Jeremy-Robards-github.io)

---

**Built with modern web standards for Cloudflare Pages**  
_ES2025+ | TypeScript | Tailwind CSS | Cloudflare Workers | Eta Templates_

**Last Updated:** October 19, 2025
