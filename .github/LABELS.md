# GitHub Labels Configuration

This file documents the label taxonomy for issue triage and project management.

## Priority Labels

### 🔴 P0 - Blocker
**Color:** `#d73a4a` (red)  
**Description:** Critical issue blocking core functionality. Drop everything.  
**SLA:** Fix within 24 hours  
**Examples:**
- App crashes on load
- Cannot publish articles
- Data loss or corruption
- Security vulnerability (critical)

### 🟠 P1 - High Priority
**Color:** `#ff9800` (orange)  
**Description:** Major feature broken or significant UX degradation.  
**SLA:** Fix within 1 week  
**Examples:**
- Editor sluggish (3s+ lag)
- Import fails for common file types
- Missing accessibility features (WCAG violations)
- Broken keyboard shortcuts

### 🟡 P2 - Medium Priority
**Color:** `#ffeb3b` (yellow)  
**Description:** Minor issue or feature with acceptable workaround.  
**SLA:** Fix within 1 month  
**Examples:**
- Visual polish issues
- Edge case bugs
- Missing convenience features
- Performance optimizations

### ⚪ P3 - Low Priority
**Color:** `#e0e0e0` (grey)  
**Description:** Nice-to-have improvements, future enhancements.  
**SLA:** Backlog, no deadline  
**Examples:**
- Feature requests
- Tech debt cleanup
- Documentation improvements
- Minor refactoring

---

## Area Labels

### 📝 area: editor
**Color:** `#0075ca` (blue)  
**Description:** Issues related to the article editor UI

### 📤 area: exporter
**Color:** `#1d76db` (blue)  
**Description:** HTML export, feed generation, build process

### 🚀 area: publisher
**Color:** `#5319e7` (purple)  
**Description:** Cloudflare Pages deployment, wrangler integration

### ⚙️ area: worker
**Color:** `#7057ff` (purple)  
**Description:** Cloudflare Workers, edge functions, routing

### 🖥️ area: cms-server
**Color:** `#006b75` (teal)  
**Description:** Local CMS dev server, file watching, API

### 🎨 area: review-tools
**Color:** `#d876e3` (pink)  
**Description:** UX review mode, feedback drawer, a11y checker

### 📦 area: build
**Color:** `#0e8a16` (green)  
**Description:** Bundling, dependencies, build pipeline

### 📖 area: docs
**Color:** `#0075ca` (blue)  
**Description:** Documentation, guides, README updates

---

## Type Labels

### 🐛 bug
**Color:** `#d73a4a` (red)  
**Description:** Something isn't working

### ✨ feature
**Color:** `#a2eeef` (cyan)  
**Description:** New feature or request

### 🎨 ux
**Color:** `#e99695` (salmon)  
**Description:** User experience, usability, design

### ⚡ performance
**Color:** `#fbca04` (yellow)  
**Description:** Speed, optimization, bundle size

### ♿ a11y
**Color:** `#7057ff` (purple)  
**Description:** Accessibility (WCAG, ARIA, keyboard nav)

### 🔒 security
**Color:** `#d93f0b` (dark red)  
**Description:** Security vulnerability or hardening

### 📝 correctness
**Color:** `#0e8a16` (green)  
**Description:** Data accuracy, validation, edge cases

### 🧪 testing
**Color:** `#c5def5` (light blue)  
**Description:** Unit tests, E2E tests, test infrastructure

### 🧹 refactor
**Color:** `#fef2c0` (cream)  
**Description:** Code quality, tech debt, cleanup

---

## Status Labels

### 🔍 needs-triage
**Color:** `#ededed` (light grey)  
**Description:** New issue pending initial review and prioritization

### ✅ ready
**Color:** `#0e8a16` (green)  
**Description:** Triaged, prioritized, ready for development

### 🚧 in-progress
**Color:** `#fbca04` (yellow)  
**Description:** Actively being worked on

### 👀 in-review
**Color:** `#d876e3` (pink)  
**Description:** PR open, awaiting code review

### ⏸️ blocked
**Color:** `#d93f0b` (red)  
**Description:** Cannot proceed due to external dependency

### 🤔 needs-info
**Color:** `#d876e3` (pink)  
**Description:** Awaiting more details from reporter

### ✅ resolved
**Color:** `#0e8a16` (green)  
**Description:** Fixed and deployed

### 🚫 wontfix
**Color:** `#ffffff` (white)  
**Description:** Will not be addressed (explain why in comment)

### 🔁 duplicate
**Color:** `#cfd3d7` (grey)  
**Description:** Duplicate of another issue

---

## Special Labels

### 🎯 good-first-issue
**Color:** `#7057ff` (purple)  
**Description:** Good for newcomers, well-defined scope

### 🆘 help-wanted
**Color:** `#008672` (teal)  
**Description:** Extra attention needed, seeking contributors

### ❓ question
**Color:** `#d876e3` (pink)  
**Description:** Further information requested

### 💬 discussion
**Color:** `#cc317c` (magenta)  
**Description:** Needs design discussion or architectural decision

### 🔥 urgent
**Color:** `#d73a4a` (red)  
**Description:** Time-sensitive, needs immediate attention

### 🎉 enhancement
**Color:** `#a2eeef` (cyan)  
**Description:** Improvement to existing feature

---

## Creating Labels in GitHub

Run this script to create all labels:

```bash
#!/bin/bash

# Priority
gh label create "P0" --color "d73a4a" --description "Blocker - critical issue"
gh label create "P1" --color "ff9800" --description "High priority - major issue"
gh label create "P2" --color "ffeb3b" --description "Medium priority - minor issue"
gh label create "P3" --color "e0e0e0" --description "Low priority - nice-to-have"

# Areas
gh label create "area: editor" --color "0075ca" --description "Article editor UI"
gh label create "area: exporter" --color "1d76db" --description "Export and build"
gh label create "area: publisher" --color "5319e7" --description "Cloudflare deployment"
gh label create "area: worker" --color "7057ff" --description "Edge functions"
gh label create "area: cms-server" --color "006b75" --description "Local CMS server"
gh label create "area: review-tools" --color "d876e3" --description "UX review tools"
gh label create "area: build" --color "0e8a16" --description "Build pipeline"
gh label create "area: docs" --color "0075ca" --description "Documentation"

# Types
gh label create "bug" --color "d73a4a" --description "Something isn't working"
gh label create "feature" --color "a2eeef" --description "New feature request"
gh label create "ux" --color "e99695" --description "User experience"
gh label create "performance" --color "fbca04" --description "Performance optimization"
gh label create "a11y" --color "7057ff" --description "Accessibility"
gh label create "security" --color "d93f0b" --description "Security issue"
gh label create "correctness" --color "0e8a16" --description "Data accuracy"
gh label create "testing" --color "c5def5" --description "Tests"
gh label create "refactor" --color "fef2c0" --description "Code quality"

# Status
gh label create "needs-triage" --color "ededed" --description "Pending triage"
gh label create "ready" --color "0e8a16" --description "Ready for development"
gh label create "in-progress" --color "fbca04" --description "Being worked on"
gh label create "in-review" --color "d876e3" --description "PR in review"
gh label create "blocked" --color "d93f0b" --description "Blocked by dependency"
gh label create "needs-info" --color "d876e3" --description "Needs more information"
gh label create "resolved" --color "0e8a16" --description "Fixed and deployed"
gh label create "wontfix" --color "ffffff" --description "Will not fix"
gh label create "duplicate" --color "cfd3d7" --description "Duplicate issue"

# Special
gh label create "good-first-issue" --color "7057ff" --description "Good for newcomers"
gh label create "help-wanted" --color "008672" --description "Help wanted"
gh label create "question" --color "d876e3" --description "Question"
gh label create "discussion" --color "cc317c" --description "Needs discussion"
gh label create "urgent" --color "d73a4a" --description "Urgent"
gh label create "enhancement" --color "a2eeef" --description "Enhancement"
```

Save as `.github/scripts/create-labels.sh` and run:
```bash
chmod +x .github/scripts/create-labels.sh
./.github/scripts/create-labels.sh
```

---

## Label Usage Guidelines

### New Issue Workflow
1. User/reporter creates issue
2. Auto-apply `needs-triage` label
3. Maintainer reviews issue:
   - Add **1 priority** label (P0-P3)
   - Add **1+ area** labels (editor, exporter, etc.)
   - Add **1+ type** labels (bug, ux, perf, etc.)
   - Remove `needs-triage`, add `ready` or `needs-info`

### Issue Lifecycle
```
needs-triage → ready → in-progress → in-review → resolved
                ↓
             needs-info → ready
                ↓
             blocked → ready
                ↓
             wontfix/duplicate (close)
```

### Triage Board (GitHub Projects)
**Columns:**
1. **Inbox** - `needs-triage` issues
2. **Backlog** - `ready` issues sorted by priority
3. **This Sprint** - `in-progress` issues
4. **In Review** - `in-review` PRs
5. **Done** - `resolved` this week

**Filters:**
- P0 Blockers: `is:open label:P0`
- This Week: `is:open label:in-progress`
- Needs Info: `is:open label:needs-info`

---

## Priority Assignment Guide

**Ask these questions:**

1. **Does it break core functionality?** → P0
2. **Is there a reasonable workaround?** → P1 if no, P2 if yes
3. **Is it a future enhancement?** → P2 or P3
4. **Is it a security issue?** → Elevate by one level

**Time-based escalation:**
- P2 open >30 days → Review for P1
- P1 open >14 days → Review for P0
- P0 open >48 hours → Escalate to team lead
