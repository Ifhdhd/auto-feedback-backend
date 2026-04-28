const store = new Map();

module.exports = {
  set: (userId, data) => store.set(userId, data),
  get: (userId) => store.get(userId) || []
};
