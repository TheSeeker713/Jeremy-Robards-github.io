# Custom Domain Setup for Cloudflare Pages

## Current Situation
- ❌ www.jeremyrobards.com → GitHub Pages (404 error)
- ✅ https://production.jeremyrobards-site.pages.dev → Cloudflare (working!)

## Goal
- ✅ www.jeremyrobards.com → Cloudflare Pages

---

## STEP 1: Add Custom Domain in Cloudflare Pages

### 1a. Navigate to Your Pages Project
1. Open: https://dash.cloudflare.com/
2. Click: **Workers & Pages** (left sidebar)
3. Click: **jeremyrobards-site** project
4. Click: **Custom domains** tab

### 1b. Add Your Domain
1. Click: **Set up a custom domain** button
2. Enter: `www.jeremyrobards.com`
3. Click: **Continue**

### 1c. Cloudflare Will Show DNS Records
You'll see instructions to add DNS records. Since your domain is likely already on Cloudflare, it will:
- ✅ Auto-detect your domain
- ✅ Show you the required DNS changes

---

## STEP 2: Update DNS Records

### Option A: Domain Already on Cloudflare (Most Likely)
If `jeremyrobards.com` is already using Cloudflare nameservers:

1. Cloudflare will show: **"We've automatically added the required DNS records"**
2. Click: **Activate domain**
3. Done! DNS will propagate in 1-5 minutes

### Option B: Domain NOT on Cloudflare
If your domain is with another provider (GoDaddy, Namecheap, etc.):

1. You'll see a CNAME record to add:
   ```
   Type:  CNAME
   Name:  www
   Value: jeremyrobards-site.pages.dev
   ```

2. Go to your domain registrar's DNS settings
3. **Remove** the old GitHub Pages CNAME record
4. **Add** the new Cloudflare Pages CNAME record
5. Save changes
6. Wait 5-60 minutes for DNS propagation

---

## STEP 3: Verify Setup

### 3a. Check DNS Propagation
Wait 1-5 minutes, then visit:
- https://www.jeremyrobards.com

Expected result:
- ✅ Your portfolio site loads (no more 404!)
- ✅ SSL certificate automatically provisioned by Cloudflare

### 3b. Check SSL Status
In Cloudflare dashboard (Custom domains tab):
- Status should show: **Active** ✅
- SSL status: **Active** 🔒

---

## STEP 4: Add Apex Domain (Optional)

If you also want `jeremyrobards.com` (without www) to work:

1. In **Custom domains** tab, click: **Set up a custom domain**
2. Enter: `jeremyrobards.com` (no www)
3. Cloudflare will automatically create a redirect: `jeremyrobards.com` → `www.jeremyrobards.com`
4. Both will work!

---

## STEP 5: Disable GitHub Pages (Cleanup)

After confirming your Cloudflare domain works:

1. Go to: https://github.com/TheSeeker713/Jeremy-Robards-github.io
2. Click: **Settings**
3. Scroll to: **Pages** section
4. Click: **Remove** or set source to **None**
5. Optional: Delete the old `CNAME` file from your repo

This prevents confusion and ensures all traffic goes to Cloudflare.

---

## Troubleshooting

### ❌ "Domain already exists" error
- Domain might be configured for another Cloudflare project
- Remove it from the other project first
- Or use a subdomain like `portfolio.jeremyrobards.com`

### ❌ SSL certificate pending
- Wait 5-15 minutes for Cloudflare to provision SSL
- Check status in Custom domains tab
- May need to temporarily disable "Universal SSL" and re-enable

### ❌ Still seeing GitHub 404
- DNS changes can take up to 48 hours (usually 5-60 minutes)
- Clear browser cache or try incognito mode
- Check DNS propagation: https://dnschecker.org/

### ❌ "Too many redirects" error
- In Cloudflare SSL/TLS settings, set to: **Full** (not Flexible)
- Path: SSL/TLS → Overview → Encryption mode: Full

---

## Quick Reference

**Cloudflare Dashboard:** https://dash.cloudflare.com/  
**Pages Project:** jeremyrobards-site  
**Production URL:** https://production.jeremyrobards-site.pages.dev  
**Custom Domain:** www.jeremyrobards.com  

**DNS Check Tool:** https://dnschecker.org/?type=CNAME&query=www.jeremyrobards.com  
**SSL Status:** Auto-provisioned by Cloudflare (free)  

---

## What Happens After Setup

1. **www.jeremyrobards.com** → Cloudflare Pages (your portfolio) ✅
2. **Automatic SSL** → https:// with free certificate 🔒
3. **Global CDN** → Fast loading worldwide 🌍
4. **Auto-updates** → Every deploy updates the site instantly 🚀

No more GitHub Pages! Everything runs on Cloudflare.
