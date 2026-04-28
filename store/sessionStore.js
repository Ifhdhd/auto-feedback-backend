const store = new Map();

function set(userId, cookies) {
  store.set(userId, cookies);
}

function get(userId) {
  return store.get(userId);
}

module.exports = {
  set,
  get
};
