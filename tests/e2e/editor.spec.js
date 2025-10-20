/**
 * E2E Tests for Editor Basic Functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Editor - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to editor
    await page.goto('/editor/');

    // Wait for app to load
    await page.waitForSelector('.app-header');
  });

  test('should load editor with all panels visible', async ({ page }) => {
    // Check header
    await expect(page.locator('.app-header h1')).toContainText('Portfolio Article Studio');

    // Check panels
    await expect(page.locator('#import-panel')).toBeVisible();
    await expect(page.locator('#block-panel')).toBeVisible();
    await expect(page.locator('#metadata-panel')).toBeVisible();
    await expect(page.locator('#preview-panel')).toBeVisible();
  });

  test('should have functional Export and Publish buttons', async ({ page }) => {
    const exportButton = page.locator('[data-action="export"]');
    const publishButton = page.locator('[data-action="publish"]');

    await expect(exportButton).toBeVisible();
    await expect(publishButton).toBeVisible();

    // Buttons should be disabled initially (no valid metadata)
    await expect(exportButton).toBeDisabled();
    await expect(publishButton).toBeDisabled();
  });

  test('should render review controls', async ({ page }) => {
    // Check all 4 review buttons exist
    await expect(page.locator('[data-action="toggle-review-mode"]')).toBeVisible();
    await expect(page.locator('[data-action="run-a11y-check"]')).toBeVisible();
    await expect(page.locator('[data-action="toggle-ux-checklist"]')).toBeVisible();
    await expect(page.locator('[data-action="toggle-feedback"]')).toBeVisible();
  });

  test('should have skip-to-content link', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveText('Skip to main content');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});

test.describe('Editor - Metadata Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor/');
    await page.waitForSelector('[data-metadata-form]');
  });

  test('should fill out metadata form', async ({ page }) => {
    // Fill required fields
    await page.fill('input[name="title"]', 'Test Article');
    await page.fill('textarea[name="excerpt"]', 'This is a test article excerpt.');

    // Fill optional fields
    await page.fill('input[name="author"]', 'Test Author');
    await page.fill('input[name="category"]', 'Testing');

    // Verify values
    await expect(page.locator('input[name="title"]')).toHaveValue('Test Article');
    await expect(page.locator('textarea[name="excerpt"]')).toHaveValue(
      'This is a test article excerpt.'
    );
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Try to submit without filling required fields
    const titleInput = page.locator('input[name="title"]');
    const excerptInput = page.locator('textarea[name="excerpt"]');

    // Focus and blur to trigger validation
    await titleInput.focus();
    await titleInput.blur();

    // Check for invalid state
    const titleField = page.locator('[data-field="title"]');
    await expect(titleField).toHaveAttribute('data-invalid', 'true');
  });

  test('should generate slug from title', async ({ page }) => {
    await page.fill('input[name="title"]', 'Hello World Test');

    // Check slug preview
    const slugPreview = page.locator('[data-slug-preview]');
    await expect(slugPreview).toContainText('hello-world-test');
  });
});

test.describe('Editor - Block Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor/');
    // Wait for block list to be attached to DOM (not necessarily visible when empty)
    await page.waitForSelector('[data-block-list]', { state: 'attached' });
    // Give app time to fully initialize
    await page.waitForTimeout(500);
  });

  test('should add paragraph block', async ({ page }) => {
    const initialBlocks = await page.locator('.block-item').count();

    await page.click('[data-action="add-paragraph"]');

    const newBlocks = await page.locator('.block-item').count();
    expect(newBlocks).toBe(initialBlocks + 1);
  });

  test('should add heading block', async ({ page }) => {
    await page.click('[data-action="add-heading"]');

    const lastBlock = page.locator('.block-item').last();
    // Label format is "01. Heading" (zero-padded index + type)
    await expect(lastBlock).toHaveAttribute('data-label', /\d{2}\.\s+Heading/);
  });

  test('should add and edit paragraph text', async ({ page }) => {
    await page.click('[data-action="add-paragraph"]');

    const textarea = page.locator('.block-item').last().locator('textarea');
    await textarea.fill('This is a test paragraph.');

    await expect(textarea).toHaveValue('This is a test paragraph.');
  });

  test('should delete blocks', async ({ page }) => {
    await page.click('[data-action="add-paragraph"]');
    const initialBlocks = await page.locator('.block-item').count();

    // Find and click remove button on last block (button text is "Remove" not "Delete")
    const lastBlock = page.locator('.block-item').last();
    const removeButton = lastBlock.locator('button[data-action="remove-block"]');
    await removeButton.click();

    const newBlocks = await page.locator('.block-item').count();
    expect(newBlocks).toBe(initialBlocks - 1);
  });
});

test.describe('Editor - Review Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor/');
  });

  test('should toggle review mode', async ({ page }) => {
    const reviewButton = page.locator('[data-action="toggle-review-mode"]');
    await reviewButton.click();

    // Check if overlay appears
    await expect(page.locator('.review-mode-overlay')).toBeVisible();

    // Toggle off
    await reviewButton.click();
    await expect(page.locator('.review-mode-overlay')).not.toBeVisible();
  });

  test('should open feedback drawer', async ({ page }) => {
    await page.click('[data-action="toggle-feedback"]');

    // Check if drawer is visible
    await expect(page.locator('.feedback-drawer--open')).toBeVisible();
    await expect(page.locator('.feedback-drawer h3')).toContainText('UX Feedback');
  });

  test('should close feedback drawer with Escape', async ({ page }) => {
    await page.click('[data-action="toggle-feedback"]');
    await expect(page.locator('.feedback-drawer--open')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('.feedback-drawer--open')).not.toBeVisible();
  });

  test('should open UX checklist', async ({ page }) => {
    await page.click('[data-action="toggle-ux-checklist"]');

    // Check if checklist is visible
    await expect(page.locator('.ux-checklist--open')).toBeVisible();
    await expect(page.locator('.ux-checklist h3')).toContainText('UX Checklist');
  });

  test('should run accessibility check', async ({ page }) => {
    // Set up console message listener
    const consoleMessages = [];
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    await page.click('[data-action="run-a11y-check"]');

    // Wait for toast message to appear
    await page.waitForSelector('[data-toast]:not([hidden])', { timeout: 5000 });

    // Get toast text
    const toastText = await page.locator('[data-toast]').textContent();

    // Should show either success or violations message
    const hasValidToast =
      toastText.includes('Running accessibility audit') ||
      toastText.includes('No accessibility violations') ||
      toastText.includes('violations');

    expect(hasValidToast).toBe(true);
  });
});

test.describe('Editor - Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor/');
  });

  test('should toggle review mode with Ctrl+R', async ({ page }) => {
    await page.keyboard.press('Control+R');

    await expect(page.locator('.review-mode-overlay')).toBeVisible();
  });

  test('should open feedback with Ctrl+F', async ({ page }) => {
    await page.keyboard.press('Control+F');

    await expect(page.locator('.feedback-drawer--open')).toBeVisible();
  });

  test('should open UX checklist with Ctrl+U', async ({ page }) => {
    await page.keyboard.press('Control+U');

    await expect(page.locator('.ux-checklist--open')).toBeVisible();
  });

  test('should run a11y check with Ctrl+A', async ({ page }) => {
    await page.keyboard.press('Control+A');

    // Wait for toast message
    await page.waitForSelector('[data-toast]:not([hidden])', { timeout: 5000 });

    // Get toast text
    const toastText = await page.locator('[data-toast]').textContent();

    // Should show accessibility audit message
    const hasValidToast =
      toastText.includes('Running accessibility audit') ||
      toastText.includes('No accessibility violations') ||
      toastText.includes('violations');

    expect(hasValidToast).toBe(true);
  });
});

test.describe('Editor - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor/');
  });

  test('should have proper landmarks', async ({ page }) => {
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await expect(page.locator('main[role="main"]')).toBeVisible();
  });

  test('should support Tab navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);

    // Should focus on skip link or first button
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused);
  });

  test('should have ARIA labels on buttons', async ({ page }) => {
    const reviewButton = page.locator('[data-action="toggle-review-mode"]');
    await expect(reviewButton).toHaveAttribute('aria-label');

    const a11yButton = page.locator('[data-action="run-a11y-check"]');
    await expect(a11yButton).toHaveAttribute('aria-label');
  });

  test('should update aria-pressed on toggle buttons', async ({ page }) => {
    const reviewButton = page.locator('[data-action="toggle-review-mode"]');

    await expect(reviewButton).toHaveAttribute('aria-pressed', 'false');

    await reviewButton.click();
    await expect(reviewButton).toHaveAttribute('aria-pressed', 'true');
  });
});
