const sessions = new Map();

function setSession(userId, cookies) {
  sessions.set(String(userId), cookies);
}

function getSession(userId) {
  return sessions.get(String(userId));
}

function deleteSession(userId) {
  sessions.delete(String(userId));
}

module.exports = {
  setSession,
  getSession,
  deleteSession
};
