# Writing Portfolio Setup Guide - Complete Workflow

This guide explains the **local-only CMS-powered writing section** using Decap CMS.

## Quick Start

### 1. Start Local Development
```bash
# Terminal 1: Start Decap CMS server
npx decap-server

# Terminal 2: Start HTTP server
python -m http.server 8000
```

### 2. Access Admin Panel
Open `http://localhost:8000/admin/` in your browser

### 3. Create Article
- Click "New Articles"
- Fill in title, date, excerpt, thumbnail, tags
- Write content in markdown
- Set draft: false to publish
- Click "Save"

### 4. Update Manifest
```bash
npm run generate:manifest
```

### 5. View Live
Navigate to `http://localhost:8000/writing.html`

### 6. Deploy to GitHub
```bash
git add _articles/
git commit -m "Add article: [Title]"
git push origin main
```

## Architecture

### File Structure
```
_articles/              # Article storage (git-tracked)
  ├── test-article.md   # Example article
  └── manifest.json     # Auto-generated list
admin/
  ├── index.html        # CMS admin interface
  └── config.yml        # Local backend config
assets/images/uploads/  # CMS media uploads
writing.html            # Public portfolio page
writing.js              # Dynamic loader
generate-manifest.mjs   # Manifest generator
```

### How It Works
1. **Decap CMS** provides visual editor at `/admin/`
2. Articles saved as markdown in `_articles/`
3. **Manifest generator** creates JSON index
4. **writing.js** fetches and renders articles dynamically
5. **Draft filtering** hides unpublished content
6. **GitHub Pages** serves static site in production

## Configuration Files

### admin/config.yml
```yaml
backend:
  name: github
  repo: TheSeeker713/Jeremy-Robards-github.io
  branch: main

local_backend: true  # Local-only admin access

media_folder: "assets/images/uploads"
public_folder: "./assets/images/uploads"

collections:
  - name: "articles"
    label: "Articles"
    folder: "_articles"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Publish Date", name: "date", widget: "datetime"}
      - {label: "Excerpt", name: "excerpt", widget: "text", required: false}
      - {label: "Thumbnail", name: "thumbnail", widget: "image", required: false}
      - {label: "Tags", name: "tags", widget: "string", required: false}
      - {label: "Draft", name: "draft", widget: "boolean", default: true}
      - {label: "Body", name: "body", widget: "markdown"}
```

### package.json Scripts
```json
{
  "scripts": {
    "generate:manifest": "node generate-manifest.mjs",
    "cms:local": "npx decap-server",
    "dev": "python -m http.server 8000"
  }
}
```

## Article Frontmatter Schema

```yaml
---
title: "Article Title"
date: 2025-01-28T12:00:00Z
excerpt: "Short summary for article cards"
thumbnail: "./assets/images/uploads/image.jpg"
tags: "web-development, javascript, portfolio"
draft: false
---

# Article content in markdown...
```

## Common Tasks

### Creating a New Article
1. Open `http://localhost:8000/admin/`
2. Click "New Articles"
3. Fill in all fields (set draft: true initially)
4. Write content in markdown editor
5. Click "Save" - file created in `_articles/`
6. Run `npm run generate:manifest`
7. Preview at `http://localhost:8000/writing.html`

### Publishing an Article
1. Edit article in admin panel
2. Set draft: false
3. Click "Save"
4. Run `npm run generate:manifest`
5. Commit and push to GitHub

### Editing an Article
1. Open `http://localhost:8000/admin/`
2. Click on article from list
3. Make changes
4. Click "Save"
5. Run `npm run generate:manifest` if needed

### Uploading Images
1. In article editor, click image field
2. Choose "Upload" or select from media library
3. Image saved to `assets/images/uploads/`
4. Path automatically added to frontmatter

## Troubleshooting

### Admin Panel Blank
**Cause**: Decap server not running
**Fix**: 
```bash
npx decap-server
# Should see: "Proxy Server listening on port 8081"
```

### Articles Not Showing
**Causes**:
- Draft set to true
- Manifest not regenerated
- JavaScript errors

**Fix**:
```bash
# Regenerate manifest
npm run generate:manifest

# Check browser console for errors
# Verify draft: false in article frontmatter
```

### Images Not Loading
**Cause**: Incorrect path format
**Fix**: Use relative paths starting with `./`
```markdown
<!-- Correct -->
![Alt](./assets/images/uploads/image.jpg)

<!-- Incorrect -->
![Alt](/assets/images/uploads/image.jpg)
```

### Cannot Push to GitHub
**Cause**: Large files or auth issue
**Fix**:
```bash
# Optimize images first (recommend <500KB)
# Verify remote
git remote -v

# Re-authenticate if needed
git push origin main
```

## Production Deployment

### GitHub Pages Behavior
- Admin panel **does not work** in production (local-only)
- Articles loaded via static JSON + markdown files
- Client-side JavaScript renders content
- Drafts automatically filtered out

### Deployment Checklist
- [ ] Articles set to draft: false
- [ ] Manifest generated
- [ ] Images optimized (<500KB)
- [ ] Relative paths used
- [ ] Changes committed to Git
- [ ] Pushed to GitHub
- [ ] Verified on live site

## Best Practices

### Content
- Write drafts first (draft: true)
- Preview locally before publishing
- Use descriptive titles and excerpts
- Add relevant tags for organization
- Optimize images to WebP <500KB

### Git Workflow
- Commit frequently while writing
- Descriptive commit messages: "Add article: [Title]"
- Review changes before pushing
- Use branches for major rewrites

### SEO & Accessibility
- Write descriptive excerpts
- Use semantic markdown headers
- Add alt text to images
- Include publish dates
- Use consistent tag naming

## Example Workflow

```bash
# Start environment
npx decap-server &
python -m http.server 8000 &

# Write article in admin
# http://localhost:8000/admin/
# Set draft: true initially

# Save and preview
npm run generate:manifest
# Check http://localhost:8000/writing.html

# Publish when ready
# Set draft: false in admin
npm run generate:manifest

# Deploy
git add _articles/ assets/images/uploads/
git commit -m "Add article: Building Modern Portfolios"
git push origin main

# Verify live
# https://www.jeremyrobards.com/writing.html
```

## Security Notes

- ✅ **Local-only admin**: No production CMS access
- ✅ **No authentication needed**: Local dev inherently secure
- ✅ **Git version control**: Full article history
- ✅ **Static deployment**: No server vulnerabilities
- ✅ **No database**: Portable markdown files

## Resources

- [Decap CMS Docs](https://decapcms.org/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Pages](https://docs.github.com/en/pages)
- [Marked.js](https://marked.js.org/)

---

**Ready to write!** 🚀 Your local CMS is set up for offline article creation with seamless GitHub Pages deployment.
