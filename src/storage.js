const storage = {
  async get(key) {
    try {
      if (window.storage?.get) return await window.storage.get(key);
    } catch {}
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      if (window.storage?.set) return await window.storage.set(key, value);
    } catch {}
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

export default storage;
