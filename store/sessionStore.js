const sessions = new Map();

function setSession(userId, cookies){
  sessions.set(userId, cookies);
}

function getSession(userId){
  return sessions.get(userId);
}

function deleteSession(userId){
  sessions.delete(userId);
}

module.exports = {
  setSession,
  getSession,
  deleteSession
};
