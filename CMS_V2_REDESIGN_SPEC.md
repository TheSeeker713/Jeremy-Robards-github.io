# CMS Complete Redesign Specification

**Date:** 2025-10-20  
**Scope:** Full UI/UX overhaul of Portfolio Article Studio  
**Goal:** Intuitive, professional content management system

---

## Executive Summary

Complete rebuild of the CMS from scratch with modern UI patterns:
- **Side panel navigation** (instead of grid layout)
- **Top menu bar** with primary actions
- **Rich text editing** (WYSIWYG instead of plain blocks)
- **Auto-population** from imported files
- **Image management** with gallery and caption system
- **Draft system** with unlimited storage and organization
- **Publish queue** with scheduler (up to 10 queued articles)
- **Smart validation** with incomplete article detection

---

## UI Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Top Menu Bar                                               │
│  [Logo] Save Draft | Publish Now | Queue | Preview | Export│
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Side    │  Main Content Area                              │
│  Panel   │  ┌────────────────────────────────────────────┐ │
│          │  │  Metadata Fields                           │ │
│  • New   │  │  Title, Subtitle, Author, etc.            │ │
│  • Drafts│  └────────────────────────────────────────────┘ │
│  • Images│                                                  │
│  • Queue │  ┌────────────────────────────────────────────┐ │
│  • Sched.│  │  Rich Text Editor                          │ │
│          │  │  [Bold][Italic][H1][H2][Image][Link]      │ │
│          │  │  Content with formatting...               │ │
│          │  └────────────────────────────────────────────┘ │
│          │                                                  │
│          │  ┌────────────────────────────────────────────┐ │
│          │  │  Live Preview                              │ │
│          │  │  Formatted article with image placeholders│ │
│          │  └────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

---

## Feature Specifications

### 1. Side Panel Navigation

**Purpose:** Primary navigation and content organization

**Sections:**

#### A. New Article
- Click to clear current draft
- Starts fresh article
- Prompts to save current if unsaved

#### B. Drafts
- **Display:** List view with thumbnails
- **Sorting:** Name, Date Modified, Size, Date Created
- **Search:** Filter by title/author
- **Actions:** Open, Rename, Delete, Duplicate
- **Storage:** IndexedDB (unlimited capacity)
- **Structure:**
  ```
  Drafts/
    ├── article-name-1.json
    ├── article-name-2.json
    └── article-name-3.json
  ```

#### C. Images
- **Display:** Grid gallery view
- **Upload:** Drag-and-drop or file picker
- **Storage:** IndexedDB or server folder `/uploads/images/`
- **Info:** Filename, size, dimensions, upload date
- **Actions:** Delete, Rename, Copy URL
- **Usage tracking:** Shows which articles use each image

#### D. Queue / Scheduler
- **Display:** List of queued articles (max 10)
- **Features:**
  - Drag-to-reorder
  - Set publish date/time
  - Edit before publish
  - Remove from queue
- **Auto-publish:** Background process checks scheduled times

#### E. Settings (Optional)
- Default author name
- Default category
- Auto-save preferences
- Export settings

**Visual Design:**
- Width: 240px
- Collapsible (hamburger icon)
- Icons for each section
- Active section highlighted
- Smooth transitions

---

### 2. Top Menu Bar

**Purpose:** Primary actions and status

**Left Side:**
- Logo/App name: "Portfolio CMS"
- Current article title (if loaded)

**Right Side (Action Buttons):**

#### Save Draft
- **Icon:** 💾
- **Action:** Save to drafts folder
- **Shortcut:** Ctrl+S
- **Status:** Shows "Saved" or "Unsaved changes"
- **No Auto-Save** (per user request)

#### Publish Now
- **Icon:** 🚀
- **Action:** Immediate publish to production
- **Validation:** Warns if incomplete
- **Confirmation:** "Publish [Title]?"

#### Add to Queue
- **Icon:** 📅
- **Action:** Opens scheduler modal
- **Inputs:** Publish date, publish time
- **Max:** 10 articles in queue

#### Preview
- **Icon:** 👁️
- **Action:** Opens preview in modal or toggles preview pane
- **Live:** Updates as you type

#### Export
- **Icon:** 📦
- **Action:** Export to HTML/PDF/JSON
- **Options:** Format selection dropdown

**Visual Design:**
- Height: 60px
- Background: Gradient or solid color
- Box shadow for depth
- Responsive: Collapse to hamburger on mobile

---

### 3. Rich Text Editor (WYSIWYG)

**Technology Options:**
- **TinyMCE** - Full-featured, mature
- **Quill** - Lightweight, modern
- **Tiptap** - Headless, flexible (recommended)

**Features Required:**

#### Formatting Toolbar
- **Text:** Bold, Italic, Underline, Strikethrough
- **Headings:** H1, H2, H3, H4, H5, H6
- **Lists:** Ordered, Unordered, Checklist
- **Alignment:** Left, Center, Right, Justify
- **Insert:** Link, Image, Quote, Code Block, Horizontal Rule
- **Advanced:** Table, Embed (YouTube, etc.)

#### Image Insertion
- Click "Image" button → Opens image gallery modal
- Select from uploaded images OR upload new
- Image inserted with wrapper for caption
- **Wrapper structure:**
  ```html
  <figure class="article-image">
    <img src="/uploads/images/photo.jpg" alt="Description">
    <figcaption>
      <input type="text" placeholder="Enter image caption...">
    </figcaption>
  </figure>
  ```

#### Content Formatting
- **Auto-formatting:** Markdown-style shortcuts
  - `# ` → H1
  - `## ` → H2
  - `**bold**` → **bold**
  - `![alt](url)` → Image
- **Paste handling:** Clean paste from Word/Google Docs
- **Undo/Redo:** Full history (Ctrl+Z, Ctrl+Y)

**Visual Design:**
- Toolbar: Sticky at top of editor
- Font: System font stack for readability
- Line height: 1.6 for comfortable reading
- Max width: 720px (readable line length)

---

### 4. Auto-Population System

**Trigger:** File import (PDF, MD, JSON, TXT)

**Process:**

#### Step 1: File Detection
```javascript
const fileType = detectFileType(file);
// Returns: 'pdf', 'markdown', 'json', 'text'
```

#### Step 2: Content Extraction
- **PDF:** Extract text, headings, images (using PDF.js)
- **Markdown:** Parse with gray-matter (frontmatter → metadata, body → content)
- **JSON:** Map fields to metadata/blocks
- **TXT:** Import as plain text, detect structure

#### Step 3: Auto-Population
```javascript
{
  metadata: {
    title: extractedFromFirstH1OrFilename,
    subtitle: extractedFromFirstParagraph,
    author: extractedFromMetadata || userDefault,
    date: fileCreationDate,
    category: autoDetectedFromKeywords,
    tags: extractedKeywords,
    excerpt: firstParagraphOrSummary
  },
  content: richTextHTML, // Formatted content
  images: extractedImages[] // Image data with captions
}
```

#### Step 4: Preview Generation
- Render formatted article
- Show image placeholders where images detected
- Show caption boxes below each image
- Highlight missing images (broken placeholder)

**User Feedback:**
- Toast: "Imported [filename] - Auto-populated metadata and content"
- Highlight populated fields with color/animation
- Allow manual editing of all auto-populated data

---

### 5. Image Management System

**Upload Flow:**

#### A. Upload Interface
- **Location:** Side panel "Images" section
- **Method:** Drag-and-drop zone OR file picker
- **Accepted:** .jpg, .jpeg, .png, .gif, .webp, .svg
- **Validation:** Max 5MB per image, auto-compress if larger

#### B. Storage
```
/uploads/images/
  ├── 2025-10-20-sunset-beach.jpg
  ├── 2025-10-20-profile-photo.png
  └── 2025-10-19-product-shot.webp
```
- Filename: `YYYY-MM-DD-original-name.ext`
- Metadata stored in IndexedDB:
  ```json
  {
    "id": "img_123",
    "filename": "2025-10-20-sunset-beach.jpg",
    "size": 245678,
    "dimensions": { "width": 1920, "height": 1080 },
    "uploadDate": "2025-10-20T15:30:00Z",
    "usedIn": ["article-slug-1", "article-slug-2"]
  }
  ```

#### C. Image Gallery Modal
- **Trigger:** Click image placeholder in preview OR click "Insert Image" in editor
- **Display:** Grid of thumbnails (3-4 columns)
- **Actions:**
  - Click image → Select and insert
  - Upload new → Add to gallery and select
  - Search/filter by name
- **Layout:**
  ```
  ┌────────────────────────────┐
  │  Image Gallery      [Upload]│
  │  ┌────┐ ┌────┐ ┌────┐     │
  │  │Img1│ │Img2│ │Img3│     │
  │  └────┘ └────┘ └────┘     │
  │  ┌────┐ ┌────┐ ┌────┐     │
  │  │Img4│ │Img5│ │Img6│     │
  │  └────┘ └────┘ └────┘     │
  │  [Cancel]      [Select]    │
  └────────────────────────────┘
  ```

#### D. Caption System
- **Display:** Text input below each image in preview
- **Storage:** Embedded in article HTML as `<figcaption>`
- **Features:**
  - Rich text formatting (bold, italic, link)
  - Character limit: 500 characters
  - Auto-save on blur

#### E. Word Wrap Around Images
- **CSS Implementation:**
  ```css
  .article-image {
    float: left; /* or right */
    margin: 0 20px 20px 0;
    max-width: 400px;
  }
  
  .article-image.align-right {
    float: right;
    margin: 0 0 20px 20px;
  }
  ```
- **Controls:** Alignment buttons (left, right, center, full-width)
- **Responsive:** Stack on mobile (no float)

---

### 6. Draft Management System

**Storage:** IndexedDB (browser-based, unlimited)

**Draft Structure:**
```javascript
{
  id: "draft_20251020_153045",
  title: "Article Title",
  slug: "article-title",
  metadata: { /* all metadata fields */ },
  content: "<h1>Article Title</h1><p>Content...</p>",
  images: [
    { id: "img_123", position: 1, caption: "..." },
    { id: "img_456", position: 3, caption: "..." }
  ],
  status: "draft", // draft | queued | published
  createdAt: "2025-10-20T15:30:45Z",
  modifiedAt: "2025-10-20T16:15:22Z",
  size: 15678 // bytes
}
```

**Draft List UI:**

```
┌─────────────────────────────┐
│  Drafts (23)        [+ New] │
│  ┌─────────────────────────┐│
│  │ Sort: [Date ▼] Search: □││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 📄 Complete Guide to... ││
│  │    Oct 20, 2025 • 12 KB ││
│  │    [Open] [Delete]      ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 📄 Tutorial: Building...││
│  │    Oct 19, 2025 • 8 KB  ││
│  │    [Open] [Delete]      ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 📄 Product Review: ...  ││
│  │    Oct 18, 2025 • 15 KB ││
│  │    [Open] [Delete]      ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

**Features:**
- **Sorting:** Name, Date Modified (newest first), Date Created, Size
- **Search:** Filter by title, author, tags
- **Actions:**
  - **Open:** Load draft into editor
  - **Delete:** Remove draft (with confirmation)
  - **Duplicate:** Create copy with "(Copy)" suffix
  - **Export:** Export single draft to JSON/HTML

**Data Persistence:**
- All drafts stored in browser IndexedDB
- Optional: Sync to server every 5 minutes
- Export all drafts to JSON for backup

---

### 7. Publish Queue & Scheduler

**Queue System:**

```
┌─────────────────────────────┐
│  Publish Queue (3/10)       │
│  ┌─────────────────────────┐│
│  │ 1. ☰ Complete Guide to..││
│  │    📅 Oct 21, 9:00 AM   ││
│  │    [Edit] [Remove]      ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 2. ☰ Tutorial: Build... ││
│  │    📅 Oct 22, 2:00 PM   ││
│  │    [Edit] [Remove]      ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 3. ☰ Product Review:... ││
│  │    📅 Oct 23, 10:00 AM  ││
│  │    [Edit] [Remove]      ││
│  └─────────────────────────┘│
│  [+ Add to Queue]           │
└─────────────────────────────┘
```

**Features:**

#### A. Add to Queue
1. Click "Add to Queue" in top menu
2. Modal appears:
   ```
   ┌─────────────────────────────┐
   │  Schedule Publication       │
   │  ──────────────────────────│
   │  Article: [Current Title]   │
   │                             │
   │  Publish Date:              │
   │  [Oct 21, 2025     ▼]      │
   │                             │
   │  Publish Time:              │
   │  [09:00 AM         ▼]      │
   │                             │
   │  [Cancel]      [Add Queue] │
   └─────────────────────────────┘
   ```
3. Validates article (warns if incomplete)
4. Adds to queue with scheduled time

#### B. Queue Management
- **Reorder:** Drag ☰ icon to reorder
- **Edit:** Opens article in editor
- **Remove:** Removes from queue (doesn't delete draft)
- **Capacity:** Max 10 articles
- **Overflow:** If queue full, prompt to publish one first

#### C. Auto-Publish
- Background worker checks every minute
- If scheduled time reached → publish automatically
- On success: Move to "Published" archive
- On failure: Keep in queue, notify user

**Scheduler Modal:**
- Date picker with calendar UI
- Time picker with 15-minute intervals
- Timezone selection (defaults to user's timezone)
- Preview: "Will publish in 2 days, 5 hours"

---

### 8. Smart Preview with Placeholders

**Preview Rendering:**

```html
<article class="preview-article">
  <header>
    <h1>{title}</h1>
    <p class="subtitle">{subtitle}</p>
    <div class="meta">
      <span class="author">By {author}</span>
      <span class="date">{date}</span>
    </div>
  </header>
  
  <div class="article-body">
    <p>{excerpt}</p>
    
    <!-- Image Placeholder Example -->
    <figure class="article-image placeholder" data-position="1">
      <div class="image-box" onclick="openImageGallery(1)">
        <span class="placeholder-icon">📷</span>
        <span>Click to select image</span>
      </div>
      <figcaption>
        <input type="text" placeholder="Enter caption..." />
      </figcaption>
    </figure>
    
    <!-- Content wraps around image -->
    <p>{content continues around image...}</p>
    
    <!-- Another image -->
    <figure class="article-image" data-position="2">
      <img src="/uploads/images/selected-photo.jpg" alt="...">
      <figcaption>
        <input type="text" value="User-entered caption" />
      </figcaption>
    </figure>
    
    <h2>{subheading}</h2>
    <p>{more content...}</p>
  </div>
</article>
```

**Preview Features:**

#### A. Image Placeholders
- **Empty state:** Gray box with camera icon
- **Hover:** "Click to select image"
- **Click:** Opens image gallery modal
- **Selected:** Shows actual image
- **Caption:** Editable text field below image

#### B. Text Wrapping
- CSS `float: left` or `float: right` on images
- Text flows around images naturally
- Responsive: Images stack on mobile

#### C. Live Updates
- Preview updates as user types (debounced 500ms)
- Image captions update in real-time
- Metadata changes reflected instantly

#### D. Formatting
- Matches final published article styling
- Shows actual fonts, colors, spacing
- Responsive preview (toggle mobile/tablet/desktop)

**Preview Controls:**
```
[Desktop 💻] [Tablet 📱] [Mobile 📱]  [Toggle Edit Mode]
```

---

### 9. Publication Validation

**Validation Rules:**

#### Complete Article Checks
- ✅ Title filled
- ✅ Excerpt filled
- ✅ At least 100 words of content
- ✅ At least one paragraph
- ⚠️ Author filled (warning, not required)
- ⚠️ Category filled (warning)
- ⚠️ Tags added (warning)
- ⚠️ All image placeholders filled (warning)
- ⚠️ All images have captions (warning)

#### Validation Flow

**When user clicks "Publish Now" or "Add to Queue":**

```javascript
function validateArticle(article) {
  const errors = [];
  const warnings = [];
  
  // Required checks
  if (!article.title) errors.push("Title is required");
  if (!article.excerpt) errors.push("Excerpt is required");
  if (wordCount(article.content) < 100) errors.push("Content too short (minimum 100 words)");
  
  // Warning checks
  if (!article.author) warnings.push("Author not set");
  if (!article.category) warnings.push("Category not set");
  if (article.tags.length === 0) warnings.push("No tags added");
  if (hasEmptyImagePlaceholders(article)) warnings.push("Some images not selected");
  if (hasEmptyCaptions(article)) warnings.push("Some image captions missing");
  
  return { errors, warnings };
}
```

**Validation Modal:**

```
┌─────────────────────────────┐
│  ⚠️ Article Incomplete      │
│  ──────────────────────────│
│  Warnings:                  │
│  • Author not set           │
│  • 2 image placeholders     │
│    without images           │
│  • 1 image missing caption  │
│                             │
│  ☑ Don't show this again   │
│                             │
│  [Cancel] [Save Draft]      │
│           [Publish Anyway]  │
└─────────────────────────────┘
```

**User Options:**
1. **Cancel:** Go back to editor
2. **Save Draft:** Save to drafts folder
3. **Publish Anyway:** Ignore warnings and publish
4. **Don't show again:** Skip validation next time (stored in settings)

**Error Handling:**
- If errors exist (required fields): Block publish, show error modal
- If only warnings: Allow publish with confirmation
- If complete: Publish immediately (no modal)

---

## Technical Stack

### Frontend
- **Framework:** Vanilla JS or Vue 3 (lightweight)
- **Rich Text:** Tiptap (headless, extensible)
- **Storage:** IndexedDB (via Dexie.js)
- **Styling:** Tailwind CSS or custom CSS
- **Icons:** Heroicons or Lucide

### Backend (Existing)
- **Server:** Express.js (cms/serve.js)
- **Export:** TypeScript export module
- **Storage:** File system + IndexedDB

### Build Tools
- **Bundler:** Vite (fast, modern)
- **TypeScript:** For type safety
- **Testing:** Vitest + Playwright

---

## Implementation Phases

### Phase 1: Core Structure (Week 1)
- [ ] New HTML layout (side panel + top bar)
- [ ] CSS framework setup
- [ ] Routing/state management
- [ ] Basic navigation

### Phase 2: Rich Text Editor (Week 1-2)
- [ ] Tiptap integration
- [ ] Toolbar implementation
- [ ] Image insertion system
- [ ] Auto-formatting

### Phase 3: Image Management (Week 2)
- [ ] Upload interface
- [ ] Gallery modal
- [ ] Image picker
- [ ] Caption system

### Phase 4: Draft System (Week 2-3)
- [ ] IndexedDB setup
- [ ] Draft list UI
- [ ] Sorting/filtering
- [ ] CRUD operations

### Phase 5: Queue & Scheduler (Week 3)
- [ ] Queue UI
- [ ] Scheduler modal
- [ ] Background worker
- [ ] Auto-publish

### Phase 6: Auto-Population (Week 3-4)
- [ ] File import
- [ ] Content extraction
- [ ] Auto-fill logic
- [ ] Preview generation

### Phase 7: Validation & Polish (Week 4)
- [ ] Validation rules
- [ ] Warning modals
- [ ] Testing
- [ ] Documentation

---

## Migration Plan

### Step 1: Backup Current State
```bash
# Export current CMS structure
cp -r editor editor-backup-2025-10-20
```

### Step 2: Create New Branch
```bash
git checkout -b cms-v2-redesign
```

### Step 3: Build New CMS Alongside
```
/editor-v2/
  ├── index.html
  ├── app.js
  ├── components/
  ├── stores/
  └── styles/
```

### Step 4: Test New CMS
- Import test articles
- Test all workflows
- Performance testing

### Step 5: Deploy
- Merge to main
- Update documentation
- Train users (if applicable)

---

## Success Metrics

- ✅ **Usability:** User can publish article in < 5 minutes
- ✅ **Performance:** Load time < 2 seconds
- ✅ **Reliability:** Zero data loss, auto-recovery
- ✅ **Flexibility:** Supports all content types
- ✅ **Intuitive:** No documentation needed for basic tasks

---

**Next Step:** Approve design and begin Phase 1 implementation.

**Estimated Timeline:** 4 weeks (full-time) or 8 weeks (part-time)

**Files to Create:**
1. Design mockups (Figma or similar)
2. Component library
3. New codebase in `editor-v2/`

Would you like me to begin with Phase 1 (Core Structure) or would you prefer to review wireframes/mockups first?
