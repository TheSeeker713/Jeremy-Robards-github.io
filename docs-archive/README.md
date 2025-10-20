# Documentation Archive

This folder contains **obsolete documentation** from previous iterations of the portfolio project. These files are kept for historical reference but are no longer relevant to the current implementation.

## 📅 Archive Date
October 19, 2025

## 🗂️ What's Archived

### Migration & Deployment Docs (Completed)
- `START_HERE.txt` - Initial Cloudflare migration quick start
- `PROJECT_SETUP_NEEDED.txt` - Manual project setup instructions
- `MIGRATION_PLAN.txt` - Detailed GitHub Pages → Cloudflare migration plan
- `DEPLOYMENT_SUCCESS.txt` - Deployment completion confirmation
- `DEPLOY_CHECKLIST.txt` - Pre-deployment checklist
- `DEPLOYING.md` - Deployment instructions
- `CUSTOM_DOMAIN_SETUP.md` - Custom domain configuration guide
- `ENV_SETUP_GUIDE.txt` - Environment setup instructions
- `LOGIN_HELP.txt` - Wrangler authentication help
- `BUILD_OUTPUT_INFO.txt` - Build output documentation

### Step-by-Step Completion Docs (Completed)
- `STEP_13_CHECKLIST.txt` - CMS project setup checklist
- `STEP_14_COMPLETE.md` - Worker proxy implementation summary
- `STEP_15_COMPLETE.md` - Editor UI wiring completion
- `STEP_15_QUICK_REF.md` - Quick reference for step 15
- `STEP_15_TESTING.md` - Testing procedures for step 15
- `STEP_15_VISUAL_SUMMARY.md` - Visual documentation for step 15
- `STEP_16_COMPLETE.md` - Image handling implementation summary
- `STEP_16_QUICK_REF.md` - Quick reference for step 16
- `STEP_16_TESTING.md` - Testing procedures for step 16
- `STEP_16_VISUAL_FLOW.md` - Visual flow documentation for step 16

### Feature Documentation (Obsolete)
- `MAGAZINE_UPGRADE_SUMMARY.md` - Old magazine-style upgrade (replaced by new CMS)
- `MAGAZINE_WRITING_GUIDE.md` - Old Decap CMS writing guide
- `WRITING_SETUP.md` - Old Decap CMS setup instructions
- `WRITING_WORKFLOW.md` - Old Decap CMS workflow
- `GLOBAL_COMMENTS_SETUP.md` - Giscus comments setup (not implemented)
- `PRIVACY_DESIGN.md` - Privacy policy design (not implemented)

### Obsolete System Components
- `old-decap-cms-admin/` - Old Decap CMS admin interface (replaced by `editor/`)
  - `config.yml` - Decap CMS configuration
  - `config-local.yml` - Local development config
  - `index.html` - Admin panel HTML
- `old-articles-folder/` - Old articles directory (replaced by `cms/dist/article/`)
  - Article markdown files
  - `manifest.json` - Old manifest system
- `old-_articles-folder/` - Draft articles folder (no longer used)

## ✅ Current Active Documentation

The following documentation is **still active** and should be referenced:

- **`README.md`** - Main project README
- **`CMS_README.md`** - Comprehensive CMS documentation
- **`CMS_SCRIPTS.md`** - Quick reference for CMS commands
- **`.github/copilot-instructions.md`** - AI coding assistant guidelines

## 🔧 Current System Architecture

### Content Management
- **Editor**: `editor/` - Browser-based article editor
- **CMS Backend**: `cms/` - Node.js/TypeScript export and publishing
- **Output**: `cms/dist/article/` - Exported static articles
- **Feed**: `cms/dist/article/feed.json` - Article listing feed

### Deployment
- **Platform**: Cloudflare Pages (Direct Upload via Wrangler)
- **Main Site**: `jeremyrobards-site` project
- **Articles**: `jr-articles` project (separate deployment)
- **Worker Proxy**: `worker/` - Routes `/article/*` requests

### Development
- **Start CMS**: `npm run cms:dev`
- **Deploy Main**: `npm run deploy`
- **Deploy Articles**: `npm run cms:publish`

## 🗑️ Files Deleted (Not Archived)

These files were **permanently deleted** as they would cause conflicts:

- `start-dev-servers.bat` - Old batch file for Decap CMS server (replaced by `npm run cms:dev`)
- `generate-manifest.mjs` - Old manifest generator (replaced by feed.json system)
- `_tinydeploy/` - Test deployment folder (temporary, no longer needed)

## 📝 Notes

- All archived documentation refers to systems that have been replaced
- The project has migrated from GitHub Pages to Cloudflare Pages
- Decap CMS has been replaced with a custom TypeScript-based CMS
- The manifest.json system has been replaced with feed.json
- Two-project architecture: main site + articles (with worker proxy)

## 🔄 Migration Summary

**Before**: GitHub Pages + Decap CMS + manifest.json
**After**: Cloudflare Pages + Custom CMS + feed.json + Worker Proxy

The current system is more flexible, performant, and maintainable.
