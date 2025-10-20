#!/usr/bin/env node

/**
 * Generate UX Findings Report
 * Processes feedback JSON files and creates a comprehensive markdown report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEEDBACK_DIR = path.join(__dirname, '../feedback/local');
const REPORTS_DIR = path.join(__dirname, '../reports');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'ux-findings.md');

// Priority labels
const PRIORITY_LABELS = {
  p0: { label: 'P0 - Critical', emoji: '🔴', description: 'Blocks core functionality' },
  p1: { label: 'P1 - High', emoji: '🟠', description: 'Major usability issue' },
  p2: { label: 'P2 - Medium', emoji: '🟡', description: 'Minor issue or enhancement' },
};

// Type labels
const TYPE_LABELS = {
  bug: { label: 'Bug / Issue', emoji: '🐛' },
  confusion: { label: 'Confusing / Unclear', emoji: '❓' },
  suggestion: { label: 'Suggestion', emoji: '💡' },
  accessibility: { label: 'Accessibility', emoji: '♿' },
  other: { label: 'Other', emoji: '💬' },
};

/**
 * Read all feedback JSON files
 */
function readFeedbackFiles() {
  if (!fs.existsSync(FEEDBACK_DIR)) {
    console.warn('⚠️  No feedback directory found');
    return [];
  }

  const files = fs.readdirSync(FEEDBACK_DIR).filter((f) => f.endsWith('.json'));

  const feedback = files.map((file) => {
    const content = fs.readFileSync(path.join(FEEDBACK_DIR, file), 'utf-8');
    return JSON.parse(content);
  });

  return feedback.sort((a, b) => {
    // Sort by priority first (p0 > p1 > p2)
    const priorityOrder = { p0: 0, p1: 1, p2: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) {return priorityDiff;}

    // Then by timestamp (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
}

/**
 * Group feedback by priority
 */
function groupByPriority(feedback) {
  const grouped = {
    p0: [],
    p1: [],
    p2: [],
  };

  feedback.forEach((item) => {
    const priority = item.priority || 'p2';
    if (grouped[priority]) {
      grouped[priority].push(item);
    }
  });

  return grouped;
}

/**
 * Format timestamp
 */
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate markdown report
 */
function generateReport(feedback) {
  const grouped = groupByPriority(feedback);
  const totalCount = feedback.length;

  let report = `# UX Findings Report\n\n`;
  report += `**Generated:** ${formatDate(new Date().toISOString())}\n`;
  report += `**Total Issues:** ${totalCount}\n\n`;

  if (totalCount === 0) {
    report += `✅ No feedback submitted yet. Use the feedback drawer in the editor to report issues.\n\n`;
    return report;
  }

  // Summary
  report += `## Summary\n\n`;
  report += `| Priority | Count | Description |\n`;
  report += `|----------|-------|-------------|\n`;
  Object.entries(PRIORITY_LABELS).forEach(([key, info]) => {
    const count = grouped[key]?.length || 0;
    report += `| ${info.emoji} ${info.label} | ${count} | ${info.description} |\n`;
  });
  report += `\n`;

  // Detailed findings by priority
  Object.entries(grouped).forEach(([priority, items]) => {
    if (items.length === 0) {return;}

    const priorityInfo = PRIORITY_LABELS[priority];
    report += `## ${priorityInfo.emoji} ${priorityInfo.label}\n\n`;
    report += `${priorityInfo.description}\n\n`;

    items.forEach((item, index) => {
      const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.other;
      const screenshotPath = `../feedback/local/screenshots/${path.basename(item.timestamp)}.png`;

      report += `### ${index + 1}. ${typeInfo.emoji} ${typeInfo.label}\n\n`;
      report += `**Submitted:** ${formatDate(item.timestamp)}\n\n`;
      report += `**Description:**\n\n`;
      report += `${item.comment}\n\n`;

      if (item.appState) {
        report += `**Context:**\n`;
        report += `- Blocks: ${item.appState.blockCount || 0}\n`;
        report += `- Validation: ${item.appState.validationStatus || 'unknown'}\n`;
        report += `- Exported: ${item.appState.hasExported ? 'Yes' : 'No'}\n`;
        report += `- Published: ${item.appState.hasPublished ? 'Yes' : 'No'}\n`;
        report += `\n`;
      }

      if (item.viewport) {
        report += `**Viewport:** ${item.viewport.width}×${item.viewport.height}px\n\n`;
      }

      if (item.screenshot) {
        // Save screenshot to file
        const screenshotDir = path.join(FEEDBACK_DIR, 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const screenshotFile = path.join(screenshotDir, `${path.basename(item.timestamp)}.png`);
        const base64Data = item.screenshot.replace(/^data:image\/png;base64,/, '');

        try {
          fs.writeFileSync(screenshotFile, base64Data, 'base64');
          report += `**Screenshot:**\n\n`;
          report += `![Screenshot](${screenshotPath})\n\n`;
        } catch (error) {
          console.error(`Failed to save screenshot: ${error.message}`);
        }
      }

      report += `---\n\n`;
    });
  });

  // Recommendations
  report += `## Recommendations\n\n`;
  report += `### Immediate Actions (P0)\n\n`;
  const p0Items = grouped.p0 || [];
  if (p0Items.length > 0) {
    report += `${p0Items.length} critical issue(s) should be addressed immediately:\n\n`;
    p0Items.forEach((item, index) => {
      report += `${index + 1}. ${item.comment.split('\n')[0]}\n`;
    });
  } else {
    report += `✅ No critical issues reported.\n`;
  }
  report += `\n`;

  report += `### Next Sprint (P1)\n\n`;
  const p1Items = grouped.p1 || [];
  if (p1Items.length > 0) {
    report += `${p1Items.length} high-priority issue(s) for next sprint:\n\n`;
    p1Items.forEach((item, index) => {
      report += `${index + 1}. ${item.comment.split('\n')[0]}\n`;
    });
  } else {
    report += `✅ No high-priority issues reported.\n`;
  }
  report += `\n`;

  report += `### Backlog (P2)\n\n`;
  const p2Items = grouped.p2 || [];
  if (p2Items.length > 0) {
    report += `${p2Items.length} enhancement(s) for backlog:\n\n`;
    p2Items.forEach((item, index) => {
      report += `${index + 1}. ${item.comment.split('\n')[0]}\n`;
    });
  } else {
    report += `✅ No enhancements suggested.\n`;
  }
  report += `\n`;

  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('📊 Generating UX Findings Report...\n');

  try {
    const feedback = readFeedbackFiles();
    console.log(`✅ Found ${feedback.length} feedback item(s)\n`);

    const report = generateReport(feedback);

    // Ensure reports directory exists
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
    console.log(`✅ Report generated: ${OUTPUT_FILE}\n`);

    // Summary
    const grouped = groupByPriority(feedback);
    console.log('Summary:');
    console.log(`  🔴 P0 Critical: ${grouped.p0.length}`);
    console.log(`  🟠 P1 High: ${grouped.p1.length}`);
    console.log(`  🟡 P2 Medium: ${grouped.p2.length}`);
    console.log(`  📝 Total: ${feedback.length}\n`);
  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  }
}

main();
