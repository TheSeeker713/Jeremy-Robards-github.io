#!/usr/bin/env node

/**
 * Feedback Digest Generator
 * Aggregates /feedback/local/*.json into a markdown digest
 * Groups by priority and categorizes by tag
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FEEDBACK_DIR = join(__dirname, '../feedback/local');
const REPORTS_DIR = join(__dirname, '../reports');
const OUTPUT_FILE = join(REPORTS_DIR, 'feedback-digest.md');

// Tag categories
const TAG_CATEGORIES = {
  perf: 'Performance',
  ux: 'User Experience',
  a11y: 'Accessibility',
  correctness: 'Correctness',
  bug: 'Bug',
  feature: 'Feature Request',
  docs: 'Documentation',
  security: 'Security',
};

// Priority levels
const PRIORITIES = ['P0', 'P1', 'P2'];

/**
 * Read all feedback JSON files
 */
async function readFeedbackFiles() {
  if (!existsSync(FEEDBACK_DIR)) {
    console.log('No feedback directory found. Creating...');
    await mkdir(FEEDBACK_DIR, { recursive: true });
    return [];
  }

  const files = await readdir(FEEDBACK_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  const feedback = [];
  for (const file of jsonFiles) {
    try {
      const content = await readFile(join(FEEDBACK_DIR, file), 'utf-8');
      const data = JSON.parse(content);
      feedback.push({ ...data, filename: file });
    } catch (error) {
      console.warn(`Failed to parse ${file}:`, error.message);
    }
  }

  return feedback;
}

/**
 * Categorize feedback by tags
 */
function categorizeFeedback(feedback) {
  const categorized = {};

  for (const item of feedback) {
    const tags = item.tags || [];
    for (const tag of tags) {
      const category = TAG_CATEGORIES[tag] || 'Other';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(item);
    }

    // Add to "Other" if no recognized tags
    if (tags.length === 0 || !tags.some((t) => TAG_CATEGORIES[t])) {
      if (!categorized.Other) {
        categorized.Other = [];
      }
      categorized.Other.push(item);
    }
  }

  return categorized;
}

/**
 * Group feedback by priority
 */
function groupByPriority(feedback) {
  const grouped = { P0: [], P1: [], P2: [], Unassigned: [] };

  for (const item of feedback) {
    const priority = item.priority || 'Unassigned';
    if (grouped[priority]) {
      grouped[priority].push(item);
    } else {
      grouped.Unassigned.push(item);
    }
  }

  return grouped;
}

/**
 * Calculate statistics
 */
function calculateStats(feedback) {
  const stats = {
    total: feedback.length,
    byPriority: {},
    byCategory: {},
    recent: 0,
  };

  // Priority counts
  for (const priority of [...PRIORITIES, 'Unassigned']) {
    stats.byPriority[priority] = feedback.filter(
      (f) => (f.priority || 'Unassigned') === priority
    ).length;
  }

  // Category counts
  const categorized = categorizeFeedback(feedback);
  for (const [category, items] of Object.entries(categorized)) {
    stats.byCategory[category] = items.length;
  }

  // Recent (last 7 days)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  stats.recent = feedback.filter((f) => {
    const timestamp = new Date(f.timestamp).getTime();
    return timestamp > sevenDaysAgo;
  }).length;

  return stats;
}

/**
 * Format feedback item for markdown
 */
function formatFeedbackItem(item, index) {
  const timestamp = new Date(item.timestamp).toLocaleString();
  const priority = item.priority || 'Unassigned';
  const tags = (item.tags || []).join(', ') || 'none';
  const hasScreenshot = !!item.screenshot;

  return `
### ${index + 1}. ${item.title || 'Untitled Feedback'}

**Priority:** \`${priority}\` | **Tags:** \`${tags}\` | **Screenshot:** ${hasScreenshot ? '✅' : '❌'}  
**Submitted:** ${timestamp}  
**File:** \`${item.filename}\`

**Description:**  
${item.description || '_No description provided_'}

**Context:**
- **Page:** ${item.context?.page || 'Unknown'}
- **Viewport:** ${item.context?.viewport?.width || 0}x${item.context?.viewport?.height || 0}
- **User Agent:** ${item.context?.userAgent?.slice(0, 80) || 'Unknown'}...

${item.appState ? `**App State:** \`${Object.keys(item.appState).length} keys captured\`` : ''}

---
`;
}

/**
 * Generate markdown digest
 */
function generateDigest(feedback) {
  const stats = calculateStats(feedback);
  const byPriority = groupByPriority(feedback);
  const categorized = categorizeFeedback(feedback);
  const now = new Date().toLocaleString();

  let markdown = `# Feedback Digest

**Generated:** ${now}  
**Total Feedback Items:** ${stats.total}  
**Recent (Last 7 Days):** ${stats.recent}

---

## 📊 Summary Statistics

### By Priority
${PRIORITIES.map((p) => `- **${p}:** ${stats.byPriority[p]} items`).join('\n')}
- **Unassigned:** ${stats.byPriority.Unassigned} items

### By Category
${Object.entries(stats.byCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `- **${cat}:** ${count} items`)
  .join('\n')}

---

## 🔴 Priority 0 - Blockers (${byPriority.P0.length})

${
  byPriority.P0.length > 0
    ? byPriority.P0.map((item, i) => formatFeedbackItem(item, i)).join('\n')
    : '_No P0 blockers. Great!_\n'
}

---

## 🟠 Priority 1 - High (${byPriority.P1.length})

${
  byPriority.P1.length > 0
    ? byPriority.P1.map((item, i) => formatFeedbackItem(item, i)).join('\n')
    : '_No P1 items._\n'
}

---

## 🟡 Priority 2 - Medium (${byPriority.P2.length})

${
  byPriority.P2.length > 0
    ? byPriority.P2.map((item, i) => formatFeedbackItem(item, i)).join('\n')
    : '_No P2 items._\n'
}

---

## ⚪ Unassigned (${byPriority.Unassigned.length})

${
  byPriority.Unassigned.length > 0
    ? byPriority.Unassigned.map((item, i) => formatFeedbackItem(item, i)).join('\n')
    : '_No unassigned items._\n'
}

---

## 📂 Detailed Breakdown by Category

${Object.entries(categorized)
  .sort((a, b) => b[1].length - a[1].length)
  .map(
    ([category, items]) => `
### ${category} (${items.length})

${items.map((item, i) => `${i + 1}. **${item.title || 'Untitled'}** (${item.priority || 'Unassigned'}) - ${new Date(item.timestamp).toLocaleDateString()}`).join('\n')}
`
  )
  .join('\n')}

---

## 🎯 Recommended Actions

${
  stats.byPriority.P0 > 0
    ? `
### ⚠️ URGENT: ${stats.byPriority.P0} Blocker(s)
Address P0 blockers immediately before continuing development.
`
    : ''
}

${
  stats.byPriority.P1 > 5
    ? `
### ⚠️ High Priority Backlog
${stats.byPriority.P1} P1 items need attention. Consider scheduling triage session.
`
    : ''
}

${
  stats.recent > 0
    ? `
### 📈 Recent Activity
${stats.recent} items submitted in the last 7 days. Active feedback period.
`
    : `
### 📉 Low Activity
No recent feedback in 7 days. Consider running dogfood cycle.
`
}

### 🏷️ Tag Distribution
Most common categories: ${Object.entries(stats.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, count]) => `${cat} (${count})`)
    .join(', ')}

---

## 📝 Next Steps

1. **Triage P0 items** - Create GitHub issues for blockers
2. **Review P1 items** - Prioritize for next sprint
3. **Categorize unassigned** - Add priority and tags
4. **Archive processed** - Move resolved feedback to /feedback/archive/

**Generated by:** \`scripts/generate-feedback-digest.mjs\`
`;

  return markdown;
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 Generating feedback digest...\n');

  // Ensure reports directory exists
  if (!existsSync(REPORTS_DIR)) {
    await mkdir(REPORTS_DIR, { recursive: true });
  }

  // Read feedback files
  const feedback = await readFeedbackFiles();
  console.log(`Found ${feedback.length} feedback items\n`);

  if (feedback.length === 0) {
    console.log('No feedback to process. Exiting.');
    return;
  }

  // Generate digest
  const digest = generateDigest(feedback);

  // Write to file
  await writeFile(OUTPUT_FILE, digest, 'utf-8');
  console.log(`✅ Digest generated: ${OUTPUT_FILE}\n`);

  // Print summary to console
  const stats = calculateStats(feedback);
  console.log('Summary:');
  console.log(`  Total: ${stats.total}`);
  console.log(`  P0: ${stats.byPriority.P0}`);
  console.log(`  P1: ${stats.byPriority.P1}`);
  console.log(`  P2: ${stats.byPriority.P2}`);
  console.log(`  Unassigned: ${stats.byPriority.Unassigned}`);
  console.log(`  Recent (7d): ${stats.recent}`);
}

main().catch((error) => {
  console.error('Failed to generate digest:', error);
  process.exit(1);
});
