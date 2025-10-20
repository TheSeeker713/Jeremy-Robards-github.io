/**
 * Error Boundary for Editor
 * Catches JavaScript errors, shows user-friendly UI, generates crash reports
 */

import { createLogger } from '../shared/logger.js';

const logger = createLogger('error-boundary');

export default class ErrorBoundary {
  constructor() {
    this.hasError = false;
    this.errorInfo = null;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        type: 'unhandled-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          type: 'unhandled-rejection',
          promise: event.promise,
        }
      );
    });
  }

  handleError(error, context = {}) {
    this.hasError = true;
    this.errorInfo = {
      error,
      context,
      timestamp: new Date().toISOString(),
    };

    // Generate crash report
    const crashReport = logger.generateCrashReport(error, {
      ...context,
      appState: this.captureAppState(),
    });

    // Show error UI
    this.renderErrorUI(crashReport);

    // Log to console
    logger.error('Application crashed:', error);
    console.error('Crash report:', crashReport);
  }

  captureAppState() {
    try {
      // Try to get app state from localStorage
      const stored = localStorage.getItem('article-draft');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          hasMetadata: !!parsed.metadata,
          blockCount: parsed.blocks?.length || 0,
          hasExportStatus: !!parsed.exportStatus,
          hasPublishStatus: !!parsed.publishStatus,
        };
      }
    } catch (err) {
      logger.debug('Could not capture app state:', err);
    }
    return {};
  }

  renderErrorUI(crashReport) {
    // Create error overlay
    const overlay = document.createElement('div');
    overlay.className = 'error-boundary';
    overlay.innerHTML = `
      <div class="error-boundary__container">
        <div class="error-boundary__header">
          <h1>⚠️ Something went wrong</h1>
          <p>The editor encountered an unexpected error and needs to reload.</p>
        </div>

        <div class="error-boundary__body">
          <div class="error-boundary__error">
            <strong>Error:</strong>
            <code>${this.escapeHtml(crashReport.error.message)}</code>
          </div>

          <details class="error-boundary__details">
            <summary>Technical Details</summary>
            <pre>${this.escapeHtml(JSON.stringify(crashReport, null, 2))}</pre>
          </details>

          <div class="error-boundary__actions">
            <button type="button" class="button button--primary" data-action="reload">
              Reload Editor
            </button>
            <button type="button" class="button button--ghost" data-action="download-report">
              Download Crash Report
            </button>
            <button type="button" class="button button--ghost" data-action="clear-data">
              Clear Data & Reload
            </button>
          </div>

          <div class="error-boundary__help">
            <h3>What can you do?</h3>
            <ul>
              <li><strong>Reload:</strong> Try reloading the editor. Your draft may be recovered from localStorage.</li>
              <li><strong>Download Report:</strong> Save the crash report and send it to support.</li>
              <li><strong>Clear Data:</strong> If the error persists, clear all saved data and start fresh.</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .error-boundary {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.95);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        overflow: auto;
      }

      .error-boundary__container {
        background: white;
        border-radius: 12px;
        max-width: 800px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .error-boundary__header {
        padding: 2rem;
        border-bottom: 1px solid #e5e7eb;
        text-align: center;
      }

      .error-boundary__header h1 {
        margin: 0 0 0.5rem;
        font-size: 1.875rem;
        color: #dc2626;
      }

      .error-boundary__header p {
        margin: 0;
        color: #6b7280;
        font-size: 1rem;
      }

      .error-boundary__body {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .error-boundary__error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 1rem;
      }

      .error-boundary__error strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #991b1b;
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .error-boundary__error code {
        display: block;
        color: #dc2626;
        font-family: monospace;
        font-size: 0.875rem;
        word-break: break-word;
      }

      .error-boundary__details {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1rem;
      }

      .error-boundary__details summary {
        cursor: pointer;
        font-weight: 600;
        color: #374151;
        user-select: none;
      }

      .error-boundary__details pre {
        margin: 1rem 0 0;
        padding: 1rem;
        background: #1f2937;
        color: #f3f4f6;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 0.75rem;
        line-height: 1.5;
      }

      .error-boundary__actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .error-boundary__actions .button {
        flex: 1;
        min-width: 150px;
      }

      .error-boundary__help {
        background: #eff6ff;
        border: 1px solid #dbeafe;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .error-boundary__help h3 {
        margin: 0 0 1rem;
        font-size: 1rem;
        color: #1e40af;
      }

      .error-boundary__help ul {
        margin: 0;
        padding-left: 1.5rem;
        color: #1e3a8a;
        line-height: 1.7;
      }

      .error-boundary__help li {
        margin-bottom: 0.5rem;
      }

      .error-boundary__help strong {
        color: #1e40af;
      }
    `;

    // Add event listeners
    overlay.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'reload') {
        window.location.reload();
      } else if (action === 'download-report') {
        this.downloadCrashReport(crashReport);
      } else if (action === 'clear-data') {
        if (
          confirm(
            'This will delete all saved drafts and settings. Are you sure you want to continue?'
          )
        ) {
          localStorage.clear();
          window.location.reload();
        }
      }
    });

    // Append to document
    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }

  downloadCrashReport(crashReport) {
    const blob = new Blob([JSON.stringify(crashReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crash-report-${crashReport.timestamp.replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') {
      return unsafe;
    }
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  reset() {
    this.hasError = false;
    this.errorInfo = null;
  }
}
