const DEFAULT_KEY = 'portfolio-cms-draft';

export default class Store {
  constructor(key = DEFAULT_KEY) {
    this.key = key;
  }

  load() {
    try {
      const raw = window.localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Failed to load draft from localStorage', error);
      return null;
    }
  }

  save(state) {
    try {
      const serialised = JSON.stringify(state);
      window.localStorage.setItem(this.key, serialised);
    } catch (error) {
      console.warn('Failed to persist draft', error);
    }
  }

  clear() {
    window.localStorage.removeItem(this.key);
  }
}
