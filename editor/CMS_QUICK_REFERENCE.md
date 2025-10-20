# CMS Quick Reference — Fixed Issues

## 🆕 New Features

### Clear Draft Button
**Location:** Header (left of Export Draft)  
**Action:** Purges all localStorage data  
**Confirmation:** Shows dialog before clearing  
**Result:** Fresh start with empty draft

```
Click "Clear Draft" → Confirm → All data cleared → Toast notification
```

### Auto-Save
**Trigger:** Every change (metadata, blocks)  
**Delay:** 2 seconds after last change  
**Storage:** localStorage (instant, no server)  
**Feedback:** Toast "💾 Draft auto-saved"

```
Make change → Wait 2s → Auto-saved → Toast notification
```

---

## 🗑️ Removed Features

### Debug Overlay Tools (No Longer Cluttering UI)
- ~~🎨 Review Mode~~ - Removed
- ~~♿ Accessibility Checker~~ - Removed
- ~~✓ UX Checklist~~ - Removed
- ~~💬 Feedback Drawer~~ - Removed

**Result:** Cleaner UI, faster load, focused editing experience

---

## 📥 File Upload

### Supported Formats
- **Markdown:** `.md`, `.markdown`
- **JSON:** `.json` (structured article data)
- **PDF:** `.pdf` (text extraction)

### How to Upload
1. **Drag & Drop:** Drag file onto "Drop files here" area
2. **File Picker:** Click "browse" link

### Expected Behavior
- Toast shows "Imported N file(s)"
- Import list updates with file name
- Metadata populates automatically
- Blocks populate from content

### Troubleshooting
**If upload fails:**
1. Check browser console (F12)
2. Verify file format is supported
3. Try different upload method (drag vs picker)
4. Check file isn't corrupted

---

## 📦 Export Workflow

### Prerequisites
1. **Server running:** `npm run cms:dev`
2. **Required fields filled:**
   - Title (required)
   - Excerpt (required)
3. **TypeScript compiled:** `npm run cms:compile` (if needed)

### Export Process
```
Fill metadata → Click "Export Draft" → Server processes → Files generated in /dist
```

### Success Indicators
- Toast: "📦 Exporting article..."
- Toast: "✅ Exported to /dist/article/YYYY/MM/slug"
- Green status badge: "Exported N files X minutes ago"

### Common Errors

**"Please fix validation errors"**
- Fill Title field
- Fill Excerpt field
- Check for red validation messages

**"Failed to fetch" or "Network error"**
- Server not running
- Start with: `npm run cms:dev`

**"Export failed: Cannot find module"**
- TypeScript not compiled
- Run: `npm run cms:compile`

**"EACCES: permission denied"**
- `/dist` folder not writable
- Check folder permissions

---

## 🤖 Automation Features

### Auto-Generated (Already Working)

**1. Slug**
- Generated from title
- Updates in real-time
- Shown as "Slug preview: your-slug-here"
- Lowercase, hyphenated, special chars removed

**2. Date**
- Auto-populated with current date/time
- Format: YYYY-MM-DDTHH:mm
- Can be manually changed

**3. Tag Suggestions**
- Suggested based on title/excerpt
- Filters common stop words
- Click to add

**4. Auto-Save (NEW)**
- Saves after 2 seconds of inactivity
- No manual save needed
- Toast notification confirms

---

## 🚀 Quick Start Commands

```bash
# Start CMS development server
npm run cms:dev

# Compile TypeScript (if needed)
npm run cms:compile

# Clear browser cache/localStorage
# In browser: F12 → Application → Storage → Clear Site Data

# Test export manually
curl -X POST http://localhost:5173/api/export \
  -H "Content-Type: application/json" \
  -d '{"metadata":{"title":"Test","excerpt":"Test"},"blocks":[]}'
```

---

## 📋 Testing Checklist

### After Refresh
- [ ] No debug buttons visible (🎨, ♿, ✓, 💬)
- [ ] "Clear Draft" button present in header
- [ ] Draft data loads if saved (or empty if cleared)

### Clear Draft
- [ ] Click "Clear Draft"
- [ ] Confirmation dialog appears
- [ ] After confirming: all fields empty
- [ ] Refresh: no data loads

### Auto-Save
- [ ] Type in any field
- [ ] Wait 2 seconds
- [ ] Toast shows "💾 Draft auto-saved"
- [ ] Refresh: changes persisted

### File Upload
- [ ] Drag file onto dropzone
- [ ] OR click "browse" and select file
- [ ] Toast shows "Imported 1 file"
- [ ] Metadata and blocks populate

### Export
- [ ] Server running (`npm run cms:dev`)
- [ ] Fill Title and Excerpt
- [ ] Click "Export Draft"
- [ ] Toast shows success message
- [ ] Check `/dist/article/` for files

---

## 🐛 Debugging Tips

### Browser Console (F12 → Console)
- Shows import errors
- Shows export request/response
- Shows validation errors
- Shows auto-save triggers

### Server Terminal
- Shows export processing
- Shows compilation errors
- Shows file system errors
- Shows request logs

### Network Tab (F12 → Network)
- Shows `/api/export` request
- Shows request payload
- Shows response status
- Shows response body

---

## 📝 File Locations

**CMS App:**
- `editor/index.html` - Main UI
- `editor/app.js` - Main controller
- `editor/modules/` - Feature modules
- `editor/styles.css` - Styling

**Backend:**
- `cms/serve.js` - Dev server & API
- `cms/export.ts` - Export logic (source)
- `.build/cms/export.js` - Export logic (compiled)

**Output:**
- `dist/article/YYYY/MM/slug/` - Exported articles

**Storage:**
- Browser localStorage: `portfolio-cms-draft`

---

**Last Updated:** 2025-10-20  
**Version:** 1.0 (Post-fixes)
