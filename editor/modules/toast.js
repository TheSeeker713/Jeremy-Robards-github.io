export default class Toast {
  constructor(element) {
    this.element = element;
    this.timeoutId = null;
  }

  show(message, { duration = 3200 } = {}) {
    if (!this.element) {return;}
    this.element.textContent = message;
    this.element.hidden = false;
    this.element.dataset.visible = 'true';

    clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => this.hide(), duration);
  }

  hide() {
    if (!this.element) {return;}
    this.element.dataset.visible = 'false';
    this.timeoutId = window.setTimeout(() => {
      this.element.hidden = true;
    }, 220);
  }
}
