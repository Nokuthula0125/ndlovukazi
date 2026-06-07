const store = new Map();

const cache = {
  get(key) {
    const item = store.get(key);
    if (!item) return null;
    if (Date.now() > item.exp) { store.delete(key); return null; }
    return item.value;
  },
  set(key, value, ttlSeconds = 3600) {
    store.set(key, { value, exp: Date.now() + ttlSeconds * 1000 });
  },
  del(key) { store.delete(key); },
  delByPrefix(prefix) {
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  },
};

module.exports = cache;
