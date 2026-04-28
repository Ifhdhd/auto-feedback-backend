const sessions = {};

function setSession(userId, cookies) {
  sessions[userId] = cookies;
}

function getSession(userId) {
  return sessions[userId];
}

module.exports = { setSession, getSession };
