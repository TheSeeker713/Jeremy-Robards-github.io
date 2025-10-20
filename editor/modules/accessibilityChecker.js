/**
 * Accessibility Checker - Automated WCAG AA compliance using axe-core
 * Runs accessibility audits and reports violations
 */

// axe-core is loaded via CDN in index.html
// Access it via window.axe

export default class AccessibilityChecker {
  constructor() {
    this.violations = [];
    this.lastRunTimestamp = null;
    this.axe = null;
  }

  /**
   * Initialize axe-core (lazy load from window)
   */
  async #initAxe() {
    if (this.axe) return this.axe;

    // Check if axe is available on window
    if (typeof window.axe !== 'undefined') {
      this.axe = window.axe;
      return this.axe;
    }

    // Dynamically load axe-core from CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';
      script.onload = () => {
        this.axe = window.axe;
        resolve(this.axe);
      };
      script.onerror = () => reject(new Error('Failed to load axe-core'));
      document.head.appendChild(script);
    });
  }

  /**
   * Run accessibility audit on current page
   */
  async run(options = {}) {
    // Ensure axe is loaded
    await this.#initAxe();

    const config = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
      ...options,
    };

    try {
      const results = await this.axe.run(document.body, config);
      this.violations = results.violations;
      this.lastRunTimestamp = new Date().toISOString();

      this.logResults(results);
      return results;
    } catch (error) {
      console.error('Accessibility check failed:', error);
      return null;
    }
  }

  /**
   * Log results to console with formatted output
   */
  logResults(results) {
    const { violations, passes, incomplete } = results;

    console.group('♿ Accessibility Audit (WCAG AA)');

    if (violations.length === 0) {
      console.log('✅ No violations found!');
    } else {
      console.warn(`❌ Found ${violations.length} violations:`);

      violations.forEach((violation) => {
        const { id, impact, description, helpUrl, nodes } = violation;

        console.group(
          `%c${impact?.toUpperCase()} %c${description}`,
          `color: white; background: ${this.getImpactColor(impact)}; padding: 2px 6px; border-radius: 3px;`,
          'color: inherit;'
        );

        console.log(`Rule: ${id}`);
        console.log(`Affected elements: ${nodes.length}`);
        console.log(`Learn more: ${helpUrl}`);

        nodes.forEach((node, index) => {
          console.log(`${index + 1}. ${node.html}`);
          console.log('   Target:', node.target);
          if (node.failureSummary) {
            console.log('   Issue:', node.failureSummary);
          }
        });

        console.groupEnd();
      });
    }

    console.log(`\n✅ ${passes.length} checks passed`);

    if (incomplete.length > 0) {
      console.log(`⚠️ ${incomplete.length} checks need manual review`);
    }

    console.groupEnd();
  }

  /**
   * Get color for impact level
   */
  getImpactColor(impact) {
    const colors = {
      critical: '#dc2626',
      serious: '#ea580c',
      moderate: '#f59e0b',
      minor: '#84cc16',
    };
    return colors[impact] || '#64748b';
  }

  /**
   * Get violations grouped by impact
   */
  getViolationsByImpact() {
    const grouped = {
      critical: [],
      serious: [],
      moderate: [],
      minor: [],
    };

    this.violations.forEach((violation) => {
      const impact = violation.impact || 'minor';
      grouped[impact].push(violation);
    });

    return grouped;
  }

  /**
   * Get violations grouped by WCAG criterion
   */
  getViolationsByWCAG() {
    const grouped = {};

    this.violations.forEach((violation) => {
      violation.tags.forEach((tag) => {
        if (tag.startsWith('wcag')) {
          if (!grouped[tag]) {
            grouped[tag] = [];
          }
          grouped[tag].push(violation);
        }
      });
    });

    return grouped;
  }

  /**
   * Generate markdown report
   */
  generateReport() {
    const { violations } = this;
    const timestamp = this.lastRunTimestamp || new Date().toISOString();

    let report = `# Accessibility Audit Report\n\n`;
    report += `**Date:** ${new Date(timestamp).toLocaleString()}\n`;
    report += `**URL:** ${window.location.href}\n`;
    report += `**Total Violations:** ${violations.length}\n\n`;

    if (violations.length === 0) {
      report += `✅ **No accessibility violations found!**\n\n`;
      report += `All WCAG 2.1 Level A and AA checks passed.\n`;
      return report;
    }

    const byImpact = this.getViolationsByImpact();

    ['critical', 'serious', 'moderate', 'minor'].forEach((impact) => {
      const items = byImpact[impact];
      if (items.length === 0) {return;}

      const emoji = {
        critical: '🔴',
        serious: '🟠',
        moderate: '🟡',
        minor: '🟢',
      }[impact];

      report += `## ${emoji} ${impact.charAt(0).toUpperCase() + impact.slice(1)} (${items.length})\n\n`;

      items.forEach((violation) => {
        report += `### ${violation.description}\n\n`;
        report += `**Rule:** \`${violation.id}\`\n`;
        report += `**Impact:** ${violation.impact}\n`;
        report += `**Affected Elements:** ${violation.nodes.length}\n`;
        report += `**Help:** ${violation.helpUrl}\n\n`;

        report += `**Fix:**\n${violation.help}\n\n`;

        if (violation.nodes.length > 0) {
          report += `**Examples:**\n\n`;
          violation.nodes.slice(0, 3).forEach((node, index) => {
            report += `${index + 1}. \`${node.html.substring(0, 100)}${node.html.length > 100 ? '...' : ''}\`\n`;
          });
          report += `\n`;
        }

        report += `---\n\n`;
      });
    });

    return report;
  }

  /**
   * Auto-run on page changes (debounced)
   */
  enableAutoCheck(debounceMs = 2000) {
    let timeoutId;

    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.run();
      }, debounceMs);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Initial run
    this.run();

    return observer;
  }
}
