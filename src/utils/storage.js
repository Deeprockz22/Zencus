export const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Error reading from storage:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to storage:', e);
    }
  },

  getArray(key, defaultValue = []) {
    const fallback = Array.isArray(defaultValue) ? defaultValue : [];
    const value = this.get(key, fallback);
    return Array.isArray(value) ? value : fallback;
  },

  getObject(key, defaultValue = {}) {
    const fallback = defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue)
      ? defaultValue
      : {};
    const value = this.get(key, fallback);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
  },

  getNumber(key, defaultValue) {
    const value = Number(this.get(key, defaultValue));
    return Number.isFinite(value) ? value : defaultValue;
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing key:', e);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  }
};

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
