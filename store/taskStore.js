const store = {};

module.exports = {
  set: (userId, tasks) => {
    store[userId] = tasks;
  },
  get: (userId) => {
    return store[userId];
  }
};
