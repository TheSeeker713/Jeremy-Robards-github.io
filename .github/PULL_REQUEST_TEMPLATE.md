# Pull Request Checklist

## Description
<!-- Provide a brief description of the changes in this PR -->

**Related Issue:** #<!-- issue number -->

## Type of Change
<!-- Check all that apply -->
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ⚡ Performance improvement
- [ ] ♿ Accessibility improvement
- [ ] 🔒 Security fix
- [ ] 🧹 Code refactoring
- [ ] ✅ Test addition/update

## Testing Checklist
<!-- All items must be checked before merging -->
- [ ] **Tests added/updated** - New code has corresponding tests
- [ ] **All tests pass** - Ran `npm test` successfully
- [ ] **E2E tests pass** - Ran `npx playwright test` (if UI changes)
- [ ] **Manual testing** - Tested changes in browser/editor
- [ ] **Edge cases covered** - Tested error states, empty states, boundary conditions

## Documentation Checklist
<!-- Check all that apply -->
- [ ] **Code comments** - Complex logic has explanatory comments
- [ ] **README updated** - Updated relevant README.md files
- [ ] **API docs updated** - Updated JSDoc/TypeDoc comments
- [ ] **User guide updated** - Updated user-facing documentation (if applicable)
- [ ] **CHANGELOG updated** - Added entry to CHANGELOG.md (if using semantic versioning)

## UI/UX Changes (if applicable)
<!-- For any visual changes, provide before/after screenshots -->
- [ ] **Screenshots attached** - Before/after screenshots included below
- [ ] **Responsive tested** - Tested on mobile, tablet, desktop
- [ ] **Accessibility tested** - Keyboard navigation, screen reader, ARIA labels
- [ ] **Dark mode tested** - Verified in both light and dark themes (if applicable)
- [ ] **Cross-browser tested** - Checked in Chrome, Firefox, Safari

### Screenshots
<!-- Drag and drop images here -->
**Before:**
<!-- Screenshot of current state -->

**After:**
<!-- Screenshot of new changes -->

**Mobile View (if applicable):**
<!-- Screenshot on mobile device -->

## Performance Impact
<!-- Check all that apply -->
- [ ] **Lighthouse diff posted** - Performance comparison before/after (see below)
- [ ] **No bundle size increase** - Checked with `npm run build`
- [ ] **No new dependencies** - Or justified new dependencies
- [ ] **Performance profiled** - Used Chrome DevTools profiler (if performance-critical)

### Lighthouse Scores (if UI changes)
<!-- Run Lighthouse on changed pages and paste scores -->
```
Before:
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100

After:
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100
```

### Bundle Size (if applicable)
<!-- Run build and compare sizes -->
```
Before: XXX KB
After:  XXX KB
Diff:   +/- XX KB
```

## Code Quality
<!-- All items should be checked -->
- [ ] **No console.log** - Removed debug console statements
- [ ] **No commented code** - Removed unused code blocks
- [ ] **Linter passing** - Ran `npm run lint`
- [ ] **Formatter applied** - Ran `npm run format` (Prettier)
- [ ] **No merge conflicts** - Resolved all conflicts with main branch
- [ ] **Commit messages clear** - Descriptive commit messages following conventions

## Security Considerations
<!-- Check if you've considered security implications -->
- [ ] **Input validation** - User inputs are validated/sanitized
- [ ] **XSS prevention** - No unescaped user content rendered
- [ ] **CSRF protection** - State-changing requests have CSRF protection (if applicable)
- [ ] **No secrets** - No API keys, tokens, or credentials in code
- [ ] **Dependencies audited** - Ran `npm audit` and addressed issues

## Accessibility (WCAG AA)
<!-- Check if applicable -->
- [ ] **Keyboard navigation** - All interactive elements reachable via Tab
- [ ] **Focus indicators** - Visible focus states on all controls
- [ ] **ARIA labels** - Screen reader labels on buttons, forms, landmarks
- [ ] **Color contrast** - Text meets 4.5:1 contrast ratio (normal), 3:1 (large)
- [ ] **Alt text** - Images have descriptive alt attributes
- [ ] **Semantic HTML** - Used proper heading hierarchy, landmarks

## Review Tools (if OPT STEP 3 implemented)
<!-- Did you use the review tools during development? -->
- [ ] **Review Mode** - Used spacing/contrast/hit-area annotations (Ctrl+R)
- [ ] **A11y Checker** - Ran accessibility audit (Ctrl+A)
- [ ] **UX Checklist** - Reviewed Nielsen's heuristics (Ctrl+U)
- [ ] **Feedback submitted** - Used feedback drawer for notes (Ctrl+F)

## Deployment Checklist
<!-- For changes affecting production -->
- [ ] **Wrangler publish tested** - Tested `npm run publish` locally
- [ ] **Environment variables** - Updated `.env.example` if new vars added
- [ ] **Database migrations** - Included migration scripts (if applicable)
- [ ] **Rollback plan** - Documented how to revert changes if needed

## Additional Notes
<!-- Any extra context, concerns, or discussion points -->

---

## Reviewer Checklist
<!-- For reviewers - do not check as PR author -->
- [ ] Code follows project style guidelines
- [ ] Changes are well-documented
- [ ] No unnecessary complexity
- [ ] Edge cases handled properly
- [ ] Performance impact acceptable
- [ ] Security implications considered
- [ ] Accessibility requirements met

---

**Merge Strategy:**
- [ ] Squash and merge (clean history)
- [ ] Rebase and merge (preserve commits)
- [ ] Merge commit (feature branch)

/cc @<!-- mention relevant team members -->
