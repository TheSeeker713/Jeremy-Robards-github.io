# Cloudflare Deployment Guide

**Portfolio Website + Article CMS**  
**Status:** ✅ Ready for Deployment  
**Validation:** All pre-deploy gates passed

---

## Architecture Overview

This portfolio uses a **dual-project architecture** on Cloudflare:

### Project A: Main Portfolio (`jeremyrobards-site`)
- **Type:** Cloudflare Pages (Static Site)
- **Content:** Portfolio pages (index.html, aidev.html, mpd.html, etc.)
- **Domain:** `www.jeremyrobards.com`
- **Source:** Root directory (GitHub Pages compatible structure)

### Project B: Article CMS (`jr-articles`)
- **Type:** Cloudflare Pages (Static Export from CMS)
- **Content:** Generated articles from Decap CMS
- **URL Structure:** `/article/YYYY/MM/slug/`
- **Source:** `dist/` directory after CMS export

### Cloudflare Worker: Article Proxy
- **Name:** `jr-articles-mount`
- **Purpose:** Route `/article/*` requests from main domain to Project B
- **Benefits:** 
  - Unified domain (no subdomain for articles)
  - Independent article deployments
  - Better caching control

---

## Deployment Sequence

### Phase 1: Deploy Main Portfolio (Project A)

1. **Test Locally First**
   ```bash
   # Serve the site locally
   npm run serve
   # Open http://localhost:8000
   ```

2. **Deploy to Cloudflare Pages**
   ```bash
   npm run deploy
   # Or with verbose output:
   npm run deploy:verbose
   ```

3. **Verify Deployment**
   - Visit https://jeremyrobards-site.pages.dev
   - Test navigation: index, aidev, mpd, iis, about, writing
   - Confirm theme toggle works
   - Check mobile responsiveness

---

### Phase 2: Deploy Article Worker

1. **Build Worker (if using TypeScript)**
   ```bash
   cd worker
   npm install
   npm run build
   ```

2. **Deploy Worker**
   ```bash
   # From worker directory:
   npm run deploy

   # Or from root:
   npm run worker:deploy
   ```

3. **Verify Worker Routes**
   - Worker should be bound to: `www.jeremyrobards.com/article/*`
   - Test: Visit non-existent article (should see friendly 404)
   - Test: Worker logs with `npm run worker:tail`

---

### Phase 3: Deploy Sample Article (Project B)

1. **Export Article from CMS**
   ```bash
   # Generate article manifest
   npm run generate:manifest

   # Export articles to dist/
   npm run cms:export
   ```

2. **Deploy Article Project**
   ```bash
   # Deploy dist/ to jr-articles project
   wrangler pages deploy dist/ --project-name jr-articles --branch production
   ```

3. **Verify Article Access**
   - Direct URL: https://jr-articles.pages.dev/article/2025/10/test-article/
   - Via Worker: https://www.jeremyrobards.com/article/2025/10/test-article/
   - Check: Images load, styles applied, mobile responsive

---

## Cloudflare Configuration

### Caching Rules (via Dashboard)

Navigate to: **Cloudflare Dashboard → Caching → Cache Rules**

**Rule 1: Long TTL for Assets**
- **Pattern:** `*jeremyrobards.com/assets/*` OR `*jeremyrobards.com/article-assets/*`
- **Cache Duration:** 1 month (2592000 seconds)
- **Browser Cache:** 1 week (604800 seconds)
- **Edge Cache TTL:** Override to 30 days

**Rule 2: Article Content**
- **Pattern:** `*jeremyrobards.com/article/*`
- **Cache Duration:** 1 hour (3600 seconds)
- **Browser Cache:** 5 minutes (300 seconds)
- **Edge Cache TTL:** 24 hours (86400 seconds)

### Security Headers

Navigate to: **Transform Rules → Modify Response Headers**

**Add Security Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### SSL/TLS Configuration

- **SSL/TLS Encryption Mode:** Full (Strict)
- **Minimum TLS Version:** 1.2
- **TLS 1.3:** Enabled
- **Automatic HTTPS Rewrites:** Enabled
- **Always Use HTTPS:** Enabled

### WAF (Web Application Firewall)

Navigate to: **Security → WAF**

**Managed Rulesets:**
- ✅ Cloudflare Managed Ruleset (enabled)
- ✅ Cloudflare OWASP Core Ruleset (enabled)

**Rate Limiting:**
- **Rule:** Limit requests to 100 per minute per IP
- **Action:** Challenge (CAPTCHA)
- **Bypass:** Known good bots (Google, Bing)

---

## Post-Deploy Validation

### Lighthouse Testing

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run Lighthouse on deployed site
lhci autorun --collect.url=https://www.jeremyrobards.com
lhci autorun --collect.url=https://www.jeremyrobards.com/aidev.html
lhci autorun --collect.url=https://www.jeremyrobards.com/article/2025/10/sample/
```

**Target Scores:**
- Performance: >= 90
- Accessibility: >= 95
- Best Practices: >= 95
- SEO: >= 95

### Multi-Region Testing

Test from multiple locations using:
- https://tools.pingdom.com/
- https://www.webpagetest.org/
- Cloudflare Analytics → Performance

**Target Metrics:**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Security Testing

```bash
# Check security headers
curl -I https://www.jeremyrobards.com | grep -E "(Strict-Transport|X-Content-Type|X-Frame)"

# SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=jeremyrobards.com

# Security Headers test
# Visit: https://securityheaders.com/?q=jeremyrobards.com&followRedirects=on
```

**Target Grade:** A or A+

---

## Rollback Procedure

If deployment issues occur:

### Rollback Main Site (Project A)

1. **Via Cloudflare Dashboard:**
   - Navigate to: Pages → jeremyrobards-site → Deployments
   - Find last stable deployment
   - Click "..." → "Rollback to this deployment"

2. **Via CLI:**
   ```bash
   # List recent deployments
   wrangler pages deployment list --project-name jeremyrobards-site
   
   # Rollback (re-deploy previous version)
   git checkout <previous-commit>
   npm run deploy
   ```

### Rollback Worker

```bash
cd worker
wrangler rollback --message "Rolling back to previous version"
```

### Rollback Articles (Project B)

```bash
# Re-deploy previous dist/ build
cd /path/to/previous/build
wrangler pages deploy . --project-name jr-articles --branch production
```

---

## Monitoring & Alerts

### Cloudflare Analytics

Monitor these metrics:
- **Traffic:** Requests per day, bandwidth
- **Performance:** Cache hit rate (target: >80%), response time
- **Errors:** 4xx/5xx rates (should be <1%)
- **Security:** Threats blocked, rate limit triggers

### Set Up Alerts (via Dashboard)

Navigate to: **Notifications → Add Notification**

**Alert 1: High Error Rate**
- Trigger: 4xx rate > 5% for 5 minutes
- Channels: Email, Slack

**Alert 2: Performance Degradation**
- Trigger: Origin response time > 2s for 5 minutes
- Channels: Email

**Alert 3: Security Threats**
- Trigger: WAF blocks > 100 per minute
- Channels: Email, SMS

---

## Troubleshooting

### Issue: Articles Not Loading

**Symptoms:** `/article/*` returns 404

**Check:**
1. Worker is deployed: `wrangler whoami` then check dashboard
2. Worker route is correct: `www.jeremyrobards.com/article/*`
3. Project B is deployed: Visit `https://jr-articles.pages.dev/article/...` directly
4. DNS is resolving: `nslookup www.jeremyrobards.com`

**Fix:**
```bash
# Re-deploy worker
cd worker
npm run deploy

# Check worker logs
npm run worker:tail
```

### Issue: Slow Performance

**Symptoms:** LCP > 3s, low Lighthouse scores

**Check:**
1. Cache hit rate in Cloudflare Analytics (should be >80%)
2. Image optimization (use WebP, proper sizes)
3. Asset compression (Gzip/Brotli enabled)

**Fix:**
- Review caching rules (extend TTLs for static assets)
- Enable Auto Minify (HTML, CSS, JS)
- Use Cloudflare Image Resizing for responsive images

### Issue: Security Header Warnings

**Symptoms:** SecurityHeaders.com grade < A

**Check:**
1. Transform Rules are applied
2. Headers appear in `curl -I` output
3. No conflicting headers from origin

**Fix:**
```bash
# Test headers locally
curl -I https://www.jeremyrobards.com | grep -i "strict-transport"

# If missing, re-apply Transform Rules in dashboard
```

---

## Maintenance

### Monthly Tasks

- [ ] Review Cloudflare Analytics (traffic patterns, errors)
- [ ] Run Lighthouse audits (check for regressions)
- [ ] Update dependencies: `npm outdated && npm update`
- [ ] Check Cloudflare changelog for new features

### Quarterly Tasks

- [ ] Security audit: Test headers, SSL config
- [ ] Performance benchmark: Compare to baseline
- [ ] Review WAF rules: Adjust rate limits if needed
- [ ] Backup configuration: Document all Cloudflare settings

### Annual Tasks

- [ ] Renew SSL certificates (if custom cert)
- [ ] Review and optimize caching strategy
- [ ] Test disaster recovery (rollback procedure)
- [ ] Update documentation with lessons learned

---

## Additional Resources

**Cloudflare Documentation:**
- [Pages Deployment Guide](https://developers.cloudflare.com/pages/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cache Configuration](https://developers.cloudflare.com/cache/)

**Performance Tools:**
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

**Security Tools:**
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

**Deployment Checklist:**
- ✅ Pre-deploy validation passed
- ⬜ Main site deployed (Project A)
- ⬜ Worker deployed and tested
- ⬜ Sample article deployed (Project B)
- ⬜ Cloudflare caching configured
- ⬜ Security headers applied
- ⬜ WAF rules enabled
- ⬜ Post-deploy Lighthouse tests
- ⬜ Multi-region testing complete
- ⬜ Monitoring alerts configured

---

**Last Updated:** 2025-10-20  
**Next Review:** 2025-11-20
