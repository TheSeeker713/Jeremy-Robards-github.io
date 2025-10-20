# 🚀 Quick Deployment Reference

**Portfolio Website → Cloudflare Pages**

---

## One-Command Deployment

```bash
npm run deploy:all
```

This interactive script will:
1. ✅ Run pre-flight checks
2. 📦 Deploy main site (Project A)
3. 🔧 Deploy article worker (routing proxy)
4. 📝 Optionally deploy articles (Project B)
5. ✨ Show verification checklist

---

## Individual Deployments

### Main Site
```bash
npm run deploy
```
→ Deploys to `jeremyrobards-site.pages.dev`  
→ Custom domain: `www.jeremyrobards.com`

### Worker (Article Proxy)
```bash
cd worker
npm run deploy
```
→ Handles `/article/*` routing  
→ Proxies to `jr-articles.pages.dev`

### Articles (CMS)
```bash
npm run cms:export
wrangler pages deploy dist/ --project-name jr-articles --branch production
```
→ Deploys exported articles  
→ Accessible via worker at `/article/yyyy/mm/slug`

---

## Pre-Deploy Checklist

- [ ] Run validation: `npm run validate:deploy`
- [ ] Check E2E tests: `npm run test:e2e` (should be 75/75)
- [ ] Review changes: `git diff main`
- [ ] Update version: `package.json` version bump
- [ ] Commit changes: `git commit -m "Release v1.x.x"`

---

## Post-Deploy Checklist

### Immediate (< 5 min)
- [ ] Verify main site: https://www.jeremyrobards.com
- [ ] Test navigation: Click through all pages
- [ ] Check theme toggle: Dark/light mode
- [ ] Test mobile: Responsive breakpoints
- [ ] Worker logs: `cd worker && npm run worker:tail`

### Within 1 Hour
- [ ] Run Lighthouse: `npx lighthouse https://www.jeremyrobards.com --view`
- [ ] Check security headers: `curl -I https://www.jeremyrobards.com`
- [ ] SSL Labs test: https://www.ssllabs.com/ssltest/
- [ ] Cloudflare Analytics: Check traffic/errors
- [ ] Test /article/* routing (if deployed)

### Within 24 Hours
- [ ] Multi-region testing: WebPageTest from US, EU, Asia
- [ ] Security scan: https://securityheaders.com/
- [ ] Monitor error rates: Should be < 1%
- [ ] Cache hit rate: Should be > 80%
- [ ] Collect feedback from testers

---

## Quick Rollback

### Main Site
**Via Dashboard:**  
Pages → jeremyrobards-site → Deployments → "..." → Rollback

**Via CLI:**
```bash
git checkout <previous-commit>
npm run deploy
```

### Worker
```bash
cd worker
wrangler rollback
```

---

## Monitoring

### Live Worker Logs
```bash
cd worker
npm run worker:tail
```

### Cloudflare Analytics
Dashboard → jeremyrobards-site → Analytics

**Watch for:**
- ✅ Requests per day (traffic)
- ✅ Cache hit rate (> 80%)
- ⚠️ 4xx/5xx errors (< 1%)
- ⚠️ Origin response time (< 500ms)

### Performance Testing
```bash
# Lighthouse
npx lighthouse https://www.jeremyrobards.com --view

# WebPageTest
# Visit: https://www.webpagetest.org/
# Enter URL, test from multiple locations

# Manual speed check
curl -w "@curl-format.txt" -o /dev/null -s https://www.jeremyrobards.com
```

Create `curl-format.txt`:
```
time_namelookup:    %{time_namelookup}s\n
time_connect:       %{time_connect}s\n
time_appconnect:    %{time_appconnect}s\n
time_pretransfer:   %{time_pretransfer}s\n
time_redirect:      %{time_redirect}s\n
time_starttransfer: %{time_starttransfer}s\n
time_total:         %{time_total}s\n
```

---

## Common Issues

### "wrangler: command not found"
```bash
npm install -g wrangler
# Or use npx:
npx wrangler --version
```

### "Deployment failed: Account ID not found"
```bash
# Set account ID in .env
echo "CF_ACCOUNT_ID=your-account-id" >> .env

# Or pass inline:
CF_ACCOUNT_ID=your-id npm run deploy
```

### Articles not loading (404)
```bash
# Check worker is deployed:
wrangler whoami
# Check worker logs:
cd worker && npm run worker:tail
# Re-deploy worker:
npm run worker:deploy
```

### Slow performance
```bash
# Check cache headers:
curl -I https://www.jeremyrobards.com/assets/image.webp | grep -i cache

# Verify cache hit rate in Cloudflare Analytics
# Should be > 80%
```

---

## Documentation

- **Full Guide:** `CLOUDFLARE_DEPLOY_GUIDE.md`
- **OPT STEP 7 Summary:** `OPT-STEP-7-SUMMARY.md`
- **Pre-Deploy Report:** `reports/pre-deploy-validation.md`

---

## Emergency Contacts

**Cloudflare Support:**
- Dashboard: https://dash.cloudflare.com/
- Community: https://community.cloudflare.com/
- Status: https://www.cloudflarestatus.com/

**Useful Tools:**
- Lighthouse: https://pagespeed.web.dev/
- SSL Labs: https://www.ssllabs.com/ssltest/
- Security Headers: https://securityheaders.com/
- WebPageTest: https://www.webpagetest.org/

---

**Last Updated:** 2025-10-20  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
