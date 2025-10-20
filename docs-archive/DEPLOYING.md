# Cloudflare Pages Deployment Guide

This portfolio site is deployed to Cloudflare Pages using Wrangler CLI for Direct Upload.

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or later)
2. **Wrangler CLI** (installed automatically with the project)
3. **Cloudflare Account** with Pages enabled

---

## 🔐 First-Time Authentication

### Option A: Interactive Login (Recommended)

```bash
# Check if wrangler is installed
npx wrangler --version

# Login to Cloudflare
npx wrangler login
```

This will open a browser window for you to authenticate. After logging in, wrangler will store your credentials securely.

### Option B: API Token (For CI/CD or Headless)

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use the **"Edit Cloudflare Pages"** template
4. Copy the generated token
5. Add it to your `.env` file:

```bash
# Copy .env.example to .env if you haven't already
cp .env.example .env

# Edit .env and add:
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_token_here
```

**Find your Account ID:**
- Log in to Cloudflare Dashboard
- Your Account ID is in the URL: `https://dash.cloudflare.com/<ACCOUNT_ID>/`

### Verify Authentication

```bash
npx wrangler whoami
```

You should see your account email and account ID.

---

## 📦 Build & Deploy

### 1. Build the Site

```bash
# Build CSS and prepare assets
npm run build
```

This will generate the static files in the `dist/` folder.

### 2. Test Deployment (Recommended First)

Test the deployment pipeline with a minimal smoke test:

```bash
npm run deploy:test
```

This deploys a tiny test page from `_tinydeploy/` to verify:
- Authentication works
- Upload pipeline works
- You'll get a `*.pages.dev` URL to check

### 3. Deploy to Production

```bash
# Standard deployment
npm run deploy

# Or with verbose output for debugging
npm run deploy:verbose
```

---

## 🎯 VS Code Integration

You can deploy directly from VS Code:

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Run Task"
3. Select one of:
   - **Cloudflare: Deploy** - Standard deployment
   - **Cloudflare: Deploy (Verbose)** - Verbose output
   - **Cloudflare: Smoke Deploy** - Test deployment

Or use the keyboard shortcut:
- Press `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac)
- Select a deploy task from the list

---

## 🌐 Custom Domain Setup

After your first successful deployment:

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/)
2. Click on your project: **jeremyrobards-site**
3. Go to **Settings → Domains**
4. Click **"Set up a custom domain"**
5. Enter your domain: `www.jeremyrobards.com`
6. Follow the DNS setup instructions

### Remove Old GitHub Pages DNS

If migrating from GitHub Pages:
1. Go to your domain registrar's DNS settings
2. Remove or update the CNAME record pointing to `*.github.io`
3. Add the new CNAME record pointing to your Cloudflare Pages URL
4. Wait for DNS propagation (typically 5-30 minutes)

---

## 🐛 Troubleshooting

### ⚠️ "WARNING: failed to open file" errors

**Symptom:** Upload fails with "failed to open ..." or "path too long" errors on Windows.

**Solution 1: Enable Long Paths**
```powershell
# Run PowerShell as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Restart your terminal and try again
```

**Solution 2: Throttle Concurrent Uploads**

Add to your `.env` file:
```bash
CLOUDFLARE_API_MAX_CONCURRENCY=4
```

Then retry:
```bash
npm run deploy:verbose
```

**Solution 3: Check .cfignore**

Ensure `node_modules/`, `src/`, and other source files are excluded:
```bash
# View what will be deployed
npx wrangler pages deploy dist --dry-run --project-name jeremyrobards-site
```

---

### 🔒 401/403 Authentication Errors

**Symptom:** `Error: Authentication failed` or `403 Forbidden`

**Checklist:**
1. ✅ Verify Account ID matches your Cloudflare account
   ```bash
   npx wrangler whoami
   ```
2. ✅ If using API token, check permissions:
   - Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Token must have: **Account → Cloudflare Pages → Edit**
3. ✅ Ensure `.env` file exists and contains:
   ```bash
   CLOUDFLARE_ACCOUNT_ID=your_actual_account_id
   CLOUDFLARE_API_TOKEN=your_actual_token
   ```
4. ✅ Try re-authenticating:
   ```bash
   npx wrangler logout
   npx wrangler login
   ```

---

### 📊 Large File Count (5000+ files)

**Symptom:** Deployment hangs or times out

**Solutions:**

1. **Reduce file count** - Check what's being uploaded:
   ```bash
   npx wrangler pages deploy dist --dry-run --project-name jeremyrobards-site
   ```

2. **Improve .cfignore** - Exclude unnecessary files:
   ```
   node_modules/
   .git/
   *.map
   *.psd
   ```

3. **Throttle uploads** - Add to `.env`:
   ```bash
   CLOUDFLARE_API_MAX_CONCURRENCY=4
   ```

4. **Use verbose mode** to see progress:
   ```bash
   npm run deploy:verbose
   ```

---

### 🔄 Deployment Stuck or Timing Out

**Quick Fixes:**

```bash
# 1. Check wrangler version (should be latest)
npx wrangler --version
npm update -g wrangler

# 2. Clear wrangler cache
rm -rf ~/.wrangler

# 3. Try with verbose output
npm run deploy:verbose

# 4. Check Cloudflare status
# Visit: https://www.cloudflarestatus.com/
```

---

## 📋 Deployment Checklist

### Before First Deploy
- [ ] Wrangler installed: `npx wrangler --version`
- [ ] Authenticated: `npx wrangler login` or API token in `.env`
- [ ] Account ID in `.env` or `wrangler.toml`
- [ ] Build folder confirmed (default: `dist/`)
- [ ] Test deployment: `npm run deploy:test`

### For Each Deploy
- [ ] Build latest changes: `npm run build`
- [ ] Review changes: `git status`
- [ ] Deploy: `npm run deploy`
- [ ] Verify: Check the deployment URL in output
- [ ] Test: Visit your site and verify changes

---

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Direct Upload Guide](https://developers.cloudflare.com/pages/platform/direct-upload/)
- [Custom Domains](https://developers.cloudflare.com/pages/platform/custom-domains/)

---

## 🎯 Quick Command Reference

```bash
# Authentication
npx wrangler login              # Interactive login
npx wrangler whoami             # Verify authentication

# Deployment
npm run build                   # Build the site
npm run deploy:test             # Test with smoke deployment
npm run deploy                  # Deploy to production
npm run deploy:verbose          # Deploy with detailed logs

# Troubleshooting
npx wrangler pages deploy dist --dry-run --project-name jeremyrobards-site  # Preview upload
npx wrangler logout             # Clear auth and re-login
```

---

## 💡 Tips

- **Always test first**: Run `npm run deploy:test` before deploying production
- **Use verbose mode** when troubleshooting: `npm run deploy:verbose`
- **Monitor uploads**: Watch the output for file count and size
- **DNS caching**: After domain changes, use incognito mode or clear DNS cache
- **Rollback**: In Cloudflare dashboard, you can view and activate previous deployments

---

## 🆘 Still Having Issues?

1. Check the [Cloudflare Community Forum](https://community.cloudflare.com/)
2. Review deployment logs in Cloudflare Dashboard → Pages → Deployments
3. Check `wrangler` GitHub issues: [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk/issues)
