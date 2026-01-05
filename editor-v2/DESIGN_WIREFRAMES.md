# CMS V2 - Design Wireframes & Visual Specification

**Created:** October 20, 2025  
**Version:** 1.0  
**Status:** Draft - Awaiting Review

---

## 1. Design Overview

### Design Goals
1. **Intuitive Navigation** - Side panel for quick access to drafts, images, queue
2. **Clean & Focused** - Minimal distractions during writing
3. **Professional** - Modern UI comparable to WordPress/Ghost
4. **Efficient** - Reduce clicks to publish from 10+ to <5
5. **Responsive** - Works on desktop (1920px+), laptop (1440px), tablet (768px)

### Visual Principles
- **Hierarchy:** Clear primary/secondary actions
- **Consistency:** Reusable components across all views
- **Feedback:** Visual confirmation for all actions
- **Accessibility:** WCAG 2.1 AA compliant

---

## 2. Layout Structure

### Main Layout (Desktop 1920px)
```
┌────────────────────────────────────────────────────────────┐
│ TOP MENU BAR (60px height)                                 │
│ ┌────────────────┬─────────────────────────────────────┐  │
│ │ 📝 JR CMS      │  💾 Save  🚀 Publish  📅 Queue     │  │
│ │ Current Title  │  👁️ Preview  📦 Export             │  │
│ └────────────────┴─────────────────────────────────────┘  │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│  SIDE    │  MAIN CONTENT AREA                             │
│  PANEL   │  ┌───────────────────────────────────────────┐ │
│  (240px) │  │  Article Title Input                     │ │
│          │  │  Subtitle Input                          │ │
│  ┌─────┐ │  │  Metadata Fields                         │ │
│  │ New │ │  └───────────────────────────────────────────┘ │
│  ├─────┤ │  ┌───────────────────────────────────────────┐ │
│  │📄   │ │  │  RICH TEXT EDITOR                        │ │
│  │Draft│ │  │  ┌─────────────────────────────────────┐ │ │
│  │List │ │  │  │ B I U H1 H2 • 1. " </> 🖼️          │ │ │
│  │     │ │  │  ├─────────────────────────────────────┤ │ │
│  ├─────┤ │  │  │                                     │ │ │
│  │🖼️   │ │  │  │  Write your content here...        │ │ │
│  │Image│ │  │  │                                     │ │ │
│  │     │ │  │  │                                     │ │ │
│  ├─────┤ │  │  │                                     │ │ │
│  │📅   │ │  │  └─────────────────────────────────────┘ │ │
│  │Queue│ │  └───────────────────────────────────────────┘ │
│  │     │ │                                                 │
│  ├─────┤ │  RIGHT SIDE (400px optional preview panel)     │
│  │⚙️   │ │  Can be toggled via Preview button             │
│  │Set  │ │                                                 │
│  └─────┘ │                                                 │
│          │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Desktop Large:** 1920px+ (Full layout with optional preview panel)
- **Desktop:** 1440px-1920px (Full layout, no preview panel)
- **Laptop:** 1280px-1440px (Side panel collapsible to icons only)
- **Tablet:** 768px-1280px (Side panel overlay/drawer)
- **Mobile:** <768px (Not primary target, but functional)

---

## 3. Component Wireframes

### 3.1 Side Panel - Drafts View
```
┌────────────────────┐
│ 📝 Drafts          │ ← Section Header
├────────────────────┤
│ 🔍 Search...       │ ← Search Input
├────────────────────┤
│ Sort: ▼ Recent     │ ← Sort Dropdown
├────────────────────┤
│ ┌────────────────┐ │
│ │ My First Post  │ │ ← Draft Item
│ │ Oct 19, 2025   │ │   (Click to open)
│ │ 1,234 words    │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ AI Development │ │
│ │ Oct 18, 2025   │ │
│ │ 892 words      │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ + New Draft    │ │ ← Create New
│ └────────────────┘ │
└────────────────────┘
```

### 3.2 Side Panel - Images View
```
┌────────────────────┐
│ 🖼️ Images          │
├────────────────────┤
│ 🔍 Search...       │
├────────────────────┤
│ ┌───┬───┬───┐     │ ← Image Grid
│ │📷│📷│📷│     │   (Thumbnails)
│ ├───┼───┼───┤     │
│ │📷│📷│📷│     │
│ ├───┼───┼───┤     │
│ │📷│📷│📷│     │
│ └───┴───┴───┘     │
│ ┌────────────────┐ │
│ │ ⬆️ Upload New   │ │ ← Upload Button
│ └────────────────┘ │
└────────────────────┘
```

### 3.3 Side Panel - Queue View
```
┌────────────────────┐
│ 📅 Publish Queue   │
├────────────────────┤
│ Queue (3/10)       │ ← Counter
├────────────────────┤
│ ≡ Drag to reorder  │ ← Help Text
├────────────────────┤
│ ┌────────────────┐ │
│ │ ⠿ Post Title 1 │ │ ← Queued Item
│ │ 📅 Oct 21, 10am│ │   (Draggable)
│ │ [Edit] [×]     │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ ⠿ Post Title 2 │ │
│ │ 📅 Oct 22, 2pm │ │
│ │ [Edit] [×]     │ │
│ └────────────────┘ │
│ ┌────────────────┐ │
│ │ ⠿ Post Title 3 │ │
│ │ 📅 Oct 23, 9am │ │
│ │ [Edit] [×]     │ │
│ └────────────────┘ │
└────────────────────┘
```

### 3.4 Top Menu Bar (Detailed)
```
┌──────────────────────────────────────────────────────────┐
│  📝 JR CMS                                    User: JR ▼ │ ← Logo + User Menu
├─────────────────┬────────────────────────────────────────┤
│ Untitled Draft  │  💾 Save Draft                         │ ← Title + Primary Actions
│                 │  🚀 Publish Now                        │
│                 │  📅 Add to Queue                       │
│                 │  👁️ Preview                            │
│                 │  📦 Export                             │
│                 │                           Last saved:  │
│                 │                           2 mins ago   │
└─────────────────┴────────────────────────────────────────┘
```

### 3.5 Rich Text Toolbar
```
┌────────────────────────────────────────────────────────────┐
│ Format: ▼ Paragraph                                        │ ← Style Dropdown
├────────────────────────────────────────────────────────────┤
│  B  I  U  S  │ H1 H2 H3 H4 │ •  1.  ↩️ │ ⬅️ ➡️ ≡ │ 🔗 🖼️ " │ ← Formatting
│                                                            │   Buttons
│  Text   Highlight   │  ↶  ↷  │  </> View Source          │ ← Colors + Undo
└────────────────────────────────────────────────────────────┘
```

---

## 4. Modal Dialogs

### 4.1 Image Gallery Modal
```
┌────────────────────────────────────────────────────────────┐
│ Select Image                                          [×]  │
├────────────────────────────────────────────────────────────┤
│ 🔍 Search images...                    Sort: ▼ Recent      │
├────────────────────────────────────────────────────────────┤
│ ┌─────┬─────┬─────┬─────┬─────┬─────┐                     │
│ │     │     │     │     │     │     │ ← Grid of Images    │
│ │ 📷  │ 📷  │ 📷  │ 📷  │ 📷  │ 📷  │   (Click to select)  │
│ │     │     │     │     │     │     │   (Hover shows      │
│ ├─────┼─────┼─────┼─────┼─────┼─────┤    filename)        │
│ │     │     │     │     │     │     │                     │
│ │ 📷  │ 📷  │ 📷  │ 📷  │ 📷  │ 📷  │                     │
│ │     │     │     │     │     │     │                     │
│ ├─────┼─────┼─────┼─────┼─────┼─────┤                     │
│ │     │     │     │     │     │     │                     │
│ │ 📷  │ 📷  │ 📷  │ 📷  │ 📷  │ 📷  │                     │
│ │     │     │     │     │     │     │                     │
│ └─────┴─────┴─────┴─────┴─────┴─────┘                     │
├────────────────────────────────────────────────────────────┤
│                      ⬆️ Upload New Image                   │
│              [Cancel]              [Insert Selected]       │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Schedule Publish Modal
```
┌────────────────────────────────────────────────────────────┐
│ Schedule Publication                                  [×]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Article: "My Amazing Post"                                │
│                                                            │
│  📅 Publish Date:                                          │
│  ┌──────────────────────────┐                             │
│  │ October 21, 2025        ▼│ ← Date Picker               │
│  └──────────────────────────┘                             │
│                                                            │
│  🕐 Publish Time:                                          │
│  ┌────────┐  :  ┌────────┐   ┌─────┐                     │
│  │  10   ▼│     │  00   ▼│   │ AM ▼│ ← Time Picker       │
│  └────────┘     └────────┘   └─────┘                     │
│                                                            │
│  🌍 Timezone:                                              │
│  ┌──────────────────────────┐                             │
│  │ PST (UTC-8)             ▼│ ← Timezone Select           │
│  └──────────────────────────┘                             │
│                                                            │
│  ⚠️ Queue is currently 8/10. Adding this will use slot 9. │
│                                                            │
│              [Cancel]              [Add to Queue]          │
└────────────────────────────────────────────────────────────┘
```

### 4.3 Publish Validation Modal
```
┌────────────────────────────────────────────────────────────┐
│ ⚠️ Incomplete Article Detected                        [×]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  The following issues were found:                          │
│                                                            │
│  ❌ Required (Cannot publish):                             │
│     • Title is empty                                       │
│     • Article has less than 100 words (currently 47)       │
│                                                            │
│  ⚠️ Warnings (Can publish anyway):                         │
│     • No author specified                                  │
│     • Missing category                                     │
│     • 2 image placeholders are still empty                 │
│     • No excerpt provided                                  │
│                                                            │
│  What would you like to do?                                │
│                                                            │
│  [Cancel]    [Save as Draft]    [Fix Issues]               │
│                                                            │
│  ☐ Don't show warnings again (only block for required)     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 4.4 Auto-Population Progress Modal
```
┌────────────────────────────────────────────────────────────┐
│ Importing Content...                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📄 Processing: article-draft.pdf                          │
│                                                            │
│  ✅ Extracting text content...          [████████░░] 80%  │
│  ✅ Parsing metadata...                 [██████████] 100% │
│  ⏳ Extracting images...                [████░░░░░░] 40%  │
│  ⏳ Populating fields...                [░░░░░░░░░░] 0%   │
│                                                            │
│  Found:                                                    │
│  • Title: "AI Development Best Practices"                 │
│  • Author: Jeremy Robards                                 │
│  • 3 images                                               │
│  • 1,847 words                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 5. Smart Preview Panel

### Preview with Image Placeholders
```
┌────────────────────────────────────────────────────────────┐
│ PREVIEW                                               [×]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  AI Development Best Practices                             │
│  ════════════════════════════════                          │
│  Subtitle: A comprehensive guide                           │
│                                                            │
│  By Jeremy Robards  •  Oct 20, 2025  •  Technology        │
│                                                            │
│  ┌──────────────────┐                                     │
│  │                  │  Lorem ipsum dolor sit amet,        │
│  │    [📷]          │  consectetur adipiscing elit.       │
│  │                  │  Sed do eiusmod tempor              │
│  │  Click to select │  incididunt ut labore et            │
│  │      image       │  dolore magna aliqua.               │
│  │                  │                                     │
│  │  [Caption here]  │  Ut enim ad minim veniam,          │
│  └──────────────────┘  quis nostrud exercitation         │
│                        ullamco laboris nisi ut            │
│  Aliquip ex ea commodo consequat. Duis aute irure        │
│  dolor in reprehenderit in voluptate velit esse           │
│  cillum dolore eu fugiat nulla pariatur.                  │
│                                                            │
│                        ┌──────────────────┐               │
│  Excepteur sint        │                  │               │
│  occaecat cupidatat    │    [📷]          │               │
│  non proident, sunt    │                  │               │
│  in culpa qui officia  │  Click to select │               │
│  deserunt mollit anim  │      image       │               │
│  id est laborum.       │                  │               │
│                        │  [Caption here]  │               │
│                        └──────────────────┘               │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  💻 Desktop  │  📱 Tablet  │  📱 Mobile    [Refresh]      │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Color Palette

### Primary Colors
- **Brand Primary:** `#10b981` (Emerald) - Main actions, links
- **Brand Dark:** `#059669` (Emerald 600) - Hover states
- **Brand Light:** `#d1fae5` (Emerald 100) - Backgrounds

### Semantic Colors
- **Success:** `#22c55e` (Green 500) - Publish, save success
- **Warning:** `#f59e0b` (Amber 500) - Validation warnings
- **Error:** `#ef4444` (Red 500) - Errors, required fields
- **Info:** `#3b82f6` (Blue 500) - Informational messages

### Neutral Colors
- **Background:** `#ffffff` (White) - Main background
- **Surface:** `#f9fafb` (Gray 50) - Panels, cards
- **Border:** `#e5e7eb` (Gray 200) - Dividers, borders
- **Text Primary:** `#111827` (Gray 900) - Headings, body
- **Text Secondary:** `#6b7280` (Gray 500) - Metadata, labels
- **Text Disabled:** `#9ca3af` (Gray 400) - Disabled states

### Dark Theme (Optional Future Phase)
- **Background:** `#0f172a` (Slate 900)
- **Surface:** `#1e293b` (Slate 800)
- **Border:** `#334155` (Slate 700)
- **Text Primary:** `#f1f5f9` (Slate 100)
- **Text Secondary:** `#94a3b8` (Slate 400)

---

## 7. Typography

### Font Families
- **Headings:** `'Inter', 'Segoe UI', system-ui, sans-serif`
- **Body Text:** `'Inter', 'Segoe UI', system-ui, sans-serif`
- **Monospace:** `'Fira Code', 'Consolas', monospace`

### Font Sizes (Desktop)
- **H1:** 32px / 2rem (Article titles in editor)
- **H2:** 24px / 1.5rem (Section headings)
- **H3:** 20px / 1.25rem (Subsections)
- **H4:** 18px / 1.125rem (Minor headings)
- **Body:** 16px / 1rem (Default text)
- **Small:** 14px / 0.875rem (Metadata, labels)
- **Tiny:** 12px / 0.75rem (Timestamps, counts)

### Font Weights
- **Regular:** 400 (Body text)
- **Medium:** 500 (Labels, metadata)
- **Semibold:** 600 (Buttons, links)
- **Bold:** 700 (Headings)

### Line Heights
- **Headings:** 1.2 (Tight for impact)
- **Body:** 1.6 (Comfortable reading)
- **UI Text:** 1.5 (Balanced)

---

## 8. Spacing Scale

Using 8px base unit (0.5rem):

- **XXS:** 4px / 0.25rem - Tight gaps
- **XS:** 8px / 0.5rem - Icon spacing
- **SM:** 12px / 0.75rem - Small padding
- **MD:** 16px / 1rem - Default spacing
- **LG:** 24px / 1.5rem - Section spacing
- **XL:** 32px / 2rem - Large gaps
- **2XL:** 48px / 3rem - Major sections
- **3XL:** 64px / 4rem - Hero spacing

---

## 9. Component States

### Button States
```
┌──────────────┐  ← Default (Primary)
│ Publish Now  │    BG: #10b981, Text: White
└──────────────┘

┌──────────────┐  ← Hover
│ Publish Now  │    BG: #059669, Cursor: pointer
└──────────────┘

┌──────────────┐  ← Active/Pressed
│ Publish Now  │    BG: #047857, Transform: scale(0.98)
└──────────────┘

┌──────────────┐  ← Disabled
│ Publish Now  │    BG: #9ca3af, Cursor: not-allowed
└──────────────┘

┌──────────────┐  ← Loading
│ ⏳ Publishing │    BG: #10b981, Icon spinning
└──────────────┘
```

### Input States
```
┌─────────────────────────┐  ← Default
│ Article Title...        │    Border: #e5e7eb
└─────────────────────────┘

┌─────────────────────────┐  ← Focus
│ Article Title...│       │    Border: #10b981, Shadow
└─────────────────────────┘

┌─────────────────────────┐  ← Error
│ Article Title...        │    Border: #ef4444
└─────────────────────────┘
⚠️ Title is required

┌─────────────────────────┐  ← Disabled
│ Article Title...        │    BG: #f9fafb, Cursor: not-allowed
└─────────────────────────┘
```

---

## 10. Iconography

### Icon System
- **Library:** Heroicons (MIT license) or Lucide Icons
- **Size:** 20px default (1.25rem), 16px small, 24px large
- **Stroke:** 2px weight for consistency
- **Style:** Outline for most, Solid for active states

### Key Icons Needed
- **💾 Save:** Floppy disk or cloud upload
- **🚀 Publish:** Rocket or send arrow
- **📅 Queue:** Calendar with clock
- **👁️ Preview:** Eye
- **📦 Export:** Download or box
- **📝 Draft:** Document or pencil
- **🖼️ Image:** Photo or image frame
- **⚙️ Settings:** Gear or sliders
- **🔍 Search:** Magnifying glass
- **✓ Success:** Checkmark circle
- **⚠️ Warning:** Alert triangle
- **❌ Error:** X circle
- **📤 Upload:** Arrow up or cloud up

---

## 11. Animation & Transitions

### Timing Functions
- **Fast:** 150ms - Hover effects, focus states
- **Medium:** 250ms - Modal open/close, panel slide
- **Slow:** 400ms - Page transitions, complex animations
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` - Natural motion

### Key Animations
```css
/* Modal Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Panel Slide In */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Button Ripple */
@keyframes ripple {
  from { transform: scale(0); opacity: 0.5; }
  to { transform: scale(4); opacity: 0; }
}

/* Toast Notification */
@keyframes toast {
  0% { transform: translateY(-100%); opacity: 0; }
  10% { transform: translateY(0); opacity: 1; }
  90% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-100%); opacity: 0; }
}
```

---

## 12. Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI components
- **Focus Indicators:** Visible 2px outline on all interactive elements
- **Keyboard Navigation:** Full support, logical tab order
- **ARIA Labels:** Descriptive labels for all actions
- **Alt Text:** All images require alt text
- **Screen Reader:** Semantic HTML, proper landmarks

### Keyboard Shortcuts
- **Ctrl/Cmd + S:** Save draft
- **Ctrl/Cmd + Enter:** Publish now
- **Ctrl/Cmd + K:** Open image picker
- **Ctrl/Cmd + /:** Toggle preview
- **Esc:** Close modal/panel

---

## 13. Responsive Behavior

### Desktop (1920px+)
- Full layout with optional side-by-side preview
- Side panel 240px fixed
- Main editor flexible width
- Preview panel 400px (toggleable)

### Laptop (1440px-1920px)
- Full layout without preview panel
- Preview opens as overlay/modal instead
- Side panel 240px fixed
- Main editor takes remaining width

### Tablet (768px-1280px)
- Side panel collapses to hamburger menu
- Opens as drawer overlay from left
- Main editor full width
- Top bar actions may wrap or go into overflow menu

### Mobile (<768px)
- Functional but not primary target
- Hamburger menu for navigation
- Single column layout
- Simplified toolbar (fewer visible buttons)
- Touch-friendly hit areas (44px minimum)

---

## 14. User Flows

### Flow 1: Create New Article
```
1. Click "New Draft" in side panel
   ↓
2. Main editor opens with blank template
   ↓
3. Fill in title (required)
   ↓
4. Add content in rich text editor
   ↓
5. Click image placeholder → Gallery opens
   ↓
6. Select image OR upload new
   ↓
7. Add caption to image
   ↓
8. Click "Save Draft" (manual save)
   ↓
9. Draft appears in side panel list
```

### Flow 2: Import & Auto-Populate
```
1. Click "New Draft" in side panel
   ↓
2. Drag PDF file onto editor OR click import button
   ↓
3. Progress modal shows extraction status
   ↓
4. System extracts: title, author, content, images
   ↓
5. Fields auto-populate with extracted data
   ↓
6. User reviews and edits as needed
   ↓
7. Click "Save Draft"
```

### Flow 3: Schedule Publication
```
1. Open draft from side panel
   ↓
2. Review content in editor
   ↓
3. Click "Add to Queue" in top bar
   ↓
4. Schedule modal opens
   ↓
5. Select date, time, timezone
   ↓
6. Modal shows queue count (e.g., "8/10 slots used")
   ↓
7. Confirm → Article added to queue
   ↓
8. Queue panel shows scheduled item
   ↓
9. Background worker auto-publishes at scheduled time
```

### Flow 4: Publish Validation
```
1. Click "Publish Now" on incomplete article
   ↓
2. System checks required fields
   ↓
3. Validation modal appears with issues list
   ↓
4. RED ❌ for required (title, 100 words)
   YELLOW ⚠️ for warnings (author, category, images)
   ↓
5. Options: Cancel, Save as Draft, Fix Issues
   ↓
6. If only warnings, can "Publish Anyway"
   ↓
7. Required issues block publish completely
```

---

## 15. Design Review Checklist

### Visual Design
- [ ] Color palette is consistent and accessible
- [ ] Typography is readable and hierarchical
- [ ] Spacing follows 8px grid system
- [ ] Icons are consistent style and size
- [ ] Buttons have clear hover/active states

### Layout & Structure
- [ ] Side panel is intuitive and organized
- [ ] Top menu bar actions are prioritized correctly
- [ ] Main editor has enough focus/breathing room
- [ ] Modals are centered and appropriately sized
- [ ] Responsive breakpoints work smoothly

### User Experience
- [ ] Navigation is logical and discoverable
- [ ] Primary actions (Save, Publish) are prominent
- [ ] Feedback is immediate for all actions
- [ ] Error messages are helpful and actionable
- [ ] Loading states are clear

### Functionality
- [ ] All wireframes match specification requirements
- [ ] User flows cover all major features
- [ ] Edge cases are considered (empty states, errors)
- [ ] Keyboard navigation is complete
- [ ] Screen reader experience is usable

### Accessibility
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible
- [ ] ARIA labels are descriptive
- [ ] Keyboard shortcuts are documented
- [ ] Touch targets are 44px minimum

---

## 16. Next Steps

### Phase 1: Review & Feedback (Current)
1. **Review wireframes** - Check all layouts and flows
2. **Identify issues** - Flag any confusing or missing elements
3. **Request changes** - Specify what needs adjustment
4. **Approve design** - Give green light to proceed

### Phase 2: High-Fidelity Mockups (Next)
1. Create pixel-perfect mockups in Figma/Sketch
2. Apply actual color palette and typography
3. Design component library (buttons, inputs, cards)
4. Create interactive prototype with transitions
5. Review and iterate

### Phase 3: Design Handoff (Before Development)
1. Export all assets (icons, images, logos)
2. Document component specs (sizes, spacing, colors)
3. Create CSS variables from design tokens
4. Prepare Figma file for developer inspection
5. Conduct design walkthrough session

---

## 17. Open Questions for Review

### Layout Questions
1. **Side panel width:** Is 240px appropriate, or should it be wider/narrower?
2. **Top bar height:** Is 60px comfortable, or too tall/short?
3. **Preview panel:** Should it be side-by-side or always overlay/modal?
4. **Editor max-width:** Should content have a max-width for readability?

### Functionality Questions
5. **Manual save only:** Confirmed no auto-save at all, correct?
6. **Draft sorting:** Should default be Recent (date) or Name (alphabetical)?
7. **Image placeholders:** Should they be inserted manually or auto-generated?
8. **Queue limit:** Is 10 articles sufficient, or should it be higher?

### Visual Questions
9. **Color scheme:** Happy with emerald green as primary, or different color?
10. **Dark theme:** Should we design dark theme now or Phase 2?
11. **Animations:** How prominent should transitions be (subtle vs. prominent)?
12. **Icons:** Heroicons or Lucide, or different library?

### Technical Questions
13. **Framework:** Still planning Vanilla JS or Vue 3?
14. **Rich text editor:** Tiptap confirmed, or open to TinyMCE/Quill?
15. **Bundler:** Vite confirmed, or prefer different tool?

---

## Approval & Sign-Off

**Reviewer:** [Your Name]  
**Date Reviewed:** _______________  
**Status:** ⬜ Approved  ⬜ Needs Changes  

**Changes Requested:**
- 
- 
- 

**Approval Signature:** _______________

---

**End of Wireframes Document**  
**Next Document:** HIGH_FIDELITY_MOCKUPS.md (After approval)
