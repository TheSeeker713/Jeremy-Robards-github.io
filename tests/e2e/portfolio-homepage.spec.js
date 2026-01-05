/**
 * E2E Tests for Portfolio Homepage
 * Verifies that the homepage loads correctly and contains only the remaining portfolio sections
 */

import { test, expect } from '@playwright/test';

test.describe('Portfolio Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForSelector('h1');
  });

  test('should load homepage with welcome heading', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toContainText('WELCOME');
    await expect(heading).toBeVisible();
  });

  test('should display only Motion Picture & Design portfolio link', async ({ page }) => {
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();

    // Check that only one portfolio link exists
    const portfolioLinks = nav.locator('a[data-action="navigate"]');
    await expect(portfolioLinks).toHaveCount(1);
  });

  test('should have correct Motion Picture & Design link', async ({ page }) => {
    const mpdLink = page.locator('a[aria-label="Motion Picture & Design Portfolio"]');
    await expect(mpdLink).toBeVisible();
    await expect(mpdLink).toHaveAttribute('href', './mpd.html');

    // Check image is present
    const mpdImage = mpdLink.locator('img');
    await expect(mpdImage).toHaveAttribute('alt', 'Motion Picture & Design');
    await expect(mpdImage).toHaveAttribute('src', './assets/mpd_button.webp');
  });

  test('should NOT have AI Development portfolio link', async ({ page }) => {
    const aidevLink = page.locator('a[aria-label="AI Development Portfolio"]');
    await expect(aidevLink).not.toBeVisible();
  });

  test('should NOT have Interactive Systems portfolio link', async ({ page }) => {
    const iisLink = page.locator('a[aria-label="Innovative Interactive Systems Portfolio"]');
    await expect(iisLink).not.toBeVisible();
  });

  test('should NOT have Writing Samples portfolio link', async ({ page }) => {
    const writingLink = page.locator('a[aria-label="Writing Samples Portfolio"]');
    await expect(writingLink).not.toBeVisible();
  });

  test('should have footer with copyright', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    const copyright = footer.locator('p');
    await expect(copyright).toContainText('Copyright 2025 Jeremy Robards');
  });

  test('should have proper page structure and accessibility', async ({ page }) => {
    // Check semantic HTML structure
    const main = page.locator('main');
    await expect(main).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check navigation role
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toHaveAttribute('aria-label', 'Portfolio sections');
  });

  test('should load stylesheets without errors', async ({ page }) => {
    // Check that CSS files are loaded
    const tailwindLink = page.locator('link[href="./css/tailwind.css"]');
    const styleLink = page.locator('link[href="./css/style.css"]');

    await expect(tailwindLink).toHaveCount(1);
    await expect(styleLink).toHaveCount(1);
  });

  test('should load main JavaScript file', async ({ page }) => {
    const mainScript = page.locator('script[src="./js/main.js"]');
    await expect(mainScript).toHaveCount(1);
  });

  test('should navigate to MPD portfolio when link is clicked', async ({ page }) => {
    const mpdLink = page.locator('a[aria-label="Motion Picture & Design Portfolio"]');
    
    // Listen for navigation
    const navigationPromise = page.waitForNavigation();
    await mpdLink.click();
    await navigationPromise;

    // Verify we're on the MPD page
    await expect(page).toHaveURL('**/mpd.html');
  });

  test('should have no broken links', async ({ page }) => {
    const links = page.locator('a[data-action="navigate"]');
    
    for (let i = 0; i < await links.count(); i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      
      // Verify href is present and valid
      expect(href).toBeTruthy();
      expect(href).toMatch(/^\.\/.*\.html$/);
    }
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Reload to capture any startup errors
    await page.reload();
    await page.waitForSelector('h1');

    expect(errors).toHaveLength(0);
  });
});
