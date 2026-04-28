const store = new Map();

function init(userId, total) {
  store.set(userId, {
    total,
    done: 0
  });
}

function add(userId) {
  const p = store.get(userId);
  if (!p) return;

  p.done++;
}

function get(userId) {
  return store.get(userId) || { total: 0, done: 0 };
}

module.exports = { init, add, get };
