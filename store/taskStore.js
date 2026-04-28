const store = new Map();

module.exports = {
  set: (id, data) => store.set(id, data),
  get: (id) => store.get(id)
};
