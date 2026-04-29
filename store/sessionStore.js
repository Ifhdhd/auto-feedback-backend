const sessions = new Map();

function setSession(userId, cookies){
  sessions.set(userId, cookies);
}

function getSession(userId){
  return sessions.get(userId);
}

module.exports = {
  setSession,
  getSession
};
