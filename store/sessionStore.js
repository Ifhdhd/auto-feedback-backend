const map = new Map();

module.exports = {
  set: (id, cookies) => map.set(id, cookies),
  get: (id) => map.get(id),
  delete: (id) => map.delete(id)
};
