# 🧪 STEP 15: Quick Testing Guide

## ✅ What Was Implemented

**Export Button:**
- Shows route and file count on success
- Disabled when metadata invalid

**Publish Button:**
- Shows deployment URL and "View live" link
- Disabled when metadata invalid OR not exported yet

---

## 🚀 Test It Now

### 1. Start the Editor

```bash
npm run cms:dev
```

Open: http://localhost:3030

---

### 2. Test Export Button (Invalid Metadata)

**Steps:**
1. Leave title/excerpt fields empty
2. Observe Export button

**Expected:**
- ✅ Export button is **disabled** (grayed out, 50% opacity)
- ✅ Publish button is **disabled**
- ✅ Hover shows tooltip: "Fix validation errors first"

---

### 3. Test Export Button (Valid Metadata)

**Steps:**
1. Fill in required fields:
   - Title: "Test Article"
   - Excerpt: "This is a test excerpt"
2. Add a paragraph block with some text
3. Observe Export button

**Expected:**
- ✅ Export button is **enabled** (full color, cursor pointer)
- ✅ Publish button still **disabled** (tooltip: "Export article first")

---

### 4. Test Export Workflow

**Steps:**
1. Click "Export Draft" button
2. Watch the UI

**Expected:**
- ✅ Button temporarily disabled during export
- ✅ Toast shows: "📦 Exporting article..."
- ✅ Toast changes to: "✅ Exported to /dist/article/YYYY/MM/slug/ (X files)"
- ✅ Status badge appears under header:
  ```
  ✅ Exported just now
     X files → /dist/article/...
  ```
- ✅ Export button re-enabled
- ✅ **Publish button now enabled**

---

### 5. Test Publish Workflow

**Steps:**
1. Click "Publish" button
2. Click "OK" in confirmation dialog
3. Watch the UI

**Expected:**
- ✅ Button temporarily disabled during publish
- ✅ Toast shows: "🚀 Publishing to Cloudflare Pages..."
- ✅ Toast changes to: "✅ Published! X files (XX.X KB) in X.Xs"
- ✅ Status badge appears:
  ```
  🚀 Published just now
     View live article →
  ```
- ✅ "View live article" link is clickable
- ✅ Publish button re-enabled
- ✅ Dialog prompts to open deployment URL

---

### 6. Test Button Disable Logic

**Test Case A: Edit metadata after export**
1. After successful export, clear the title field
2. Observe buttons

**Expected:**
- ✅ Export button **disabled** (invalid metadata)
- ✅ Publish button **disabled** (invalid metadata takes precedence)

**Test Case B: Fix metadata**
1. Fill in title again
2. Observe buttons

**Expected:**
- ✅ Export button **enabled**
- ✅ Publish button **enabled** (because we already exported)

---

### 7. Test Status Persistence

**Steps:**
1. After export/publish, refresh the page (F5)
2. Observe the UI

**Expected:**
- ✅ Status badges still visible
- ✅ Timestamps updated ("X minutes ago")
- ✅ Publish button still enabled (export status remembered)
- ✅ All metadata and blocks restored

---

### 8. Test "View Live" Link

**Steps:**
1. After successful publish, click "View live article →" link

**Expected:**
- ✅ Opens in new tab
- ✅ URL is: `https://jr-articles.pages.dev/article/YYYY/MM/slug/`
- ✅ Article displays correctly (or shows placeholder if jr-articles not set up yet)

---

## 🐛 Troubleshooting

### Export button stays disabled after filling metadata
**Cause:** Validation might not be updating
**Fix:** Check browser console for errors, verify MetadataPanel validation

### Publish button enabled before export
**Cause:** Export status not being set correctly
**Fix:** Check Network tab for /api/export response, verify `fileCount` present

### Status badges don't show
**Cause:** HTML elements might be missing
**Fix:** Verify `[data-export-status]` and `[data-publish-status]` exist in HTML

### "View live" link 404s
**Cause:** jr-articles project not deployed yet OR route calculation incorrect
**Expected:** Normal for now if jr-articles not set up (STEP 13)
**Future:** Will work after STEP 13 complete and articles deployed

---

## ✅ Quick Checklist

**Core Functionality:**
- [ ] Export button disabled when metadata invalid
- [ ] Export button enabled when metadata valid
- [ ] Publish button disabled when not exported
- [ ] Publish button enabled after export (if metadata valid)
- [ ] Export shows route and file count
- [ ] Publish shows deployment URL and "View live" link
- [ ] Status badges appear and persist

**Edge Cases:**
- [ ] Double-click prevention (buttons disable during operation)
- [ ] Error handling (network errors show error toast)
- [ ] Refresh persistence (status survives page reload)
- [ ] Tooltip messages accurate

**Visual Polish:**
- [ ] Badges animate in smoothly
- [ ] Disabled buttons have 50% opacity
- [ ] "View live" link has hover effect
- [ ] Timestamps update ("just now", "5 minutes ago", etc.)

---

## 📸 Visual Reference

**Before Export:**
```
┌─────────────────────────────────────────┐
│ [Export Draft] [Publish] (grayed out)   │
└─────────────────────────────────────────┘
```

**After Export:**
```
┌─────────────────────────────────────────┐
│ ✅ Exported just now                    │
│    3 files → /dist/article/2025/10/...  │
│ [Export Draft] [Publish]                │
└─────────────────────────────────────────┘
```

**After Publish:**
```
┌─────────────────────────────────────────┐
│ ✅ Exported 2 minutes ago               │
│    3 files → /dist/article/2025/10/...  │
│ 🚀 Published just now                   │
│    View live article →                  │
│ [Export Draft] [Publish]                │
└─────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

STEP 15 is complete when:
1. ✅ Export button shows route and file count
2. ✅ Publish button shows deployment URL and "View live" link
3. ✅ Buttons disabled appropriately (metadata validation, export status)
4. ✅ Status badges display and persist
5. ✅ "View live" link opens correct URL in new tab

---

**Ready to test?** Start with: `npm run cms:dev`

**Need help?** Check `STEP_15_COMPLETE.md` for full implementation details
