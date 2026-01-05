# CMS V2 - Design System & Style Guide

**Created:** October 20, 2025  
**Version:** 1.0  
**Purpose:** Define reusable design tokens, components, and patterns

---

## Design Tokens

### Colors (CSS Custom Properties)

```css
:root {
  /* Brand Colors */
  --color-brand-primary: #10b981;      /* Emerald 500 */
  --color-brand-primary-hover: #059669; /* Emerald 600 */
  --color-brand-primary-active: #047857; /* Emerald 700 */
  --color-brand-light: #d1fae5;        /* Emerald 100 */
  --color-brand-lighter: #ecfdf5;      /* Emerald 50 */

  /* Semantic Colors */
  --color-success: #22c55e;            /* Green 500 */
  --color-success-light: #dcfce7;      /* Green 100 */
  --color-warning: #f59e0b;            /* Amber 500 */
  --color-warning-light: #fef3c7;      /* Amber 100 */
  --color-error: #ef4444;              /* Red 500 */
  --color-error-light: #fee2e2;        /* Red 100 */
  --color-info: #3b82f6;               /* Blue 500 */
  --color-info-light: #dbeafe;         /* Blue 100 */

  /* Neutral Palette */
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-black: #000000;

  /* Functional Colors */
  --color-background: var(--color-white);
  --color-surface: var(--color-gray-50);
  --color-surface-elevated: var(--color-white);
  --color-border: var(--color-gray-200);
  --color-border-light: var(--color-gray-100);
  --color-divider: var(--color-gray-200);

  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-500);
  --color-text-disabled: var(--color-gray-400);
  --color-text-inverse: var(--color-white);

  /* Overlay */
  --color-overlay: rgba(0, 0, 0, 0.5);
  --color-overlay-light: rgba(0, 0, 0, 0.25);
}
```

### Typography

```css
:root {
  /* Font Families */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                         'Helvetica Neue', Arial, sans-serif;
  --font-family-mono: 'Fira Code', 'Consolas', 'Monaco', monospace;

  /* Font Sizes */
  --font-size-2xs: 0.625rem;   /* 10px */
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2rem;       /* 32px */

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Line Heights */
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.6;
  --line-height-loose: 1.8;

  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
}
```

### Spacing

```css
:root {
  /* Base Unit: 0.25rem (4px) */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */

  /* Semantic Spacing */
  --space-xs: var(--space-2);
  --space-sm: var(--space-3);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-12);
}
```

### Shadows

```css
:root {
  /* Elevation Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
               0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
               0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
               0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
               0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Focus Shadow */
  --shadow-focus: 0 0 0 3px rgba(16, 185, 129, 0.3);
  --shadow-focus-error: 0 0 0 3px rgba(239, 68, 68, 0.3);
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;   /* Pill shape */
}
```

### Transitions

```css
:root {
  /* Duration */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  /* Easing */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Combined */
  --transition-fast: var(--duration-fast) var(--ease-in-out);
  --transition-normal: var(--duration-normal) var(--ease-in-out);
  --transition-slow: var(--duration-slow) var(--ease-in-out);
}
```

### Z-Index Scale

```css
:root {
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-overlay: 1200;
  --z-modal: 1300;
  --z-popover: 1400;
  --z-tooltip: 1500;
}
```

---

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
  color: var(--color-text-inverse);
  background-color: var(--color-brand-primary);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-brand-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  background-color: var(--color-brand-primary-active);
  box-shadow: var(--shadow-sm);
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.btn-primary:disabled {
  background-color: var(--color-gray-300);
  color: var(--color-gray-500);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
```

#### Secondary Button
```css
.btn-secondary {
  /* Same as primary but with different colors */
  background-color: var(--color-white);
  color: var(--color-brand-primary);
  border: 2px solid var(--color-brand-primary);
}

.btn-secondary:hover {
  background-color: var(--color-brand-lighter);
}
```

#### Ghost Button
```css
.btn-ghost {
  background-color: transparent;
  color: var(--color-gray-600);
  border: none;
  box-shadow: none;
}

.btn-ghost:hover {
  background-color: var(--color-gray-100);
}
```

#### Icon Button
```css
.btn-icon {
  padding: var(--space-2);
  aspect-ratio: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

#### Button Sizes
```css
.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-lg);
}
```

### Inputs

#### Text Input
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-white);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--color-brand-primary);
  box-shadow: var(--shadow-focus);
}

.input::placeholder {
  color: var(--color-text-disabled);
}

.input:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.input.error {
  border-color: var(--color-error);
}

.input.error:focus {
  box-shadow: var(--shadow-focus-error);
}
```

#### Textarea
```css
.textarea {
  /* Same as .input but with min-height */
  min-height: 120px;
  resize: vertical;
}
```

### Cards

```css
.card {
  background-color: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.modal {
  background-color: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.modal-close {
  /* Icon button for close */
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.badge-success {
  color: var(--color-success);
  background-color: var(--color-success-light);
}

.badge-warning {
  color: var(--color-warning);
  background-color: var(--color-warning-light);
}

.badge-error {
  color: var(--color-error);
  background-color: var(--color-error-light);
}

.badge-info {
  color: var(--color-info);
  background-color: var(--color-info-light);
}
```

### Tooltips

```css
.tooltip {
  position: absolute;
  z-index: var(--z-tooltip);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-inverse);
  background-color: var(--color-gray-900);
  border-radius: var(--radius-md);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.tooltip.show {
  opacity: 1;
}

.tooltip::before {
  /* Arrow pointing to element */
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.tooltip[data-placement="top"]::before {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--color-gray-900);
}
```

### Toast Notifications

```css
.toast-container {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  z-index: var(--z-popover);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  animation: slideInRight var(--duration-normal) var(--ease-out);
}

.toast.success { border-left: 4px solid var(--color-success); }
.toast.warning { border-left: 4px solid var(--color-warning); }
.toast.error { border-left: 4px solid var(--color-error); }
.toast.info { border-left: 4px solid var(--color-info); }

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  margin-bottom: var(--space-1);
}

.toast-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.toast-close {
  /* Icon button */
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Loading Spinner

```css
.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-brand-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Dropdown Menu

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--space-2);
  min-width: 200px;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast);
}

.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--color-surface);
}

.dropdown-item:active {
  background-color: var(--color-gray-100);
}

.dropdown-divider {
  height: 1px;
  margin: var(--space-2) 0;
  background-color: var(--color-border);
}
```

---

## Layout Patterns

### Side Panel Layout

```css
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.side-panel {
  width: 240px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.side-panel-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.side-panel-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2);
}

.side-panel-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

### Top Menu Bar

```css
.top-bar {
  height: 60px;
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  gap: var(--space-6);
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
```

### Content Area

```css
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

.content-container {
  max-width: 900px;
  margin: 0 auto;
}
```

---

## Utility Classes

### Display
```css
.d-none { display: none; }
.d-block { display: block; }
.d-flex { display: flex; }
.d-inline-flex { display: inline-flex; }
.d-grid { display: grid; }
```

### Flexbox
```css
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }
.align-start { align-items: flex-start; }
.align-center { align-items: center; }
.align-end { align-items: flex-end; }
.gap-2 { gap: var(--space-2); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
```

### Text
```css
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }
.text-xl { font-size: var(--font-size-xl); }
.font-normal { font-weight: var(--font-weight-regular); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }
```

### Colors
```css
.text-primary { color: var(--color-text-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-brand { color: var(--color-brand-primary); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }
.bg-white { background-color: var(--color-white); }
.bg-surface { background-color: var(--color-surface); }
.bg-brand { background-color: var(--color-brand-primary); }
```

### Spacing (Margin & Padding)
```css
.m-0 { margin: 0; }
.m-2 { margin: var(--space-2); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.mt-2 { margin-top: var(--space-2); }
.mt-4 { margin-top: var(--space-4); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-4 { margin-bottom: var(--space-4); }
.p-0 { padding: 0; }
.p-2 { padding: var(--space-2); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
```

---

## Accessibility Utilities

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Focus Visible
```css
.focus-visible:focus-visible {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}
```

### Skip Link
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background-color: var(--color-brand-primary);
  color: var(--color-white);
  padding: var(--space-3) var(--space-4);
  z-index: 9999;
  border-radius: var(--radius-md);
}

.skip-link:focus {
  top: var(--space-4);
}
```

---

## Responsive Utilities

### Breakpoint Variables
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Media Queries
```css
/* Hide on mobile */
.hide-mobile {
  display: block;
}

@media (max-width: 767px) {
  .hide-mobile {
    display: none;
  }
}

/* Show only on mobile */
.show-mobile {
  display: none;
}

@media (max-width: 767px) {
  .show-mobile {
    display: block;
  }
}
```

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Install Inter font from Google Fonts
- [ ] Install Fira Code font (optional for code)
- [ ] Create `design-tokens.css` with all custom properties
- [ ] Create `base.css` with resets and global styles
- [ ] Create `components.css` with component classes
- [ ] Create `utilities.css` with utility classes

### Phase 2: Components
- [ ] Build button components (primary, secondary, ghost, icon)
- [ ] Build input components (text, textarea, select)
- [ ] Build card component
- [ ] Build modal component
- [ ] Build toast notification component
- [ ] Build dropdown menu component
- [ ] Build badge component
- [ ] Build tooltip component
- [ ] Build loading spinner

### Phase 3: Layout
- [ ] Build app layout (side panel + main content)
- [ ] Build top menu bar
- [ ] Build side panel navigation
- [ ] Build content area

### Phase 4: Testing
- [ ] Test all components in isolation
- [ ] Test responsive behavior
- [ ] Test dark theme (if applicable)
- [ ] Test accessibility (keyboard, screen reader)
- [ ] Test browser compatibility

---

**End of Design System**  
**Next:** Apply this system to high-fidelity mockups
