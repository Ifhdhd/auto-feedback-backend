const store = new Map(); // userId => tasks

function set(userId, tasks) {
  store.set(userId, tasks);
}

function get(userId) {
  return store.get(userId);
}

module.exports = { set, get };
