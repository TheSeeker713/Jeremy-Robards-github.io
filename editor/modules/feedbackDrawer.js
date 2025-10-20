/**
 * Feedback Drawer - In-app UX feedback collection with screenshots
 * Captures user feedback with context (screenshot, page state, timestamp)
 */

import html2canvas from '../../node_modules/html2canvas/dist/html2canvas.esm.js';

export default class FeedbackDrawer {
  constructor({ onSubmit, getAppState }) {
    this.onSubmit = onSubmit;
    this.getAppState = getAppState;
    this.isOpen = false;
    this.drawer = null;
    this.screenshot = null;

    this.render();
    this.bindEvents();
  }

  render() {
    this.drawer = document.createElement('aside');
    this.drawer.className = 'feedback-drawer';
    this.drawer.setAttribute('aria-hidden', 'true');
    this.drawer.innerHTML = `
      <div class="feedback-drawer__header">
        <h3>UX Feedback</h3>
        <button type="button" class="feedback-drawer__close" data-action="close-feedback" aria-label="Close feedback drawer">
          ×
        </button>
      </div>
      <div class="feedback-drawer__body">
        <div class="feedback-drawer__section">
          <p class="feedback-drawer__help">
            Describe any usability issues, confusion, or suggestions you have about this screen.
          </p>
        </div>

        <div class="feedback-drawer__section">
          <label class="feedback-drawer__field">
            <span>Feedback Type</span>
            <select data-feedback-type>
              <option value="bug">🐛 Bug / Issue</option>
              <option value="confusion">❓ Confusing / Unclear</option>
              <option value="suggestion">💡 Suggestion</option>
              <option value="accessibility">♿ Accessibility</option>
              <option value="other">💬 Other</option>
            </select>
          </label>
        </div>

        <div class="feedback-drawer__section">
          <label class="feedback-drawer__field">
            <span>Priority</span>
            <select data-feedback-priority>
              <option value="p2">P2 - Minor</option>
              <option value="p1">P1 - Important</option>
              <option value="p0">P0 - Critical</option>
            </select>
          </label>
        </div>

        <div class="feedback-drawer__section">
          <label class="feedback-drawer__field">
            <span>Description</span>
            <textarea 
              data-feedback-comment 
              rows="6" 
              placeholder="What happened? What did you expect?"
              required
            ></textarea>
          </label>
        </div>

        <div class="feedback-drawer__section">
          <div class="feedback-drawer__screenshot" data-screenshot-preview>
            <div class="feedback-drawer__screenshot-placeholder">
              📸 Screenshot will be captured when submitted
            </div>
          </div>
        </div>

        <div class="feedback-drawer__actions">
          <button type="button" class="button button--ghost" data-action="close-feedback">
            Cancel
          </button>
          <button type="button" class="button button--primary" data-action="submit-feedback">
            Submit Feedback
          </button>
        </div>

        <div class="feedback-drawer__status" data-feedback-status hidden></div>
      </div>
    `;

    document.body.appendChild(this.drawer);
  }

  bindEvents() {
    this.drawer.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'close-feedback') {
        this.close();
      } else if (action === 'submit-feedback') {
        this.submit();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.drawer.classList.add('feedback-drawer--open');
    this.drawer.setAttribute('aria-hidden', 'false');

    // Focus first input
    const firstInput = this.drawer.querySelector('textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 300);
    }
  }

  close() {
    this.isOpen = false;
    this.drawer.classList.remove('feedback-drawer--open');
    this.drawer.setAttribute('aria-hidden', 'true');
    this.screenshot = null;

    // Reset form
    const form = this.drawer.querySelector('[data-feedback-comment]');
    if (form) {
      form.value = '';
    }

    const status = this.drawer.querySelector('[data-feedback-status]');
    if (status) {
      status.hidden = true;
    }
  }

  async submit() {
    const commentEl = this.drawer.querySelector('[data-feedback-comment]');
    const typeEl = this.drawer.querySelector('[data-feedback-type]');
    const priorityEl = this.drawer.querySelector('[data-feedback-priority]');
    const statusEl = this.drawer.querySelector('[data-feedback-status]');

    const comment = commentEl.value.trim();
    if (!comment) {
      this.showStatus('❌ Please enter a description', 'error');
      commentEl.focus();
      return;
    }

    const submitButton = this.drawer.querySelector('[data-action="submit-feedback"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Capturing screenshot...';

    try {
      // Capture screenshot (hide drawer temporarily)
      this.drawer.style.display = 'none';
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
      });
      this.drawer.style.display = '';

      const screenshotDataUrl = canvas.toDataURL('image/png');
      this.screenshot = screenshotDataUrl;

      submitButton.textContent = 'Saving feedback...';

      // Gather feedback data
      const feedback = {
        timestamp: new Date().toISOString(),
        type: typeEl.value,
        priority: priorityEl.value,
        comment: comment,
        screenshot: screenshotDataUrl,
        appState: this.getAppState ? this.getAppState() : {},
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      // Call submit handler (sends to server)
      if (this.onSubmit) {
        await this.onSubmit(feedback);
      }

      this.showStatus('✅ Feedback submitted successfully!', 'success');

      // Close drawer after delay
      setTimeout(() => {
        this.close();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      this.showStatus(`❌ Failed to submit: ${error.message}`, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Feedback';
    }
  }

  showStatus(message, type = 'info') {
    const statusEl = this.drawer.querySelector('[data-feedback-status]');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `feedback-drawer__status feedback-drawer__status--${type}`;
      statusEl.hidden = false;

      if (type === 'success') {
        setTimeout(() => {
          statusEl.hidden = true;
        }, 3000);
      }
    }
  }
}
