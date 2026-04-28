const map = new Map();

module.exports = {
  init: (id, total) => map.set(id, { total, done: 0 }),
  add: (id) => {
    const p = map.get(id);
    if (p) p.done++;
  },
  get: (id) => map.get(id) || { total: 0, done: 0 }
};
