/**
 * Review Mode - Non-destructive UI/UX annotation overlay
 * Displays spacing, contrast ratios, and hit areas for design review
 */

export default class ReviewMode {
  constructor() {
    this.active = false;
    this.overlay = null;
    this.annotations = [];
    this.config = {
      minHitArea: 40, // pixels
      minContrast: 4.5, // WCAG AA for normal text
      minContrastLarge: 3.0, // WCAG AA for large text
      spacingColors: {
        xs: '#ec4899', // pink
        sm: '#f59e0b', // amber
        md: '#10b981', // emerald
        lg: '#3b82f6', // blue
        xl: '#8b5cf6', // purple
      },
    };
  }

  toggle() {
    this.active = !this.active;
    if (this.active) {
      this.activate();
    } else {
      this.deactivate();
    }
    return this.active;
  }

  activate() {
    if (this.overlay) {
      return;
    }

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'review-mode-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.overlay);

    // Run annotations
    this.annotateSpacing();
    this.annotateClickableAreas();
    this.annotateContrast();

    // Log summary to console
    this.logSummary();
  }

  deactivate() {
    if (!this.overlay) {
      return;
    }

    this.overlay.remove();
    this.overlay = null;
    this.annotations = [];
  }

  /**
   * Annotate spacing between elements and padding
   */
  annotateSpacing() {
    const spacingElements = document.querySelectorAll(
      '.layout, .panel, .panel__body, .app-header, .metadata-form__grid, .block-list'
    );

    spacingElements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      // Gap annotation (for grid/flex containers)
      const gap = computed.gap || computed.gridGap;
      if (gap && gap !== 'normal' && gap !== '0px') {
        const gapValue = parseFloat(gap);
        const gapRem = gapValue / 16;
        const spacingKey = this.getSpacingKey(gapRem);

        this.addAnnotation({
          type: 'spacing',
          element: el,
          value: `gap: ${gapRem.toFixed(2)}rem (${spacingKey})`,
          x: rect.left + rect.width / 2,
          y: rect.top + 10,
          color: this.config.spacingColors[spacingKey] || '#64748b',
        });
      }

      // Padding annotation
      const padding = {
        top: parseFloat(computed.paddingTop),
        right: parseFloat(computed.paddingRight),
        bottom: parseFloat(computed.paddingBottom),
        left: parseFloat(computed.paddingLeft),
      };

      const hasPadding = Object.values(padding).some((p) => p > 0);
      if (hasPadding) {
        const avgPadding = Object.values(padding).reduce((a, b) => a + b, 0) / 4;
        const paddingRem = avgPadding / 16;
        const spacingKey = this.getSpacingKey(paddingRem);

        if (avgPadding > 8) {
          this.addAnnotation({
            type: 'spacing',
            element: el,
            value: `padding: ~${paddingRem.toFixed(2)}rem (${spacingKey})`,
            x: rect.left + 10,
            y: rect.top + rect.height / 2,
            color: this.config.spacingColors[spacingKey] || '#64748b',
          });
        }
      }
    });
  }

  /**
   * Map rem value to spacing scale key
   */
  getSpacingKey(remValue) {
    if (remValue <= 0.5) {return 'xs';}
    if (remValue <= 1.0) {return 'sm';}
    if (remValue <= 1.5) {return 'md';}
    if (remValue <= 2.5) {return 'lg';}
    return 'xl';
  }

  /**
   * Annotate clickable areas with hit area measurements
   */
  annotateClickableAreas() {
    const clickable = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [onclick], [data-action]'
    );

    clickable.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const minDimension = Math.min(width, height);

      const isTooSmall = minDimension < this.config.minHitArea;
      const status = isTooSmall ? 'fail' : 'pass';

      this.addAnnotation({
        type: 'hit-area',
        element: el,
        value: `${Math.round(width)}×${Math.round(height)}px`,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        status: status,
        color: isTooSmall ? '#ef4444' : '#10b981',
      });

      // Track violations
      if (isTooSmall) {
        this.annotations.push({
          type: 'hit-area-violation',
          element: el,
          width,
          height,
          minDimension,
          required: this.config.minHitArea,
        });
      }
    });
  }

  /**
   * Annotate text elements with contrast ratios
   */
  annotateContrast() {
    const textElements = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, td, th'
    );

    const checked = new Set();

    textElements.forEach((el) => {
      // Skip if already checked or empty
      if (checked.has(el) || !el.textContent.trim()) {
        return;
      }

      const computed = window.getComputedStyle(el);
      const color = computed.color;
      const backgroundColor = this.getBackgroundColor(el);

      if (!backgroundColor || backgroundColor === 'transparent') {
        return;
      }

      const contrast = this.calculateContrast(color, backgroundColor);
      const fontSize = parseFloat(computed.fontSize);
      const fontWeight = computed.fontWeight;

      // Determine if text is "large" (18pt+ or 14pt+ bold)
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && parseInt(fontWeight) >= 700);
      const requiredContrast = isLarge ? this.config.minContrastLarge : this.config.minContrast;

      const passes = contrast >= requiredContrast;
      const status = passes ? 'pass' : 'fail';

      const rect = el.getBoundingClientRect();

      if (rect.width > 0 && rect.height > 0) {
        this.addAnnotation({
          type: 'contrast',
          element: el,
          value: `${contrast.toFixed(2)}:1 (${status})`,
          x: rect.right - 80,
          y: rect.top,
          color: passes ? '#10b981' : '#ef4444',
          status: status,
        });

        checked.add(el);

        // Track violations
        if (!passes) {
          this.annotations.push({
            type: 'contrast-violation',
            element: el,
            contrast,
            required: requiredContrast,
            isLarge,
            color,
            backgroundColor,
          });
        }
      }
    });
  }

  /**
   * Get effective background color (walks up DOM tree)
   */
  getBackgroundColor(el) {
    let current = el;
    while (current && current !== document.body) {
      const bg = window.getComputedStyle(current).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        return bg;
      }
      current = current.parentElement;
    }
    return window.getComputedStyle(document.body).backgroundColor || '#ffffff';
  }

  /**
   * Calculate contrast ratio between two colors
   * Based on WCAG 2.1 formula
   */
  calculateContrast(color1, color2) {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  getLuminance(color) {
    const rgb = this.parseColor(color);
    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Parse CSS color to RGB array
   */
  parseColor(color) {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
  }

  /**
   * Add annotation to overlay
   */
  addAnnotation({ type, element, value, x, y, width, height, color, status }) {
    if (!this.overlay) {
      return;
    }

    const annotation = document.createElement('div');
    annotation.className = `review-annotation review-annotation--${type}`;
    annotation.setAttribute('data-status', status || 'info');

    if (type === 'hit-area') {
      // Bounding box
      annotation.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
        border: 2px solid ${color};
        pointer-events: none;
        z-index: 9998;
      `;

      // Label
      const label = document.createElement('div');
      label.className = 'review-annotation__label';
      label.textContent = value;
      label.style.cssText = `
        position: absolute;
        top: -24px;
        left: 0;
        background: ${color};
        color: white;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 3px;
        white-space: nowrap;
      `;
      annotation.appendChild(label);
    } else {
      // Point annotation
      annotation.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: ${color};
        color: white;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
      `;
      annotation.textContent = value;
    }

    this.overlay.appendChild(annotation);
  }

  /**
   * Log summary to console
   */
  logSummary() {
    const hitAreaViolations = this.annotations.filter((a) => a.type === 'hit-area-violation');
    const contrastViolations = this.annotations.filter((a) => a.type === 'contrast-violation');

    console.group('🎨 Review Mode - UX Audit Summary');
    console.log(`✅ Total annotations: ${this.overlay?.children.length || 0}`);

    if (hitAreaViolations.length > 0) {
      console.group(`❌ Hit Area Violations: ${hitAreaViolations.length}`);
      hitAreaViolations.forEach((v) => {
        console.log(
          `- ${v.element.tagName.toLowerCase()}: ${Math.round(v.minDimension)}px (min: ${v.required}px)`,
          v.element
        );
      });
      console.groupEnd();
    } else {
      console.log('✅ Hit areas: All pass (40px minimum)');
    }

    if (contrastViolations.length > 0) {
      console.group(`❌ Contrast Violations: ${contrastViolations.length}`);
      contrastViolations.forEach((v) => {
        console.log(
          `- ${v.element.tagName.toLowerCase()}: ${v.contrast.toFixed(2)}:1 (required: ${v.required.toFixed(2)}:1)`,
          v.element
        );
      });
      console.groupEnd();
    } else {
      console.log('✅ Contrast: All pass (WCAG AA)');
    }

    console.groupEnd();
  }

  /**
   * Get current violations for reporting
   */
  getViolations() {
    return {
      hitArea: this.annotations.filter((a) => a.type === 'hit-area-violation'),
      contrast: this.annotations.filter((a) => a.type === 'contrast-violation'),
    };
  }
}
