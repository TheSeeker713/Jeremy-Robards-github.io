/**
 * UX Checklist Panel - Jakob Nielsen's 10 Usability Heuristics
 * Tracks compliance with each heuristic for the current screen
 */

export default class UXChecklist {
  constructor() {
    this.isOpen = false;
    this.panel = null;
    this.storageKey = 'ux-checklist-state';

    this.heuristics = [
      {
        id: 1,
        title: 'Visibility of system status',
        description:
          'Users should always know what is happening through appropriate feedback within a reasonable time.',
        examples: 'Loading indicators, save confirmations, export/publish status',
      },
      {
        id: 2,
        title: 'Match between system and real world',
        description:
          'Use familiar language and concepts rather than system-oriented terms. Follow real-world conventions.',
        examples: 'Natural language, intuitive icons, logical grouping',
      },
      {
        id: 3,
        title: 'User control and freedom',
        description:
          'Users need a way to undo actions and exit unwanted states without completing an extended process.',
        examples: 'Undo/redo, cancel buttons, back navigation, ESC key',
      },
      {
        id: 4,
        title: 'Consistency and standards',
        description:
          'Follow platform and industry conventions. Same words, situations, or actions should mean the same thing.',
        examples: 'Consistent button styles, predictable navigation, standard icons',
      },
      {
        id: 5,
        title: 'Error prevention',
        description:
          'Good error messages are important, but preventing problems before they occur is even better.',
        examples: 'Confirmation dialogs, input validation, disabled states',
      },
      {
        id: 6,
        title: 'Recognition rather than recall',
        description:
          'Minimize memory load by making elements, actions, and options visible. Instructions should be easily retrievable.',
        examples: 'Visible labels, tooltips, placeholder text, persistent navigation',
      },
      {
        id: 7,
        title: 'Flexibility and efficiency of use',
        description:
          'Provide accelerators for experienced users while remaining accessible to novices.',
        examples: 'Keyboard shortcuts, bulk actions, templates, recent items',
      },
      {
        id: 8,
        title: 'Aesthetic and minimalist design',
        description:
          'Interfaces should not contain irrelevant or rarely needed information. Every extra unit of information competes with relevant units.',
        examples: 'Clear visual hierarchy, progressive disclosure, focused content',
      },
      {
        id: 9,
        title: 'Help users recognize, diagnose, and recover from errors',
        description:
          'Error messages should be in plain language, precisely indicate the problem, and constructively suggest a solution.',
        examples: 'Inline validation, specific error messages, recovery suggestions',
      },
      {
        id: 10,
        title: 'Help and documentation',
        description:
          'Provide help and documentation that is easy to search, focused on tasks, lists concrete steps, and not too large.',
        examples: 'Contextual help, tooltips, getting started guide, FAQ',
      },
    ];

    this.state = this.loadState();
    this.render();
    this.bindEvents();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load UX checklist state:', error);
    }

    // Default state: all unchecked
    return this.heuristics.reduce((acc, h) => {
      acc[h.id] = { status: null, notes: '' };
      return acc;
    }, {});
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save UX checklist state:', error);
    }
  }

  render() {
    this.panel = document.createElement('aside');
    this.panel.className = 'ux-checklist';
    this.panel.setAttribute('aria-hidden', 'true');
    this.panel.innerHTML = `
      <div class="ux-checklist__header">
        <div>
          <h3>UX Checklist</h3>
          <p class="ux-checklist__subtitle">Nielsen's 10 Usability Heuristics</p>
        </div>
        <button type="button" class="ux-checklist__close" data-action="close-ux-checklist" aria-label="Close UX checklist">
          ×
        </button>
      </div>
      <div class="ux-checklist__body">
        <div class="ux-checklist__summary" data-checklist-summary>
          ${this.renderSummary()}
        </div>
        <div class="ux-checklist__items">
          ${this.heuristics.map((h) => this.renderHeuristic(h)).join('')}
        </div>
      </div>
      <div class="ux-checklist__footer">
        <button type="button" class="button button--ghost button--sm" data-action="reset-checklist">
          Reset All
        </button>
        <button type="button" class="button button--primary button--sm" data-action="export-checklist">
          Export Results
        </button>
      </div>
    `;

    document.body.appendChild(this.panel);
  }

  renderSummary() {
    const counts = {
      pass: 0,
      fail: 0,
      unchecked: 0,
    };

    Object.values(this.state).forEach((item) => {
      if (item.status === 'pass') {counts.pass++;}
      else if (item.status === 'fail') {counts.fail++;}
      else {counts.unchecked++;}
    });

    const total = this.heuristics.length;
    const progress = Math.round(((counts.pass + counts.fail) / total) * 100);

    return `
      <div class="ux-checklist__stats">
        <div class="ux-checklist__stat ux-checklist__stat--pass">
          <strong>${counts.pass}</strong>
          <span>Pass</span>
        </div>
        <div class="ux-checklist__stat ux-checklist__stat--fail">
          <strong>${counts.fail}</strong>
          <span>Fail</span>
        </div>
        <div class="ux-checklist__stat">
          <strong>${progress}%</strong>
          <span>Reviewed</span>
        </div>
      </div>
    `;
  }

  renderHeuristic(h) {
    const state = this.state[h.id] || { status: null, notes: '' };
    const isExpanded = state.status !== null;

    return `
      <div class="ux-checklist__item" data-heuristic="${h.id}" data-expanded="${isExpanded}">
        <div class="ux-checklist__item-header">
          <div class="ux-checklist__item-title">
            <strong>#${h.id}</strong>
            <span>${h.title}</span>
          </div>
          <div class="ux-checklist__item-status">
            <button 
              type="button" 
              class="ux-checklist__status-btn ${state.status === 'pass' ? 'active' : ''}" 
              data-action="set-status"
              data-heuristic-id="${h.id}"
              data-status="pass"
              aria-label="Mark as pass"
            >
              ✓
            </button>
            <button 
              type="button" 
              class="ux-checklist__status-btn ${state.status === 'fail' ? 'active' : ''}" 
              data-action="set-status"
              data-heuristic-id="${h.id}"
              data-status="fail"
              aria-label="Mark as fail"
            >
              ✗
            </button>
          </div>
        </div>
        <div class="ux-checklist__item-body">
          <p class="ux-checklist__description">${h.description}</p>
          <p class="ux-checklist__examples"><strong>Examples:</strong> ${h.examples}</p>
          <textarea 
            class="ux-checklist__notes" 
            placeholder="Add notes about compliance or issues..."
            data-heuristic-id="${h.id}"
            rows="3"
          >${state.notes}</textarea>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.panel.addEventListener('click', (e) => {
      const action = e.target.dataset.action;

      if (action === 'close-ux-checklist') {
        this.close();
      } else if (action === 'set-status') {
        const heuristicId = parseInt(e.target.dataset.heuristicId);
        const status = e.target.dataset.status;
        this.setStatus(heuristicId, status);
      } else if (action === 'reset-checklist') {
        this.reset();
      } else if (action === 'export-checklist') {
        this.export();
      }
    });

    this.panel.addEventListener('input', (e) => {
      if (e.target.classList.contains('ux-checklist__notes')) {
        const heuristicId = parseInt(e.target.dataset.heuristicId);
        this.setNotes(heuristicId, e.target.value);
      }
    });

    // Expand/collapse on header click
    this.panel.addEventListener('click', (e) => {
      const header = e.target.closest('.ux-checklist__item-header');
      if (header && !e.target.closest('.ux-checklist__status-btn')) {
        const item = header.closest('.ux-checklist__item');
        const isExpanded = item.dataset.expanded === 'true';
        item.dataset.expanded = !isExpanded;
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  setStatus(heuristicId, status) {
    const currentStatus = this.state[heuristicId].status;
    this.state[heuristicId].status = currentStatus === status ? null : status;
    this.saveState();
    this.updateUI();
  }

  setNotes(heuristicId, notes) {
    this.state[heuristicId].notes = notes;
    this.saveState();
  }

  reset() {
    if (confirm('Reset all checklist items? This cannot be undone.')) {
      this.state = this.heuristics.reduce((acc, h) => {
        acc[h.id] = { status: null, notes: '' };
        return acc;
      }, {});
      this.saveState();
      this.updateUI();
    }
  }

  export() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      heuristics: this.heuristics.map((h) => {
        const state = this.state[h.id];
        return {
          id: h.id,
          title: h.title,
          status: state.status || 'unchecked',
          notes: state.notes,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ux-checklist-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  updateUI() {
    // Update summary
    const summaryEl = this.panel.querySelector('[data-checklist-summary]');
    if (summaryEl) {
      summaryEl.innerHTML = this.renderSummary();
    }

    // Update each item
    this.heuristics.forEach((h) => {
      const itemEl = this.panel.querySelector(`[data-heuristic="${h.id}"]`);
      if (!itemEl) {return;}

      const state = this.state[h.id];

      // Update status buttons
      const passBtn = itemEl.querySelector('[data-status="pass"]');
      const failBtn = itemEl.querySelector('[data-status="fail"]');

      passBtn?.classList.toggle('active', state.status === 'pass');
      failBtn?.classList.toggle('active', state.status === 'fail');

      // Update notes
      const notesEl = itemEl.querySelector('.ux-checklist__notes');
      if (notesEl && notesEl.value !== state.notes) {
        notesEl.value = state.notes;
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
    this.panel.classList.add('ux-checklist--open');
    this.panel.setAttribute('aria-hidden', 'false');
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove('ux-checklist--open');
    this.panel.setAttribute('aria-hidden', 'true');
  }

  getResults() {
    return {
      heuristics: this.heuristics.map((h) => ({
        id: h.id,
        title: h.title,
        ...this.state[h.id],
      })),
      summary: this.renderSummary(),
    };
  }
}
