# Human Feedback Loop & Triage System

**OPT STEP 5 Implementation**

This directory contains the human-in-the-loop feedback and triage system for the Portfolio Article Studio.

---

## Quick Start

### Submit Feedback During Development
```bash
# 1. Open editor
npm run cms:dev

# 2. Navigate to http://localhost:5173/editor/

# 3. Use review tools while testing
Ctrl+R  # Review Mode (spacing/contrast)
Ctrl+A  # Accessibility Check
Ctrl+U  # UX Checklist
Ctrl+F  # Feedback Drawer ← Submit feedback here
```

### Generate Feedback Digest
```bash
npm run feedback:digest

# View generated report
cat reports/feedback-digest.md
```

### Run Dogfood Cycle
```bash
# Automated testing workflow
npm run dogfood

# Follow on-screen checklist
# Submit feedback for any issues found (Ctrl+F)
```

---

## System Overview

### 1. Feedback Collection
**Tool:** Feedback Drawer (Ctrl+F in editor)

**Captures:**
- Title and description
- Priority (P0/P1/P2)
- Tags (ux, perf, a11y, correctness, bug, feature, docs, security)
- Screenshot (auto-captured)
- Context (page, viewport, user agent)
- App state (metadata, block count)

**Storage:** `/feedback/local/*.json`

**When to use:**
- During dogfood sessions
- While developing features
- When discovering bugs
- For UX improvement ideas

### 2. Feedback Aggregation
**Script:** `scripts/generate-feedback-digest.mjs`

**Command:** `npm run feedback:digest`

**Output:** `reports/feedback-digest.md`

**Features:**
- Groups by priority (P0/P1/P2/Unassigned)
- Categorizes by tag
- Shows statistics (total, by category, recent 7-day)
- Generates actionable recommendations
- Identifies blocker situations

**When to run:**
- After dogfood sessions
- Daily morning standup
- Before sprint planning
- Weekly triage meetings

### 3. Issue Creation
**Templates:** `.github/ISSUE_TEMPLATE/`

**Available Templates:**
1. **Bug Report** (`bug_report.yml`)
   - Priority, area, repro steps, expected/actual
   - Screenshots, logs, environment

2. **UX Issue** (`ux_issue.yml`)
   - Severity, Nielsen heuristics, user impact
   - Current vs suggested behavior

3. **Performance Issue** (`performance_issue.yml`)
   - Metrics (FCP, LCP, TTI, etc.)
   - Lighthouse reports, profiler data
   - Optimization suggestions

4. **Security Issue** (`security_issue.yml`)
   - Vulnerability category (XSS, injection, etc.)
   - Impact assessment, mitigation

**When to create issues:**
- For all P0 and P1 feedback items
- For recurring P2 items
- For feature requests
- For security concerns

### 4. Label & Triage
**Labels:** `.github/LABELS.md` (36 labels)

**Categories:**
- **Priority:** P0 (blocker), P1 (high), P2 (medium), P3 (low)
- **Area:** editor, exporter, publisher, worker, cms-server, review-tools, build, docs
- **Type:** bug, feature, ux, performance, a11y, security, correctness, testing, refactor
- **Status:** needs-triage, ready, in-progress, in-review, blocked, needs-info, resolved, wontfix, duplicate

**Triage Workflow:**
1. New issue auto-labeled `needs-triage`
2. Review within 24 hours
3. Add priority (P0-P3), area, type labels
4. Move to `ready` (or `needs-info`)
5. Assign to developer
6. Move through workflow (in-progress → in-review → resolved)

**SLAs:**
- P0: Fix within 24 hours
- P1: Start within 48h, fix within 1 week
- P2: Fix within 1 month

### 5. PR Review
**Template:** `.github/PULL_REQUEST_TEMPLATE.md`

**Required Sections:**
- Type of change
- Testing checklist (tests added, E2E pass)
- Documentation updates
- UI/UX changes (screenshots, responsive, a11y)
- **Performance impact (Lighthouse diff)** ← Required
- Code quality (linter, formatter)
- Security considerations
- Accessibility (WCAG AA)
- Review tools usage

**When submitting PRs:**
- Fill out all applicable sections
- Attach Lighthouse before/after
- Include screenshots for UI changes
- Reference feedback items resolved
- Check all testing boxes

### 6. Dogfooding
**Guide:** `docs/DOGFOOD_GUIDE.md`

**Script:** `scripts/dogfood-cycle.mjs`

**Command:** `npm run dogfood`

**Workflow:**
1. Start CMS server
2. Open editor with debug mode
3. Follow 5-phase testing checklist:
   - Phase 1: Import flow (8 min)
   - Phase 2: Editing (10 min)
   - Phase 3: Metadata & preview (7 min)
   - Phase 4: Export & publish (5 min)
   - Phase 5: Review tools (5 min)
4. Submit feedback for all issues (Ctrl+F)
5. Generate digest
6. Triage and create issues

**Frequency:**
- Weekly: 30min quick smoke test
- Before release: 60min full workflow
- After major feature: 45min focused test
- Monthly: 90min deep dive

---

## Example Workflows

### Daily Workflow

**Morning (5 min):**
```bash
# Check overnight feedback
npm run feedback:digest

# Review P0 blockers
cat reports/feedback-digest.md | findstr "Priority 0"

# Triage new items
# Create GitHub issues as needed
```

### Weekly Dogfood (45 min)

**Friday 2pm:**
```bash
# Run full dogfood cycle
npm run dogfood

# Follow checklist in terminal
# Test all 5 phases
# Submit feedback via Ctrl+F

# After testing:
npm run feedback:digest

# Triage findings
# Create issues for P0/P1
# Schedule fixes for next week
```

### Before Release (60 min)

**Release Day - 1:**
```bash
# Full dogfood with edge cases
npm run dogfood

# Run all tests
npm run test:all

# Check E2E coverage
npm run test:e2e

# Generate feedback digest
npm run feedback:digest

# Verify 0 P0 blockers
# Address any P1 items
# Document known P2 issues
```

---

## Integration with Review Tools

The feedback system seamlessly integrates with OPT STEP 3 review tools:

| Review Tool | Keyboard | Purpose | Feeds Into |
|-------------|----------|---------|------------|
| Review Mode | Ctrl+R | Spacing/contrast/hit-areas | UX feedback |
| A11y Checker | Ctrl+A | WCAG violations | A11y feedback |
| UX Checklist | Ctrl+U | Nielsen heuristics | UX feedback |
| **Feedback Drawer** | **Ctrl+F** | **Submit findings** | **Digest** |

**Workflow:**
1. Use Ctrl+R/A/U to **discover** issues
2. Use Ctrl+F to **document** findings
3. Run digest to **aggregate**
4. Create issues to **track**
5. Submit PRs to **fix**
6. Dogfood to **verify**

---

## Related Documentation

- **OPT STEP 3:** Review Tools (`reports/OPT-STEP-3-SUMMARY.md`)
- **OPT STEP 4:** Testing (`reports/OPT-STEP-4-PROGRESS.md`)
- **OPT STEP 5:** Complete Summary (`reports/OPT-STEP-5-SUMMARY.md`)
- **Dogfood Guide:** Testing workflow (`docs/DOGFOOD_GUIDE.md`)
- **Label Guide:** GitHub labels (`.github/LABELS.md`)

---

## Questions?

**Setup:** See `docs/DOGFOOD_GUIDE.md`  
**Triage:** See `.github/LABELS.md`  
**Templates:** See `.github/ISSUE_TEMPLATE/`  
**PR Process:** See `.github/PULL_REQUEST_TEMPLATE.md`

**Quick Help:**
```bash
npm run dogfood        # Start testing session
npm run feedback:digest # Generate report
npm run test:all       # Run all tests
```

---

**Last Updated:** October 20, 2025  
**Version:** 2.0.0  
**Part of:** OPT STEP 5 - Human Feedback Loop & Triage System
