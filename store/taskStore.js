const map = new Map();

module.exports = {
  set: (id, data) => map.set(id, data),
  get: (id) => map.get(id) || []
};
