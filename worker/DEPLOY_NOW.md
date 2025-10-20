# 🚀 STEP 14: Quick Deploy Guide

## ✅ Status: READY TO DEPLOY

All files created, no conflicts detected. Your environment is configured.

---

## 📦 What Was Built

```
worker/
├── src/
│   └── proxy.ts          ✅ TypeScript worker (proxies /article/* → jr-articles.pages.dev)
├── wrangler.toml         ✅ Worker config (routes, account_id from env)
└── README.md             ✅ Full documentation
```

**Features:**

- ✅ Path/querystring preservation
- ✅ Cache headers: 5min browser, 24h edge
- ✅ Friendly 404 pages
- ✅ Error handling (503 on failures)
- ✅ No secrets in code (uses .env)

---

## 🎯 One Command Deploy

```bash
npm run worker:deploy
```

**What happens:**

1. Wrangler reads `worker/wrangler.toml`
2. Gets `CF_ACCOUNT_ID` from `.env`
3. Uploads TypeScript worker to Cloudflare
4. Activates route: `www.jeremyrobards.com/article/*`

**Expected output:**

```
⛅️ wrangler 4.43.0
Total Upload: XX.XX KiB
Published jr-articles-mount
  www.jeremyrobards.com/article/*
```

---

## 🧪 Quick Test

After deploy, test these URLs:

**1. Test proxy (should fetch from jr-articles project):**

```
https://www.jeremyrobards.com/article/
```

**2. Test 404 handling:**

```
https://www.jeremyrobards.com/article/does-not-exist
```

Should show purple gradient 404 page.

**3. Monitor live:**

```bash
npm run worker:tail
```

---

## ⚡ Troubleshooting

| Issue                           | Solution                         |
| ------------------------------- | -------------------------------- |
| "Account ID not found"          | Check `.env` has `CF_ACCOUNT_ID` |
| "Route could not be found"      | Wait 1-2 minutes for propagation |
| "Authentication error"          | Run `npx wrangler whoami`        |
| Worker deployed but route fails | Check domain is on Cloudflare    |

---

## 📊 Architecture

```
User Request → www.jeremyrobards.com/article/test
                         ↓
              Cloudflare Worker (jr-articles-mount)
                         ↓
              Fetch: jr-articles.pages.dev/article/test
                         ↓
              Return (with cache headers)
```

---

## 🎓 Advanced

**Local development:**

```bash
npm run worker:dev
# Visit: http://localhost:8787/article/test
```

**View deployments:**

```bash
cd worker && wrangler deployments list
```

**Add apex domain route:** Uncomment in `worker/wrangler.toml`:

```toml
[[routes]]
pattern = "jeremyrobards.com/article/*"
zone_name = "jeremyrobards.com"
```

---

## ✅ Pre-Deployment Checklist

- ✅ `.env` has `CF_ACCOUNT_ID` and `CF_API_TOKEN`
- ✅ `wrangler whoami` shows authenticated
- ✅ `jr-articles` Pages project exists
- ✅ Custom domain `www.jeremyrobards.com` active on Cloudflare
- ✅ No TypeScript errors in `worker/src/proxy.ts`

---

## 🚀 Ready? Deploy Now!

```bash
npm run worker:deploy
```

**Full docs:** See `worker/README.md` for comprehensive guide.

---

**Time to deploy:** 1-2 minutes  
**Status:** ✅ READY
