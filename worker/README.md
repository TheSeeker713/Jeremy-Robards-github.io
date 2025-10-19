# Article Proxy Worker

This Cloudflare Worker proxies `/article/*` requests from your main domain (`www.jeremyrobards.com`) to your separate articles project (`jr-articles.pages.dev`).

## 🎯 Purpose

Allows you to:
- Keep articles in a separate Cloudflare Pages project (`jr-articles`)
- Serve them from your main domain at `/article/*` path
- Cache article content for better performance
- Provide friendly 404 pages when articles don't exist

## 📁 Files

```
worker/
├── src/
│   └── proxy.ts          # Worker code (TypeScript)
├── wrangler.toml         # Worker configuration
└── README.md             # This file
```

## 🚀 Deployment

### Prerequisites

1. **Environment Variables:** Ensure `.env` file (in root directory) has:
   ```bash
   CF_ACCOUNT_ID=your_account_id_here
   CF_API_TOKEN=your_api_token_here
   ```

2. **Custom Domain:** Your domain must be active on Cloudflare with zones configured.

### Deploy the Worker

From the **root directory**, run:

```bash
npm run worker:deploy
```

Or from the `worker/` directory:

```bash
cd worker
wrangler deploy
```

### Expected Output

```
⛅️ wrangler 4.43.0
───────────────────
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded jr-articles-mount (X.XX sec)
Published jr-articles-mount (X.XX sec)
  https://jr-articles-mount.YOUR_SUBDOMAIN.workers.dev
  www.jeremyrobards.com/article/*
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🧪 Testing

### Test Locally (Development Mode)

Run the worker locally with live reload:

```bash
npm run worker:dev
```

Visit: http://localhost:8787/article/test

### Test Production Deployment

After deploying, test these URLs:

1. **Direct worker URL:**
   ```
   https://jr-articles-mount.YOUR_SUBDOMAIN.workers.dev/article/test
   ```

2. **Custom domain route:**
   ```
   https://www.jeremyrobards.com/article/test
   ```

### Test 404 Handling

Visit a non-existent article:
```
https://www.jeremyrobards.com/article/does-not-exist
```

You should see a friendly 404 page with a link back to `/writing.html`.

## 📊 Monitoring

### View Real-Time Logs

```bash
npm run worker:tail
```

Or:

```bash
cd worker
wrangler tail
```

This shows live requests and console logs from your worker.

### Check Deployment Status

```bash
cd worker
wrangler deployments list
```

## 🔧 Configuration

### Routes

Defined in `wrangler.toml`:

```toml
[[routes]]
pattern = "www.jeremyrobards.com/article/*"
zone_name = "jeremyrobards.com"
```

This tells Cloudflare to route all `/article/*` requests to this worker.

### Cache Settings

Articles are cached with:
- **Browser cache:** 5 minutes (`max-age=300`)
- **Edge cache:** 24 hours (`s-maxage=86400`)
- **404 responses:** 1 minute (`max-age=60`)

Modify cache headers in `src/proxy.ts` if needed.

### Upstream Target

Currently hardcoded to `https://jr-articles.pages.dev`

To change the upstream URL, edit `src/proxy.ts`:

```typescript
const upstreamUrl = new URL(url.pathname + url.search, 'https://jr-articles.pages.dev');
```

## 🔍 How It Works

```
User Request:
www.jeremyrobards.com/article/2025/10/my-post
                    ↓
         Cloudflare Worker (this)
                    ↓
            Fetch from upstream:
   jr-articles.pages.dev/article/2025/10/my-post
                    ↓
         Return response to user
         (with cache headers)
```

## 🛠️ Troubleshooting

### "Route could not be found"

- Ensure your domain is active on Cloudflare
- Check that `zone_name` in `wrangler.toml` matches your domain exactly
- Verify domain has DNS records configured

### "Account ID not found"

- Check `.env` file has `CF_ACCOUNT_ID` set
- Verify `wrangler.toml` references: `account_id = "${CF_ACCOUNT_ID}"`
- Run `npx wrangler whoami` to confirm authentication

### Worker deployed but route not working

- Wait 1-2 minutes for route propagation
- Check Worker dashboard: https://dash.cloudflare.com/ → Workers & Pages → jr-articles-mount
- Verify route is listed under "Routes" tab

### 503 errors

- Check if `jr-articles` Pages project is deployed
- Visit https://jr-articles.pages.dev/article/test directly
- Check worker logs: `npm run worker:tail`

## 📚 References

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Routing](https://developers.cloudflare.com/workers/platform/routing/)
- [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)

## 🔐 Security Notes

- ❌ **Never commit** `CF_ACCOUNT_ID` or `CF_API_TOKEN` directly in `wrangler.toml`
- ✅ **Always use** environment variables: `${CF_ACCOUNT_ID}`
- ✅ `.env` file is in `.gitignore` (safe from commits)
- ✅ Worker validates paths (only proxies `/article/*`)

## 🎛️ Advanced Configuration

### Add Multiple Routes

To support both `www` and apex domain:

```toml
[[routes]]
pattern = "www.jeremyrobards.com/article/*"
zone_name = "jeremyrobards.com"

[[routes]]
pattern = "jeremyrobards.com/article/*"
zone_name = "jeremyrobards.com"
```

### Environment Variables

Add worker-specific env vars in `wrangler.toml`:

```toml
[vars]
UPSTREAM_URL = "https://jr-articles.pages.dev"
DEBUG_MODE = "false"
```

Access in code:

```typescript
const upstreamBase = env.UPSTREAM_URL || 'https://jr-articles.pages.dev';
```

### Custom 404 Page

Modify `createNotFoundResponse()` in `src/proxy.ts` to customize the 404 page design.

---

**Status:** ✅ Ready to deploy  
**Last Updated:** October 18, 2025
