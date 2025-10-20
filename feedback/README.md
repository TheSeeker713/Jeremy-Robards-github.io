# Feedback System

This directory stores UX feedback collected via the in-app feedback drawer.

## Directory Structure

```
feedback/
├── local/              # Feedback JSON files
│   ├── feedback-2025-10-20T10-30-00-000Z.json
│   ├── feedback-2025-10-20T14-15-22-123Z.json
│   └── screenshots/    # Extracted screenshot images
│       ├── 2025-10-20T10-30-00-000Z.png
│       └── 2025-10-20T14-15-22-123Z.png
└── README.md          # This file
```

## Feedback Format

Each feedback file contains:

```json
{
  "timestamp": "2025-10-20T10:30:00.000Z",
  "type": "confusion",
  "priority": "p1",
  "comment": "The export button label is unclear...",
  "screenshot": "data:image/png;base64,...",
  "appState": {
    "metadata": { ... },
    "blockCount": 5,
    "hasExported": true,
    "hasPublished": false,
    "validationStatus": "valid"
  },
  "url": "http://localhost:5173/",
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "userAgent": "Mozilla/5.0..."
}
```

## Feedback Types

- **🐛 Bug / Issue** - Functional problems or errors
- **❓ Confusing / Unclear** - UX clarity issues
- **💡 Suggestion** - Enhancement ideas
- **♿ Accessibility** - A11y barriers or improvements
- **💬 Other** - General feedback

## Priority Levels

- **P0 - Critical** 🔴 - Blocks core functionality, immediate action required
- **P1 - High** 🟠 - Major usability issue, address in next sprint
- **P2 - Medium** 🟡 - Minor issue or enhancement, add to backlog

## Collecting Feedback

### In Editor
1. Click the 💬 feedback button (or press `Ctrl+F`)
2. Select type and priority
3. Write detailed description
4. Click "Submit Feedback"
5. Screenshot auto-captured and saved

### Via API
```bash
curl -X POST http://localhost:5173/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-10-20T10:30:00.000Z",
    "type": "bug",
    "priority": "p1",
    "comment": "Issue description...",
    "screenshot": "data:image/png;base64,...",
    "appState": {},
    "url": "http://localhost:5173/",
    "viewport": { "width": 1920, "height": 1080 },
    "userAgent": "Mozilla/5.0..."
  }'
```

## Generating Reports

Generate a markdown report with all feedback:

```bash
npm run ux:report
```

Output: `reports/ux-findings.md`

The report includes:
- Summary table by priority
- Detailed findings with screenshots
- Recommendations by priority
- Context and metadata for each issue

## Best Practices

1. **Be Specific** - Describe what you expected vs. what happened
2. **Include Steps** - How to reproduce the issue
3. **Choose Correct Priority**:
   - P0 = Can't complete task
   - P1 = Task is difficult or confusing
   - P2 = Task works but could be better
4. **Review Screenshots** - Ensure sensitive data isn't captured

## Privacy

⚠️ **Warning:** Screenshots may contain sensitive metadata or content.

- Store feedback locally only (`feedback/local/`)
- Do NOT commit screenshots to git (added to `.gitignore`)
- Review feedback before sharing externally
- Clear old feedback periodically

## Git Ignore

The `.gitignore` includes:

```
feedback/local/*.json
feedback/local/screenshots/*.png
```

## Maintenance

**Clear old feedback:**
```bash
# Windows
del feedback\local\*.json
del feedback\local\screenshots\*.png

# Unix/Mac
rm feedback/local/*.json
rm feedback/local/screenshots/*.png
```

**Archive feedback:**
```bash
# Create archive directory
mkdir feedback/archive/2025-10

# Move files
move feedback\local\*.json feedback\archive\2025-10\
```

## Integration

The feedback system integrates with:

- **Editor UI** - Feedback drawer component
- **CMS Server** - `/api/feedback` endpoint
- **Report Generator** - `scripts/generate-ux-report.mjs`
- **Review Tools** - Context capture from app state

## Support

For questions or issues with the feedback system:

1. Check `reports/OPT-STEP-3-SUMMARY.md` for documentation
2. Review `editor/modules/feedbackDrawer.js` source code
3. Test the `/api/feedback` endpoint with curl
4. Run `npm run ux:report` to verify report generation

---

**Last Updated:** October 20, 2025  
**Version:** 1.0.0  
**Part of:** OPT STEP 3 - UI/UX Pass with Human-in-the-Loop
