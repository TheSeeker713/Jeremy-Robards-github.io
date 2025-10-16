# Writing Portfolio Section - Setup Complete

## Overview
A new writing portfolio section has been added to jeremyrobards.com, powered by Decap CMS for easy content management.

## Files Created

### Front-End Files
- `writing.html` - Main writing samples page with article grid
- `writing.js` - JavaScript to dynamically load and display articles
- `_articles/` - Directory where article markdown files are stored
- `_articles/manifest.json` - Auto-generated list of article files
- `assets/images/uploads/` - Directory for CMS-uploaded images

### CMS Admin Files
- `admin/index.html` - Decap CMS admin interface
- `admin/config.yml` - CMS configuration file
- `generate-manifest.mjs` - Script to generate article manifest

### Modified Files
- `index.html` - Added "Writing Samples" navigation button
- `about.html` - Added writing section to navigation
- `package.json` - Added `generate:manifest` script

## Setup Instructions

### 1. Configure GitHub OAuth
To use the CMS, you need to set up GitHub OAuth:

1. Edit `admin/config.yml`
2. Replace `your-github-username/your-repo-name` with your actual repo
3. Set up GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Set Homepage URL: `https://jeremyrobards.com`
   - Set Authorization callback URL: `https://api.netlify.com/auth/done`
   - Note your Client ID and Client Secret

### 2. Set up Authentication
You have two options:

**Option A: GitHub OAuth (Recommended for personal use)**
- Follow GitHub OAuth setup above
- CMS will authenticate directly with GitHub

**Option B: Netlify Identity (Recommended for multiple users)**
- Deploy to Netlify
- Enable Netlify Identity in site settings
- Update `admin/config.yml` to use Netlify Identity backend

### 3. Create Your First Article

1. Navigate to `https://jeremyrobards.com/admin/`
2. Log in with GitHub
3. Click "New Articles"
4. Fill in:
   - Title
   - Publish Date
   - Featured Image (optional)
   - Body (markdown content)
5. Click "Publish"
6. Run `npm run generate:manifest` to update the article list
7. Commit and push changes

## Workflow

### Adding New Articles

**Via CMS (Recommended):**
1. Go to `/admin/`
2. Create new article
3. Publish
4. Run `npm run generate:manifest`
5. Commit and push

**Manually:**
1. Create markdown file in `_articles/` with format: `YYYY-MM-DD-slug.md`
2. Add frontmatter:
   ```yaml
   ---
   title: "Article Title"
   date: 2025-10-16T12:00:00.000Z
   thumbnail: "/assets/images/uploads/image.jpg"
   ---
   Article content here...
   ```
3. Run `npm run generate:manifest`
4. Commit and push

### Build Commands
```bash
# Rebuild Tailwind CSS
npm run build:css

# Generate article manifest (run after adding/removing articles)
npm run generate:manifest

# Development mode (watch CSS changes)
npm run dev
```

## Important Notes

### GitHub Pages Compatibility
- All content is static and GitHub Pages compatible
- No server-side processing required
- CMS commits directly to your repository

### Content Management
- Articles are stored as markdown files with YAML frontmatter
- Images uploaded via CMS go to `assets/images/uploads/`
- Manifest must be regenerated after content changes

### Navigation
- Writing section integrated into all portfolio pages
- Dynamic back navigation from About page
- Consistent styling with existing portfolio sections

## Placeholder Image
**Important:** Create or add an image at `assets/images/writing.webp` for the main navigation button. Recommended size: 256x256px minimum.

## Next Steps

1. **Add writing.webp image** to `assets/images/`
2. **Configure GitHub OAuth** in `admin/config.yml`
3. **Test CMS access** at `/admin/`
4. **Create first article** via CMS
5. **Customize article card styling** in `writing.js` if desired

## Troubleshooting

**Articles not showing:**
- Check that `manifest.json` exists and is updated
- Verify markdown files are in `_articles/` folder
- Check browser console for fetch errors

**CMS not loading:**
- Verify GitHub OAuth is configured correctly
- Check that you're accessing via HTTPS
- Ensure `admin/config.yml` has correct repo details

**Images not displaying:**
- Check that media_folder path is correct
- Verify images are in `assets/images/uploads/`
- Ensure paths in markdown use `/assets/images/uploads/`

## Support
For issues or questions, refer to:
- Decap CMS docs: https://decapcms.org/docs/
- GitHub Pages docs: https://docs.github.com/pages
