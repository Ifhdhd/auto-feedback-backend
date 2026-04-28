const store = new Map();

function setSession(userId, cookies) {
  store.set(userId, cookies);
}

function getSession(userId) {
  return store.get(userId);
}

module.exports = {
  setSession,
  getSession
};
