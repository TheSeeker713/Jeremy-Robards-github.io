# Dogfood Cycle Guide

**Purpose:** Systematic manual testing of the Portfolio Article Studio to catch UX issues, bugs, and usability problems before users encounter them.

**Frequency:** Weekly or before major releases

**Duration:** 30-45 minutes

**Participants:** Product owner, developers, designers, QA

---

## Setup (5 minutes)

### 1. Start the Environment
```bash
# Terminal 1: Start CMS server
npm run cms:dev

# Terminal 2 (optional): Watch tests
npm test -- --watch
```

### 2. Open Editor with Review Tools
```bash
# Open in default browser
start http://localhost:5173/editor/

# Or manually navigate to:
# http://localhost:5173/editor/
```

### 3. Enable Review Mode
- Press `Ctrl+R` or click 🎨 button
- Verify spacing annotations appear
- Check contrast ratios are displayed
- Confirm hit areas highlighted

### 4. Prepare Sample Files
Navigate to `tests/fixtures/` (or create if needed):

```bash
# Create fixtures directory
mkdir -p tests/fixtures
cd tests/fixtures
```

**Sample Files Needed:**
- `sample-article.md` - Markdown with frontmatter
- `sample-article.json` - JSON article format  
- `sample-simple.pdf` - PDF document (optional)
- `large-article.md` - 50+ blocks for performance testing
- `malformed.md` - Missing frontmatter (error testing)

**Quick Sample Generator:**
```bash
# Run this script to generate test fixtures
npm run generate-fixtures
```

---

## Testing Workflow (35 minutes)

### Phase 1: Import Flow (8 minutes)

#### Test 1.1: Drag & Drop Import
**Steps:**
1. Drag `sample-article.md` onto dropzone
2. Observe import progress indicator
3. Check metadata panel auto-fills
4. Verify blocks render correctly

**Expected:**
- ✅ File uploads smoothly
- ✅ Progress indicator visible
- ✅ Metadata extracted correctly
- ✅ Blocks match markdown structure

**Using Review Tools:**
- `Ctrl+U` - Open UX Checklist
- Check "Visibility of system status" ✓
- Check "Error prevention" ✓

**Feedback:**
- `Ctrl+F` - Open feedback drawer if issues found
- Tag: `ux`, Priority: P1/P2

#### Test 1.2: Browse File Import
**Steps:**
1. Click "browse" link
2. Select `sample-article.json`
3. Verify JSON parsing

**Expected:**
- ✅ File picker opens
- ✅ JSON imports without errors
- ✅ Complex metadata preserved

#### Test 1.3: Error Handling
**Steps:**
1. Try importing `malformed.md`
2. Check error message clarity
3. Verify app doesn't crash

**Expected:**
- ✅ Clear error message shown
- ✅ Explains what's wrong
- ✅ Suggests how to fix

**Feedback if issues:**
- `Ctrl+F` - Submit feedback
- Tag: `correctness`, Priority: P1

---

### Phase 2: Editing Experience (10 minutes)

#### Test 2.1: Block Manipulation
**Steps:**
1. Click "+ Paragraph"
2. Type a sentence
3. Click "+ Heading"
4. Change heading level
5. Reorder blocks (drag/drop)
6. Delete a block

**Expected:**
- ✅ Blocks add instantly (<100ms)
- ✅ Typing feels responsive
- ✅ Drag handles visible
- ✅ Reordering works smoothly
- ✅ Delete confirms before removal

**Review Mode Check:**
- `Ctrl+R` - Toggle review mode
- Verify 40px hit areas on all buttons
- Check spacing consistency
- Note any contrast issues

**Accessibility Check:**
- `Ctrl+A` - Run a11y audit
- Review violations in console
- Check WCAG AA compliance

#### Test 2.2: Rich Content
**Steps:**
1. Add image block
2. Paste image URL
3. Add alt text
4. Try code block with syntax
5. Add list (ordered/unordered)
6. Try quote block

**Expected:**
- ✅ Images preview correctly
- ✅ Alt text required (accessibility)
- ✅ Code syntax highlighting works
- ✅ Lists format properly

#### Test 2.3: Keyboard Navigation
**Steps:**
1. Tab through all interactive elements
2. Use Enter/Space to activate buttons
3. Try Escape to close modals
4. Test arrow keys in lists

**Expected:**
- ✅ Focus indicators visible
- ✅ No keyboard traps
- ✅ Logical tab order
- ✅ All controls reachable

**Accessibility:**
- `Ctrl+U` - Check "User control and freedom" ✓
- Verify keyboard shortcuts work

---

### Phase 3: Metadata & Preview (7 minutes)

#### Test 3.1: Metadata Form
**Steps:**
1. Fill out all metadata fields
2. Check slug generation
3. Try adding tags (autocomplete)
4. Add resource links
5. Submit without required fields

**Expected:**
- ✅ Slug auto-generates from title
- ✅ Tag suggestions appear
- ✅ Validation shows missing fields
- ✅ Clear error messages

**UX Checklist:**
- `Ctrl+U` - Check "Recognition rather than recall" ✓
- Verify placeholders helpful

#### Test 3.2: Live Preview
**Steps:**
1. Type in paragraph block
2. Watch preview update
3. Change metadata
4. Observe preview refresh
5. Scroll preview independently

**Expected:**
- ✅ Preview updates <500ms
- ✅ Scroll positions independent
- ✅ Styles match exported articles
- ✅ Images load correctly

**Performance:**
- Open DevTools → Performance
- Record 10 seconds of typing
- Check for long tasks (>50ms)
- Note any jank or lag

**Feedback if slow:**
- `Ctrl+F` - Submit feedback
- Tag: `performance`, Priority: P1
- Include profiler screenshot

---

### Phase 4: Export & Publish (5 minutes)

#### Test 4.1: Export Flow
**Steps:**
1. Click "Export Draft"
2. Observe progress
3. Check dist/ folder
4. Open exported HTML

**Expected:**
- ✅ Export completes <5s
- ✅ HTML file in dist/
- ✅ Valid HTML5
- ✅ Renders correctly

**Verification:**
```bash
# Check exported files
ls -lh dist/

# Validate HTML
npx html-validate dist/*.html

# Check Lighthouse score
npx lighthouse dist/index.html --view
```

#### Test 4.2: Publish to Cloudflare
**Steps:**
1. Click "Publish"
2. Enter Cloudflare token (if prompted)
3. Observe deployment
4. Visit published URL

**Expected:**
- ✅ Deployment succeeds
- ✅ Live URL accessible
- ✅ Content matches preview

**Error Cases:**
- Try without wrangler installed
- Try with invalid token
- Check error messages clear

---

### Phase 5: Review Tools Verification (5 minutes)

#### Test 5.1: Review Mode
**Steps:**
1. `Ctrl+R` - Toggle on
2. Inspect spacing annotations
3. Check contrast warnings
4. Verify hit area highlighting
5. `Ctrl+R` - Toggle off

**Expected:**
- ✅ Overlay appears/disappears
- ✅ Annotations don't break layout
- ✅ Color-coded spacing clear
- ✅ Contrast ratios accurate

#### Test 5.2: Feedback Drawer
**Steps:**
1. `Ctrl+F` - Open drawer
2. Fill out feedback form
3. Capture screenshot
4. Submit feedback
5. Check `/feedback/local/`

**Expected:**
- ✅ Drawer slides in smoothly
- ✅ Screenshot captures correctly
- ✅ JSON file saved locally
- ✅ Drawer closes after submit

#### Test 5.3: UX Checklist
**Steps:**
1. `Ctrl+U` - Open checklist
2. Mark 3 heuristics as Pass
3. Add notes to one item
4. Export checklist
5. Check localStorage persistence

**Expected:**
- ✅ All 10 heuristics listed
- ✅ Progress indicator updates
- ✅ Notes save correctly
- ✅ Markdown export works

#### Test 5.4: Accessibility Checker
**Steps:**
1. `Ctrl+A` - Run audit
2. Review console output
3. Check violation counts
4. Generate report

**Expected:**
- ✅ Audit completes <3s
- ✅ Violations grouped by impact
- ✅ Actionable descriptions
- ✅ Markdown report generated

---

## Post-Testing (5 minutes)

### 1. Generate Feedback Digest
```bash
npm run feedback:digest
```

**Review:**
- Open `reports/feedback-digest.md`
- Check counts by priority
- Review P0 blockers

### 2. Triage Issues
For each feedback item:
1. Create GitHub issue if needed
2. Add priority label (P0/P1/P2)
3. Add area label (editor/exporter/etc.)
4. Add type label (bug/ux/perf/a11y)
5. Assign to milestone

### 3. Update Test Cases
If new bugs found:
1. Add E2E test to prevent regression
2. Update `tests/e2e/editor.spec.js`
3. Run `npx playwright test` to verify

### 4. Document Findings
Add to `reports/dogfood-YYYY-MM-DD.md`:
```markdown
# Dogfood Session: 2025-10-20

**Participants:** [names]
**Duration:** 45 minutes

## Key Findings
- 🐛 Bug: Export fails with 1000+ blocks
- 🎨 UX: Drag handle too small on mobile
- ⚡ Perf: Preview lags with large images

## Action Items
- [ ] #123 Fix export memory leak (P0)
- [ ] #124 Increase drag handle size (P1)
- [ ] #125 Add image lazy loading (P2)

## Positive Observations
- ✅ Review tools very helpful
- ✅ Import flow smooth
- ✅ Keyboard nav excellent
```

---

## Automated Dogfood Script

Save as `scripts/dogfood-cycle.sh`:

```bash
#!/bin/bash

echo "🐕 Starting Dogfood Cycle..."

# 1. Start CMS server in background
echo "Starting CMS server..."
npm run cms:dev &
CMS_PID=$!

# Wait for server to start
sleep 5

# 2. Open editor with review mode enabled
echo "Opening editor..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "http://localhost:5173/editor/?debug=true"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  start "http://localhost:5173/editor/?debug=true"
else
  xdg-open "http://localhost:5173/editor/?debug=true"
fi

# 3. Run E2E tests in headed mode (visual verification)
echo "Running E2E tests..."
npx playwright test --headed --project=chromium tests/e2e/editor.spec.js

# 4. Generate feedback digest
echo "Generating feedback digest..."
npm run feedback:digest

# 5. Open reports
echo "Opening reports..."
code reports/feedback-digest.md

# 6. Cleanup
echo "Press Enter to stop server..."
read
kill $CMS_PID

echo "✅ Dogfood cycle complete!"
```

Make executable:
```bash
chmod +x scripts/dogfood-cycle.sh
```

Run:
```bash
npm run dogfood
```

---

## Tips for Effective Dogfooding

### Before Session
- ✅ Clear browser cache and localStorage
- ✅ Test with realistic data (not "test test")
- ✅ Use actual device/screen you target (mobile, tablet)
- ✅ Throttle network to Fast 3G in DevTools

### During Session
- ✅ Think aloud - verbalize confusion
- ✅ Use review tools liberally
- ✅ Screenshot everything (Ctrl+F)
- ✅ Don't skip error cases

### After Session
- ✅ Triage within 24 hours
- ✅ Create issues for all P0/P1 findings
- ✅ Schedule fixes before next release

### Common Pitfalls
- ❌ Testing too fast (slow down, observe)
- ❌ Skipping keyboard testing
- ❌ Not testing responsive views
- ❌ Ignoring accessibility audit

---

## Success Metrics

**Good Dogfood Session:**
- 5-10 feedback items submitted
- 2-3 bugs found
- 1-2 UX improvements identified
- 0 P0 blockers (ideally)

**Red Flags:**
- 🚨 3+ P0 blockers found
- 🚨 App crashes frequently
- 🚨 Basic workflows broken
- 🚨 Performance unusable

**Next Steps if Red Flags:**
1. Stop feature development
2. Fix P0 blockers immediately
3. Re-run dogfood cycle
4. Don't release until clean

---

## Schedule

**Recommended Cadence:**

| When | Duration | Focus |
|------|----------|-------|
| Weekly | 30 min | Quick smoke test |
| Before release | 60 min | Full workflow |
| After major feature | 45 min | New feature + regression |
| Monthly | 90 min | Deep dive + edge cases |

**Calendar:**
- Every Monday 10am: Quick dogfood (30min)
- Last Friday of month: Extended session (90min)
- Before deploy: Mandatory full cycle (60min)

---

## Questions During Dogfood?

**Ask yourself:**
- Is this **intuitive**? Would a new user understand?
- Is this **fast**? Does it feel responsive?
- Is this **accessible**? Can I do it with keyboard?
- Is this **forgiving**? Can I undo mistakes?
- Is this **consistent**? Does it match other parts of the app?

**If the answer is NO, submit feedback!** (`Ctrl+F`)

---

**Remember:** The goal is to find problems **before users do**. Be ruthless, be thorough, and use the review tools!
