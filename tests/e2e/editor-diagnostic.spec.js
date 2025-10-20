/**
 * Diagnostic E2E Test for Editor Review Tools
 * Captures console logs and errors to identify why tools don't work
 */

import { test, expect } from '@playwright/test';

test.describe('Editor - Diagnostics', () => {
  test('should load editor without JavaScript errors', async ({ page }) => {
    const consoleMessages = [];
    const consoleErrors = [];
    const pageErrors = [];

    // Capture console messages
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Navigate to editor
    await page.goto('/editor/');

    // Wait for app to load
    await page.waitForTimeout(2000);

    // Print all console messages
    console.log('\\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach((msg) => {
      console.log(`[${msg.type}] ${msg.text}`);
    });

    // Print errors
    console.log('\\n=== CONSOLE ERRORS ===');
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((err) => console.log(err));
    } else {
      console.log('No console errors');
    }

    console.log('\\n=== PAGE ERRORS ===');
    if (pageErrors.length > 0) {
      pageErrors.forEach((err) => console.log(err));
    } else {
      console.log('No page errors');
    }

    // Check if review modules exist in window
    const moduleCheck = await page.evaluate(() => {
      const app = window.app; // Assuming app is exposed
      return {
        appExists: !!app,
        reviewModeExists: !!app?.reviewMode,
        feedbackDrawerExists: !!app?.feedbackDrawer,
        uxChecklistExists: !!app?.uxChecklist,
        a11yCheckerExists: !!app?.a11yChecker,
      };
    });

    console.log('\\n=== MODULE CHECK ===');
    console.log(JSON.stringify(moduleCheck, null, 2));

    // Check if review control buttons exist
    const reviewModeBtn = await page.locator('[data-action="toggle-review-mode"]').count();
    const a11yBtn = await page.locator('[data-action="run-a11y-check"]').count();
    const uxChecklistBtn = await page.locator('[data-action="toggle-ux-checklist"]').count();
    const feedbackBtn = await page.locator('[data-action="toggle-feedback"]').count();

    console.log('\\n=== BUTTON CHECK ===');
    console.log(`Review Mode Button: ${reviewModeBtn}`);
    console.log(`A11y Button: ${a11yBtn}`);
    console.log(`UX Checklist Button: ${uxChecklistBtn}`);
    console.log(`Feedback Button: ${feedbackBtn}`);

    // Check if axe-core is loaded
    const axeLoaded = await page.evaluate(() => {
      return typeof window.axe !== 'undefined';
    });

    console.log('\\n=== DEPENDENCY CHECK ===');
    console.log(`axe-core loaded: ${axeLoaded}`);

    // Check if html2canvas is loaded
    const html2canvasLoaded = await page.evaluate(() => {
      return typeof window.html2canvas !== 'undefined';
    });
    console.log(`html2canvas loaded: ${html2canvasLoaded}`);

    // Attempt to click review mode button and capture what happens
    console.log('\\n=== ATTEMPTING TO CLICK REVIEW MODE BUTTON ===');
    await page.click('[data-action="toggle-review-mode"]');
    await page.waitForTimeout(1000);

    // Check if overlay was created
    const overlayCount = await page.locator('.review-mode-overlay').count();
    console.log(`Review mode overlay count: ${overlayCount}`);

    // Get computed styles of overlay if it exists
    if (overlayCount > 0) {
      const overlayStyles = await page.locator('.review-mode-overlay').evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          zIndex: styles.zIndex,
          position: styles.position,
        };
      });
      console.log('Overlay styles:', JSON.stringify(overlayStyles, null, 2));
    }

    // Expect no page errors
    expect(pageErrors).toEqual([]);
  });
});
